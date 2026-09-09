import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const profileBotName = 'Hashim AI';
let profilePromise;

async function loadProfile() {
  if (!profilePromise) {
    profilePromise = readFile(join(process.cwd(), 'public', 'cv', 'hashim_profile.json'), 'utf8')
      .then((content) => JSON.parse(content))
      .catch((error) => {
        profilePromise = undefined;
        throw error;
      });
  }
  return profilePromise;
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9@.\s]/g, ' ');
}

function isSeriousInquiry(question, visitor) {
  const text = normalize(`${question} ${visitor?.goal || ''}`);
  return ['hire', 'hiring', 'freelance', 'freelancer', 'build', 'develop', 'website', 'application', 'app', 'software', 'project', 'collaborate', 'collaboration', 'quote', 'budget', 'work with', 'service', 'consultation'].some((term) => text.includes(term));
}

export function getProfileLinks(question) {
  const normalized = normalize(question);
  const links = [];
  if (normalized.includes('leadmate')) links.push({ label: 'Open Leadmate project', href: '#project-leadmate-ai-sales-assistant' });
  if (normalized.includes('agentos') || normalized.includes('agent os')) links.push({ label: 'Open AgentOS project', href: '#project-agentos' });
  if (normalized.includes('project') || normalized.includes('portfolio') || normalized.includes('work')) links.push({ label: 'View all projects', href: '#projects' });
  if (normalized.includes('experience') || normalized.includes('education') || normalized.includes('skill') || normalized.includes('about')) links.push({ label: 'View profile details', href: '#about' });
  if (normalized.includes('contact') || normalized.includes('hire') || normalized.includes('email') || normalized.includes('reach')) links.push({ label: 'Contact Hashim', href: '#contact' });
  return links;
}

export function answerChatStarter(question) {
  const normalized = normalize(question).trim();
  if (/^(hi|hello|hey|hy|yo|good morning|good afternoon|good evening)[!. ,]*$/i.test(normalized)) {
    return 'Hi! I’m Hashim AI. I can tell you about Hashim’s experience, skills, projects, or how to work with him.';
  }
  if (normalized.includes('how are you') || normalized.includes('how is it going')) {
    return 'I’m ready to help. Ask me about Hashim’s work, or share what you are looking to build.';
  }
  if (normalized === 'thanks' || normalized === 'thank you' || normalized === 'thx') {
    return 'You’re welcome. I’m here whenever you need more details about Hashim.';
  }
  return null;
}

function extractGeminiJson(text) {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}

export async function answerWithGemini(question, visitor) {
  const profile = await loadProfile();
  const apiKey = process.env.GEMINI_API_KEY;
  const fallbackAnswer = (await answerProfileQuestion(question)) || 'I can answer questions about Hashim\'s verified profile, skills, projects, and experience. Add your project details above if you would like Hashim to follow up.';
  if (fallbackAnswer !== 'I can answer questions about Hashim\'s verified profile, skills, projects, and experience. Add your project details above if you would like Hashim to follow up.') {
    return { answer: fallbackAnswer, isGenuineLead: isSeriousInquiry(question, visitor), needsReview: false, usedGemini: false };
  }
  if (!apiKey) return { answer: fallbackAnswer, isGenuineLead: false, needsReview: false, usedGemini: false };

  const prompt = `You are Hashim AI, a professional portfolio assistant. Answer only from the supplied profile JSON. Never invent facts, private data, prices, availability, or guarantees. Be concise and useful. The visitor has provided verified contact details and a project goal. Classify whether this is a genuine project, hiring, collaboration, or serious professional inquiry. Greetings and casual conversation are not genuine leads.

Return ONLY valid JSON with this shape: {"answer":"string","isGenuineLead":true|false,"needsReview":true|false}

Visitor: ${JSON.stringify(visitor)}
Question: ${question}
Profile JSON: ${JSON.stringify(profile)}`;
  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 350, responseMimeType: 'application/json' } }),
    });
    if (!response.ok) {
      console.error('Gemini provider returned status:', response.status);
      return { answer: fallbackAnswer, isGenuineLead: false, needsReview: false, usedGemini: false };
    }
    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
    const result = extractGeminiJson(text);
    if (!result?.answer) {
      console.error('Gemini provider returned an invalid response.');
      return { answer: fallbackAnswer, isGenuineLead: false, needsReview: false, usedGemini: false };
    }
    return { answer: String(result.answer).slice(0, 3000), isGenuineLead: result.isGenuineLead === true, needsReview: result.needsReview === true, usedGemini: true };
  } catch (error) {
    console.error('Gemini request failed:', error.message);
    return { answer: fallbackAnswer, isGenuineLead: false, needsReview: false, usedGemini: false };
  }
}

