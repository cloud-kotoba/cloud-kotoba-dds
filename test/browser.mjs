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
 try{const file=path===root?resolve(root,'index.html'):path;
 res.setHeader('content-type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wav':'audio/wav'})[extname(file)]||'application/octet-stream');res.end(readFileSync(file));}
 catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
try{for(const width of [320,390,768,1440]){
 const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/`);
 await page.locator('#draft').fill('Draft preserved across settings');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 const opener=page.locator('[data-open-dialog="account-sheet"]').first();await opener.click();
 await page.locator('#account-sheet[open]').waitFor();await page.keyboard.press('Escape');
 await page.locator('#account-sheet[open]').waitFor({state:'hidden'});
 assert.equal(await page.locator('#draft').inputValue(),'Draft preserved across settings');
 assert.deepEqual(errors,[]);await page.close();console.log('PASS',width,'layout, settings, Escape, draft preservation');
}}finally{await browser.close();server.closeAllConnections();server.close();}
