import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANG_MAP: Record<string, string> = {
  en: "English",
  zh: "Chinese (Simplified)",
  mn: "Mongolian",
};

interface UserContext {
  name?: string;
  email?: string;
}

function buildSystemPrompt(lang: string, userContext?: UserContext): string {
  const langName = LANG_MAP[lang] || "English";
  const userInfo = userContext?.name
    ? `\nUSER CONTEXT: The user's name is "${userContext.name}". Address them by name occasionally to personalize the conversation.`
    : "";

  return `You are LegalPedia's AI Legal Assistant — a professional, empathetic, and concise legal information guide.

LANGUAGE: Respond ENTIRELY in ${langName}.${userInfo}

RESPONSE FORMAT:
- Lead with a direct answer (1–2 sentences)
- Add a brief explanation if needed (short paragraph or 2–3 bullet points)
- End with a suggested next step or follow-up question
- Keep responses under 150 words unless the topic requires more detail
- Use markdown: **bold** for emphasis, bullet points for lists

ANTI-HALLUCINATION RULES (CRITICAL):
- NEVER invent laws, case names, statutes, or legal precedents
- NEVER fabricate specific legal procedures or deadlines
- If you are unsure or lack sufficient information, explicitly say: "I don't have enough information to answer that accurately. Could you provide more details?"
- Prefer safe, general explanations over specific claims you cannot verify
- When referencing legal concepts, use phrases like "generally," "typically," or "in most jurisdictions"

BEHAVIOR:
- Maintain conversation context — reference what the user already told you
- Detect user intent early and guide them to the right service
- If the user describes a legal issue, suggest the most relevant service and encourage a consultation
- Ask clarifying follow-up questions when the issue is ambiguous (e.g. "Is this related to personal or business law?")
- NEVER give dead-end responses — always provide a next step or question

LEGAL SAFETY:
- NEVER give definitive legal advice or judgments
- Always recommend consulting a qualified attorney for serious matters
- End responses involving legal topics with: "⚖️ This is general legal information, not official legal advice." (in ${langName})

CONVERSION:
- Naturally suggest relevant LegalPedia services when appropriate
- When the user seems ready to engage (after 2+ substantive exchanges), ask for their name and email to connect them with an attorney
- When you detect the user has provided their name AND email, append this hidden tag at the END of your message:
  <LEAD>{"name":"Their Name","email":"their@email.com","message":"Brief summary of inquiry"}</LEAD>

AVAILABLE SERVICES: Corporate Law, Civil Litigation, Intellectual Property, Real Estate Law, Family Law, Employment Law.
WEBSITE: Services (/services), Publications (/publications), Contact (/contact), About (/about).`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const messages = body?.messages;
    const language = body?.language;
    const userContext = body?.userContext as UserContext | undefined;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lang = typeof language === "string" ? language.slice(0, 2) : "en";
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: buildSystemPrompt(lang, userContext) },
            ...messages.slice(-8),
          ],
          stream: true,
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
