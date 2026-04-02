/**
 * 钟摆日语 - 核心控制逻辑
 * 全面进化版 (支持本地备份 + 实时搜索 + SRS时光机 + 原生分享修复)
 */

const escapeHTML = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
};

window.createStarParticles = (el) => {
    let rect = el.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
        let p = document.createElement('div'); 
        p.className = 'star-particle';
        p.style.left = (rect.left + rect.width / 2) + 'px'; 
        p.style.top = (rect.top + rect.height / 2) + 'px';
        let angle = Math.random() * Math.PI * 2; 
        let dist = 25 + Math.random() * 25;
        p.style.setProperty('--tx', Math.cos(angle) * dist + 'px'); 
        p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
        document.body.appendChild(p); 
        setTimeout(() => p.remove(), 400);
    }
};

window.toggleModal = (id, show) => {
    let el = document.getElementById(id);
    if (!el) return;
    if (show) el.classList.add('active'); else el.classList.remove('active');
    if (document.querySelectorAll('.modal-overlay.active').length > 0) {
        document.body.classList.add('modal-open');
    } else {
        document.body.classList.remove('modal-open');
    }
};

window.showToast = (msg) => {
    let t = document.getElementById('toast');
    t.innerText = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
};

window.showConfirm = (title, msg, onConfirm) => {
    document.getElementById('dialog-title').innerHTML = title;
    document.getElementById('dialog-msg').innerHTML = msg;
    window.toggleModal('dialog-overlay', true);
    document.getElementById('dialog-confirm').onclick = () => { window.toggleModal('dialog-overlay', false); onConfirm(); };
    document.getElementById('dialog-cancel').onclick = () => { window.toggleModal('dialog-overlay', false); };
};

window.showPrompt = (title, defaultVal, onConfirm) => {
    document.getElementById('prompt-title').innerHTML = title;
    let input = document.getElementById('prompt-input');
    input.value = defaultVal || ''; 
    window.toggleModal('prompt-overlay', true);
    setTimeout(() => input.focus(), 100);
    document.getElementById('prompt-confirm').onclick = () => { 
        let val = input.value.trim(); if(val) { window.toggleModal('prompt-overlay', false); onConfirm(val); }
    };
    document.getElementById('prompt-cancel').onclick = () => { window.toggleModal('prompt-overlay', false); };
};

// 📱 原生底部导航栏管理器
const Nav = {
    init() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                Hardware.playSound('click'); Hardware.vibrate(10);
                let targetId = e.currentTarget.getAttribute('data-target');
                let titleData = e.currentTarget.getAttribute('data-title');
                this.switchTab(targetId, titleData, e.currentTarget);
            });
        });

        // ⌨️ 键盘避让系统
        let inputs = document.querySelectorAll('input[type="text"], textarea');
        let nav = document.getElementById('bottom-nav');
        inputs.forEach(el => {
            el.addEventListener('focus', () => { if(nav) nav.style.transform = 'translateY(150%)'; });
            el.addEventListener('blur', () => { if(nav) nav.style.transform = 'translateY(0)'; });
        });
    },
    switchTab(targetId, titleData, navItemEl) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if(navItemEl) navItemEl.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('active');
        });
        
        let targetEl = document.getElementById(targetId);
        if(targetEl) {
            targetEl.classList.remove('hidden');
            void targetEl.offsetWidth; 
            targetEl.classList.add('active');
        }

        if (titleData) {
            let [icon, text] = titleData.split('|');
            let titleEl = document.getElementById('app-global-title');
            if(titleEl) titleEl.innerHTML = `<span class="material-symbols-rounded" style="color:var(--tertiary); font-size:1.8rem; margin-right: 6px;">${icon}</span> ${text}`;
        }

        // 保证返回主页时数据实时刷新
        if (targetId === 'tab-home') {
            View.renderDashboard();
        }

        if(targetId === 'tab-wordbank' && Model.state.wbCurrentRendered === 0) {
            View.resetWordbankRenderer();
        }
    }
};

const BottomSheet = {
    init() {
        document.querySelectorAll('select:not(.no-bs)').forEach(sel => {
            let facade = document.createElement('div');
            facade.className = 'bs-facade'; 
            if(sel.style.marginBottom) facade.style.marginBottom = sel.style.marginBottom;
            if(sel.style.flex) facade.style.flex = sel.style.flex;
            if(sel.style.width) facade.style.width = sel.style.width;
            
            let textSpan = document.createElement('span');
            textSpan.className = 'bs-facade-text';
            textSpan.innerText = sel.options[sel.selectedIndex]?.text || '';
            let arrowSpan = document.createElement('span');
            arrowSpan.className = 'material-symbols-rounded'; arrowSpan.innerText = 'keyboard_arrow_down'; arrowSpan.style.opacity = '0.5';
            
            facade.appendChild(textSpan); facade.appendChild(arrowSpan);
            sel.style.display = 'none'; sel.parentNode.insertBefore(facade, sel.nextSibling);
            
            facade.addEventListener('click', () => this.open(sel, textSpan));
            sel.addEventListener('facade-update', () => { textSpan.innerText = sel.options[sel.selectedIndex]?.text || ''; });
        });
    },
    open(selectEl, textSpan) {
        let container = document.getElementById('bs-options'); container.innerHTML = '';
        let titleMap = {'group-select':'选择突击范围','next-display-mode':'显示模式','wb-folder-filter':'选择词库','move-dest-select':'移动至目标文件夹'};
        document.getElementById('bs-title').innerText = titleMap[selectEl.id] || "请选择";
        
        Array.from(selectEl.options).forEach(opt => {
            let btn = document.createElement('div');
            btn.className = 'bs-option ' + (opt.selected ? 'selected' : '');
            btn.innerText = opt.text;
            btn.onclick = () => {
                selectEl.value = opt.value;
                selectEl.dispatchEvent(new Event('facade-update'));
                selectEl.dispatchEvent(new Event('change')); 
                window.toggleModal('bs-overlay', false);
            };
            container.appendChild(btn);
        });
        window.toggleModal('bs-overlay', true);
    }
};

const Model = {
  db: [], folders: ["默认词库"], stars: [], records: [], editingIdx: -1,
  state: {
    mode: 'none', studyQueue: [], currentIndex: 0, currentGroupLabel: '',
    dtWordAppearanceMap: {}, dtSubMode: '', dtSpellTarget: [], dtSpellCurrentIdx: 0,
    mtStep: 1, currentWordFailed: false, totalTestWords: 0,
    batchMode: false, manageMode: false, selectedSet: new Set(), activeDetailIdx: 0, detailArray: [], moveTargetIdx: -1, wbRenderLimit: 30, wbCurrentRendered: 0,
    isAnimating: false,
    srsHistory: [] // 🌟 用于存放 SRS 历史状态的回溯栈
  },
  init() { this.loadData(); this.migrateSRSData(); },
  loadData() {
    this.folders = JSON.parse(localStorage.getItem('myFolders_v3')) || ["默认词库"];
    let storedDB = localStorage.getItem('myWordDB_v3');
    if (storedDB) this.db = JSON.parse(storedDB);
    else { this.db = DefaultWords.map(w => ({...w, folder: "默认词库"})); this.saveDB(); }
    this.stars = JSON.parse(localStorage.getItem('starredWords')) || [];
    this.records = JSON.parse(localStorage.getItem('studyRecords')) || [];
  },
  saveDB() { localStorage.setItem('myWordDB_v3', JSON.stringify(this.db)); },
  saveFolders() { localStorage.setItem('myFolders_v3', JSON.stringify(this.folders)); },
  saveStars() { localStorage.setItem('starredWords', JSON.stringify(this.stars)); },
  saveRecords() { localStorage.setItem('studyRecords', JSON.stringify(this.records)); },
  migrateSRSData() {
    let modified = false;
    this.db.forEach(w => { if (!w.srs) { w.srs = { ease: 2.5, interval: 0, nextReview: Date.now() }; modified = true; } });
    if (modified) this.saveDB();
  },
  calculateSRS(wordIdx, rating) {
    let srs = this.db[wordIdx].srs; let now = Date.now(); let dayMs = 86400000;
    switch(rating) {
      case 'again': srs.ease = Math.max(1.3, srs.ease - 0.2); srs.interval = 0; srs.nextReview = now + 60000; break;
      case 'hard': srs.ease = Math.max(1.3, srs.ease - 0.15); srs.interval = Math.max(1, srs.interval * 1.2); srs.nextReview = now + Math.round(srs.interval) * dayMs; break;
      case 'good': srs.interval = (srs.interval === 0) ? 1 : (srs.interval === 1 ? 3 : srs.interval * srs.ease); srs.nextReview = now + Math.round(srs.interval) * dayMs; break;
      case 'easy': srs.ease += 0.15; srs.interval = (srs.interval === 0) ? 4 : (srs.interval * srs.ease * 1.3); srs.nextReview = now + Math.round(srs.interval) * dayMs; break;
    }
    this.saveDB();
  },
  previewSRSTimes(wordIdx) {
    let srs = this.db[wordIdx].srs;
    return { hard: Math.round(Math.max(1, srs.interval * 1.2)) + '天', good: Math.round((srs.interval === 0) ? 1 : (srs.interval === 1 ? 3 : srs.interval * srs.ease)) + '天', easy: Math.round((srs.interval === 0) ? 4 : (srs.interval * srs.ease * 1.3)) + '天' };
  },
  getSRSDueQueue() {
    let now = Date.now(); let due = [];
    this.db.forEach((w, idx) => { if (w.srs.nextReview <= now) due.push(idx); });
    return due.sort(() => Math.random() - 0.5);
  },
  splitKanaByMora(kanaStr) {
      let tokens = kanaStr.replace(/[【】\[\]()]/g, '').match(/([ぁ-んァ-ン][ゃゅょャュョぁぃぅぇぉァィゥェォ]?|[っッんンー])/g);
      return tokens || kanaStr.split('');
  },
  calculateStats() {
      let dailyRecords = this.records.filter(r => r.type === 'daily_punch').map(r => r.date);
      let uniqueDates = [...new Set(dailyRecords)].sort((a, b) => new Date(b) - new Date(a));
      let totalDays = uniqueDates.length; let streak = 0;
      let today = new Date(); today.setHours(0,0,0,0);
      for (let i = 0; i < uniqueDates.length; i++) {
          let d = new Date(uniqueDates[i]); d.setHours(0,0,0,0);
          let diff = (today - d) / 86400000;
          if (i === 0 && diff > 1) break; 
          if (i > 0) {
              let prevD = new Date(uniqueDates[i-1]); prevD.setHours(0,0,0,0);
              if ((prevD - d) / 86400000 > 1) break; 
          }
          streak++;
      }
      return { totalDays, streak };
  }
};

