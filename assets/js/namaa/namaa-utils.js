(function(window){
  'use strict';
  function escapeHtml(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g,function(char){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char];
    });
  }
  function normalize(value){return String(value || '').toLowerCase();}
  function pad2(value){return String(value).padStart(2,'0');}
  function safeArray(value){return Array.isArray(value) ? value : [];}
  window.NamaaUtils={escapeHtml:escapeHtml,normalize:normalize,pad2:pad2,safeArray:safeArray};
})(window);
