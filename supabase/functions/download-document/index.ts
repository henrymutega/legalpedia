import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { documentId, sessionId } = await req.json();
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
      .select('id, file_path, is_free, price_cents, download_count')
      .eq('id', documentId)
      .maybeSingle();
    if (!doc) return json({ error: 'Not found' }, 404);
    if (!doc.file_path) return json({ error: 'File not available yet' }, 404);

    let authorized = false;

    if (doc.is_free || doc.price_cents === 0) {
      authorized = true;
    } else {
      // Verify by stripe session if provided
      if (sessionId) {
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (stripeKey) {
          const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
          try {
            const s = await stripe.checkout.sessions.retrieve(sessionId);
            if (s.payment_status === 'paid' && s.metadata?.user_id === user.id && s.metadata?.document_id === doc.id) {
              await admin
                .from('legal_doc_purchases')
                .update({ status: 'paid', stripe_payment_intent_id: s.payment_intent as string })
                .eq('stripe_session_id', sessionId);
              authorized = true;
            }
          } catch (e) {
            console.error('stripe retrieve failed', e);
          }
        }
      }
      if (!authorized) {
        const { data: paid } = await admin
          .from('legal_doc_purchases')
          .select('id')
          .eq('user_id', user.id)
          .eq('document_id', doc.id)
          .eq('status', 'paid')
          .limit(1)
          .maybeSingle();
        if (paid) authorized = true;
      }
    }

    if (!authorized) return json({ error: 'Purchase required' }, 403);

    const { data: signed, error: sErr } = await admin.storage
      .from('legal-documents')
      .createSignedUrl(doc.file_path, 120);
    if (sErr || !signed?.signedUrl) return json({ error: sErr?.message || 'Could not sign URL' }, 500);

    // Increment counter (best effort)
    await admin
      .from('legal_documents')
      .update({ download_count: (doc.download_count || 0) + 1 })
      .eq('id', doc.id);

    return json({ url: signed.signedUrl });
  } catch (e) {
    console.error('download-document error', e);
    return json({ error: (e as Error).message || 'Internal error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
