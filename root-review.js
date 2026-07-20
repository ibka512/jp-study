(() => {
  'use strict';

  const STORAGE_PREFIX = 'zhongri-root-review-v1:';
  const state = {
    items: [],
    decisions: {},
    index: 0,
    batch: 'latest',
    report: null,
  };

  const $ = id => document.getElementById(id);
  const vibrate = duration => {
    if (typeof Hardware !== 'undefined' && Hardware.vibrate) Hardware.vibrate(duration);
    else if (navigator.vibrate) navigator.vibrate(duration);
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
    const response = await fetch(`./reports/root-generation-latest.json?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('审核报告读取失败');
    const report = await response.json();
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
      : '<span class="root-review-no-split">AI 建议这个词不显示拆分</span>';
  }

  function render() {
    const total = state.items.length;
    const done = decidedCount();
    $('root-review-progress-text').textContent = `${done} / ${total}`;
    $('root-review-progress-bar').style.width = `${total ? (done / total) * 100 : 0}%`;

    if (!total) {
      $('root-review-loading').innerHTML = '<span class="material-symbols-rounded">inventory_2</span><strong>暂时没有审核候选</strong><small>下一批 AI 建议生成后会自动出现在这里。</small>';
      $('root-review-loading').hidden = false;
      $('root-review-card').hidden = true;
      $('root-review-actions').hidden = true;
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
    vibrate(decision === 'accept' ? 35 : 22);
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
      toast('审核结果已复制，直接粘贴给 ChatGPT 即可');
      vibrate(30);
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
    vibrate(30);
  }

  function open() {
    state.index = state.items.findIndex(item => !state.decisions[item.id]);
    if (state.index < 0) state.index = state.items.length;
    $('root-review-overlay').classList.add('active');
    $('root-review-overlay').setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    render();
    vibrate(18);
  }

  function close() {
    $('root-review-overlay').classList.remove('active');
    $('root-review-overlay').setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.modal-overlay.active')) document.body.classList.remove('modal-open');
    vibrate(12);
  }

  function bind() {
    $('btn-open-root-review')?.addEventListener('click', open);
    $('root-review-close')?.addEventListener('click', close);
    $('root-review-help')?.addEventListener('click', () => {
      if (typeof showAlert === 'function') {
        showAlert('审核标准', '接受：拆分能自然解释单词现在的常用意思。<br><br>不显示：只是历史词源、解释牵强、或某一部分本身没有清楚含义。');
      } else toast('只接受能帮助理解现代常用词义的拆分');
    });
    $('root-review-accept')?.addEventListener('click', () => setDecision('accept'));
    $('root-review-hide')?.addEventListener('click', () => setDecision('hide'));
    $('root-review-prev')?.addEventListener('click', () => { state.index--; vibrate(10); render(); });
    $('root-review-next')?.addEventListener('click', () => { state.index++; vibrate(10); render(); });
    $('root-review-edit')?.addEventListener('click', () => {
      $('root-review-roots-input').hidden = false;
      $('root-review-parts').hidden = true;
      $('root-review-roots-input').focus();
      vibrate(10);
    });
    $('root-review-roots-input')?.addEventListener('change', event => {
      const item = state.items[state.index];
      if (!item) return;
      const existing = state.decisions[item.id] || {};
      state.decisions[item.id] = { ...existing, roots: event.target.value.trim() };
      save();
      renderParts(event.target.value);
    });
    $('root-review-copy')?.addEventListener('click', copyReview);
    $('root-review-download')?.addEventListener('click', downloadReview);
    document.addEventListener('keydown', event => {
      if (!$('root-review-overlay')?.classList.contains('active')) return;
      if (event.key === 'Escape') close();
    });
  }

  async function init() {
    bind();
    try {
      await loadReport();
    } catch (_error) {
      state.items = [];
      updateEntrySummary();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
