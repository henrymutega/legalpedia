import { supabase } from '@/integrations/supabase/client';

export function cleanContent(content: string): string {
  return content.replace(/<LEAD>.*?<\/LEAD>/gs, '').trim();
}

export async function extractAndSaveLead(content: string) {
  const match = content.match(/<LEAD>(.*?)<\/LEAD>/s);
  if (!match) return;
  try {
    const lead = JSON.parse(match[1]);
    if (lead.name && lead.email) {
      await supabase.from('leads').insert({
        name: lead.name,
        email: lead.email,
        message: lead.message || null,
      });
    }
  } catch { /* silently fail */ }
}

export async function trackChatAnalytics(
  query: string,
  responseLength: number,
  success: boolean,
  language: string,
  userId?: string
) {
  try {
    await supabase.from('chat_analytics').insert({
      query: query.slice(0, 500),
      response_length: responseLength,
      success,
      language,
      user_id: userId || null,
    });
  } catch { /* non-critical */ }
}

export function getGreeting(lang: string, name?: string | null): string {
  const greetings: Record<string, string> = {
    en: name
      ? `Hello ${name}! I'm the LegalPedia AI Legal Assistant. How can I help you today?\n\n⚖️ *I provide general legal information — for official advice, please consult one of our attorneys.*`
      : "Hello! I'm the LegalPedia AI Legal Assistant. How can I help you with your legal needs today?\n\n⚖️ *I provide general legal information — for official advice, please consult one of our attorneys.*",
    zh: name
      ? `您好 ${name}！我是 LegalPedia AI 法律助手。今天我可以如何帮助您？\n\n⚖️ *我提供一般法律信息——如需正式法律建议，请咨询我们的律师。*`
      : "您好！我是 LegalPedia AI 法律助手。今天我可以如何帮助您的法律需求？\n\n⚖️ *我提供一般法律信息——如需正式法律建议，请咨询我们的律师。*",
    mn: name
      ? `Сайн байна уу ${name}! Би LegalPedia AI Хууль зүйн туслах. Өнөөдөр танд хэрхэн туслах вэ?\n\n⚖️ *Би ерөнхий хууль зүйн мэдээлэл өгдөг — албан ёсны зөвлөгөө авахыг хүсвэл манай хуульчидтай зөвлөлдөнө үү.*`
      : "Сайн байна уу! Би LegalPedia AI Хууль зүйн туслах. Өнөөдөр таны хууль зүйн хэрэгцээнд хэрхэн туслах вэ?\n\n⚖️ *Би ерөнхий хууль зүйн мэдээлэл өгдөг — албан ёсны зөвлөгөө авахыг хүсвэл манай хуульчидтай зөвлөлдөнө үү.*",
  };
  return greetings[lang] || greetings.en;
}
