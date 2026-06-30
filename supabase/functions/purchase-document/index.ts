import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { documentId, returnUrl } = await req.json();
    if (!documentId) return json({ error: 'documentId required' }, 400);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Authentication required' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) return json({ error: 'Authentication required' }, 401);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data: doc } = await admin
      .from('legal_documents')
      .select('*')
      .eq('id', documentId)
      .eq('published', true)
      .maybeSingle();
    if (!doc) return json({ error: 'Document not found' }, 404);

    // Free doc → immediately record a purchase
    if (doc.is_free || doc.price_cents === 0) {
      await admin.from('legal_doc_purchases').insert({
        user_id: user.id,
        document_id: doc.id,
        status: 'paid',
        amount_cents: 0,
        currency: doc.currency,
        email: user.email,
      });
      return json({ free: true });
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return json({
        error: 'Payments are not configured yet. Please contact us to purchase this document.',
      }, 503);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Create a pending purchase row
    const { data: purchase, error: insErr } = await admin
      .from('legal_doc_purchases')
      .insert({
        user_id: user.id,
        document_id: doc.id,
        status: 'pending',
        amount_cents: doc.price_cents,
        currency: doc.currency,
        email: user.email,
      })
      .select()
      .single();
    if (insErr) throw insErr;

    const origin = req.headers.get('origin') || returnUrl || 'http://localhost:5173';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email || undefined,
      line_items: [{
        price_data: {
          currency: doc.currency,
          unit_amount: doc.price_cents,
          product_data: {
            name: doc.title,
            description: (doc.description || '').slice(0, 500) || undefined,
          },
        },
        quantity: 1,
      }],
      metadata: {
        document_id: doc.id,
        user_id: user.id,
        purchase_id: purchase.id,
      },
      success_url: `${origin}/legal-documents/${doc.id}?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/legal-documents/${doc.id}?purchase=cancelled`,
    });

    await admin
      .from('legal_doc_purchases')
      .update({ stripe_session_id: session.id })
      .eq('id', purchase.id);

    return json({ url: session.url });
  } catch (e) {
    console.error('purchase-document error', e);
    return json({ error: (e as Error).message || 'Internal error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
