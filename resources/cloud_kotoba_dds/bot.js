/* Cloud Kotoba DDS Bot component — Apache-2.0. No network, timers or app state. */
(function (root) {
  'use strict';
  const colors = ['clay','red','orange','amber','green','teal','blue','violet','pink','slate'];
  const bodies = {
    circle:'M32 3a29 29 0 1 0 0 58 29 29 0 0 0 0-58Z',
    bean:'M31 4C10 0 2 15 4 35S22 65 42 58 66 30 55 14C49 6 40 5 31 4Z',
    block:'M13 4h38q9 0 9 9v38q0 9-9 9H13q-9 0-9-9V13q0-9 9-9Z',
    wide:'M20 10h24a22 22 0 0 1 0 44H20a22 22 0 0 1 0-44Z',
    wedge:'M28 7q4-7 8 0l26 48q4 7-4 7H6q-8 0-4-7Z',
    cloud:'M12 22C5 2 27 0 32 12 48-6 65 9 55 24 71 35 60 61 44 55 30 69 3 57 7 43-6 38-1 21 12 22Z',
    wave:'M5 16C17-1 31 15 44 5 59-5 67 14 58 28 73 49 52 67 37 57 19 70-3 57 6 40-4 31-1 23 5 16Z',
    drop:'M31 4a29 29 0 0 1 29 29c0 18-13 28-30 28H4V33A29 29 0 0 1 31 4Z'
  };
  const states = ['idle','working','waiting-approval','waiting-connection','blocked','disabled','unknown'];
  function seed(value) {
    let n=0;
    for (const c of String(value)) n=(n*131+c.codePointAt(0))%2147483647;
    // Avalanche nearby IDs so sequential Bots do not inherit near-identical faces.
    n=Math.imul(n^(n>>>16),0x7feb352d);
    n=Math.imul(n^(n>>>15),0x846ca68b);
    return (n^(n>>>16))>>>0;
  }
  function profile(options={}) {
    const avatar=options.avatar||{};
    const n=seed(options.id || `${avatar.color||''}/${avatar.glyph||''}/${avatar.variant||0}`);
    return Object.freeze({seed:n,color:colors.includes(avatar.color)?avatar.color:colors[n%colors.length],
      glyph:Object.hasOwn(bodies,avatar.glyph)?avatar.glyph:Object.keys(bodies)[n%8],
      eyes:Math.floor(n/7)%4,mouth:Math.floor(n/31)%5,mark:Math.floor(n/127)%4,
      gap:14+n%5,phase:-(n%6000)/1000,
      status:states.includes(options.status)?options.status:'unknown',motion:options.motion==='off'?'off':'auto'});
  }
  function update(node, options={}) {
    const p=profile(options), doc=node.ownerDocument;
    const el=(tag,attrs={})=>{const n=doc.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
    const signature=JSON.stringify([p.seed,p.color,p.glyph,p.eyes,p.mouth,p.mark,p.gap]);
    node.classList.add('ck-bot');
    node.dataset.color=p.color;node.dataset.glyph=p.glyph;node.dataset.status=p.status;
    node.dataset.motion=p.motion;node.dataset.face=String(p.seed);
    node.style.setProperty('--ck-bot-phase',`${p.phase}s`);
    if(options.label){node.removeAttribute('aria-hidden');node.setAttribute('role','img');node.setAttribute('aria-label',String(options.label));}
    else{node.setAttribute('aria-hidden','true');node.removeAttribute('aria-label');node.removeAttribute('role');}
    // Realtime status updates keep the same SVG nodes and animation phase.
    if(node.dataset.ckBotSignature===signature)return node;
    node.dataset.ckBotSignature=signature;
    const svg=el('svg',{viewBox:'0 0 64 64',focusable:'false','aria-hidden':'true'});
    svg.append(el('path',{d:bodies[p.glyph],class:'ck-bot__body'}));
    const mark=el('path',{class:'ck-bot__mark',d:['M17 15l6-5','M39 10l7 6','M27 9h10','M9 37l5 5'][p.mark]});svg.append(mark);
    const face=el('g',{class:'ck-bot__face'});
    const eyes=el('g',{class:'ck-bot__eyes'});
    for(const x of [32-p.gap/2,32+p.gap/2]){
      const eye=el('g',{class:'ck-bot__eye'});
      if(p.eyes===2)eye.append(el('path',{d:`M${x-4} 28q4-5 8 0v8h-8Z`,class:'ck-bot__white'}));
      else eye.append(el('rect',{x:x-(p.eyes===1?3:4),y:p.eyes===3?28:25,width:p.eyes===1?6:8,height:p.eyes===3?7:12,rx:p.eyes===0?4:2,class:'ck-bot__white'}));
      eye.append(el('circle',{cx:x+(p.mark%2?1:-1),cy:32,r:2.1,class:'ck-bot__pupil'}));eyes.append(eye);
    }
    face.append(eyes,el('path',{class:'ck-bot__rest-eyes',d:`M${28-p.gap/2} 32h8M${28+p.gap/2} 32h8`}),
      el('path',{class:'ck-bot__brows',d:`M${28-p.gap/2} 23l8-2M${28+p.gap/2} 21l8 2`}),
      el('path',{class:'ck-bot__mouth',d:['M25 43q7 8 14 0','M26 45h12','M27 43q5 5 10 0','M27 44q7 5 13-2','M29 43q3-2 6 0v4q-3 3-6 0Z'][p.mouth]}));
    svg.append(face);
    const badge=el('text',{x:53,y:17,'font-size':18,class:'ck-bot__attention'});badge.textContent='!';svg.append(badge);
    node.replaceChildren(svg);return node;
  }
  function create(options={}, doc=root.document){return update(doc.createElement('span'),options);}
  function mountAll(container=root.document){return Array.from(container.querySelectorAll('[data-ck-bot-id]')).map(node=>update(node,{id:node.dataset.ckBotId,status:node.dataset.status,avatar:{color:node.dataset.color,glyph:node.dataset.glyph},label:node.getAttribute('aria-label'),motion:node.dataset.motion}));}
  root.cloudKotobaBot=Object.freeze({version:'0.1.0',profile,create,update,mountAll,states:Object.freeze(states),colors:Object.freeze(colors)});
})(globalThis);
