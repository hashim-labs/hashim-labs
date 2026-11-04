import { answerProfileAssistant } from '../src/lib/profile-bot.js';
import { getDb } from '../src/lib/db.js';
const started = Date.now();
const result = await answerProfileAssistant('Which of your projects could help a small grocery store, and what could you build next?');
console.log(JSON.stringify({provider:result.provider,degraded:result.degraded,durationMs:Date.now()-started,answer:result.answer,relatedProjects:result.relatedProjects},null,2));
await getDb().end();
process.exitCode = result.provider === 'groq' ? 0 : 1;
