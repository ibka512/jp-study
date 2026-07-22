const WORD_BANK_LANG_ASSETS = Object.freeze({
  ja: Object.freeze([
  "./wordbanks/ja-001.js",
  "./wordbanks/ja-002.js",
  "./wordbanks/ja-003.js",
  "./wordbanks/ja-004.js",
  "./wordbanks/ja-005.js",
  "./wordbanks/ja-006.js",
  "./wordbanks/ja-007.js"
  ]),
  en: Object.freeze([
  "./wordbanks/en-001.js",
  "./wordbanks/en-002.js",
  "./wordbanks/en-003.js",
  "./wordbanks/en-004.js",
  "./wordbanks/en-005.js"
  ])
});

const WORD_BANK_FINALIZER = "./wordbanks/finalize.js";
const WORD_BANK_ASSETS = Object.freeze([
  "./wordbanks/assets.js",
  ...WORD_BANK_LANG_ASSETS.ja,
  ...WORD_BANK_LANG_ASSETS.en,
  WORD_BANK_FINALIZER
]);

const WORD_BANK_MANIFEST = Object.freeze({
  WORD_BANK_ASSETS,
  WORD_BANK_FINALIZER,
  WORD_BANK_LANG_ASSETS
});

if (typeof globalThis !== 'undefined') {
  globalThis.ZhongriWordbankAssets = WORD_BANK_MANIFEST;
}

if (typeof module === 'object' && module.exports) {
  module.exports = WORD_BANK_MANIFEST;
}
