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
// The two layers the pattern owns (shinkansen.audit :chrome-layers), measured
// in a browser: the top bar's top edge stays at the scroll container's top
// after scrolling; opening the account menu moves NOTHING in the rail and the
// menu paints over it. Both bands: rail column (1440) and chip row (390).
try{for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:700}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/${process.env.SHELL_EXAMPLE||'examples/shell.html'}`);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
 // hydration revealed the chip and hid the sign-in control
 assert.equal(await page.locator('[data-ck-account=session]').isHidden(),false);
 assert.equal(await page.locator('[data-ck-account=sign-in]').isHidden(),true);
 assert.equal(await page.locator('[data-ck-account=name]').textContent(),'@kotoba-f342c');
 // sticky top bar: scroll far, the bar's top edge is still at the top
 const before=await page.evaluate(()=>document.querySelector('[data-chrome=top]').getBoundingClientRect().top);
 await page.evaluate(()=>window.scrollTo(0,2000));await page.waitForTimeout(100);
 const after=await page.evaluate(()=>({top:document.querySelector('[data-chrome=top]').getBoundingClientRect().top,scrolled:window.scrollY}));
 assert.ok(after.scrolled>1000,'the page scrolled');
 assert.ok(after.top>=0&&after.top<=(width<1024?52:1),`top bar stayed put (before ${before}, after ${JSON.stringify(after)})`);
 // floating menu: opening it changes NOTHING in flow — the rail's foot
 // keeps its height and the chip keeps its place (an in-flow menu grows the
 // foot by its own height: the "just expands" the owner measured) — and the
 // menu is positioned over the rail
 const rest=()=>page.evaluate(()=>{const c=document.querySelector('.ck-account__chip').getBoundingClientRect();const f=document.querySelector('.rail__foot').getBoundingClientRect();const l=document.getElementById('last-item').getBoundingClientRect();return {chip:[c.top,c.left],foot:f.height,last:[l.top,l.left]};});
 const closed=await rest();
 await page.locator('.ck-account__chip').click();await page.waitForTimeout(100);
 const opened=await rest();
 assert.deepEqual(opened,closed,'opening the menu changed the rail in flow (foot height / chip / last item)');
 const menu=await page.evaluate(()=>{const m=document.querySelector('[data-chrome=float]');const cs=getComputedStyle(m);const r=m.getBoundingClientRect();const rail=document.querySelector('.rail').getBoundingClientRect();
  return {position:cs.position,z:cs.zIndex,visible:r.height>0,overlapsRail:r.top<rail.bottom&&r.bottom>rail.top&&r.left<rail.right&&r.right>rail.left,inViewport:r.top>=0&&r.bottom<=innerHeight};});
 assert.equal(menu.position,'absolute');assert.ok(Number(menu.z)>=40,'z-index '+menu.z);assert.ok(menu.visible,'menu is visible');
 assert.ok(menu.inViewport,'menu inside the viewport '+JSON.stringify(menu));
 if(width>=1024)assert.ok(menu.overlapsRail,'on the rail band the menu floats over the rail '+JSON.stringify(menu));
 // Escape closes and returns focus to the chip; click outside closes
 // the menu is jp-go-dds.behavior's since 2026-09-16: the popup's hidden= is the state
 const menuOpen=()=>page.evaluate(()=>!document.querySelector('[data-ck-account=session] [data-menu-popup]').hidden);
 assert.equal(await menuOpen(),true,'menu open');
 assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('role')),'menuitem','focus moved into the menu');
 await page.keyboard.press('ArrowDown');
 assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'Billing','ArrowDown to the second item');
 await page.keyboard.press('Escape');await page.waitForTimeout(50);
 assert.equal(await menuOpen(),false,'Escape closed the menu');
 assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('ck-account__chip')),true,'focus returned to the chip');
 assert.equal(await page.evaluate(()=>document.querySelector('.ck-account__chip').getAttribute('aria-expanded')),'false');
 await page.locator('.ck-account__chip').click();await page.waitForTimeout(50);
 await page.mouse.click(width/2,300);await page.waitForTimeout(50);
 assert.equal(await menuOpen(),false,'click outside closed the menu');
 // sign-out stays the host's
 await page.locator('.ck-account__chip').click();await page.locator('#sign-out').click();
 assert.equal(await page.locator('#credit').textContent(),'signed out');
 assert.deepEqual(errors,[]);await page.close();console.log('PASS',width,'sticky top bar, floating account menu (rail unmoved) on jp-go-dds.behavior, ArrowDown/Escape/outside, host sign-out');
}}finally{await browser.close();server.closeAllConnections();server.close();}
