// Temporary browser-only integration test; never collects visitor-entered data.
const TEST_ENDPOINT = 'https://plugin-discovery-intake.padenspinks53.workers.dev/submit';
const testForm = document.querySelector('#intake-test-form');
const message = document.querySelector('#submission-status');
const submit = document.querySelector('#test-submit');
const challenge = document.querySelector('#turnstile-widget');
let challengeId = null;
window.onIntakeTestTurnstileReady = () => {
  if (!window.turnstile || !challenge) return;
  challengeId = window.turnstile.render('#turnstile-widget', {
    sitekey: challenge.dataset.sitekey,
    action: challenge.dataset.action
  });
  submit.disabled = false;
  message.textContent = 'Verification loaded. Submit once to check the private request pipeline.';
};
testForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!window.turnstile || challengeId === null) {
    message.textContent = 'Turnstile has not loaded yet.';
    return;
  }
  const token = window.turnstile.getResponse(challengeId);
  if (!token) {
    message.textContent = 'Complete the verification challenge first.';
    return;
  }
  // Fixed fake contact data. No local autofill, name, email, or text is collected.
  const request = {
    request_type: 'Other publisher question',
    plugin_name: 'Integration Test Only',
    contact_name: 'Synthetic Test',
    email: 'test@example.com',
    listing_url_or_id: '',
    request_details: 'Synthetic browser verification request only. Do not take any listing action.',
    turnstile_token: token,
    _honey: ''
  };
  submit.disabled = true;
  message.textContent = 'Testing private request delivery…';
  try {
    const response = await fetch(TEST_ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(request),
      referrerPolicy: 'no-referrer'
    });
    const result = await response.json().catch(() => null);
    if (response.status === 202 && typeof result?.case_id === 'string') {
      message.textContent = 'SUCCESS — case ID: ' + result.case_id +
        '. This synthetic request was accepted. Save the case ID for private D1 verification.';
    } else {
      const code = typeof result?.error === 'string' ? result.error : 'edge_or_non_json_response';
      message.textContent = 'NOT CONFIRMED — HTTP ' + response.status +
        ', ' + code + '. The request was not acknowledged.';
    }
  } catch {
    message.textContent = 'NOT CONFIRMED — browser could not reach the intake endpoint.';
  } finally {
    // Tokens expire and are single-use; always reset for a later genuine retry.
    window.turnstile?.reset(challengeId);
    submit.disabled = false;
  }
});
