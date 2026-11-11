/* =========================================================
   motion.js — 燕彩 LP：スクロール表示（IntersectionObserver のみ。ライブラリなし）
   ・対象は下の REVEAL / PLAIN / WIPE のセレクターから自動で data 属性を付与（HTMLは変更しない）
   ・同時に画面へ入った要素は DOM 順に 90ms ずつ段差（上限 360ms）
   ・表示が済んだ要素は data 属性ごと外す＝以後は元のCSSだけが効く（hover等と干渉しない）
   ・prefers-reduced-motion: reduce／IntersectionObserver 非対応では何もせず全表示（.motion-off）
   ========================================================= */
(() => {
  'use strict';
  const root = document.documentElement;
  const STAGGER = 90, STAGGER_MAX = 360;

  // ふわっと（ぼかし＋上昇）
  const REVEAL = [
    '.section-title > *', '.copy', '.spec', '.fine', '.subtitle',
    '.viewer-section > .eyebrow', '.viewer-section > h2', '.viewer-help',
    '.purchase h2', '.purchase .cta',
    '.feature', '.feature-note',
    '.product', '.mountain > h2',
    '.mountain-grid > article', '.category-grid > figure',
    '.charm', '.gacha-heading', '.line-art',
    '.store-intro > div', '.experience-images > figure',
  ];
  // 静かに（透明度のみ）
  const PLAIN = ['.viewer-section iframe', 'footer > *'];
  // 画像ワイプ（img 自身）
  const WIPE = [
    '.craft > img', '.design > img', '.visit > img', '.gacha > img',
    '.store-intro > img', '.experience-images > img',
  ];

  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const off = () => { root.classList.add('motion-off'); };
  if (mqReduce.matches || !('IntersectionObserver' in window)) { off(); return; }
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', (e) => { if (e.matches) off(); });

  const mark = (sel, attr, val) => document.querySelectorAll(sel).forEach((el) => {
    if (el.closest('.hero') || el.hasAttribute('data-reveal') || el.hasAttribute('data-wipe')) return;
    el.setAttribute(attr, val);
  });
  REVEAL.forEach((s) => mark(s, 'data-reveal', ''));
  PLAIN.forEach((s) => mark(s, 'data-reveal', 'plain'));
  WIPE.forEach((s) => mark(s, 'data-wipe', ''));

  // style 属性の getter（フォーム要素の name="style" 対策）
  const styleGetter = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style').get;

  const io = new IntersectionObserver((entries) => {
    // 画面より上へ飛ばされた要素（ページ内リンク・高速スクロール）は、戻ったときに隠れたままにならないよう即表示
    entries.forEach((e) => {
      if (e.isIntersecting || e.boundingClientRect.top >= 0) return;
      io.unobserve(e.target);
      e.target.classList.add('is-in');
      setTimeout(() => { e.target.removeAttribute('data-reveal'); e.target.removeAttribute('data-wipe'); e.target.classList.remove('is-in'); }, 1500);
    });
    const inView = entries.filter((e) => e.isIntersecting).sort((a, b) =>
      (a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);
    inView.forEach((e, i) => {
      const el = e.target;
      io.unobserve(el);
      const d = Math.min(i * STAGGER, STAGGER_MAX);
      styleGetter.call(el).setProperty('--mo-d', d + 'ms');
      el.classList.add('is-in');
      // トランジション終了後に後始末（属性・クラス・遅延変数を外して元のCSSに戻す）
      setTimeout(() => {
        el.removeAttribute('data-reveal'); el.removeAttribute('data-wipe');
        el.classList.remove('is-in'); styleGetter.call(el).removeProperty('--mo-d');
        if (!el.getAttribute('style')) el.removeAttribute('style');
      }, 1500 + d);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
  document.querySelectorAll('[data-reveal],[data-wipe]').forEach((el) => io.observe(el));

  root.classList.add('motion-ready');
})();
