(() => {
  'use strict';

  const DAILY_REMINDER_ID = 21001;
  const TEST_REMINDER_ID = 21002;
  const CHANNEL_ID = 'study-reminders';
  const STORAGE = {
    enabled: 'nativeStudyReminderEnabled',
    time: 'nativeStudyReminderTime'
  };

  const capacitor = window.Capacitor;
  const isAndroidApp = Boolean(
    capacitor &&
    typeof capacitor.isNativePlatform === 'function' &&
    capacitor.isNativePlatform() &&
    typeof capacitor.getPlatform === 'function' &&
    capacitor.getPlatform() === 'android'
  );
  const notifications = capacitor?.Plugins?.LocalNotifications || null;
  const nativeApp = capacitor?.Plugins?.App || null;
  let backNavigationRegistered = false;

  const showMessage = message => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 2600);
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
    if (!notifications?.checkExactNotificationSetting) return 'granted';
    const status = await notifications.checkExactNotificationSetting();
    return status.exact_alarm || 'denied';
  };

  const requestExactAlarmPermission = async () => {
    let status = await getExactAlarmPermission();
    if (status !== 'granted' && notifications?.changeExactNotificationSetting) {
      const result = await notifications.changeExactNotificationSetting();
      status = result.exact_alarm || 'denied';
    }
    return status === 'granted';
  };

  const reminderStatusText = (time, isExact) => {
    return isExact
      ? `已开启 · 每天 ${time} 准时提醒`
      : `已开启 · 每天约 ${time} 提醒（受系统调度影响）`;
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

  const cancelDailyReminder = async () => {
    if (!notifications) return;
    await notifications.cancel({
      notifications: [{ id: DAILY_REMINDER_ID }]
    });
  };

  const scheduleDailyReminder = async time => {
    const [hour, minute] = time.split(':').map(Number);
    await cancelDailyReminder();
    await notifications.schedule({
      notifications: [{
        id: DAILY_REMINDER_ID,
        title: '钟日 · 今日学习',
        body: '花几分钟复习一下，让记忆保持清晰。',
        channelId: CHANNEL_ID,
        schedule: {
          on: { hour, minute },
          allowWhileIdle: true
        },
        extra: { route: 'review' }
      }]
    });
  };

  const openReviewHome = () => {
    document.querySelector('.nav-item[data-target="tab-home"]')?.click();
    window.setTimeout(() => {
      const due = Number(document.getElementById('fsrs-due-count')?.textContent || 0);
      showMessage(due > 0 ? `今天有 ${due} 个维度待复习` : '今天暂时没有待复习内容');
    }, 280);
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
      if (closeTopLayer()) {
        return;
      }

      window.ZhongriHaptics?.trigger?.('navigation');
      try {
        await nativeApp.minimizeApp();
      } catch (error) {
        console.warn('应用进入后台失败', error);
      }
    });
  };

  const initialize = async () => {
    await registerAndroidBackNavigation();

    const card = document.getElementById('native-reminder-card');
    const enabledInput = document.getElementById('setting-study-reminder-enabled');
    const timeInput = document.getElementById('setting-study-reminder-time');
    const testButton = document.getElementById('btn-test-study-reminder');
    const status = document.getElementById('study-reminder-status');
    const platformBadge = document.getElementById('native-platform-badge');

    if (!card || !enabledInput || !timeInput || !testButton || !status) return;

    const savedTime = localStorage.getItem(STORAGE.time) || '20:00';
    const savedEnabled = localStorage.getItem(STORAGE.enabled) === 'true';
    timeInput.value = savedTime;
    enabledInput.checked = savedEnabled;

    if (!isAndroidApp || !notifications) {
      card.classList.add('is-web');
      platformBadge.textContent = '网页版';
      status.textContent = '安装 Android App 后可使用后台学习提醒';
      enabledInput.disabled = true;
      timeInput.disabled = true;
      testButton.disabled = true;
      return;
    }

    card.classList.add('is-native');
    platformBadge.textContent = 'Android App';

    try {
      await createReminderChannel();
      const permission = await notifications.checkPermissions();
      if (savedEnabled && permission.display === 'granted') {
        const isExact = await getExactAlarmPermission() === 'granted';
        await scheduleDailyReminder(savedTime);
        status.textContent = reminderStatusText(savedTime, isExact);
      } else if (savedEnabled) {
        enabledInput.checked = false;
        localStorage.setItem(STORAGE.enabled, 'false');
        status.textContent = '通知权限已关闭，请重新开启提醒';
      } else {
        status.textContent = '提醒尚未开启';
      }

      await notifications.addListener('localNotificationActionPerformed', openReviewHome);
    } catch (error) {
      console.warn('原生提醒初始化失败', error);
      status.textContent = '提醒初始化失败，请重新打开应用';
    }

    enabledInput.addEventListener('change', async () => {
      enabledInput.disabled = true;
      try {
        if (enabledInput.checked) {
          const allowed = await ensurePermission();
          if (!allowed) {
            enabledInput.checked = false;
            localStorage.setItem(STORAGE.enabled, 'false');
            status.textContent = '未获得通知权限';
            showMessage('需要通知权限才能后台提醒');
            return;
          }
          await createReminderChannel();
          const isExact = await requestExactAlarmPermission();
          await scheduleDailyReminder(timeInput.value);
          localStorage.setItem(STORAGE.enabled, 'true');
          status.textContent = reminderStatusText(timeInput.value, isExact);
          showMessage(isExact ? '每日准时提醒已开启' : '每日提醒已开启，时间可能略有延迟');
        } else {
          await cancelDailyReminder();
          localStorage.setItem(STORAGE.enabled, 'false');
          status.textContent = '提醒尚未开启';
          showMessage('每日学习提醒已关闭');
        }
      } catch (error) {
        console.warn('更新学习提醒失败', error);
        enabledInput.checked = !enabledInput.checked;
        status.textContent = '设置失败，请稍后重试';
      } finally {
        enabledInput.disabled = false;
      }
    });

    timeInput.addEventListener('change', async () => {
      const time = timeInput.value || '20:00';
      localStorage.setItem(STORAGE.time, time);
      if (!enabledInput.checked) return;
      try {
        const isExact = await getExactAlarmPermission() === 'granted';
        await scheduleDailyReminder(time);
        status.textContent = reminderStatusText(time, isExact);
        showMessage(`提醒时间已改为 ${time}`);
      } catch (error) {
        console.warn('修改提醒时间失败', error);
        status.textContent = '修改时间失败，请稍后重试';
      }
    });

    testButton.addEventListener('click', async () => {
      testButton.disabled = true;
      try {
        const allowed = await ensurePermission();
        if (!allowed) {
          status.textContent = '未获得通知权限';
          return;
        }
        await createReminderChannel();
        await notifications.cancel({
          notifications: [{ id: TEST_REMINDER_ID }]
        });
        await notifications.schedule({
          notifications: [{
            id: TEST_REMINDER_ID,
            title: '钟日 · 提醒测试',
            body: '后台提醒工作正常，现在可以安心去学习了。',
            channelId: CHANNEL_ID,
            schedule: {
              at: new Date(Date.now() + 5000),
              allowWhileIdle: true
            },
            extra: { route: 'review' }
          }]
        });
        status.textContent = '测试提醒将在 5 秒后出现';
        showMessage('请将应用切到后台，等待 5 秒');
      } catch (error) {
        console.warn('测试提醒失败', error);
        status.textContent = '测试失败，请检查系统通知权限';
      } finally {
        window.setTimeout(() => {
          testButton.disabled = false;
        }, 5000);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
