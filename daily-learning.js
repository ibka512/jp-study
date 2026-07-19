(function () {
    'use strict';

    const CORE = globalThis.DailyLearningCore;
    const STORAGE_KEY = 'zhongriDailyLearningV1';
    const ONBOARDING_KEY = 'zhongriOnboardingV1';

    if (!CORE || typeof Model === 'undefined' || typeof Controller === 'undefined') {
        console.warn('[Daily Learning] 核心模块未加载');
        return;
    }

    const defaultState = () => ({
        version: 1,
        goal: 10,
        reviewRecords: {},
        days: {}
    });

    const readState = () => {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
            if (parsed && typeof parsed === 'object') {
                return {
                    ...defaultState(),
                    ...parsed,
                    goal: CORE.clampGoal(parsed.goal),
                    reviewRecords: parsed.reviewRecords && typeof parsed.reviewRecords === 'object'
                        ? parsed.reviewRecords
                        : {},
                    days: parsed.days && typeof parsed.days === 'object'
                        ? parsed.days
                        : {}
                };
            }
        } catch (error) {
            console.warn('[Daily Learning] 无法读取每日状态', error);
        }
        return defaultState();
    };

    let state = readState();
    let session = null;

    const saveState = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    };

    const getToday = () => {
        const key = CORE.localDateKey(Date.now());
        if (!state.days[key]) {
            state.days[key] = {
                completedIds: [],
                sessions: [],
                ratings: { again: 0, hard: 0, good: 0 }
            };
        }
        return { key, data: state.days[key] };
    };

    const getWords = () => Model.db.map((word, index) => ({
        id: Model.getWordId(word),
        index,
        lang: word.lang === 'en' ? 'en' : 'ja'
    }));

    const getPlan = reviewOnly => CORE.buildDailyPlan({
        words: getWords(),
        clearStates: Model.mtWordClears,
        reviewRecords: state.reviewRecords,
        language: Model.getCurrentLang(),
        goal: state.goal,
        now: Date.now(),
        reviewOnly
    });

    const setText = (id, text) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    };

    const renderWeek = () => {
        const container = document.getElementById('daily-week-strip');
        if (!container) return;
        const formatter = new Intl.DateTimeFormat('zh-CN', { weekday: 'short' });
        const today = new Date();
        container.innerHTML = '';

        for (let offset = 6; offset >= 0; offset--) {
            const date = new Date(today);
            date.setDate(today.getDate() - offset);
            const key = CORE.localDateKey(date);
            const done = (state.days[key]?.completedIds || []).length > 0;
            const node = document.createElement('div');
            node.className = `daily-week-day${done ? ' is-done' : ''}${offset === 0 ? ' is-today' : ''}`;
            node.innerHTML = `<span>${formatter.format(date).replace('周', '')}</span><b>${done ? '✓' : date.getDate()}</b>`;
            container.appendChild(node);
        }
    };

    const renderDashboard = () => {
        const plan = getPlan(false);
        const reviewPlan = getPlan(true);
        const { data } = getToday();
        const completed = new Set(data.completedIds || []).size;
        const goal = state.goal;
        const percent = Math.min(100, Math.round((completed / goal) * 100));
        const stats = Model.calculateStats();
        const hour = new Date().getHours();
        const greeting = hour < 11 ? '早上好' : hour < 18 ? '今天好' : '晚上好';

        setText('daily-greeting', `${greeting}，轻松学一小轮`);
        setText('daily-summary', completed >= goal
            ? '今天的目标完成了，想继续时再来一轮。'
            : `完成 ${goal} 个词，大约只需要 5 分钟。`);
        setText('daily-completed-count', completed);
        setText('daily-goal-count', goal);
        setText('daily-due-count', plan.dueCount);
        setText('daily-new-count', plan.newCount);
        setText('daily-review-button-count', reviewPlan.dueCount || reviewPlan.indices.length);
        setText('daily-streak-count', stats.streak || 0);
        setText('daily-language-label', Model.getCurrentLang() === 'en' ? '英语词书' : '日语词书');
        const ring = document.getElementById('daily-progress-ring');
        if (ring) {
            ring.style.setProperty('--daily-progress', `${percent * 3.6}deg`);
            ring.setAttribute('aria-label', `今日完成 ${completed}/${goal}`);
        }
        const startLabel = document.getElementById('daily-start-label');
        if (startLabel) startLabel.textContent = completed >= goal ? '再来一轮' : '开始今天的学习';
        document.querySelectorAll('[data-daily-goal]').forEach(button => {
            const active = Number(button.dataset.dailyGoal) === goal;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        const aiStatus = document.getElementById('daily-ai-status');
        if (aiStatus) {
            aiStatus.textContent = localStorage.getItem('deepseekApiKey')
                ? 'AI 工具已连接'
                : 'AI 可选，不影响学习';
        }
        renderWeek();
        saveState();
    };

    const openSettings = section => {
        const settingsNav = document.querySelector('.nav-item[data-target="tab-settings"]');
        settingsNav?.click();
        window.setTimeout(() => {
            document.querySelector(`[data-open-settings-section="${section}"]`)?.click();
        }, 50);
    };

    const applyStudyChrome = () => {
        const active = Boolean(session);
        document.body.classList.toggle('daily-session-active', active);
        document.getElementById('daily-session-controls')?.toggleAttribute('hidden', !active);
        document.getElementById('daily-detail-toggle')?.toggleAttribute('hidden', !active);
        document.getElementById('study-area')?.classList.remove('daily-details-open');
        if (!active) return;

        ['capsule-pendulum', 'capsule-filter-test', 'capsule-filter-judge', 'dual-track-ui', 'memory-test-ui']
            .forEach(id => document.getElementById(id)?.classList.add('hidden'));
        const current = Math.min(Model.state.currentIndex + 1, Model.state.studyQueue.length);
        setText('progress-text', `${current} / ${Model.state.studyQueue.length}`);
        setText('daily-session-prompt', session.reviewOnly ? '今天的复习' : '今天的小目标');
    };

    const showCompletion = () => {
        const overlay = document.getElementById('daily-complete-overlay');
        const ratings = session?.ratings || { again: 0, hard: 0, good: 0 };
        setText('daily-complete-total', session?.completedIds.size || 0);
        setText('daily-complete-good', ratings.good || 0);
        setText('daily-complete-review', (ratings.again || 0) + (ratings.hard || 0));
        overlay?.classList.add('active');
        overlay?.setAttribute('aria-hidden', 'false');
    };

    const finishSession = async () => {
        if (!session) return;
        const finished = session;
        const { key, data } = getToday();
        const completed = new Set(data.completedIds || []);
        finished.completedIds.forEach(id => completed.add(id));
        data.completedIds = [...completed];
        data.sessions.push({
            at: new Date().toISOString(),
            type: finished.reviewOnly ? 'review' : 'daily',
            count: finished.completedIds.size,
            ratings: finished.ratings
        });
        Object.keys(data.ratings).forEach(keyName => {
            data.ratings[keyName] += finished.ratings[keyName] || 0;
        });
        state.days[key] = data;
        saveState();

        const displayDate = new Date().toLocaleDateString('zh-CN');
        Model.records.unshift({
            date: displayDate,
            type: 'daily_session',
            group: finished.reviewOnly ? '今日复习' : '今日学习',
            count: finished.completedIds.size
        });
        await Promise.all([Model.saveRecords(), Model.saveClears()]);
        session = finished;
        document.body.classList.remove('daily-session-active');
        View.showPage('tab-home');
        View.renderDashboard();
        renderDashboard();
        showCompletion();
        session = null;
        applyStudyChrome();
    };

    const rateCurrent = async rating => {
        if (!session || Model.state.isAnimating) return;
        const index = Model.state.studyQueue[Model.state.currentIndex];
        const word = Model.db[index];
        if (!word) return;
        const id = Model.getWordId(word);
        state.reviewRecords[id] = CORE.rateReview(state.reviewRecords[id], rating, Date.now());
        session.completedIds.add(id);
        session.ratings[rating] += 1;

        const clear = Model.ensureClearState(word);
        if (rating === 'good') {
            clear.kanji = true;
            clear.kana = true;
            clear.meaning = true;
            clear.needsReview = false;
            Hardware.playSound('success');
            View.playStudyFeedback('correct');
        } else {
            clear.needsReview = true;
            if (rating === 'hard') clear.meaning = true;
            Hardware.playSound(rating === 'again' ? 'error' : 'click');
            if (rating === 'again') View.playStudyFeedback('wrong');
        }
        saveState();
        await Model.saveClears();
        Model.state.currentIndex += 1;
        if (Model.state.currentIndex >= Model.state.studyQueue.length) {
            await finishSession();
        } else {
            View.renderStudyCard('next');
        }
    };

    const startSession = reviewOnly => {
        const plan = getPlan(reviewOnly);
        if (!plan.indices.length) {
            showToast(reviewOnly ? '今天暂时没有需要复习的词' : '当前词书暂无可学习词汇');
            return;
        }
        session = {
            reviewOnly,
            plan,
            completedIds: new Set(),
            ratings: { again: 0, hard: 0, good: 0 }
        };
        Model.state.mode = 'pendulum';
        Model.state.studyQueue = [...plan.indices];
        Model.state.currentIndex = 0;
        Model.state.currentGroupKey = `daily|${plan.dateKey}|${reviewOnly ? 'review' : 'today'}`;
        Model.state.currentGroupLabel = reviewOnly ? '今日复习' : '今日学习';
        Model.state.uniqueWordCount = plan.indices.length;
        Model.state.initialQueueLength = plan.indices.length;
        Model.state.isAnimating = false;
        Model.state.comboCount = 0;
        const mode = document.getElementById('next-display-mode');
        if (mode) mode.value = 'all';
        View.showPage('study-area');
        View.renderStudyCard('none');
        applyStudyChrome();
        Hardware.vibrate(30);
    };

    const showOnboarding = () => {
        if (localStorage.getItem(ONBOARDING_KEY) === 'done') return;
        const overlay = document.getElementById('onboarding-overlay');
        overlay?.classList.add('active');
        overlay?.setAttribute('aria-hidden', 'false');
        document.querySelectorAll('[data-onboarding-lang]').forEach(button => {
            button.classList.toggle('active', button.dataset.onboardingLang === Model.getCurrentLang());
        });
        document.querySelectorAll('[data-onboarding-goal]').forEach(button => {
            button.classList.toggle('active', Number(button.dataset.onboardingGoal) === state.goal);
        });
    };

    const bindEvents = () => {
        document.getElementById('btn-start-today')?.addEventListener('click', () => startSession(false));
        document.getElementById('btn-start-review')?.addEventListener('click', () => startSession(true));
        document.getElementById('btn-open-learning-options')?.addEventListener('click', event => {
            const legacy = document.getElementById('legacy-learning-options');
            const open = legacy?.hasAttribute('hidden');
            legacy?.toggleAttribute('hidden', !open);
            event.currentTarget.setAttribute('aria-expanded', String(open));
            event.currentTarget.querySelector('.material-symbols-rounded').textContent = open ? 'expand_less' : 'tune';
            if (open) legacy?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        document.getElementById('btn-home-toolbox')?.addEventListener('click', () => openSettings('library'));
        document.querySelectorAll('[data-daily-rating]').forEach(button => {
            button.addEventListener('click', () => rateCurrent(button.dataset.dailyRating));
        });
        document.getElementById('daily-detail-toggle')?.addEventListener('click', event => {
            const area = document.getElementById('study-area');
            const open = area?.classList.toggle('daily-details-open');
            event.currentTarget.innerHTML = `<span class="material-symbols-rounded">${open ? 'expand_less' : 'menu_book'}</span>${open ? '收起例句' : '查看例句'}`;
        });
        document.getElementById('daily-complete-close')?.addEventListener('click', () => {
            const overlay = document.getElementById('daily-complete-overlay');
            overlay?.classList.remove('active');
            overlay?.setAttribute('aria-hidden', 'true');
        });
        document.getElementById('daily-complete-again')?.addEventListener('click', () => {
            const overlay = document.getElementById('daily-complete-overlay');
            overlay?.classList.remove('active');
            overlay?.setAttribute('aria-hidden', 'true');
            startSession(false);
        });
        document.getElementById('btn-exit-study')?.addEventListener('click', () => {
            session = null;
            applyStudyChrome();
        });
        document.querySelectorAll('[data-daily-goal]').forEach(button => {
            button.addEventListener('click', () => {
                state.goal = CORE.clampGoal(button.dataset.dailyGoal);
                saveState();
                renderDashboard();
                showToast(`每日目标已调整为 ${state.goal} 个词`);
            });
        });
        document.querySelectorAll('[data-onboarding-lang]').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('[data-onboarding-lang]').forEach(item => item.classList.remove('active'));
                button.classList.add('active');
            });
        });
        document.querySelectorAll('[data-onboarding-goal]').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('[data-onboarding-goal]').forEach(item => item.classList.remove('active'));
                button.classList.add('active');
            });
        });
        document.getElementById('onboarding-finish')?.addEventListener('click', () => {
            const lang = document.querySelector('[data-onboarding-lang].active')?.dataset.onboardingLang || 'ja';
            const goal = document.querySelector('[data-onboarding-goal].active')?.dataset.onboardingGoal || '10';
            state.goal = CORE.clampGoal(goal);
            Model.state.currentLangMode = lang;
            localStorage.setItem('langMode', lang);
            document.body.dataset.lang = lang;
            saveState();
            localStorage.setItem(ONBOARDING_KEY, 'done');
            const onboarding = document.getElementById('onboarding-overlay');
            onboarding?.classList.remove('active');
            onboarding?.setAttribute('aria-hidden', 'true');
            document.querySelectorAll('.book-card').forEach(card => card.classList.toggle('active', card.dataset.lang === lang));
            View.renderDashboard();
            View.updateWordbankUI();
            renderDashboard();
            showToast('准备好了，今天先学一小轮');
        });
        document.getElementById('btn-toolbox-manual')?.addEventListener('click', () => {
            document.querySelector('[data-import-mode="manual"]')?.click();
            document.querySelector('.import-card')?.scrollIntoView({ behavior: 'smooth' });
        });
        document.getElementById('btn-toolbox-ai')?.addEventListener('click', () => {
            if (!localStorage.getItem('deepseekApiKey')) {
                openSettings('ai');
                window.setTimeout(() => document.getElementById('setting-ai-key')?.focus(), 120);
                showToast('按提示填入密钥即可；AI 功能完全可选');
                return;
            }
            document.querySelector('[data-import-mode="ai"]')?.click();
            document.querySelector('.import-card')?.scrollIntoView({ behavior: 'smooth' });
        });
        document.getElementById('btn-toolbox-audit')?.addEventListener('click', () => {
            document.getElementById('btn-run-library-audit')?.click();
            document.querySelector('.library-audit-card')?.scrollIntoView({ behavior: 'smooth' });
        });
        document.addEventListener('keydown', event => {
            if (!session || event.repeat) return;
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
            const rating = { '1': 'again', '2': 'hard', '3': 'good' }[event.key];
            if (rating) {
                event.preventDefault();
                rateCurrent(rating);
            }
        });
    };

    const originalRenderDashboard = View.renderDashboard.bind(View);
    View.renderDashboard = function () {
        const result = originalRenderDashboard();
        renderDashboard();
        return result;
    };

    const originalRenderStudyCard = View.renderStudyCard.bind(View);
    View.renderStudyCard = function (animation = 'none') {
        const result = originalRenderStudyCard(animation);
        if (session) {
            window.requestAnimationFrame(applyStudyChrome);
            window.setTimeout(applyStudyChrome, 420);
        }
        return result;
    };

    const originalControllerInit = Controller.init.bind(Controller);
    Controller.init = async function () {
        await originalControllerInit();
        bindEvents();
        renderDashboard();
        window.setTimeout(showOnboarding, 220);
    };

    globalThis.DailyLearning = Object.freeze({
        getPlan,
        startSession,
        renderDashboard,
        readState: () => state
    });
})();
