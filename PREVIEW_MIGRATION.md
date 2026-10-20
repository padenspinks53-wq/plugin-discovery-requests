# Replacement form preview — NOT LIVE

This branch adds **staged** files `index.next.html`, `request.next.js`, and
`privacy.next.html` for the new Cloudflare-hosted Plugin Discovery intake.
They are **not** the active `index.html`, and the existing FormSubmit → Gmail
route must remain functional until the new backend is verified.

## Activation gates
1. Approve/deploy independent Cloudflare Worker + D1 intake from private
   `padenspinks53-wq/plugin-catalog/intake`.
2. Configure a verified Turnstile site key and server-side Turnstile secret.
3. Replace preview placeholders in `index.next.html` and `request.next.js`
   with the actual public Turnstile key and tested HTTPS Worker `/submit` URL.
4. Test valid and invalid requests end-to-end; read cases using the protected
   operator route. Test deletion and anti-spam. Make sure the requester's
   email does not appear in public query logs or plugin search results.
5. Establish **private owner alerts/queue monitoring** before migration.
   ChatGPT's existing scheduled Gmail checker cannot see entries stored only
   in D1; keeping that checker alone would miss new submissions.
6. Only after verification, copy the preview files to the deployed paths
   `index.html`, `request.js`, `privacy.html`, adjusting script and links.
   Update GitHub Pages, document the new processor in privacy disclosures,
   confirm HTTP 200 and a second real email/contact test. Retire FormSubmit
   only after confirmations.

No public deploy, email change, or paid domain purchase is made by this branch.
