/**
 * 钟摆日语 - 核心控制逻辑
 * 修复版 (PWA 离线优化 + iOS TTS 唤醒强化 + 全局马达振动覆盖)
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
    document.getElementById('dialog-confirm').onclick = () => { Hardware.vibrate(15); window.toggleModal('dialog-overlay', false); onConfirm(); };
    document.getElementById('dialog-cancel').onclick = () => { Hardware.vibrate(10); window.toggleModal('dialog-overlay', false); };
};

window.showPrompt = (title, defaultVal, onConfirm) => {
    document.getElementById('prompt-title').innerHTML = title;
    let input = document.getElementById('prompt-input');
    input.value = defaultVal || ''; 
    window.toggleModal('prompt-overlay', true);
    setTimeout(() => input.focus(), 100);
    document.getElementById('prompt-confirm').onclick = () => { 
        Hardware.vibrate(15);
        let val = input.value.trim(); if(val) { window.toggleModal('prompt-overlay', false); onConfirm(val); }
    };
    document.getElementById('prompt-cancel').onclick = () => { Hardware.vibrate(10); window.toggleModal('prompt-overlay', false); };
};

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

        if (targetId === 'tab-home') {
            View.renderDashboard();
        } else if (targetId === 'tab-records') {
            View.renderLeaderboard();
        } else if (targetId === 'tab-wordbank') {
            if(Model.state.renderedStartIndex === -1) {
                View.resetWordbankRenderer();
            } else {
                View.renderVirtualGrid();
            }
        }
        
        window.dispatchEvent(new Event('scroll')); 
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
            if(sel.style.marginTop) facade.style.marginTop = sel.style.marginTop;
            
            let textSpan = document.createElement('span');
            textSpan.className = 'bs-facade-text';
            textSpan.innerText = sel.options[sel.selectedIndex]?.text || '';
            let arrowSpan = document.createElement('span');
            arrowSpan.className = 'material-symbols-rounded'; arrowSpan.innerText = 'keyboard_arrow_down'; arrowSpan.style.opacity = '0.5';
            
            facade.appendChild(textSpan); facade.appendChild(arrowSpan);
            sel.style.display = 'none'; sel.parentNode.insertBefore(facade, sel.nextSibling);
            
            facade.addEventListener('click', () => { Hardware.vibrate(10); this.open(sel, textSpan); });
            sel.addEventListener('facade-update', () => { textSpan.innerText = sel.options[sel.selectedIndex]?.text || ''; });
        });
    },
    open(selectEl, textSpan) {
        let container = document.getElementById('bs-options'); container.innerHTML = '';
        let titleMap = {
            'test-range-select': '选择检验范围',
            'test-display-select': '默认显示模式',
            'next-display-mode': '遮盖模式',
            'wb-folder-filter': '选择词库',
            'move-dest-select': '移动至目标文件夹'
        };
        document.getElementById('bs-title').innerText = titleMap[selectEl.id] || "请选择";
        
        Array.from(selectEl.options).forEach(opt => {
            let btn = document.createElement('div');
            btn.className = 'bs-option ' + (opt.selected ? 'selected' : '');
            
            if (selectEl.id === 'test-range-select' || selectEl.id === 'wb-folder-filter') {
                let iconHTML = `<span class="material-symbols-rounded" style="opacity:0.6;">folder</span>`;
                if (opt.value === 'all') iconHTML = `<span class="material-symbols-rounded" style="opacity:0.6;">grid_view</span>`;
                else if (opt.value === 'virtual_starred') iconHTML = `<span class="material-symbols-rounded" style="color:#fbbc04; font-variation-settings: 'FILL' 1;">star</span>`;
                else if (opt.value === 'virtual_cleared') iconHTML = `<span class="material-symbols-rounded" style="color:var(--tertiary);">workspace_premium</span>`;
                else if (opt.value === 'virtual_uncleared') iconHTML = `<span class="material-symbols-rounded" style="color:var(--outline);">hourglass_empty</span>`;
                btn.innerHTML = `<div style="display:flex; align-items:center; gap:8px; justify-content:center;">${iconHTML}<span>${opt.text}</span></div>`;
            } else {
                btn.innerText = opt.text;
            }

            btn.onclick = () => {
                Hardware.vibrate(15);
                selectEl.value = opt.value;
                if (selectEl.id === 'test-range-select') localStorage.setItem('lastTestRange', opt.value);
                if (selectEl.id === 'test-display-select') localStorage.setItem('lastTestDisplay', opt.value);
                if (selectEl.id === 'wb-folder-filter') localStorage.setItem('lastSelectedFolder', opt.value);
                
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
  mtGroupClears: {}, mtWordClears: {},
  state: {
    mode: 'none', studyQueue: [], currentIndex: 0, currentGroupLabel: '', currentGroupKey: '',
    dtWordAppearanceMap: {}, dtSubMode: '', dtSpellTarget: [], dtSpellCurrentIdx: 0,
    mtRound: 1, mtStep: 1, currentWordFailed: false, totalTestWords: 0, mtBaseQueue: [],
    ftState: 'A', ftHint: null, ftShowKanaHint: false,
    comboCount: 0, maxSessionCombo: 0, sessionSaved: false,
    maxProgressSeen: 0, uniqueWordCount: 0, initialQueueLength: 0,
    batchMode: false, manageMode: false, selectedSet: new Set(), activeDetailIdx: 0, detailArray: [], moveTargetIdx: -1, 
    isAnimating: false, filteredDb: [], renderedStartIndex: -1, renderedEndIndex: -1
  },
  
  lbState: {
      singleMode: 'dual-track', 
      page: 1,
      pageSize: 50
  },

  async init() { await this.loadData(); },
  
  async loadData() {
    let storedDB = await idbKeyval.get('myWordDB_v3');
    if (storedDB) {
        this.db = storedDB;
        this.folders = await idbKeyval.get('myFolders_v3') || ["默认词库"];
        this.stars = await idbKeyval.get('starredWords') || [];
        this.records = await idbKeyval.get('studyRecords') || [];
        this.mtGroupClears = await idbKeyval.get('mtGroupClears_v3') || {};
        this.mtWordClears = await idbKeyval.get('mtWordClears_v3') || {};
    } else {
        let lsDB = localStorage.getItem('myWordDB_v3');
        if (lsDB) {
            this.db = JSON.parse(lsDB);
            this.folders = JSON.parse(localStorage.getItem('myFolders_v3')) || ["默认词库"];
            this.stars = JSON.parse(localStorage.getItem('starredWords')) || [];
            this.records = JSON.parse(localStorage.getItem('studyRecords')) || [];
            this.mtGroupClears = JSON.parse(localStorage.getItem('mtGroupClears_v3')) || {};
            this.mtWordClears = JSON.parse(localStorage.getItem('mtWordClears_v3')) || {};
            
            await Promise.all([
                this.saveDB(), this.saveFolders(), this.saveStars(), 
                this.saveRecords(), this.saveClears()
            ]);
            ['myWordDB_v3', 'myFolders_v3', 'starredWords', 'studyRecords', 'mtGroupClears_v3', 'mtWordClears_v3'].forEach(k => localStorage.removeItem(k));
} else {
          this.db = DefaultWords.map(w => ({...w, folder: "默认词库"})); 
          await this.saveDB(); 
      }
  }
  // 修复：清洗旧版 mtWordClears 中的数字值为三维对象
  let needSave = false;
  for (let word in this.mtWordClears) {
      if (typeof this.mtWordClears[word] === 'number') {
          this.mtWordClears[word] = { kanji: false, kana: false, meaning: false };
          needSave = true;
      }
  }
  if (needSave) await this.saveClears();
},
  saveDB() { return idbKeyval.set('myWordDB_v3', this.db); },
  saveFolders() { return idbKeyval.set('myFolders_v3', this.folders); },
  saveStars() { return idbKeyval.set('starredWords', this.stars); },
  saveRecords() { return idbKeyval.set('studyRecords', this.records); },
  
  // 🚀 新增：三维靶向统一过滤器
  checkFilter(w, filterName) {
      let st = this.mtWordClears[w.word] || { kanji:false, kana:false, meaning:false };
      if (typeof st === 'number') st = { kanji:false, kana:false, meaning:false }; // 清洗旧数据

      if (filterName === 'virtual_starred') return this.stars.includes(w.word);
      if (filterName === 'virtual_cleared') return st.kanji && st.kana && st.meaning; // 必须三杠全满
      if (filterName === 'virtual_uncleared') return !(st.kanji && st.kana && st.meaning); // 只要差一杠就算未通关
      // 🚀 正向筛选：全景词库展示用的“已了解”
      if (filterName === 'virtual_know_kanji') return st.kanji;
      if (filterName === 'virtual_know_kana') return st.kana;
      if (filterName === 'virtual_know_meaning') return st.meaning;
      // 🚀 反向筛选：学习和检验攻坚用的“未了解”
      if (filterName === 'virtual_miss_kanji') return !st.kanji;
      if (filterName === 'virtual_miss_kana') return !st.kana;
      if (filterName === 'virtual_miss_meaning') return !st.meaning;
      
      return w.folder === (filterName === 'default' ? '默认词库' : filterName);
  },

  saveClears() {
      return Promise.all([
          idbKeyval.set('mtGroupClears_v3', this.mtGroupClears),
          idbKeyval.set('mtWordClears_v3', this.mtWordClears)
      ]);
  },
  
  updateFilteredDb(searchQuery, currentFilter) {
      this.state.filteredDb = this.db.map((w, idx) => ({w, idx})).filter(item => {
          let matchFolder = currentFilter === 'all' ? true : this.checkFilter(item.w, currentFilter);
          let matchSearch = !searchQuery || 
                            item.w.word.toLowerCase().includes(searchQuery) ||
                            item.w.kana.toLowerCase().includes(searchQuery) ||
                            item.w.meaning.toLowerCase().includes(searchQuery);
          return matchFolder && matchSearch;
      });
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
  audioCtx: null, jaVoiceCache: null, chargeOsc: null, chargeGain: null, _currentAudio: null,
  init() {
    try {
        if (window.speechSynthesis) {
          let loadVoice = () => { this.jaVoiceCache = window.speechSynthesis.getVoices().find(v => v.lang.includes('ja') || v.lang.includes('JP')); };
          loadVoice();
          if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = loadVoice;
        }
    } catch(e) {}
  },
  vibrate(pattern) { 
  try { 
    if (navigator.vibrate) {
      return navigator.vibrate(pattern);
    }
    return false;
  } catch(e) {
    return false;
  }
},
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
isSpeechUnlocked: false,
      unlockSpeech() {
    try { 
        if (!window.speechSynthesis) return;
        // 预加载日语语音列表
        if (!this.jaVoiceCache) {
            let voices = window.speechSynthesis.getVoices();
            this.jaVoiceCache = voices.find(v => v.lang.includes('ja') || v.lang.includes('JP'));
        }
        if (this.isSpeechUnlocked) return;
        let unlock = new SpeechSynthesisUtterance(''); 
        unlock.volume = 0; 
        window.speechSynthesis.speak(unlock); 
        this.isSpeechUnlocked = true; 
    } catch(e) {}
},
      // --- 新增一个专门用来兜底的辅助函数 ---
fallbackLocalTTS(text, isSentence = false, onComplete = null) {
    if (!window.speechSynthesis) {
        if (onComplete) onComplete();
        return;
    }
    // 若语音缓存不存在，尝试再次获取
    if (!this.jaVoiceCache) {
        let voices = window.speechSynthesis.getVoices();
        this.jaVoiceCache = voices.find(v => v.lang.includes('ja') || v.lang.includes('JP'));
    }
    
    // 用 50ms 延迟避开 cancel() 的清空判定期
    setTimeout(() => {
        let msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'ja-JP';
        msg.rate = isSentence ? 0.75 : 0.8;
        if (this.jaVoiceCache) msg.voice = this.jaVoiceCache;
        
        // 绑定语音结束或出错的回调，用来恢复樱花按钮状态
        if (onComplete) {
            msg.onend = onComplete;
            msg.onerror = onComplete;
        }
        
        // 某些浏览器需要确保 speechSynthesis 未处于暂停状态
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        window.speechSynthesis.speak(msg);
    }, 50);
},

      // --- 核心发音控制器 (带樱花微交互版) ---
async speakText(text, btnEl = null) {
  try {
      if (typeof text !== 'string' || text.trim() === '') return;
      // 取消之前的所有 TTS 播放，防止重叠
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      // 同时停止任何正在播放的在线音频（简单处理：静默销毁）
      if (this._currentAudio) {
          this._currentAudio.pause();
          this._currentAudio = null;
      }
            
            // 🌸 接管按钮：将其变成樱花加载状态
            let iconEl = null; let originalIcon = '';
            if (btnEl) {
                btnEl.classList.add('speaker-loading');
                iconEl = btnEl.querySelector('.material-symbols-rounded');
                if (iconEl) { originalIcon = iconEl.innerText; iconEl.innerText = 'spa'; }
            }
            // 🌸 恢复按钮状态的辅助闭包
            const revertBtn = () => { if (btnEl) { btnEl.classList.remove('speaker-loading'); if (iconEl) iconEl.innerText = originalIcon || 'volume_up'; } };

            let isSentence = text.length > 12 || /[。？！，、]/.test(text);
            let engine = localStorage.getItem('ttsEngine') || 'youdao';

            // 🗣️ 1. 拦截分流：如果你选了“本地”，或者（选了“有道”且点的是长例句）
 if (engine === 'local' || (engine === 'youdao' && isSentence)) {
    // 将恢复按钮的闭包传给底层，等真的读完了再把樱花变回喇叭
    this.fallbackLocalTTS(text, isSentence, revertBtn);
    return;
}

            // 🗣️ 2. 网易有道模式 (只有短单词会走到这里)
if (engine === 'youdao') {
    const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&le=jap`;
    // 彻底清理上一个音频实例
    if (this._currentAudio) {
        this._currentAudio.pause();
        this._currentAudio.src = '';
        this._currentAudio.load();
        this._currentAudio = null;
    }
    const audio = new Audio(url);
    audio.playbackRate = 0.85;
    audio.oncanplaythrough = revertBtn; 
    audio.onerror = () => { this.fallbackLocalTTS(text, isSentence); revertBtn(); };
    this._currentAudio = audio;
    audio.play().catch(() => { this.fallbackLocalTTS(text, isSentence); revertBtn(); });
    return;
}
            // 🗣️ 3. 微软 Azure 模式 (单词和长例句通吃！)
if (engine === 'azure') {
    const workerUrl = "https://ibka.moyu54433.workers.dev/v1/audio/speech";
    
    const response = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "tts-1", input: text, voice: "ja-JP-NanamiNeural" })
    });

    if (!response.ok) throw new Error("Azure API 请求失败");
    const blob = await response.blob();
    
    // 彻底清理上一个音频实例
    if (this._currentAudio) {
        this._currentAudio.pause();
        if (this._currentAudio.src) URL.revokeObjectURL(this._currentAudio.src);
        this._currentAudio = null;
    }

    const audio = new Audio(URL.createObjectURL(blob));
    // 🐌 智能降速：微软读长例句时，自动降速到 0.75，方便你听写和辨音
    audio.playbackRate = isSentence ? 0.75 : 0.85;
    audio.oncanplaythrough = revertBtn; 
    audio.onerror = () => { this.fallbackLocalTTS(text, isSentence); revertBtn(); };
    this._currentAudio = audio;
    audio.play().catch(() => { this.fallbackLocalTTS(text, isSentence); revertBtn(); });
}
        } catch(e) {
            console.warn("[TTS] 在线引擎失效，降级为本地发音", e);
            // 发生错误时也要记得把樱花变回小喇叭
            if (btnEl) { btnEl.classList.remove('speaker-loading'); let i = btnEl.querySelector('.material-symbols-rounded'); if(i) i.innerText = 'volume_up'; }
            this.fallbackLocalTTS(text, isSentence);
        }
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
  
  toggleTheme(e) {
    let isDark = document.body.getAttribute('data-theme') === 'dark';
    let toggleAction = () => {
        if (isDark) { document.body.removeAttribute('data-theme'); localStorage.setItem('theme', 'light'); document.querySelectorAll('.theme-icon').forEach(icon => icon.innerText = 'light_mode'); } 
        else { document.body.setAttribute('data-theme', 'dark'); localStorage.setItem('theme', 'dark'); document.querySelectorAll('.theme-icon').forEach(icon => icon.innerText = 'dark_mode'); }
    };
    if (!document.startViewTransition) { toggleAction(); return; }
    const x = e ? (e.clientX || (e.touches && e.touches[0].clientX)) : window.innerWidth / 2;
    const y = e ? (e.clientY || (e.touches && e.touches[0].clientY)) : window.innerHeight / 2;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    document.documentElement.classList.add('theme-switching');
    const transition = document.startViewTransition(toggleAction);
    transition.ready.then(() => {
        document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`], opacity: [0.5, 1] }, { duration: 400, easing: 'cubic-bezier(0.2, 0.0, 0, 1.0)', pseudoElement: '::view-transition-new(root)' });
        document.documentElement.animate({ filter: ['brightness(1) blur(0px)', 'brightness(0.6) blur(4px)'] }, { duration: 400, easing: 'cubic-bezier(0.2, 0.0, 0, 1.0)', pseudoElement: '::view-transition-old(root)' });
    });
    transition.finished.then(() => { document.documentElement.classList.remove('theme-switching'); });
  },
  
  getCardVisuals(typeStr) {
    if (!typeStr) return { bg: 'var(--surface-container)', wm: '', tagsHTML: '' };
    let wm = '';
    if (typeStr.includes('自他')) wm = 'が / を'; else if (typeStr.includes('自')) wm = 'が'; else if (typeStr.includes('他')) wm = 'を';
    const getCat = (t) => {
        if (t.includes('形容动词') || t.includes('形动')) return { color: 'var(--bg-adj-na)' };
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
    // 兜底：如果 bg 是默认色但实际应有颜色，确保至少有一个背景
    if (bg === 'var(--surface-container)' && tagsHTML) {
        bg = 'var(--bg-other)';
    }
    return { bg, wm, tagsHTML };
  },

  updateComboBadge() {
      let badge = this.getEl('combo-badge');
      if (!badge) return;

      if (Model.state.mode !== 'rote-learning' && Model.state.mode !== 'dual-track' && Model.state.mode !== 'memory-test') {
          badge.classList.remove('active', 'tier-2', 'tier-3');
          return;
      }
      
      let count = Model.state.comboCount;
      if (count > 0) {
          badge.innerText = `Combo x${count}`;
          badge.className = 'combo-badge active';
          void badge.offsetWidth; 
          badge.classList.add('combo-pop');

          if (count >= 10) badge.classList.add('tier-3');
          else if (count >= 5) badge.classList.add('tier-2');
      } else {
          badge.className = 'combo-badge';
      }
  },
  
  updatePixelMatrix() {
    let c = this.getEl('pixel-matrix');
    let mode = Model.state.mode;
    
    let totalPixels = 10;
    let displayCurrent = 0;
    
    if (mode === 'memory-test') {
        let total = Model.state.mtBaseQueue.length;
        totalPixels = total;
        displayCurrent = total - Model.state.studyQueue.length;
    } else if (mode === 'filter-test') {
        let totalWords = Model.state.studyQueue.length;
        if (totalWords <= 100) {
            totalPixels = totalWords;
            displayCurrent = Model.state.currentIndex;
        } else {
            totalPixels = 10;
            displayCurrent = Math.floor((Model.state.currentIndex / totalWords) * 10);
        }
    } else if (mode === 'rote-learning') {
        totalPixels = 10;
        let ratio = Model.state.initialQueueLength ? (Model.state.currentIndex / Model.state.initialQueueLength) : 0;
        let currentProgress = Math.floor(ratio * 10);
        
        if (currentProgress > Model.state.maxProgressSeen) {
            Model.state.maxProgressSeen = currentProgress;
        }
        displayCurrent = Model.state.maxProgressSeen;
    } else if (mode === 'pendulum' || mode === 'dual-track') {
        totalPixels = Model.state.studyQueue.length;
        displayCurrent = Model.state.currentIndex;
    }
    
    if (displayCurrent > totalPixels) displayCurrent = totalPixels;

    if (totalPixels <= 10) {
        c.classList.add('compact-mode');
    } else {
        c.classList.remove('compact-mode');
    }

    while (c.children.length < totalPixels) { let p = document.createElement('div'); p.className = 'pixel'; c.appendChild(p); }
    while (c.children.length > totalPixels) { c.removeChild(c.lastChild); }
    
    Array.from(c.children).forEach((p, i) => {
      p.className = (i < displayCurrent) ? 'pixel filled' : (i === displayCurrent ? 'pixel current' : 'pixel');
      p.style.setProperty('--fill-color', ['#e0d7cd','#d1c5b8','#c2b4a3','#b2a18d','#a28f78','#917e62','#816d4d','#705b38','#5f4923','#4e370e'][Math.min(9, Math.floor((i/totalPixels)*10))]);
    });
  },

  renderLeaderboard() {
      let allComboRecords = Model.records.filter(r => r.type === 'combo_record');
      let mode = Model.lbState.singleMode;
      
      document.querySelectorAll('#lb-tabs .g-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
      
      let filtered = allComboRecords.filter(r => r.mode === mode);
      filtered.sort((a, b) => b.combo - a.combo || b.timestamp - a.timestamp);

      let listEl = this.getEl('lb-single-list');
      let limit = Model.lbState.page * Model.lbState.pageSize;
      let displayList = filtered.slice(0, limit);
      
      let html = '';
      if (filtered.length === 0) {
          html = `<div style="text-align:center; padding: 40px 20px; opacity: 0.5;">暂无挑战记录</div>`;
      } else {
          displayList.forEach((r, idx) => {
              let rankHTML = '';
              if (idx === 0) rankHTML = `<span class="material-symbols-rounded" style="color: #d4af37; font-size: 2.2rem; font-variation-settings: 'FILL' 1;">filter_vintage</span>`;
              else if (idx === 1) rankHTML = `<span class="material-symbols-rounded" style="color: #C0C0C0; font-size: 1.8rem; font-variation-settings: 'FILL' 1;">filter_vintage</span>`;
              else if (idx === 2) rankHTML = `<span class="material-symbols-rounded" style="color: #cd7f32; font-size: 1.8rem; font-variation-settings: 'FILL' 1;">filter_vintage</span>`;
              else rankHTML = `<span style="font-size: 1.1rem; font-weight: 800; opacity: 0.4;">#${idx + 1}</span>`;

              html += `
              <div style="display:flex; justify-content:space-between; align-items:center; padding: 14px 12px; border-bottom: 1px solid var(--outline);">
                 <div>
                    <div style="font-size: 1.3rem; font-weight: 800; color: var(--primary); margin-bottom: 4px;">${r.combo} 连击</div>
                    <div style="font-size: 0.8rem; opacity: 0.7;">${r.dateStr} · ${r.group}</div>
                 </div>
                 <div style="display:flex; align-items:center; justify-content:center; width:40px;">${rankHTML}</div>
              </div>`;
          });
      }
      listEl.innerHTML = html;
      
      let btnMore = this.getEl('btn-lb-load-more');
      if (filtered.length > limit) { 
          btnMore.style.display = 'block'; 
          btnMore.onclick = () => { Hardware.vibrate(10); Model.lbState.page++; this.renderLeaderboard(); }; 
      } else { 
          btnMore.style.display = 'none'; 
      }
  },

  updateGroupTabs() {
      let tabsContainer = this.getEl('gs-tabs');
      if (!tabsContainer) return;
      
      let currentActive = tabsContainer.querySelector('.active') ? tabsContainer.querySelector('.active').dataset.cat : 'default';
      tabsContainer.innerHTML = '';
      
      Model.folders.forEach(f => {
          let catVal = f === '默认词库' ? 'default' : f;
          let tab = document.createElement('div');
          tab.className = `g-tab ${currentActive === catVal ? 'active' : ''}`;
          tab.dataset.cat = catVal;
          tab.innerText = f;
          tabsContainer.appendChild(tab);
      });
      
      const virtuals = [
          { cat: 'virtual_cleared', text: '完全通关' },
          { cat: 'virtual_uncleared', text: '所有未通关' },
          { cat: 'virtual_miss_kanji', text: '未了解汉字' },
          { cat: 'virtual_miss_kana', text: '未了解读音' },
          { cat: 'virtual_miss_meaning', text: '未了解释义' },
          { cat: 'virtual_starred', text: '收藏' }
      ];
      virtuals.forEach(v => {
          let tab = document.createElement('div');
          tab.className = `g-tab ${currentActive === v.cat ? 'active' : ''}`;
          tab.dataset.cat = v.cat;
          tab.innerText = v.text;
          tabsContainer.appendChild(tab);
      });

      if (!tabsContainer.querySelector('.active')) {
          let defTab = tabsContainer.querySelector('[data-cat="default"]');
          if(defTab) defTab.classList.add('active');
      }
  },

  renderGroupBottomSheet(cat) {
      let container = this.getEl('group-list-container');
      if (!container) return;
      container.innerHTML = '';
      
      try {
          let catVal = cat || 'default';
          let words = Model.db.map((w, i) => ({w, i})).filter(item => {
              return Model.checkFilter(item.w, catVal);
          });

          // 🚀 智能识别胜利状态的禅意缺省页
          if (words.length === 0) {
              let emptyText = "当前空空如也";
              let iconStr = "spa"; // 基础禅意莲花
              let jpTitle = "【 空 無 】";
              
              if(catVal === 'virtual_starred') { emptyText = "暂无收藏，去发现心动词汇吧"; }
              if(catVal === 'virtual_cleared') { emptyText = "路漫漫其修远兮，继续攀登吧"; }
              if(catVal === 'virtual_uncleared' || catVal.includes('virtual_miss_')) { 
                  // 攻坚完成的胜利状态！
                  emptyText = "此维度盲区已彻底扫清！"; 
                  iconStr = "radio_button_unchecked"; // 禅宗圆相 ⭕️，代表绝对的圆满
                  jpTitle = "【 円 相 】";
              }
              
              container.innerHTML = `<div style="text-align:center; padding: 60px 20px;">
                  <span class="material-symbols-rounded" style="font-size: 4.5rem; opacity: 0.4; margin-bottom: 20px; color: #8F9779;">${iconStr}</span>
                  <div style="font-size: 1.2rem; font-weight: 800; color: var(--on-surface); opacity: 0.8; font-family: var(--font-jp-serif), serif; letter-spacing: 2px;">${jpTitle}</div>
                  <div style="font-weight: 500; font-size: 0.95rem; opacity: 0.6; color: var(--on-surface); margin-top: 12px;">${emptyText}</div>
              </div>`;
              return;
          }

          let i = 0; let total = words.length;
          let fragment = document.createDocumentFragment();
          
          let activeTabEl = document.querySelector('#gs-tabs .active');
          let catLabel = activeTabEl ? activeTabEl.innerText : (catVal === 'default' ? '默认词库' : catVal);

while (i * 10 < total) {
    let startIdx = i * 10;
    let endIdx = Math.min(startIdx + 10, total);
              let btn = document.createElement('div');
              btn.className = 'bs-option';
              
              let groupVal = `group|${catVal}|${i}`;
              let clears = Model.mtGroupClears[groupVal] || 0;
              let badgeHTML = '';
              
              // 🚀 修复：如果当前是「未通关」分类，强制不显示段位勋章
              if (catVal !== 'virtual_uncleared' && (clears > 0 || catVal === 'virtual_cleared')) {
                  let badgeClass = 'hanko-bronze'; 
                  if (clears >= 10 || catVal === 'virtual_cleared') badgeClass = 'hanko-diamond'; 
                  else if (clears >= 5) badgeClass = 'hanko-gold';
                  else if (clears >= 3) badgeClass = 'hanko-silver';
                  badgeHTML = `<span class="hanko-badge ${badgeClass}"></span>`;
              }
              
              btn.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; width:100%;"><span>第 ${startIdx + 1}-${endIdx} 词</span>${badgeHTML}</div>`;

              let displayTxt = `${catLabel} (第 ${startIdx + 1}-${endIdx} 词)`;

              if (localStorage.getItem('lastCustomGroupVal') === groupVal) {
                  btn.classList.add('selected');
              }

              btn.onclick = () => {
                  Hardware.playSound('click'); Hardware.vibrate(15);
                  Model.state.currentGroupKey = groupVal;
                  Model.state.currentGroupLabel = displayTxt;
                  this.getEl('custom-group-text').innerText = displayTxt;
                  localStorage.setItem('lastCustomGroupVal', groupVal);
                  localStorage.setItem('lastCustomGroupTxt', displayTxt);
                  window.toggleModal('group-select-overlay', false);
              };
              fragment.appendChild(btn);
              i++;
              if (i > 1000) break; 
          }
          container.appendChild(fragment);
      } catch(err) {
          console.error(err);
          container.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--accent-red); font-size: 0.9rem;">加载出错，请重试或重置应用</div>`;
      }
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

    let selFilter = this.getEl('wb-folder-filter'); 
    let currentVal = selFilter.value;
    selFilter.innerHTML = ''; 
    selFilter.add(new Option('查看所有词汇', 'all'));
    selFilter.add(new Option('收藏词汇', 'virtual_starred'));
    selFilter.add(new Option('完全通关词汇', 'virtual_cleared'));
    selFilter.add(new Option('所有未通关', 'virtual_uncleared'));
    selFilter.add(new Option('专项图鉴: 汉字了解(黄)', 'virtual_know_kanji'));
    selFilter.add(new Option('专项图鉴: 读音了解(红)', 'virtual_know_kana'));
    selFilter.add(new Option('专项图鉴: 释义了解(白)', 'virtual_know_meaning'));
    
    Model.folders.forEach(f => { selFilter.add(new Option(`${f}`, f)); });
    
    let lastFolder = localStorage.getItem('lastSelectedFolder') || currentVal;
    if(Array.from(selFilter.options).some(opt => opt.value === lastFolder)) {
        selFilter.value = lastFolder;
    } else {
        selFilter.value = 'all';
    }
    selFilter.dispatchEvent(new Event('facade-update'));

    this.updateGroupTabs();
  },

  renderDashboard() {
    let dbTotalEl = this.getEl('db-total-count');
    if (dbTotalEl) dbTotalEl.innerText = Model.db.length;
    
    let stats = Model.calculateStats();
    this.getEl('total-days').innerText = stats.totalDays;
    this.getEl('streak-days').innerText = stats.streak;

    // 🚀 核心计算：三维技能树进度
    let clearedWordsCount = 0, kanjiCount = 0, kanaCount = 0, meaningCount = 0;
    
    Object.values(Model.mtWordClears).forEach(st => {
        if (typeof st === 'object') {
            if (st.kanji && st.kana && st.meaning) clearedWordsCount++;
            if (st.kanji) kanjiCount++;
            if (st.kana) kanaCount++;
            if (st.meaning) meaningCount++;
        }
    });

    let totalWordsCount = Model.db.length;
    let masteryPercent = totalWordsCount === 0 ? 0 : ((clearedWordsCount / totalWordsCount) * 100).toFixed(1);
    let pKanji = totalWordsCount === 0 ? 0 : ((kanjiCount / totalWordsCount) * 100).toFixed(1);
    let pKana = totalWordsCount === 0 ? 0 : ((kanaCount / totalWordsCount) * 100).toFixed(1);
    let pMeaning = totalWordsCount === 0 ? 0 : ((meaningCount / totalWordsCount) * 100).toFixed(1);

    if (this.getEl('mastery-count')) this.getEl('mastery-count').innerText = clearedWordsCount;
    if (this.getEl('mastery-total')) this.getEl('mastery-total').innerText = totalWordsCount;
    if (this.getEl('mastery-percent')) this.getEl('mastery-percent').innerText = `(${masteryPercent}%)`;
    
    // 触发动画渲染进度条
    setTimeout(() => {
        if (this.getEl('mastery-bar')) this.getEl('mastery-bar').style.width = `${masteryPercent}%`;
        
        if (this.getEl('prog-bar-kanji')) this.getEl('prog-bar-kanji').style.width = `${pKanji}%`;
        if (this.getEl('prog-bar-kana')) this.getEl('prog-bar-kana').style.width = `${pKana}%`;
        if (this.getEl('prog-bar-meaning')) this.getEl('prog-bar-meaning').style.width = `${pMeaning}%`;
        
        if (this.getEl('prog-txt-kanji')) this.getEl('prog-txt-kanji').innerHTML = `${kanjiCount} <span style="font-size:0.85em; opacity:0.6;">(${pKanji}%)</span>`;
        if (this.getEl('prog-txt-kana')) this.getEl('prog-txt-kana').innerHTML = `${kanaCount} <span style="font-size:0.85em; opacity:0.6;">(${pKana}%)</span>`;
        if (this.getEl('prog-txt-meaning')) this.getEl('prog-txt-meaning').innerHTML = `${meaningCount} <span style="font-size:0.85em; opacity:0.6;">(${pMeaning}%)</span>`;
    }, 50);

    let lastTxt = localStorage.getItem('lastCustomGroupTxt') || '默认词库 (第 1-10 词)';
    this.getEl('custom-group-text').innerText = lastTxt;

    this.updateTestSelects();

    let lastTestDisplay = localStorage.getItem('lastTestDisplay') || 'kana';
    let displaySel = this.getEl('test-display-select');
    if (displaySel && Array.from(displaySel.options).some(o => o.value === lastTestDisplay)) {
        displaySel.value = lastTestDisplay;
        displaySel.dispatchEvent(new Event('facade-update'));
    }
    
    let t = new Date().toLocaleDateString('zh-CN'); let btn = this.getEl('btn-long-press');
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

  updateTestSelects() {
      let testSel = this.getEl('test-range-select');
      let currentTest = testSel.value || localStorage.getItem('lastTestRange') || '默认词库';

      testSel.innerHTML = '';
      
      // 🚀 核心增加：在这里补齐“已了解”的复习巩固选项
      let options = [
          { text: '默认词库', val: '默认词库' },
          { text: '收藏词汇', val: 'virtual_starred' },
          { text: '完全通关词汇', val: 'virtual_cleared' },
          { text: '所有未通关', val: 'virtual_uncleared' },
          { text: '专项攻坚: 未了解汉字(黄)', val: 'virtual_miss_kanji' },
          { text: '专项攻坚: 未了解读音(红)', val: 'virtual_miss_kana' },
          { text: '专项攻坚: 未了解释义(白)', val: 'virtual_miss_meaning' },
          { text: '复习巩固: 已了解汉字(黄)', val: 'virtual_know_kanji' },
          { text: '复习巩固: 已了解读音(红)', val: 'virtual_know_kana' },
          { text: '复习巩固: 已了解释义(白)', val: 'virtual_know_meaning' }
      ];
      
      Model.folders.forEach(f => {
          if(f !== '默认词库') options.push({ text: f, val: f });
      });

      options.forEach(opt => { testSel.add(new Option(opt.text, opt.val)); });

      if (Array.from(testSel.options).some(o => o.value === currentTest)) testSel.value = currentTest;
      testSel.dispatchEvent(new Event('facade-update'));
  },

  renderStudyCard(anim = 'none') {
    let idx = Model.state.studyQueue[Model.state.currentIndex];
    let w = Model.db[idx];
    let mode = this.getEl('next-display-mode').value;
    
    let isMemTest = (Model.state.mode === 'memory-test');
    let isRote = (Model.state.mode === 'rote-learning');
    let isFilterTest = (Model.state.mode === 'filter-test');
    
    let forceRoteFull = false;
    if (isRote) {
    let isFirstAppearance = Model.state.studyQueue.indexOf(idx) === Model.state.currentIndex;
    if (isFirstAppearance) { 
        forceRoteFull = true; 
        mode = 'all'; 
        Model.state.mtStep = 1; // 重置遮盖步骤
    }
}

    if (Model.state.mode === 'dual-track') {
        Model.state.dtWordAppearanceMap[idx] = (Model.state.dtWordAppearanceMap[idx] || 0) + 1;
        let count = Model.state.dtWordAppearanceMap[idx];
        Model.state.dtSubMode = ((count - 1) % 5 < 3) ? 'choice' : 'spell';
        mode = 'all';
    }

    if (isMemTest) {
        let remain = Model.state.studyQueue.length;
        let total = Model.state.mtBaseQueue.length;
        this.getEl('progress-text').innerText = `Round ${Model.state.mtRound} : ${total - remain + 1} / ${total}`;
    } else {
        this.getEl('progress-text').innerText = `${Model.state.currentIndex + 1} / ${Model.state.studyQueue.length}`;
    }
    
    if (Model.state.mode === 'pendulum' || Model.state.mode === 'dual-track' || isMemTest || isRote || isFilterTest) {
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
            this.updateCardContent(w, visuals, mode, forceRoteFull, isMemTest, isRote, isFilterTest);
            card.classList.remove('anim-slide-out-left', 'anim-slide-out-right');
            card.classList.add(anim === 'next' ? 'anim-slide-in-right' : 'anim-slide-in-left');
            setTimeout(() => { Model.state.isAnimating = false; }, 200); 
        }, 200); 
    } else {
        this.updateCardContent(w, visuals, mode, forceRoteFull, isMemTest, isRote, isFilterTest);
        Model.state.isAnimating = false; 
    }
  },

  updateCardContent(w, visuals, mode, forceRoteFull, isMemTest, isRote, isFilterTest) {
    this.getEl('mt-blind-audio-ui').classList.add('hidden');
    this.getEl('w-word').style.display = 'block';
    this.getEl('w-kana').style.display = 'block';
    this.getEl('w-meaning').style.display = 'block';
    this.getEl('w-type').style.display = 'flex';
    this.getEl('w-example-box').style.display = 'block';

    let mask = (str) => '■'.repeat(Array.from(str || '').length);
    let maskFixed = "■■■"; 

    if (isFilterTest) {
        let displayMode = this.getEl('test-display-select').value || 'kana'; 
        let st = Model.state.ftState; 
        let hint = Model.state.ftHint;
        let showKanaHint = Model.state.ftShowKanaHint; 

        let isVisible = (field) => {
            if (st === 'C') return true;
            if (displayMode === field) return true;
            if (st === 'B' && hint === field) return true;
            return false;
        };

        let showW = isVisible('word');
        let showK = isVisible('kana') || showKanaHint; 
        let showM = isVisible('meaning');
        let showA = isVisible('audio');

        this.getEl('w-word').innerText = showW ? w.word : maskFixed;
        this.getEl('w-kana').innerText = showK ? w.kana.replace(/[【】\[\]()]/g,'') : maskFixed;
        this.getEl('w-meaning').innerText = showM ? w.meaning : maskFixed;
        this.getEl('w-type').innerHTML = visuals.tagsHTML;
        this.getEl('w-type').style.display = st === 'C' ? 'flex' : 'none'; 

        ['word','kana','meaning','type'].forEach(k => {
             let el = this.getEl(`w-${k}`);
             el.className = (k === 'word') ? 'word-main' : (k === 'type' ? 'type-row' : `${k}-row`);
        });

        let blindAudioUi = this.getEl('mt-blind-audio-ui');
        if (st === 'C') {
            blindAudioUi.classList.add('hidden');
            this.getEl('w-word').style.display = 'block';
        } else {
            if (displayMode === 'audio') {
                blindAudioUi.classList.remove('hidden');
                if (!showW) this.getEl('w-word').style.display = 'none';
            }
        }

        this.getEl('btn-speaker').style.display = showA || st === 'C' ? 'block' : 'none';
        
        if ((st === 'A' && displayMode === 'audio') || (st === 'B' && hint === 'audio')) {
             Hardware.speakText(w.kana.replace(/[【】\[\]()]/g,''));
        }

        this.renderExampleBox(w.example, 'w-example-box', 'normal', w);
        this.getEl('w-example-box').style.display = st === 'C' ? 'block' : 'none';
        this.getEl('w-example-box').className = 'dt-example-box';

        this.getEl('capsule-pendulum').classList.add('hidden');
        this.getEl('dual-track-ui').classList.add('hidden');
        this.getEl('memory-test-ui').classList.add('hidden');
        this.getEl('btn-display-mode-trigger').style.display = 'none';
        this.getEl('star-btn').style.display = st === 'C' ? 'block' : 'none'; 
        this.getEl('star-icon').style.fontVariationSettings = Model.stars.includes(w.word) ? "'FILL' 1" : "'FILL' 0";

        if (st === 'C') {
            this.getEl('capsule-filter-test').classList.add('hidden');
            this.getEl('capsule-filter-judge').classList.remove('hidden');
        } else {
            this.getEl('capsule-filter-judge').classList.add('hidden');
            this.getEl('capsule-filter-test').classList.remove('hidden');
            let blurBtn = this.getEl('ft-blur');
            if (st === 'B') blurBtn.style.display = 'none'; 
            else blurBtn.style.display = 'flex';
        }
        
        return; 
    }

    let showWord = true, showKana = true, showMeaning = true;
    
    if (isRote && mode !== 'all' && !forceRoteFull) {
        if (mode === 'word') { showKana = Model.state.mtStep > 1; showMeaning = false; } 
        else if (mode === 'kana') { showWord = Model.state.mtStep > 1; showMeaning = false; } 
        else if (mode === 'meaning') { showKana = Model.state.mtStep > 1; showWord = false; }
    }

    // 🚀 核心优化 1：主卡片动态字号排版
    let finalWord = (!showWord && !isMemTest) ? mask(w.word) : w.word;
    let wWordEl = this.getEl('w-word');
    wWordEl.innerText = finalWord;
    
    // 按字符长度阶梯式缩小字号
    let wLen = Array.from(finalWord || '').length;
    if (wLen >= 10) wWordEl.style.fontSize = '1.8rem';
    else if (wLen >= 7) wWordEl.style.fontSize = '2.2rem';
    else if (wLen >= 5) wWordEl.style.fontSize = '2.6rem';
    else wWordEl.style.fontSize = ''; // 恢复 CSS 默认的巨大字号

    this.getEl('w-kana').innerText = (!showKana && !isMemTest) ? mask(w.kana.replace(/[【】\[\]()]/g,'')) : w.kana;
    this.getEl('w-meaning').innerText = (!showMeaning && !isMemTest) ? mask(w.meaning) : w.meaning;
    this.getEl('w-type').innerHTML = visuals.tagsHTML; 
    
    let isStarred = typeof w.word === 'string' && Model.stars.includes(w.word);
    let starIcon = this.getEl('star-icon');
    if (starIcon) starIcon.style.fontVariationSettings = isStarred ? "'FILL' 1" : "'FILL' 0";
    this.getEl('star-btn').style.display = 'block';

    let isDtSpell = (Model.state.mode === 'dual-track' && Model.state.dtSubMode === 'spell');
    let isDtChoice = (Model.state.mode === 'dual-track' && Model.state.dtSubMode === 'choice');

    if (!isMemTest && !isRote) {
        this.getEl('w-kana').style.display = isDtSpell ? 'none' : 'block';
        this.getEl('w-meaning').style.display = isDtChoice ? 'none' : 'block';
    } else if (!isMemTest) {
        this.getEl('w-kana').style.display = 'block';
        this.getEl('w-meaning').style.display = 'block';
    }
    
    let hideSpeaker = isDtSpell || isMemTest || (isRote && mode !== 'kana' && mode !== 'all' && !forceRoteFull);
    this.getEl('btn-speaker').style.display = hideSpeaker ? 'none' : 'block';
    
    let displayTrigger = this.getEl('btn-display-mode-trigger');
    if (displayTrigger) displayTrigger.style.display = (Model.state.mode === 'dual-track' || isMemTest) ? 'none' : 'inline-flex';

    this.renderExampleBox(w.example, 'w-example-box', Model.state.mode === 'dual-track' ? Model.state.dtSubMode : 'normal', w);

    if (!isMemTest && !isRote && Model.state.mode !== 'dual-track') {
        ['word','kana','type','meaning'].forEach(k => {
            let el = this.getEl(`w-${k}`);
            el.className = (k === 'word') ? 'word-main blur-target' : (k === 'type' ? 'type-row blur-target' : `${k}-row blur-target`);
            if (mode !== 'all' && mode !== k && !(mode === 'meaning' && k === 'type')) el.classList.add('blur-text');
        });
        let exBox = this.getEl('w-example-box'); exBox.className = 'dt-example-box blur-target';
        if (mode !== 'all' && mode !== 'meaning') exBox.classList.add('blur-text');
    } else if (isMemTest) {
        ['word','kana','type','meaning'].forEach(k => { let el = this.getEl(`w-${k}`); el.className = (k === 'word') ? 'word-main' : (k === 'type' ? 'type-row' : `${k}-row`); });
        this.getEl('w-example-box').className = 'dt-example-box'; this.getEl('w-example-box').style.display = 'none';
    } else if (forceRoteFull) {
        ['word','kana','type','meaning'].forEach(k => { let el = this.getEl(`w-${k}`); el.className = (k === 'word') ? 'word-main' : (k === 'type' ? 'type-row' : `${k}-row`); });
        this.getEl('w-example-box').className = 'dt-example-box'; this.getEl('w-example-box').style.display = 'block'; 
    } else {
        ['word','kana','type','meaning'].forEach(k => { let el = this.getEl(`w-${k}`); el.className = (k === 'word') ? 'word-main' : (k === 'type' ? 'type-row' : `${k}-row`); });
        this.getEl('w-example-box').className = 'dt-example-box';
        if (isRote && mode !== 'all') this.getEl('w-example-box').style.display = 'none'; 
    }

    this.getEl('capsule-pendulum').classList.add('hidden');
    this.getEl('capsule-filter-test').classList.add('hidden');
    this.getEl('capsule-filter-judge').classList.add('hidden');
    this.getEl('dual-track-ui').classList.add('hidden');
    this.getEl('memory-test-ui').classList.add('hidden');
    
    if (Model.state.mode === 'pendulum' || (isRote && (forceRoteFull || mode === 'all'))) {
      this.getEl('capsule-pendulum').classList.remove('hidden');
      this.getEl('btn-prev').disabled = Model.state.currentIndex === 0;
      this.getEl('btn-next').style.display = (Model.state.currentIndex === Model.state.studyQueue.length - 1) ? 'none' : 'flex';
      this.getEl('btn-finish').style.display = (Model.state.currentIndex === Model.state.studyQueue.length - 1) ? 'flex' : 'none';
    } else if (Model.state.mode === 'dual-track') {
      this.getEl('dual-track-ui').classList.remove('hidden');
      this.renderDualTrackUI(w);
    } else if (isMemTest || (isRote && !forceRoteFull)) {
      this.getEl('memory-test-ui').classList.remove('hidden');
      this.renderMemoryTestUI(w, mode);
    }
    
    if (isMemTest && (Model.state.mtRound === 1 || Model.state.mtRound === 2)) {
        Hardware.speakText(w.kana.replace(/[【】\[\]()]/g,''));
    } else {
        let autoSpeak = localStorage.getItem('autoSpeak') !== 'false';
        if (autoSpeak && !hideSpeaker) { Hardware.speakText(w.kana.replace(/[【】\[\]()]/g,'')); }
    }
  },

  renderExampleBox(exString, boxId, mode = 'normal', targetWordObj = null) {
    let exBox = this.getEl(boxId);
    if (!exBox) return;
    
    if (!exString || typeof exString !== 'string') {
        exBox.style.display = 'none';
        exBox.innerHTML = '';
        return;
    }

    // 🚀 获取用户设置的渲染引擎模式 (默认使用 Ruby)
    let useRuby = localStorage.getItem('useRubyRender') !== 'false';
    
    let processedStr = exString;
    if (mode === 'spell' && targetWordObj) {
        processedStr = exString.replace(/\\overset\{([^\}]+)\}\{([^\}]+)\}/g, (match, ruby, kanji) => {
            if (targetWordObj.word.includes(kanji) || targetWordObj.kana === ruby) return `\\overset{○}{${kanji}}`; return match;
        });
    }

    let htmlStr = processedStr.split('||').map(blk => {
        let parts = blk.split('/'); 
        let jpPart = parts[0] ? parts[0].trim() : "暂无例句"; 
        let cnPart = parts[1] ? parts[1].trim() : "";
        
        let pureJpText = jpPart.replace(/\$/g, '').replace(/\\overset\{[^\}]+\}\{([^\}]+)\}/g, '$1');
        
        let safeJpPart = escapeHTML(jpPart).replace(/\\＆/g, '\\&');
        
        // 🚀 条件渲染：只有在开启 Ruby 模式时，才进行正则转换
        if (useRuby) {
            safeJpPart = safeJpPart.replace(/\$\\overset\{([^\}]+)\}\{([^\}]+)\}\$/g, '<ruby>$2<rt>$1</rt></ruby>');
        }

        let safeCnPart = escapeHTML(cnPart);
        
        if (mode === 'choice' && cnPart) { 
            return `<div class="ex-item"><div class="dt-ex-jp" data-speak="${escapeHTML(pureJpText)}"><span class="material-symbols-rounded ex-speaker">volume_up</span>${safeJpPart}</div><div class="dt-ex-cn hidden-translation" data-text="${safeCnPart}"><span class="material-symbols-rounded" style="font-size:1.1rem;">lock</span> 答对选项后解密</div></div>`; 
        }
        return `<div class="ex-item"><div class="dt-ex-jp" data-speak="${escapeHTML(pureJpText)}"><span class="material-symbols-rounded ex-speaker">volume_up</span>${safeJpPart}</div><div class="dt-ex-cn revealed-translation">${safeCnPart}</div></div>`;
    }).join('');
    
    if (!htmlStr.replace(/<[^>]*>/g, '').trim()) { 
        exBox.style.display = 'none'; 
        exBox.innerHTML = ''; 
        return; 
    }

    exBox.innerHTML = htmlStr;
    let jpExEls = exBox.querySelectorAll('.dt-ex-jp');
    
    // 🚀 条件调用：只有在 MathJax 模式下（且 API 存在时），才调用沉重的渲染库
    if (!useRuby && window.MathJax && window.MathJax.typesetPromise) { 
        window.mathJaxQueue = (window.mathJaxQueue || Promise.resolve())
            .then(() => MathJax.typesetPromise(Array.from(jpExEls)))
            .catch((err) => { console.warn('MathJax 排版被中断', err); });
    }
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
      let mtWarning = this.getEl('mt-warning'); if(mtWarning) mtWarning.classList.add('hidden'); 
      this.getEl('mt-spell-area').classList.add('hidden'); 
      this.getEl('mt-choice-area').classList.add('hidden');
      
      let blindAudioUi = this.getEl('mt-blind-audio-ui');
      if (blindAudioUi) blindAudioUi.classList.add('hidden');

      let isMemTest = Model.state.mode === 'memory-test';
      let currentTestType = '';
      let isMeaning = false;
      let targetText = '';

      if (isMemTest) {
          this.getEl('w-word').style.display = 'none';
          this.getEl('w-kana').style.display = 'none';
          this.getEl('w-meaning').style.display = 'none';
          this.getEl('w-type').style.display = 'none';
          
          let round = Model.state.mtRound;
          let step = Model.state.mtStep;
          
          if (round === 1) { 
              if(blindAudioUi) blindAudioUi.classList.remove('hidden');
              currentTestType = 'choice';
              isMeaning = true;
              targetText = wObj.meaning;
          } else if (round === 2) {
              if (step === 1) { 
                  if(blindAudioUi) blindAudioUi.classList.remove('hidden');
                  currentTestType = 'choice';
                  isMeaning = false;
                  targetText = wObj.word;
              } else if (step === 2) { 
                  this.getEl('w-word').style.display = 'block';
                  currentTestType = 'spell';
              }
          } else if (round === 3) {
              if (step === 1) { 
                  this.getEl('w-kana').style.display = 'block';
                  currentTestType = 'choice';
                  isMeaning = true;
                  targetText = wObj.meaning;
              } else if (step === 2) { 
                  this.getEl('w-kana').style.display = 'block';
                  this.getEl('w-meaning').style.display = 'block';
                  currentTestType = 'choice';
                  isMeaning = false;
                  targetText = wObj.word;
              }
          }
      } else {
          if (displayMode === 'all') { if(mtWarning) mtWarning.classList.remove('hidden'); return; }
          if (displayMode === 'word') { currentTestType = (Model.state.mtStep === 1) ? 'spell' : 'choice-meaning'; } 
          else if (displayMode === 'kana') { currentTestType = (Model.state.mtStep === 1) ? 'choice-word' : 'choice-meaning'; } 
          else if (displayMode === 'meaning') { currentTestType = (Model.state.mtStep === 1) ? 'spell' : 'choice-word'; }
          isMeaning = currentTestType === 'choice-meaning'; 
          targetText = isMeaning ? wObj.meaning : wObj.word;
      }

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
          allTokens.forEach((token) => { 
              let btn = document.createElement('div'); btn.className = 'dt-spell-key'; btn.innerText = token; 
              btn.onclick = () => Controller.handleMtSpellClick(btn, token, wObj, displayMode); 
              kb.appendChild(btn); 
          });
      } else if (currentTestType.startsWith('choice')) {
          this.getEl('mt-choice-area').classList.remove('hidden');
          let pool = Model.db.filter(x => x.folder === wObj.folder && x.type === wObj.type && x.word !== wObj.word);
          if (pool.length < 3) pool = Model.db.filter(x => x.word !== wObj.word); 
          pool = pool.sort(() => Math.random() - 0.5).slice(0, 3);
          let choices = [{text: targetText, correct: true}];
          pool.forEach(x => choices.push({text: isMeaning ? x.meaning : x.word, correct: false})); choices.sort(() => Math.random() - 0.5); 
          
          let cb = this.getEl('mt-choice-buttons'); cb.innerHTML = '';
          choices.forEach(c => { 
              let btn = document.createElement('div'); btn.className = 'dt-choice-btn choice-flip-anim'; btn.innerText = c.text; 
              btn.onclick = () => Controller.handleMtChoiceClick(btn, c.correct, wObj, displayMode); 
              cb.appendChild(btn); 
          });
      }
  },

  resetWordbankRenderer() { 
      let searchInputEl = this.getEl('wb-search-input');
      let searchQuery = searchInputEl ? searchInputEl.value.trim().toLowerCase() : '';
      let currentFilter = this.getEl('wb-folder-filter').value;
      
      // 🚀 修复：移除了导致死循环的重复检查（触发点已单独处理）
      
      Model.updateFilteredDb(searchQuery, currentFilter);
      window.scrollTo({ top: 0, behavior: 'instant' }); 
      Model.state.renderedStartIndex = -1; 
      
      this.renderVirtualGrid(); 
  },

  renderVirtualGrid() {
    const grid = this.getEl('wb-grid'); 
    const container = this.getEl('wb-grid-container');
    if(!grid || !container) return;

    const colsStr = this.getEl('wb-col-select').value;
    const cols = parseInt(colsStr) || 3; 
    const blurMode = this.getEl('wb-blur-select').value; 
    
    const filteredData = Model.state.filteredDb;

    // 🚀 折纸鹤 (Origami) 禅意缺省页
    if (filteredData.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 100px 20px;">
            <span class="material-symbols-rounded" style="font-size: 5rem; margin-bottom: 24px; color: #8F9779; opacity: 0.4;">spa</span>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--on-surface); opacity: 0.7; font-family: var(--font-jp-serif), serif; letter-spacing: 2px;">【 一期一会 】</div>
            <div style="font-size: 0.95rem; margin-top: 12px; opacity: 0.5; color: var(--on-surface);">缘分未到，换个关键词再试一次吧</div>
        </div>`;
        grid.style.paddingTop = '0px'; grid.style.paddingBottom = '0px';
        return;
    }

    let baseRowHeights = { 2: 160, 3: 130, 4: 110 }; 
    let rowHeight = baseRowHeights[cols];
    
    if (grid.children.length > 0) {
    let gap = cols === 4 ? 8 : 12;
    let actualHeight = grid.children[0].offsetHeight + gap;
    if (actualHeight > 50) { 
        rowHeight = actualHeight;
    } else {
        rowHeight = baseRowHeights[cols]; // 回退到预设值
    }
}

    const totalRows = Math.ceil(filteredData.length / cols);
    const rect = container.getBoundingClientRect();
    const gridTop = window.scrollY + rect.top; 
    let relativeScrollY = Math.max(0, window.scrollY - gridTop + 20);

    const viewportHeight = window.innerHeight;
    const bufferRows = 6;  
    
    let startRow = Math.floor(relativeScrollY / rowHeight) - bufferRows;
    startRow = Math.max(0, startRow);
    
    let visibleRows = Math.ceil(viewportHeight / rowHeight) + (bufferRows * 2);
    let endRow = startRow + visibleRows;
    endRow = Math.min(totalRows, endRow);

    let startIndex = startRow * cols;
    let endIndex = endRow * cols;

    if (Model.state.renderedStartIndex === startIndex && Model.state.renderedEndIndex === endIndex) { return; }
    Model.state.renderedStartIndex = startIndex;
    Model.state.renderedEndIndex = endIndex;

    const paddingTop = startRow * rowHeight;
    const paddingBottom = Math.max(0, (totalRows - endRow) * rowHeight);
    grid.style.paddingTop = `${paddingTop}px`;
    grid.style.paddingBottom = `${paddingBottom}px`;
    grid.setAttribute('data-cols', cols);

    let slice = filteredData.slice(startIndex, endIndex);
    let fragment = document.createDocumentFragment();
    
    slice.forEach((item) => {
      let w = item.w, idx = item.idx; let visuals = this.getCardVisuals(w.type);
      let blurW = (blurMode !== 'all' && blurMode !== 'word') ? 'blur-text' : ''; let blurK = (blurMode !== 'all' && blurMode !== 'kana') ? 'blur-text' : ''; let blurM = (blurMode !== 'all' && blurMode !== 'meaning') ? 'blur-text' : '';
      let isChecked = Model.state.selectedSet.has(idx);
      
      let card = document.createElement('div'); card.className = 'wb-card'; 
      card.style.background = visuals.bg; card.dataset.idx = idx; 
      card.style.opacity = '1'; 

      let st = Model.mtWordClears[w.word] || { kanji: false, kana: false, meaning: false };
      if (typeof st === 'number') st = { kanji: false, kana: false, meaning: false };
      let hankoHTML = `
        <div class="card-tri-bar">
          <div class="tri-bar-segment bar-y ${st.kanji ? 'active' : ''}"></div>
          <div class="tri-bar-segment bar-r ${st.kana ? 'active' : ''}"></div>
          <div class="tri-bar-segment bar-w ${st.meaning ? 'active' : ''}"></div>
        </div>`;

      let starFilled = Model.stars.includes(w.word) ? 1 : 0;
      let starClass = starFilled ? 'active' : '';

      let topRightHTML = '';
      if (Model.state.batchMode || Model.state.manageMode) {
          topRightHTML = `<div class="wb-checkbox ${isChecked ? 'checked' : ''}">${isChecked ? '✓' : ''}</div>`;
      } else {
          topRightHTML = `<div class="wb-c-star btn-wb-star ${starClass}"><span class="material-symbols-rounded" style="font-variation-settings: 'FILL' ${starFilled};">star</span></div>`;
      }

      let safeWord = escapeHTML(w.word); let safeKana = escapeHTML(w.kana); let safeMean = escapeHTML(w.meaning);
      card.innerHTML = `
        ${hankoHTML}
        <div class="watermark-layer"><div class="watermark">${visuals.wm}</div></div>
        ${topRightHTML}
        ${cols !== '4' && !Model.state.batchMode ? `<div class="wb-c-speaker btn-wb-speak"><span class="material-symbols-rounded">volume_up</span></div>` : ''}
        <div class="wb-c-word ${blurW}"><span class="wb-blur-trigger">${safeWord}</span></div>
        <div class="wb-c-kana ${blurK}"><span class="wb-blur-trigger">${safeKana}</span></div>
        <div class="wb-c-mean ${blurM}"><span class="wb-blur-trigger">${safeMean}</span></div>
        <div class="wb-manage-overlay ${Model.state.manageMode ? 'active' : ''}">
            <button class="wb-btn-move btn-wb-move"><span class="material-symbols-rounded">move_item</span></button>
            <button class="wb-btn-edit btn-wb-edit"><span class="material-symbols-rounded">edit</span></button>
            <button class="wb-btn-del btn-wb-del"><span class="material-symbols-rounded">delete</span></button>
        </div>`;
      fragment.appendChild(card);
    });
    
    grid.innerHTML = '';
    grid.appendChild(fragment);

    let sentinel = this.getEl('wb-scroll-sentinel');
    if (sentinel) sentinel.style.display = 'none';
  }
};

const Controller = {
  async init() {
    BottomSheet.init(); 
    Nav.init(); 
    await Model.init(); 
    Hardware.init(); 
    View.renderDashboard(); 
    View.updateWordbankUI(); 
    this.bindEvents(); 
    this.setupVirtualScroll(); 
    this.setupHeaderScrollShadow(); 
    
    if(localStorage.getItem('theme') === 'dark') { document.body.setAttribute('data-theme', 'dark'); document.querySelectorAll('.theme-icon').forEach(icon => icon.innerText = 'light_mode'); }
    
    let autoSpeak = localStorage.getItem('autoSpeak') !== 'false'; 
    let autoSpeakCheck = View.getEl('setting-auto-speak');
    if(autoSpeakCheck) autoSpeakCheck.checked = autoSpeak;

    let volNavEnabled = localStorage.getItem('volNav') === 'true'; 
    let volCheck = View.getEl('setting-vol-nav');
    if(volCheck) volCheck.checked = volNavEnabled;

    let darkBtnStyle = localStorage.getItem('darkBtnStyle') === 'translucent';
    let darkBtnCheck = View.getEl('setting-dark-btn');
    if(darkBtnCheck) {
        darkBtnCheck.checked = darkBtnStyle;
        if(darkBtnStyle) document.body.setAttribute('data-dark-btn', 'translucent');
    }

    let postponeTested = localStorage.getItem('postponeTested') === 'true';
    let postponeCheck = View.getEl('setting-postpone-tested');
    if(postponeCheck) postponeCheck.checked = postponeTested;

    let skipMastered = localStorage.getItem('skipMastered') === 'true';
    let skipCheck = View.getEl('setting-skip-mastered');
    if(skipCheck) skipCheck.checked = skipMastered;

    // 🚀 新增：初始化 Ruby 渲染设置（默认开启，因为排版更好）
    let useRuby = localStorage.getItem('useRubyRender');
    if (useRuby === null) useRuby = 'true'; 
    let rubyCheck = View.getEl('setting-ruby-render');
    if(rubyCheck) rubyCheck.checked = (useRuby === 'true');
    let savedTTS = localStorage.getItem('ttsEngine') || 'youdao';
    let ttsSelect = View.getEl('setting-tts-engine');
    if(ttsSelect) {
        ttsSelect.value = savedTTS;
        // 🚀 关键修复：主动派发事件，通知外层的 UI 面板同步刷新文字！
        ttsSelect.dispatchEvent(new Event('facade-update')); 
    }


let savedMode = localStorage.getItem('displayMode') || 'all'; View.getEl('next-display-mode').value = savedMode;

  // 监听 Service Worker 更新消息
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        showConfirm('版本更新', '应用已有新版本，是否立即刷新以体验最新功能？', () => {
          window.location.reload();
        });
      }
    });
  }
},

setupVirtualScroll() {
  const container = View.getEl('wb-grid-container');
  if (!container) return;
  
  let ticking = false;
  window.addEventListener('scroll', () => { 
      if (!document.getElementById('tab-wordbank').classList.contains('active')) return;
      if (!ticking) {
          window.requestAnimationFrame(() => {
              View.renderVirtualGrid();
              ticking = false;
          });
          ticking = true;
      }
  }, { passive: true });
  
  window.addEventListener('resize', () => { 
      if (document.getElementById('tab-wordbank').classList.contains('active')) { 
          View.resetWordbankRenderer(); 
      } 
  });
},

  setupHeaderScrollShadow() {
      const header = View.getEl('global-header');
      if (!header) return;

      const updateHeaderStatus = () => {
          if (window.scrollY > 10) {
              header.classList.add('scrolled');
          } else {
              header.classList.remove('scrolled');
          }
      };

      window.addEventListener('scroll', updateHeaderStatus, { passive: true });
      updateHeaderStatus();
  },

  saveSessionRecord() {
      if (Model.state.sessionSaved) return; 
      let mode = Model.state.mode;
      if (mode === 'dual-track' || mode === 'memory-test' || mode === 'rote-learning') {
          let t = new Date();
          let dateStr = t.toLocaleDateString('zh-CN') + ' ' + t.getHours().toString().padStart(2, '0') + ':' + t.getMinutes().toString().padStart(2, '0');
          Model.records.push({
              type: 'combo_record',
              mode: mode,
              combo: Model.state.maxSessionCombo,
              group: Model.state.currentGroupLabel || '默认词库',
              timestamp: t.getTime(),
              dateStr: dateStr
          });
          Model.saveRecords();
      }
      Model.state.sessionSaved = true;
  },

  // 辅助函数：在数据库变更时关闭详情模态框，避免 detailArray 不同步
  closeDetailIfOpen() {
      if (document.getElementById('detail-overlay').classList.contains('active')) {
          Hardware.vibrate(10);
          window.toggleModal('detail-overlay', false);
          // 同时重置渲染索引以便刷新词库
          if (document.getElementById('tab-wordbank').classList.contains('active')) {
              Model.state.renderedStartIndex = -1;
              View.renderVirtualGrid();
          }
      }
  },

  bindEvents() {
    document.querySelectorAll('.modal-overlay').forEach(ov => { 
        ov.addEventListener('click', (e) => { 
            if(e.target === ov) {
                Hardware.vibrate(10);
                window.toggleModal(ov.id, false); 
                if (ov.id === 'detail-overlay' && document.getElementById('tab-wordbank').classList.contains('active')) { Model.state.renderedStartIndex = -1; View.renderVirtualGrid(); }
            }
        }); 
    });
    
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => { 
        btn.addEventListener('click', (e) => { Hardware.playSound('click'); Hardware.vibrate(20); View.toggleTheme(e); }); 
    });
    
    View.getEl('btn-exit-study').addEventListener('click', () => { Hardware.vibrate(20); window.speechSynthesis.cancel(); this.saveSessionRecord(); View.showPage('tab-home'); View.renderDashboard(); });

    View.getEl('btn-custom-group-select').addEventListener('click', () => {
        Hardware.playSound('click'); Hardware.vibrate(15);
        window.toggleModal('group-select-overlay', true);
        setTimeout(() => {
            let activeTabEl = document.querySelector('#gs-tabs .active');
            let activeTab = activeTabEl ? activeTabEl.dataset.cat : 'default';
            View.renderGroupBottomSheet(activeTab);
        }, 10);
    });

    View.getEl('gs-tabs').addEventListener('click', (e) => {
        let tab = e.target.closest('.g-tab');
        if (!tab) return;
        Hardware.playSound('click');
        Hardware.vibrate(10);
        document.querySelectorAll('#gs-tabs .g-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        setTimeout(() => {
            View.renderGroupBottomSheet(tab.dataset.cat);
        }, 10);
    });

    document.querySelectorAll('#lb-tabs .g-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            Hardware.playSound('click');
            Hardware.vibrate(10);
            Model.lbState.singleMode = e.currentTarget.dataset.mode;
            Model.lbState.page = 1;  // 重置页码
            View.renderLeaderboard();
        });
    });

    View.getEl('btn-start-pendulum').addEventListener('click', () => { Hardware.unlockSpeech(); this.startPendulum('pendulum'); });
    View.getEl('btn-start-dual-track').addEventListener('click', () => { Hardware.unlockSpeech(); this.startPendulum('dual-track'); });
    View.getEl('btn-start-rote-learning').addEventListener('click', () => { Hardware.unlockSpeech(); this.startPendulum('rote-learning'); });
    View.getEl('btn-start-memory-test').addEventListener('click', () => { Hardware.unlockSpeech(); this.startPendulum('memory-test'); });
    
    View.getEl('btn-start-filter-test').addEventListener('click', () => { Hardware.unlockSpeech(); this.startFilterTest(); });
    View.getEl('btn-test-range-trigger').addEventListener('click', () => { Hardware.vibrate(10); BottomSheet.open(View.getEl('test-range-select'), document.createElement('span')); });
    View.getEl('btn-test-display-trigger').addEventListener('click', () => { Hardware.vibrate(10); BottomSheet.open(View.getEl('test-display-select'), document.createElement('span')); });

    View.getEl('ft-forget').addEventListener('click', () => { Hardware.playSound('error'); Hardware.vibrate(30); this.processFilterTestResult(false); });
    View.getEl('ft-blur').addEventListener('click', () => { Hardware.playSound('click'); Hardware.vibrate(20); let currentDisplay = View.getEl('test-display-select').value || 'kana'; let pool = ['word', 'kana', 'meaning', 'audio'].filter(x => x !== currentDisplay); Model.state.ftHint = pool[Math.floor(Math.random() * pool.length)]; Model.state.ftState = 'B'; View.renderStudyCard('none'); });
    View.getEl('ft-know').addEventListener('click', () => { Hardware.playSound('click'); Hardware.vibrate(20); Model.state.ftState = 'C'; View.renderStudyCard('none'); });
    View.getEl('ft-correct').addEventListener('click', () => { Hardware.playSound('success'); Hardware.vibrate(40); this.processFilterTestResult(true); });
    View.getEl('ft-wrong').addEventListener('click', () => { Hardware.playSound('error'); Hardware.vibrate(30); this.processFilterTestResult(false); });

    View.getEl('btn-prev').addEventListener('click', () => { if(Model.state.isAnimating) return; Hardware.unlockSpeech(); if(Model.state.currentIndex > 0) { Model.state.currentIndex--; Hardware.playSound('click'); Hardware.vibrate(60); View.renderStudyCard('prev'); } });
    View.getEl('btn-next').addEventListener('click', () => { if(Model.state.isAnimating) return; Hardware.unlockSpeech(); if(Model.state.currentIndex < Model.state.studyQueue.length-1) { Model.state.currentIndex++; Hardware.playSound('click'); Hardware.vibrate(40); View.renderStudyCard('next'); } });
    View.getEl('btn-finish').addEventListener('click', () => this.finishPendulum());
    
    let displayTrigger = View.getEl('btn-display-mode-trigger');
    if (displayTrigger) { displayTrigger.addEventListener('click', () => { Hardware.playSound('click'); Hardware.vibrate(15); BottomSheet.open(View.getEl('next-display-mode'), document.createElement('span')); }); }

    let btnMtReplay = View.getEl('btn-mt-replay');
    if (btnMtReplay) { btnMtReplay.addEventListener('click', () => { Hardware.playSound('click'); Hardware.vibrate(15); Hardware.unlockSpeech(); let w = Model.db[Model.state.studyQueue[Model.state.currentIndex]]; if(w) Hardware.speakText(w.kana.replace(/[【】\[\]()]/g,'')); }); }

    let btnMtShowHint = View.getEl('btn-mt-show-hint');
    if (btnMtShowHint) { btnMtShowHint.addEventListener('click', () => { Hardware.vibrate(10); if (Model.state.mode === 'filter-test') { Model.state.ftShowKanaHint = true; View.renderStudyCard('none'); } else { let wKana = View.getEl('w-kana'); if(wKana) { wKana.style.display = 'block'; wKana.classList.remove('blur-text'); } } }); }

    let autoSpeakCheck = View.getEl('setting-auto-speak');
    if (autoSpeakCheck) { autoSpeakCheck.addEventListener('change', (e) => { Hardware.playSound('click'); Hardware.vibrate(15); localStorage.setItem('autoSpeak', e.target.checked); showToast(e.target.checked ? "已开启自动朗读" : "已关闭自动朗读"); }); }

    let volCheck = View.getEl('setting-vol-nav');
    if (volCheck) { volCheck.addEventListener('change', (e) => { Hardware.playSound('click'); Hardware.vibrate(15); localStorage.setItem('volNav', e.target.checked); showToast(e.target.checked ? "已开启音量键翻页" : "已关闭音量键翻页"); }); }

    let darkBtnCheck = View.getEl('setting-dark-btn');
    if (darkBtnCheck) {
        darkBtnCheck.addEventListener('change', (e) => {
            Hardware.playSound('click'); Hardware.vibrate(15);
            localStorage.setItem('darkBtnStyle', e.target.checked ? 'translucent' : 'solid');
            if(e.target.checked) document.body.setAttribute('data-dark-btn', 'translucent');
            else document.body.removeAttribute('data-dark-btn');
            showToast(e.target.checked ? "已开启透明叠加质感" : "已恢复实色按钮质感");
        });
    }

    let postponeCheck = View.getEl('setting-postpone-tested');
    if (postponeCheck) {
        postponeCheck.addEventListener('change', (e) => {
            Hardware.playSound('click'); Hardware.vibrate(15);
            localStorage.setItem('postponeTested', e.target.checked);
            showToast(e.target.checked ? "已开启未通关词汇后置" : "已关闭未通关词汇后置");
        });
    }

    let skipCheck = View.getEl('setting-skip-mastered');
    if (skipCheck) {
        skipCheck.addEventListener('change', (e) => {
            Hardware.playSound('click'); Hardware.vibrate(15);
            localStorage.setItem('skipMastered', e.target.checked);
            showToast(e.target.checked ? "已开启智能跳过已亮维度" : "已关闭智能跳过已亮维度");
        });
    }

    // 🚀 新增：绑定 Ruby 排版切换事件
    let rubyCheck = View.getEl('setting-ruby-render');
    if (rubyCheck) {
        rubyCheck.addEventListener('change', (e) => {
            Hardware.playSound('click'); Hardware.vibrate(15);
            localStorage.setItem('useRubyRender', e.target.checked);
            showToast(e.target.checked ? "已切换为原生 Ruby 排版" : "已切换为 MathJax 引擎");
            // 即时刷新：如果当前有卡片打开，立刻重新渲染
            if (!document.getElementById('detail-overlay').classList.contains('hidden') && document.getElementById('detail-overlay').classList.contains('active')) {
                Controller.renderDetailCard('none', false);
            } else if (!document.getElementById('study-area').classList.contains('hidden')) {
                View.renderStudyCard('none');
            }
        });
    }
    // 🚀 新增：发音引擎切换事件
    let ttsSelectTrigger = View.getEl('setting-tts-engine');
if (ttsSelectTrigger) {
    ttsSelectTrigger.addEventListener('change', (e) => {
        Hardware.playSound('click'); Hardware.vibrate(15);
        localStorage.setItem('ttsEngine', e.target.value);
        let names = { 'local': '系统自带', 'youdao': '网易有道', 'azure': '微软七海' };
        showToast(`已切换至 ${names[e.target.value]} 发音`);
    });
}

// 🚀 新增：测试震动按钮
let testVibrateBtn = View.getEl('btn-test-vibrate');
if (testVibrateBtn) {
    testVibrateBtn.addEventListener('click', () => {
        Hardware.playSound('click');
        // 尝试震动 300ms（较长，便于感知）
        const vibrated = Hardware.vibrate(300);
        // 给出相应提示
        if (navigator.vibrate) {
            // 有些浏览器即使支持也可能返回 false，但仍会尝试震动
            showToast('震动测试已触发，请感受设备震动');
        } else {
            showToast('您的浏览器不支持震动 API（iOS 系统或桌面浏览器）');
        }
    });
}

    let searchInput = View.getEl('wb-search-input');
    if (searchInput) { 
        searchInput.addEventListener('input', () => { 
            if (Model.state.batchMode) Controller.toggleBatchMode(); 
            View.resetWordbankRenderer(); 
        }); 
        // 🚀 新增修复：监听键盘“回车/搜索”键，主动释放焦点，召回底部导航栏
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                searchInput.blur();
            }
        });
    }

    let btnExport = View.getEl('btn-export-backup');
    if (btnExport) btnExport.addEventListener('click', () => this.exportBackup());
    
    let btnImport = View.getEl('btn-import-backup');
    let fileImport = View.getEl('file-import-backup');
    if (btnImport && fileImport) {
        btnImport.addEventListener('click', () => { Hardware.vibrate(15); fileImport.click(); });
        fileImport.addEventListener('change', (e) => { if(e.target.files.length > 0) this.importBackup(e.target.files[0]); e.target.value = ''; });
    }

window.addEventListener('keydown', (e) => {
    // 如果当前聚焦在输入框或文本域，不处理音量键翻页
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return;
    }
    if (localStorage.getItem('volNav') !== 'true') return;
    let isVolUp = (e.key === 'VolumeUp' || e.key === 'AudioVolumeUp' || e.code === 'VolumeUp' || e.keyCode === 175);
    let isVolDown = (e.key === 'VolumeDown' || e.key === 'AudioVolumeDown' || e.code === 'VolumeDown' || e.keyCode === 174);
    if (!isVolUp && !isVolDown) return;
    let inDetail = document.getElementById('detail-overlay').classList.contains('active');
    let inStudy = !document.getElementById('study-area').classList.contains('hidden');
    // 修复：允许所有学习模式使用音量键翻页，而不仅限于pendulum
    if (!inDetail && !inStudy) return;
    e.preventDefault(); 
    if (inDetail) { 
        if (isVolDown) Controller.navDetail(1); 
        else if (isVolUp) Controller.navDetail(-1); 
    } else { 
        // 学习页：根据当前模式判断是否有下一个/上一个按钮可用
        let hasNext = Model.state.currentIndex < Model.state.studyQueue.length - 1;
        let hasPrev = Model.state.currentIndex > 0;
        // 对于filter-test和dual-track等模式，同样有currentIndex，直接使用
        if (isVolDown && hasNext) { 
            let nextBtn = document.getElementById('btn-next');
            if (nextBtn && nextBtn.style.display !== 'none') nextBtn.click();
            else {
                // 部分模式没有显式next按钮，手动推进
                if (Model.state.mode === 'filter-test' || Model.state.mode === 'dual-track' || Model.state.mode === 'memory-test') {
                    Model.state.currentIndex++;
                    View.renderStudyCard('next');
                }
            }
        } else if (isVolUp && hasPrev) { 
            let prevBtn = document.getElementById('btn-prev');
            if (prevBtn && prevBtn.style.display !== 'none') prevBtn.click();
            else {
                if (Model.state.mode === 'filter-test' || Model.state.mode === 'dual-track' || Model.state.mode === 'memory-test') {
                    Model.state.currentIndex--;
                    View.renderStudyCard('prev');
                }
            }
        }
    }
}, { passive: false });

    let lpBtn = View.getEl('btn-long-press');
    let punchTimer = null; let vibrateInterval = null; let isLpPressing = false; 
    const clearPunch = () => { if(punchTimer) clearTimeout(punchTimer); if(vibrateInterval) clearInterval(vibrateInterval); punchTimer = null; vibrateInterval = null; isLpPressing = false; if(lpBtn) lpBtn.classList.remove('pressing'); Hardware.stopChargeSound(); };
    if(lpBtn) {
        lpBtn.addEventListener('pointerdown', (e) => {
            if(lpBtn.classList.contains('done') || isLpPressing) return; if(e.pointerType === 'mouse' && e.button !== 0) return;
            isLpPressing = true; Hardware.unlockSpeech(); try { lpBtn.setPointerCapture(e.pointerId); } catch(err) {} 
            lpBtn.classList.add('pressing'); Hardware.playChargeSound(); vibrateInterval = setInterval(() => Hardware.vibrate(10), 100);
            punchTimer = setTimeout(() => { clearPunch(); Hardware.playDingDong(); Hardware.vibrate(200); let t = new Date().toLocaleDateString('zh-CN'); Model.records.push({date: t, type: 'daily_punch'}); Model.saveRecords(); View.renderDashboard(); showToast("打卡成功！能量满点"); }, 1500);
        });
        lpBtn.addEventListener('pointerup', clearPunch); lpBtn.addEventListener('pointercancel', clearPunch); lpBtn.addEventListener('contextmenu', (e) => { e.preventDefault(); clearPunch(); });
    }

    ['next-display-mode', 'wb-col-select', 'wb-blur-select'].forEach(id => { 
        let el = View.getEl(id);
        if (el) {
            el.addEventListener('change', (e) => { 
                Hardware.playSound('click'); 
                Hardware.vibrate(10);
                if(id === 'next-display-mode') { 
                    localStorage.setItem('displayMode', e.target.value); 
                    Model.state.mtStep = 1; 
                    View.renderStudyCard('none'); 
                } else if(id.includes('wb')) { 
                    if (Model.state.batchMode) Controller.toggleBatchMode();
                    View.resetWordbankRenderer(); 
                } 
            });
        }
    });
    
    let folderFilter = View.getEl('wb-folder-filter');
    if (folderFilter) {
        folderFilter.addEventListener('change', () => { 
            Hardware.playSound('click'); 
            Hardware.vibrate(10);
            if (Model.state.batchMode) Controller.toggleBatchMode();
            View.resetWordbankRenderer(); 
        });
    }
    
    let lbLayoutTrigger = View.getEl('setting-lb-layout');
    if (lbLayoutTrigger) { let facade = lbLayoutTrigger.nextElementSibling; if (facade && facade.classList.contains('bs-facade')) { facade.addEventListener('click', () => { Hardware.vibrate(15); BottomSheet.open(lbLayoutTrigger, facade.querySelector('.bs-facade-text')); }); } }
    
    View.getEl('btn-speaker').addEventListener('click', (e) => { Hardware.vibrate(10); Hardware.unlockSpeech(); let w = Model.db[Model.state.studyQueue[Model.state.currentIndex]]; Hardware.speakText(w.kana.replace(/[【】\[\]()]/g,''), e.currentTarget); });
    View.getEl('star-btn').addEventListener('click', (e) => { Hardware.playSound('click'); let wordObj = Model.db[Model.state.studyQueue[Model.state.currentIndex]]; let idx = Model.stars.indexOf(wordObj.word); let icon = View.getEl('star-icon'); if(idx > -1) { Model.stars.splice(idx, 1); icon.style.fontVariationSettings = "'FILL' 0"; } else { Model.stars.push(wordObj.word); window.createStarParticles(e.currentTarget); Hardware.vibrate(20); icon.style.fontVariationSettings = "'FILL' 1"; } Model.saveStars(); });

    let dtStarBtn = View.getEl('dt-star-btn');
    if (dtStarBtn) {
        dtStarBtn.addEventListener('click', (e) => {
            Hardware.playSound('click'); Hardware.vibrate(10); let realIdx = Model.state.detailArray[Model.state.activeDetailIdx]; let wWord = Model.db[realIdx].word; let sIdx = Model.stars.indexOf(wWord); let starBtn = e.currentTarget; let icon = View.getEl('dt-star-icon');
            if (sIdx > -1) { Model.stars.splice(sIdx, 1); starBtn.classList.remove('active'); icon.style.fontVariationSettings = "'FILL' 0"; } 
            else { Model.stars.push(wWord); starBtn.classList.add('active'); icon.style.fontVariationSettings = "'FILL' 1"; window.createStarParticles(starBtn); }
            Model.saveStars(); Model.state.renderedStartIndex = -1;
        });
    }

    document.addEventListener('click', (e) => { 
        let target = e.target.closest('.blur-target, .wb-blur-trigger'); if (target && target.classList.contains('blur-text') || (target && target.parentElement.classList.contains('blur-text'))) { let el = target.classList.contains('blur-text') ? target : target.parentElement; el.classList.remove('blur-text'); Hardware.playSound('click'); Hardware.vibrate(15); } 
        let exJp = e.target.closest('.dt-ex-jp'); if (exJp) { let textToSpeak = exJp.getAttribute('data-speak'); if (textToSpeak) { Hardware.unlockSpeech(); Hardware.speakText(textToSpeak, exJp.querySelector('.ex-speaker') || exJp); Hardware.vibrate(10); } }
    });

    let pressTimer = null; let isPressing = false; let startX = 0; let startY = 0; let startScrollY = 0;
    const clearPressCard = (card) => { if(pressTimer) clearTimeout(pressTimer); pressTimer = null; isPressing = false; if(card) card.classList.remove('pressing'); };
    const onPointerDownCard = (e) => { if(e.pointerType === 'mouse' && e.button !== 0) return; let card = e.target.closest('.wb-card'); if (!card || e.target.closest('button, .wb-checkbox, .wb-manage-overlay, .wb-c-speaker, .btn-wb-star')) return; if (Model.state.batchMode || Model.state.manageMode) return; startX = e.clientX; startY = e.clientY; startScrollY = window.scrollY; isPressing = true; card.classList.add('pressing'); pressTimer = setTimeout(() => { if(isPressing && Math.abs(window.scrollY - startScrollY) < 10) { Hardware.vibrate(50); Hardware.playSound('click'); Controller.openDetailModal(parseInt(card.dataset.idx)); clearPressCard(card); } }, 500); };
    const onPointerMoveCard = (e) => { if(!isPressing) return; if(Math.abs(e.clientX - startX) > 25 || Math.abs(e.clientY - startY) > 25) { let card = e.target.closest('.wb-card'); clearPressCard(card); } };
    const onPointerUpCard = (e) => { let card = e.target.closest('.wb-card'); clearPressCard(card); };
    let grid = View.getEl('wb-grid'); grid.addEventListener('pointerdown', onPointerDownCard); grid.addEventListener('pointermove', onPointerMoveCard); grid.addEventListener('pointerup', onPointerUpCard); grid.addEventListener('pointercancel', onPointerUpCard);
    grid.addEventListener('contextmenu', (e) => { if(e.target.closest('.wb-card') && !e.target.closest('.btn-wb-star')) e.preventDefault(); });
    grid.addEventListener('click', (e) => {
      let card = e.target.closest('.wb-card'); if (!card) return; let idx = parseInt(card.dataset.idx);
      if (e.target.closest('.btn-wb-star')) { Hardware.playSound('click'); Hardware.vibrate(10); let wWord = Model.db[idx].word; let sIdx = Model.stars.indexOf(wWord); let starBtn = e.target.closest('.btn-wb-star'); let icon = starBtn.querySelector('.material-symbols-rounded'); if (sIdx > -1) { Model.stars.splice(sIdx, 1); starBtn.classList.remove('active'); icon.style.fontVariationSettings = "'FILL' 0"; } else { Model.stars.push(wWord); starBtn.classList.add('active'); icon.style.fontVariationSettings = "'FILL' 1"; window.createStarParticles(starBtn); } Model.saveStars(); return; }
      if (e.target.closest('.btn-wb-speak') || e.target.closest('.wb-c-speaker')) { Hardware.unlockSpeech(); Hardware.speakText(Model.db[idx].kana.replace(/[【】\[\]()]/g,''), e.target.closest('.btn-wb-speak') || e.target.closest('.wb-c-speaker')); Hardware.vibrate(10); return; }
      if (e.target.closest('.btn-wb-move')) { Hardware.playSound('click'); Hardware.vibrate(15); this.openMoveModal(idx); return; }
      if (e.target.closest('.btn-wb-edit')) { Hardware.playSound('click'); Hardware.vibrate(15); this.editWord(idx); return; }
      if (e.target.closest('.btn-wb-del')) { Hardware.playSound('click'); Hardware.vibrate(15); this.deleteWord(idx); return; }
      if (Model.state.batchMode && !e.target.closest('.wb-blur-trigger')) { if (Model.state.selectedSet.has(idx)) Model.state.selectedSet.delete(idx); else Model.state.selectedSet.add(idx); Hardware.playSound('click'); Hardware.vibrate(10); View.updateWordbankUI(); let checkEl = card.querySelector('.wb-checkbox'); if (checkEl) { checkEl.classList.toggle('checked'); checkEl.innerText = Model.state.selectedSet.has(idx) ? '✓' : ''; } }
    });

    View.getEl('wb-manage-toggle').addEventListener('click', () => { Hardware.playSound('click'); Hardware.vibrate(20); if(Model.state.batchMode) this.toggleBatchMode(); Model.state.manageMode = !Model.state.manageMode; View.updateWordbankUI(); document.querySelectorAll('.wb-manage-overlay').forEach(el => el.classList.toggle('active', Model.state.manageMode)); });
    View.getEl('wb-batch-toggle').addEventListener('click', () => this.toggleBatchMode()); 
    View.getEl('btn-batch-cancel').addEventListener('click', () => this.toggleBatchMode());
    View.getEl('btn-new-folder').addEventListener('click', () => this.createFolder()); 
    View.getEl('btn-del-folder').addEventListener('click', () => this.deleteFolder());
    View.getEl('btn-batch-move').addEventListener('click', () => { Hardware.vibrate(15); this.openMoveModal(-2); }); 
    View.getEl('btn-batch-del').addEventListener('click', () => this.batchDelete());
    View.getEl('btn-confirm-move').addEventListener('click', () => this.confirmMove()); 
    View.getEl('btn-cancel-move').addEventListener('click', () => { Hardware.vibrate(10); window.toggleModal('move-overlay', false); });
    View.getEl('btn-import').addEventListener('click', () => this.importWords());
    View.getEl('btn-view-settings').addEventListener('click', () => { Hardware.vibrate(15); window.toggleModal('view-settings-overlay', true); document.querySelectorAll('.vs-col-btn').forEach(b => { b.onclick = () => { Hardware.vibrate(10); document.querySelectorAll('.vs-col-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); View.getEl('wb-col-select').value = b.dataset.val; View.resetWordbankRenderer(); }}); document.querySelectorAll('.vs-blur-btn').forEach(b => { b.onclick = () => { Hardware.vibrate(10); document.querySelectorAll('.vs-blur-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); View.getEl('wb-blur-select').value = b.dataset.val; View.resetWordbankRenderer(); }}); });
    View.getEl('btn-reset').addEventListener('click', () => { Hardware.vibrate(20); showConfirm('恢复初始', '警告：将清空所有导入数据，恢复初始！', async () => { Model.folders = ["默认词库"]; Model.db = DefaultWords.map(w => ({...w, folder: "默认词库"})); await Model.saveDB(); await Model.saveFolders(); View.updateWordbankUI(); View.resetWordbankRenderer(); Hardware.vibrate(100); }); });
    View.getEl('detail-close').addEventListener('click', () => { Hardware.vibrate(15); window.toggleModal('detail-overlay', false); if (document.getElementById('tab-wordbank').classList.contains('active')) { Model.state.renderedStartIndex = -1; View.renderVirtualGrid(); } }); 
    View.getEl('detail-prev').addEventListener('click', () => this.navDetail(-1)); View.getEl('detail-next').addEventListener('click', () => this.navDetail(1));
    View.getEl('btn-save-edit').addEventListener('click', () => { Hardware.vibrate(20); if(Model.editingIdx > -1) { let w = Model.db[Model.editingIdx]; w.word = View.getEl('edit-word').value.trim(); w.kana = View.getEl('edit-kana').value.trim(); w.type = View.getEl('edit-type').value.trim(); w.meaning = View.getEl('edit-meaning').value.trim(); Model.saveDB(); View.resetWordbankRenderer(); window.toggleModal('edit-overlay', false); showToast("修改已保存"); } });
    View.getEl('btn-cancel-edit').addEventListener('click', () => { Hardware.vibrate(10); window.toggleModal('edit-overlay', false); });
  },

  exportBackup() {
      Hardware.playSound('success'); Hardware.vibrate(50);
      let data = { db: Model.db, folders: Model.folders, stars: Model.stars, records: Model.records, mtGroupClears: Model.mtGroupClears, mtWordClears: Model.mtWordClears, version: "v3", exportDate: new Date().toISOString() };
      let fileName = `钟摆日语备份_${new Date().toLocaleDateString('zh-CN').replace(/\//g,'-')}.json`;
      let blob = new Blob([JSON.stringify(data)], {type: "application/json"});
      if (navigator.share && navigator.canShare) { let file = new File([blob], fileName, { type: "application/json" }); if (navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: '钟摆日语数据备份' }).then(() => showToast("已成功调起保存面板")).catch((e) => this.fallbackDownload(blob, fileName)); return; } }
      this.fallbackDownload(blob, fileName);
  },

  fallbackDownload(blob, fileName) { let url = URL.createObjectURL(blob); let a = document.createElement('a'); a.style.display = 'none'; a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); showToast("尝试唤起本地下载..."); },

  importBackup(file) {
      if (!file) return;
      let reader = new FileReader();
      reader.onload = (e) => {
          try {
              let data = JSON.parse(e.target.result);
              if (data && data.db && data.folders) {
                  Model.db = data.db; Model.folders = data.folders; Model.stars = data.stars || []; Model.records = data.records || []; Model.mtGroupClears = data.mtGroupClears || {}; Model.mtWordClears = data.mtWordClears || {};
                  Promise.all([Model.saveDB(), Model.saveFolders(), Model.saveStars(), Model.saveRecords(), Model.saveClears()]).then(() => { Hardware.playSound('success'); Hardware.vibrate(100); showToast("数据恢复成功！"); setTimeout(() => location.reload(), 1000); });
              } else { Hardware.playSound('error'); Hardware.vibrate(50); showToast("备份文件格式不正确"); }
          } catch(err) { Hardware.playSound('error'); Hardware.vibrate(50); showToast("解析文件失败"); }
      };
      reader.readAsText(file);
  },

  startPendulum(launchMode = 'pendulum') {
    let groupKey = Model.state.currentGroupKey || localStorage.getItem('lastCustomGroupVal') || 'group|default|0';
    Model.state.currentGroupKey = groupKey;
    if (!Model.state.currentGroupLabel) { Model.state.currentGroupLabel = localStorage.getItem('lastCustomGroupTxt') || '默认词库 (第 1-10 词)'; }
    let [prefix, catName, idxStr] = groupKey.split('|'); 
    let idx = parseInt(idxStr); let startIdx = idx * 7; let endIdx = startIdx + 10;
    let sourceWords = Model.db.map((w, i) => ({w, i})).filter(item => {
        return Model.checkFilter(item.w, catName);
    }).slice(startIdx, endIdx);
    if(sourceWords.length === 0) return showToast("所选范围内暂无词汇哦");
    Hardware.playSound('click'); 
    Model.state.mode = launchMode; Model.state.currentIndex = 0; Model.state.dtWordAppearanceMap = {}; Model.state.mtStep = 1; Model.state.currentWordFailed = false; Model.state.comboCount = 0; Model.state.maxSessionCombo = 0; Model.state.sessionSaved = false; Model.state.maxProgressSeen = 0; Model.state.uniqueWordCount = sourceWords.length;
    if (launchMode === 'memory-test') { Model.state.mtRound = 1; Model.state.mtBaseQueue = sourceWords.map(x => x.i); Model.state.studyQueue = [...Model.state.mtBaseQueue].sort(() => Math.random() - 0.5); Model.state.totalTestWords = Model.state.studyQueue.length; } 
    else { Model.state.studyQueue = []; let len = sourceWords.length; for (let i = 0; i < len; i++) { Model.state.studyQueue.push(sourceWords[i].i); for (let j = i - 1; j >= 0; j--) Model.state.studyQueue.push(sourceWords[j].i); for (let k = 1; k <= i; k++) Model.state.studyQueue.push(sourceWords[k].i); } }
    Model.state.initialQueueLength = (launchMode === 'memory-test') ? Model.state.mtBaseQueue.length : Model.state.studyQueue.length;
    View.updateComboBadge();
    let savedMode = localStorage.getItem('displayMode') || 'all'; View.getEl('next-display-mode').value = savedMode; View.getEl('next-display-mode').dispatchEvent(new Event('facade-update'));
    View.showPage('study-area'); let c = View.getEl('pixel-matrix'); c.innerHTML=''; View.renderStudyCard('none'); Hardware.vibrate(40);
  },

  startFilterTest() {
      let sel = View.getEl('test-range-select'); let cat = sel.value; if (!cat) return;
      let displayMode = View.getEl('test-display-select').value || 'kana';
      let isSkipEnabled = localStorage.getItem('skipMastered') === 'true';

      let sourceWords = Model.db.map((w, i) => ({w, i})).filter(item => {
          // 基础范围过滤
          let inRange = (cat === 'all') ? true : Model.checkFilter(item.w, cat);
          if (!inRange) return false;

          // 智能维度拦截逻辑
          if (isSkipEnabled) {
              let st = Model.mtWordClears[item.w.word] || { kanji: false, kana: false, meaning: false };
              if (typeof st === 'number') st = { kanji: false, kana: false, meaning: false };

              if (displayMode === 'word' && st.kanji) return false;
              if ((displayMode === 'kana' || displayMode === 'audio') && st.kana) return false;
              if (displayMode === 'meaning' && st.meaning) return false;
          }
          return true;
      });
      
      if (sourceWords.length === 0) {
          return showConfirm('此维度已圆满', '当前范围内该模式对应的「维度杠」已全部点亮。是否前往设置关闭「智能跳过」？', () => {
              Nav.switchTab('tab-settings', ' |【環境設定】', document.querySelector('[data-target="tab-settings"]'));
          });
      }
      Hardware.playSound('click'); 
      Model.state.mode = 'filter-test'; Model.state.currentIndex = 0; Model.state.ftState = 'A'; Model.state.ftHint = null; Model.state.ftShowKanaHint = false; Model.state.maxProgressSeen = 0; Model.state.maxSessionCombo = 0; Model.state.sessionSaved = false;
      
      let rawQueue = sourceWords.map(x => x.i);
      if (localStorage.getItem('postponeTested') === 'true') {
          let front = []; let back = [];
          rawQueue.forEach(idx => {
              let clearCount = Model.mtWordClears[Model.db[idx].word];
              // 状态1 (undefined/纯新词) 和 状态2 (>0/已通关熟词) 放在队伍前半段
              if (clearCount === undefined || clearCount > 0) front.push(idx);
              // 状态3 (===0/明确标记为忘记或打回原形的词) 发配到队伍最末尾
              else back.push(idx);
          });
          // 分别打乱前后两截队伍，再拼接发牌
          front.sort(() => Math.random() - 0.5); back.sort(() => Math.random() - 0.5);
          Model.state.studyQueue = front.concat(back);
      } else {
          Model.state.studyQueue = rawQueue.sort(() => Math.random() - 0.5);
      }
      
      View.updateComboBadge(); View.showPage('study-area'); let c = View.getEl('pixel-matrix'); c.innerHTML=''; View.renderStudyCard('none'); Hardware.vibrate(40);
  },

  processFilterTestResult(isCorrect) {
      let w = Model.db[Model.state.studyQueue[Model.state.currentIndex]];
      let wordKey = w.word;
      
      // 初始化数据清洗
      if (!Model.mtWordClears[wordKey] || typeof Model.mtWordClears[wordKey] !== 'object') {
          Model.mtWordClears[wordKey] = { kanji: false, kana: false, meaning: false };
      }

      // 获取当前考试模式（靶向对位）
      let mode = View.getEl('test-display-select').value || 'kana';
      
      if (isCorrect) {
          if (mode === 'word') Model.mtWordClears[wordKey].kanji = true;
          else if (mode === 'kana' || mode === 'audio') Model.mtWordClears[wordKey].kana = true;
          else if (mode === 'meaning') Model.mtWordClears[wordKey].meaning = true;

          // 🚀 容错规则生效：红(假名)和白(释义)都过关，自动保送黄(汉字)
          if (Model.mtWordClears[wordKey].kana && Model.mtWordClears[wordKey].meaning) {
              Model.mtWordClears[wordKey].kanji = true;
          }
      } else {
          // 答错的话，精准把当前测试维度打回原形
          if (mode === 'word') Model.mtWordClears[wordKey].kanji = false;
          else if (mode === 'kana' || mode === 'audio') Model.mtWordClears[wordKey].kana = false;
          else if (mode === 'meaning') Model.mtWordClears[wordKey].meaning = false;
      }

      Model.saveClears(); 
      Model.state.currentIndex++; 
      Model.state.ftState = 'A'; Model.state.ftHint = null; Model.state.ftShowKanaHint = false;
      
      if (Model.state.currentIndex >= Model.state.studyQueue.length) { 
          Hardware.playSound('success'); Hardware.vibrate(1000); 
          showToast("恭喜，全部靶向检验完成！"); 
          View.getEl('btn-exit-study').click(); 
      } else { 
          View.renderStudyCard('next'); 
      }
  },

  handleDtSpellClick(btn, token) {
      if (Model.state.isAnimating || btn.classList.contains('used')) return;
      let targetChar = Model.state.dtSpellTarget[Model.state.dtSpellCurrentIdx];
      if (token === targetChar) {
          Hardware.playSound('click'); Hardware.vibrate(15); btn.classList.add('used'); Model.state.dtSpellCurrentIdx++;
          View.getEl('dt-spell-input').innerText = Model.state.dtSpellTarget.slice(0, Model.state.dtSpellCurrentIdx).join('');
          if (Model.state.dtSpellCurrentIdx >= Model.state.dtSpellTarget.length) { Model.state.isAnimating = true; Hardware.playSound('success'); Hardware.vibrate(50); Model.state.comboCount++; Model.state.maxSessionCombo = Math.max(Model.state.maxSessionCombo, Model.state.comboCount); View.updateComboBadge(); setTimeout(() => this.dtAdvanceNext(), 300); }
      } else { Hardware.playSound('error'); Hardware.vibrate(50); btn.classList.remove('shake-anim', 'wrong'); void btn.offsetWidth; btn.classList.add('shake-anim', 'wrong'); Model.state.comboCount = Math.max(0, Model.state.comboCount - 3); View.updateComboBadge(); }
  },

  handleDtChoiceClick(btn, isCorrect) {
      if (Model.state.isAnimating) return;
      if (isCorrect) {
          Model.state.isAnimating = true; btn.classList.add('correct'); Hardware.playSound('success'); Hardware.vibrate(40); Model.state.comboCount++; Model.state.maxSessionCombo = Math.max(Model.state.maxSessionCombo, Model.state.comboCount); View.updateComboBadge();
          document.getElementById('w-example-box').querySelectorAll('.dt-ex-cn.hidden-translation').forEach(el => { 
    el.style.transform = 'rotateX(90deg)'; el.style.opacity = '0'; 
    setTimeout(() => { 
        el.innerText = el.dataset.text; 
        el.className = 'dt-ex-cn revealed-translation'; 
        el.style.transform = 'rotateX(-90deg)'; 
        void el.offsetWidth; 
        el.style.transform = 'rotateX(0)'; 
        el.style.opacity = '1'; 
        // 如果未使用Ruby模式，调用MathJax重新渲染
        if (localStorage.getItem('useRubyRender') === 'false' && window.MathJax) {
            MathJax.typesetPromise([el]);
        }
    }, 150); 
});
          document.querySelectorAll('.dt-choice-btn').forEach(b => b.style.pointerEvents = 'none'); setTimeout(() => this.dtAdvanceNext(), 600);
      } else { Hardware.playSound('error'); Hardware.vibrate(50); btn.classList.remove('shake-anim', 'wrong'); void btn.offsetWidth; btn.classList.add('shake-anim', 'wrong'); Model.state.comboCount = Math.max(0, Model.state.comboCount - 3); View.updateComboBadge(); }
  },

  handleMtSpellClick(btn, token, wObj, displayMode) {
      if (Model.state.isAnimating || btn.classList.contains('used')) return;
      let targetChar = Model.state.dtSpellTarget[Model.state.dtSpellCurrentIdx];
      if (token === targetChar) {
          Hardware.playSound('click'); Hardware.vibrate(15); btn.classList.add('used'); Model.state.dtSpellCurrentIdx++;
          View.getEl('mt-spell-input').innerText = Model.state.dtSpellTarget.slice(0, Model.state.dtSpellCurrentIdx).join('');
          if (Model.state.dtSpellCurrentIdx >= Model.state.dtSpellTarget.length) { 
              Model.state.isAnimating = true; Hardware.playSound('success'); Hardware.vibrate(50); Model.state.comboCount++; Model.state.maxSessionCombo = Math.max(Model.state.maxSessionCombo, Model.state.comboCount); View.updateComboBadge();
              if (Model.state.mode === 'memory-test') { View.getEl('w-kana').innerText = wObj.kana; View.getEl('w-kana').style.display = 'block'; View.getEl('w-kana').classList.add('shake-anim'); setTimeout(() => View.getEl('w-kana').classList.remove('shake-anim'), 300); setTimeout(() => this.mtAdvanceNext(), 800); } 
              else { if(displayMode === 'word' || displayMode === 'meaning') { View.getEl('w-kana').innerText = wObj.kana; View.getEl('w-kana').classList.add('shake-anim'); setTimeout(() => View.getEl('w-kana').classList.remove('shake-anim'), 300); } setTimeout(() => { Model.state.mtStep = 2; Model.state.isAnimating = false; View.renderMemoryTestUI(wObj, displayMode); }, 600); }
          }
      } else { Hardware.playSound('error'); Hardware.vibrate(50); btn.classList.remove('shake-anim', 'wrong'); void btn.offsetWidth; btn.classList.add('shake-anim', 'wrong'); Model.state.comboCount = Math.max(0, Model.state.comboCount - 3); View.updateComboBadge(); Model.state.currentWordFailed = true; }
  },

  handleMtChoiceClick(btn, isCorrect, wObj, displayMode) {
      if (Model.state.isAnimating) return;
      if (isCorrect) {
          Model.state.isAnimating = true; btn.classList.add('correct'); Hardware.playSound('success'); Hardware.vibrate(40); Model.state.comboCount++; Model.state.maxSessionCombo = Math.max(Model.state.maxSessionCombo, Model.state.comboCount); View.updateComboBadge();
          if (Model.state.mode === 'memory-test') {
              let round = Model.state.mtRound; let step = Model.state.mtStep;
              if (round === 1) { View.getEl('w-meaning').innerText = wObj.meaning; View.getEl('w-meaning').style.display = 'block'; View.getEl('w-meaning').classList.add('shake-anim'); setTimeout(() => View.getEl('w-meaning').classList.remove('shake-anim'), 300); document.querySelectorAll('#mt-choice-buttons .dt-choice-btn').forEach(b => b.style.pointerEvents = 'none'); setTimeout(() => this.mtAdvanceNext(), 800); } 
              else if (round === 2) { if (step === 1) { View.getEl('w-word').innerText = wObj.word; View.getEl('w-word').style.display = 'block'; View.getEl('w-word').classList.add('shake-anim'); setTimeout(() => View.getEl('w-word').classList.remove('shake-anim'), 300); setTimeout(() => { Model.state.mtStep = 2; Model.state.isAnimating = false; View.renderMemoryTestUI(wObj, displayMode); }, 600); } } 
              else if (round === 3) { if (step === 1) { View.getEl('w-meaning').innerText = wObj.meaning; View.getEl('w-meaning').style.display = 'block'; View.getEl('w-meaning').classList.add('shake-anim'); setTimeout(() => View.getEl('w-meaning').classList.remove('shake-anim'), 300); setTimeout(() => { Model.state.mtStep = 2; Model.state.isAnimating = false; View.renderMemoryTestUI(wObj, displayMode); }, 600); } else if (step === 2) { View.getEl('w-word').innerText = wObj.word; View.getEl('w-word').style.display = 'block'; View.getEl('w-word').classList.add('shake-anim'); setTimeout(() => View.getEl('w-word').classList.remove('shake-anim'), 300); document.querySelectorAll('#mt-choice-buttons .dt-choice-btn').forEach(b => b.style.pointerEvents = 'none'); setTimeout(() => this.mtAdvanceNext(), 800); } }
          } else {
              if (Model.state.mtStep === 1) { View.getEl('w-word').innerText = wObj.word; View.getEl('w-word').classList.add('shake-anim'); setTimeout(() => View.getEl('w-word').classList.remove('shake-anim'), 300); setTimeout(() => { Model.state.mtStep = 2; Model.state.isAnimating = false; View.renderMemoryTestUI(wObj, displayMode); }, 600); } 
              else { if (displayMode === 'word' || displayMode === 'kana') { View.getEl('w-meaning').innerText = wObj.meaning; } else if (displayMode === 'meaning') { View.getEl('w-word').innerText = wObj.word; } View.getEl('w-example-box').style.display = 'block'; document.querySelectorAll('#mt-choice-buttons .dt-choice-btn').forEach(b => b.style.pointerEvents = 'none'); setTimeout(() => this.mtAdvanceNext(), 800); }
          }
      } else { Hardware.playSound('error'); Hardware.vibrate(50); btn.classList.remove('shake-anim', 'wrong'); void btn.offsetWidth; btn.classList.add('shake-anim', 'wrong'); Model.state.comboCount = Math.max(0, Model.state.comboCount - 3); View.updateComboBadge(); Model.state.currentWordFailed = true; }
  },

  dtAdvanceNext() { Model.state.currentIndex++; if (Model.state.currentIndex >= Model.state.studyQueue.length) { this.finishPendulum(); } else { View.renderStudyCard('next'); } },
  mtAdvanceNext() { 
      if (Model.state.mode === 'memory-test') {
          if (Model.state.currentWordFailed) { let failedIdx = Model.state.studyQueue.shift(); Model.state.studyQueue.push(failedIdx); } else { Model.state.studyQueue.shift(); }
          Model.state.currentWordFailed = false; Model.state.mtStep = 1; Model.state.currentIndex = 0; 
          if (Model.state.studyQueue.length === 0) {
              if (Model.state.mtRound < 3) { Model.state.mtRound++; Model.state.studyQueue = [...Model.state.mtBaseQueue].sort(() => Math.random() - 0.5); Hardware.playSound('success'); Hardware.vibrate(200); showToast(`第 ${Model.state.mtRound - 1} 轮清空！硬核进阶`); setTimeout(() => View.renderStudyCard('next'), 500); } 
              else { 
    let gk = Model.state.currentGroupKey; 
    Model.mtGroupClears[gk] = (Model.mtGroupClears[gk] || 0) + 1; 
    Model.state.mtBaseQueue.forEach(idx => { 
        let wWord = Model.db[idx].word; 
        // 修复：改为三维对象全部掌握，而非累加数字
        if (!Model.mtWordClears[wWord] || typeof Model.mtWordClears[wWord] !== 'object') {
            Model.mtWordClears[wWord] = { kanji: false, kana: false, meaning: false };
        }
        Model.mtWordClears[wWord].kanji = true;
        Model.mtWordClears[wWord].kana = true;
        Model.mtWordClears[wWord].meaning = true;
    }); 
    Model.saveClears(); 
    this.finishPendulum(); 
}
          } else { View.renderStudyCard('next'); }
      } else { if (Model.state.currentWordFailed) { let failedIdx = Model.state.studyQueue[Model.state.currentIndex]; Model.state.studyQueue.push(failedIdx); Model.state.currentWordFailed = false; } Model.state.currentIndex++; Model.state.mtStep = 1; if (Model.state.currentIndex >= Model.state.studyQueue.length) this.finishPendulum(); else View.renderStudyCard('next'); }
  },

  finishPendulum() {
    Hardware.playSound('success'); Hardware.vibrate(1000); let t = new Date().toLocaleDateString('zh-CN');
    this.saveSessionRecord(); 
    let exist = Model.records.findIndex(x => x.date === t && x.group === Model.state.currentGroupLabel && x.type === 'pendulum');
    if(exist === -1) { Model.records.unshift({date: t, group: Model.state.currentGroupLabel, type: 'pendulum'}); Model.saveRecords(); }
    showToast("任务完成"); View.getEl('btn-exit-study').click();
  },

  toggleBatchMode() { Hardware.playSound('click'); Hardware.vibrate(20); Model.state.batchMode = !Model.state.batchMode; Model.state.selectedSet.clear(); if (Model.state.batchMode && Model.state.manageMode) { Model.state.manageMode = false; } View.updateWordbankUI(); View.resetWordbankRenderer(); },
  createFolder() { Hardware.vibrate(20); showPrompt("请输入新文件夹名称", "", (name) => { if(Model.folders.includes(name)) return showToast("文件夹已存在"); Model.folders.push(name); Model.saveFolders(); View.updateWordbankUI(); }); },
  deleteFolder() { 
      Hardware.vibrate(20); 
      let filter = View.getEl('wb-folder-filter').value; 
      if (filter === 'all' || filter === '默认词库' || filter.startsWith('virtual_')) return showToast("内置分类不可删除"); 
      showConfirm('删除文件夹', `确定要删除「${filter}」吗？里面的单词会自动退回默认词库。`, () => { 
          // 删除前退出批量模式
          if (Model.state.batchMode) this.toggleBatchMode();
          Model.db.forEach(w => { if(w.folder === filter) w.folder = "默认词库"; }); 
          Model.folders = Model.folders.filter(f => f !== filter); 
          Model.saveFolders(); 
          Model.saveDB(); 
          View.getEl('wb-folder-filter').value = "all"; 
          View.updateWordbankUI(); 
          View.resetWordbankRenderer(); 
          showToast("已删除"); 
      }); 
  },
  openMoveModal(idx) { if (idx === -2 && Model.state.selectedSet.size === 0) return showToast("未选词"); Model.state.moveTargetIdx = idx; let destSelect = View.getEl('move-dest-select'); destSelect.innerHTML = ''; Model.folders.forEach(f => { destSelect.add(new Option(f, f)); }); destSelect.dispatchEvent(new Event('facade-update')); window.toggleModal('move-overlay', true); },
  confirmMove() { Hardware.playSound('success'); Hardware.vibrate(40); let dest = View.getEl('move-dest-select').value; if (Model.state.moveTargetIdx === -2) { Model.state.selectedSet.forEach(idx => Model.db[idx].folder = dest); this.toggleBatchMode(); } else { Model.db[Model.state.moveTargetIdx].folder = dest; } Model.saveDB(); window.toggleModal('move-overlay', false); View.resetWordbankRenderer(); showToast("移动成功");},
batchDelete() { 
    Hardware.playSound('click'); Hardware.vibrate(30); 
    if(Model.state.selectedSet.size === 0) return showToast("未选中任何单词"); 
    showConfirm('批量删除', `确定删除这 ${Model.state.selectedSet.size} 个单词？`, () => { 
        // 删除前关闭详情卡片，避免 detailArray 失效
        this.closeDetailIfOpen();
        Model.db = Model.db.filter((_, i) => !Model.state.selectedSet.has(i)); 
        Model.saveDB(); 
        this.toggleBatchMode();
        // 确保词库网格立即刷新（关闭详情页后可能未刷新）
        if (document.getElementById('tab-wordbank').classList.contains('active')) {
            Model.state.renderedStartIndex = -1;
            View.renderVirtualGrid();
        }
        showToast("已批量删除"); 
    }); 
},
  editWord(idx) { Model.editingIdx = idx; let w = Model.db[idx]; View.getEl('edit-word').value = w.word; View.getEl('edit-kana').value = w.kana; View.getEl('edit-type').value = w.type; View.getEl('edit-meaning').value = w.meaning; window.toggleModal('edit-overlay', true); },
deleteWord(idx) { 
    showConfirm('删除单词', '彻底删除该词？', () => { 
        // 删除前关闭详情卡片
        this.closeDetailIfOpen();
        const word = Model.db[idx].word;
        Model.db.splice(idx,1); 
        Model.saveDB();
        // 清理关联数据
        Model.stars = Model.stars.filter(w => w !== word);
        delete Model.mtWordClears[word];
        Model.saveStars();
        Model.saveClears();
        // 确保词库网格立即刷新
        if (document.getElementById('tab-wordbank').classList.contains('active')) {
            Model.state.renderedStartIndex = -1;
        }
        View.resetWordbankRenderer(); 
        showToast("已删除"); 
    }); 
},
  importWords() { 
      Hardware.playSound('click'); Hardware.vibrate(15);
      let text = View.getEl('custom-input').value.trim(); 
      if(!text) return; 
      let target = View.getEl('wb-folder-filter').value; 
      if(target === 'all' || target.startsWith('virtual_')) target = "默认词库"; 
      let added = 0; 
      text.split('\n').forEach(line => { 
          let parts = line.includes('\t') ? line.split('\t') : line.split(/[,，]/); 
          if(parts.length >= 4){ 
              Model.db.push({ 
                  word: parts[0].trim(), 
                  kana: parts[1].trim(), 
                  type: parts[2].trim(), 
                  meaning: parts[3].trim(), 
                  example: parts[4] ? parts[4].trim() : "", 
                  folder: target, 
                  srs: { ease: 2.5, interval: 0, nextReview: Date.now() } 
              }); 
              added++; 
          } 
      }); 
      if(added) { 
          Hardware.playSound('success');
          // 导入后关闭详情卡片
          this.closeDetailIfOpen();
          Model.saveDB(); 
          View.resetWordbankRenderer(); 
          showToast(`成功导入 ${added} 词`); 
          View.getEl('custom-input').value=''; 
      } 
  },
  
  openDetailModal(idx) { 
      let currentFilter = View.getEl('wb-folder-filter').value; 
      Model.state.detailArray = []; 
      Model.db.forEach((w, i) => { 
          let matchFolder = false; 
          if (currentFilter === 'all') matchFolder = true; 
          else if (currentFilter === 'virtual_starred') matchFolder = Model.stars.includes(w.word); 
   else if (currentFilter === 'virtual_cleared') {
    let st = Model.mtWordClears[w.word];
    if (typeof st === 'number') st = { kanji: false, kana: false, meaning: false };
    matchFolder = st.kanji && st.kana && st.meaning;
} else if (currentFilter === 'virtual_uncleared') {
    let st = Model.mtWordClears[w.word];
    if (typeof st === 'number') st = { kanji: false, kana: false, meaning: false };
    matchFolder = !(st.kanji && st.kana && st.meaning);
}
          else matchFolder = (w.folder === currentFilter); 
          if(matchFolder) Model.state.detailArray.push(i); 
      }); 
      Model.state.activeDetailIdx = Model.state.detailArray.indexOf(idx); 
      window.toggleModal('detail-overlay', true); 
      this.renderDetailCard('none', true); 
  },
  
  navDetail(dir) { 
      Model.state.activeDetailIdx += dir; 
      let max = Model.state.detailArray.length; 
      if (Model.state.activeDetailIdx < 0) Model.state.activeDetailIdx = max - 1; 
      if (Model.state.activeDetailIdx >= max) Model.state.activeDetailIdx = 0; 
      
      // 检查当前索引是否有效
      let realIdx = Model.state.detailArray[Model.state.activeDetailIdx];
      let w = Model.db[realIdx];
      if (!w) {
          // 单词可能已被删除，关闭详情并刷新词库
          window.toggleModal('detail-overlay', false);
          if (document.getElementById('tab-wordbank').classList.contains('active')) {
              Model.state.renderedStartIndex = -1;
              View.renderVirtualGrid();
          }
          showToast("单词不存在，已关闭详情");
          return;
      }
      
      Hardware.playSound('click'); Hardware.vibrate(30); 
      this.renderDetailCard(dir > 0 ? 'next' : 'prev', true); 
  },
  
  renderDetailCard(anim, triggerTTS = false) { 
      let realIdx = Model.state.detailArray[Model.state.activeDetailIdx]; 
      let w = Model.db[realIdx]; 
      if (!w) {
          // 如果当前单词无效，关闭模态框
          window.toggleModal('detail-overlay', false);
          return;
      }
      let wrapper = View.getEl('dt-anim-wrapper'); 
      wrapper.className = 'detail-anim-wrapper'; 
      void wrapper.offsetWidth; 
      
      if(anim !== 'none') { 
          wrapper.classList.add(anim === 'next' ? 'anim-slide-out-left' : 'anim-slide-out-right'); 
          setTimeout(() => { 
              try {
                  this.updateDetailContent(w, triggerTTS); 
              } catch (err) {
                  console.error('更新详情内容失败', err);
                  // 出错时强制恢复可见性
                  wrapper.style.opacity = '1';
                  wrapper.style.transform = 'none';
              } finally {
                  wrapper.className = 'detail-anim-wrapper'; 
                  void wrapper.offsetWidth; 
                  wrapper.classList.add(anim === 'next' ? 'anim-slide-in-right' : 'anim-slide-in-left'); 
              }
          }, 200); 
      } else { 
          this.updateDetailContent(w, triggerTTS); 
      } 
  },
  
  updateDetailContent(w, triggerTTS = false) { 
      let visuals = View.getCardVisuals(w.type); 
      document.querySelector('#detail-card-container .watermark-layer').style.background = visuals.bg; 
      View.getEl('dt-watermark').innerText = visuals.wm; 
      
      // 🚀 核心优化 2：详情页动态字号排版
      let dtWordEl = View.getEl('dt-word');
      dtWordEl.innerText = w.word; 
      let dtLen = Array.from(w.word || '').length;
      if (dtLen >= 10) dtWordEl.style.fontSize = '1.8rem';
      else if (dtLen >= 7) dtWordEl.style.fontSize = '2.2rem';
      else if (dtLen >= 5) dtWordEl.style.fontSize = '2.6rem';
      else dtWordEl.style.fontSize = '';

      View.getEl('dt-kana').innerText = w.kana; 
      View.getEl('dt-type').innerHTML = visuals.tagsHTML; 
      View.getEl('dt-mean').innerText = w.meaning; 
      View.renderExampleBox(w.example, 'dt-example-box'); 
      let st = Model.mtWordClears[w.word] || { kanji: false, kana: false, meaning: false };
      if (typeof st === 'number') st = { kanji: false, kana: false, meaning: false };
      let badge = View.getEl('dt-hanko-badge'); 
      if (badge) { 
          badge.style.display = 'flex'; 
          badge.className = 'card-tri-bar'; 
          badge.style.transform = 'scale(1.5)';
          badge.style.transformOrigin = 'top left';
          badge.innerHTML = `
            <div class="tri-bar-segment bar-y ${st.kanji ? 'active' : ''}"></div>
            <div class="tri-bar-segment bar-r ${st.kana ? 'active' : ''}"></div>
            <div class="tri-bar-segment bar-w ${st.meaning ? 'active' : ''}"></div>
          `;
      } 
      let isStarred = Model.stars.includes(w.word); 
      let starBtn = View.getEl('dt-star-btn'); let starIcon = View.getEl('dt-star-icon'); 
      if (starBtn && starIcon) { 
          if (isStarred) { starBtn.classList.add('active'); starIcon.style.fontVariationSettings = "'FILL' 1"; } 
          else { starBtn.classList.remove('active'); starIcon.style.fontVariationSettings = "'FILL' 0"; } 
      } 
      if (triggerTTS && localStorage.getItem('autoSpeak') !== 'false') { Hardware.speakText(w.kana.replace(/[【】\[\]()]/g,'')); } 
  }
};

window.onload = () => Controller.init();