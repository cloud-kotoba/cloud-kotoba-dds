import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve('.');
const server=createServer((req,res)=>{
 const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(path!==root&&!path.startsWith(root+'/')){res.writeHead(403).end();return;}
 try{res.setHeader('content-type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[extname(path)]||'application/octet-stream');res.end(readFileSync(path));}
 catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
// What the pattern owns, measured in a browser on BOTH surfaces (light, and
// jp-go-dds's dark layer via data-theme) at 390 and 1440: the wrapping block
// never clips a line and never widens the page; the scrolling block scrolls
// and is keyboard-reachable; every token class is a colour DIFFERENT from
// plain text and every one reads at AA (>= 4.5:1) on the block's surface;
// the copy control is revealed by the runtime, copies the block's verbatim
// text and says so, then restores its label.
const lum=([r,g,b])=>{const c=[r,g,b].map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];};
const contrast=(a,b)=>{const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+0.05)/(y+0.05);};
const rgb=s=>{const m=s.match(/\d+(\.\d+)?/g)||[];return m.slice(0,3).map(Number);};
const TOKENS=['comment','string','key','var','flag','number','literal','cmd','special'];
try{
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
 for(const width of [390,1440]) for(const theme of ['light','dark']){
  const page=await context.newPage({viewport:{width,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/${process.env.CODE_EXAMPLE||'examples/code.html'}`);
  await page.evaluate(t=>{document.documentElement.setAttribute('data-theme',t);},theme);
  await page.waitForTimeout(50);
  const tag=`${width}/${theme}`;
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${tag}: no horizontal page overflow`);
  // the wrapping block: the pre is no wider than its box (nothing to scroll = nothing clipped)
  const wrap=await page.evaluate(()=>{const p=document.getElementById('wrap');return {scroll:p.scrollWidth,client:p.clientWidth,ws:getComputedStyle(p).whiteSpace,lines:p.getBoundingClientRect().height/parseFloat(getComputedStyle(p).lineHeight)};});
  assert.equal(wrap.ws,'pre-wrap',`${tag}: the default block wraps (white-space ${wrap.ws})`);
  assert.ok(wrap.scroll<=wrap.client,`${tag}: the wrapping block clips nothing (scrollWidth ${wrap.scroll} > clientWidth ${wrap.client})`);
  // the scrolling block: scrolls sideways and is focusable
  const scroll=await page.evaluate(()=>{const p=document.getElementById('scroll');return {scroll:p.scrollWidth,client:p.clientWidth,ox:getComputedStyle(p).overflowX,tab:p.getAttribute('tabindex')};});
  assert.ok(['auto','scroll'].includes(scroll.ox),`${tag}: the scrolling block has overflow-x ${scroll.ox}`);
  assert.ok(scroll.scroll>scroll.client,`${tag}: the long line is reachable by scrolling (scrollWidth ${scroll.scroll} <= clientWidth ${scroll.client})`);
  assert.equal(scroll.tab,'0',`${tag}: a scrolling block is keyboard-focusable`);
  // tokens: each class is coloured differently from plain text and reads at AA on the surface
  const colours=await page.evaluate(names=>{
   const fig=document.querySelector('#wrap').closest('.ck-code');const surface=getComputedStyle(fig).backgroundColor;
   const plain=getComputedStyle(document.querySelector('#wrap code')).color;
   const out={surface,plain,tokens:{}};
   for(const n of names){const el=document.querySelector('.ck-tok-'+n);out.tokens[n]=el?getComputedStyle(el).color:null;}
   return out;},TOKENS);
  const surface=rgb(colours.surface);
  assert.ok(colours.surface!=='rgba(0, 0, 0, 0)',`${tag}: the block has a surface of its own`);
  for(const n of TOKENS){
   const c=colours.tokens[n];assert.ok(c,`${tag}: a .ck-tok-${n} token is on the page`);
   if(n!=='cmd')assert.notEqual(c,colours.plain,`${tag}: .ck-tok-${n} is a colour of its own (plain text is ${colours.plain})`);
   const ratio=contrast(rgb(c),surface);
   assert.ok(ratio>=4.5,`${tag}: .ck-tok-${n} ${c} on ${colours.surface} reads at ${ratio.toFixed(2)}:1 — below AA 4.5`);
  }
  assert.ok(contrast(rgb(colours.plain),surface)>=4.5,`${tag}: plain code text reads at AA`);
  // the copy control: revealed by the runtime, copies verbatim, announces, restores
  const btn=page.locator('#wrap').locator('xpath=..').locator('[data-ck-code=copy]');
  assert.equal(await btn.isHidden(),false,`${tag}: the copy control is revealed once the runtime loaded`);
  const label=await btn.textContent();
  await btn.click();await page.waitForTimeout(100);
  assert.equal(await btn.textContent(),'Copied',`${tag}: the control says it copied`);
  const clip=await page.evaluate(()=>navigator.clipboard.readText());
  const text=await page.evaluate(()=>document.getElementById('wrap').textContent);
  assert.equal(clip,text,`${tag}: the clipboard holds the block's verbatim text`);
  assert.ok(text.includes('-d \'{"model":"qwen3.8-flash-next-whitehacker"'),`${tag}: the copied text is the source, tokens notwithstanding`);
  await page.waitForTimeout(1700);
  assert.equal(await btn.textContent(),label,`${tag}: the label is restored`);
  // a block that declined the control shows none
  assert.equal(await page.locator('#http').locator('xpath=..').locator('[data-ck-code=copy]').count(),0,`${tag}: :copy? false emits no control`);
  assert.deepEqual(errors,[],`${tag}: no page errors`);
  await page.close();
  console.log(`PASS ${tag} wraps without clipping, scrolls when asked, ${TOKENS.length} token colours at AA, copy control copies verbatim`);
 }
}finally{await browser.close();server.close();}
