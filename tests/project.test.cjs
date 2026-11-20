const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'class-cue.html'), 'utf8');
test('new project pages have working links and chapter anchors', () => {
  for (const file of ['food-access-la.html', 'spoken-signs.html']) {
    const page=fs.readFileSync(path.join(root,file),'utf8');
    const ids=new Set([...page.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
    for(const [,url] of page.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if(url.startsWith('#')) assert(ids.has(url.slice(1)),file+': '+url);
      else if(!/^https?:/.test(url)) assert(fs.existsSync(path.join(root,url.split('#')[0])),file+': '+url);
    }
    assert.match(page,/In progress/);
  }
});
test('loader has no Pikachu references and all three project cards link to their pages', () => {
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert(!index.includes('pkRun'));
  assert(!/id="pkr"|#pkr\s*\{|\$\(["']pkr["']\)/.test(index));
  for(const file of ['class-cue.html','food-access-la.html','spoken-signs.html']) assert(index.includes('href="'+file+'"'));
  assert(index.includes('id="bi"'));
});
test('case study local links, chapter anchors, and all slide assets exist', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  for (const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (url.startsWith('#')) assert(ids.has(url.slice(1)), url);
    else if (!/^https?:/.test(url)) assert(fs.existsSync(path.join(root,url.split('#')[0])),url);
  }
  for (let i=1;i<=10;i++) assert(fs.existsSync(path.join(root,`assets/class-cue/slide-${String(i).padStart(2,'0')}.webp`)));
  assert.equal(fs.readFileSync(path.join(root,'assets/class-cue/class-cue-pitch.pdf')).subarray(0,5).toString(),'%PDF-');
});
test('slide viewer updates image, description and download target; respects first and last slides', () => {
  const make = () => ({children:[],events:{},hidden:true,append(child){this.children.push(child);},addEventListener(type,fn){this.events[type]=fn;}});
  const nodes = Object.fromEntries(['slide-select','deck-slide','previous-slide','next-slide','slide-full','slide-caption'].map(id=>[id,make()]));
  const controls=make();
  const document={getElementById:id=>nodes[id],createElement:make,querySelector:()=>controls};
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/class-cue/project.js'),'utf8'),{document});
  assert.equal(controls.hidden,false);
  assert.equal(nodes['slide-select'].children.length,10);
  assert.equal(nodes['previous-slide'].disabled,true);
  nodes['next-slide'].events.click();
  assert.match(nodes['deck-slide'].src,/slide-02.webp$/);
  assert.match(nodes['deck-slide'].alt,/Elizabeth/);
  nodes['slide-select'].value='9';
  nodes['slide-select'].events.change();
  assert.equal(nodes['next-slide'].disabled,true);
  assert.equal(nodes['slide-full'].href,nodes['deck-slide'].src);
  assert.match(nodes['slide-caption'].textContent,/10 \/ 10/);
  nodes['previous-slide'].events.click();
  assert.match(nodes['deck-slide'].src,/slide-09.webp$/);
});
