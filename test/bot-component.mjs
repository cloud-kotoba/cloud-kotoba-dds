import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({});
vm.runInContext(readFileSync(new URL('../resources/cloud_kotoba_dds/bot.js',import.meta.url),'utf8'),context);
const bot=context.cloudKotobaBot;
const identity={id:'demo-engineer-1',avatar:{color:'blue',glyph:'circle'}};
const first=bot.profile({...identity,status:'idle'});
for(const status of bot.states){const p=bot.profile({...identity,status});for(const key of ['seed','eyes','mouth','mark','gap','color','glyph','phase'])assert.equal(p[key],first[key]);}
assert.equal(bot.profile({...identity,name:'Renamed'}).seed,first.seed);
assert.equal(bot.profile({...identity,status:'made-up'}).status,'unknown');
assert.equal(bot.profile({...identity,motion:'off'}).motion,'off');
const faces=new Set(Array.from({length:24},(_,i)=>{const p=bot.profile({...identity,id:`demo-engineer-${i}`});return [p.eyes,p.mouth,p.mark,p.gap].join('/');}));
assert.ok(faces.size>=20,`${faces.size} faces for 24 same-color Bots`);
// Minimal DOM verifies node retention and accessible/decorative transitions.
class Element {
 constructor(){this.dataset={};this.attrs={};this.children=[];this.classList={add(){}};this.style={setProperty(){}};this.ownerDocument=doc;}
 setAttribute(k,v){this.attrs[k]=v;} removeAttribute(k){delete this.attrs[k];}
 append(...xs){this.children.push(...xs);} replaceChildren(...xs){this.children=xs;}
}
const doc={createElement:()=>new Element(),createElementNS:()=>new Element()};
const node=bot.create({...identity,status:'idle',label:'Engineer: idle'},doc),svg=node.children[0];
assert.equal(node.attrs.role,'img');assert.equal(node.attrs['aria-label'],'Engineer: idle');
bot.update(node,{...identity,status:'working'});
assert.equal(node.children[0],svg);assert.equal(node.dataset.status,'working');
assert.equal(node.attrs['aria-hidden'],'true');assert.equal(node.attrs.role,undefined);
bot.update(node,{...identity,id:'demo-other'});assert.notEqual(node.children[0],svg);
assert.equal(node.dataset.color,'blue');assert.equal(node.dataset.glyph,'circle');
console.log('Bot identity, state, motion and DOM retention: passed');
