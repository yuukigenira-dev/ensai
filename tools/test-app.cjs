const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','app.js'),'utf8');
function setup(config={},nativeDialog=true){
 const button=(destination)=>({dataset:{destination},listeners:{},addEventListener(t,f){this.listeners[t]=f;}});
 const line=button('line'),shop=button('shop'),close=button('close');
 const dialog={open:false,listeners:{},showModal(){this.open=true},close(){this.open=false},addEventListener(t,f){this.listeners[t]=f},getBoundingClientRect(){return{left:20,right:80,top:20,bottom:80}}};
 if(!nativeDialog) delete dialog.showModal;
 const copy={textContent:''};const frame={contentWindow:{},style:{}};const redirects=[],alerts=[];const listeners={};
 const window={ENSAI_CONFIG:config,location:{assign:u=>redirects.push(u)},alert:t=>alerts.push(t),addEventListener:(t,f)=>listeners[t]=f};
 const document={getElementById:id=>({'link-notice':dialog,'notice-copy':copy,'close-notice':close})[id],querySelectorAll:()=>[line,shop],querySelector:()=>frame};
 vm.runInNewContext(source,{window,document,URL,Number});
 return{line,shop,close,dialog,copy,frame,redirects,alerts,listeners};
}
const click=b=>b.listeners.click({target:b});let assertions=0;
let env=setup();
for(const b of [env.line,env.shop]){click(b);assert.equal(env.dialog.open,true);assert.match(env.copy.textContent,/まだ設定されていません/);assert.equal(env.redirects.length,0);click(env.close);assert.equal(env.dialog.open,false);assertions+=4;}
env.dialog.open=true;env.dialog.listeners.click({target:env.dialog,clientX:0,clientY:0});assert.equal(env.dialog.open,false);assertions++;
env.dialog.open=true;env.dialog.listeners.click({target:env.dialog,clientX:30,clientY:30});assert.equal(env.dialog.open,true);assertions++;
for(const [url,expected] of [['https://example.invalid/line',true],['http://example.invalid/',false],['javascript:alert(1)',false],['',false]]){env=setup({lineUrl:url});click(env.line);assert.equal(env.redirects.length,expected?1:0);assert.equal(env.dialog.open,!expected);assertions+=2;}
env=setup({},false);click(env.line);assert.equal(env.alerts.length,1);assertions++;
env=setup();const message=(source,height)=>env.listeners.message({source,data:{type:'ensai-viewer-height',height}});
message(env.frame.contentWindow,740);assert.equal(env.frame.style.height,'740px');assertions++;
for(const height of [299,2001,'bad']){message(env.frame.contentWindow,height);assert.equal(env.frame.style.height,'740px');assertions++;}
message({},850);assert.equal(env.frame.style.height,'740px');assertions++;
console.log(`PASS: ${assertions} assertions for app.js in a mock DOM (no browser/WebGL verification)`);
