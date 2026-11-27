(() => {
  'use strict';

  const STORAGE_PREFIX = 'zhongri-root-review-v1:';
  const state = {
    items: [],
    decisions: {},
    index: 0,
    batch: 'latest',
    report: null,
    loadError: false,
    previousFocus: null,
  };

  const $ = id => document.getElementById(id);
  const haptic = (type, fallbackMs = 18) => {
    if (window.ZhongriHaptics?.isEnabled?.() === false) return;
    if (window.ZhongriHaptics?.trigger) window.ZhongriHaptics.trigger(type);
    else if (typeof Hardware !== 'undefined' && Hardware.vibrate) Hardware.vibrate(fallbackMs);
    else if (navigator.vibrate) navigator.vibrate(fallbackMs);
  };
  const toast = message => {
    if (typeof showToast === 'function') showToast(message);
  };
  const wordMap = () => new Map(
    (typeof DefaultEnglishWords === 'undefined' ? [] : DefaultEnglishWords)
      .map(word => [String(word.word || ''), word])
  );

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
    })[char]);
  }

  function storageKey() {
    return `${STORAGE_PREFIX}${state.batch}`;
  }

  function save() {
    localStorage.setItem(storageKey(), JSON.stringify(state.decisions));
    updateEntrySummary();
  }

  function restore() {
    try {
      state.decisions = JSON.parse(localStorage.getItem(storageKey()) || '{}');
    } catch (_error) {
      state.decisions = {};
    }
  }

  function normalizeSuggestions(report) {
    const words = wordMap();
    const source = Array.isArray(report.suggestions) && report.suggestions.length
      ? report.suggestions
      : (Array.isArray(report.samples) ? report.samples : []);
    return source
      .map((item, index) => {
        const word = words.get(String(item.word || '')) || {};
        return {
          id: String(item.id || word._id || `root-${index}`),
          word: String(item.word || word.word || ''),
          meaning: String(item.meaning || word.meaning || '暂无释义'),
          level: String(item.level || word.level || '英语'),
          roots: String(item.roots || ''),
          recommendation: String(item.recommendation || (item.roots ? 'accept' : 'hide')),
          publishedReview: String(word.rootsReview || ''),
        };
      })
      .filter(item => item.word);
  }

  async function loadReport() {
    if (window.ZhongriWordbankLoader?.loadLanguage) {
      try {
        await window.ZhongriWordbankLoader.loadLanguage('en');
      } catch (_error) {}
    }
    const response = await fetch('./reports/root-generation-latest.json');
    if (!response.ok) throw new Error('审核报告读取失败');
    const report = await response.json();
    state.loadError = false;
    state.report = report;
    state.batch = `${report.level || 'EN'}-${report.generated_at || 'latest'}`;
    state.items = normalizeSuggestions(report);
    restore();

    // 已经由人工清单发布过的结果也显示为已处理，方便回看。
    state.items.forEach(item => {
      if (state.decisions[item.id]) return;
      if (item.publishedReview === 'human') {
        state.decisions[item.id] = { decision: 'accept', roots: item.roots };
      } else if (item.publishedReview === 'human-rejected') {
        state.decisions[item.id] = { decision: 'hide', roots: item.roots };
      }
    });
    save();
    updateEntrySummary();
  }

  function decidedCount() {
    return state.items.filter(item => ['accept', 'hide'].includes(state.decisions[item.id]?.decision)).length;
  }

  function updateEntrySummary() {
    if ($('root-review-entry-total')) $('root-review-entry-total').textContent = state.items.length || '—';
    if ($('root-review-entry-done')) $('root-review-entry-done').textContent = state.items.length ? decidedCount() : '—';
  }

  function parseRoots(value) {
    return String(value || '').split('-').map(part => {
      const match = part.trim().match(/^([^()]+)\((.+)\)$/);
      return match ? { text: match[1].trim(), meaning: match[2].trim() } : { text: part.trim(), meaning: '' };
    }).filter(part => part.text);
  }

  function renderParts(value) {
    const parts = parseRoots(value);
    $('root-review-parts').innerHTML = parts.length
      ? parts.map((part, index) => `${index ? '<span class="root-review-plus">+</span>' : ''}<span class="root-review-part"><b>${escapeHTML(part.text)}</b><small>${escapeHTML(part.meaning || '未解释')}</small></span>`).join('')
      : '<span class="root-review-no-split">候选建议：该词不显示词根拆分</span>';
  }

  function render() {
    const total = state.items.length;
    const done = decidedCount();
    $('root-review-progress-text').textContent = `${done} / ${total}`;
    $('root-review-progress-bar').style.width = `${total ? (done / total) * 100 : 0}%`;

    if (!total) {
      $('root-review-loading').innerHTML = state.loadError
        ? '<span class="material-symbols-rounded">inventory_2</span><strong>无法读取审核报告</strong><small>请检查网络连接后重试。</small><button type="button" id="root-review-retry" class="btn-outline" style="margin-top:8px;">重试读取</button>'
        : '<span class="material-symbols-rounded">inventory_2</span><strong>暂时没有审核候选</strong><small>新的词根候选批次生成后会自动出现在这里。</small>';
      $('root-review-retry')?.addEventListener('click', () => {
        state.loadError = false;
        $('root-review-loading').innerHTML = '<span class="material-symbols-rounded">hourglass_top</span><strong>正在读取审核批次</strong><small>词库仍可正常离线学习</small>';
        ensureReport().then(() => { selectFirstPending(); render(); });
      });
      $('root-review-loading').hidden = false;
      $('root-review-card').hidden = true;
      $('root-review-actions').hidden = true;
      $('root-review-complete').hidden = true;
      return;
    }

    if (done === total && state.index >= total) {
      renderComplete();
      return;
    }

    state.index = Math.max(0, Math.min(state.index, total - 1));
    const item = state.items[state.index];
    const saved = state.decisions[item.id] || {};
    const roots = saved.roots ?? item.roots;
    $('root-review-loading').hidden = true;
    $('root-review-complete').hidden = true;
    $('root-review-card').hidden = false;
    $('root-review-actions').hidden = false;
    $('root-review-word').textContent = item.word;
    $('root-review-meaning').textContent = item.meaning;
    $('root-review-level').textContent = item.level || '英语';
    $('root-review-state').textContent = saved.decision === 'accept'
      ? '已接受' : saved.decision === 'hide' ? '不显示' : '待判断';
    $('root-review-state').dataset.state = saved.decision || 'pending';
    $('root-review-roots-input').value = roots;
    $('root-review-roots-input').hidden = true;
    $('root-review-parts').hidden = false;
    renderParts(roots);
    $('root-review-prev').disabled = state.index === 0;
    $('root-review-next').disabled = state.index === total - 1;
    $('root-review-accept').classList.toggle('selected', saved.decision === 'accept');
    $('root-review-hide').classList.toggle('selected', saved.decision === 'hide');
  }

  function setDecision(decision) {
    const item = state.items[state.index];
    if (!item) return;
    const roots = $('root-review-roots-input').value.trim();
    if (decision === 'accept' && !roots) {
      toast('接受前需要保留或填写拆分');
      return;
    }
    state.decisions[item.id] = { decision, roots };
    save();
    haptic(decision === 'accept' ? 'correct' : 'selection', decision === 'accept' ? 35 : 22);
    const nextPending = state.items.findIndex((entry, index) => index > state.index && !state.decisions[entry.id]);
    if (nextPending >= 0) state.index = nextPending;
    else if (decidedCount() === state.items.length) state.index = state.items.length;
    else state.index = Math.min(state.index + 1, state.items.length - 1);
    render();
  }

  function exportPayload() {
    const decisions = state.items
      .filter(item => ['accept', 'hide'].includes(state.decisions[item.id]?.decision))
      .map(item => ({
        id: item.id,
        word: item.word,
        decision: state.decisions[item.id].decision,
        roots: state.decisions[item.id].roots || item.roots,
      }));
    return {
      format: 'zhongri-root-review-v1',
      batch: state.batch,
      source_generated_at: state.report?.generated_at || '',
      reviewed: decisions.length,
      total: state.items.length,
      decisions,
    };
  }

  function renderComplete() {
    $('root-review-loading').hidden = true;
    $('root-review-card').hidden = true;
    $('root-review-actions').hidden = true;
    $('root-review-complete').hidden = false;
    const payload = exportPayload();
    const accepted = payload.decisions.filter(item => item.decision === 'accept').length;
    const hidden = payload.decisions.length - accepted;
    $('root-review-complete-summary').textContent = `接受 ${accepted} 个，不显示 ${hidden} 个。结果仍只保存在你的设备上。`;
  }

  async function copyReview() {
    const text = JSON.stringify(exportPayload(), null, 2);
    try {
      await navigator.clipboard.writeText(text);
      toast('审核结果已复制，可保存为 JSON 提交到词库仓库');
      haptic('success', 30);
    } catch (_error) {
      downloadReview();
      toast('无法复制，已改为下载审核文件');
    }
  }

  function downloadReview() {
    const blob = new Blob([`${JSON.stringify(exportPayload(), null, 2)}\n`], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `钟日-英语词根审核-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    toast('审核文件已下载');
    haptic('success', 30);
  }

  /*
   * 审核报告接近 900 KB（gzip 后仍有 185 KB），只为填充设置页的两个统计数字
   * 就在启动时拉取并不划算。改为首次打开审核面板时再加载。
   */
  let reportLoad = null;

  function ensureReport() {
    if (state.report) return Promise.resolve(true);
    if (!reportLoad) {
      reportLoad = loadReport()
        .then(() => true)
        .catch(() => {
          reportLoad = null;
          state.loadError = true;
          state.items = [];
          updateEntrySummary();
          return false;
        });
    }
    return reportLoad;
  }

  function selectFirstPending() {
    state.index = state.items.findIndex(item => !state.decisions[item.id]);
    if (state.index < 0) state.index = state.items.length;
  }

  function open() {
    const overlay = $('root-review-overlay');
    state.previousFocus = document.activeElement;
    overlay.classList.add('active');
    overlay.removeAttribute('inert');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    haptic('sheetOpen', 18);
    window.setTimeout(() => $('root-review-close')?.focus(), 60);

    if (state.report) {
      selectFirstPending();
      render();
      return;
    }

    $('root-review-loading').innerHTML = '<span class="material-symbols-rounded">hourglass_top</span><strong>正在读取审核批次</strong><small>词库仍可正常离线学习</small>';
    $('root-review-loading').hidden = false;
    $('root-review-card').hidden = true;
    $('root-review-actions').hidden = true;
    $('root-review-complete').hidden = true;
    ensureReport().then(() => {
      selectFirstPending();
      render();
    });
  }

  function close() {
    $('root-review-overlay').classList.remove('active');
    $('root-review-overlay').setAttribute('inert', '');
    $('root-review-overlay').setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.modal-overlay.active')) document.body.classList.remove('modal-open');
    if (state.previousFocus && typeof state.previousFocus.focus === 'function') {
      state.previousFocus.focus();
      state.previousFocus = null;
    }
    haptic('sheetClose', 12);
  }

  function bind() {
    $('btn-open-root-review')?.addEventListener('click', open);
    $('root-review-close')?.addEventListener('click', close);
    $('root-review-help')?.addEventListener('click', () => {
      if (typeof showConfirm === 'function') {
        showConfirm(
          '审核标准',
          '接受：拆分能自然解释单词现在的常用意思。<br><br>不显示：只是历史词源、解释牵强、或某一部分本身没有清楚含义。',
          () => {},
          { confirmLabel: '知道了' }
        );
      } else {
        toast('只接受能帮助理解现代常用词义的拆分');
      }
    });
    $('root-review-accept')?.addEventListener('click', () => setDecision('accept'));
    $('root-review-hide')?.addEventListener('click', () => setDecision('hide'));
    $('root-review-prev')?.addEventListener('click', () => { state.index--; haptic('cardFlip', 14); render(); });
    $('root-review-next')?.addEventListener('click', () => { state.index++; haptic('cardFlip', 14); render(); });
    $('root-review-edit')?.addEventListener('click', () => {
      const input = $('root-review-roots-input');
      input.hidden = false;
      $('root-review-parts').hidden = true;
      input.focus();
      haptic('focus', 14);
    });
    $('root-review-roots-input')?.addEventListener('change', event => {
      const item = state.items[state.index];
      if (!item) return;
      const existing = state.decisions[item.id] || {};
      state.decisions[item.id] = { ...existing, roots: event.target.value.trim() };
      save();
      renderParts(event.target.value);
    });
    $('root-review-roots-input')?.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.target.dispatchEvent(new Event('change'));
        event.target.hidden = true;
        $('root-review-parts').hidden = false;
      } else if (event.key === 'Escape') {
        event.stopPropagation();
        event.target.hidden = true;
        $('root-review-parts').hidden = false;
      }
    });
    $('root-review-copy')?.addEventListener('click', copyReview);
    $('root-review-download')?.addEventListener('click', downloadReview);
    $('root-review-reopen')?.addEventListener('click', () => {
      state.index = Math.max(0, state.items.length - 1);
      render();
    });
    document.addEventListener('keydown', event => {
      if (!$('root-review-overlay')?.classList.contains('active')) return;
      if (event.key === 'Escape') {
        const input = $('root-review-roots-input');
        if (input && !input.hidden) {
          input.hidden = true;
          $('root-review-parts').hidden = false;
          return;
        }
        close();
      }
    });
  }

  function init() {
    bind();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
