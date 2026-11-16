(function(){var b=document.querySelector('.to-top');if(!b)return;
function u(){b.classList.toggle('is-show',window.scrollY>window.innerHeight*.6)}
window.addEventListener('scroll',u,{passive:true});u();
b.addEventListener('click',function(){var r=matchMedia('(prefers-reduced-motion: reduce)').matches;window.scrollTo({top:0,behavior:r?'auto':'smooth'})});})();
