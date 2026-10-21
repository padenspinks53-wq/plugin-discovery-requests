import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {suggestionsApply,validSuggestions} from '../request-suggest.mjs';

test('suggestions appear only for existing listing changes, not missing listings',()=>{
  for(const type of ['Remove a listing','Correct listing information','Update developer description']){
    assert.equal(suggestionsApply(type),true,type);
  }
  for(const type of ['Suggest missing plugin','Other publisher question','']){
    assert.equal(suggestionsApply(type),false,type);
  }
});
test('only name, valid platform id and canonical source URL survive',()=>{
  const matches=validSuggestions({matches:[
    {name:'Notion',id:'Plugin_12345678',listing_url:'https://chatgpt.com/plugins/Plugin_12345678'},
    {name:'Tripadvisor',id:'plugin_asdk_app_123456789abc',listing_url:'https://chatgpt.com/plugins/plugin_asdk_app_123456789abc'},
    {name:'MCP Plugin',id:'plugins~Plugin_123456789abc',listing_url:'https://chatgpt.com/plugins/plugins~Plugin_123456789abc'},
    {name:'Malicious',id:'Plugin_01234567',listing_url:'https://attacker.example/phish'},
    {name:'No ID',id:'',listing_url:''},
  ]});
  assert.deepEqual(matches,[
    {name:'Notion',id:'Plugin_12345678',listing_url:'https://chatgpt.com/plugins/Plugin_12345678'},
    {name:'Tripadvisor',id:'plugin_asdk_app_123456789abc',listing_url:'https://chatgpt.com/plugins/plugin_asdk_app_123456789abc'},
    {name:'MCP Plugin',id:'plugins~Plugin_123456789abc',listing_url:'https://chatgpt.com/plugins/plugins~Plugin_123456789abc'}
  ]);
  assert.deepEqual(validSuggestions({matches:'nope'}),[]);
});
test('form includes optional accessible suggestions and existing private intake remains intact',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('../request-suggest.mjs',import.meta.url),'utf8');
  const base=readFileSync(new URL('../request.js',import.meta.url),'utf8');
  assert.match(html,/id="catalog-suggestions".*role="listbox"/);
  assert.match(html,/id="plugin_name".*role="combobox".*aria-autocomplete="list"/);
  assert.match(html,/type="module" src="request-suggest.mjs"/);
  assert.match(html,/data-action="listing_request"/);
  assert.match(base,/plugin-discovery-intake\.padenspinks53\.workers\.dev\/submit/);
  assert.match(js,/plugin-catalog\.padenspinks53\.workers\.dev\/suggest/);
  assert.match(js,/credentials:'omit'/);
  assert.match(js,/\.textContent=match\.name/);
  assert.match(js,/AbortController/);
  assert.match(js,/suggestions\.addEventListener\('keydown',focusSuggestion\)/);
  assert.match(js,/buttons\[e\.key==='ArrowDown' \? 0 : buttons\.length-1\]\.focus\(\)/);
  assert.match(js,/option\.setAttribute\('aria-selected','false'\)/);
  assert.match(js,/plugin\.value\.trim\(\)\.slice\(0,64\)!==text/);
  assert(!js.includes('innerHTML'));
  assert(!html.includes('formsubmit.co'));
});
