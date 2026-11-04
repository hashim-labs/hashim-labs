# Portfolio studio and assistant

## Project management

The authenticated `/control-panel` now has Projects, Inquiries, Assistant & chats, and Account security workspaces. Projects support create/edit, private drafts, public publishing, archived recovery, permanent deletion of archived records, duplicate-as-draft, ordering, search, filtering, preview, and JSON export. Editors cover summaries, categories, technology, roles, capabilities, challenges, outcomes, covers, source/live URLs, artwork disclosure, and gallery visibility.

The catalog lives in PostgreSQL. Initial seed migrations run once and preserve later admin edits and deletions. Optimistic revisions reject stale updates. New homepage and case-study requests read the managed catalog, and the assistant reads published projects on each request. Changes do not require a deployment. Changing a slug changes its URL; previous URLs are not redirected.

Cover uploads accept JPEG/PNG/WebP up to 2 MB. Sharp strips metadata and optimizes a bounded image to WebP. Uploads persist in PostgreSQL rather than Vercel's ephemeral filesystem. Unpublished uploaded media require an admin session and use private/no-store responses; published media use short public caching.

## One contact, multiple questions

`lead_contacts` has a unique normalized email. Legacy inquiries are associated with that contact without deleting or rewriting their message text. New form inquiries and opted-in chatbot questions append to the contact's timeline with original timestamps. Immediate identical form retries are deduplicated; distinct questions remain separate. Existing inbox messages, names, and dates remain available. Contacts can be marked new, contacted, qualified, or closed.

The contact inbox combines inquiries and saved chatbot questions across sessions by email. Casual anonymous chat is not saved to the database. Visitors explicitly supply follow-up details and choose whether future chat questions/replies are saved. Contact-form fields are never sent to the AI provider.

## Groq assistant

The user's existing credential was recovered from AgentOS's encrypted shared-provider setting. It is held in ignored `.env.local` and the portfolio Vercel production environment as `GROQ_API_KEY`; no key is committed, returned to the panel, or bundled into client JavaScript. The verified account model is `openai/gpt-oss-20b`, configured through `GROQ_MODEL`.

Groq is the primary provider when configured. Requests use server-side Chat Completions, bounded history, JSON responses, low reasoning effort, and a timeout. Provider errors and malformed output fall back to verified public profile answers. The UI supports safe text formatting, verified project links, contextual suggestions, English/Urdu/Roman Urdu, copy, stop, retry, optional contact handoff, and bounded per-tab memory. API request limits are per running server instance, not a distributed quota.

References: [Groq text generation](https://console.groq.com/docs/text-chat), [Groq reasoning controls](https://console.groq.com/docs/reasoning).

## Additional working tools

- **Fallback Atlas** (`/labs/fallback-atlas`): editable service graph, cycle detection, outage cascades, explicit workaround activation, owner-led playbook, local persistence, JSON import/export and Markdown handoff.
- **ScopeLens** (`/labs/scope-lens`): before/after quantities, effort changes, must-keep constraints, exact optional-deliverable subset search within user-entered capacity, acceptance checks, JSON import/export and change brief.

Both are differentiated planning MVPs, not claimed as world-first inventions. Comparable categories were checked against [OutageLab](https://outagelab.com/docs/intro/) and [ScopeOrNope](https://www.scopeornope.com/tools/change-order-calculator). Fallback Atlas does not inject real faults. ScopeLens does not set prices, approve work, or produce a contract. All four portfolio tools use one neutral graphite/blue-grey theme, with semantic warning colours only.

## Verification

All four tools, the studio, and the assistant share a persistent light/dark preference. SweetAlert notifications and confirmations follow the active theme. Publishing, discarding changes, archiving/deleting, imports/resets/removals, new chats, inquiry submission, and inbox status changes have contextual confirmations. Cancel was verified in both themes without changing the workspace.

`node --test tests/*.test.mjs`, targeted ESLint, and `npm run build` cover the source changes. `_testing/studio.integration.mjs` exercises authenticated CRUD, stale-write protection, publication privacy, ordering, uploads, contact grouping and real Groq replies against a running local server; it removes only its own disposable verification records. `_testing/build_tool_covers.cjs` produces neutral WebP covers from the real app screenshots saved under `artifacts/`.