export async function answerProfileQuestion(question) {
  const profile = await loadProfile();
  const normalized = normalize(question);
  const faq = profile.faq_style_answers || {};
  const faqMatches = [
    { keys: ['who are you', 'who is hashim', 'your name', 'introduce'], answer: faq.who_is_hashim },
    { keys: ['specialize', 'skills', 'tech stack', 'technologies', 'technology'], answer: faq.what_does_he_specialize_in },
    { keys: ['where do you work', 'where does he work', 'experience', 'company'], answer: faq.where_does_he_work },
    { keys: ['study', 'studying', 'education', 'degree'], answer: faq.what_is_he_studying },
    { keys: ['main project', 'best project', 'featured project', 'khairagri'], answer: faq.main_project },
  ];
  const faqMatch = faqMatches.find(({ keys, answer }) => answer && keys.some((key) => normalized.includes(key)));
  if (faqMatch) return faqMatch.answer;
  if (normalized.includes('full name') || normalized.includes('real name')) return `Hashim's full name is ${profile.personal_info.full_name}.`;
  if (normalized.includes('title') || normalized.includes('job title') || normalized.includes('profession')) return `Hashim is a ${profile.personal_info.title}.`;
  if (normalized.includes('phone') || normalized.includes('number')) return `Hashim can be reached by phone at ${profile.personal_info.phone}.`;
  if (normalized.includes('leadmate')) return profile.projects.find((project) => project.name === 'Leadmate')?.description || null;
  if (normalized.includes('agentos') || normalized.includes('agent os')) return profile.projects.find((project) => project.name === 'AgentOS')?.description || null;
  const namedProject = profile.projects.find((project) => normalize(project.name).split(' ').some((word) => word.length > 3 && normalized.includes(word)));
  if (namedProject) {
    const tech = namedProject.tech_stack?.length ? ` Technology includes ${namedProject.tech_stack.join(', ')}.` : '';
    return `${namedProject.name}: ${namedProject.description || 'A software project developed by Hashim.'}${tech}`;
  }
  if (normalized.includes('github') || normalized.includes('code')) return `Hashim's GitHub profile is ${profile.personal_info.social_links.github}.`;
  if (normalized.includes('linkedin')) return `Hashim's LinkedIn profile is ${profile.personal_info.social_links.linkedin}.`;
  if (normalized.includes('facebook')) return `Hashim's Facebook profile is ${profile.personal_info.social_links.facebook}.`;
  if (normalized.includes('portfolio link') || normalized.includes('website link') || normalized.includes('website')) return `Hashim's portfolio is ${profile.personal_info.social_links.portfolio}.`;
  if (normalized.includes('contact') || normalized.includes('hire') || normalized.includes('email') || normalized.includes('reach')) return `You can reach Hashim at ${profile.personal_info.email} or use the contact form on this portfolio.`;
  if (normalized.includes('project') || normalized.includes('portfolio') || normalized.includes('work') || normalized.includes('built')) return `Hashim's projects include ${profile.projects.map((project) => project.name).join(', ')}.`;
  if (normalized.includes('responsibilit') || normalized.includes('role') || normalized.includes('job')) {
    const experience = profile.work_experience.map((item) => `${item.title} at ${item.company} (${item.duration})`).join('; ');
    return `Hashim's professional experience includes ${experience}.`;
  }
  if (normalized.includes('certif') || normalized.includes('course')) return `Hashim's certifications include ${profile.certifications.join(', ')}.`;
  if (normalized.includes('school') || normalized.includes('university') || normalized.includes('degree') || normalized.includes('education')) return `Hashim studied ${profile.education.map((item) => `${item.degree} at ${item.institution} (${item.duration})`).join('; ')}.`;
  if (normalized.includes('backend') || normalized.includes('frontend') || normalized.includes('devops') || normalized.includes('database') || normalized.includes('framework')) return `Hashim's technical skills include ${Object.values(profile.technical_skills).flat().join(', ')}.`;
  if (normalized.includes('service') || normalized.includes('offer') || normalized.includes('help') || normalized.includes('can you build')) return 'Hashim can help with full-stack web applications, mobile apps, AI agents, API integrations, dashboards, authentication systems, DevOps deployments, and ecommerce products. Share your requirements and he can discuss the right approach.';
  if (normalized.includes('available') || normalized.includes('availability') || normalized.includes('freelance')) return 'For availability and project fit, share your name, email, timeline, and requirements through the contact form so Hashim can respond personally.';
  if (normalized.includes('location') || normalized.includes('where are you')) return `Hashim is based in ${profile.personal_info.location}.`;
  if (normalized.includes('language')) return `Hashim speaks ${profile.personal_info.languages.join(', ')}.`;
  return null;
}
