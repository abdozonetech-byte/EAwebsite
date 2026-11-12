// Progressive enhancement: cards and links are present in the HTML.
(() => {
 const grid=document.querySelector('[data-insights-grid]');
 const filters=document.querySelector('[data-insights-filters]');
 const count=document.querySelector('[data-insights-count]');
 if(!grid||!filters)return;
 const cards=[...grid.querySelectorAll('[data-category]')];
 const categories=['Tous',...new Set(cards.map(card=>card.dataset.category))];
 filters.replaceChildren(...categories.map(category=>{
  const button=document.createElement('button');
  button.type='button';button.textContent=category;
  button.className='ea-insight-filter'+(category==='Tous'?' is-active':'');
  button.setAttribute('aria-pressed',String(category==='Tous'));
  button.addEventListener('click',()=>{
   for(const item of cards)item.hidden=category!=='Tous'&&item.dataset.category!==category;
   for(const item of filters.querySelectorAll('button')){const selected=item===button;item.classList.toggle('is-active',selected);item.setAttribute('aria-pressed',String(selected));}
   const total=cards.filter(card=>!card.hidden).length;
   if(count)count.textContent=`${total} ${total===1?'guide affiché':'guides affichés'}`;
  });return button;
 }));
})();
