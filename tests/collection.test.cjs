// Run with: node --test tests/collection.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function source(name) {
  const start = script.indexOf('      function ' + name + '(');
  assert.notEqual(start, -1);
  return script.slice(start, script.indexOf('\n      }', start) + 8);
}
function setup(extra = {}) {
  const context = vm.createContext({ ...extra });
  vm.runInContext(['decodeCollection', 'encodeCollection', 'dexCounts', 'dexEntries', 'routePosition'].map(source).join('\n'), context);
  return context;
}
test('complete inline script parses', () => { new Function(script); });
test('downward gait passes through neutral between opposite steps; upward cadence is retained', () => {
  const c = setup();
  vm.runInContext(source('gaitFrame'), c);
  assert.deepEqual([0,120,240,360,480].map(t=>c.gaitFrame(t)), [1,0,2,0,1]);
  assert.deepEqual([0,150,300].map(t=>c.gaitFrame(t,true)), [1,2,1]);
  assert.equal(c.gaitFrame(119),1);
  assert.equal(c.gaitFrame(239),0);
});
test('catches and team round-trip; only compact stable IDs are saved', () => {
  const c = setup();
  const saved = c.encodeCollection([{id:'forest:pikachu:0', k:'pikachu', team:1, src:'large image'}, {id:'forest:eevee:1', team:0}]);
  assert.equal(saved.includes('large image'), false);
  const restored = c.decodeCollection(saved, new Map([['forest:pikachu:0', {}], ['forest:eevee:1', {}]]));
  assert.equal(restored.length, 2);
  assert.equal(restored[0].team, true);
  assert.equal(restored[1].team, false);
});
test('missing, damaged, duplicate and unknown saves are handled safely; team capped at six', () => {
  const c = setup();
  const encounters = new Map(Array.from({length:9}, (_, i) => ['id'+i, {}]));
  assert.equal(c.decodeCollection(null, encounters).length, 0);
  for (const raw of ['broken', '{}', 'null', '{"version":2,"caught":[]}'])
    assert.throws(() => c.decodeCollection(raw, encounters));
  const caught = [...encounters.keys()].map(id => ({id, team:true}));
  caught.push(null, {id:'id0',team:true}, {id:'unknown',team:true}, {id:5});
  const result = c.decodeCollection(JSON.stringify({version:1,caught}), encounters);
  assert.equal(result.length, 9);
  assert.equal(result.filter(e => e.team).length, 6);
});
test('discovery counts unique entries, with shiny variants separate', () => {
  const c = setup(), keys = new Set(['pikachu','shinx','shinx2']);
  const partial = c.dexCounts([{k:'pikachu'},{k:'pikachu'},{k:'shinx2'},{k:'unknown'}], keys);
  assert.equal(partial.discovered, 2);
  assert.equal(partial.remaining, 1);
  assert.equal(c.dexCounts([...keys].map(k => ({k})), keys).remaining, 0);
});
test('Pokédex pairs Shinx variants and reveals only the caught variant', () => {
  const c = setup();
  const keys = new Set(['pikachu','shinx','eevee','shinx2','mew']);
  const entries = c.dexEntries([{k:'shinx2'}], keys);
  const normal = entries.findIndex(e => e.k === 'shinx');
  assert.equal(entries[normal+1].k, 'shinx2');
  assert.equal(entries[normal].caught, false);
  assert.equal(entries[normal+1].caught, true);
  assert.equal(entries.filter(e => e.caught).length, 1);
});
test('Pokédex renders silhouettes, then revealed sprites, in a shared Shinx group', () => {
  function element(tag, className) {
    return {tag,className,children:[],attrs:{},append(...children){this.children.push(...children);},
      replaceChildren(){this.children=[];},setAttribute(k,v){this.attrs[k]=v;}};
  }
  const nodes = Object.fromEntries(['dex-open','dex-summary','dex-progress','dex-grid'].map(id => [id,element('div')]));
  const bank = [];
  const c = setup({bank,dexKeys:new Set(['pikachu','shinx','shinx2']),IMG:{pikachu:'p',shinx:'s',shinx2:'ss'},
    NM:{shinx2:'Shiny Shinx'},el:element,$:id=>nodes[id]});
  vm.runInContext(source('dexUI'),c);
  c.dexUI();
  const family = nodes['dex-grid'].children[1];
  assert.equal(family.className, 'dex-family');
  assert.equal(family.children.length, 2);
  assert.equal(family.children[1].className, 'dex-entry unknown');
  assert.equal(family.children[1].children[2].textContent, '???');
  bank.push({k:'shinx2'});
  c.dexUI();
  const revealed = nodes['dex-grid'].children[1].children[1];
  assert.equal(revealed.className, 'dex-entry');
  assert.equal(revealed.children[1].src, 'ss');
  assert.equal(revealed.children[2].textContent, 'Shiny Shinx');
  assert.equal(nodes['dex-progress'].value, 1);
});
test('Poké Ball center is white across the black equatorial band', () => {
  const pixels = new Map();
  const drawing = {fillStyle:'',fillRect(x,y){pixels.set(x+','+y,this.fillStyle);}};
  const c = setup({el:()=>({getContext:()=>drawing,toDataURL:()=> 'image'})});
  vm.runInContext(source('ballImg'),c);
  c.ballImg();
  for (const x of [6,7,8]) assert.equal(pixels.get(x+',7'),'#e8e6f2');
  for (const x of [4,5,9,10]) assert.equal(pixels.get(x+',7'),'#2a2038');
});
test('route handles initial view, section boundary, reverse scroll and page bottom', () => {
  const c = setup();
  const bounds = scroll => [0,1000,2000,3000].map(top => ({top:top-scroll,height:1000}));
  assert.equal(c.routePosition(bounds(0), 250, false).index, 0);
  assert.equal(c.routePosition(bounds(751), 250, false).index, 1);
  assert.equal(c.routePosition(bounds(749), 250, false).index, 0);
  assert.equal(c.routePosition(bounds(2500), 250, true).index, 3);
  assert.equal(c.routePosition(bounds(2500), 250, true).progress, 100);
});
test('restoration hides caught encounters and rebuilds team at current viewport size', () => {
  const im = {dataset:{encounter:'about:pikachu:1',k:'pikachu',n:'Pikachu',a:'a-hop'},style:{width:'150px'}};
  const status = {}, bank = [], joined = [];
  const c = setup({bank, IMG:{pikachu:'trusted embedded image'}, COLLECTION_KEY:'test', collectionReady:false,
    localStorage:{getItem:() => '{"version":1,"caught":[{"id":"about:pikachu:1","team":true}]}'},
    document:{querySelectorAll:() => [im]}, $:() => status, join:e => {e.team=1;joined.push(e);}, boxUI:() => {},
  });
  vm.runInContext(['collectionEntry','restoreCollection'].map(source).join('\n'), c);
  c.restoreCollection();
  assert.equal(im._c, 1);
  assert.equal(im.style.display, 'none');
  assert.equal(bank[0].w, 150);
  assert.equal(bank[0].src, 'trusted embedded image');
  assert.equal(joined.length, 1);
  assert.equal(c.collectionReady, true);
  assert.equal(status.textContent, '');
});
test('storage failures do not break gameplay and are explained', () => {
  const status = {};
  const c = setup({bank:[], COLLECTION_KEY:'test', collectionReady:true, $:() => status,
    localStorage:{getItem:() => {throw Error('blocked');},setItem:() => {throw Error('quota');}},
    document:{querySelectorAll:() => []}, boxUI:() => {},
  });
  vm.runInContext(['saveCollection','restoreCollection'].map(source).join('\n'), c);
  assert.doesNotThrow(() => c.restoreCollection());
  assert.match(status.textContent, /could not be loaded/);
  assert.doesNotThrow(() => c.saveCollection());
  assert.match(status.textContent, /this visit only/);
});
