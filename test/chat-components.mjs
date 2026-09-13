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
 await page.goto(`http://127.0.0.1:${server.address().port}/examples/chat.html`);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.locator('#input').fill('<img src=x onerror=alert(1)>');await page.locator('button[type=submit]').click();
 assert.equal(await page.locator('#messages img').count(),0);
 assert.equal(await page.locator('#messages .go-user .go-text').textContent(),'<img src=x onerror=alert(1)>');
 assert.equal(await page.locator('#messages .go-assistant').count(),1);
 await page.evaluate(()=>{const second=document.createElement('div');second.id='second';document.body.append(second);const view=cloudKotobaChat.createMessage({container:second,input:'Other instance',role:'Other',userLabel:'You',stages:[]});view.output.textContent='Independent';});
 assert.equal(await page.locator('#messages .go-assistant').count(),1);
 assert.equal(await page.locator('#second .go-assistant .go-text').textContent(),'Independent');
 assert.deepEqual(errors,[]);await page.close();console.log('PASS',width,'shared composer, safe message rendering, independent instances');
}}finally{await browser.close();server.closeAllConnections();server.close();}
