# Plugin Discovery — publisher listing requests

Public page: https://padenspinks53-wq.github.io/plugin-discovery-requests/

The public form is a request channel for corrections, missing listings, description updates, removals and publisher questions about **Plugin Discovery**, an independent third-party catalog. It cannot alter OpenAI's official marketplace.

## How new submissions work

- Public page: GitHub Pages `index.html`, with `request.js` and `privacy.html`.
- Abuse protection: Cloudflare Turnstile; its response is verified server-side for the approved GitHub Pages hostname and `listing_request` action.
- Private request storage: standalone Cloudflare Worker `plugin-discovery-intake` and **separate** Cloudflare D1 database `plugin-discovery-intake`.
- The page shows a case ID only after the Worker accepts the request and stores it in D1. No request changes the catalog automatically.
- A gated hourly GitHub Actions workflow inside the **private** `padenspinks53-wq/plugin-catalog` repository reads only the case ID, category and receipt time from D1. It creates a private, owner-assigned issue for each new case; request content is not placed in Issues or Actions logs.
- Operator review: see `plugin-catalog/intake/OPERATOR_REVIEW.md` in the private repository. Check publisher authority before sensitive changes. Close/resolve the private issue after reviewing the D1 record.
- The Worker has a scheduled 90-day request deletion policy. Reviewers must account for this retention window.
- Private notifications depend on GitHub Actions and owner notification settings; check private Issues regularly.

## Historical submissions

The older FormSubmit → Gmail route was replaced. FormSubmit submissions made before the change **are not migrated into D1**, and still need review in the old mailbox. The static `thanks.html` page is a legacy backward-compatibility page and is no longer a submission result.

## Optional catalog-name autocomplete (staged, NOT LIVE)

Draft work adds a typeahead list for requests about **existing Plugin Discovery listings** (removals, corrections, description changes). It queries only the Plugin Discovery catalog's own /suggest endpoint, never external providers. Selecting a match fills exact name and the canonical listing URL. Submissions remain possible without matching or without network service, and requests to add missing plugins remain free text. This frontend feature must not go live before private catalog data meets its release approval gate and the catalog endpoint is enabled by explicit owner review. See private catalog PR #36.

## Validation and security

- Live iPhone synthetic integration case: `2eb025ac-a5a1-46e2-b112-f18b489c7ec9`
- Live iPhone complete-form test case: `4407a0c7-7d8b-4881-ba1e-5493661865e5`
- Both receipts independently confirmed in isolated D1 via restricted GitHub Actions metadata queries.
- Private notifier D1/Issues integration verified with these two synthetic cases; neither is a real listing request.
- Never store Cloudflare admin tokens, raw contact data, or publisher-submitted text in this public repository.

The form may be rolled back to an earlier GitHub Pages commit in an outage, but restoring FormSubmit would also require ensuring the legacy provider is still accepting and delivering messages.
