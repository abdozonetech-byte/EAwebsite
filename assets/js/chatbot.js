(function(){'use strict';

// Simple embeddable chatbot for Namaa Talk
if (typeof window === 'undefined') return;

const API_TALK = '/api/namaa/talk';
const PREFERS_REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function el(tag, cls, html){const e=document.createElement(tag); if(cls) e.className=cls; if(html!==undefined) e.innerHTML=html; return e}

function createWidget(){
  const root = el('div','chatbot-floating');
  const button = el('button','chatbot-button'); button.setAttribute('aria-label','Open Namaa Chat'); button.textContent='N';
  const panel = el('div','chatbot-panel'); panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','Namaa chatbot'); panel.setAttribute('aria-hidden','true');

  // header
  const head = el('div','chatbot-head');
  const brand = el('div','chatbot-brand','N');
  const titleWrap = el('div','');
  const title = el('div','chatbot-title','Namaa Talk');
  const sub = el('div','chatbot-sub','Business, AI & IT startup help');
  titleWrap.appendChild(title); titleWrap.appendChild(sub);
  head.appendChild(brand); head.appendChild(titleWrap);

  // body
  const body = el('div','chatbot-body');
  const status = el('div','chatbot-status','Connecting...');
  const messages = el('div','chatbot-messages'); messages.style.display='flex'; messages.style.flexDirection='column'; messages.style.gap='10px';
  body.appendChild(status); body.appendChild(messages);

  // footer
  const footer = el('div','chatbot-footer');
  const input = el('input','chatbot-input'); input.type='text'; input.placeholder='Ask Namaa about business, AI or IT startups...'; input.setAttribute('aria-label','Message to Namaa');
  const send = el('button','chatbot-send','Send');
  footer.appendChild(input); footer.appendChild(send);

  panel.appendChild(head); panel.appendChild(body); panel.appendChild(footer);
  root.appendChild(button); root.appendChild(panel);
  document.body.appendChild(root);

  // animations
  function animateOpen(){ if(PREFERS_REDUCED) { panel.style.display='flex'; panel.setAttribute('aria-hidden','false'); return }
    if(window.motion){ motion.animate(panel,{opacity:[0,1], transform:['translateY(12px)','translateY(0)']},{duration:0.45}) }
    panel.style.display='flex'; panel.setAttribute('aria-hidden','false'); }
  function animateClose(){ if(PREFERS_REDUCED){ panel.style.display='none'; panel.setAttribute('aria-hidden','true'); return }
    if(window.motion){ motion.animate(panel,{opacity:[1,0], transform:['translateY(0)','translateY(12px)']},{duration:0.28}) }
    setTimeout(()=>{ panel.style.display='none'; panel.setAttribute('aria-hidden','true') },280);
  }

  let open=false; button.addEventListener('click',()=>{ open=!open; if(open) animateOpen(); else animateClose(); input.focus(); });
  // close on outside click
  document.addEventListener('click',(e)=>{ if(!root.contains(e.target) && open){ open=false; animateClose(); } });

  // simple message render
  function addMessage(text, who='bot'){ const m=el('div', 'chatbot-message '+(who==='user'?'user':'bot')); m.innerHTML = escapeHtml(text); messages.appendChild(m); body.scrollTop = body.scrollHeight; }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]}); }

  // check connection
  fetch(API_TALK).then((r)=>r.json()).then((j)=>{ status.textContent = j.connected ? 'Connected to Namaa (Gemini)' : 'Namaa running (no Gemini)'; }).catch(()=>{ status.textContent='Namaa API unreachable'; });

  // send handler
  async function sendMessage(){ const text = input.value.trim(); if(!text) return; addMessage(text,'user'); input.value=''; send.disabled=true; send.textContent='...';
    try{
      const payload = { message: text, history: [] };
      const res = await fetch(API_TALK,{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload) });
      const data = await res.json();
      if(data && data.answer){ addMessage(data.answer,'bot'); status.textContent = data.connected ? 'Connected to Namaa (Gemini)' : 'Namaa running (no Gemini)'; }
      else{ addMessage('Namaa did not return an answer.','bot'); }
    }catch(err){ addMessage('Network error. Try again later.','bot'); }
    send.disabled=false; send.textContent='Send';
  }

  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ e.preventDefault(); sendMessage(); } });
}

// init on DOM ready
if(document.readyState !== 'loading') createWidget(); else document.addEventListener('DOMContentLoaded', createWidget);
})();
