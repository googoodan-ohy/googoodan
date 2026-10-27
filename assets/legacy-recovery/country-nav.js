(function () {
  'use strict';

  var segments = window.location.pathname.split('/').filter(Boolean);
  var language = segments[0];
  var labels = {
    ja: { grade: '学年別の学習', training: '計算トレーニング', menu: '学習メニュー' },
    fr: { grade: 'Par niveau', training: 'Entraînement au calcul', menu: 'Menu' },
    de: { grade: 'Nach Klasse', training: 'Rechentraining', menu: 'Menü' },
    es: { grade: 'Por curso', training: 'Entrenamiento de cálculo', menu: 'Menú' },
    it: { grade: 'Per classe', training: 'Allenamento di calcolo', menu: 'Menu' }
  };

  if (!Object.prototype.hasOwnProperty.call(labels, language) || !document.body) return;
  if (document.getElementById('country-nav')) return;

  var copy = labels[language];
  var isTraining = segments[1] === 'training';
  var nav = document.createElement('nav');
  nav.id = 'country-nav';
  nav.setAttribute('aria-label', copy.menu);

  var style = document.createElement('style');
  style.textContent = [
    '#country-nav{box-sizing:border-box;width:100%;display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem 1rem;padding:.65rem 1rem;border-bottom:1px solid #d7e4df;background:#f4f8f6;color:#333;font:inherit}',
    '#country-nav a{display:inline-block;max-width:100%;box-sizing:border-box;padding:.45rem .75rem;border-radius:.35rem;color:#176e5c;text-decoration:none;font-weight:600;overflow-wrap:anywhere}',
    '#country-nav a[aria-current="page"]{background:#176e5c;color:#fff}',
    '#country-nav a:focus-visible{outline:3px solid #176e5c;outline-offset:3px}',
    '@media(max-width:380px){#country-nav{gap:.35rem;padding:.55rem .5rem}#country-nav a{padding:.4rem .55rem}}',
    '@media print{#country-nav{display:none!important}}'
  ].join('\n');

  var grade = document.createElement('a');
  grade.href = '/' + language + '/';
  grade.textContent = copy.grade;
  var training = document.createElement('a');
  training.href = '/' + language + '/training/';
  training.textContent = copy.training;
  if (isTraining) training.setAttribute('aria-current', 'page');
  else grade.setAttribute('aria-current', 'page');
  nav.appendChild(grade);
  nav.appendChild(training);

  var header = document.querySelector('body > header, body > .header, body > .site-header');
  var brand = document.querySelector('body > .gd-brand, body > .brand, body > .site-brand, body > .brand-area');
  if (header && header.parentNode) header.parentNode.insertBefore(nav, header.nextSibling);
  else if (brand && brand.parentNode) brand.parentNode.insertBefore(nav, brand.nextSibling);
  else document.body.insertBefore(nav, document.body.firstChild);
  document.head.appendChild(style);
}());

(function () {
  var src = '/site-language-menu.js';
  if (document.querySelector('script[data-site-language-menu-loader]')) return;
  var s = document.createElement('script');
  s.src = src;
  s.setAttribute('data-site-language-menu-loader', '');
  (document.head || document.documentElement).appendChild(s);
}());
