// Autocomplete is intentionally sourced ONLY from Plugin Discovery's own
// active catalog generation, not from third-party search services.
// The catalog Worker keeps /suggest disabled until public reuse is approved.
const endpoint = 'https://plugin-catalog.padenspinks53.workers.dev/suggest';
export const existingListingTypes = Object.freeze([
  'Remove a listing',
  'Correct listing information',
  'Update developer description'
]);
export function suggestionsApply(type) {
  return existingListingTypes.includes(type);
}
export function validSuggestions(payload) {
  if (!payload || !Array.isArray(payload.matches)) return [];
  return payload.matches.slice(0,8).filter(item =>
    item && typeof item.name === 'string' && item.name.length > 0 &&
    item.name.length <= 200 &&
    typeof item.id === 'string' && /^Plugin_[A-Za-z0-9_]{6,120}$/.test(item.id) &&
    item.listing_url === 'https://chatgpt.com/plugins/' + item.id
  );
}

if (typeof document !== 'undefined') {
  const form = document.querySelector('#listing-request-form');
  const kind = form?.querySelector('#request_type');
  const plugin = form?.querySelector('#plugin_name');
  const reference = form?.querySelector('#listing_url');
  const suggestions = document.querySelector('#catalog-suggestions');
  const hint = document.querySelector('#catalog-suggestion-hint');
  let timer=null, controller=null, requestId=0, selectedUrl=null;

  function reset(autoOnly=true) {
    requestId++;
    if (timer) clearTimeout(timer);
    timer=null;
    controller?.abort();
    controller=null;
    if (suggestions) {
      suggestions.replaceChildren();
      suggestions.hidden=true;
      plugin?.setAttribute('aria-expanded','false');
    }
    if (!autoOnly && selectedUrl && reference?.value === selectedUrl) reference.value='';
    selectedUrl=null;
  }
  function draw(items) {
    suggestions.replaceChildren();
    suggestions.hidden = items.length === 0;
    plugin.setAttribute('aria-expanded',String(items.length > 0));
    for (const match of items) {
      const option=document.createElement('button');
      option.type='button';
      option.className='catalog-suggestion';
      option.setAttribute('role','option');
      option.textContent=match.name;
      option.title='Select this existing Plugin Discovery listing';
      option.addEventListener('click',()=>{
        plugin.value=match.name;
        reference.value=match.listing_url;
        selectedUrl=match.listing_url;
        reset(true);
        selectedUrl=match.listing_url;
        hint.textContent='Selected an existing listing. Its official listing URL was filled in automatically.';
        plugin.focus();
      });
      suggestions.appendChild(option);
    }
  }
  async function lookUp(text) {
    controller=new AbortController();
    const current=++requestId;
    try {
      const res=await fetch(endpoint + '?q=' + encodeURIComponent(text),{
        method:'GET',signal:controller.signal,mode:'cors',credentials:'omit',
        referrerPolicy:'no-referrer'
      });
      if (!res.ok) throw new Error('suggestions_not_ready');
      const matches=validSuggestions(await res.json());
      if (current!==requestId || !suggestionsApply(kind.value) || plugin.value.trim()!==text) return;
      draw(matches);
      hint.textContent=matches.length
        ? 'Select an existing listing or continue typing a name manually.'
        : 'No matching listing found. You can still type its name manually.';
    } catch(e) {
      if (current!==requestId || e?.name==='AbortError') return;
      draw([]);
      hint.textContent='Catalog suggestions are unavailable. You can still enter a plugin name and listing URL manually.';
    }
  }
  function updateMode() {
    reset(false);
    if (!suggestions || !hint || !plugin || !kind || !reference) return;
    const enabled=suggestionsApply(kind.value);
    hint.hidden=!enabled;
    if (enabled) {
      hint.textContent='Type at least 2 characters to look up an existing Plugin Discovery listing. Selection is optional.';
      if (plugin.value.trim().length>=2) handleTyping();
    }
  }
  function handleTyping() {
    if (selectedUrl && reference?.value === selectedUrl) reference.value='';
    reset(true);
    if (!suggestionsApply(kind.value)) return;
    const q=plugin.value.trim().slice(0,64);
    if (q.length<2) {
      hint.textContent='Type at least 2 characters to search listed plugins.';
      return;
    }
    timer=setTimeout(()=>lookUp(q),280);
  }
  if (form && kind && plugin && reference && suggestions && hint) {
    kind.addEventListener('change',updateMode);
    plugin.addEventListener('input',handleTyping);
    plugin.addEventListener('keydown',e=>{
      if (e.key==='Escape') {reset(true);plugin.setAttribute('aria-expanded','false');}
    });
    form.addEventListener('reset',()=>queueMicrotask(updateMode));
    updateMode();
  }
}
