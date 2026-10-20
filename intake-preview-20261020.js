// Temporary full-form preview. Original index.html remains on FormSubmit.
const ENDPOINT = 'https://plugin-discovery-intake.padenspinks53.workers.dev/submit';
const form = document.querySelector('#listing-request-form');
const status = document.querySelector('#submission-status');
const widget = document.querySelector('#turnstile-widget');
let widgetId = null;

// Called by Cloudflare Turnstile's explicit-render script after this file loads.
// Keep the widget ID so reset and getResponse always target this particular form.
window.onListingRequestTurnstileReady = () => {
  if (!widget || !window.turnstile) return;
  widgetId = window.turnstile.render('#turnstile-widget', {
    sitekey: widget.dataset.sitekey,
    action: widget.dataset.action
  });
};
function resetWidget() {
  if (widgetId !== null && window.turnstile) {
    window.turnstile.reset(widgetId);
  }
}

form?.addEventListener('submit', async event => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  if (!window.turnstile || widgetId === null) {
    status.textContent = 'Verification is still loading. Please try again shortly.';
    return;
  }
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData);
  // Siteverify must happen only in our Cloudflare Worker, not in the browser.
  payload.turnstile_token = window.turnstile.getResponse(widgetId) || '';
  delete payload['cf-turnstile-response'];
  if (!payload.turnstile_token) {
    status.textContent = 'Complete the verification challenge before submitting.';
    return;
  }
  submitButton.disabled = true;
  status.textContent = 'Submitting your request…';
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload), referrerPolicy: 'no-referrer'
    });
    const result = await response.json();
    if (response.status !== 202 || !result.case_id) {
      if (response.status === 429) {
        status.textContent = 'Too many recent submissions. Please try again later.';
      } else if (response.status === 403) {
        status.textContent = 'Verification was unsuccessful. Please retry the challenge.';
      } else {
        status.textContent = 'Your request was not received. Please try again later.';
      }
      return;
    }
    status.textContent = 'Request received. Case ID: ' + result.case_id
      + '. Save this number for follow-up. Changes require review.';
    form.reset();
  } catch {
    status.textContent = 'Request delivery failed. Please try again later.';
  } finally {
    resetWidget(); // Turnstile tokens expire and are single-use.
    submitButton.disabled = false;
  }
});
