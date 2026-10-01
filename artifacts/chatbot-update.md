# Hashim AI update

The assistant uses public CV facts and portfolio project data. It speaks casually in first person, with a clear AI identity. Internal notes, unsupported client counts, and outdated CV claims were removed from the public knowledge file.

- Typo matching handles transpositions, missing letters, common shorthand, and Roman Urdu aliases.
- Ten recent turns support project follow-ups; unrelated topics reset project context.
- Multi-part questions can cover skills, experience, education, contact, and CVs.
- Optional contact details stay out of the model prompt; only relevant inquiries with submitted details are stored for follow-up.
- Session memory, New chat, accessible dialog focus, Escape, mobile layout, automatic message scrolling, bounded history, model timeout, and local fallback are included.
- Rate limiting is per server instance; multiple production instances would need a shared limiter.

## Validation

`node --test tests/profile-bot.test.mjs` — 11 tests pass, covering typos, context, multi-part questions, unknown details, provider errors, and contact data isolation.

Production build and changed-file ESLint checks pass. Desktop and 390px mobile checks confirm project follow-ups, Roman Urdu replies, no mandatory contact form, and no mobile overflow.

## Live AI provider

The configured Gemini service responded HTTP 403 to an authorized connectivity test. Local answers work, but open-ended AI generation cannot be verified with this key. Replace GEMINI_API_KEY through your environment/hosting settings with a working key and restart/redeploy. Never paste the key into chat or commit it. GEMINI_MODEL remains configurable.

Request format checked against the official API reference: https://ai.google.dev/api/generate-content

The model is instructed to treat history as conversation context, not as a source of new personal facts. This reduces invention but does not make a generative model infallible; personal quotes and commitments still require Hashim.
