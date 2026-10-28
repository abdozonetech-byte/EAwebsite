// Restricted editorial Markdown: all text is escaped; no HTML or executable embeds.
export function formatExample(text){
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lines=text.split('\n'),out=[];let i=0;
  while(i<lines.length){
    const line=lines[i];
    if(!line.trim()){i++;continue;}
    if(/^~~~/.test(line)){
      const language=line.slice(3).trim().replace(/[^a-z0-9-]/gi,'');i++;const body=[];
      while(i<lines.length&&!/^~~~/.test(lines[i]))body.push(lines[i++]);i++;
      out.push(`<pre class="pl-code"><code${language?` class="language-${language}"`:''}>${escape(body.join('\n'))}</code></pre>`);continue;
    }
    if(/^#{1,4} /.test(line)){out.push(`<h3>${escape(line.replace(/^#+ /,''))}</h3>`);i++;continue;}
    if(/^\|/.test(line)){
      const rows=[];while(i<lines.length&&/^\|/.test(lines[i])){const row=lines[i++];if(!/^\|[-\s:|]+\|$/.test(row))rows.push(row.split('|').slice(1,-1).map(x=>x.trim()));}
      if(rows.length){const [head,...body]=rows;out.push(`<div class="pl-table-wrap" tabindex="0" role="region" aria-label="Tableau de l’exemple"><table><thead><tr>${head.map(x=>`<th scope="col">${escape(x)}</th>`).join('')}</tr></thead><tbody>${body.map(row=>`<tr>${row.map(x=>`<td>${escape(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);}continue;
    }
    if(/^- /.test(line)){const items=[];while(i<lines.length&&/^- /.test(lines[i]))items.push(lines[i++].slice(2));out.push(`<ul>${items.map(x=>`<li>${escape(x)}</li>`).join('')}</ul>`);continue;}
    const paragraph=[];while(i<lines.length&&lines[i].trim()&&!/^(~~~|#{1,4} |^- |^\|)/.test(lines[i]))paragraph.push(lines[i++]);
    out.push(`<p>${paragraph.map(escape).join('<br>')}</p>`);
  }
  return out.join('\n');
}

