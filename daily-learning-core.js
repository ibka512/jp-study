(function (root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    root.DailyLearningCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const DAY_MS = 24 * 60 * 60 * 1000;
    const GOALS = Object.freeze([5, 10, 15]);

    const clampGoal = value => {
        const parsed = Number.parseInt(value, 10);
        return GOALS.includes(parsed) ? parsed : 10;
    };

    const localDateKey = value => {
        const date = value instanceof Date ? value : new Date(value || Date.now());
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isMastered = clearState => {
        return Boolean(
            clearState?.kanji &&
            clearState?.kana &&
            clearState?.meaning
        );
    };

    const stableNumber = value => {
        let hash = 2166136261;
        const text = String(value || '');

        for (let index = 0; index < text.length; index++) {
            hash ^= text.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }

        return hash >>> 0;
    };

    const stableDailySort = (entries, dateKey) => {
        return [...entries].sort((left, right) => {
            return (
                stableNumber(`${dateKey}|${left.id}`) -
                stableNumber(`${dateKey}|${right.id}`)
            );
        });
    };

    const normalizeReviewRecord = record => {
        const source = record && typeof record === 'object' ? record : {};
        return {
            repetitions: Math.max(0, Number.parseInt(source.repetitions, 10) || 0),
            intervalDays: Math.max(0, Number(source.intervalDays) || 0),
            ease: Math.min(3, Math.max(1.3, Number(source.ease) || 2.3)),
            dueAt: Number(source.dueAt) || 0,
            lastReviewedAt: Number(source.lastReviewedAt) || 0,
            lastRating: String(source.lastRating || '')
        };
    };

    const rateReview = (record, rating, nowValue = Date.now()) => {
        const now = Number(nowValue) || Date.now();
        const current = normalizeReviewRecord(record);
        const next = { ...current };

        if (rating === 'again') {
            next.repetitions = 0;
            next.intervalDays = 0;
            next.ease = Math.max(1.3, next.ease - 0.2);
            next.dueAt = now + 10 * 60 * 1000;
        } else if (rating === 'hard') {
            next.repetitions += 1;
            next.intervalDays = Math.max(1, Math.round((next.intervalDays || 1) * 1.25));
            next.ease = Math.max(1.3, next.ease - 0.05);
            next.dueAt = now + next.intervalDays * DAY_MS;
        } else {
            next.repetitions += 1;
            next.intervalDays = next.repetitions === 1
                ? 1
                : next.repetitions === 2
                    ? 3
                    : Math.max(4, Math.round((next.intervalDays || 3) * next.ease));
            next.ease = Math.min(3, next.ease + 0.05);
            next.dueAt = now + next.intervalDays * DAY_MS;
            rating = 'good';
        }

        next.lastReviewedAt = now;
        next.lastRating = rating;
        return next;
    };

    const buildDailyPlan = ({
        words = [],
        clearStates = {},
        reviewRecords = {},
        language = 'ja',
        goal = 10,
        now = Date.now(),
        reviewOnly = false
    } = {}) => {
        const safeGoal = clampGoal(goal);
        const dateKey = localDateKey(now);
        const candidates = words
            .filter(item => (item.lang === 'en' ? 'en' : 'ja') === language)
            .map(item => {
                const record = reviewRecords[item.id]
                    ? normalizeReviewRecord(reviewRecords[item.id])
                    : null;
                const clear = clearStates[item.id] || {};
                return {
                    ...item,
                    record,
                    clear,
                    mastered: isMastered(clear)
                };
            });

        const due = candidates
            .filter(item => {
                return item.record
                    ? item.record.dueAt <= now
                    : item.clear?.needsReview === true;
            })
            .sort((left, right) => {
                const leftDue = left.record?.dueAt || 0;
                const rightDue = right.record?.dueAt || 0;
                return leftDue - rightDue;
            });

        const dueIds = new Set(due.map(item => item.id));
        const newWords = stableDailySort(
            candidates.filter(item => {
                return !dueIds.has(item.id) && !item.record && !item.mastered;
            }),
            dateKey
        );
        const reviewFallback = stableDailySort(
            candidates.filter(item => {
                return !dueIds.has(item.id) && item.mastered;
            }),
            `${dateKey}|review`
        );
        const weakFallback = stableDailySort(
            candidates.filter(item => {
                return !dueIds.has(item.id) && !item.mastered && item.record;
            }),
            `${dateKey}|weak`
        );

        let selected;
        if (reviewOnly) {
            selected = [...due, ...reviewFallback, ...weakFallback].slice(0, safeGoal);
        } else {
            const reviewTarget = Math.min(due.length, Math.max(2, Math.floor(safeGoal / 2)));
            selected = due.slice(0, reviewTarget);
            const selectedIds = new Set(selected.map(item => item.id));
            const fill = [...newWords, ...weakFallback, ...reviewFallback]
                .filter(item => !selectedIds.has(item.id));
            selected.push(...fill.slice(0, safeGoal - selected.length));
        }

        return {
            dateKey,
            goal: safeGoal,
            dueCount: due.length,
            newCount: newWords.length,
            indices: selected.map(item => item.index),
            wordIds: selected.map(item => item.id)
        };
    };

    return Object.freeze({
        DAY_MS,
        GOALS,
        clampGoal,
        localDateKey,
        isMastered,
        normalizeReviewRecord,
        rateReview,
        buildDailyPlan
    });
});
