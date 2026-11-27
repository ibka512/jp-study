#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const cleanUrl = (req.url || '/').split('?')[0];
      const rel = cleanUrl === '/' ? '/index.html' : decodeURIComponent(cleanUrl);
      const filePath = path.resolve(ROOT, '.' + rel);
      if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME[ext] || 'application/octet-stream',
          'Cache-Control': 'no-store'
        });
        res.end(data);
      });
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, url: `http://127.0.0.1:${addr.port}` });
    });
  });
}

function buildBrowserScript(url, shotsDir) {
  return `
const url = ${JSON.stringify(url)};
const shotsDir = ${JSON.stringify(shotsDir)};
const path = await import('node:path');

const assert = (cond, msg) => {
  if (!cond) throw new Error('ASSERTION FAILED: ' + msg);
};

async function setViewport(page, width, height, mobile) {
  await page.cdp('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: Boolean(mobile),
    screenWidth: width,
    screenHeight: height
  });
  await new Promise(r => setTimeout(r, 180));
}

async function settle(page, ms = 450) {
  await new Promise(r => setTimeout(r, ms));
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}

async function shot(page, name) {
  if (!shotsDir) return;
  await settle(page, 450);
  await page.screenshot({ path: path.join(shotsDir, name) });
}

const task = await taskSpace('zhongri-smoke');
const page = task.page('p1');

try {
  await page.cdp('Page.addScriptToEvaluateOnNewDocument', {
    source: \`
      window.__smokePageErrors = [];
      window.__smokeConsoleErrors = [];
      window.addEventListener('error', e => {
        window.__smokePageErrors.push(String(e.message || e.error || 'error'));
      });
      window.addEventListener('unhandledrejection', e => {
        window.__smokePageErrors.push(String(e.reason || 'unhandledrejection'));
      });
      const origErr = console.error.bind(console);
      console.error = (...args) => {
        const text = args.map(a => String(a)).join(' ');
        if (!text.includes('fonts.googleapis.com') && !text.includes('fonts.gstatic.com')) {
          window.__smokeConsoleErrors.push(text);
        }
        origErr(...args);
      };
    \`
  });

  await setViewport(page, 390, 844, true);
  await page.goto(url, { waitUntil: 'load', timeout: 25000 });
  await page.evaluate(async () => {
    if (window.ZhongriAppReady) await window.ZhongriAppReady;
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });
  await new Promise(r => setTimeout(r, 350));

  // 1. Boot, theme-color, zero overflow, 28-day Checkin Stamp Ledger
  const homeCheck = await page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth - window.innerWidth;
    const themeColor = document.querySelector('meta[name="theme-color"]')?.content || '';
    const ledger = document.getElementById('checkin-ledger-details');
    if (ledger) ledger.open = true;
    const cells = document.querySelectorAll('#checkin-stamp-grid .checkin-stamp-cell').length;
    const todayCount = document.querySelectorAll('#checkin-stamp-grid .checkin-stamp-cell.is-today').length;
    return { overflow, themeColor, cells, todayCount };
  });
  assert(homeCheck.overflow <= 1, 'Home mobile horizontal overflow: ' + homeCheck.overflow);
  assert(homeCheck.themeColor === '#1b3b5a', 'Unexpected theme-color: ' + homeCheck.themeColor);
  assert(homeCheck.cells === 28, 'Expected 28 checkin stamp cells, got ' + homeCheck.cells);
  assert(homeCheck.todayCount === 1, 'Expected 1 today cell, got ' + homeCheck.todayCount);

  await page.evaluate(() => {
    const t = new Date().toLocaleDateString('zh-CN');
    Model.records.unshift({ date: t, type: 'daily_punch' });
    View.renderDashboard();
    const ledger = document.getElementById('checkin-ledger-details');
    if (ledger) {
      ledger.open = true;
      ledger.scrollIntoView({ block: 'center' });
    }
  });
  await new Promise(r => setTimeout(r, 250));
  await shot(page, '01-home-stamp-ledger.png');

  // 2. Wordbank: search clear, quick new word, non-modal popover, detail swipe & edit
  await page.evaluate(() => {
    document.querySelector('[data-target="tab-wordbank"]')?.click();
  });
  await new Promise(r => setTimeout(r, 300));

  const wbCheck = await page.evaluate(() => {
    const input = document.getElementById('wb-search-input');
    const clearBtn = document.getElementById('wb-search-clear');
    const hiddenInitially = clearBtn.hidden;
    input.value = '勇気';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const visibleAfterType = !clearBtn.hidden;
    const matchCount = Model.state.filteredDb.length;
    return { hiddenInitially, visibleAfterType, matchCount };
  });
  assert(wbCheck.hiddenInitially === true, 'Search clear button should be hidden initially');
  assert(wbCheck.visibleAfterType === true, 'Search clear button should show after input');
  assert(wbCheck.matchCount >= 1, 'Search for 勇気 should return >= 1 result');
  await shot(page, '02-wordbank-search-clear.png');

  await page.evaluate(() => {
    document.getElementById('wb-search-clear')?.click();
  });
  await new Promise(r => setTimeout(r, 150));
  const clearedCheck = await page.evaluate(() => ({
    val: document.getElementById('wb-search-input').value,
    hidden: document.getElementById('wb-search-clear').hidden
  }));
  assert(clearedCheck.val === '' && clearedCheck.hidden === true, 'Search clear failed');

  // Quick New Word flow
  const newWordCheck = await page.evaluate(() => {
    const before = Model.db.length;
    document.getElementById('btn-new-word')?.click();
    const open = document.getElementById('edit-overlay')?.classList.contains('active');
    const title = document.getElementById('edit-dialog-title')?.textContent || '';
    document.getElementById('edit-word').value = '印譜';
    document.getElementById('edit-kana').value = 'いんぷ';
    document.getElementById('edit-type').value = '名';
    document.getElementById('edit-meaning').value = '印章谱录（冒烟测试）';
    document.getElementById('btn-save-edit').click();
    const after = Model.db.length;
    const addedIdx = Model.db.findIndex(w => w.word === '印譜');
    if (addedIdx >= 0) {
      Model.db.splice(addedIdx, 1);
      Model.saveDB();
      View.updateWordbankUI();
      View.resetWordbankRenderer();
    }
    return { open, title, before, after, found: addedIdx >= 0 };
  });
  assert(newWordCheck.open && newWordCheck.title.includes('新建词条'), 'New word modal failed to open');
  assert(newWordCheck.after === newWordCheck.before + 1 && newWordCheck.found, 'New word failed to save');

  // Non-modal View Settings popover + Escape close
  await page.evaluate(() => {
    document.getElementById('btn-view-settings')?.click();
  });
  await new Promise(r => setTimeout(r, 180));
  const popoverCheck = await page.evaluate(() => {
    const pop = document.getElementById('view-settings-popover');
    const open = Boolean(pop && !pop.hidden);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    const closed = Boolean(pop && pop.hidden);
    return { open, closed };
  });
  assert(popoverCheck.open && popoverCheck.closed, 'View settings popover open/Esc failed');

  // Detail card open + horizontal swipe navigation
  const swipeCheck = await page.evaluate(() => {
    Controller.openDetailModal(0);
    const firstWord = document.getElementById('dt-word')?.textContent || '';
    const card = document.getElementById('detail-card-container');
    const fire = (type, x, y) => card.dispatchEvent(new PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId: 1, pointerType: 'touch', clientX: x, clientY: y
    }));
    fire('pointerdown', 280, 320);
    fire('pointermove', 200, 322);
    fire('pointermove', 130, 324);
    fire('pointerup', 120, 325);
    return { firstWord, activeIdx: Model.state.activeDetailIdx };
  });
  await new Promise(r => setTimeout(r, 320));
  const afterSwipe = await page.evaluate(() => {
    const secondWord = document.getElementById('dt-word')?.textContent || '';
    const idx = Model.state.activeDetailIdx;
    document.getElementById('detail-close')?.click();
    return { secondWord, idx };
  });
  assert(afterSwipe.idx === 1 && afterSwipe.secondWord !== swipeCheck.firstWord, 'Detail horizontal swipe failed');

  // 3. Settings: TTS speech rate segmented control + Vocabulary Audit 0 errors / 0 warnings
  await page.evaluate(() => {
    document.querySelector('[data-target="tab-settings"]')?.click();
  });
  await settle(page, 350);
  await page.evaluate(() => {
    document.querySelector('[data-open-settings-section="display"]')?.click();
  });
  await settle(page, 300);
  const rateCheck = await page.evaluate(() => {
    const seg = document.querySelector('[data-segmented-for="setting-tts-rate"]');
    const btns = seg ? Array.from(seg.querySelectorAll('button')) : [];
    const pick = v => btns.find(b => b.dataset.value === v);
    pick('1')?.click();
    const normalRate = Hardware.getSpeechRate(false, 'local');
    pick('1.25')?.click();
    const fastRate = Hardware.getSpeechRate(false, 'local');
    pick('0.75')?.click();
    const stored = localStorage.getItem('ttsRate');
    const slowRate = Hardware.getSpeechRate(false, 'local');
    seg?.scrollIntoView({ block: 'center' });
    return { btnCount: btns.length, stored, slowRate, normalRate, fastRate };
  });
  assert(rateCheck.btnCount === 3, 'Expected 3 TTS rate buttons, got ' + rateCheck.btnCount);
  assert(
    rateCheck.stored === '0.75' &&
    rateCheck.slowRate < rateCheck.normalRate &&
    rateCheck.normalRate < rateCheck.fastRate,
    'TTS rate control failed: ' + JSON.stringify(rateCheck)
  );
  await shot(page, '03-settings-tts-rate.png');
  await page.evaluate(() => {
    document.querySelector('[data-segmented-for="setting-tts-rate"] button[data-value="1"]')?.click();
    document.querySelector('#settings-section-display [data-settings-back]')?.click();
  });
  await settle(page, 250);

  // Vocabulary Audit: MUST be 0 errors, 0 warnings!
  await page.evaluate(() => {
    document.querySelector('[data-open-settings-section="library"]')?.click();
  });
  await new Promise(r => setTimeout(r, 220));
  const auditCheck = await page.evaluate(async () => {
    await Controller.runVocabularyAudit();
    const box = document.getElementById('library-audit-result');
    const summaryText = document.getElementById('library-audit-summary')?.textContent || '';
    const perfect = Boolean(document.querySelector('#library-audit-issues .library-audit-perfect'));
    box?.scrollIntoView({ block: 'center' });
    return { state: box?.dataset.state, summaryText: summaryText.replace(/\\s+/g, ' ').trim(), perfect };
  });
  assert(auditCheck.state === 'ok' && auditCheck.perfect, 'Vocabulary audit not clean: ' + JSON.stringify(auditCheck));
  await new Promise(r => setTimeout(r, 180));
  await shot(page, '04-library-audit-zero-errors.png');

  // 4. Study Session Completion Receipt (#study-summary-overlay)
  await page.evaluate(() => {
    document.querySelector('[data-target="tab-home"]')?.click();
  });
  await new Promise(r => setTimeout(r, 220));
  await page.evaluate(() => {
    Controller.startPendulum('dual-track');
    const q = Model.state.studyQueue;
    Controller.trackSessionOutcome(q[0], true);
    Controller.trackSessionOutcome(q[1], true);
    Controller.trackSessionOutcome(q[2], false);
    Controller.trackSessionOutcome(q[3], true);
    Controller.trackSessionOutcome(q[4], false);
    Controller.finishPendulum();
  });
  await new Promise(r => setTimeout(r, 300));
  const summaryCheck = await page.evaluate(() => {
    const active = document.getElementById('study-summary-overlay')?.classList.contains('active');
    const metrics = document.querySelectorAll('#study-summary-metrics .study-summary-metric').length;
    const weakChips = document.querySelectorAll('#study-summary-weak-list .study-summary-weak-chip').length;
    const weakBtnVisible = !document.getElementById('btn-summary-practice-weak')?.hidden;
    const nextBtnVisible = !document.getElementById('btn-summary-next-group')?.hidden;
    return { active, metrics, weakChips, weakBtnVisible, nextBtnVisible };
  });
  assert(summaryCheck.active && summaryCheck.metrics === 3 && summaryCheck.weakChips === 2 && summaryCheck.weakBtnVisible && summaryCheck.nextBtnVisible, 'Study summary receipt check failed: ' + JSON.stringify(summaryCheck));
  await shot(page, '05-study-summary-receipt.png');
  await page.evaluate(() => {
    document.getElementById('btn-summary-home')?.click();
  });

  // 5. Desktop viewport (1280x860): centered group selector & chunked DOM
  await setViewport(page, 1280, 860, false);
  await page.evaluate(() => {
    document.getElementById('btn-custom-group-select')?.click();
  });
  await new Promise(r => setTimeout(r, 260));
  const desktopCheck = await page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth - window.innerWidth;
    const sheet = document.querySelector('#group-select-overlay .bottom-sheet');
    const rect = sheet.getBoundingClientRect();
    const centered = rect.bottom < window.innerHeight - 20;
    const optionCount = document.querySelectorAll('#group-list-container .group-range-option').length;
    window.toggleModal('group-select-overlay', false);
    return { overflow, centered, optionCount };
  });
  assert(desktopCheck.overflow <= 1, 'Desktop overflow: ' + desktopCheck.overflow);
  assert(desktopCheck.centered, 'Group selector should be centered on desktop');
  assert(desktopCheck.optionCount > 0 && desktopCheck.optionCount <= 55, 'Expected chunked options (<=55), got ' + desktopCheck.optionCount);

  const runtimeErrors = await page.evaluate(() => ({
    pageErrors: window.__smokePageErrors || [],
    consoleErrors: window.__smokeConsoleErrors || []
  }));
  assert(runtimeErrors.pageErrors.length === 0, 'Page errors: ' + runtimeErrors.pageErrors.join('; '));
  assert(runtimeErrors.consoleErrors.length === 0, 'Console errors: ' + runtimeErrors.consoleErrors.join('; '));

  console.log(JSON.stringify({
    status: 'PASS',
    homeCheck,
    auditCheck,
    rateCheck,
    summaryCheck,
    desktopCheck
  }, null, 2));
} finally {
  await task.finish({ keep: [] });
}
`;
}

async function main() {
  const { server, url } = await startStaticServer();
  const shotsDir = process.env.SMOKE_SHOTS_DIR || '';
  if (shotsDir) fs.mkdirSync(shotsDir, { recursive: true });
  try {
    const script = buildBrowserScript(url, shotsDir);
    const exitCode = await new Promise((resolve, reject) => {
      const child = spawn('ego-browser', ['nodejs'], {
        stdio: ['pipe', 'inherit', 'inherit']
      });
      child.on('error', reject);
      child.on('close', code => resolve(code ?? 1));
      child.stdin.end(script);
    });
    if (exitCode !== 0) {
      process.exit(exitCode);
    }
  } finally {
    server.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