const Hardware = {
  audioCtx: null, jaVoiceCache: null, chargeOsc: null, chargeGain: null,
  init() {
    try {
        if (window.speechSynthesis) {
          let loadVoice = () => { this.jaVoiceCache = window.speechSynthesis.getVoices().find(v => v.lang.includes('ja') || v.lang.includes('JP')); };
          loadVoice();
          if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = loadVoice;
        }
    } catch(e) {}
  },
  vibrate(pattern) { try { if (navigator.vibrate) navigator.vibrate(pattern); } catch(e) {} },
  playSound(type) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        if (!this.audioCtx) this.audioCtx = new AudioContext();
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        const osc = this.audioCtx.createOscillator(); const gain = this.audioCtx.createGain();
        osc.connect(gain); gain.connect(this.audioCtx.destination);
        const now = this.audioCtx.currentTime;
        if (type === 'click') {
          osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
          gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          osc.start(now); osc.stop(now + 0.05);
        } else if (type === 'success') {
          osc.type = 'triangle'; osc.frequency.setValueAtTime(523.25, now); osc.frequency.setValueAtTime(783.99, now + 0.2); osc.frequency.setValueAtTime(1046.50, now + 0.3);
          gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.2, now + 0.05); gain.gain.linearRampToValueAtTime(0, now + 0.6);   
          osc.start(now); osc.stop(now + 0.6);
        } else if (type === 'error') {
          osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
          gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.start(now); osc.stop(now + 0.15);
        }
    } catch(e) {}
  },
  playChargeSound() {
      try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!this.audioCtx) this.audioCtx = new AudioContext();
          if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
          this.chargeOsc = this.audioCtx.createOscillator();
          this.chargeGain = this.audioCtx.createGain();
          this.chargeOsc.connect(this.chargeGain);
          this.chargeGain.connect(this.audioCtx.destination);
          
          let now = this.audioCtx.currentTime;
          this.chargeOsc.type = 'sine';
          this.chargeOsc.frequency.setValueAtTime(100, now);
          this.chargeOsc.frequency.exponentialRampToValueAtTime(800, now + 1.5); 
          
          this.chargeGain.gain.setValueAtTime(0, now);
          this.chargeGain.gain.linearRampToValueAtTime(0.2, now + 0.2); 
          this.chargeGain.gain.linearRampToValueAtTime(0.5, now + 1.5); 
          
          this.chargeOsc.start(now);
      } catch(e) {}
  },
  stopChargeSound() {
      try {
          if(this.chargeOsc && this.chargeGain) {
              let now = this.audioCtx.currentTime;
              this.chargeGain.gain.cancelScheduledValues(now);
              this.chargeGain.gain.setValueAtTime(this.chargeGain.gain.value, now);
              this.chargeGain.gain.linearRampToValueAtTime(0, now + 0.1);
              this.chargeOsc.stop(now + 0.1);
              this.chargeOsc = null;
          }
      } catch(e) {}
  },
  playDingDong() {
      try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!this.audioCtx) this.audioCtx = new AudioContext();
          if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
          let osc1 = this.audioCtx.createOscillator(); let gain1 = this.audioCtx.createGain();
          let osc2 = this.audioCtx.createOscillator(); let gain2 = this.audioCtx.createGain();
          osc1.connect(gain1); gain1.connect(this.audioCtx.destination);
          osc2.connect(gain2); gain2.connect(this.audioCtx.destination);
          
          let now = this.audioCtx.currentTime;
          osc1.type = 'sine'; osc1.frequency.setValueAtTime(880, now); 
          gain1.gain.setValueAtTime(0, now); gain1.gain.linearRampToValueAtTime(0.3, now + 0.02); gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc1.start(now); osc1.stop(now + 0.3);
          
          osc2.type = 'sine'; osc2.frequency.setValueAtTime(659.25, now + 0.15); 
          gain2.gain.setValueAtTime(0, now + 0.15); gain2.gain.linearRampToValueAtTime(0.3, now + 0.17); gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
          osc2.start(now + 0.15); osc2.stop(now + 0.6);
      } catch(e) {}
  },
  unlockSpeech() {
      try { if (!window.speechSynthesis) return; let unlock = new SpeechSynthesisUtterance('あ'); unlock.volume = 0; window.speechSynthesis.speak(unlock); } catch(e) {}
  },
  speakText(text) {
    try {
        if (!window.speechSynthesis || typeof text !== 'string' || text.trim() === '') return; 
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) { window.speechSynthesis.cancel(); }
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP'; utterance.rate = 0.85; utterance.volume = 1; 
        if (this.jaVoiceCache) utterance.voice = this.jaVoiceCache;
        window.speechSynthesis.speak(utterance);
    } catch(e) {}
  }
};

