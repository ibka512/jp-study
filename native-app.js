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

  const initialize = async () => {
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
        await scheduleDailyReminder(savedTime);
        status.textContent = `已开启 · 每天 ${savedTime} 提醒`;
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
          await scheduleDailyReminder(timeInput.value);
          localStorage.setItem(STORAGE.enabled, 'true');
          status.textContent = `已开启 · 每天 ${timeInput.value} 提醒`;
          showMessage('每日学习提醒已开启');
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
        await scheduleDailyReminder(time);
        status.textContent = `已开启 · 每天 ${time} 提醒`;
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
