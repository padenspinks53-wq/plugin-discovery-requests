// Staged replacement form: not included by the deployed index.html.
// Fill the verified HTTPS Worker URL before activating and removing the legacy form.
const ENDPOINT = 'REPLACE_WITH_CONFIRMED_HTTPS_WORKER_SUBMIT_URL';
const form = document.querySelector('#listing-request-form');
const status = document.querySelector('#submission-status');
form?.addEventListener('submit', async event => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  if (!ENDPOINT.startsWith('https://') || ENDPOINT.includes('REPLACE_')) {
    status.textContent = 'This preview is not configured. Please use the existing published form.';
    return;
  }
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData);
  payload.turnstile_token = String(formData.get('cf-turnstile-response') || '');
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
      window.turnstile?.reset();
      return;
    }
    status.textContent = 'Request received. Case ID: ' + result.case_id
      + '. Save this number for follow-up. Changes require review.';
    form.reset();
    window.turnstile?.reset();
  } catch {
    status.textContent = 'Request delivery failed. Please try again later.';
    window.turnstile?.reset();
  } finally {
    submitButton.disabled = false;
  }
});