const View = {
  getEl: (id) => document.getElementById(id),
  
  showPage(pageId) {
      let studyArea = this.getEl('study-area');
      let bottomNav = this.getEl('bottom-nav');
      let globalHeader = this.getEl('global-header');

      if (pageId === 'study-area') {
          studyArea.classList.remove('hidden');
          if(bottomNav) bottomNav.style.transform = 'translateY(150%)';
          if(globalHeader) globalHeader.style.transform = 'translateY(-150%)';
      } else {
          studyArea.classList.add('hidden');
          if(bottomNav) bottomNav.style.transform = 'translateY(0)';
          if(globalHeader) globalHeader.style.transform = 'translateY(0)';
      }
  },
  
  toggleTheme() {
    let dark = document.body.getAttribute('data-theme') === 'dark';
    if (dark) { 
        document.body.removeAttribute('data-theme'); localStorage.setItem('theme', 'light'); 
        document.querySelectorAll('.theme-icon').forEach(icon => icon.innerText = 'light_mode'); 
    } else { 
        document.body.setAttribute('data-theme', 'dark'); localStorage.setItem('theme', 'dark'); 
        document.querySelectorAll('.theme-icon').forEach(icon => icon.innerText = 'dark_mode'); 
    }
  },
  
  getCardVisuals(typeStr) {
    if (!typeStr) return { bg: 'var(--surface-container)', wm: '', tagsHTML: '' };
    let wm = '';
    if (typeStr.includes('自他')) wm = 'が / を'; else if (typeStr.includes('自')) wm = 'が'; else if (typeStr.includes('他')) wm = 'を';
    const getCat = (t) => {
        if (t.includes('形动') || t.includes('形动')) return { color: 'var(--bg-adj-na)' };
        if (t.includes('形')) return { color: 'var(--bg-adj)' };
        if (/[段変变動自他サ]/.test(t)) return { color: 'var(--bg-verb)' };
        if (t.includes('代')) return { color: 'var(--bg-pronoun)' };
        if (t.includes('名')) return { color: 'var(--bg-noun)' };
        if (t.includes('副') || t.includes('接')) return { color: 'var(--bg-adv)' };
        return { color: 'var(--bg-other)' }; 
    };
    let tags = typeStr.split('・').map(t => t.trim()).filter(t => t);
    if (tags.length === 0) tags = [typeStr]; 
    let mainColors = [];
    let tagsHTML = tags.map(t => {
        let catInfo = getCat(t); mainColors.push(catInfo.color);
        return `<span class="type-capsule" style="background: ${catInfo.color};">${t}</span>`;
    }).join('');
    let uniqueColors = [...new Set(mainColors)];
    let bg = uniqueColors[0] || 'var(--surface-container)';
    if (uniqueColors.length >= 2) { bg = `linear-gradient(135deg, ${uniqueColors[0]} 50%, ${uniqueColors[1]} 50%)`; }
    return { bg, wm, tagsHTML };
  },
  
  updatePixelMatrix() {
    let c = this.getEl('pixel-matrix');
    let isMemTest = Model.state.mode === 'memory-test';
    let isSRS = Model.state.mode === 'srs';
    
    let total = isMemTest ? Model.state.totalTestWords : Model.state.studyQueue.length;
    let current = isMemTest ? (total - Model.state.studyQueue.length) : Model.state.currentIndex;
    
    let displayTotal = total;
    let displayCurrent = current;

    if (isSRS && total > 10) {
        displayTotal = 10;
        displayCurrent = current % 10;
    }
    
    while (c.children.length < displayTotal) {
      let p = document.createElement('div'); p.className = 'pixel'; c.appendChild(p);
    }
    while (c.children.length > displayTotal) {
      c.removeChild(c.lastChild);
    }
    
    Array.from(c.children).forEach((p, i) => {
      p.className = (i < displayCurrent) ? 'pixel filled' : (i === displayCurrent ? 'pixel current' : 'pixel');
      p.style.setProperty('--fill-color', ['#e0d7cd','#d1c5b8','#c2b4a3','#b2a18d','#a28f78','#917e62','#816d4d','#705b38','#5f4923','#4e370e'][Math.min(9, Math.floor((i/displayTotal)*10))]);
    });
  },

  renderDashboard() {
    let dbTotalEl = this.getEl('db-total-count');
    if (dbTotalEl) dbTotalEl.innerText = Model.db.length;
    
    let stats = Model.calculateStats();
    this.getEl('total-days').innerText = stats.totalDays;
    this.getEl('streak-days').innerText = stats.streak;
    
    let select = this.getEl('group-select'); select.innerHTML = '';
    Model.folders.forEach(f => {
      let wordsInFolder = Model.db.filter(w => w.folder === f); let total = wordsInFolder.length; if (total === 0) return;
      let i = 0; while (i * 10 < total) { let startIdx = i * 10; let endIdx = Math.min(startIdx + 10, total); select.add(new Option(`${f} (第 ${startIdx + 1}-${endIdx} 词)`, `folder|${f}|${i}`)); i++; }
    });
    select.dispatchEvent(new Event('facade-update'));
    
    let t = new Date().toLocaleDateString('zh-CN');
    let btn = this.getEl('btn-long-press');
    if (btn) {
        let isPunched = Model.records.some(r => r.date === t && r.type === 'daily_punch');
        if(isPunched) {
            btn.className = 'btn-long-press done';
            btn.innerHTML = `<span class="lp-text"><span class="material-symbols-rounded" style="font-size:1.6rem;">task_alt</span> 今日已完成</span>`;
        } else {
            btn.className = 'btn-long-press';
            btn.innerHTML = `<div class="lp-bg"></div><span class="lp-text"><span class="material-symbols-rounded" style="font-size:1.6rem;">fingerprint</span> 长按打卡</span>`;
        }
    }
  },
  
  renderStudyCard(anim = 'none') {
    let idx = Model.state.studyQueue[Model.state.currentIndex];
    let w = Model.db[idx];
    let mode = this.getEl('next-display-mode').value;
    
    let isMemTest = (Model.state.mode === 'memory-test');
    let isRote = (Model.state.mode === 'rote-learning');
    
    let forceRoteFull = false;
    if (isRote) {
        let isFirstAppearance = Model.state.studyQueue.indexOf(idx) === Model.state.currentIndex;
        if (isFirstAppearance) {
            forceRoteFull = true;
            mode = 'all'; 
        }
    }

    if (Model.state.mode === 'dual-track') {
        Model.state.dtWordAppearanceMap[idx] = (Model.state.dtWordAppearanceMap[idx] || 0) + 1;
        let count = Model.state.dtWordAppearanceMap[idx];
        Model.state.dtSubMode = ((count - 1) % 5 < 3) ? 'choice' : 'spell';
        mode = 'all';
    }

    if (isMemTest) {
        this.getEl('progress-text').innerText = `${Model.state.studyQueue.length} / ${Model.state.totalTestWords}`;
    } else {
        this.getEl('progress-text').innerText = `${Model.state.currentIndex + 1} / ${Model.state.studyQueue.length}`;
    }
    
    if (Model.state.mode === 'pendulum' || Model.state.mode === 'dual-track' || Model.state.mode === 'srs' || isMemTest || isRote) {
        this.updatePixelMatrix(); 
    }

    let card = this.getEl('flash-card');
    let visuals = this.getCardVisuals(w.type);
    card.querySelector('.watermark-layer').style.background = visuals.bg;
    this.getEl('flash-watermark').innerText = visuals.wm;
    
    card.classList.remove('anim-slide-next','anim-slide-prev'); void card.offsetWidth;
    
    if (anim !== 'none') {
        Model.state.isAnimating = true;
        card.classList.add(anim === 'next' ? 'anim-slide-out-left' : 'anim-slide-out-right');
        setTimeout(() => {
            this.updateCardContent(w, visuals, mode, forceRoteFull, isMemTest, isRote);
            card.classList.remove('anim-slide-out-left', 'anim-slide-out-right');
            card.classList.add(anim === 'next' ? 'anim-slide-in-right' : 'anim-slide-in-left');
            setTimeout(() => { Model.state.isAnimating = false; }, 200); 
        }, 200); 
    } else {
        this.updateCardContent(w, visuals, mode, forceRoteFull, isMemTest, isRote);
        Model.state.isAnimating = false; 
    }
  },

  updateCardContent(w, visuals, mode, forceRoteFull, isMemTest, isRote) {
    let mask = (str) => '■'.repeat(Array.from(str || '').length);
    let showWord = true, showKana = true, showMeaning = true;
    
    if ((isMemTest || isRote) && mode !== 'all' && !forceRoteFull) {
        if (mode === 'word') { showKana = Model.state.mtStep > 1; showMeaning = false; } 
        else if (mode === 'kana') { showWord = Model.state.mtStep > 1; showMeaning = false; } 
        else if (mode === 'meaning') { showKana = Model.state.mtStep > 1; showWord = false; }
    }

    this.getEl('w-word').innerText = (!showWord) ? mask(w.word) : w.word; 
    this.getEl('w-kana').innerText = (!showKana) ? mask(w.kana.replace(/[【】\[\]()]/g,'')) : w.kana;
    this.getEl('w-meaning').innerText = (!showMeaning) ? mask(w.meaning) : w.meaning;
    this.getEl('w-type').innerHTML = visuals.tagsHTML; 
    
    let isStarred = typeof w.word === 'string' && Model.stars.includes(w.word);
    this.getEl('star-icon').classList.toggle('icon-filled', isStarred);

    let isDtSpell = (Model.state.mode === 'dual-track' && Model.state.dtSubMode === 'spell');
    let isDtChoice = (Model.state.mode === 'dual-track' && Model.state.dtSubMode === 'choice');

    if (!isMemTest && !isRote) {
        this.getEl('w-kana').style.display = isDtSpell ? 'none' : 'block';
        this.getEl('w-meaning').style.display = isDtChoice ? 'none' : 'block';
    } else {
        this.getEl('w-kana').style.display = 'block';
        this.getEl('w-meaning').style.display = 'block';
    }
    
    let hideSpeaker = isDtSpell || ((isMemTest || isRote) && mode !== 'kana' && mode !== 'all' && !forceRoteFull);
    this.getEl('btn-speaker').style.display = hideSpeaker ? 'none' : 'block';
    
    let displayTrigger = this.getEl('btn-display-mode-trigger');
    if (displayTrigger) displayTrigger.style.display = (Model.state.mode === 'dual-track') ? 'none' : 'inline-flex';

    // 🌟 控制撤销按钮显示状态
    let undoBtn = this.getEl('btn-srs-undo');
    if (undoBtn) {
        if (Model.state.mode === 'srs' && Model.state.srsHistory && Model.state.srsHistory.length > 0) {
            undoBtn.classList.remove('hidden');
        } else {
            undoBtn.classList.add('hidden');
        }
    }

    this.renderExampleBox(w.example, 'w-example-box', Model.state.mode === 'dual-track' ? Model.state.dtSubMode : 'normal', w);

    if (Model.state.mode !== 'dual-track' && !isMemTest && !isRote) {
        ['word','kana','type','meaning'].forEach(k => {
            let el = this.getEl(`w-${k}`);
            el.className = (k === 'word') ? 'word-main blur-target' : (k === 'type' ? 'type-row blur-target' : `${k}-row blur-target`);
            if (mode !== 'all' && mode !== k && !(mode === 'meaning' && k === 'type')) el.classList.add('blur-text');
        });
        let exBox = this.getEl('w-example-box'); exBox.className = 'dt-example-box blur-target';
        if (mode !== 'all' && mode !== 'meaning') exBox.classList.add('blur-text');
    } else if (forceRoteFull) {
        ['word','kana','type','meaning'].forEach(k => { let el = this.getEl(`w-${k}`); el.className = (k === 'word') ? 'word-main' : (k === 'type' ? 'type-row' : `${k}-row`); });
        this.getEl('w-example-box').className = 'dt-example-box'; this.getEl('w-example-box').style.display = 'block'; 
    } else {
        ['word','kana','type','meaning'].forEach(k => { let el = this.getEl(`w-${k}`); el.className = (k === 'word') ? 'word-main' : (k === 'type' ? 'type-row' : `${k}-row`); });
        this.getEl('w-example-box').className = 'dt-example-box';
        if ((isMemTest || isRote) && mode !== 'all') this.getEl('w-example-box').style.display = 'none'; 
    }

    this.getEl('capsule-pendulum').classList.add('hidden');
    this.getEl('capsule-srs').classList.add('hidden');
    this.getEl('dual-track-ui').classList.add('hidden');
    this.getEl('memory-test-ui').classList.add('hidden');
    
    if (Model.state.mode === 'pendulum' || forceRoteFull) {
      this.getEl('capsule-pendulum').classList.remove('hidden');
      this.getEl('btn-prev').disabled = Model.state.currentIndex === 0;
      this.getEl('btn-next').style.display = (Model.state.currentIndex === Model.state.studyQueue.length - 1 && !isMemTest && !isRote) ? 'none' : 'flex';
      this.getEl('btn-finish').style.display = (Model.state.currentIndex === Model.state.studyQueue.length - 1 && !isMemTest && !isRote) ? 'flex' : 'none';
    } else if (Model.state.mode === 'srs') {
      this.getEl('capsule-srs').classList.remove('hidden');
      let idx = Model.state.studyQueue[Model.state.currentIndex];
      let times = Model.previewSRSTimes(idx);
      this.getEl('time-hard').innerText = times.hard; this.getEl('time-good').innerText = times.good; this.getEl('time-easy').innerText = times.easy;
    } else if (Model.state.mode === 'dual-track') {
      this.getEl('dual-track-ui').classList.remove('hidden');
      this.renderDualTrackUI(w);
    } else if (isMemTest || isRote) {
      this.getEl('memory-test-ui').classList.remove('hidden');
      this.renderMemoryTestUI(w, mode);
    }
    
    let autoSpeak = localStorage.getItem('autoSpeak') !== 'false';
    if (autoSpeak && !hideSpeaker) { Hardware.speakText(w.kana.replace(/[【】\[\]()]/g,'')); }
  },

  renderExampleBox(exString, boxId, mode = 'normal', targetWordObj = null) {
    let exBox = this.getEl(boxId);
    if (!exString) { exBox.style.display = 'none'; exBox.innerHTML = ''; return; }
    exBox.style.display = 'block';
    
    let processedStr = exString;
    if (mode === 'spell' && targetWordObj) {
        processedStr = exString.replace(/\\overset\{([^\}]+)\}\{([^\}]+)\}/g, (match, ruby, kanji) => {
            if (targetWordObj.word.includes(kanji) || targetWordObj.kana === ruby) return `\\overset{○}{${kanji}}`; return match;
        });
    }

    let htmlStr = processedStr.split('||').map(blk => {
        let parts = blk.split('/'); let jpPart = parts[0] ? parts[0].trim() : "暂无例句"; let cnPart = parts[1] ? parts[1].trim() : "";
        if (mode === 'choice' && cnPart) { return `<div class="ex-item"><div class="dt-ex-jp" style="opacity: 0;">${jpPart}</div><div class="dt-ex-cn hidden-translation" data-text="${cnPart}"><span class="material-symbols-rounded" style="font-size:1.1rem;">lock</span> 答对选项后解密</div></div>`; }
        return `<div class="ex-item"><div class="dt-ex-jp" style="opacity: 0;">${jpPart}</div><div class="dt-ex-cn revealed-translation">${cnPart}</div></div>`;
    }).join('');
    
    exBox.innerHTML = htmlStr;
    let jpExEls = exBox.querySelectorAll('.dt-ex-jp');
    if (window.MathJax) { MathJax.typesetPromise(Array.from(jpExEls)).then(() => jpExEls.forEach(el => el.style.opacity = '1')).catch(() => jpExEls.forEach(el => el.style.opacity = '1')); } 
    else { jpExEls.forEach(el => el.style.opacity = '1'); }
  },

  renderDualTrackUI(wObj) {
      if (Model.state.dtSubMode === 'spell') {
          this.getEl('dt-choice-area').classList.add('hidden'); this.getEl('dt-spell-area').classList.remove('hidden');
          let targetTokens = Model.splitKanaByMora(wObj.kana); Model.state.dtSpellTarget = targetTokens; Model.state.dtSpellCurrentIdx = 0;
          this.getEl('dt-spell-input').innerText = ''; 
          
          let poolSet = new Set();
          let neededFakes = Math.max(3, 12 - targetTokens.length);
          while(poolSet.size < neededFakes) { 
              let char = Gojuon[Math.floor(Math.random() * Gojuon.length)];
              if (!targetTokens.includes(char)) poolSet.add(char); 
          }
          let allTokens = [...targetTokens, ...Array.from(poolSet)].sort(() => Math.random() - 0.5); 
          
          let kb = this.getEl('dt-spell-keyboard'); kb.innerHTML = '';
          allTokens.forEach((token) => { let btn = document.createElement('div'); btn.className = 'dt-spell-key'; btn.innerText = token; btn.onclick = () => Controller.handleDtSpellClick(btn, token); kb.appendChild(btn); });
      } else if (Model.state.dtSubMode === 'choice') {
          this.getEl('dt-spell-area').classList.add('hidden'); this.getEl('dt-choice-area').classList.remove('hidden');
          let targetMeaning = wObj.meaning;
          let pool = Model.db.filter(x => x.folder === wObj.folder && x.type === wObj.type && x.word !== wObj.word && x.meaning !== targetMeaning);
          if (pool.length < 3) pool = Model.db.filter(x => x.word !== wObj.word && x.meaning !== targetMeaning); 
          pool = pool.sort(() => Math.random() - 0.5).slice(0, 3);
          let choices = [{text: targetMeaning, correct: true}];
          pool.forEach(x => choices.push({text: x.meaning, correct: false})); choices.sort(() => Math.random() - 0.5); 
          let cb = this.getEl('dt-choice-buttons'); cb.innerHTML = '';
          choices.forEach(c => { let btn = document.createElement('div'); btn.className = 'dt-choice-btn'; btn.innerText = c.text; btn.onclick = () => Controller.handleDtChoiceClick(btn, c.correct); cb.appendChild(btn); });
      }
  },
  
  renderMemoryTestUI(wObj, displayMode) {
      this.getEl('mt-warning').classList.add('hidden'); this.getEl('mt-spell-area').classList.add('hidden'); this.getEl('mt-choice-area').classList.add('hidden');
      if (displayMode === 'all') { this.getEl('mt-warning').classList.remove('hidden'); return; }

      let currentTestType = '';
      if (displayMode === 'word') { currentTestType = (Model.state.mtStep === 1) ? 'spell' : 'choice-meaning'; } 
      else if (displayMode === 'kana') { currentTestType = (Model.state.mtStep === 1) ? 'choice-word' : 'choice-meaning'; } 
      else if (displayMode === 'meaning') { currentTestType = (Model.state.mtStep === 1) ? 'spell' : 'choice-word'; }

      if (currentTestType === 'spell') {
          this.getEl('mt-spell-area').classList.remove('hidden');
          let targetTokens = Model.splitKanaByMora(wObj.kana); Model.state.dtSpellTarget = targetTokens; Model.state.dtSpellCurrentIdx = 0;
          this.getEl('mt-spell-input').innerText = ''; 
          
          let poolSet = new Set();
          let neededFakes = Math.max(3, 12 - targetTokens.length);
          while(poolSet.size < neededFakes) { 
              let char = Gojuon[Math.floor(Math.random() * Gojuon.length)];
              if (!targetTokens.includes(char)) poolSet.add(char); 
          }
          let allTokens = [...targetTokens, ...Array.from(poolSet)].sort(() => Math.random() - 0.5); 
          
          let kb = this.getEl('mt-spell-keyboard'); kb.innerHTML = '';
          allTokens.forEach((token) => { let btn = document.createElement('div'); btn.className = 'dt-spell-key'; btn.innerText = token; btn.onclick = () => Controller.handleMtSpellClick(btn, token, wObj, displayMode); kb.appendChild(btn); });
      } else if (currentTestType.startsWith('choice')) {
          this.getEl('mt-choice-area').classList.remove('hidden');
          let isMeaning = currentTestType === 'choice-meaning'; let targetText = isMeaning ? wObj.meaning : wObj.word;
          let pool = Model.db.filter(x => x.folder === wObj.folder && x.type === wObj.type && x.word !== wObj.word);
          if (pool.length < 3) pool = Model.db.filter(x => x.word !== wObj.word); 
          pool = pool.sort(() => Math.random() - 0.5).slice(0, 3);
          let choices = [{text: targetText, correct: true}];
          pool.forEach(x => choices.push({text: isMeaning ? x.meaning : x.word, correct: false})); choices.sort(() => Math.random() - 0.5); 
          let cb = this.getEl('mt-choice-buttons'); cb.innerHTML = '';
          choices.forEach(c => { let btn = document.createElement('div'); btn.className = 'dt-choice-btn'; btn.innerText = c.text; btn.onclick = () => Controller.handleMtChoiceClick(btn, c.correct, wObj, displayMode); cb.appendChild(btn); });
      }
  },

  resetWordbankRenderer() { Model.state.wbCurrentRendered = 0; this.getEl('wb-grid').innerHTML = ''; this.renderMoreWordbank(); },
  renderMoreWordbank() {
    const grid = this.getEl('wb-grid'); const cols = this.getEl('wb-col-select').value; const blurMode = this.getEl('wb-blur-select').value; const currentFilter = this.getEl('wb-folder-filter').value;
    grid.setAttribute('data-cols', cols);
    
    // 🌟 获取全局搜索关键字并进行过滤
    let searchInputEl = this.getEl('wb-search-input');
    let searchQuery = searchInputEl ? searchInputEl.value.trim().toLowerCase() : '';

    let filteredData = Model.db.map((w, i) => ({w, idx: i})).filter(item => {
        let matchFolder = (currentFilter === 'all' || item.w.folder === currentFilter);
        let matchSearch = !searchQuery || 
                          item.w.word.toLowerCase().includes(searchQuery) ||
                          item.w.kana.toLowerCase().includes(searchQuery) ||
                          item.w.meaning.toLowerCase().includes(searchQuery);
        return matchFolder && matchSearch;
    });
    
    if (filteredData.length === 0 && Model.state.wbCurrentRendered === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px; color: var(--outline);"><span class="material-symbols-rounded" style="font-size: 4rem; margin-bottom: 16px; opacity: 0.6;">search_off</span><div style="font-size: 1.1rem; font-weight: 700; color: var(--on-surface); opacity: 0.5;">没有找到匹配的词汇</div></div>`;
        this.getEl('wb-scroll-sentinel').style.display = 'none';
        return;
    }

    let slice = filteredData.slice(Model.state.wbCurrentRendered, Model.state.wbCurrentRendered + Model.state.wbRenderLimit);
    if (slice.length === 0) return;
    let fragment = document.createDocumentFragment();
    slice.forEach((item, innerIdx) => {
      let w = item.w, idx = item.idx; let visuals = this.getCardVisuals(w.type);
      let blurW = (blurMode !== 'all' && blurMode !== 'word') ? 'blur-text' : ''; let blurK = (blurMode !== 'all' && blurMode !== 'kana') ? 'blur-text' : ''; let blurM = (blurMode !== 'all' && blurMode !== 'meaning') ? 'blur-text' : '';
      let isChecked = Model.state.selectedSet.has(idx);
      let card = document.createElement('div'); card.className = 'wb-card'; card.style.background = visuals.bg; card.dataset.idx = idx; 
      card.style.animation = `fadeUpStagger 0.4s cubic-bezier(0.2, 0.8, 0.2, 1.1) ${innerIdx * 0.04}s forwards`;
      let safeWord = escapeHTML(w.word); let safeKana = escapeHTML(w.kana); let safeMean = escapeHTML(w.meaning);
      card.innerHTML = `<div class="watermark-layer"><div class="watermark">${visuals.wm}</div></div>${Model.state.batchMode ? `<div class="wb-checkbox ${isChecked ? 'checked' : ''}">${isChecked ? '✓' : ''}</div>` : ''}${cols !== '4' && !Model.state.batchMode ? `<div class="wb-c-speaker btn-wb-speak"><span class="material-symbols-rounded">volume_up</span></div>` : ''}<div class="wb-c-word ${blurW}"><span class="wb-blur-trigger">${safeWord}</span></div><div class="wb-c-kana ${blurK}"><span class="wb-blur-trigger">${safeKana}</span></div><div class="wb-c-mean ${blurM}"><span class="wb-blur-trigger">${safeMean}</span></div><div class="wb-manage-overlay ${Model.state.manageMode ? 'active' : ''}"><button class="wb-btn-move btn-wb-move"><span class="material-symbols-rounded">move_item</span></button><button class="wb-btn-edit btn-wb-edit"><span class="material-symbols-rounded">edit</span></button><button class="wb-btn-del btn-wb-del"><span class="material-symbols-rounded">delete</span></button></div>`;
      fragment.appendChild(card);
    });
    grid.appendChild(fragment); Model.state.wbCurrentRendered += slice.length;
    let sentinel = this.getEl('wb-scroll-sentinel');
    if (Model.state.wbCurrentRendered >= filteredData.length) { sentinel.style.display = 'none'; } else { sentinel.style.display = 'flex'; }
  },
  updateWordbankUI() {
    this.getEl('batch-bar').style.display = Model.state.batchMode ? 'flex' : 'none'; this.getEl('batch-count-num').innerText = Model.state.selectedSet.size;
    
    let batchBtn = this.getEl('wb-batch-toggle');
    if(batchBtn) {
        batchBtn.style.color = Model.state.batchMode ? "var(--tertiary)" : "var(--primary)";
        batchBtn.style.boxShadow = Model.state.batchMode ? "inset 0 2px 4px rgba(0,0,0,0.1), 0 1px 2px var(--paper-shadow)" : "";
    }
    
    let manageBtn = this.getEl('wb-manage-toggle');
    if(manageBtn) {
        manageBtn.style.color = Model.state.manageMode ? "var(--tertiary)" : "var(--primary)";
        manageBtn.style.boxShadow = Model.state.manageMode ? "inset 0 2px 4px rgba(0,0,0,0.1), 0 1px 2px var(--paper-shadow)" : "";
    }

    let selFilter = this.getEl('wb-folder-filter'); let currentVal = selFilter.value;
    selFilter.innerHTML = '<option value="all">查看所有词汇</option>'; 
    Model.folders.forEach(f => { selFilter.add(new Option(`${f}`, f)); });
    if(Model.folders.includes(currentVal) || currentVal === 'all') selFilter.value = currentVal;
    selFilter.dispatchEvent(new Event('facade-update'));
  }
};

