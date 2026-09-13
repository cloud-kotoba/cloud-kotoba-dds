"""Regenerate the offline Bot fixture; reuse the preview's vendored DADS tokens."""
from pathlib import Path
import re
root=Path(__file__).resolve().parent.parent
source=(root/'index.html').read_text()
tokens=re.search(r':root\s*\{[^}]+\}',source).group()
html='''<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bot component — Cloud Kotoba DDS</title>
<style>/* DADS palette: see ../assets/LICENSE-DADS and LICENSE-jp-go-dds. */
TOKENS
body{font-family:system-ui,sans-serif;margin:0;padding:1.5rem;color:var(--color-neutral-solid-gray-900);background:var(--color-neutral-solid-gray-50)}main{max-width:64rem;margin:auto}h1{font-size:1.75rem}h2{font-size:1.125rem;margin-top:2rem}.grid{display:flex;flex-wrap:wrap;gap:1rem}.card{display:flex;flex-direction:column;align-items:center;gap:.75rem;padding:1rem;background:var(--color-neutral-white);border-radius:1rem;min-width:6rem}.card .ck-bot{width:3.75rem;height:3.75rem}button,select{font:inherit;padding:.5rem}label{display:inline-flex;gap:.5rem;align-items:center;margin:.5rem}button:focus-visible,select:focus-visible{outline:3px solid var(--color-primitive-blue-600);outline-offset:3px}small{max-width:10rem}a{color:var(--color-primitive-blue-700)}</style>
<link rel="stylesheet" href="../resources/cloud_kotoba_dds/bot.css"><main><h1>Bot の顔と動き</h1><p>同じ Bot は、状態が変わっても同じ顔。これは架空の Bot による見本です。</p><label>状態 <select id="state"></select></label><button id="motion" aria-pressed="false">動きを止める</button>
<h2>それぞれの色と形</h2><div class="grid" id="identities"></div><h2>同じ色・形でも異なる顔</h2><div class="grid" id="siblings"></div><h2>作業状態</h2><div class="grid" id="states"></div><p>端末の「視差効果を減らす」に対応。実際の状態は隣のテキストで伝えます。</p><a href="../BOT_COMPONENTS.md">組み込み方</a></main>
<script src="../resources/cloud_kotoba_dds/bot.js"></script><script>
const api=cloudKotobaBot,nodes=[],labels=['待機中','作業中','承認待ち','接続待ち','前提待ち','停止中','状態不明'];
function card(parent,options,text,live=false){const c=document.createElement('div');c.className='card';const n=api.create(options);const label=document.createElement('small');label.textContent=text;c.append(n,label);document.getElementById(parent).append(c);nodes.push({n,options,live});}
['circle','bean','block','wide','wedge','cloud','wave','drop'].forEach((glyph,i)=>card('identities',{id:'demo-'+i,avatar:{color:api.colors[i],glyph},status:'idle'},'Bot '+(i+1),true));
for(let i=0;i<8;i++)card('siblings',{id:'demo-engineer-'+i,avatar:{color:'blue',glyph:'circle'},status:'idle'},'Engineer '+(i+1),true);
api.states.forEach((status,i)=>{const o=document.createElement('option');o.value=status;o.textContent=labels[i];state.append(o);card('states',{id:'demo-state',avatar:{color:'teal',glyph:'bean'},status},labels[i]);});
state.addEventListener('change',()=>nodes.filter(x=>x.live).forEach(x=>{x.options.status=state.value;api.update(x.n,x.options);}));
motion.addEventListener('click',()=>{const off=motion.getAttribute('aria-pressed')!=='true';motion.setAttribute('aria-pressed',String(off));motion.textContent=off?'動きを再開':'動きを止める';nodes.forEach(x=>{x.options.motion=off?'off':'auto';api.update(x.n,x.options);});});
</script></html>'''.replace('TOKENS',tokens)
(root/'examples/bots.html').write_text(html)
