(() => {
  'use strict';

  const LEGACY_DAILY_REMINDER_ID = 21001;
  const TEST_REMINDER_ID = 21002;
  const SNOOZE_REMINDER_ID = 21003;
  const CHANNEL_ID = 'study-reminders';
  const ACTION_TYPE_ID = 'STUDY_REMINDER_ACTIONS';
  const START_REVIEW_ACTION_ID = 'START_REVIEW';
  const SNOOZE_ACTION_ID = 'SNOOZE_30';
  const SETTINGS_STORAGE_KEY = 'nativeStudyReminderSettingsV2';
  const LEGACY_STORAGE = {
    enabled: 'nativeStudyReminderEnabled',
    time: 'nativeStudyReminderTime'
  };
  const HORIZON_DAYS = 7;

  const capacitor = window.Capacitor;
  const planner = window.ZhongriNotificationPlanner || null;
  const isAndroidApp = Boolean(
    capacitor &&
    typeof capacitor.isNativePlatform === 'function' &&
    capacitor.isNativePlatform() &&
    typeof capacitor.getPlatform === 'function' &&
    capacitor.getPlatform() === 'android'
  );
  const notifications = capacitor?.Plugins?.LocalNotifications || null;
  const nativeApp = capacitor?.Plugins?.App || null;
  const plannedBaseId = planner?.PLANNED_NOTIFICATION_BASE_ID || 21100;
  const plannedNotificationIds = Array.from(
    { length: HORIZON_DAYS },
    (_, index) => plannedBaseId + index
  );

  let backNavigationRegistered = false;
  let lifecycleRegistered = false;
  let notificationActionsRegistered = false;
  let reminderUi = null;
  let syncQueue = Promise.resolve();
  let dataChangeTimer = 0;

  const showMessage = message => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 2600);
  };

  const waitForAppReady = async () => {
    if (document.readyState !== 'complete') {
      await new Promise(resolve => {
        window.addEventListener('load', resolve, { once: true });
      });
    }
    if (window.ZhongriAppReady) {
      await window.ZhongriAppReady;
    }
  };

  const normalizeSettings = raw => {
    if (planner?.normalizeSettings) {
      return planner.normalizeSettings(raw);
    }
    return {
      enabled: raw?.enabled === true,
      mode: raw?.mode === 'fixed' ? 'fixed' : 'smart',
      dueEnabled: raw?.dueEnabled !== false,
      rescueEnabled: raw?.rescueEnabled !== false,
      reminderTime: raw?.reminderTime || '20:00',
      rescueTime: raw?.rescueTime || '21:30',
      weekdays: Array.isArray(raw?.weekdays)
        ? raw.weekdays
        : [1, 2, 3, 4, 5, 6, 0],
      quietEnabled: raw?.quietEnabled !== false,
      quietStart: raw?.quietStart || '22:30',
      quietEnd: raw?.quietEnd || '07:30',
      exact: raw?.exact === true
    };
  };

  const readSettings = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(SETTINGS_STORAGE_KEY) || 'null'
      );
      if (saved && typeof saved === 'object') {
        return normalizeSettings(saved);
      }
    } catch (error) {
      console.warn('读取学习提醒设置失败', error);
    }

    return normalizeSettings({
      enabled: localStorage.getItem(LEGACY_STORAGE.enabled) === 'true',
      reminderTime:
        localStorage.getItem(LEGACY_STORAGE.time) || '20:00'
    });
  };

  const saveSettings = raw => {
    const settings = normalizeSettings(raw);
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(settings)
    );
    localStorage.setItem(
      LEGACY_STORAGE.enabled,
      String(settings.enabled)
    );
    localStorage.setItem(
      LEGACY_STORAGE.time,
      settings.reminderTime
    );
    return settings;
  };

  const ensurePermission = async () => {
    if (!notifications) return false;
    let status = await notifications.checkPermissions();
    if (status.display !== 'granted') {
      status = await notifications.requestPermissions();
    }
    return status.display === 'granted';
  };

  const getExactAlarmPermission = async () => {
    if (!notifications?.checkExactNotificationSetting) {
      return 'granted';
    }
    const status = await notifications.checkExactNotificationSetting();
    return status.exact_alarm || 'denied';
  };

  const requestExactAlarmPermission = async () => {
    let status = await getExactAlarmPermission();
    if (
      status !== 'granted' &&
      notifications?.changeExactNotificationSetting
    ) {
      await notifications.changeExactNotificationSetting();
      status = await getExactAlarmPermission();
    }
    return status === 'granted';
  };

  const createReminderChannel = async () => {
    if (!notifications?.createChannel) return;
    await notifications.createChannel({
      id: CHANNEL_ID,
      name: '学习提醒',
      description: '钟日每日学习与复习提醒',
      importance: 4,
      visibility: 1,
      vibration: true
    });
  };

  const registerNotificationActions = async () => {
    if (
      notificationActionsRegistered ||
      !notifications?.registerActionTypes
    ) {
      return;
    }
    notificationActionsRegistered = true;
    await notifications.registerActionTypes({
      types: [{
        id: ACTION_TYPE_ID,
        actions: [
          {
            id: START_REVIEW_ACTION_ID,
            title: '开始复习'
          },
          {
            id: SNOOZE_ACTION_ID,
            title: '30 分钟后提醒'
          }
        ]
      }]
    });
  };

  const cancelNotifications = async ids => {
    if (!notifications || ids.length === 0) return;
    await notifications.cancel({
      notifications: ids.map(id => ({ id }))
    });
  };

  const cancelPlannedReminders = async ({ includeSnooze = false } = {}) => {
    const ids = [
      LEGACY_DAILY_REMINDER_ID,
      ...plannedNotificationIds
    ];
    if (includeSnooze) ids.push(SNOOZE_REMINDER_ID);
    await cancelNotifications(ids);
  };

  const openReviewHome = async () => {
    try {
      await waitForAppReady();
    } catch (error) {
      console.warn('等待学习数据加载失败', error);
    }

    document.querySelector('.nav-item[data-target="tab-home"]')?.click();
    window.setTimeout(() => {
      const due = Number(
        document.getElementById('fsrs-due-count')?.textContent || 0
      );
      if (due > 0) {
        window.ZhongriReminderData?.startReview?.();
        showMessage(`开始复习 ${due} 个到期维度`);
      } else {
        showMessage('今天暂时没有到期内容，可以自由学习');
      }
    }, 380);
  };

  const scheduleSnooze = async notification => {
    if (!notifications) return;
    await createReminderChannel();
    await cancelNotifications([SNOOZE_REMINDER_ID]);
    await notifications.schedule({
      notifications: [{
        id: SNOOZE_REMINDER_ID,
        title: notification?.title || '钟日 · 稍后复习',
        body:
          notification?.body ||
          '休息结束了，继续完成今天的短复习吧。',
        channelId: CHANNEL_ID,
        actionTypeId: ACTION_TYPE_ID,
        schedule: {
          at: new Date(Date.now() + 30 * 60 * 1000)
        },
        extra: {
          ...(notification?.extra || {}),
          kind: 'snooze'
        }
      }]
    });
    showMessage('已推迟 30 分钟');
  };

  const handleNotificationAction = async action => {
    if (action?.actionId === SNOOZE_ACTION_ID) {
      await scheduleSnooze(action.notification);
      return;
    }
    await openReviewHome();
  };

  const closeTopLayer = () => {
    const rootReview = document.getElementById('root-review-overlay');
    if (rootReview?.classList.contains('active')) {
      document.getElementById('root-review-close')?.click();
      return true;
    }

    const activeModals = Array.from(
      document.querySelectorAll('.modal-overlay.active')
    );
    const activeModal = activeModals[activeModals.length - 1];

    if (activeModal) {
      const closeButtonByModal = {
        'detail-overlay': '#detail-close',
        'ai-word-collector-overlay': '#ai-word-collector-close',
        'ai-quiz-overlay': '#ai-quiz-close'
      };
      const closeSelector = closeButtonByModal[activeModal.id];
      const closeButton = closeSelector
        ? document.querySelector(closeSelector)
        : null;

      if (closeButton) {
        closeButton.click();
      } else if (
        activeModal.id &&
        typeof window.toggleModal === 'function'
      ) {
        window.toggleModal(activeModal.id, false);
        window.ZhongriHaptics?.trigger?.('navigation');
      } else {
        activeModal.classList.remove('active');
        activeModal.setAttribute('aria-hidden', 'true');
        document.body.classList.toggle(
          'modal-open',
          Boolean(document.querySelector('.modal-overlay.active'))
        );
        window.ZhongriHaptics?.trigger?.('navigation');
      }
      return true;
    }

    const studyArea = document.getElementById('study-area');
    if (studyArea && !studyArea.classList.contains('hidden')) {
      document.getElementById('btn-exit-study')?.click();
      return true;
    }

    const aiChatView = document.getElementById('ai-chat-view');
    if (aiChatView && !aiChatView.classList.contains('hidden')) {
      document.getElementById('btn-ai-chat-back')?.click();
      return true;
    }

    const activeSettingsSection = document.querySelector(
      '#tab-settings.active .settings-section:not([hidden])'
    );
    if (activeSettingsSection) {
      activeSettingsSection
        .querySelector('[data-settings-back]')
        ?.click();
      return true;
    }

    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab && activeTab.id !== 'tab-home') {
      document
        .querySelector('.nav-item[data-target="tab-home"]')
        ?.click();
      return true;
    }

    return false;
  };

  const registerAndroidBackNavigation = async () => {
    if (
      backNavigationRegistered ||
      !isAndroidApp ||
      !nativeApp?.addListener
    ) {
      return;
    }

    backNavigationRegistered = true;
    await nativeApp.addListener('backButton', async () => {
      if (closeTopLayer()) return;

      window.ZhongriHaptics?.trigger?.('navigation');
      try {
        await nativeApp.minimizeApp();
      } catch (error) {
        console.warn('应用进入后台失败', error);
      }
    });
  };

  const notificationFromPlan = (item, exactGranted) => {
    const schedule = {
      at: new Date(item.at)
    };
    if (exactGranted) {
      schedule.allowWhileIdle = true;
    }

    return {
      id: item.id,
      title: item.title,
      body: item.body,
      channelId: CHANNEL_ID,
      actionTypeId: ACTION_TYPE_ID,
      schedule,
      extra: item.extra
    };
  };

  const syncScheduledReminders = async rawSettings => {
    const settings = normalizeSettings(rawSettings || readSettings());
    if (!isAndroidApp || !notifications || !planner) {
      return {
        settings,
        plan: [],
        permission: 'unavailable',
        exactGranted: false
      };
    }

    await waitForAppReady();
    await cancelPlannedReminders({
      includeSnooze: !settings.enabled
    });

    if (!settings.enabled) {
      return {
        settings,
        plan: [],
        permission: 'granted',
        exactGranted: false
      };
    }

    const permission = await notifications.checkPermissions();
    if (permission.display !== 'granted') {
      return {
        settings,
        plan: [],
        permission: permission.display,
        exactGranted: false
      };
    }

    await createReminderChannel();
    await registerNotificationActions();

    const exactGranted =
      settings.exact &&
      await getExactAlarmPermission() === 'granted';
    const snapshot =
      window.ZhongriReminderData?.getSnapshot?.() || {};
    const plan = planner.planNotifications({
      now: new Date(),
      settings,
      cards: snapshot.cards || [],
      studyDates: snapshot.studyDates || [],
      streak: snapshot.streak || 0,
      horizonDays: HORIZON_DAYS
    });

    if (plan.length > 0) {
      await notifications.schedule({
        notifications: plan.map(item => {
          return notificationFromPlan(item, exactGranted);
        })
      });
    }

    return {
      settings,
      plan,
      permission: 'granted',
      exactGranted
    };
  };

  const formatNextReminder = item => {
    const date = new Date(item.at);
    const kindLabel = {
      due: '到期复习',
      rescue: '未学习补救',
      fixed: '固定学习'
    }[item.kind] || '学习';
    const at = new Intl.DateTimeFormat('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
    return `下一次：${at} · ${kindLabel}`;
  };

  const renderScheduleState = result => {
    if (!reminderUi) return;
    const { settings, plan, permission, exactGranted } = result;
    reminderUi.card.dataset.mode = settings.mode;
    reminderUi.card.dataset.rescueEnabled =
      String(settings.rescueEnabled);

    if (!settings.enabled) {
      reminderUi.status.textContent = '提醒尚未开启';
      reminderUi.next.textContent = '开启后会根据学习进度安排提醒';
      return;
    }
    if (permission !== 'granted') {
      reminderUi.status.textContent = '通知权限未开启';
      reminderUi.next.textContent = '允许系统通知后才能安排提醒';
      return;
    }

    const modeLabel = settings.mode === 'smart' ? '智能提醒' : '固定提醒';
    const timingLabel = settings.exact
      ? exactGranted
        ? '准时'
        : '准时权限未开启，按系统调度'
      : '按系统调度';
    reminderUi.status.textContent =
      `${modeLabel} · 已安排 ${plan.length} 次 · ${timingLabel}`;
    reminderUi.next.textContent = plan.length > 0
      ? formatNextReminder(plan[0])
      : '未来 7 天暂无需要提醒的内容';
  };

  const requestReminderSync = settings => {
    syncQueue = syncQueue
      .catch(() => {})
      .then(() => syncScheduledReminders(settings))
      .then(result => {
        renderScheduleState(result);
        return result;
      })
      .catch(error => {
        console.warn('同步学习提醒失败', error);
        if (reminderUi) {
          reminderUi.status.textContent = '提醒同步失败，请稍后重试';
        }
        throw error;
      });
    return syncQueue;
  };

  const readFormSettings = () => {
    const weekdays = Array.from(
      reminderUi.card.querySelectorAll(
        'input[name="study-reminder-weekday"]:checked'
      )
    ).map(input => Number(input.value));
    return normalizeSettings({
      enabled: reminderUi.enabled.checked,
      mode: reminderUi.mode.value,
      dueEnabled: reminderUi.dueEnabled.checked,
      rescueEnabled: reminderUi.rescueEnabled.checked,
      reminderTime: reminderUi.time.value,
      rescueTime: reminderUi.rescueTime.value,
      weekdays,
      quietEnabled: reminderUi.quietEnabled.checked,
      quietStart: reminderUi.quietStart.value,
      quietEnd: reminderUi.quietEnd.value,
      exact: reminderUi.exact.checked
    });
  };

  const renderForm = rawSettings => {
    const settings = normalizeSettings(rawSettings);
    reminderUi.enabled.checked = settings.enabled;
    reminderUi.mode.value = settings.mode;
    reminderUi.dueEnabled.checked = settings.dueEnabled;
    reminderUi.rescueEnabled.checked = settings.rescueEnabled;
    reminderUi.time.value = settings.reminderTime;
    reminderUi.rescueTime.value = settings.rescueTime;
    reminderUi.quietEnabled.checked = settings.quietEnabled;
    reminderUi.quietStart.value = settings.quietStart;
    reminderUi.quietEnd.value = settings.quietEnd;
    reminderUi.exact.checked = settings.exact;
    reminderUi.card.dataset.mode = settings.mode;
    reminderUi.card.dataset.rescueEnabled =
      String(settings.rescueEnabled);
    reminderUi.card
      .querySelectorAll('input[name="study-reminder-weekday"]')
      .forEach(input => {
        input.checked = settings.weekdays.includes(Number(input.value));
      });
  };

  const saveFormAndSync = async message => {
    const settings = saveSettings(readFormSettings());
    renderForm(settings);
    await requestReminderSync(settings);
    if (message) showMessage(message);
  };

  const bindReminderControls = () => {
    reminderUi.enabled.addEventListener('change', async () => {
      reminderUi.enabled.disabled = true;
      try {
        if (reminderUi.enabled.checked) {
          const allowed = await ensurePermission();
          if (!allowed) {
            reminderUi.enabled.checked = false;
            saveSettings(readFormSettings());
            renderScheduleState({
              settings: readFormSettings(),
              plan: [],
              permission: 'denied',
              exactGranted: false
            });
            showMessage('需要通知权限才能后台提醒');
            return;
          }
          await saveFormAndSync('学习提醒已开启');
        } else {
          await saveFormAndSync('学习提醒已关闭');
        }
      } catch (error) {
        console.warn('更新学习提醒失败', error);
        reminderUi.enabled.checked = !reminderUi.enabled.checked;
        reminderUi.status.textContent = '设置失败，请稍后重试';
      } finally {
        reminderUi.enabled.disabled = false;
      }
    });

    reminderUi.exact.addEventListener('change', async () => {
      reminderUi.exact.disabled = true;
      try {
        if (reminderUi.exact.checked) {
          const granted = await requestExactAlarmPermission();
          if (!granted) {
            reminderUi.exact.checked = false;
            showMessage('未开启准时提醒权限，继续使用系统调度');
          }
        }
        await saveFormAndSync(
          reminderUi.exact.checked
            ? '准时提醒已开启'
            : '已改为省电的系统调度'
        );
      } catch (error) {
        console.warn('修改准时提醒失败', error);
        reminderUi.exact.checked = false;
        await saveFormAndSync();
      } finally {
        reminderUi.exact.disabled = false;
      }
    });

    const standardControls = [
      reminderUi.mode,
      reminderUi.dueEnabled,
      reminderUi.rescueEnabled,
      reminderUi.time,
      reminderUi.rescueTime,
      reminderUi.quietEnabled,
      reminderUi.quietStart,
      reminderUi.quietEnd
    ];
    standardControls.forEach(control => {
      control.addEventListener('change', async () => {
        await saveFormAndSync('提醒计划已更新');
      });
    });

    reminderUi.card
      .querySelectorAll('input[name="study-reminder-weekday"]')
      .forEach(input => {
        input.addEventListener('change', async () => {
          const selected = reminderUi.card.querySelectorAll(
            'input[name="study-reminder-weekday"]:checked'
          );
          if (selected.length === 0) {
            input.checked = true;
            showMessage('至少保留一个提醒日');
            return;
          }
          await saveFormAndSync('提醒日期已更新');
        });
      });

    reminderUi.testButton.addEventListener('click', async () => {
      reminderUi.testButton.disabled = true;
      try {
        const allowed = await ensurePermission();
        if (!allowed) {
          reminderUi.status.textContent = '未获得通知权限';
          return;
        }
        await createReminderChannel();
        await registerNotificationActions();
        await cancelNotifications([TEST_REMINDER_ID]);
        await notifications.schedule({
          notifications: [{
            id: TEST_REMINDER_ID,
            title: '钟日 · 提醒测试',
            body: '后台提醒工作正常，可以从通知直接开始复习。',
            channelId: CHANNEL_ID,
            actionTypeId: ACTION_TYPE_ID,
            schedule: {
              at: new Date(Date.now() + 5000)
            },
            extra: {
              route: 'review',
              kind: 'test'
            }
          }]
        });
        reminderUi.status.textContent = '测试提醒将在 5 秒后出现';
        showMessage('请将应用切到后台，等待 5 秒');
      } catch (error) {
        console.warn('测试提醒失败', error);
        reminderUi.status.textContent =
          '测试失败，请检查系统通知权限';
      } finally {
        window.setTimeout(() => {
          reminderUi.testButton.disabled = false;
        }, 5000);
      }
    });
  };

  const registerLifecycleSync = async () => {
    if (
      lifecycleRegistered ||
      !isAndroidApp ||
      !nativeApp?.addListener
    ) {
      return;
    }
    lifecycleRegistered = true;
    await nativeApp.addListener('appStateChange', state => {
      if (state.isActive) {
        requestReminderSync(readSettings()).catch(() => {});
      }
    });
  };

  const initialize = async () => {
    await registerAndroidBackNavigation();

    const card = document.getElementById('native-reminder-card');
    if (!card) return;

    reminderUi = {
      card,
      enabled: document.getElementById('setting-study-reminder-enabled'),
      mode: document.getElementById('setting-study-reminder-mode'),
      dueEnabled: document.getElementById('setting-study-due-enabled'),
      rescueEnabled:
        document.getElementById('setting-study-rescue-enabled'),
      time: document.getElementById('setting-study-reminder-time'),
      rescueTime:
        document.getElementById('setting-study-rescue-time'),
      quietEnabled:
        document.getElementById('setting-study-quiet-enabled'),
      quietStart:
        document.getElementById('setting-study-quiet-start'),
      quietEnd:
        document.getElementById('setting-study-quiet-end'),
      exact: document.getElementById('setting-study-reminder-exact'),
      testButton: document.getElementById('btn-test-study-reminder'),
      status: document.getElementById('study-reminder-status'),
      next: document.getElementById('study-reminder-next'),
      platformBadge: document.getElementById('native-platform-badge')
    };

    if (Object.values(reminderUi).some(value => !value)) return;

    const settings = readSettings();
    renderForm(settings);

    if (!isAndroidApp || !notifications || !planner) {
      card.classList.add('is-web');
      reminderUi.platformBadge.textContent = '网页版';
      reminderUi.status.textContent =
        '安装 Android App 后可使用后台学习提醒';
      reminderUi.next.textContent = '网页版暂不支持系统后台通知';
      card
        .querySelectorAll('input, select, button')
        .forEach(control => {
          control.disabled = true;
        });
      return;
    }

    card.classList.add('is-native');
    reminderUi.platformBadge.textContent = 'Android App';

    try {
      await registerNotificationActions();
      await notifications.addListener(
        'localNotificationActionPerformed',
        handleNotificationAction
      );
      await registerLifecycleSync();
      await requestReminderSync(settings);
    } catch (error) {
      console.warn('原生提醒初始化失败', error);
      reminderUi.status.textContent =
        '提醒初始化失败，请重新打开应用';
    }

    bindReminderControls();

    window.addEventListener('zhongri-study-data-changed', () => {
      window.clearTimeout(dataChangeTimer);
      dataChangeTimer = window.setTimeout(() => {
        cancelNotifications([SNOOZE_REMINDER_ID])
          .then(() => requestReminderSync(readSettings()))
          .catch(() => {});
      }, 500);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, {
      once: true
    });
  } else {
    initialize();
  }
})();