const Controller = {
  init() {
    BottomSheet.init(); 
    Nav.init(); 
    Model.init(); 
    Hardware.init(); 
    View.renderDashboard(); 
    View.updateWordbankUI(); 
    this.bindEvents(); 
    this.setupIntersectionObserver();
    
    if(localStorage.getItem('theme') === 'dark') { document.body.setAttribute('data-theme', 'dark'); document.querySelectorAll('.theme-icon').forEach(icon => icon.innerText = 'light_mode'); }
    
    let autoSpeak = localStorage.getItem('autoSpeak') !== 'false'; 
    let autoSpeakCheck = View.getEl('setting-auto-speak');
    if(autoSpeakCheck) autoSpeakCheck.checked = autoSpeak;

    let volNavEnabled = localStorage.getItem('volNav') === 'true'; 
    let volCheck = View.getEl('setting-vol-nav');
    if(volCheck) volCheck.checked = volNavEnabled;

    let savedMode = localStorage.getItem('displayMode') || 'all'; View.getEl('next-display-mode').value = savedMode;
  },
  setupIntersectionObserver() {
    let observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting && document.getElementById('tab-wordbank').classList.contains('active')) View.renderMoreWordbank(); }, { rootMargin: '200px' });
    observer.observe(document.getElementById('wb-scroll-sentinel'));
  },

  bindEvents() {
    document.querySelectorAll('.modal-overlay').forEach(ov => { ov.addEventListener('click', (e) => { if(e.target === ov) window.toggleModal(ov.id, false); }); });
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => { btn.addEventListener('click', () => { Hardware.playSound('click'); Hardware.vibrate(20); View.toggleTheme(); }); });
    
    View.getEl('btn-exit-study').addEventListener('click', () => { Hardware.vibrate(20); window.speechSynthesis.cancel(); View.showPage('tab-home'); View.renderDashboard(); });

    View.getEl('btn-start-pendulum').addEventListener('click', () => { Hardware.unlockSpeech(); this.startPendulum('pendulum'); });
    View.getEl('btn-start-dual-track').addEventListener('click', () => { Hardware.unlockSpeech(); this.startPendulum('dual-track'); });
    View.getEl('btn-start-rote-learning').addEventListener('click', () => { Hardware.unlockSpeech(); this.startPendulum('rote-learning'); });
    View.getEl('btn-start-memory-test').addEventListener('click', () => { Hardware.unlockSpeech(); this.startPendulum('memory-test'); });
    View.getEl('btn-start-srs').addEventListener('click', () => { Hardware.unlockSpeech(); this.startSRS(); });

    View.getEl('btn-prev').addEventListener('click', () => { if(Model.state.isAnimating) return; if(Model.state.currentIndex > 0) { Model.state.currentIndex--; Hardware.playSound('click'); Hardware.vibrate(60); View.renderStudyCard('prev'); } });
    View.getEl('btn-next').addEventListener('click', () => { if(Model.state.isAnimating) return; if(Model.state.currentIndex < Model.state.studyQueue.length-1) { Model.state.currentIndex++; Hardware.playSound('click'); Hardware.vibrate(40); View.renderStudyCard('next'); } });
    View.getEl('btn-finish').addEventListener('click', () => this.finishPendulum());
    
    let displayTrigger = View.getEl('btn-display-mode-trigger');
    if (displayTrigger) {
        displayTrigger.addEventListener('click', () => {
            Hardware.playSound('click'); Hardware.vibrate(15);
            BottomSheet.open(View.getEl('next-display-mode'), document.createElement('span'));
        });
    }

    let autoSpeakCheck = View.getEl('setting-auto-speak');
    if (autoSpeakCheck) {
        autoSpeakCheck.addEventListener('change', (e) => {
            Hardware.playSound('click'); Hardware.vibrate(15);
            localStorage.setItem('autoSpeak', e.target.checked);
            showToast(e.target.checked ? "已开启自动朗读" : "已关闭自动朗读");
        });
    }

    let volCheck = View.getEl('setting-vol-nav');
    if (volCheck) {
        volCheck.addEventListener('change', (e) => {
            Hardware.playSound('click'); Hardware.vibrate(15);
            localStorage.setItem('volNav', e.target.checked);
            showToast(e.target.checked ? "已开启音量键翻页" : "已关闭音量键翻页");
        });
    }

    // 🌟 绑定搜索框实时事件
    let searchInput = View.getEl('wb-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            View.resetWordbankRenderer();
        });
    }

    // 🌟 绑定导入导出与备份事件
    let btnExport = View.getEl('btn-export-backup');
    if (btnExport) btnExport.addEventListener('click', () => this.exportBackup());
    
    let btnImport = View.getEl('btn-import-backup');
    let fileImport = View.getEl('file-import-backup');
    if (btnImport && fileImport) {
        btnImport.addEventListener('click', () => fileImport.click());
        fileImport.addEventListener('change', (e) => {
            if(e.target.files.length > 0) this.importBackup(e.target.files[0]);
            // 清空 value 使得再次选中同一个文件依然可以触发 change
            e.target.value = '';
        });
    }

    // 🌟 绑定 SRS 撤销时光机事件
    let undoBtn = View.getEl('btn-srs-undo');
    if (undoBtn) {
        undoBtn.addEventListener('click', () => this.undoSRS());
    }

    window.addEventListener('keydown', (e) => {
        if (localStorage.getItem('volNav') !== 'true') return;
        let isVolUp = (e.key === 'VolumeUp' || e.key === 'AudioVolumeUp' || e.code === 'VolumeUp' || e.keyCode === 175);
        let isVolDown = (e.key === 'VolumeDown' || e.key === 'AudioVolumeDown' || e.code === 'VolumeDown' || e.keyCode === 174);
        if (!isVolUp && !isVolDown) return;
        
        let inDetail = document.getElementById('detail-overlay').classList.contains('active');
        let inStudy = !document.getElementById('study-area').classList.contains('hidden');
        let isPendulum = Model.state.mode === 'pendulum';
        let isRoteFirstTime = Model.state.mode === 'rote-learning' && !document.getElementById('capsule-pendulum').classList.contains('hidden');
        
        if (!inDetail && !(inStudy && (isPendulum || isRoteFirstTime))) return;
        e.preventDefault(); 
        if (inDetail) { if (isVolDown) Controller.navDetail(1); else if (isVolUp) Controller.navDetail(-1); } else if (inStudy && (isPendulum || isRoteFirstTime)) { if (isVolDown && Model.state.currentIndex < Model.state.studyQueue.length - 1) { document.getElementById('btn-next').click(); } else if (isVolUp && Model.state.currentIndex > 0) { document.getElementById('btn-prev').click(); } }
    }, { passive: false });
    
    let lpBtn = View.getEl('btn-long-press');
    let punchTimer = null; let vibrateInterval = null;
    const clearPunch = () => { if(punchTimer) clearTimeout(punchTimer); if(vibrateInterval) clearInterval(vibrateInterval); punchTimer = null; vibrateInterval = null; if(lpBtn) lpBtn.classList.remove('pressing'); Hardware.stopChargeSound(); };

    if(lpBtn) {
        lpBtn.addEventListener('pointerdown', (e) => {
            if(lpBtn.classList.contains('done')) return; if(e.pointerType === 'mouse' && e.button !== 0) return;
            Hardware.unlockSpeech(); lpBtn.setPointerCapture(e.pointerId); lpBtn.classList.add('pressing'); Hardware.playChargeSound();
            vibrateInterval = setInterval(() => Hardware.vibrate(10), 100);
            punchTimer = setTimeout(() => { clearInterval(vibrateInterval); Hardware.stopChargeSound(); Hardware.playDingDong(); Hardware.vibrate(200); let t = new Date().toLocaleDateString('zh-CN'); Model.records.push({date: t, type: 'daily_punch'}); Model.saveRecords(); View.renderDashboard(); showToast("打卡成功！能量满点"); }, 1500);
        });
        lpBtn.addEventListener('pointerup', clearPunch); lpBtn.addEventListener('pointercancel', clearPunch); lpBtn.addEventListener('pointerleave', clearPunch); lpBtn.addEventListener('contextmenu', (e) => { e.preventDefault(); clearPunch(); });
    }

    ['next-display-mode', 'wb-col-select', 'wb-blur-select'].forEach(id => { View.getEl(id).addEventListener('change', (e) => { Hardware.playSound('click'); if(id === 'next-display-mode') { localStorage.setItem('displayMode', e.target.value); Model.state.mtStep = 1; View.renderStudyCard('none'); } else if(id.includes('wb')) { View.resetWordbankRenderer(); } }); });
    View.getEl('wb-folder-filter').addEventListener('change', () => { Hardware.playSound('click'); View.resetWordbankRenderer(); });
    ['again', 'hard', 'good', 'easy'].forEach(rating => { View.getEl(`srs-${rating}`).addEventListener('click', () => this.handleSRSRating(rating)); });
    View.getEl('btn-speaker').addEventListener('click', () => { Hardware.unlockSpeech(); let w = Model.db[Model.state.studyQueue[Model.state.currentIndex]]; Hardware.speakText(w.kana.replace(/[【】\[\]()]/g,'')); });
    View.getEl('star-btn').addEventListener('click', (e) => { Hardware.playSound('click'); let wordObj = Model.db[Model.state.studyQueue[Model.state.currentIndex]]; let idx = Model.stars.indexOf(wordObj.word); if(idx > -1) { Model.stars.splice(idx, 1); } else { Model.stars.push(wordObj.word); window.createStarParticles(e.currentTarget); Hardware.vibrate(20); } Model.saveStars(); View.renderStudyCard('none'); });

    document.addEventListener('click', (e) => { let target = e.target.closest('.blur-target, .wb-blur-trigger'); if (target && target.classList.contains('blur-text') || (target && target.parentElement.classList.contains('blur-text'))) { let el = target.classList.contains('blur-text') ? target : target.parentElement; el.classList.remove('blur-text'); Hardware.playSound('click'); Hardware.vibrate(15); } });

    let pressTimer = null; let isPressing = false; let startX = 0; let startY = 0; let startScrollY = 0;
    const clearPressCard = (card) => { if(pressTimer) clearTimeout(pressTimer); pressTimer = null; isPressing = false; if(card) card.classList.remove('pressing'); };
    
    const onPointerDownCard = (e) => {
        if(e.pointerType === 'mouse' && e.button !== 0) return; let card = e.target.closest('.wb-card'); if (!card || e.target.closest('button, .wb-checkbox, .wb-manage-overlay, .wb-c-speaker')) return; if (Model.state.batchMode || Model.state.manageMode) return;
        startX = e.clientX; startY = e.clientY; startScrollY = window.scrollY; isPressing = true; card.classList.add('pressing'); 
        pressTimer = setTimeout(() => { if(isPressing && Math.abs(window.scrollY - startScrollY) < 10) { Hardware.vibrate(50); Hardware.playSound('click'); Controller.openDetailModal(parseInt(card.dataset.idx)); clearPressCard(card); } }, 500);
    };
    const onPointerMoveCard = (e) => { if(!isPressing) return; if(Math.abs(e.clientX - startX) > 25 || Math.abs(e.clientY - startY) > 25) { let card = e.target.closest('.wb-card'); clearPressCard(card); } };
    const onPointerUpCard = (e) => { let card = e.target.closest('.wb-card'); clearPressCard(card); };

    let grid = View.getEl('wb-grid'); grid.addEventListener('pointerdown', onPointerDownCard); grid.addEventListener('pointermove', onPointerMoveCard); grid.addEventListener('pointerup', onPointerUpCard); grid.addEventListener('pointercancel', onPointerUpCard);
    
    grid.addEventListener('contextmenu', (e) => { if(e.target.closest('.wb-card')) e.preventDefault(); });

    grid.addEventListener('click', (e) => {
      let card = e.target.closest('.wb-card'); if (!card) return; let idx = parseInt(card.dataset.idx);
      if (e.target.closest('.btn-wb-speak') || e.target.closest('.wb-c-speaker')) { Hardware.unlockSpeech(); Hardware.speakText(Model.db[idx].kana.replace(/[【】\[\]()]/g,'')); Hardware.vibrate(10); return; }
      if (e.target.closest('.btn-wb-move')) { Hardware.playSound('click'); this.openMoveModal(idx); return; }
      if (e.target.closest('.btn-wb-edit')) { Hardware.playSound('click'); this.editWord(idx); return; }
      if (e.target.closest('.btn-wb-del')) { Hardware.playSound('click'); this.deleteWord(idx); return; }
      if (Model.state.batchMode && !e.target.closest('.wb-blur-trigger')) { if (Model.state.selectedSet.has(idx)) Model.state.selectedSet.delete(idx); else Model.state.selectedSet.add(idx); Hardware.playSound('click'); Hardware.vibrate(10); View.updateWordbankUI(); let checkEl = card.querySelector('.wb-checkbox'); if (checkEl) { checkEl.classList.toggle('checked'); checkEl.innerText = Model.state.selectedSet.has(idx) ? '✓' : ''; } }
    });

    View.getEl('wb-manage-toggle').addEventListener('click', () => { Hardware.playSound('click'); Hardware.vibrate(20); if(Model.state.batchMode) this.toggleBatchMode(); Model.state.manageMode = !Model.state.manageMode; View.updateWordbankUI(); document.querySelectorAll('.wb-manage-overlay').forEach(el => el.classList.toggle('active', Model.state.manageMode)); });
    View.getEl('wb-batch-toggle').addEventListener('click', () => this.toggleBatchMode()); View.getEl('btn-batch-cancel').addEventListener('click', () => this.toggleBatchMode());
    View.getEl('btn-new-folder').addEventListener('click', () => this.createFolder()); View.getEl('btn-del-folder').addEventListener('click', () => this.deleteFolder());
    View.getEl('btn-batch-move').addEventListener('click', () => this.openMoveModal(-2)); View.getEl('btn-batch-del').addEventListener('click', () => this.batchDelete());
    View.getEl('btn-confirm-move').addEventListener('click', () => this.confirmMove()); View.getEl('btn-cancel-move').addEventListener('click', () => window.toggleModal('move-overlay', false));
    View.getEl('btn-import').addEventListener('click', () => this.importWords());
    View.getEl('btn-view-settings').addEventListener('click', () => { window.toggleModal('view-settings-overlay', true); document.querySelectorAll('.vs-col-btn').forEach(b => { b.onclick = () => { document.querySelectorAll('.vs-col-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); View.getEl('wb-col-select').value = b.dataset.val; View.resetWordbankRenderer(); }}); document.querySelectorAll('.vs-blur-btn').forEach(b => { b.onclick = () => { document.querySelectorAll('.vs-blur-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); View.getEl('wb-blur-select').value = b.dataset.val; View.resetWordbankRenderer(); }}); });
    View.getEl('btn-reset').addEventListener('click', () => { showConfirm('恢复初始', '警告：将清空所有导入数据，恢复初始！', () => { Model.folders = ["默认词库"]; Model.db = DefaultWords.map(w => ({...w, folder: "默认词库"})); Model.saveDB(); Model.saveFolders(); Model.migrateSRSData(); View.updateWordbankUI(); View.resetWordbankRenderer(); Hardware.vibrate(100); }); });
    View.getEl('detail-close').addEventListener('click', () => window.toggleModal('detail-overlay', false)); View.getEl('detail-prev').addEventListener('click', () => this.navDetail(-1)); View.getEl('detail-next').addEventListener('click', () => this.navDetail(1));
    View.getEl('btn-save-edit').addEventListener('click', () => { if(Model.editingIdx > -1) { let w = Model.db[Model.editingIdx]; w.word = View.getEl('edit-word').value.trim(); w.kana = View.getEl('edit-kana').value.trim(); w.type = View.getEl('edit-type').value.trim(); w.meaning = View.getEl('edit-meaning').value.trim(); Model.saveDB(); View.resetWordbankRenderer(); window.toggleModal('edit-overlay', false); showToast("修改已保存"); } });
    View.getEl('btn-cancel-edit').addEventListener('click', () => window.toggleModal('edit-overlay', false));
  },

  // 🌟 修复后的：导出数据备份逻辑 (原生分享面板 + 安全挂载兜底)
  exportBackup() {
      Hardware.playSound('success');
      Hardware.vibrate(50);
      let data = {
          db: Model.db,
          folders: Model.folders,
          stars: Model.stars,
          records: Model.records,
          version: "v3",
          exportDate: new Date().toISOString()
      };
      
      let fileName = `钟摆日语备份_${new Date().toLocaleDateString('zh-CN').replace(/\//g,'-')}.json`;
      let blob = new Blob([JSON.stringify(data)], {type: "application/json"});

      // 方案 A：针对手机端 PWA（尤其是 iOS 和安卓），调用系统原生分享/存储面板
      if (navigator.share && navigator.canShare) {
          let file = new File([blob], fileName, { type: "application/json" });
          if (navigator.canShare({ files: [file] })) {
              navigator.share({
                  files: [file],
                  title: '钟摆日语数据备份',
              }).then(() => {
                  showToast("已成功调起保存面板");
              }).catch((e) => {
                  console.log('分享取消或失败', e);
                  this.fallbackDownload(blob, fileName);
              });
              return;
          }
      }
      
      // 方案 B：针对电脑端或不支持原生分享的浏览器（修正后的传统下载）
      this.fallbackDownload(blob, fileName);
  },

  // 传统下载降级方案
  fallbackDownload(blob, fileName) {
      let url = URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      // ⚠️ 关键修复：必须把 a 标签真正挂载到页面 DOM 上，浏览器才会允许触发下载
      document.body.appendChild(a); 
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("尝试唤起本地下载...");
  },

  // 🌟 新增：导入数据恢复逻辑
  importBackup(file) {
      if (!file) return;
      let reader = new FileReader();
      reader.onload = (e) => {
          try {
              let data = JSON.parse(e.target.result);
              if (data && data.db && data.folders) {
                  Model.db = data.db;
                  Model.folders = data.folders;
                  Model.stars = data.stars || [];
                  Model.records = data.records || [];
                  Model.saveDB(); Model.saveFolders(); Model.saveStars(); Model.saveRecords();
                  Hardware.playSound('success'); Hardware.vibrate(100);
                  showToast("数据恢复成功！");
                  setTimeout(() => location.reload(), 1000); // 强行刷新页面加载新数据
              } else {
                  Hardware.playSound('error'); Hardware.vibrate(50);
                  showToast("备份文件格式不正确");
              }
          } catch(err) {
              Hardware.playSound('error'); Hardware.vibrate(50);
              showToast("解析文件失败");
          }
      };
      reader.readAsText(file);
  },

  startPendulum(launchMode = 'pendulum') {
    let sel = View.getEl('group-select'); if(!sel.value) return;
    Hardware.playSound('click'); 
    Model.state.currentGroupLabel = sel.options[sel.selectedIndex].text;
    
    let [type, folderName, idxStr] = sel.value.split('|'); let idx = parseInt(idxStr);
    let startIdx = idx * 10; let endIdx = startIdx + 10;
    
    let sourceWords = Model.db.map((w, i) => ({w, i})).filter(item => item.w.folder === folderName).slice(startIdx, endIdx);
    if(sourceWords.length === 0) return;

    Model.state.mode = launchMode; Model.state.currentIndex = 0; Model.state.dtWordAppearanceMap = {}; Model.state.mtStep = 1; 
    Model.state.currentWordFailed = false;

    if (launchMode === 'memory-test') {
        Model.state.studyQueue = sourceWords.map(x => x.i).sort(() => Math.random() - 0.5);
        Model.state.totalTestWords = Model.state.studyQueue.length;
    } else {
        Model.state.studyQueue = []; let len = sourceWords.length;
        for (let i = 0; i < len; i++) {
          Model.state.studyQueue.push(sourceWords[i].i);
          for (let j = i - 1; j >= 0; j--) Model.state.studyQueue.push(sourceWords[j].i);
          for (let k = 1; k <= i; k++) Model.state.studyQueue.push(sourceWords[k].i);
        }
    }
    
    let savedMode = localStorage.getItem('displayMode') || 'all'; View.getEl('next-display-mode').value = savedMode; View.getEl('next-display-mode').dispatchEvent(new Event('facade-update'));
    View.showPage('study-area'); let c = View.getEl('pixel-matrix'); c.innerHTML=''; View.renderStudyCard('none'); Hardware.vibrate(40);
  },

  handleDtSpellClick(btn, token) {
      if (Model.state.isAnimating || btn.classList.contains('used')) return;
      let targetChar = Model.state.dtSpellTarget[Model.state.dtSpellCurrentIdx];
      if (token === targetChar) {
          Hardware.playSound('click'); Hardware.vibrate(15); btn.classList.add('used'); Model.state.dtSpellCurrentIdx++;
          View.getEl('dt-spell-input').innerText = Model.state.dtSpellTarget.slice(0, Model.state.dtSpellCurrentIdx).join('');
          if (Model.state.dtSpellCurrentIdx >= Model.state.dtSpellTarget.length) { 
              Model.state.isAnimating = true; Hardware.playSound('success'); Hardware.vibrate(50); setTimeout(() => this.dtAdvanceNext(), 300); 
          }
      } else { Hardware.playSound('error'); Hardware.vibrate(50); btn.classList.remove('shake-anim', 'wrong'); void btn.offsetWidth; btn.classList.add('shake-anim', 'wrong'); }
  },

  handleDtChoiceClick(btn, isCorrect) {
      if (Model.state.isAnimating) return;
      if (isCorrect) {
          Model.state.isAnimating = true; btn.classList.add('correct'); Hardware.playSound('success'); Hardware.vibrate(40);
          document.getElementById('w-example-box').querySelectorAll('.dt-ex-cn.hidden-translation').forEach(el => { 
              el.style.transform = 'rotateX(90deg)'; el.style.opacity = '0';
              setTimeout(() => { el.innerText = el.dataset.text; el.className = 'dt-ex-cn revealed-translation'; el.style.transform = 'rotateX(-90deg)'; void el.offsetWidth; el.style.transform = 'rotateX(0)'; el.style.opacity = '1'; }, 150);
          });
          document.querySelectorAll('.dt-choice-btn').forEach(b => b.style.pointerEvents = 'none'); setTimeout(() => this.dtAdvanceNext(), 600);
      } else { Hardware.playSound('error'); Hardware.vibrate(50); btn.classList.remove('shake-anim', 'wrong'); void btn.offsetWidth; btn.classList.add('shake-anim', 'wrong'); }
  },

  handleMtSpellClick(btn, token, wObj, displayMode) {
      if (Model.state.isAnimating || btn.classList.contains('used')) return;
      let targetChar = Model.state.dtSpellTarget[Model.state.dtSpellCurrentIdx];
      if (token === targetChar) {
          Hardware.playSound('click'); Hardware.vibrate(15); btn.classList.add('used'); Model.state.dtSpellCurrentIdx++;
          View.getEl('mt-spell-input').innerText = Model.state.dtSpellTarget.slice(0, Model.state.dtSpellCurrentIdx).join('');
          if (Model.state.dtSpellCurrentIdx >= Model.state.dtSpellTarget.length) { 
              Model.state.isAnimating = true; Hardware.playSound('success'); Hardware.vibrate(50); 
              if(displayMode === 'word' || displayMode === 'meaning') { View.getEl('w-kana').innerText = wObj.kana; View.getEl('w-kana').classList.add('shake-anim'); setTimeout(() => View.getEl('w-kana').classList.remove('shake-anim'), 300); }
              setTimeout(() => { Model.state.mtStep = 2; Model.state.isAnimating = false; View.renderMemoryTestUI(wObj, displayMode); }, 600); 
          }
      } else { 
          Hardware.playSound('error'); Hardware.vibrate(50); 
          btn.classList.remove('shake-anim', 'wrong'); void btn.offsetWidth; btn.classList.add('shake-anim', 'wrong');
          Model.state.currentWordFailed = true;
      }
  },

  handleMtChoiceClick(btn, isCorrect, wObj, displayMode) {
      if (Model.state.isAnimating) return;
      if (isCorrect) {
          Model.state.isAnimating = true; btn.classList.add('correct'); Hardware.playSound('success'); Hardware.vibrate(40);
          if (Model.state.mtStep === 1) {
              View.getEl('w-word').innerText = wObj.word; View.getEl('w-word').classList.add('shake-anim'); setTimeout(() => View.getEl('w-word').classList.remove('shake-anim'), 300);
              setTimeout(() => { Model.state.mtStep = 2; Model.state.isAnimating = false; View.renderMemoryTestUI(wObj, displayMode); }, 600);
          } else {
              if (displayMode === 'word' || displayMode === 'kana') { View.getEl('w-meaning').innerText = wObj.meaning; } else if (displayMode === 'meaning') { View.getEl('w-word').innerText = wObj.word; }
              View.getEl('w-example-box').style.display = 'block'; document.querySelectorAll('#mt-choice-buttons .dt-choice-btn').forEach(b => b.style.pointerEvents = 'none'); setTimeout(() => this.mtAdvanceNext(), 800);
          }
      } else { 
          Hardware.playSound('error'); Hardware.vibrate(50); 
          btn.classList.remove('shake-anim', 'wrong'); void btn.offsetWidth; btn.classList.add('shake-anim', 'wrong'); 
          Model.state.currentWordFailed = true;
      }
  },

  dtAdvanceNext() { Model.state.currentIndex++; if (Model.state.currentIndex >= Model.state.studyQueue.length) { this.finishPendulum(); } else { View.renderStudyCard('next'); } },
  
  mtAdvanceNext() { 
      if (Model.state.mode === 'memory-test') {
          if (Model.state.currentWordFailed) { let failedIdx = Model.state.studyQueue.shift(); Model.state.studyQueue.push(failedIdx); } else { Model.state.studyQueue.shift(); }
          Model.state.currentWordFailed = false; Model.state.mtStep = 1; Model.state.currentIndex = 0; 
          if (Model.state.studyQueue.length === 0) this.finishPendulum(); else View.renderStudyCard('next');
      } else {
          Model.state.currentIndex++; Model.state.mtStep = 1; 
          if (Model.state.currentIndex >= Model.state.studyQueue.length) this.finishPendulum(); else View.renderStudyCard('next'); 
      }
  },

  finishPendulum() {
    Hardware.playSound('success'); Hardware.vibrate(1000); let t = new Date().toLocaleDateString('zh-CN');
    let exist = Model.records.findIndex(x => x.date === t && x.group === Model.state.currentGroupLabel && x.type === 'pendulum');
    if(exist === -1) Model.records.unshift({date: t, group: Model.state.currentGroupLabel, type: 'pendulum'}); Model.saveRecords();
    showToast("任务完成"); View.getEl('btn-exit-study').click();
  },

  startSRS() {
    Hardware.playSound('click'); let queue = Model.getSRSDueQueue();
    if(queue.length === 0) return showToast("今天没有需要复习的单词");
    Model.state.studyQueue = queue; Model.state.mode = 'srs'; Model.state.currentIndex = 0; 
    Model.state.srsHistory = []; // 清空时光机记录
    let savedMode = localStorage.getItem('displayMode') || 'all'; View.getEl('next-display-mode').value = savedMode; View.getEl('next-display-mode').dispatchEvent(new Event('facade-update'));
    View.showPage('study-area'); let c = View.getEl('pixel-matrix'); c.innerHTML=''; View.renderStudyCard('none'); Hardware.vibrate(40);
  },

  handleSRSRating(rating) {
    if (Model.state.isAnimating) return;
    Model.state.isAnimating = true; Hardware.playSound('click'); Hardware.vibrate(30); 
    let btn = View.getEl(`srs-${rating}`); btn.classList.add('btn-active-feedback');
    setTimeout(() => {
        btn.classList.remove('btn-active-feedback'); 
        let realIdx = Model.state.studyQueue[Model.state.currentIndex]; 

        // 🌟 核心逻辑：记录操作发生前的旧状态压入时光机栈
        Model.state.srsHistory.push({
            idx: realIdx,
            oldSrs: JSON.parse(JSON.stringify(Model.db[realIdx].srs)), // 深度克隆旧状态
            rating: rating
        });

        // 执行新状态计算
        Model.calculateSRS(realIdx, rating); 

        // 如果点了忘记，原逻辑会把它强行塞到队尾
        if (rating === 'again') { Model.state.studyQueue.push(realIdx); }
        
        Model.state.currentIndex++; Model.state.isAnimating = false;
        
        if (Model.state.currentIndex >= Model.state.studyQueue.length) { 
            Hardware.playSound('success'); Hardware.vibrate(1000); showToast("智能复习队列已清空"); View.getEl('btn-exit-study').click(); 
        } else { 
            View.renderStudyCard('next'); 
        }
    }, 300);
  },

  // 🌟 新增：SRS 时光机撤销逻辑
  undoSRS() {
      if (Model.state.isAnimating || Model.state.srsHistory.length === 0) return;
      Hardware.playSound('click'); Hardware.vibrate(40);

      // 从栈顶弹出上一步操作记录
      let lastAction = Model.state.srsHistory.pop();

      // 1. 将单词的 SRS 状态强行覆盖回旧版本
      Model.db[lastAction.idx].srs = lastAction.oldSrs;
      Model.saveDB();

      // 2. 如果上一步手滑点了「忘记」，我们需要把塞到队尾的那个分身给强行拔掉
      if (lastAction.rating === 'again') {
          Model.state.studyQueue.pop();
      }

      // 3. 游标倒退，画面倒退
      Model.state.currentIndex--;
      View.renderStudyCard('prev');
      showToast("已撤销上一步评级");
  },

  toggleBatchMode() { Hardware.playSound('click'); Hardware.vibrate(20); Model.state.batchMode = !Model.state.batchMode; Model.state.selectedSet.clear(); if (Model.state.batchMode && Model.state.manageMode) { Model.state.manageMode = false; } View.updateWordbankUI(); View.resetWordbankRenderer(); },
  createFolder() { Hardware.vibrate(20); showPrompt("请输入新文件夹名称", "", (name) => { if(Model.folders.includes(name)) return showToast("文件夹已存在"); Model.folders.push(name); Model.saveFolders(); View.updateWordbankUI(); }); },
  deleteFolder() { Hardware.vibrate(20); let filter = View.getEl('wb-folder-filter').value; if (filter === 'all' || filter === '默认词库') return showToast("不能删除默认词库"); showConfirm('删除文件夹', `确定要删除「${filter}」吗？里面的单词会自动退回默认词库。`, () => { Model.db.forEach(w => { if(w.folder === filter) w.folder = "默认词库"; }); Model.folders = Model.folders.filter(f => f !== filter); Model.saveFolders(); Model.saveDB(); View.getEl('wb-folder-filter').value = "all"; View.updateWordbankUI(); View.resetWordbankRenderer(); showToast("已删除"); }); },
  openMoveModal(idx) { if (idx === -2 && Model.state.selectedSet.size === 0) return showToast("未选词"); Model.state.moveTargetIdx = idx; let destSelect = View.getEl('move-dest-select'); destSelect.innerHTML = ''; Model.folders.forEach(f => { destSelect.add(new Option(f, f)); }); destSelect.dispatchEvent(new Event('facade-update')); window.toggleModal('move-overlay', true); },
  confirmMove() { Hardware.playSound('success'); Hardware.vibrate(40); let dest = View.getEl('move-dest-select').value; if (Model.state.moveTargetIdx === -2) { Model.state.selectedSet.forEach(idx => Model.db[idx].folder = dest); this.toggleBatchMode(); } else { Model.db[Model.state.moveTargetIdx].folder = dest; } Model.saveDB(); window.toggleModal('move-overlay', false); View.resetWordbankRenderer(); showToast("移动成功");},
  batchDelete() { Hardware.playSound('click'); Hardware.vibrate(30); if(Model.state.selectedSet.size === 0) return showToast("未选中任何单词"); showConfirm('批量删除', `确定删除这 ${Model.state.selectedSet.size} 个单词？`, () => { Model.db = Model.db.filter((_, i) => !Model.state.selectedSet.has(i)); Model.saveDB(); this.toggleBatchMode(); showToast("已批量删除"); }); },
  
  editWord(idx) { Model.editingIdx = idx; let w = Model.db[idx]; View.getEl('edit-word').value = w.word; View.getEl('edit-kana').value = w.kana; View.getEl('edit-type').value = w.type; View.getEl('edit-meaning').value = w.meaning; window.toggleModal('edit-overlay', true); },
  deleteWord(idx) { showConfirm('删除单词', '彻底删除该词？', () => { Model.db.splice(idx,1); Model.saveDB(); View.resetWordbankRenderer(); showToast("已删除"); }); },
  importWords() { Hardware.playSound('success'); let text = View.getEl('custom-input').value.trim(); if(!text) return; let target = View.getEl('wb-folder-filter').value; if(target === 'all') target = "默认词库"; let added = 0; text.split('\n').forEach(line => { let parts = line.includes('\t') ? line.split('\t') : line.split(/[,，]/); if(parts.length >= 4){ Model.db.push({ word: parts[0].trim(), kana: parts[1].trim(), type: parts[2].trim(), meaning: parts[3].trim(), example: parts[4] ? parts[4].trim() : "", folder: target, srs: { ease: 2.5, interval: 0, nextReview: Date.now() } }); added++; } }); if(added) { Model.saveDB(); View.resetWordbankRenderer(); showToast(`成功导入 ${added} 词`); View.getEl('custom-input').value=''; } },
  openDetailModal(idx) { let currentFilter = View.getEl('wb-folder-filter').value; Model.state.detailArray = []; Model.db.forEach((w, i) => { if(currentFilter === 'all' || w.folder === currentFilter) Model.state.detailArray.push(i); }); Model.state.activeDetailIdx = Model.state.detailArray.indexOf(idx); window.toggleModal('detail-overlay', true); this.renderDetailCard('none'); },
  navDetail(dir) { Model.state.activeDetailIdx += dir; let max = Model.state.detailArray.length; if (Model.state.activeDetailIdx < 0) Model.state.activeDetailIdx = max - 1; if (Model.state.activeDetailIdx >= max) Model.state.activeDetailIdx = 0; Hardware.playSound('click'); Hardware.vibrate(30); this.renderDetailCard(dir > 0 ? 'next' : 'prev'); },
  
  renderDetailCard(anim) {
    let realIdx = Model.state.detailArray[Model.state.activeDetailIdx]; let w = Model.db[realIdx]; let wrapper = View.getEl('dt-anim-wrapper'); wrapper.className = 'detail-anim-wrapper';
    if(anim !== 'none') { wrapper.classList.add(anim === 'next' ? 'anim-slide-out-left' : 'anim-slide-out-right'); setTimeout(() => { this.updateDetailContent(w); wrapper.className = 'detail-anim-wrapper'; wrapper.classList.add(anim === 'next' ? 'anim-slide-in-right' : 'anim-slide-in-left'); }, 200); } else { this.updateDetailContent(w); }
  },
  updateDetailContent(w) { let visuals = View.getCardVisuals(w.type); document.querySelector('#detail-card-container .watermark-layer').style.background = visuals.bg; View.getEl('dt-watermark').innerText = visuals.wm; View.getEl('dt-word').innerText = w.word; View.getEl('dt-kana').innerText = w.kana; View.getEl('dt-type').innerHTML = visuals.tagsHTML; View.getEl('dt-mean').innerText = w.meaning; View.renderExampleBox(w.example, 'dt-example-box'); }
};

window.onload = () => Controller.init();
