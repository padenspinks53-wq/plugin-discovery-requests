# Plugin Discovery — publisher listing requests

A small public static request form for publishers to report missing, incorrect, or unwanted listings in the independent Plugin Discovery catalog. It does **not** accept or store requests in GitHub. Responses are sent to `padenspinksspam@gmail.com` through [FormSubmit](https://formsubmit.co/), a third-party form processor.

**Published page (once GitHub Pages is enabled):**
https://padenspinks53-wq.github.io/plugin-discovery-requests/

## Form delivery activation

FormSubmit requires email ownership verification. A first test submission triggers an activation email to the destination mailbox. Follow the provider's verification link and submit another test. Do not claim delivery works until both the confirmation and subsequent message arrival are verified.

Form fields: request type, plugin name, official listing URL/ID, contact name/organization, contact email, and requested change. Built-in FormSubmit anti-spam protection is enabled by default, with an additional honeypot. Requests are sent with a recognizable `[Plugin Discovery]` subject.

This page links to the official ChatGPT marketplace but has no ability to change OpenAI's listings. No attachments or sensitive verification documents are requested.

## Operational review

See the private plugin catalog's `docs/OWNER_LISTING_REQUESTS.md`. A verified removal should be written to the *private* `plugin-catalog/opt-out@1` registry, and excluded from the combined OpenAI/MCPTop catalog. The request form does **not** automatically change catalog data.

## Privacy and third parties

FormSubmit receives and relays form data; its documentation states it retains submissions for 30 days. Emails are received in the operator's Gmail inbox, which may retain them longer. Avoid submitting credentials or identifying documents. The page's `privacy.html` informs submitters of these limitations.

## Verify

- Confirm GitHub Pages serves `index.html`, `privacy.html`, and `thanks.html`.
- Submit a test and confirm FormSubmit's activation email reaches Gmail.
- Activate using the provider's verification link.
- Submit a second test, verify receipt in the destination inbox, and check the subject.
- Only after these steps should a daily email-monitoring automation be activated.
