const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'request.js'), 'utf8');

test('preview uses the existing public sitekey and action', () => {
  assert.match(html, /data-sitekey="0x4AAAAAAFdTg-BJUAly3QgW"/);
  assert.match(html, /data-action="listing_request"/);
  assert.match(html, /api\.js\?render=explicit&amp;onload=onListingRequestTurnstileReady/);
  assert(html.indexOf('src="request.js"') < html.indexOf('api.js?render=explicit'));
  assert(!html.includes('padenspinksspam@gmail.com'));
  assert(!html.includes('formsubmit.co'));
  assert(html.includes('href="privacy.html"'));
  assert(html.includes('src="request.js"'));
  assert(!html.includes('privacy.next.html'));
  assert(!html.includes('request.next.js'));
  assert(!html.includes('padenspinksspam@gmail.com'));
});
test('explicit widget token is sent and reset after submission', async () => {
  let handler, render = null, reset = null, payload = null;
  const status = {textContent: ''};
  const button = {disabled: false};
  const form = {querySelector: () => button,
    addEventListener: (name, cb) => {if (name === 'submit') handler = cb},
    reset: () => {}};
  const widget = {dataset: {sitekey: '0x4AAAAAAFdTg-BJUAly3QgW', action: 'listing_request'}};
  const window = {turnstile: {
    render: (selector, opts) => {render = {selector, opts}; return 'widget-1';},
    getResponse: id => {assert.equal(id, 'widget-1'); return 'single-use-token';},
    reset: id => {reset = id}
  }};
  vm.runInNewContext(js, {
    window,
    document: {querySelector: selector => ({
      '#listing-request-form': form,
      '#submission-status': status,
      '#turnstile-widget': widget
    })[selector]},
    FormData: class {[Symbol.iterator]() {return [
      ['plugin_name','Sample Plugin'], ['request_type','Suggest missing plugin'],
      ['email','publisher@example.test'], ['contact_name','Sample'],
      ['request_details','Test request details'], ['_honey','']
    ][Symbol.iterator]()}},
    fetch: async (url, opts) => {
      assert.equal(url, 'https://plugin-discovery-intake.padenspinks53.workers.dev/submit');
      payload = JSON.parse(opts.body);
      return {status: 202, json: async () => ({case_id:'test-case-id'})};
    }
  }, {filename:'request.js'});
  window.onListingRequestTurnstileReady();
  assert.equal(render.selector,'#turnstile-widget');
  assert.equal(render.opts.action,'listing_request');
  await handler({preventDefault() {}});
  assert.equal(payload.turnstile_token,'single-use-token');
  assert.equal(reset,'widget-1');
  assert.equal(button.disabled,false);
  assert.match(status.textContent,/test-case-id/);
});
