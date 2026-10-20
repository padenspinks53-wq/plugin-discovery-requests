const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'intake-test-20261020.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'intake-test-20261020.js'), 'utf8');

test('isolated preview does not replace real form or solicit visitor data', () => {
  const main = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert(main.includes('formsubmit.co'));
  assert.match(html, /name="robots" content="noindex,nofollow,noarchive"/);
  assert.match(html, /data-sitekey="0x4AAAAAAFdTg-BJUAly3QgW"/);
  assert.match(html, /data-action="listing_request"/);
  assert.match(html, /api\.js\?render=explicit&amp;onload=onIntakeTestTurnstileReady/);
  assert(!html.includes('<input'));
  assert(!html.includes('name="email"'));
});

function harness(response) {
  let handler, widgetReset, sent, url, render;
  const message = {textContent: ''};
  const button = {disabled:true};
  const widget = {dataset:{sitekey:'0x4AAAAAAFdTg-BJUAly3QgW', action:'listing_request'}};
  const window = {turnstile:{
    render: (selector, props) => {render = {selector, props}; return 'test-widget-id';},
    getResponse: id => {assert.equal(id,'test-widget-id'); return 'temporary-browser-token';},
    reset: id => {widgetReset = id}
  }};
  const form = {addEventListener: (event, listener) => {
    assert.equal(event,'submit'); handler = listener
  }};
  vm.runInNewContext(js, {
    window,
    document: {querySelector: q => ({
      '#intake-test-form': form, '#submission-status': message,
      '#test-submit':button, '#turnstile-widget':widget
    })[q]},
    fetch: async (u, options) => {
      url = u;
      sent = JSON.parse(options.body);
      return response;
    }
  }, {filename:'intake-test-20261020.js'});
  window.onIntakeTestTurnstileReady();
  return {submit: () => handler({preventDefault(){}}), state: () => ({
    message:message.textContent, button:button.disabled, widgetReset, sent, url, render
  })};
}
test('real browser path sends only synthetic request and resets token', async () => {
  const browser = harness({status:202,json:async () => ({case_id:'simulated-id'})});
  await browser.submit();
  const s=browser.state();
  assert.equal(s.url,'https://plugin-discovery-intake.padenspinks53.workers.dev/submit');
  assert.equal(s.sent.turnstile_token,'temporary-browser-token');
  assert.equal(s.sent.email,'test@example.com');
  assert.equal(s.sent.plugin_name,'Integration Test Only');
  assert.deepEqual(Object.keys(s.sent).sort(), [
    '_honey','contact_name','email','listing_url_or_id','plugin_name',
    'request_details','request_type','turnstile_token'
  ].sort());
  assert.equal(s.widgetReset,'test-widget-id');
  assert.equal(s.button,false);
  assert.match(s.message,/SUCCESS.+simulated-id/);
  assert.equal(s.render.props.action,'listing_request');
});
test('error response is not falsely presented as accepted', async () => {
  const browser = harness({status:403,json:async () => ({error:'verification_failed'})});
  await browser.submit();
  assert.match(browser.state().message,/NOT CONFIRMED.+HTTP 403/);
  assert.equal(browser.state().widgetReset,'test-widget-id');
});
