
(() => {
 const report = () => { if(parent!==window) parent.postMessage({type:'ensai-viewer-height',height:Math.ceil(document.body.getBoundingClientRect().height)+32},'*'); };
 if ('ResizeObserver' in window) new ResizeObserver(report).observe(document.body);
 window.addEventListener('load',report);window.addEventListener('resize',report);
})();
