# Portfolio Build Lab

The project sphere adapts [OriginKit Sphere Gallery 3D](https://www.originkit.dev/components/sphere-gallery-3d?preset=base) for the existing purple/cyan portfolio. Image clicks use Next.js navigation to case studies. All projects also have keyboard-accessible links and a list view; reduced-motion preferences default to that list. WebGL unavailability falls back to the list. Ordinary wheel scrolling remains page scrolling; Ctrl/Command + wheel zooms the sphere.

## Working MVPs

- `/labs/trace-lab`: local recursive JSON snapshot comparison, potential breaking-change flags, filters, validation feedback, and JSON report download. Arrays compare by index. This is not schema validation.
- `/labs/flow-lab`: editable sequential workflow, up to 12 reorderable steps, numeric/text conditions, string field assignments, notification previews, execution trace, and workflow export. No external messages or API calls are made.

Kha Mart links to its existing live storefront at https://kha-mart.vercel.app/. Kha Mart, TraceLab, and FlowLab covers use actual live-site screenshots in branded browser frames. Other newly generated covers are explicitly marked as concept artwork.

## Deployment

These MVPs share the existing Next.js portfolio repository and Vercel project `hashim-dev`; they require no new secrets, databases, or paid APIs. Pushes to the connected production branch deploy the portfolio and both tools together.

Validation: `node --test tests/build-labs.test.mjs tests/profile-bot.test.mjs`, targeted ESLint with `--ext .jsx`, and `npm run build`. Browser checks cover sphere tile navigation, JSON validation, workflow pass/stop behavior, and responsive layout.
