# Replacement form preview — NOT LIVE

This branch adds **staged** files `index.next.html`, `request.next.js`, and
`privacy.next.html` for the new Cloudflare-hosted Plugin Discovery intake.
They are **not** the active `index.html`, and the existing FormSubmit → Gmail
route must remain functional until the new backend is verified.

## Activation gates
1. Approve/deploy independent Cloudflare Worker + D1 intake from private
   `padenspinks53-wq/plugin-catalog/intake`.
2. The existing user-created Turnstile widget site key
   `0x4AAAAAAFdTg-BJUAly3QgW` and HTTPS intake Worker `/submit` URL
   are now wired into `index.next.html` and `request.next.js`.
   The explicit widget action is `listing_request`, which the Worker must
   verify along with hostname `padenspinks53-wq.github.io`.
   Confirm the widget's permitted hostname in Cloudflare; local and
   production hostnames must not be accepted interchangeably.
3. Have the account owner place **only the secret key** into the private
   GitHub Actions secret `INTAKE_TURNSTILE_SECRET` (never commit or paste
   it into chat); the prepared `intake_deploy` workflow installs that
   secret into the isolated Worker as `TURNSTILE_SECRET`. The distinct
   private `INTAKE_ADMIN_TOKEN` and `INTAKE_RATE_HASH_SECRET` must also
   be configured before running that workflow. No protected request can
   be verified while these three secrets are absent.
4. Test valid and invalid requests end-to-end using a **fresh real**
   Turnstile token, verify that replaying it fails, and read cases using the protected
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
