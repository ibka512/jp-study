(function (global) {
  'use strict';

  const lib = global.FSRS || global.tsfsrs || global.tsFsrs || (typeof module !== 'undefined' ? require('./vendor/ts-fsrs.umd.js') : null);
  if (!lib) {
    console.error('[FSRS] 调度库未加载，已跳过长期复习功能');
    global.ZhongriFsrsScheduler = null;
    return;
  }

  const DIMENSIONS = Object.freeze({
    ja: Object.freeze(['kanji', 'reading', 'meaning']),
    en: Object.freeze(['spelling', 'listening', 'meaning'])
  });
  const RATING = Object.freeze({ again: lib.Rating.Again, hard: lib.Rating.Hard, good: lib.Rating.Good, easy: lib.Rating.Easy });
  const DAY = 86400000;
  const scheduler = lib.fsrs({ request_retention: 0.9 });

  function dimensionFor(language, dimension) {
    const list = DIMENSIONS[language] || DIMENSIONS.ja;
    if (list.includes(dimension)) {
      return dimension;
    }
    console.warn(`[FSRS] 未认识的复习维度「${language}:${dimension}」，已按「${list[list.length - 1]}」记录`);
    return list[list.length - 1];
  }
  function key(wordId, language, dimension) {
    return `${language || 'ja'}:${String(wordId)}:${dimensionFor(language, dimension)}`;
  }
  function date(value, fallback) {
    if (!value) return fallback;
    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? fallback : parsed;
  }
  function hydrate(raw, now) {
    const empty = lib.createEmptyCard(now);
    const source = raw && typeof raw === 'object' ? raw : {};
    return Object.assign(empty, source, {
      due: date(source.due, empty.due),
      last_review: source.last_review ? date(source.last_review, undefined) : undefined
    });
  }
  function serialize(card) {
    return Object.assign({}, card, {
      due: card.due instanceof Date ? card.due.toISOString() : card.due,
      last_review: card.last_review instanceof Date ? card.last_review.toISOString() : card.last_review
    });
  }
  function rating(value) {
    if (typeof value === 'number') return Object.values(RATING).includes(value) ? value : RATING.good;
    return RATING[String(value || 'good').toLowerCase()] || RATING.good;
  }
  function formatInterval(days) {
    if (!Number.isFinite(days) || days <= 0) return '现在';
    if (days < 1) return `${Math.max(1, Math.round(days * 1440))} 分钟后`;
    if (days < 30) return `${Math.max(1, Math.round(days))} 天后`;
    if (days < 365) return `${Math.round(days / 30)} 个月后`;
    return `${(days / 365).toFixed(1)} 年后`;
  }
  function preview(rawCard, now) {
    const at = date(now, new Date());
    const card = hydrate(rawCard, at);
    const result = scheduler.repeat(card, at);
    return Object.keys(RATING).reduce((out, name) => {
      const item = result[RATING[name]];
      out[name] = { card: serialize(item.card), log: item.log, interval: item.card.scheduled_days, label: formatInterval(item.card.scheduled_days) };
      return out;
    }, {});
  }
  function review(rawCard, value, now) {
    const at = date(now, new Date());
    const result = scheduler.next(hydrate(rawCard, at), at, rating(value));
    return { card: serialize(result.card), log: Object.assign({}, result.log, { review: date(result.log.review, at).toISOString(), due: date(result.log.due, at).toISOString() }) };
  }
  function isDue(rawCard, now) {
    if (!rawCard) return true;
    return date(rawCard.due, new Date(0)).getTime() <= date(now, new Date()).getTime();
  }
  function getDueCards(cards, now) {
    return Object.keys(cards || {}).filter(id => isDue(cards[id], now));
  }

  const api = { DIMENSIONS, RATING, DAY, key, dimensionFor, hydrate, serialize, rating, formatInterval, preview, review, isDue, getDueCards };
  global.ZhongriFsrsScheduler = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
