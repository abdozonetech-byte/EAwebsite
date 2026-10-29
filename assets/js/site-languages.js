// Progressive enhancement: ordinary links still work without JavaScript.
(() => {
  const reset=()=>document.querySelectorAll('.ea-language-switch').forEach(nav=>{
    const current=nav.querySelector('[aria-current="page"]');
    if(current)nav.dataset.language=current.lang;
    nav.removeAttribute('aria-busy');
  });
  document.addEventListener('click',event=>{
    const link=event.target.closest('.ea-language-switch a[hreflang]');
    if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.getAttribute('aria-current')==='page')return;
    const target=new URL(link.href,window.location.href);
    if(target.origin!==window.location.origin)return;
    const nav=link.closest('.ea-language-switch');
    nav.dataset.language=link.lang;
    nav.setAttribute('aria-busy','true');
    // Do not intercept or delay navigation; retain browser history and new-tab behaviour.
  });
  window.addEventListener('pageshow',reset);
})();
