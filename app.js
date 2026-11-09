'use strict';
(() => {
  const config = window.ENSAI_CONFIG || {};
  const dialog = document.getElementById('link-notice');
  const copy = document.getElementById('notice-copy');
  document.querySelectorAll('[data-destination]').forEach(button => {
    button.addEventListener('click', () => {
      const isLine = button.dataset.destination === 'line';
      const url = isLine ? config.lineUrl : config.shopUrl;
      let target;
      try { target = new URL(url); } catch (_) { target = null; }
      if (target && target.protocol === 'https:') {
        window.location.assign(target.href);
      } else {
        copy.textContent = (isLine ? 'LINE公式アカウント' : 'オンラインショップ') + 'のリンク先はまだ設定されていません。公開前に正規URLを設定してください。';
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else window.alert(copy.textContent);
      }
    });
  });
  document.getElementById('close-notice').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close(); } });
})();
window.addEventListener('message', event => {
  const frame = document.querySelector('.viewer-section iframe');
  if (frame && event.source === frame.contentWindow && event.data && event.data.type === 'ensai-viewer-height') {
    const height = Number(event.data.height);
    if (Number.isFinite(height) && height >= 300 && height <= 2000) frame.style.height = height + 'px';
  }
});
