(function (root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  root.ZhongriNotificationPlanner = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DAY = 86400000;
  const PLANNED_NOTIFICATION_BASE_ID = 21100;
  const DEFAULT_SETTINGS = Object.freeze({
    enabled: false,
    mode: 'smart',
    dueEnabled: true,
    rescueEnabled: true,
    reminderTime: '20:00',
    rescueTime: '21:30',
    weekdays: Object.freeze([1, 2, 3, 4, 5, 6, 0]),
    quietEnabled: true,
    quietStart: '22:30',
    quietEnd: '07:30',
    exact: false
  });
  const DIMENSION_LABELS = Object.freeze({
    kanji: '拼写',
    spelling: '拼写',
    reading: '读音',
    listening: '听力',
    meaning: '释义'
  });

  const pad = value => String(value).padStart(2, '0');

  const dateKey = value => {
    const dateOnly = String(value || '').match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );
    if (dateOnly) return dateOnly[0];

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const isValidTime = value => {
    if (!/^\d{2}:\d{2}$/.test(String(value || ''))) return false;
    const [hour, minute] = value.split(':').map(Number);
    return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
  };

  const normalizeWeekdays = value => {
    if (!Array.isArray(value)) {
      return [...DEFAULT_SETTINGS.weekdays];
    }

    return [...new Set(
      value
        .map(Number)
        .filter(day => Number.isInteger(day) && day >= 0 && day <= 6)
    )];
  };

  const normalizeSettings = raw => {
    const source = raw && typeof raw === 'object' ? raw : {};
    return {
      enabled: source.enabled === true,
      mode: source.mode === 'fixed' ? 'fixed' : 'smart',
      dueEnabled: source.dueEnabled !== false,
      rescueEnabled: source.rescueEnabled !== false,
      reminderTime: isValidTime(source.reminderTime)
        ? source.reminderTime
        : DEFAULT_SETTINGS.reminderTime,
      rescueTime: isValidTime(source.rescueTime)
        ? source.rescueTime
        : DEFAULT_SETTINGS.rescueTime,
      weekdays: normalizeWeekdays(source.weekdays),
      quietEnabled: source.quietEnabled !== false,
      quietStart: isValidTime(source.quietStart)
        ? source.quietStart
        : DEFAULT_SETTINGS.quietStart,
      quietEnd: isValidTime(source.quietEnd)
        ? source.quietEnd
        : DEFAULT_SETTINGS.quietEnd,
      exact: source.exact === true
    };
  };

  const timeToMinutes = value => {
    const [hour, minute] = value.split(':').map(Number);
    return hour * 60 + minute;
  };

  const isInsideQuietHours = (time, start, end) => {
    if (!isValidTime(time) || !isValidTime(start) || !isValidTime(end)) {
      return false;
    }

    const current = timeToMinutes(time);
    const from = timeToMinutes(start);
    const to = timeToMinutes(end);
    if (from === to) return false;
    return from < to
      ? current >= from && current < to
      : current >= from || current < to;
  };

  const atLocalTime = (date, time) => {
    const [hour, minute] = time.split(':').map(Number);
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour,
      minute,
      0,
      0
    );
  };

  const parseDue = value => {
    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const dimensionSummary = cards => {
    const counts = cards.reduce((result, card) => {
      const dimension = String(card.dimension || 'meaning');
      result[dimension] = (result[dimension] || 0) + 1;
      return result;
    }, {});

    return Object.entries(counts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([dimension, count]) => {
        return `${DIMENSION_LABELS[dimension] || '复习'} ${count}`;
      })
      .join(' · ');
  };

  const isUsableTime = (at, now, time, settings) => {
    if (at.getTime() <= now.getTime()) return false;
    return !(
      settings.quietEnabled &&
      isInsideQuietHours(time, settings.quietStart, settings.quietEnd)
    );
  };

  const buildDueNotification = (cards, at, offset) => {
    const summary = dimensionSummary(cards);
    return {
      id: PLANNED_NOTIFICATION_BASE_ID + offset,
      kind: 'due',
      at: at.toISOString(),
      title: `钟日 · ${cards.length} 个维度待复习`,
      body: summary
        ? `${summary}，现在花几分钟巩固一下。`
        : '记忆内容已经到期，现在花几分钟巩固一下。',
      dueCount: cards.length,
      extra: {
        route: 'fsrs-review',
        kind: 'due',
        date: dateKey(at)
      }
    };
  };

  const buildRescueNotification = (at, offset, streak) => {
    const streakText = Number(streak) > 0
      ? `你已连续学习 ${Number(streak)} 天，`
      : '';
    return {
      id: PLANNED_NOTIFICATION_BASE_ID + offset,
      kind: 'rescue',
      at: at.toISOString(),
      title: '钟日 · 今天还没有学习',
      body: `${streakText}完成一次短复习，别让今天空下来。`,
      dueCount: 0,
      extra: {
        route: 'review',
        kind: 'rescue',
        date: dateKey(at)
      }
    };
  };

  const buildFixedNotification = (at, offset) => {
    return {
      id: PLANNED_NOTIFICATION_BASE_ID + offset,
      kind: 'fixed',
      at: at.toISOString(),
      title: '钟日 · 今日学习',
      body: '花几分钟复习一下，让记忆保持清晰。',
      dueCount: 0,
      extra: {
        route: 'review',
        kind: 'fixed',
        date: dateKey(at)
      }
    };
  };

  const planNotifications = ({
    now = new Date(),
    settings,
    cards = [],
    studyDates = [],
    streak = 0,
    horizonDays = 7
  } = {}) => {
    const normalized = normalizeSettings(settings);
    const current = now instanceof Date ? now : new Date(now);
    if (
      !normalized.enabled ||
      Number.isNaN(current.getTime()) ||
      normalized.weekdays.length === 0
    ) {
      return [];
    }

    const studied = new Set(studyDates.map(dateKey).filter(Boolean));
    const dueCards = cards
      .map(card => ({ ...card, parsedDue: parseDue(card.due) }))
      .filter(card => card.parsedDue);
    const result = [];
    const days = Math.max(1, Math.min(14, Number(horizonDays) || 7));

    for (let offset = 0; offset < days; offset += 1) {
      const day = new Date(
        current.getFullYear(),
        current.getMonth(),
        current.getDate() + offset,
        12,
        0,
        0,
        0
      );
      if (!normalized.weekdays.includes(day.getDay())) continue;

      const key = dateKey(day);
      if (studied.has(key)) continue;

      const primaryAt = atLocalTime(day, normalized.reminderTime);

      if (normalized.mode === 'fixed') {
        if (isUsableTime(primaryAt, current, normalized.reminderTime, normalized)) {
          result.push(buildFixedNotification(primaryAt, offset));
        }
        continue;
      }

      const cardsDueAtPrimary = dueCards.filter(card => {
        return card.parsedDue.getTime() <= primaryAt.getTime();
      });
      if (
        normalized.dueEnabled &&
        cardsDueAtPrimary.length > 0 &&
        isUsableTime(primaryAt, current, normalized.reminderTime, normalized)
      ) {
        result.push(buildDueNotification(cardsDueAtPrimary, primaryAt, offset));
        continue;
      }

      const rescueAt = atLocalTime(day, normalized.rescueTime);
      if (
        normalized.rescueEnabled &&
        isUsableTime(rescueAt, current, normalized.rescueTime, normalized)
      ) {
        result.push(buildRescueNotification(rescueAt, offset, streak));
      }
    }

    return result;
  };

  return Object.freeze({
    DAY,
    PLANNED_NOTIFICATION_BASE_ID,
    DEFAULT_SETTINGS,
    dateKey,
    normalizeSettings,
    isInsideQuietHours,
    planNotifications
  });
});
