/**
 * 钟摆日语 - 核心控制逻辑
 */

const DATA_VERSION = 'v1';
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

// 新增：用于记录打开弹窗前最后操作的 DOM 元素
let previousFocusElement = null;

window.toggleModal = (id, show) => {
    let el = document.getElementById(id);
    if (!el) return;
    
    if (show) {
        // 1. 焦点借出：仅在当前没有任何弹窗开启时记录焦点
        if (document.querySelectorAll('.modal-overlay.active').length === 0) {
            previousFocusElement = document.activeElement;
        }
        el.classList.add('active');
        
        // 2. 焦点入场：延迟等待 CSS 动画生效后，自动聚焦弹窗内第一个可交互元素
        setTimeout(() => {
            let focusable = Array.from(el.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
                                 .filter(node => node.offsetParent !== null);
            
            if (focusable.length > 0 && !el.contains(document.activeElement)) {
                focusable[0].focus();
            }
        }, 100);
        
    } else {
        el.classList.remove('active');
        
        // 3. 焦点归还：当所有弹窗都关闭时，将焦点还给触发弹窗的原元素
        if (document.querySelectorAll('.modal-overlay.active').length === 0 && previousFocusElement) {
            previousFocusElement.focus();
            previousFocusElement = null;
        }
    }
    
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
            // 1. 响应手指按下：实现“即刻反馈”，并将震动时长从 10 增至 25，确保所有机型都能感受到干脆的震感
            item.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                Hardware.playSound('click'); Hardware.vibrate(25);
                let targetId = e.currentTarget.getAttribute('data-target');
                let titleData = e.currentTarget.getAttribute('data-title');
                this.switchTab(targetId, titleData, e.currentTarget);
            });
            
            // 2. 保留 click 用于兼容：拦截真实的物理抬手点击(防重复执行)，但放行代码级别的虚拟点击(如使用电脑键盘左右方向键切换 Tab)
            item.addEventListener('click', (e) => {
                if (e.isTrusted) return; 
                Hardware.playSound('click'); Hardware.vibrate(25);
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
        if (Model.state.batchMode || Model.state.manageMode) {
            Model.state.batchMode = false;
            Model.state.manageMode = false;
            Model.state.selectedSet.clear();
            
            View.updateWordbankUI(); 
            document.querySelectorAll('.wb-manage-overlay').forEach(el => el.classList.remove('active'));
            Model.state.renderedStartIndex = -1; 
        }

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
            facade.setAttribute('tabindex', '0');
            facade.setAttribute('role', 'button');
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
            if (opt.style.display === 'none') return; // 遇到隐藏选项，直接跳过不画
            let btn = document.createElement('div');
            btn.className = 'bs-option ' + (opt.selected ? 'selected' : '');
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('role', 'button');
            
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

const RomajiEngine = {
    mode: 'hiragana', // 'hiragana' or 'katakana'
    raw: '',          // 已转换的假名
    buffer: '',       // 缓冲中的罗马字
    map: {
        "a":"あ","i":"い","u":"う","e":"え","o":"お","ka":"か","ki":"き","ku":"く","ke":"け","ko":"こ","ga":"が","gi":"ぎ","gu":"ぐ","ge":"げ","go":"ご",
        "sa":"さ","shi":"し","si":"し","su":"す","se":"せ","so":"そ","za":"ざ","ji":"じ","zi":"じ","zu":"ず","ze":"ぜ","zo":"ぞ",
        "ta":"た","chi":"ち","ti":"ち","tsu":"つ","tu":"つ","te":"て","to":"と","da":"だ","di":"ぢ","du":"づ","de":"で","do":"ど",
        "na":"な","ni":"に","nu":"ぬ","ne":"ね","no":"の","ha":"は","hi":"ひ","fu":"ふ","hu":"ふ","he":"へ","ho":"ほ",
        "ba":"ば","bi":"び","bu":"ぶ","be":"べ","bo":"ぼ","pa":"ぱ","pi":"ぴ","pu":"ぷ","pe":"ぺ","po":"ぽ",
        "ma":"ま","mi":"み","mu":"む","me":"め","mo":"も","ya":"や","yu":"ゆ","yo":"よ","ra":"ら","ri":"り","ru":"る","re":"れ","ro":"ろ",
        "wa":"わ","wo":"を","nn":"ん","n ":"ん","-":"ー",
        "kya":"きゃ","kyu":"きゅ","kyo":"きょ","gya":"ぎゃ","gyu":"ぎゅ","gyo":"ぎょ",
        "sha":"しゃ","sya":"しゃ","shu":"しゅ","syu":"しゅ","sho":"しょ","syo":"しょ",
                "ja":"じゃ","zya":"じゃ","jya":"じゃ","ju":"じゅ","zyu":"じゅ","jyu":"じゅ","jo":"じょ","zyo":"じょ","jyo":"じょ",
        "cha":"ちゃ","tya":"ちゃ","cya":"ちゃ","chu":"ちゅ","tyu":"ちゅ","cyu":"ちゅ","cho":"ちょ","tyo":"ちょ","cyo":"ちょ",

        "nya":"にゃ","nyu":"にゅ","nyo":"にょ","hya":"ひゃ","hyu":"ひゅ","hyo":"ひょ",
        "bya":"びゃ","byu":"びゅ","byo":"びょ","pya":"ぴゃ","pyu":"ぴゅ","pyo":"ぴょ",
        "mya":"みゃ","myu":"みゅ","myo":"みょ","rya":"りゃ","ryu":"りゅ","ryo":"りょ"
    },
    reset() { this.raw = ''; this.buffer = ''; this.mode = 'hiragana'; },
    toggleMode() { this.mode = this.mode === 'hiragana' ? 'katakana' : 'hiragana'; Hardware.vibrate(10); },
    toKatakana(hira) { return hira.replace(/[\u3041-\u3096]/g, m => String.fromCharCode(m.charCodeAt(0) + 0x60)); },
    input(char) {
        if (char === 'Backspace') {
            if (this.buffer.length > 0) this.buffer = this.buffer.slice(0, -1);
            else if (this.raw.length > 0) this.raw = this.raw.slice(0, -1);
            Hardware.vibrate(10); return;
        }
        Hardware.vibrate(15);
        this.buffer += char.toLowerCase();
        
        // 促音规则
        if (this.buffer.length >= 2 && this.buffer[0] === this.buffer[1] && !"aeiouy-".includes(this.buffer[0]) && this.buffer[0] !== 'n') {
            this.raw += this.mode === 'hiragana' ? "っ" : "ッ";
            this.buffer = this.buffer.slice(1);
        }
        // 拨音规则
        if (this.buffer.length >= 2 && this.buffer[0] === 'n' && this.buffer[1] !== 'n' && !"aeiouy-".includes(this.buffer[1])) {
            this.raw += this.mode === 'hiragana' ? "ん" : "ン";
            this.buffer = this.buffer.slice(1);
        }
        // 匹配合成
        for (let i = 3; i > 0; i--) {
            if (this.buffer.length >= i) {
                let chunk = this.buffer.slice(0, i);
                if (this.map[chunk]) {
                    let kana = this.map[chunk];
                    this.raw += this.mode === 'hiragana' ? kana : this.toKatakana(kana);
                    this.buffer = this.buffer.slice(i);
                    break;
                }
            }
        }
    },
    getDisplayText() { return this.raw + (this.buffer ? `<span class="pending-romaji">${this.buffer}</span>` : ''); },
    getFinalText() { 
        let finalBuf = this.buffer;
        if (finalBuf === 'n') finalBuf = this.mode === 'hiragana' ? 'ん' : 'ン';
        return this.raw + finalBuf; 
    }
};

// Simple English word input buffer for spelling mode
const EnglishInput = {
    buffer: '',
    reset() { this.buffer = ''; },
    input(char) {
        if (char === 'Backspace') {
            this.buffer = this.buffer.slice(0, -1);
            return;
        }
        if (char.length === 1 && /[a-zA-Z]/.test(char)) {
            this.buffer += char.toLowerCase();
        }
    },
    getDisplayText() { return this.buffer || ''; },
    getFinalText() { return this.buffer; }
};

const Model = {
  db: [], folders: ["默认词库"], folderLangs: { "默认词库": "ja" }, stars: [], records: [], editingIdx: -1,

  mtGroupClears: {}, mtWordClears: {},
  getFolderLang(folderName) {
    return this.folderLangs[folderName] || "ja";
  },
    getCurrentLang() {
    return this.state.currentLangMode || "ja";
  },

  state: {
    mode: 'none', studyQueue: [], currentIndex: 0, currentGroupLabel: '', currentGroupKey: '',
    dtWordAppearanceMap: {}, dtSubMode: '', dtSpellTarget: [], dtSpellCurrentIdx: 0,
    mtRound: 1, mtStep: 1, currentWordFailed: false, totalTestWords: 0, mtBaseQueue: [],
    ftState: 'A', ftHint: null, ftShowKanaHint: false,
    comboCount: 0, maxSessionCombo: 0, sessionSaved: false,
    maxProgressSeen: 0, uniqueWordCount: 0, initialQueueLength: 0,
    batchMode: false, manageMode: false, selectedSet: new Set(), activeDetailIdx: 0, detailArray: [], moveTargetIdx: -1, 
    isAnimating: false, filteredDb: [], renderedStartIndex: -1, renderedEndIndex: -1, currentLangMode: 'ja'
  },
  
  lbState: {
      singleMode: 'dual-track', 
      page: 1,
      pageSize: 50
  },

  async init() { await this.loadData(); },
  
  idbAvailable: true,

  async loadData() {
    // Dev auto-reset: if data version changed, clear all stored data
    const storedVer = localStorage.getItem('dataVersion');
    if (storedVer !== DATA_VERSION) {
      console.log('[Dev] Data version changed (' + (storedVer || 'none') + ' -> ' + DATA_VERSION + '), resetting...');
      ['myWordDB_v3','myFolders_v3','myFolderLangs','starredWords','studyRecords','mtGroupClears_v3','mtWordClears_v3'].forEach(k => localStorage.removeItem(k));
      if (typeof idbKeyval !== 'undefined') {
        try {
          await Promise.all([
            idbKeyval.del('myWordDB_v3'), idbKeyval.del('myFolders_v3'), idbKeyval.del('myFolderLangs'),
            idbKeyval.del('starredWords'), idbKeyval.del('studyRecords'),
            idbKeyval.del('mtGroupClears_v3'), idbKeyval.del('mtWordClears_v3')
          ]);
        } catch(e) { console.warn('[Dev] IndexedDB clear failed:', e); }
      }
      localStorage.setItem('dataVersion', DATA_VERSION);
    }
    let storedDB = null;
    try {
        if (typeof idbKeyval !== 'undefined') {
            storedDB = await idbKeyval.get('myWordDB_v3');
        } else {
            this.idbAvailable = false;
        }
    } catch(e) {
        console.warn('[DB] idb-keyval 不可用，降级至 localStorage', e);
        this.idbAvailable = false;
    }
    
    if (storedDB) {
        this.db = storedDB;
        this.folders = await idbKeyval.get('myFolders_v3') || ["默认词库"];
        this.folderLangs = await idbKeyval.get('myFolderLangs') || { "默认词库": "ja" };
        this.stars = await idbKeyval.get('starredWords') || [];
        this.records = await idbKeyval.get('studyRecords') || [];
        this.mtGroupClears = await idbKeyval.get('mtGroupClears_v3') || {};
        this.mtWordClears = await idbKeyval.get('mtWordClears_v3') || {};
    } else {
        let lsDB = localStorage.getItem('myWordDB_v3');
        if (lsDB) {
            this.db = JSON.parse(lsDB);
            this.folders = JSON.parse(localStorage.getItem('myFolders_v3')) || ["默认词库"];
            this.folderLangs = JSON.parse(localStorage.getItem('myFolderLangs')) || { "默认词库": "ja" };
            this.stars = JSON.parse(localStorage.getItem('starredWords')) || [];
            this.records = JSON.parse(localStorage.getItem('studyRecords')) || [];
            this.mtGroupClears = JSON.parse(localStorage.getItem('mtGroupClears_v3')) || {};
            this.mtWordClears = JSON.parse(localStorage.getItem('mtWordClears_v3')) || {};
            
            await Promise.all([
                this.saveDB(), this.saveFolders(), this.saveStars(), 
                this.saveRecords(), this.saveClears()
            ]);
            ['myWordDB_v3', 'myFolders_v3', 'myFolderLangs', 'starredWords', 'studyRecords', 'mtGroupClears_v3', 'mtWordClears_v3'].forEach(k => localStorage.removeItem(k));
        } else {
            this.db = DefaultWords.map(w => ({...w, folder: "默认词库"})); 
            // Also include English default words
            if (typeof DefaultEnglishWords !== 'undefined') {
                this.db = this.db.concat(DefaultEnglishWords.map(w => ({...w})));
                this.folders.push("四级词汇");
                this.folderLangs["四级词汇"] = "en";
            }
            await this.saveDB(); 
            await this.saveFolders();
        }
    }
  
    // Migrate: ensure all words in db have lang field
    let needLangFix = false;
    for (let w of this.db) {
      if (!w.lang) { w.lang = "ja"; needLangFix = true; }
    }
    if (needLangFix) await this.saveDB();
    
    // Migrate: ensure folderLangs exists for all folders
    let needFolderLangFix = false;
    for (let f of this.folders) {
      if (!this.folderLangs[f]) {
        // Detect language from folder contents
        const enWord = typeof DefaultEnglishWords !== 'undefined' && DefaultEnglishWords.find(w => w.folder === f);
        this.folderLangs[f] = enWord ? "en" : "ja";
        needFolderLangFix = true;
      }
    }
    // Migrate: ensure DefaultEnglishWords folders exist
    if (typeof DefaultEnglishWords !== 'undefined') {
      const enFolders = [...new Set(DefaultEnglishWords.map(w => w.folder))];
      for (let ef of enFolders) {
        if (!this.folders.includes(ef)) {
          this.folders.push(ef);
          this.folderLangs[ef] = "en";
          needFolderLangFix = true;
        }
        // Ensure English words exist in db
        const existingWords = new Set(this.db.map(w => w.word));
        let addedCount = 0;
        DefaultEnglishWords.forEach(w => {
          if (!existingWords.has(w.word)) {
            this.db.push({...w});
            addedCount++;
          }
        });
        if (addedCount > 0) await this.saveDB();
      }
    }
    if (needFolderLangFix) await this.saveFolderLangs();
  
  let needSave = false;
  for (let word in this.mtWordClears) {
      if (typeof this.mtWordClears[word] === 'number') {
          this.mtWordClears[word] = { kanji: false, kana: false, meaning: false };
          needSave = true;
      }
  }
  if (needSave) await this.saveClears();
},

  saveDB() {
      if (!this.idbAvailable) { localStorage.setItem('myWordDB_v3', JSON.stringify(this.db)); return Promise.resolve(); }
      return idbKeyval.set('myWordDB_v3', this.db);
  },
  saveFolders() {
      if (!this.idbAvailable) { localStorage.setItem('myFolders_v3', JSON.stringify(this.folders)); return Promise.resolve(); }
      return idbKeyval.set('myFolders_v3', this.folders);
  },
  saveFolderLangs() {
      if (!this.idbAvailable) { localStorage.setItem('myFolderLangs', JSON.stringify(this.folderLangs)); return Promise.resolve(); }
      return idbKeyval.set('myFolderLangs', this.folderLangs);
  },
  saveStars() {
      if (!this.idbAvailable) { localStorage.setItem('starredWords', JSON.stringify(this.stars)); return Promise.resolve(); }
      return idbKeyval.set('starredWords', this.stars);
  },
  saveRecords() {
      if (!this.idbAvailable) { localStorage.setItem('studyRecords', JSON.stringify(this.records)); return Promise.resolve(); }
      return idbKeyval.set('studyRecords', this.records);
  },
  
  checkFilter(w, filterName) {
      let st = this.mtWordClears[w.word] || { kanji:false, kana:false, meaning:false };
      if (typeof st === 'number') st = { kanji:false, kana:false, meaning:false }; 

      if (filterName === 'virtual_starred') return this.stars.includes(w.word);
      // 统一三杠判断：日语和英语均用 kanji + kana + meaning
      if (filterName === 'virtual_cleared') {
          return st.kanji && st.kana && st.meaning; 
      }
      if (filterName === 'virtual_uncleared') {
          return !(st.kanji && st.kana && st.meaning); 
      }
      if (filterName === 'virtual_know_kanji') return st.kanji;
      if (filterName === 'virtual_know_kana') return st.kana;
      if (filterName === 'virtual_know_meaning') return st.meaning;
      if (filterName === 'virtual_miss_kanji') return !st.kanji;
      if (filterName === 'virtual_miss_kana') return !st.kana;
      if (filterName === 'virtual_miss_meaning') return !st.meaning;
      
      return w.folder === (filterName === 'default' ? '默认词库' : filterName);
  },

  saveClears() {
      if (!this.idbAvailable) {
          localStorage.setItem('mtGroupClears_v3', JSON.stringify(this.mtGroupClears));
          localStorage.setItem('mtWordClears_v3', JSON.stringify(this.mtWordClears));
          return Promise.resolve();
      }
      return Promise.all([
          idbKeyval.set('mtGroupClears_v3', this.mtGroupClears),
          idbKeyval.set('mtWordClears_v3', this.mtWordClears)
      ]);
  },
  
    updateFilteredDb(searchQuery, currentFilter) {
      this.state.filteredDb = this.db.map((w, idx) => ({w, idx})).filter(item => {
          if ((item.w.lang || 'ja') !== Model.state.currentLangMode) return false;
          let matchFolder = currentFilter === 'all' ? true : this.checkFilter(item.w, currentFilter);
          let matchSearch = !searchQuery || 
                            item.w.word.toLowerCase().includes(searchQuery) ||
                            (item.w.kana || '').toLowerCase().includes(searchQuery) ||
                            item.w.meaning.toLowerCase().includes(searchQuery);
          return matchFolder && matchSearch;
      });
      this.state.filteredDb.unshift({ w: { word: 'HINT_CARD', type: 'hint' }, idx: -999 });
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
  audioCtx: null, jaVoiceCache: null, enVoiceCache: null, chargeOsc: null, chargeGain: null, _currentAudio: null,
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
stopAllAudio() {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (this._currentAudio) {
            this._currentAudio.pause();
            this._currentAudio.src = '';
            this._currentAudio = null;
        }
    },
isSpeechUnlocked: false,
      unlockSpeech() {

    try { 
        if (!window.speechSynthesis) return;
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
fallbackLocalTTS(text, isSentence = false, onComplete = null, lang = 'ja-JP') {
    if (!window.speechSynthesis) {
        if (onComplete) onComplete();
        return;
    }
    
    setTimeout(() => {
        let msg = new SpeechSynthesisUtterance(text);
        msg.lang = lang;
        msg.rate = isSentence ? 0.75 : 0.8;
        
        let voices = window.speechSynthesis.getVoices();
        if (lang === 'en-US') {
            if (!this.enVoiceCache) this.enVoiceCache = voices.find(v => v.lang.includes('en') && (v.lang.includes('US') || v.lang.includes('GB')));
            if (this.enVoiceCache) msg.voice = this.enVoiceCache;
        } else if (lang === 'zh-CN') {
            if (!this.zhVoiceCache) this.zhVoiceCache = voices.find(v => v.lang.includes('zh') || v.lang.includes('CN'));
            if (this.zhVoiceCache) msg.voice = this.zhVoiceCache;
        } else {
            if (!this.jaVoiceCache) this.jaVoiceCache = voices.find(v => v.lang.includes('ja') || v.lang.includes('JP'));
            if (this.jaVoiceCache) msg.voice = this.jaVoiceCache;
        }
        
        if (onComplete) {
            msg.onend = onComplete;
            msg.onerror = onComplete;
        }
        
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        window.speechSynthesis.speak(msg);
    }, 50);
},


// Helper: speak the appropriate text for a word based on its language
speakWord(w, btnEl) {
    if (!w) return;
    const isEnglish = w.lang === 'en';
    const text = isEnglish 
        ? (w.word || '') 
        : ((w.kana || '').replace(/[【】\[\]()]/g,''));
    this.speakText(text, btnEl, isEnglish ? 'en' : 'ja');
},

async speakText(text, btnEl = null, lang = 'ja') {
  try {
      if (typeof text !== 'string' || text.trim() === '') return;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (this._currentAudio) {
          this._currentAudio.pause();
          this._currentAudio = null;
      }
            
            let iconEl = null; let originalIcon = '';
            if (btnEl) {
                btnEl.classList.add('speaker-loading');
                iconEl = btnEl.classList.contains('material-symbols-rounded') ? btnEl : btnEl.querySelector('.material-symbols-rounded');
                if (iconEl) { originalIcon = iconEl.innerText; iconEl.innerText = 'spa'; }
            }

            const revertBtn = () => { if (btnEl) { btnEl.classList.remove('speaker-loading'); if (iconEl) iconEl.innerText = originalIcon || 'volume_up'; } };

            let isSentence = text.length > 12 || /[。？！，、]/.test(text);
            let engine = localStorage.getItem('ttsEngine') || 'azure';
            const ttsLang = lang === 'en' ? 'en-US' : (lang === 'zh' ? 'zh-CN' : 'ja-JP');


 if (engine === 'local' || (engine === 'youdao' && isSentence)) {
    this.fallbackLocalTTS(text, isSentence, revertBtn, ttsLang);
    return;
}

if (engine === 'youdao') {
    const langParam = lang === 'en' ? 'eng' : (lang === 'zh' ? 'zh' : 'jap');
    const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&le=${langParam}`;
    if (this._currentAudio) {
        this._currentAudio.pause();
        this._currentAudio.src = '';
        this._currentAudio.load();
        this._currentAudio = null;
    }
    const audio = new Audio(url);
    audio.playbackRate = 0.85;
    audio.oncanplaythrough = revertBtn; 
    audio.onerror = () => { this.fallbackLocalTTS(text, isSentence, revertBtn, ttsLang); };
    this._currentAudio = audio;
    audio.play().catch(() => { this.fallbackLocalTTS(text, isSentence, revertBtn, ttsLang); });
    return;
}
if (engine === 'azure') {
    const workerUrl = "https://ibka.moyu54433.workers.dev/v1/audio/speech";
    let voice = 'ja-JP-NanamiNeural';
    if (lang === 'en') voice = 'en-US-AriaNeural';
    if (lang === 'zh') voice = 'zh-CN-XiaoxiaoNeural';
    
    const response = await fetch(workerUrl, {        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "tts-1", input: text, voice: voice })
    });

    if (!response.ok) throw new Error("Azure API 请求失败");
    const blob = await response.blob();
    
    if (this._currentAudio) {
        this._currentAudio.pause();
        if (this._currentAudio.src) URL.revokeObjectURL(this._currentAudio.src);
        this._currentAudio = null;
    }

    const audio = new Audio(URL.createObjectURL(blob));
    audio.playbackRate = isSentence ? 0.75 : 0.85;
    audio.oncanplaythrough = revertBtn; 
    audio.onerror = () => { this.fallbackLocalTTS(text, isSentence, revertBtn, ttsLang); };
    this._currentAudio = audio;
    audio.play().catch(() => { this.fallbackLocalTTS(text, isSentence, revertBtn, ttsLang); });
}
        } catch(e) {
            console.warn("[TTS] 在线引擎失效，降级为本地发音", e);
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
  
      renderRoots(rootsStr, maskText = false, maskMean = false) {
      if (!rootsStr) return '';
      let maskFixed = "■■■"; 
      return rootsStr.split('-').map((part, index) => {
          let match = part.match(/(.+?)\((.+?)\)/);
          if (match) {
              let tReal = escapeHTML(match[1]);
              let mReal = escapeHTML(match[2]);
              let t = maskText ? maskFixed : tReal;
              let m = maskMean ? maskFixed : mReal;
              return `<div class="root-capsule capsule-${index % 3}"><span class="r-text blur-target" data-real="${tReal}">${t}</span><span class="r-mean blur-target" data-real="${mReal}">${m}</span></div>`;
          }
          let tReal = escapeHTML(part);
          let t = maskText ? maskFixed : tReal;
          return `<div class="root-capsule capsule-${index % 3}"><span class="r-text blur-target" data-real="${tReal}">${t}</span></div>`;
      }).join('<span class="root-plus">+</span>');
  },

  syncRootsDisplay() {
      let rootsEl = this.getEl('w-roots');
      if (!rootsEl || rootsEl.style.display === 'none') return;
      
      let wWord = this.getEl('w-word');
      let wMean = this.getEl('w-meaning');
      
      let wordVis = wWord && wWord.style.display !== 'none' && !wWord.innerText.includes('■');
      let meanVis = wMean && wMean.style.display !== 'none' && !wMean.innerText.includes('■');

      rootsEl.querySelectorAll('.r-text').forEach(n => {
          n.innerHTML = wordVis ? (n.dataset.real || '■■■') : '■■■';
      });
      rootsEl.querySelectorAll('.r-mean').forEach(n => {
          n.innerHTML = meanVis ? (n.dataset.real || '■■■') : '■■■';
      });
  },



  getCardVisuals(typeStr, lang) {
    if (!typeStr) return { bg: 'var(--surface-container)', wm: '', tagsHTML: '' };
    
    // English words: use simple PoS abbreviations as watermark
    if (lang === 'en') {
        let enWm = '';
        if (typeStr.includes('名词')) enWm = 'n.';
        else if (typeStr.includes('动词')) enWm = 'v.';
        else if (typeStr.includes('形容词') && !typeStr.includes('形容动词')) enWm = 'adj.';
        else if (typeStr.includes('副词')) enWm = 'adv.';
        else if (typeStr.includes('介词')) enWm = 'prep.';
        else if (typeStr.includes('连词') || typeStr.includes('连接')) enWm = 'conj.';
        else if (typeStr.includes('代词')) enWm = 'pron.';
        else enWm = typeStr.charAt(0);
        
        const getCat = (t) => {
            if (t.includes('形容动词') || t.includes('形动') || t.includes('形容词')) return { color: 'var(--bg-adj)' };
            if (t.includes('动词')) return { color: 'var(--bg-verb)' };
            if (t.includes('名词')) return { color: 'var(--bg-noun)' };
            if (t.includes('副词') || t.includes('接')) return { color: 'var(--bg-adv)' };
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
        if (bg === 'var(--surface-container)' && tagsHTML) bg = 'var(--bg-other)';
        return { bg, wm: enWm, tagsHTML };
    }
    
    // Japanese words: keep original grammar character watermark
    let wmSet = new Set();
    if (typeStr.includes('自他')) { wmSet.add('が'); wmSet.add('を'); }
    else {
        if (typeStr.includes('自')) wmSet.add('が');
        if (typeStr.includes('他')) wmSet.add('を');
    }
    if (typeStr.includes('形动') || typeStr.includes('形容动词')) wmSet.add('な');
    if (typeStr.includes('名')) wmSet.add('の');

    let wmArray = Array.from(wmSet).slice(0, 2);
    let wm = wmArray.length > 1 ? `<span class="wm-multi">${wmArray.join('・')}</span>` : wmArray.join('');

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

    let baseCount = Model.state.studyQueue.length;
    if (mode === 'memory-test') {
        baseCount = Model.state.mtBaseQueue.length;
    } else if (mode === 'rote-learning' || mode === 'pendulum' || mode === 'dual-track') {
        baseCount = Model.state.uniqueWordCount;
    }
    
    if (baseCount > 100 || mode === 'rote-learning' || mode === 'memory-test') {
        c.classList.add('matrix-legacy');
    } else {
        c.classList.remove('matrix-legacy');
    }

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
                  if (idx === 0) rankHTML = `<span class="material-symbols-rounded" style="color: #d4af37; font-size: 2.2rem; font-variation-settings: 'FILL' 0; filter: drop-shadow(0 4px 8px rgba(212,175,55,0.3));">trip_origin</span>`;
                  else if (idx === 1) rankHTML = `<span class="material-symbols-rounded" style="color: #C0C0C0; font-size: 1.8rem; font-variation-settings: 'FILL' 0; filter: drop-shadow(0 4px 8px rgba(192,192,192,0.3));">trip_origin</span>`;
                  else if (idx === 2) rankHTML = `<span class="material-symbols-rounded" style="color: #cd7f32; font-size: 1.8rem; font-variation-settings: 'FILL' 0; filter: drop-shadow(0 4px 8px rgba(205,127,50,0.3));">trip_origin</span>`;
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
          if ((Model.folderLangs[f] || 'ja') !== Model.state.currentLangMode) return;
          let catVal = f === '默认词库' ? 'default' : f;
          let tab = document.createElement('div');
          tab.className = `g-tab ${currentActive === catVal ? 'active' : ''}`;
          tab.dataset.cat = catVal;
          tab.innerText = f;
          tab.setAttribute('tabindex', '0');
          tab.setAttribute('role', 'button');
          tabsContainer.appendChild(tab);
      });
      
            let isEnTab = Model.state.currentLangMode === 'en';
      const virtuals = [
          { cat: 'virtual_cleared', text: '完全通关' },
          { cat: 'virtual_uncleared', text: '所有未通关' },
          { cat: 'virtual_miss_kanji', text: isEnTab ? '未掌握拼写' : '未了解汉字' },
          { cat: 'virtual_miss_kana', text: isEnTab ? '未掌握听力' : '未了解读音' },
          { cat: 'virtual_miss_meaning', text: '未了解释义' },
          { cat: 'virtual_starred', text: '收藏' }
      ];

      virtuals.forEach(v => {
          let tab = document.createElement('div');
          tab.className = `g-tab ${currentActive === v.cat ? 'active' : ''}`;
          tab.dataset.cat = v.cat;
          tab.innerText = v.text;

          tab.setAttribute('tabindex', '0');
          tab.setAttribute('role', 'button');
          tabsContainer.appendChild(tab);
      });

if (!tabsContainer.querySelector('.active')) {
          let firstTab = tabsContainer.querySelector('.g-tab');
          if(firstTab) firstTab.classList.add('active');
      }  },

  renderGroupBottomSheet(cat) {
      let container = this.getEl('group-list-container');
      if (!container) return;
      container.innerHTML = '';
      
      try {
          let catVal = cat || 'default';
          let words = Model.db.map((w, i) => ({w, i})).filter(item => {
              return Model.checkFilter(item.w, catVal);
          });

          if (words.length === 0) {
              let emptyText = "当前空空如也";
              let iconStr = "spa"; 
              let jpTitle = "【 空 無 】";
              
              if(catVal === 'virtual_starred') { emptyText = "暂无收藏，去发现心动词汇吧"; }
              if(catVal === 'virtual_cleared') { emptyText = "路漫漫其修远兮，继续攀登吧"; }
              if(catVal === 'virtual_uncleared' || catVal.includes('virtual_miss_')) { 
                  emptyText = "此维度盲区已彻底扫清！"; 
                  iconStr = "radio_button_unchecked"; 
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
              btn.setAttribute('tabindex', '0');
              btn.setAttribute('role', 'button');
              
              let groupVal = `group|${catVal}|${i}`;
              let clears = Model.mtGroupClears[groupVal] || 0;
              let badgeHTML = '';
              
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
    let searchInput = this.getEl('wb-search-input');
    if (searchInput) searchInput.placeholder = Model.state.currentLangMode === 'en' ? '搜索英文、音标或释义...' : '搜索汉字、假名或释义...';
    
    let modeSel = this.getEl('next-display-mode');
    if (modeSel) {
        modeSel.options[1].text = Model.state.currentLangMode === 'en' ? '英文' : '汉字';
        modeSel.options[2].text = Model.state.currentLangMode === 'en' ? '音标' : '假名';
    }

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
    selFilter.add(new Option(Model.state.currentLangMode === 'en' ? '专项图鉴: 拼写掌握(黄)' : '专项图鉴: 汉字了解(黄)', 'virtual_know_kanji'));
    selFilter.add(new Option(Model.state.currentLangMode === 'en' ? '专项图鉴: 听力掌握(红)' : '专项图鉴: 读音了解(红)', 'virtual_know_kana'));
    selFilter.add(new Option('专项图鉴: 释义了解(白)', 'virtual_know_meaning'));

    
    Model.folders.forEach(f => { 
      if ((Model.folderLangs[f] || 'ja') !== Model.state.currentLangMode) return;
      selFilter.add(new Option(f, f)); 
    });
    
    let lastFolder = localStorage.getItem('lastSelectedFolder') || currentVal;
    if(Array.from(selFilter.options).some(opt => opt.value === lastFolder)) {
        selFilter.value = lastFolder;
    } else {
        selFilter.value = 'all';
    }
    selFilter.dispatchEvent(new Event('facade-update'));

        // 以当前词书语种作为判断基准，而非筛选器值
    const selLang = Model.state.currentLangMode;
        document.querySelectorAll('.jp-only').forEach(el => {
        el.style.display = selLang === 'en' ? 'none' : '';
    });
    document.querySelectorAll('.en-only').forEach(el => {
        el.style.display = selLang === 'en' ? 'flex' : 'none';
        if(el.classList.contains('edit-input-group')) el.style.display = selLang === 'en' ? 'block' : 'none';
    });


    // 动态更新词库视图设置的按钮文本，赋予其英语模式下的新功能
    let blurWordBtn = document.querySelector('.vs-blur-btn[data-val="word"]');
    if (blurWordBtn) blurWordBtn.innerText = selLang === 'en' ? '仅显英文' : '仅显单词';

    let blurKanaBtn = document.querySelector('.vs-blur-btn[data-val="kana"]');
    if (blurKanaBtn) {
        blurKanaBtn.innerText = selLang === 'en' ? '仅显音标' : '仅显假名';
        blurKanaBtn.classList.remove('jp-only'); // 挣脱日语专属束缚，允许在英语模式下显示
    }


    this.updateGroupTabs();
  },

  renderDashboard() {
    // 英语模式下显示三杠（听力杠替代读音杠），标签文字动态切换
    const currentLang = Model.getCurrentLang();
    const kanaRow = this.getEl('prog-row-kana');
    if (kanaRow) kanaRow.style.display = 'flex';
    const kanaBarLabel = document.getElementById('kana-bar-label');
    if (kanaBarLabel) kanaBarLabel.innerText = currentLang === 'en' ? '听力' : '读音';

let dbTotalEl = this.getEl('db-total-count');
    if (dbTotalEl) dbTotalEl.innerText = Model.db.filter(w => (w.lang || 'ja') === Model.state.currentLangMode).length;    
    let stats = Model.calculateStats();
    this.getEl('total-days').innerText = stats.totalDays;
    this.getEl('streak-days').innerText = stats.streak;

    let clearedWordsCount = 0, kanjiCount = 0, kanaCount = 0, meaningCount = 0;
    
    // Build word → lang lookup for accurate counting
    const wordLangMap = {};
    Model.db.forEach(w => { wordLangMap[w.word] = w.lang || 'ja'; });
    
Object.entries(Model.mtWordClears).forEach(([wordKey, st]) => {
        if (typeof st === 'object') {
            const lang = wordLangMap[wordKey] || 'ja';
            if (lang !== Model.state.currentLangMode) return;
            // 兼容旧英语格式 {word, meaning} → 映射为三杠
            if (lang === 'en' && st.word !== undefined) {
                st = { kanji: st.word || false, kana: false, meaning: st.meaning || false };
            }
            // 统一三杠判断
            if (st.kanji && st.kana && st.meaning) clearedWordsCount++;
            if (st.kanji) kanjiCount++;
            if (st.kana) kanaCount++;
            if (st.meaning) meaningCount++;
        }
    });

    let totalWordsCount = Model.db.filter(w => (w.lang || 'ja') === Model.state.currentLangMode).length;
    let masteryPercent = totalWordsCount === 0 ? 0 : ((clearedWordsCount / totalWordsCount) * 100).toFixed(1);
    let pKanji = totalWordsCount === 0 ? 0 : ((kanjiCount / totalWordsCount) * 100).toFixed(1);
    let pKana = totalWordsCount === 0 ? 0 : ((kanaCount / totalWordsCount) * 100).toFixed(1);
    let pMeaning = totalWordsCount === 0 ? 0 : ((meaningCount / totalWordsCount) * 100).toFixed(1);

    if (this.getEl('mastery-count')) this.getEl('mastery-count').innerText = clearedWordsCount;
    if (this.getEl('mastery-total')) this.getEl('mastery-total').innerText = totalWordsCount;
    if (this.getEl('mastery-percent')) this.getEl('mastery-percent').innerText = `(${masteryPercent}%)`;
    
    setTimeout(() => {
        if (this.getEl('mastery-bar')) this.getEl('mastery-bar').style.width = `${masteryPercent}%`;
        
        if (this.getEl('prog-bar-kanji')) this.getEl('prog-bar-kanji').style.width = `${pKanji}%`;
        if (this.getEl('prog-bar-kana')) this.getEl('prog-bar-kana').style.width = `${pKana}%`;
        if (this.getEl('prog-bar-meaning')) this.getEl('prog-bar-meaning').style.width = `${pMeaning}%`;
        
        if (this.getEl('prog-txt-kanji')) this.getEl('prog-txt-kanji').innerHTML = `${kanjiCount} <span style="font-size:0.85em; opacity:0.6;">(${pKanji}%)</span>`;
        if (this.getEl('prog-txt-kana')) this.getEl('prog-txt-kana').innerHTML = `${kanaCount} <span style="font-size:0.85em; opacity:0.6;">(${pKana}%)</span>`;
        if (this.getEl('prog-txt-meaning')) this.getEl('prog-txt-meaning').innerHTML = `${meaningCount} <span style="font-size:0.85em; opacity:0.6;">(${pMeaning}%)</span>`;
    }, 50);

    let lastTxt = localStorage.getItem('lastCustomGroupTxt');
    if (!lastTxt) {
        let defFolder = Model.folders.find(f => (Model.folderLangs[f] || 'ja') === Model.state.currentLangMode) || '默认词库';
        lastTxt = `${defFolder} (第 1-10 词)`;
    }
    this.getEl('custom-group-text').innerText = lastTxt;

    this.updateTestSelects();

        let displaySel = this.getEl('test-display-select');
    if (displaySel) {
        let isEn = Model.state.currentLangMode === 'en';
        displaySel.options[0].text = isEn ? '专攻英文拼写 (点亮黄杠)' : '专攻汉字辨认 (点亮黄杠)';
        displaySel.options[1].text = isEn ? '专攻假名辨认' : '专攻假名辨认 (点亮红杠)';
        displaySel.options[2].text = isEn ? '专攻听力辨音 (点亮红杠)' : '专攻听力辨音 (点亮红杠)';
        
        // 英语模式下直接隐藏用不到的“专攻假名”选项
        displaySel.options[1].style.display = isEn ? 'none' : '';
    }

    let lastTestDisplay = localStorage.getItem('lastTestDisplay') || 'kana';
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
      let defFolder = Model.folders.find(f => (Model.folderLangs[f] || 'ja') === Model.state.currentLangMode) || '默认词库';
      let currentTest = testSel.value || localStorage.getItem('lastTestRange') || defFolder;

      testSel.innerHTML = '';
      
      let options = [];
      Model.folders.forEach(f => {
          if ((Model.folderLangs[f] || 'ja') === Model.state.currentLangMode) {
              options.push({ text: f, val: f });
          }
      });
      options.push(
          { text: '收藏词汇', val: 'virtual_starred' },
          { text: '完全通关词汇', val: 'virtual_cleared' },
                    { text: '所有未通关', val: 'virtual_uncleared' },
          { text: Model.state.currentLangMode === 'en' ? '专项攻坚: 未掌握拼写(黄)' : '专项攻坚: 未了解汉字(黄)', val: 'virtual_miss_kanji' },
          { text: Model.state.currentLangMode === 'en' ? '专项攻坚: 未掌握听力(红)' : '专项攻坚: 未了解读音(红)', val: 'virtual_miss_kana' },
          { text: '专项攻坚: 未了解释义(白)', val: 'virtual_miss_meaning' },
          { text: Model.state.currentLangMode === 'en' ? '复习巩固: 已掌握拼写(黄)' : '复习巩固: 已了解汉字(黄)', val: 'virtual_know_kanji' },
          { text: Model.state.currentLangMode === 'en' ? '复习巩固: 已掌握听力(红)' : '复习巩固: 已了解读音(红)', val: 'virtual_know_kana' },
          { text: '复习巩固: 已了解释义(白)', val: 'virtual_know_meaning' }

      );

      options.forEach(opt => { testSel.add(new Option(opt.text, opt.val)); });

if (Array.from(testSel.options).some(o => o.value === currentTest)) testSel.value = currentTest;
      else if (testSel.options.length > 0) testSel.value = testSel.options[0].value;
      testSel.dispatchEvent(new Event('facade-update'));  },

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
        Model.state.mtStep = 1; 
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
    let visuals = this.getCardVisuals(w.type, w.lang);
    card.querySelector('.watermark-layer').style.background = visuals.bg;
    this.getEl('flash-watermark').innerHTML = visuals.wm; 
    
    card.classList.remove('anim-slide-next','anim-slide-prev'); void card.offsetWidth;
    
    // 提取公共无障碍播报逻辑，自动过滤掉非纯文本的假名修饰符
    const triggerSRAnnouncement = () => {
        let announcer = document.getElementById('sr-announcer');
        if (announcer && w && w.word && w.word !== 'HINT_CARD') {
            const isEn = w.lang === 'en';
            if (isEn) {
                announcer.innerText = `Current word: ${w.word}. Meaning: ${w.meaning}.`;
            } else {
                let cleanKana = (w.kana || '').replace(/[【】\[\]()]/g, '');
                announcer.innerText = `当前单词：${w.word}。假名：${cleanKana}。`;
            }
        }
    };

    if (anim !== 'none') {
        Model.state.isAnimating = true;

        card.classList.remove('shimmering');
        void card.offsetWidth; 
        card.classList.add('shimmering');

        card.classList.add(anim === 'next' ? 'anim-slide-out-left' : 'anim-slide-out-right');
        setTimeout(() => {
            this.updateCardContent(w, visuals, mode, forceRoteFull, isMemTest, isRote, isFilterTest);
            
            // 🟢 在切卡动画中途、新 DOM 树内容装载完毕时，立刻执行无障碍播报
            triggerSRAnnouncement();

            card.classList.remove('anim-slide-out-left', 'anim-slide-out-right');
            card.classList.add(anim === 'next' ? 'anim-slide-in-right' : 'anim-slide-in-left');
            
            setTimeout(() => { 
                Model.state.isAnimating = false;
                card.classList.remove('shimmering');
            }, 600); 
        }, 300); 
    } else {
        this.updateCardContent(w, visuals, mode, forceRoteFull, isMemTest, isRote, isFilterTest);
        
        // 🟢 无动画直接渲染时，即时执行无障碍播报
        triggerSRAnnouncement();

        Model.state.isAnimating = false; 
    }
  },


    updateCardContent(w, visuals, mode, forceRoteFull, isMemTest, isRote, isFilterTest) {
    const isEnglish = w.lang === 'en';
    
    // 动态修改提示按钮的文案
    let hintBtn = this.getEl('btn-mt-show-hint');
    if (hintBtn) {
        hintBtn.innerText = isEnglish ? '听不清？点击朗读例句' : '听不清？显示假名';
    }

    this.getEl('mt-blind-audio-ui').classList.add('hidden');

    this.getEl('w-word').style.display = 'block';
        this.getEl('w-kana').style.display = isEnglish ? 'block' : 'block';
    this.getEl('w-meaning').style.display = 'block';
    this.getEl('w-type').style.display = 'flex';
    this.getEl('w-example-box').style.display = 'block';


    let mask = (str) => '■'.repeat(Array.from(str || '').length);
    let maskFixed = "■■■"; 

    if (isFilterTest) {
        let displayMode = this.getEl('test-display-select').value || 'kana'; 
        // 英语模式：kana 维度不存在，映射为 word；audio 维度保留为听力辨音
        if (isEnglish && displayMode === 'kana') {
            displayMode = 'word';
        }
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
        let showK = (!isEnglish && isVisible('kana')) || showKanaHint; 
        let showM = isVisible('meaning');
        let showA = isVisible('audio');

        // 引入动态字号计算引擎，防止筛选检验模式长单词排版崩溃
        let finalWord = showW ? w.word : maskFixed;
        let wWordEl = this.getEl('w-word');
        wWordEl.innerText = finalWord;
        
        let wLen = Array.from(finalWord || '').length;
        if (isEnglish) {
            if (wLen >= 14) wWordEl.style.fontSize = '1.8rem';
            else if (wLen >= 11) wWordEl.style.fontSize = '2.2rem';
            else if (wLen >= 8) wWordEl.style.fontSize = '2.8rem';
            else if (wLen >= 5) wWordEl.style.fontSize = '3.5rem';
            else wWordEl.style.fontSize = '4.2rem';
        } else {
            if (wLen >= 10) wWordEl.style.fontSize = '1.8rem';
            else if (wLen >= 7) wWordEl.style.fontSize = '2.2rem';
            else if (wLen >= 5) wWordEl.style.fontSize = '2.6rem';
            else wWordEl.style.fontSize = ''; 
        }

        if (!isEnglish) {

            this.getEl('w-kana').innerText = showK ? (w.kana || '').replace(/[【】\[\]()]/g,'') : maskFixed;
            this.getEl('w-kana').style.display = 'block';
        } else {
            // 恢复为纯文本（背词界面已有专门的全局发音按钮）
            this.getEl('w-kana').innerText = showK ? (w.phonetic || '') : maskFixed;
            this.getEl('w-kana').style.display = 'block';
        }


        this.getEl('w-meaning').innerText = showM ? w.meaning : maskFixed;
        this.getEl('w-type').innerHTML = visuals.tagsHTML;
        this.getEl('w-type').style.display = st === 'C' ? 'flex' : 'none'; 
        
        let rootsEl = this.getEl('w-roots');
        let showRootsPref = localStorage.getItem('showRoots') !== 'false';
        if (rootsEl) {
            if (isEnglish && w.roots && showRootsPref) {
                // 根据主单词和主释义的显示状态，决定是否对词根的对应部分打码(■■■)
                rootsEl.innerHTML = this.renderRoots(w.roots, !showW, !showM);
                rootsEl.style.display = 'flex';
            } else {
                rootsEl.style.display = 'none';
            }
        }

        ['word','kana','meaning','type'].forEach(k => {
             let el = this.getEl(`w-${k}`);
             if(!el) return;
             el.className = (k === 'word') ? 'word-main' : (k === 'type' ? 'type-row' : `${k}-row`);
        });
        if(rootsEl) rootsEl.className = 'roots-row';

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

        this.getEl('btn-speaker').style.display = (st === 'C' || (showA && displayMode !== 'audio')) ? 'block' : 'none';
        
        if ((st === 'A' && displayMode === 'audio') || (st === 'B' && hint === 'audio')) {

             Hardware.speakWord(w);
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
        
        this.syncRootsDisplay();
        return; 
    }

    let showWord = true, showKana = !isEnglish, showMeaning = true;

    let isDtSpell = (Model.state.mode === 'dual-track' && Model.state.dtSubMode === 'spell');
    let isDtChoice = (Model.state.mode === 'dual-track' && Model.state.dtSubMode === 'choice');

    // 🚀 针对英语模式的往复测验：拼写阶段隐藏英文单词（变马赛克），并确保释义可见
    if (isEnglish && isDtSpell) {
        showWord = false;
    }
    
    if (isRote && mode !== 'all' && !forceRoteFull) {
        if (mode === 'word') { showKana = Model.state.mtStep > 1; showMeaning = false; } 
        else if (mode === 'kana') { 
            if (isEnglish) { showMeaning = false; } 
            else { showWord = Model.state.mtStep > 1; showMeaning = false; }
        } 
        else if (mode === 'meaning') { showKana = Model.state.mtStep > 1; showWord = false; }
    }

        let finalWord = (!showWord && !isMemTest) ? mask(w.word) : w.word;
    let wWordEl = this.getEl('w-word');
    wWordEl.innerText = finalWord;
    
    let wLen = Array.from(finalWord || '').length;
    if (isEnglish) {
        // 英语专用的巨型动态字号阶梯
        if (wLen >= 14) wWordEl.style.fontSize = '1.8rem';      // 极长词 (administration)
        else if (wLen >= 11) wWordEl.style.fontSize = '2.2rem'; // 超长词 (accommodate)
        else if (wLen >= 8) wWordEl.style.fontSize = '2.8rem';  // 较长词 (absolute)
        else if (wLen >= 5) wWordEl.style.fontSize = '3.5rem';  // 常规词 (abandon)
        else wWordEl.style.fontSize = '4.2rem';                 // 极短词 (cat) - 巨大震撼
    } else {
        // 日语保持原样
        if (wLen >= 10) wWordEl.style.fontSize = '1.8rem';
        else if (wLen >= 7) wWordEl.style.fontSize = '2.2rem';
        else if (wLen >= 5) wWordEl.style.fontSize = '2.6rem';
        else wWordEl.style.fontSize = ''; 
    }
 

    if (!isEnglish) {
        this.getEl('w-kana').innerText = (!showKana && !isMemTest) ? mask((w.kana || '').replace(/[【】\[\]()]/g,'')) : (w.kana || '');
    } else {
        // 恢复为纯文本（背词界面已有专门的全局发音按钮）
        this.getEl('w-kana').style.display = 'block';
        this.getEl('w-kana').innerText = w.phonetic || '';
    }
    this.getEl('w-meaning').innerText = (!showMeaning && !isMemTest) ? mask(w.meaning) : w.meaning;
    this.getEl('w-type').innerHTML = visuals.tagsHTML; 
    
    let rootsEl = this.getEl('w-roots');
    if (rootsEl) {
        let showRootsPref = localStorage.getItem('showRoots') !== 'false';
        if (isEnglish && w.roots && showRootsPref) {
            let maskW = (!showWord && !isMemTest);
            let maskM = (!showMeaning && !isMemTest);
            rootsEl.innerHTML = this.renderRoots(w.roots, maskW, maskM);
            rootsEl.style.display = 'flex';
        } else {
            rootsEl.style.display = 'none';
        }
    }

    let isStarred = typeof w.word === 'string' && Model.stars.includes(w.word);
    let starBtn = this.getEl('star-btn');
    let starIcon = this.getEl('star-icon');
    if (starBtn && starIcon) {
        starIcon.style.fontVariationSettings = isStarred ? "'FILL' 1" : "'FILL' 0";
        if (isStarred) starBtn.classList.add('active');
        else starBtn.classList.remove('active');
        starBtn.style.display = 'block';
    }

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
                if(!el) return;
                el.className = (k === 'word') ? 'word-main blur-target' : (k === 'type' ? 'type-row blur-target' : `${k}-row blur-target`);
                if (mode !== 'all' && mode !== k && !(mode === 'meaning' && k === 'type')) {
                    el.classList.add('blur-text');
                    el.setAttribute('aria-hidden', 'true');
                } else {
                    el.removeAttribute('aria-hidden');
                }
            });
            
            let rEl = this.getEl('w-roots');
            if (rEl) {
                rEl.className = 'roots-row'; // 容器本身不模糊，针对内部精细模糊
                // 修复：补上变量声明，读取设置，防止 JS 崩溃
                let isShowRoots = localStorage.getItem('showRoots') !== 'false';
                if (isEnglish && w.roots && isShowRoots) {
                    let blurW = (mode !== 'all' && mode !== 'word');
                    let blurM = (mode !== 'all' && mode !== 'meaning');
                    rEl.querySelectorAll('.r-text').forEach(n => {
                        if (blurW) { n.classList.add('blur-text'); n.setAttribute('aria-hidden', 'true'); }
                    });
                    rEl.querySelectorAll('.r-mean').forEach(n => {
                        if (blurM) { n.classList.add('blur-text'); n.setAttribute('aria-hidden', 'true'); }
                    });
                }
            }

        let exBox = this.getEl('w-example-box'); exBox.className = 'dt-example-box blur-target';
        if (mode !== 'all' && mode !== 'meaning') {
            exBox.classList.add('blur-text');
            exBox.setAttribute('aria-hidden', 'true');
        } else {
            exBox.removeAttribute('aria-hidden');
        }
    } else if (isMemTest) {
        ['word','kana','type','meaning'].forEach(k => { let el = this.getEl(`w-${k}`); if(el) { el.className = (k === 'word') ? 'word-main' : (k === 'type' ? 'type-row' : `${k}-row`); el.removeAttribute('aria-hidden'); } });
        let rEl = this.getEl('w-roots'); if(rEl) rEl.className = 'roots-row';
        this.getEl('w-example-box').className = 'dt-example-box'; this.getEl('w-example-box').style.display = 'none'; this.getEl('w-example-box').removeAttribute('aria-hidden');
    } else if (forceRoteFull) {
        ['word','kana','type','meaning'].forEach(k => { let el = this.getEl(`w-${k}`); if(el) { el.className = (k === 'word') ? 'word-main' : (k === 'type' ? 'type-row' : `${k}-row`); el.removeAttribute('aria-hidden'); } });
        let rEl = this.getEl('w-roots'); if(rEl) rEl.className = 'roots-row';
        this.getEl('w-example-box').className = 'dt-example-box'; this.getEl('w-example-box').style.display = 'block'; this.getEl('w-example-box').removeAttribute('aria-hidden');
        } else {
        ['word','kana','type','meaning'].forEach(k => { let el = this.getEl(`w-${k}`); if(el) { el.className = (k === 'word') ? 'word-main' : (k === 'type' ? 'type-row' : `${k}-row`); el.removeAttribute('aria-hidden'); } });
        let rEl = this.getEl('w-roots'); if(rEl) rEl.className = 'roots-row';
        this.getEl('w-example-box').className = 'dt-example-box';
        // 🚀 修复：如果在往复测验的拼写阶段（isDtSpell），强制隐藏例句防作弊
        if ((isRote && mode !== 'all') || isDtSpell) this.getEl('w-example-box').style.display = 'none';
        this.getEl('w-example-box').removeAttribute('aria-hidden');
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
        Hardware.speakWord(w);
    } else {
        let autoSpeak = localStorage.getItem('autoSpeak') !== 'false';
        if (autoSpeak && !hideSpeaker) { Hardware.speakWord(w); }
    }

    this.syncRootsDisplay();
  },

    renderExampleBox(exString, boxId, mode = 'normal', targetWordObj = null) {
    let exBox = this.getEl(boxId);
    if (!exBox) return;
    
    if (!exString || typeof exString !== 'string') {
        exBox.style.display = 'none';
        exBox.innerHTML = '';
        return;
    }

    let useRuby = localStorage.getItem('useRubyRender') !== 'false';
    
    let processedStr = exString;
    // 🚀 终极修复：强制将英语例句的 || 替换为正确的翻译分隔符 /
    if (processedStr.includes('||') && !processedStr.includes('/')) {
        processedStr = processedStr.replace(/\|\|/g, '/');
    }

    if (mode === 'spell' && targetWordObj) {
        processedStr = processedStr.replace(/\\overset\{([^\}]+)\}\{([^\}]+)\}/g, (match, ruby, kanji) => {
            if (targetWordObj.word.includes(kanji) || targetWordObj.kana === ruby) return `\\overset{○}{${kanji}}`; return match;
        });
    }

    let htmlStr = processedStr.split('||').map(blk => {
        let parts = blk.split('/'); 
        let jpPart = parts[0] ? parts[0].trim() : "暂无例句"; 
        let cnPart = parts[1] ? parts[1].trim() : "";
        
        let pureJpText = jpPart.replace(/\$/g, '').replace(/\\overset\{[^\}]+\}\{([^\}]+)\}/g, '$1');
        let safeJpPart = escapeHTML(jpPart).replace(/\\＆/g, '\\&');
        
        if (useRuby) {
            safeJpPart = safeJpPart.replace(/\$\\overset\{([^\}]+)\}\{([^\}]+)\}\$/g, '<ruby>$2<rt>$1</rt></ruby>');
        }

        let safeCnPart = escapeHTML(cnPart);
        
                let sparkBtnHTML = `<span class="material-symbols-rounded ai-sparkle-btn" data-sentence="${escapeHTML(pureJpText)}" data-word="${targetWordObj ? escapeHTML(targetWordObj.word) : ''}" style="color:#6366f1; flex-shrink:0; cursor:pointer;" title="DeepSeek 例句解析">auto_awesome</span>`;
        let jpBoxHTML = `<div class="dt-ex-jp" data-speak="${escapeHTML(pureJpText)}" style="display:flex; align-items:flex-start; gap:6px;"><span class="material-symbols-rounded ex-speaker" style="flex-shrink:0;">volume_up</span><span style="flex:1;">${safeJpPart}</span>${sparkBtnHTML}</div>`;

        if (mode === 'choice' && cnPart) { 
            return `<div class="ex-item">${jpBoxHTML}<div class="dt-ex-cn hidden-translation" data-text="${safeCnPart}"><span class="material-symbols-rounded" style="font-size:1.1rem;">lock</span> 答对选项后解密</div></div>`; 
        }
        return `<div class="ex-item">${jpBoxHTML}<div class="dt-ex-cn revealed-translation">${safeCnPart}</div></div>`;

    }).join('');
    
    if (!htmlStr.replace(/<[^>]*>/g, '').trim()) { 
        exBox.style.display = 'none'; 
        exBox.innerHTML = ''; 
        return; 
    }

    exBox.innerHTML = htmlStr;
    let jpExEls = exBox.querySelectorAll('.dt-ex-jp');
    
    if (!useRuby && window.MathJax && window.MathJax.typesetPromise) { 
        window.mathJaxQueue = (window.mathJaxQueue || Promise.resolve())
            .then(() => MathJax.typesetPromise(Array.from(jpExEls)))
            .catch((err) => { console.warn('MathJax 排版被中断', err); });
    }
  },


  renderDualTrackUI(wObj) {
      if (Model.state.dtSubMode === 'spell') {
          this.getEl('dt-choice-area').classList.add('hidden'); this.getEl('dt-spell-area').classList.remove('hidden');
          RomajiEngine.reset(); EnglishInput.reset();
          let inputEl = this.getEl('dt-spell-input'); inputEl.innerHTML = ''; inputEl.classList.remove('error-state', 'shake-anim');
          View.renderQwertyKeyboard('dt-spell-keyboard', inputEl, wObj, null);
      }
 else if (Model.state.dtSubMode === 'choice') {
          this.getEl('dt-spell-area').classList.add('hidden'); this.getEl('dt-choice-area').classList.remove('hidden');
          let targetMeaning = wObj.meaning;
          let pool = Model.db.filter(x => x.folder === wObj.folder && x.type === wObj.type && x.word !== wObj.word && x.meaning !== targetMeaning);
          if (pool.length < 3) pool = Model.db.filter(x => x.word !== wObj.word && x.meaning !== targetMeaning); 
          pool = pool.sort(() => Math.random() - 0.5).slice(0, 3);
          let choices = [{text: targetMeaning, correct: true}];
          pool.forEach(x => choices.push({text: x.meaning, correct: false})); choices.sort(() => Math.random() - 0.5); 
          let cb = this.getEl('dt-choice-buttons'); cb.innerHTML = '';
          choices.forEach((c, idx) => { 
              let btn = document.createElement('div'); btn.className = 'dt-choice-btn'; 
              btn.setAttribute('tabindex', '0');
              btn.setAttribute('role', 'button');
              let label = String.fromCharCode(65 + idx); // 生成 A, B, C, D
              let labelSpan = document.createElement('span'); labelSpan.className = 'choice-label'; labelSpan.innerText = label + '.';
              let textSpan = document.createElement('span'); textSpan.innerText = c.text;
              btn.appendChild(labelSpan); btn.appendChild(textSpan);
              btn.onpointerdown = (e) => { e.preventDefault(); Controller.handleDtChoiceClick(btn, c.correct); }; 
              cb.appendChild(btn); 
          });
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
          const isEnglishMt = wObj.lang === 'en';
          
          if (round === 1) { 
              if(blindAudioUi) blindAudioUi.classList.remove('hidden');
              currentTestType = 'choice';
              isMeaning = true;
              targetText = wObj.meaning;
} else if (round === 2) {
              if (isEnglishMt) {
                  // 英语第二轮：听力拼写
                  if(blindAudioUi) blindAudioUi.classList.remove('hidden');
                  currentTestType = 'spell';
              } else {                  if (step === 1) { 
                      if(blindAudioUi) blindAudioUi.classList.remove('hidden');
                      currentTestType = 'choice';
                      isMeaning = false;
                      targetText = wObj.word;
                  } else if (step === 2) { 
                      this.getEl('w-word').style.display = 'block';
                      currentTestType = 'spell';
                  }
              }
          } else if (round === 3) {
              if (isEnglishMt) {
                  this.getEl('w-kana').style.display = 'block';
                  this.getEl('w-kana').innerText = wObj.phonetic || '';
                  currentTestType = 'choice';
                  isMeaning = true;
                  targetText = wObj.meaning;
              } else {
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
          RomajiEngine.reset(); EnglishInput.reset();
          let inputEl = this.getEl('mt-spell-input'); inputEl.innerHTML = ''; inputEl.classList.remove('error-state', 'shake-anim');
          View.renderQwertyKeyboard('mt-spell-keyboard', inputEl, wObj, displayMode);
      }
 else if (currentTestType.startsWith('choice')) {
          this.getEl('mt-choice-area').classList.remove('hidden');
          let pool = Model.db.filter(x => x.folder === wObj.folder && x.type === wObj.type && x.word !== wObj.word);
          if (pool.length < 3) pool = Model.db.filter(x => x.word !== wObj.word); 
          pool = pool.sort(() => Math.random() - 0.5).slice(0, 3);
          let choices = [{text: targetText, correct: true}];
          pool.forEach(x => choices.push({text: isMeaning ? x.meaning : x.word, correct: false})); choices.sort(() => Math.random() - 0.5); 
          
          let cb = this.getEl('mt-choice-buttons'); cb.innerHTML = '';
          choices.forEach((c, idx) => { 
              let btn = document.createElement('div'); btn.className = 'dt-choice-btn choice-flip-anim'; 
              btn.setAttribute('tabindex', '0');
              btn.setAttribute('role', 'button');
              let label = String.fromCharCode(65 + idx); 
              let labelSpan = document.createElement('span'); labelSpan.className = 'choice-label'; labelSpan.innerText = label + '.';
              let textSpan = document.createElement('span'); textSpan.innerText = c.text;
              btn.appendChild(labelSpan); btn.appendChild(textSpan);
              btn.onpointerdown = (e) => { e.preventDefault(); Controller.handleMtChoiceClick(btn, c.correct, wObj, displayMode); }; 
              cb.appendChild(btn); 
          });
      }
  },

    renderQwertyKeyboard(containerId, inputEl, wObj, displayMode) {
      let kb = this.getEl(containerId);
      kb.innerHTML = ''; 
      Model.state.spellFailCount = 0; 

      let hintWrap = document.createElement('div');
      hintWrap.id = containerId + '-hint-wrap';
      hintWrap.className = 'spell-hint-wrap';
      let hintBtn = document.createElement('div');
      hintBtn.className = 'spell-hint-btn';
      hintBtn.setAttribute('tabindex', '0');
      hintBtn.setAttribute('role', 'button');
      const isEnglishKb = wObj.lang === 'en';
      hintBtn.innerHTML = isEnglishKb 
          ? '<span class="material-symbols-rounded" style="font-size:1.1rem;">visibility</span> 查看单词提示'
          : '<span class="material-symbols-rounded" style="font-size:1.1rem;">visibility</span> 查看假名提示';
      hintBtn.onpointerdown = (e) => {
          e.preventDefault();
          Hardware.vibrate(10);
          if (isEnglishKb) {
              let wWord = View.getEl('w-word');
              if (wWord) {
                  wWord.innerText = wObj.word;
                  wWord.style.display = 'block';
                  wWord.classList.remove('blur-text');
                  wWord.removeAttribute('aria-hidden');
                  wWord.classList.add('hint-pop-anim');
              }
          } else {
              let wKana = View.getEl('w-kana');
              if (wKana) {
                  wKana.innerText = wObj.kana;
                  wKana.style.display = 'block';
                  wKana.classList.remove('blur-text');
                  wKana.removeAttribute('aria-hidden');
                  wKana.classList.add('hint-pop-anim');
              }
          }
          hintWrap.classList.remove('show'); 
      };
      hintWrap.appendChild(hintBtn);
      kb.appendChild(hintWrap);

      // 日语键盘 vs 英语键盘：英语键盘含完整 QWERTY 及常用标点
      const rows = isEnglishKb ? [
          ['Q','W','E','R','T','Y','U','I','O','P'],
          ['A','S','D','F','G','H','J','K','L'],
          ['Z','X','C','V','B','N','M','-',"'",'Backspace'],
          ['Enter']
      ] : [
          ['Q','W','E','R','T','Y','U','I','O','P'],
          ['A','S','D','F','G','H','J','K','L','-'],
          ['Kana','Z','X','C','V','B','N','M','Backspace'],
          ['Enter']
      ];

      rows.forEach(r => {
          let rowEl = document.createElement('div'); rowEl.className = 'qwerty-row';
          r.forEach(key => {
              let btn = document.createElement('div'); btn.className = 'qwerty-key';
              if (key === 'Kana') { btn.innerText = 'あ/ア'; btn.classList.add('qwerty-key-wide'); }
              else if (key === 'Backspace') { btn.innerHTML = '<span class="material-symbols-rounded">backspace</span>'; btn.classList.add('qwerty-key-wide'); }
              else if (key === 'Enter') { btn.innerText = '確認 (Enter)'; btn.className = 'qwerty-key qwerty-key-confirm'; }
              else btn.innerText = key;
              
              btn.setAttribute('tabindex', '0');
              btn.setAttribute('role', 'button');
              
              btn.onpointerdown = (e) => { 
                  e.preventDefault(); 
                  inputEl.classList.remove('error-state', 'shake-anim');
                  if (key === 'Kana') { RomajiEngine.toggleMode(); btn.innerText = RomajiEngine.mode === 'hiragana' ? 'あ/ア' : 'ア/あ'; return; }
                  if (key === 'Enter') { Controller.handleSpellConfirm(inputEl, wObj, displayMode); return; }
                                    if (isEnglishKb) {
                      // 补上缺失的实体按键震动反馈：退格键震动轻一点，普通按键震动强一点
                      Hardware.vibrate(key === 'Backspace' ? 10 : 15);
                      
                      if (key === 'Backspace') EnglishInput.input('Backspace');
                      else if (key === "'") EnglishInput.buffer += "'";
                      else EnglishInput.input(key);
                      inputEl.innerHTML = escapeHTML(EnglishInput.getDisplayText());
                  } else {

                      RomajiEngine.input(key);
                      inputEl.innerHTML = RomajiEngine.getDisplayText();
                  }
              };
              rowEl.appendChild(btn);
          });
          kb.appendChild(rowEl);
      });
  },

  resetWordbankRenderer() { 
      let searchInputEl = this.getEl('wb-search-input');
      let searchQuery = searchInputEl ? searchInputEl.value.trim().toLowerCase() : '';
      let currentFilter = this.getEl('wb-folder-filter').value;
      
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
        rowHeight = baseRowHeights[cols]; 
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
    
    Array.from(grid.children).forEach(child => {
        if (!child.classList.contains('wb-card')) {
            grid.removeChild(child);
        }
    });

    let existingCards = Array.from(grid.children);
    let neededCount = slice.length;


    slice.forEach((item, index) => {
      let w = item.w, idx = item.idx; 
      let contentHTML = '';
      let renderFingerprint = '';
      let bgStyle = '';
      let isHintCard = (idx === -999);

      if (isHintCard) {
          bgStyle = 'transparent';
          renderFingerprint = 'hint-card';
          contentHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; opacity:0.6; border: 2px dashed var(--outline); border-radius: inherit; width: 100%; position: absolute; inset: 0;">
                <span class="material-symbols-rounded" style="font-size:2rem; margin-bottom:8px; color:var(--tertiary);">touch_app</span>
                <div style="font-size:1rem; font-weight:800; margin-bottom:4px; color:var(--on-surface);">长按卡片</div>
                <div style="font-size:0.75rem; font-weight:700; color:var(--on-surface);">查看详细释义</div>
            </div>`;
      } else {
          let visuals = this.getCardVisuals(w.type, w.lang);
          const isEnglishWord = w.lang === 'en';
          bgStyle = visuals.bg;
          let blurW = (blurMode !== 'all' && blurMode !== 'word') ? 'blur-text' : ''; 
          let blurK = (blurMode !== 'all' && blurMode !== 'kana') ? 'blur-text' : ''; 
          let blurM = (blurMode !== 'all' && blurMode !== 'meaning') ? 'blur-text' : '';
          let isChecked = Model.state.selectedSet.has(idx);

          // 统一三杠体系：兼容旧英语 {word, meaning} 格式
          let st = Model.mtWordClears[w.word] || { kanji: false, kana: false, meaning: false };
          if (typeof st === 'number') st = { kanji: false, kana: false, meaning: false };
          if (isEnglishWord && st.word !== undefined) {
            st = { kanji: st.word || false, kana: false, meaning: st.meaning || false };
          }
          // 统一三杠缩略图
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

          let safeWord = escapeHTML(w.word); 
          let safeKana = isEnglishWord ? (w.phonetic || '') : escapeHTML(w.kana || ''); 
          let safeMean = escapeHTML(w.meaning);
          contentHTML = `
            ${hankoHTML}
            <div class="watermark-layer"><div class="watermark">${visuals.wm}</div></div>
            ${topRightHTML}
            ${cols !== '4' && !Model.state.batchMode ? `<div class="wb-c-speaker btn-wb-speak"><span class="material-symbols-rounded">volume_up</span></div>` : ''}
            <div class="wb-c-word ${blurW}"><span class="wb-blur-trigger">${safeWord}</span></div>
            ${isEnglishWord ? `<div class="wb-c-kana ${blurK}"><span class="wb-blur-trigger">${escapeHTML(w.phonetic || '')}</span></div>` : `<div class="wb-c-kana ${blurK}"><span class="wb-blur-trigger">${safeKana}</span></div>`}
            <div class="wb-c-mean ${blurM}"><span class="wb-blur-trigger">${safeMean}</span></div>
            <div class="wb-manage-overlay ${Model.state.manageMode ? 'active' : ''}">
                <button class="wb-btn-move btn-wb-move"><span class="material-symbols-rounded">move_item</span></button>
                <button class="wb-btn-edit btn-wb-edit"><span class="material-symbols-rounded">edit</span></button>
                <button class="wb-btn-del btn-wb-del"><span class="material-symbols-rounded">delete</span></button>
            </div>`;

          renderFingerprint = String(idx) + blurMode + Model.state.batchMode + isChecked + starFilled + st.kanji + st.kana + st.meaning;
      }

      if (index < existingCards.length) {
          let card = existingCards[index];
          if (card.dataset.fingerprint !== renderFingerprint) {
              card.style.background = bgStyle;
              card.style.boxShadow = isHintCard ? 'none' : '';
              card.style.border = isHintCard ? 'none' : '';
              card.dataset.idx = idx;
              card.dataset.fingerprint = renderFingerprint;
              card.innerHTML = contentHTML;
          }
      } else {
          let card = document.createElement('div');
          card.className = 'wb-card';
          card.setAttribute('tabindex', '0');
          card.setAttribute('role', 'button');
          card.style.background = bgStyle;
          card.style.boxShadow = isHintCard ? 'none' : '';
          card.style.border = isHintCard ? 'none' : '';
          card.dataset.idx = idx;
          card.dataset.fingerprint = renderFingerprint;
          card.style.opacity = '1';
          card.innerHTML = contentHTML;
          grid.appendChild(card);
      }
    });

    while (grid.children.length > neededCount) {
        grid.removeChild(grid.lastChild);
    }


    let sentinel = this.getEl('wb-scroll-sentinel');
    if (sentinel) sentinel.style.display = 'none';
  },

  simulateKeyPress(keyStr) {
      let keys = document.querySelectorAll('.qwerty-key');
      keys.forEach(k => {
          let text = k.innerText;
          let match = false;
          if (keyStr === 'Backspace' && k.querySelector('.material-symbols-rounded')) match = true;
          else if (keyStr === 'Enter' && text.includes('Enter')) match = true;
          else if (text === keyStr) match = true;
          
          if (match) {
              let isDark = document.body.getAttribute('data-theme') === 'dark';
              k.style.transition = 'none'; 
              k.style.transform = 'scale(0.92) translateY(2px)';
              k.style.background = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(139, 121, 103, 0.15)';
              k.style.boxShadow = '0 0 0 transparent';
              
              if(keyStr === 'Enter') {
                  k.style.background = isDark ? 'rgba(164, 199, 182, 0.25)' : 'rgba(74, 99, 85, 0.9)';
              }
              
              setTimeout(() => {
                  k.style.transition = 'all 0.1s'; 
                  k.style.transform = '';
                  k.style.background = '';
                  k.style.boxShadow = '';
              }, 120);
          }
      });
  }
};

const Controller = {
  async init() {
    BottomSheet.init(); 
    Nav.init(); 
    await Model.init(); 
    Model.state.currentLangMode = localStorage.getItem('langMode') || 'ja';
    document.body.setAttribute('data-lang', Model.state.currentLangMode);
    
    // 渲染书架
    document.querySelectorAll('.book-card').forEach(b => b.classList.remove('active'));
    let activeBook = document.querySelector(`.book-card[data-lang="${Model.state.currentLangMode}"]`);
    if (activeBook) activeBook.classList.add('active');

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
    
    let showRoots = localStorage.getItem('showRoots') !== 'false'; 
    let showRootsCheckEl = View.getEl('setting-show-roots');
    if(showRootsCheckEl) showRootsCheckEl.checked = showRoots;

    

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

    let showRootsCheck = View.getEl('setting-show-roots');
    if (showRootsCheck) {
        showRootsCheck.addEventListener('change', (e) => {
            Hardware.playSound('click'); Hardware.vibrate(15);
            localStorage.setItem('showRoots', e.target.checked);
            showToast(e.target.checked ? "已开启词根词缀展示" : "已关闭词根词缀展示");
            if (!document.getElementById('study-area').classList.contains('hidden')) { View.renderStudyCard('none'); }
        });
    }

    let useRuby = localStorage.getItem('useRubyRender');
    if (useRuby === null) useRuby = 'true'; 
    let rubyCheck = View.getEl('setting-ruby-render');
    if(rubyCheck) rubyCheck.checked = (useRuby === 'true');
    let savedTTS = localStorage.getItem('ttsEngine') || 'azure';
    let ttsSelect = View.getEl('setting-tts-engine');
    if(ttsSelect) {
        ttsSelect.value = savedTTS;
        ttsSelect.dispatchEvent(new Event('facade-update')); 
    }


let savedMode = localStorage.getItem('displayMode') || 'all'; View.getEl('next-display-mode').value = savedMode;

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

  closeDetailIfOpen() {
      if (document.getElementById('detail-overlay').classList.contains('active')) {
          Hardware.vibrate(10);
          window.toggleModal('detail-overlay', false);
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
    
    View.getEl('btn-exit-study').addEventListener('click', () => { Hardware.vibrate(20); Hardware.stopAllAudio(); this.saveSessionRecord(); View.showPage('tab-home'); View.renderDashboard(); });

    // 📚 词书切换核心事件
    document.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', () => {
            let targetLang = card.getAttribute('data-lang');
            if (targetLang !== Model.state.currentLangMode) {
                Hardware.playSound('click'); Hardware.vibrate(20);
                Model.state.currentLangMode = targetLang;
                localStorage.setItem('langMode', targetLang);
                document.body.setAttribute('data-lang', targetLang);
                
                document.querySelectorAll('.book-card').forEach(b => b.classList.remove('active'));
                card.classList.add('active');

                // 切换后强制清空跨语言选择，防止数据串线
                let selFilter = View.getEl('wb-folder-filter');
                if (selFilter) selFilter.value = 'all';
                localStorage.setItem('lastSelectedFolder', 'all');
                localStorage.removeItem('lastCustomGroupVal');
                localStorage.removeItem('lastCustomGroupTxt');
                Model.state.currentGroupKey = '';
                Model.state.currentGroupLabel = '';

                View.updateWordbankUI();
                View.resetWordbankRenderer();
                View.renderDashboard();
                showToast(`已切换至${targetLang === 'en' ? '英语' : '日语'}词书`);
            }
        });
    });

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
        setTimeout(() => {
            View.renderGroupBottomSheet(tab.dataset.cat);
        }, 10);
    });

    View.getEl('btn-start-pendulum').addEventListener('click', () => { Hardware.unlockSpeech(); this.startPendulum('pendulum'); });
    View.getEl('btn-start-dual-track').addEventListener('click', () => { Hardware.unlockSpeech(); this.startPendulum('dual-track'); });
    View.getEl('btn-start-rote-learning').addEventListener('click', () => { Hardware.unlockSpeech(); this.startPendulum('rote-learning'); });
    View.getEl('btn-start-memory-test').addEventListener('click', () => { Hardware.unlockSpeech(); this.startPendulum('memory-test'); });
    
    View.getEl('btn-start-filter-test').addEventListener('click', () => { Hardware.unlockSpeech(); this.startFilterTest(); });
    View.getEl('btn-test-range-trigger').addEventListener('click', () => { Hardware.vibrate(10); BottomSheet.open(View.getEl('test-range-select'), document.createElement('span')); });
    View.getEl('btn-test-display-trigger').addEventListener('click', () => { Hardware.vibrate(10); BottomSheet.open(View.getEl('test-display-select'), document.createElement('span')); });

    View.getEl('ft-forget').addEventListener('click', () => { Hardware.playSound('error'); Hardware.vibrate(30); this.processFilterTestResult(false); });
    View.getEl('ft-blur').addEventListener('click', () => { 
        Hardware.playSound('click'); Hardware.vibrate(20); 
        let currentDisplay = View.getEl('test-display-select').value || 'kana'; 
        
        let poolMap = {
            'word': ['kana', 'audio'],       
            'kana': ['word', 'meaning'],     
            'meaning': ['kana', 'audio'],    
            'audio': ['meaning']             
        };
        
        let pool = poolMap[currentDisplay] || ['word', 'kana', 'meaning', 'audio'].filter(x => x !== currentDisplay);
        Model.state.ftHint = pool[Math.floor(Math.random() * pool.length)]; 
        Model.state.ftState = 'B'; 
        View.renderStudyCard('none'); 
    });
    View.getEl('ft-know').addEventListener('click', () => { Hardware.playSound('click'); Hardware.vibrate(20); Model.state.ftState = 'C'; View.renderStudyCard('none'); });
    View.getEl('ft-correct').addEventListener('click', () => { Hardware.playSound('success'); Hardware.vibrate(40); this.processFilterTestResult(true); });
    View.getEl('ft-wrong').addEventListener('click', () => { Hardware.playSound('error'); Hardware.vibrate(30); this.processFilterTestResult(false); });

    View.getEl('btn-prev').addEventListener('click', () => { if(Model.state.isAnimating) return; Hardware.unlockSpeech(); if(Model.state.currentIndex > 0) { Model.state.currentIndex--; Hardware.playSound('click'); Hardware.vibrate(60); View.renderStudyCard('prev'); } });
    View.getEl('btn-next').addEventListener('click', () => { if(Model.state.isAnimating) return; Hardware.unlockSpeech(); if(Model.state.currentIndex < Model.state.studyQueue.length-1) { Model.state.currentIndex++; Hardware.playSound('click'); Hardware.vibrate(40); View.renderStudyCard('next'); } });
    View.getEl('btn-finish').addEventListener('click', () => this.finishPendulum());
    
    let displayTrigger = View.getEl('btn-display-mode-trigger');
    if (displayTrigger) { displayTrigger.addEventListener('click', () => { Hardware.playSound('click'); Hardware.vibrate(15); BottomSheet.open(View.getEl('next-display-mode'), document.createElement('span')); }); }

    let btnMtReplay = View.getEl('btn-mt-replay');
    if (btnMtReplay) { btnMtReplay.addEventListener('click', () => { Hardware.playSound('click'); Hardware.vibrate(15); Hardware.unlockSpeech(); let w = Model.db[Model.state.studyQueue[Model.state.currentIndex]]; if(w) Hardware.speakWord(w); }); }

    let btnMtShowHint = View.getEl('btn-mt-show-hint');
    if (btnMtShowHint) {
        btnMtShowHint.addEventListener('click', () => {
            Hardware.vibrate(10);
            let w = Model.db[Model.state.studyQueue[Model.state.currentIndex]];
            const isEnglish = w && w.lang === 'en';
            
            if (isEnglish) {
                // 英语模式：提取纯英文例句部分并朗读
                if (w.example) {
                    // 兼容 || 和 / 两种分隔符，精准切出前半段的英文
                    let exampleEnPart = w.example.split('||')[0].split('/')[0].trim();
                    Hardware.unlockSpeech();
                    Hardware.speakText(exampleEnPart, null, 'en');
                } else {
                    window.showToast('暂无例句');
                }
            } else {
                // 日语模式：保持原有的显示假名逻辑
                if (Model.state.mode === 'filter-test') {
                    Model.state.ftShowKanaHint = true;
                    View.renderStudyCard('none');
                } else {
                    let wKana = View.getEl('w-kana');
                    if(wKana) {
                        wKana.style.display = 'block';
                        wKana.classList.remove('blur-text');
                        wKana.removeAttribute('aria-hidden');
                    }
                }
            }
        });
    }

    let autoSpeakCheck = View.getEl('setting-auto-speak');
    if (autoSpeakCheck) { autoSpeakCheck.addEventListener('change', (e) => { Hardware.playSound('click'); Hardware.vibrate(15); localStorage.setItem('autoSpeak', e.target.checked); showToast(e.target.checked ? "已开启自动朗读" : "已关闭自动朗读"); }); }


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

    let rubyCheck = View.getEl('setting-ruby-render');
    if (rubyCheck) {
        rubyCheck.addEventListener('change', (e) => {
            Hardware.playSound('click'); Hardware.vibrate(15);
            localStorage.setItem('useRubyRender', e.target.checked);
            showToast(e.target.checked ? "已切换为原生 Ruby 排版" : "已切换为 MathJax 引擎");
            if (!document.getElementById('detail-overlay').classList.contains('hidden') && document.getElementById('detail-overlay').classList.contains('active')) {
                Controller.renderDetailCard('none', false);
            } else if (!document.getElementById('study-area').classList.contains('hidden')) {
                View.renderStudyCard('none');
            }
        });
    }
    // 初始化 DeepSeek API 密钥设置
    let aiKeyInput = View.getEl('setting-ai-key');
    if (aiKeyInput) {
        aiKeyInput.value = localStorage.getItem('deepseekApiKey') || '';
        aiKeyInput.addEventListener('change', (e) => {
            localStorage.setItem('deepseekApiKey', e.target.value.trim());
            showToast("DeepSeek API Key 已保存");
        });
    }

    let ttsSelectTrigger = View.getEl('setting-tts-engine');
if (ttsSelectTrigger) {
    ttsSelectTrigger.addEventListener('change', (e) => {
        Hardware.playSound('click'); Hardware.vibrate(15);
        localStorage.setItem('ttsEngine', e.target.value);
        let names = { 'local': '系统自带', 'youdao': '网易有道', 'azure': '微软语音' };
        showToast(`已切换至 ${names[e.target.value]} 发音`);
    });
}

let testVibrateBtn = View.getEl('btn-test-vibrate');
if (testVibrateBtn) {
    testVibrateBtn.addEventListener('click', () => {
        Hardware.playSound('click');
        const vibrated = Hardware.vibrate(300);
        if (navigator.vibrate) {
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
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                searchInput.blur();
            }
        });
    }

    let wbGridContainer = View.getEl('wb-grid-container');
    if (wbGridContainer) {
        wbGridContainer.addEventListener('pointerdown', () => {
            if (document.activeElement && document.activeElement.id === 'wb-search-input') {
                document.activeElement.blur();
            }
        }, { passive: true });
    }

    let btnExport = View.getEl('btn-export-backup');

    if (btnExport) btnExport.addEventListener('click', () => this.exportBackup());
    
    let btnImport = View.getEl('btn-import-backup');
    let fileImport = View.getEl('file-import-backup');
    if (btnImport && fileImport) {
        btnImport.addEventListener('click', () => { Hardware.vibrate(15); fileImport.click(); });
        fileImport.addEventListener('change', (e) => { if(e.target.files.length > 0) this.importBackup(e.target.files[0]); e.target.value = ''; });
    }


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
        lpBtn.addEventListener('pointerup', clearPunch); 
        lpBtn.addEventListener('pointercancel', clearPunch); 
        lpBtn.addEventListener('pointerleave', clearPunch); 
        lpBtn.addEventListener('contextmenu', (e) => { e.preventDefault(); }); 

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
    
    View.getEl('btn-speaker').addEventListener('click', (e) => { Hardware.vibrate(10); Hardware.unlockSpeech(); let w = Model.db[Model.state.studyQueue[Model.state.currentIndex]]; Hardware.speakWord(w, e.currentTarget); });
    View.getEl('star-btn').addEventListener('click', (e) => { 
        Hardware.playSound('click'); 
        let wordObj = Model.db[Model.state.studyQueue[Model.state.currentIndex]]; 
        let idx = Model.stars.indexOf(wordObj.word); 
        let btn = e.currentTarget;
        let icon = View.getEl('star-icon'); 
        
        if (idx > -1) { 
            Model.stars.splice(idx, 1); 
            btn.classList.remove('active');
            icon.style.fontVariationSettings = "'FILL' 0"; 
        } else { 
            Model.stars.push(wordObj.word); 
            btn.classList.add('active');
            icon.style.fontVariationSettings = "'FILL' 1"; 
            window.createStarParticles(btn); 
            Hardware.vibrate(20); 
        } 
        Model.saveStars(); 
    });

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
        // 拦截 AI 闪耀按钮点击
        let aiBtn = e.target.closest('.ai-sparkle-btn');
        if (aiBtn) {
            Hardware.vibrate(15);
            Controller.openAIModal(aiBtn.dataset.sentence, aiBtn.dataset.word);
            return; 
        }
        
        let target = e.target.closest('.blur-target, .wb-blur-trigger'); 

            if (target && target.classList.contains('blur-text') || (target && target.parentElement.classList.contains('blur-text'))) { 
                let el = target.classList.contains('blur-text') ? target : target.parentElement; 
                el.classList.remove('blur-text'); 
                el.removeAttribute('aria-hidden');
                
                // --- 词根词缀同步解锁逻辑 ---
                if (el.id === 'w-word') {
                    document.querySelectorAll('#w-roots .r-text').forEach(n => { n.classList.remove('blur-text'); n.removeAttribute('aria-hidden'); });
                } else if (el.id === 'w-meaning') {
                    document.querySelectorAll('#w-roots .r-mean').forEach(n => { n.classList.remove('blur-text'); n.removeAttribute('aria-hidden'); });
                } else if (el.classList.contains('r-text')) {
                    let wWord = document.getElementById('w-word');
                    if(wWord) { wWord.classList.remove('blur-text'); wWord.removeAttribute('aria-hidden'); }
                    document.querySelectorAll('#w-roots .r-text').forEach(n => { n.classList.remove('blur-text'); n.removeAttribute('aria-hidden'); });
                } else if (el.classList.contains('r-mean')) {
                    let wMean = document.getElementById('w-meaning');
                    if(wMean) { wMean.classList.remove('blur-text'); wMean.removeAttribute('aria-hidden'); }
                    document.querySelectorAll('#w-roots .r-mean').forEach(n => { n.classList.remove('blur-text'); n.removeAttribute('aria-hidden'); });
                }
                
                Hardware.playSound('click'); 
                Hardware.vibrate(15); 
            } 

        let exJp = e.target.closest('.dt-ex-jp'); 
        if (exJp) { 
            let textToSpeak = exJp.getAttribute('data-speak'); 
            if (textToSpeak) { 
                Hardware.unlockSpeech(); 
                let currentIdx = -1;
                if (document.getElementById('detail-overlay').classList.contains('active')) {
                    currentIdx = Model.state.detailArray[Model.state.activeDetailIdx];
                } else if (Model.state.studyQueue && Model.state.studyQueue.length > 0) {
                    currentIdx = Model.state.studyQueue[Model.state.currentIndex];
                }
                const wEx = currentIdx > -1 ? Model.db[currentIdx] : null;
                let lang = (wEx && wEx.lang === 'en') ? 'en' : 'ja';
                Hardware.speakText(textToSpeak, exJp.querySelector('.ex-speaker') || exJp, lang); 
                Hardware.vibrate(10); 
            } 
        }

        // 音标喇叭发音监听
        let phSpeaker = e.target.closest('.phonetic-speaker');
        if (phSpeaker) {
            Hardware.unlockSpeech();
            let currentIdx = -1;
            if (document.getElementById('detail-overlay').classList.contains('active')) {
                currentIdx = Model.state.detailArray[Model.state.activeDetailIdx];
            } else if (Model.state.studyQueue && Model.state.studyQueue.length > 0) {
                currentIdx = Model.state.studyQueue[Model.state.currentIndex];
            }
            const wObj = currentIdx > -1 ? Model.db[currentIdx] : null;
            if (wObj) {
                Hardware.speakWord(wObj, phSpeaker);
                Hardware.vibrate(15);
            }
        }
    });


    let pressTimer = null; let isPressing = false; let startX = 0; let startY = 0; let startScrollY = 0;
    const clearPressCard = (card) => { if(pressTimer) clearTimeout(pressTimer); pressTimer = null; isPressing = false; if(card) card.classList.remove('pressing'); };
    const onPointerDownCard = (e) => { if(e.pointerType === 'mouse' && e.button !== 0) return; let card = e.target.closest('.wb-card'); if (!card || e.target.closest('button, .wb-checkbox, .wb-manage-overlay, .wb-c-speaker, .btn-wb-star')) return; if (Model.state.batchMode || Model.state.manageMode || parseInt(card.dataset.idx) === -999) return; startX = e.clientX; startY = e.clientY; startScrollY = window.scrollY; isPressing = true; card.classList.add('pressing'); pressTimer = setTimeout(() => { if(isPressing && Math.abs(window.scrollY - startScrollY) < 10) { Hardware.vibrate(50); Hardware.playSound('click'); Controller.openDetailModal(parseInt(card.dataset.idx)); clearPressCard(card); } }, 500); };
    const onPointerMoveCard = (e) => { if(!isPressing) return; if(Math.abs(e.clientX - startX) > 25 || Math.abs(e.clientY - startY) > 25) { let card = e.target.closest('.wb-card'); clearPressCard(card); } };
    const onPointerUpCard = (e) => { let card = e.target.closest('.wb-card'); clearPressCard(card); };
    let grid = View.getEl('wb-grid'); grid.addEventListener('pointerdown', onPointerDownCard); grid.addEventListener('pointermove', onPointerMoveCard); grid.addEventListener('pointerup', onPointerUpCard); grid.addEventListener('pointercancel', onPointerUpCard);
    grid.addEventListener('contextmenu', (e) => { if(e.target.closest('.wb-card') && !e.target.closest('.btn-wb-star')) e.preventDefault(); });
    grid.addEventListener('click', (e) => {
      let card = e.target.closest('.wb-card'); if (!card) return; let idx = parseInt(card.dataset.idx); if (idx === -999) return;
      if (e.target.closest('.btn-wb-star')) { Hardware.playSound('click'); Hardware.vibrate(10); let wWord = Model.db[idx].word; let sIdx = Model.stars.indexOf(wWord); let starBtn = e.target.closest('.btn-wb-star'); let icon = starBtn.querySelector('.material-symbols-rounded'); if (sIdx > -1) { Model.stars.splice(sIdx, 1); starBtn.classList.remove('active'); icon.style.fontVariationSettings = "'FILL' 0"; } else { Model.stars.push(wWord); starBtn.classList.add('active'); icon.style.fontVariationSettings = "'FILL' 1"; window.createStarParticles(starBtn); } Model.saveStars(); return; }
      if (e.target.closest('.btn-wb-speak') || e.target.closest('.wb-c-speaker')) { Hardware.unlockSpeech(); Hardware.speakWord(Model.db[idx], e.target.closest('.btn-wb-speak') || e.target.closest('.wb-c-speaker')); Hardware.vibrate(10); return; }
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
    View.getEl('btn-cancel-move').addEventListener('click', () => { Hardware.vibrate(10); window.toggleModal('move-overlay', false); });
    View.getEl('btn-import').addEventListener('click', () => this.importWords());
    View.getEl('btn-view-settings').addEventListener('click', () => { Hardware.vibrate(15); window.toggleModal('view-settings-overlay', true); document.querySelectorAll('.vs-col-btn').forEach(b => { b.onclick = () => { Hardware.vibrate(10); document.querySelectorAll('.vs-col-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); View.getEl('wb-col-select').value = b.dataset.val; View.resetWordbankRenderer(); }}); document.querySelectorAll('.vs-blur-btn').forEach(b => { b.onclick = () => { Hardware.vibrate(10); document.querySelectorAll('.vs-blur-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); View.getEl('wb-blur-select').value = b.dataset.val; View.resetWordbankRenderer(); }}); });
    View.getEl('btn-reset').addEventListener('click', () => { Hardware.vibrate(20); showConfirm('恢复初始', '警告：将清空所有导入数据，恢复初始！', async () => { Model.folders = ["默认词库"]; Model.folderLangs = { "默认词库": "ja" }; Model.db = DefaultWords.map(w => ({...w, folder: "默认词库"})); if (typeof DefaultEnglishWords !== 'undefined') { Model.db = Model.db.concat(DefaultEnglishWords.map(w => ({...w}))); Model.folders.push("四级词汇"); Model.folderLangs["四级词汇"] = "en"; } await Model.saveDB(); await Model.saveFolders(); await Model.saveFolderLangs(); View.updateWordbankUI(); View.resetWordbankRenderer(); Hardware.vibrate(100); }); });
    View.getEl('detail-close').addEventListener('click', () => { Hardware.vibrate(15); window.toggleModal('detail-overlay', false); if (document.getElementById('tab-wordbank').classList.contains('active')) { Model.state.renderedStartIndex = -1; View.renderVirtualGrid(); } }); 
    View.getEl('detail-prev').addEventListener('click', () => this.navDetail(-1)); View.getEl('detail-next').addEventListener('click', () => this.navDetail(1));
    View.getEl('btn-save-edit').addEventListener('click', () => { Hardware.vibrate(20); if(Model.editingIdx > -1) { let w = Model.db[Model.editingIdx]; w.word = View.getEl('edit-word').value.trim(); const isEnSave = w.lang === 'en'; if (isEnSave) { w.phonetic = View.getEl('edit-kana').value.trim(); } else { w.kana = View.getEl('edit-kana').value.trim(); } w.type = View.getEl('edit-type').value.trim(); w.meaning = View.getEl('edit-meaning').value.trim(); let rootsInput = View.getEl('edit-roots'); if(rootsInput) w.roots = rootsInput.value.trim(); Model.saveDB(); View.resetWordbankRenderer(); window.toggleModal('edit-overlay', false); showToast("修改已保存"); } });
    View.getEl('btn-cancel-edit').addEventListener('click', () => { Hardware.vibrate(10); window.toggleModal('edit-overlay', false); });

        // 🟢 WCAG 伪按钮 (role="button") 空格触发机制 (规范：Space 释放时触发)
    document.addEventListener('keyup', (e) => {
        let el = document.activeElement;
        if (el && el.getAttribute('role') === 'button' && e.key === ' ') {
            e.preventDefault();
            el.click(); // 兼容绑了 onclick 的元素（如底部菜单）
            el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse', button: 0 })); // 兼容绑了 onpointerdown 的元素（如键盘、选择题）
        }
    });

    // 🚀 实体键盘盲操接管中枢 (Physical Keyboard Integration)
    document.addEventListener('keydown', (e) => {

        
        // 🟢 WCAG 焦点陷阱 (Focus Trap) - 必须置于最顶层防线之前
        if (e.key === 'Tab') {
            let activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                // 筛选出弹窗内所有物理可见的、可聚焦的元素
                let focusable = Array.from(activeModal.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
                                     .filter(node => node.offsetParent !== null);

                if (focusable.length > 0) {
                    let firstEl = focusable[0];
                    let lastEl = focusable[focusable.length - 1];

                    if (e.shiftKey) { // Shift + Tab：反向切换
                        if (document.activeElement === firstEl || !activeModal.contains(document.activeElement)) {
                            e.preventDefault();
                            lastEl.focus();
                        }
                    } else { // Tab：正向切换
                        if (document.activeElement === lastEl || !activeModal.contains(document.activeElement)) {
                            e.preventDefault();
                            firstEl.focus();
                        }
                    }
                } else {
                    // 如果弹窗内没有任何可交互元素，彻底锁死 Tab 键
                    e.preventDefault(); 
                }
                return; // 阻断后续所有针对主界面的快捷键逻辑
            }
        }

        // 🔒 第一层防线：如果用户正在输入框里打字，静默所有快捷键 (放行 Escape)
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            if (e.key !== 'Escape') return; 
        }
        
        // 🟢 WCAG 伪按钮 (role="button") 回车触发与空格拦截机制
        let activeEl = document.activeElement;
        if (activeEl && activeEl.getAttribute('role') === 'button' && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault(); // 关键：阻止空格键引起页面默认向下滚动
            
            // 规范：Enter 键在按下时立即触发
            if (e.key === 'Enter') {
                activeEl.click(); 
                activeEl.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse', button: 0 }));
            }
            return; // 拦截事件，防止触发下方的全局空格发音等快捷键
        }
        
        let key = e.key;
        let keyLower = key.toLowerCase();

        // 🟢 全局通用快捷键：Esc 退出与关闭
        if (key === 'Escape') {
            if (View.getEl('bs-overlay').classList.contains('active')) { window.toggleModal('bs-overlay', false); return; }
            if (View.getEl('view-settings-overlay').classList.contains('active')) { window.toggleModal('view-settings-overlay', false); return; }
            if (View.getEl('group-select-overlay').classList.contains('active')) { window.toggleModal('group-select-overlay', false); return; }
            if (View.getEl('dialog-overlay').classList.contains('active')) { window.toggleModal('dialog-overlay', false); return; }
            if (View.getEl('move-overlay').classList.contains('active')) { window.toggleModal('move-overlay', false); return; }
            if (View.getEl('detail-overlay').classList.contains('active')) { Controller.closeDetailIfOpen(); return; }
            if (!View.getEl('study-area').classList.contains('hidden')) { View.getEl('btn-exit-study').click(); return; }
        }

        // 🟡 底部下拉菜单（Bottom Sheet）的键盘接管
        let bsOverlay = View.getEl('bs-overlay');
        let groupOverlay = View.getEl('group-select-overlay');
        let moveOverlay = View.getEl('move-overlay');
        let activeOverlay = bsOverlay.classList.contains('active') ? bsOverlay : 
                            (groupOverlay.classList.contains('active') ? groupOverlay : 
                            (moveOverlay.classList.contains('active') ? moveOverlay : null));

        if (activeOverlay) {
            let options = Array.from(activeOverlay.querySelectorAll('.bs-option'));
            if (options.length === 0) return;
            let currentIdx = options.findIndex(o => o.classList.contains('selected'));
            
            // 上下键切换高亮项
            if (key === 'ArrowDown' || key === 'ArrowUp') {
                e.preventDefault();
                if (currentIdx === -1) currentIdx = 0;
                else {
                    options[currentIdx].classList.remove('selected');
                    if (key === 'ArrowDown') currentIdx = (currentIdx + 1) % options.length;
                    else currentIdx = (currentIdx - 1 + options.length) % options.length;
                }
                options[currentIdx].classList.add('selected');
                // 确保高亮项自动滚动到可视区域内
                options[currentIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                return;
            }
            // 空格或回车确认选中
            if (key === 'Enter' || key === ' ') {
                e.preventDefault();
                if (currentIdx !== -1) options[currentIdx].click();
                return;
            }
            return; // 在菜单里时，屏蔽其他字母键引发的乱跳转
        }

                // ⚪ 词库详情卡片翻页接管
        let detailOverlay = View.getEl('detail-overlay');
        if (detailOverlay && detailOverlay.classList.contains('active')) {
            if (key === 'ArrowLeft') { e.preventDefault(); View.getEl('detail-prev').click(); return; }
            if (key === 'ArrowRight') { e.preventDefault(); View.getEl('detail-next').click(); return; }
            // 顺手加个空格发音，体验更好
            if (key === ' ') { 
                e.preventDefault(); 
                let realIdx = Model.state.detailArray[Model.state.activeDetailIdx]; 
                let w = Model.db[realIdx]; 
                if (w) { Hardware.unlockSpeech(); Hardware.speakWord(w); Hardware.vibrate(10); } 
                return; 
            }
        }

        // 🔵 底部导航栏(Tab)的全局左右切换
        // 触发条件：没有任何弹窗处于打开状态，且不在学习区内
        let isAnyModalOpen = document.querySelectorAll('.modal-overlay.active').length > 0;
        if (!isAnyModalOpen && View.getEl('study-area').classList.contains('hidden')) {
            if (key === 'ArrowLeft' || key === 'ArrowRight') {
                e.preventDefault();
                let navItems = Array.from(document.querySelectorAll('.nav-item'));
                let currentIdx = navItems.findIndex(item => item.classList.contains('active'));
                if (currentIdx !== -1) {
                    let nextIdx = key === 'ArrowRight' ? (currentIdx + 1) % navItems.length : (currentIdx - 1 + navItems.length) % navItems.length;
                    navItems[nextIdx].click();
                }
                return;
            }
        }

        // 🔵 首页（道場）特定快捷键
        if (!View.getEl('tab-home').classList.contains('hidden') && View.getEl('study-area').classList.contains('hidden') && !isAnyModalOpen) {
            if (keyLower === 'a') { e.preventDefault(); View.getEl('btn-start-pendulum').click(); return; }
            if (keyLower === 'b') { e.preventDefault(); View.getEl('btn-start-dual-track').click(); return; }
            if (keyLower === 'c') { e.preventDefault(); View.getEl('btn-start-rote-learning').click(); return; }
            if (keyLower === 'd') { e.preventDefault(); View.getEl('btn-start-memory-test').click(); return; }
            if (keyLower === 'e') { e.preventDefault(); View.getEl('btn-start-filter-test').click(); return; }
            if (keyLower === 'f') { e.preventDefault(); View.getEl('btn-test-range-trigger').click(); return; }
            if (keyLower === 'g') { e.preventDefault(); View.getEl('btn-test-display-trigger').click(); return; }
            if (keyLower === 't' || (e.ctrlKey && keyLower === 't')) { e.preventDefault(); View.toggleTheme(); return; }
            
            // 长按空格打卡 (通过捕获 keydown 并忽略系统的按键连击)
            if (key === ' ') {
                e.preventDefault();
                let lpBtn = View.getEl('btn-long-press');
                if (lpBtn && !e.repeat) { 
                    lpBtn.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', button: 0 }));
                }
                return;
            }
        }


        // 🟣 学习/复习/测试区域快捷键
        if (!View.getEl('study-area').classList.contains('hidden')) {
            let mode = Model.state.mode;
            let dtSpellArea = View.getEl('dt-spell-area');
            let mtSpellArea = View.getEl('mt-spell-area');
            let dtChoiceArea = View.getEl('dt-choice-area');
            let mtChoiceArea = View.getEl('mt-choice-area');
            
            // 🔒 模式状态识别
            let isSpelling = (!dtSpellArea.classList.contains('hidden')) || (!mtSpellArea.classList.contains('hidden'));
            let isChoice = (!dtChoiceArea.classList.contains('hidden')) || (!mtChoiceArea.classList.contains('hidden'));

            let wObj = Model.db[Model.state.studyQueue[Model.state.currentIndex]];
            let displayMode = View.getEl('next-display-mode').value;

            // 1. 拼写输入隔离 (如果是打字阶段，把字母全部交给罗马音引擎)
            if (isSpelling) {
                let activeInputEl = !dtSpellArea.classList.contains('hidden') ? View.getEl('dt-spell-input') : View.getEl('mt-spell-input');
                if (/^[a-zA-Z]$/.test(key) || key === '-' || key === 'Backspace' || key === 'Enter') {
                    e.preventDefault(); 
                    activeInputEl.classList.remove('error-state', 'shake-anim');
                    
                    if (key === 'Enter') {
                        Controller.handleSpellConfirm(activeInputEl, wObj, displayMode);
                        View.simulateKeyPress('Enter');
                    } else if (key === 'Backspace') {
                        RomajiEngine.input('Backspace');
                        activeInputEl.innerHTML = RomajiEngine.getDisplayText();
                        View.simulateKeyPress('Backspace');
                    } else {
                        RomajiEngine.input(key);
                        activeInputEl.innerHTML = RomajiEngine.getDisplayText();
                        View.simulateKeyPress(key.toUpperCase());
                    }
                    return;
                }
            }

            // 2. 选择题快捷键 (A, B, C, D) 以及兼容数字 1, 2, 3, 4
            if (isChoice && ['a', 'b', 'c', 'd', '1', '2', '3', '4'].includes(keyLower)) {
                e.preventDefault();
                let choiceContainer = !dtChoiceArea.classList.contains('hidden') ? View.getEl('dt-choice-buttons') : View.getEl('mt-choice-buttons');
                if (choiceContainer) {
                    let buttons = choiceContainer.querySelectorAll('.dt-choice-btn');
                    let idx = -1;
                    if (['a', 'b', 'c', 'd'].includes(keyLower)) idx = ['a', 'b', 'c', 'd'].indexOf(keyLower);
                    else idx = parseInt(keyLower) - 1;

                    if (buttons[idx]) buttons[idx].dispatchEvent(new PointerEvent('pointerdown'));
                }
                return;
            }

            // 3. H键：显示假名提示 (防误触：打字阶段 H 属于发音，不可触发此功能)
            if (keyLower === 'h' && !isSpelling) {
                let btnMtShowHint = View.getEl('btn-mt-show-hint');
                if (btnMtShowHint && !View.getEl('mt-blind-audio-ui').classList.contains('hidden')) {
                    e.preventDefault(); btnMtShowHint.click(); return;
                }
                let hintWrap = document.querySelector('.spell-hint-wrap.show .spell-hint-btn');
                if (hintWrap) { e.preventDefault(); hintWrap.click(); return; }
            }

            // 4. 方向键及回车：主导流程前进后退 / 判定判断
            if (key === 'ArrowRight' || key === 'Enter') {
                let btnNext = View.getEl('btn-next');
                let btnFinish = View.getEl('btn-finish');
                let ftKnow = View.getEl('ft-know');
                let ftCorrect = View.getEl('ft-correct');
                
                if (!View.getEl('capsule-filter-test').classList.contains('hidden') && ftKnow) {
                    e.preventDefault(); ftKnow.click(); return;
                }
                if (!View.getEl('capsule-filter-judge').classList.contains('hidden') && ftCorrect) {
                    e.preventDefault(); ftCorrect.click(); return;
                }

                if (btnNext && window.getComputedStyle(btnNext).display !== 'none' && !btnNext.disabled) {
                    e.preventDefault(); btnNext.click();
                } else if (btnFinish && window.getComputedStyle(btnFinish).display !== 'none') {
                    e.preventDefault(); btnFinish.click();
                }
            } else if (key === 'ArrowLeft') {
                let btnPrev = View.getEl('btn-prev');
                let ftForget = View.getEl('ft-forget');
                let ftWrong = View.getEl('ft-wrong');
                
                if (!View.getEl('capsule-filter-test').classList.contains('hidden') && ftForget) {
                    e.preventDefault(); ftForget.click(); return;
                }
                if (!View.getEl('capsule-filter-judge').classList.contains('hidden') && ftWrong) {
                    e.preventDefault(); ftWrong.click(); return;
                }

                if (btnPrev && window.getComputedStyle(btnPrev).display !== 'none' && !btnPrev.disabled) {
                    e.preventDefault(); btnPrev.click();
                }
            } else if (key === 'ArrowDown') {
                let ftBlur = View.getEl('ft-blur');
                if (!View.getEl('capsule-filter-test').classList.contains('hidden') && ftBlur && window.getComputedStyle(ftBlur).display !== 'none') {
                    e.preventDefault(); ftBlur.click(); return;
                }
            } 
            // 5. 空格键：万能揭晓/发音
            else if (key === ' ') {
                e.preventDefault();
                let blurTarget = document.querySelector('.blur-text');
                if (blurTarget) {
                    blurTarget.click();
                } else {
                    let btnSpeaker = View.getEl('btn-speaker');
                    let btnMtReplay = View.getEl('btn-mt-replay');
                    if (!View.getEl('mt-blind-audio-ui').classList.contains('hidden') && btnMtReplay) {
                        btnMtReplay.click();
                    } else if (btnSpeaker && window.getComputedStyle(btnSpeaker).display !== 'none') {
                        btnSpeaker.click();
                    }
                }
            }
        }
    });

    // 🚀 松开空格键：停止打卡蓄力
    document.addEventListener('keyup', (e) => {
        if (e.key === ' ') {
            if (!View.getEl('tab-home').classList.contains('hidden') && View.getEl('study-area').classList.contains('hidden')) {
                let lpBtn = View.getEl('btn-long-press');
                if (lpBtn) {
                    lpBtn.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'mouse', button: 0 }));
                }
            }
        }
    });

    // 🚀 智能呼出/隐藏键盘提示条 (感知键盘操作)
    let keyboardHintBar = View.getEl('keyboard-hint-bar');
    if (keyboardHintBar) {
        document.addEventListener('keydown', (e) => {
            // 只要检测到键盘敲击，且在复习界面内，就弹出提示条
            if (!View.getEl('study-area').classList.contains('hidden') && !['Meta', 'Alt', 'Control', 'Shift'].includes(e.key)) {
                keyboardHintBar.classList.remove('hidden');
            }
        });
        document.addEventListener('pointerdown', (e) => {
            // 如果用户使用手指触摸或鼠标点击，说明脱离了纯键盘盲操，自动隐藏提示条
            if (e.pointerType === 'mouse' || e.pointerType === 'touch') {
                keyboardHintBar.classList.add('hidden');
            }
        });
    }
  },

  exportBackup() {
      Hardware.playSound('success'); Hardware.vibrate(50);
      let data = { db: Model.db, folders: Model.folders, folderLangs: Model.folderLangs, stars: Model.stars, records: Model.records, mtGroupClears: Model.mtGroupClears, mtWordClears: Model.mtWordClears, version: "v4", exportDate: new Date().toISOString() };
      let fileName = `钟日备份_${new Date().toLocaleDateString('zh-CN').replace(/\//g,'-')}.json`;
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
                  Model.db = data.db; Model.folders = data.folders; 
                  Model.folderLangs = data.folderLangs || {}; 
                  // Migrate: ensure all folders have lang
                  for (let f of Model.folders) {
                    if (!Model.folderLangs[f]) Model.folderLangs[f] = "ja";
                  }
                  // Migrate: ensure all words have lang
                  for (let w of Model.db) {
                    if (!w.lang) w.lang = "ja";
                  }
                  Model.stars = data.stars || []; Model.records = data.records || []; Model.mtGroupClears = data.mtGroupClears || {}; Model.mtWordClears = data.mtWordClears || {};
                  Promise.all([Model.saveDB(), Model.saveFolders(), Model.saveFolderLangs(), Model.saveStars(), Model.saveRecords(), Model.saveClears()]).then(() => { Hardware.playSound('success'); Hardware.vibrate(100); showToast("数据恢复成功！"); setTimeout(() => location.reload(), 1000); });
              } else { Hardware.playSound('error'); Hardware.vibrate(50); showToast("备份文件格式不正确"); }
          } catch(err) { Hardware.playSound('error'); Hardware.vibrate(50); showToast("解析文件失败"); }
      };
      reader.readAsText(file);
  },

    startPendulum(launchMode = 'pendulum') {
    let defFolder = Model.folders.find(f => (Model.folderLangs[f] || 'ja') === Model.state.currentLangMode) || '默认词库';
    let defCat = defFolder === '默认词库' ? 'default' : defFolder;
    
    let groupKey = Model.state.currentGroupKey || localStorage.getItem('lastCustomGroupVal') || `group|${defCat}|0`;
    Model.state.currentGroupKey = groupKey;
    if (!Model.state.currentGroupLabel) { Model.state.currentGroupLabel = localStorage.getItem('lastCustomGroupTxt') || `${defFolder} (第 1-10 词)`; }
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
          let inRange = (cat === 'all') ? true : Model.checkFilter(item.w, cat);
          if (!inRange) return false;

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
              let isTested = !!Model.mtWordClears[Model.db[idx].word];
              if (!isTested) front.push(idx);
              else back.push(idx);
          });
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
      const isEnglish = w.lang === 'en';
      
      if (!Model.mtWordClears[wordKey] || typeof Model.mtWordClears[wordKey] !== 'object') {
          Model.mtWordClears[wordKey] = { kanji: false, kana: false, meaning: false };
      }

      let mode = View.getEl('test-display-select').value || 'kana';
      // 英语模式：kana 不存在 → 映射为 word；audio 保留为听力辨音
      if (isEnglish && mode === 'kana') mode = 'word';
      
      if (isCorrect) {
          if (mode === 'word') Model.mtWordClears[wordKey].kanji = true;
          else if (mode === 'kana' || mode === 'audio') Model.mtWordClears[wordKey].kana = true;
          else if (mode === 'meaning') Model.mtWordClears[wordKey].meaning = true;

          // 日语及英语：任意两杠亮 → 第三杠自动亮（加速通关）
          if (Model.mtWordClears[wordKey].kana && Model.mtWordClears[wordKey].meaning) {
              Model.mtWordClears[wordKey].kanji = true;
          }
          if (Model.mtWordClears[wordKey].kanji && Model.mtWordClears[wordKey].meaning) {
              Model.mtWordClears[wordKey].kana = true;
          }
          if (Model.mtWordClears[wordKey].kanji && Model.mtWordClears[wordKey].kana) {
              Model.mtWordClears[wordKey].meaning = true;
          }
      } else {
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

  handleSpellConfirm(inputEl, wObj, displayMode) {
      if (Model.state.isAnimating) return;
      const isEnglish = wObj.lang === 'en';
      
      let targetClean, inputClean;
      if (isEnglish) {
          // English: compare typed English word directly
          targetClean = (wObj.word || '').toLowerCase().trim();
          inputClean = (EnglishInput.buffer || '').toLowerCase().trim();
      } else {
          targetClean = (wObj.kana || '').replace(/[【】\[\]()]/g,'');
          inputClean = RomajiEngine.getFinalText();
      }
      
      if (!inputClean) return;

      if (inputClean === targetClean) {
          Model.state.isAnimating = true; Hardware.playSound('success'); Hardware.vibrate(50);
          Model.state.comboCount++; Model.state.maxSessionCombo = Math.max(Model.state.maxSessionCombo, Model.state.comboCount); View.updateComboBadge();
          
          let wWord = View.getEl('w-word');
          let wMeaning = View.getEl('w-meaning');
          if(wWord) wWord.style.display = 'block';
          if(wMeaning) wMeaning.style.display = 'block';
          View.syncRootsDisplay();

          if (Model.state.mode === 'dual-track') {
              setTimeout(() => this.dtAdvanceNext(), 300);
          } else {
              if (Model.state.mode === 'memory-test') { 
                  if (!isEnglish) {
                      View.getEl('w-kana').innerText = wObj.kana; View.getEl('w-kana').style.display = 'block'; 
                  }
                  setTimeout(() => this.mtAdvanceNext(), 600); 
              } else { 
                  if (!isEnglish && (displayMode === 'word' || displayMode === 'meaning')) { View.getEl('w-kana').innerText = wObj.kana; } 
                  setTimeout(() => { Model.state.mtStep = 2; Model.state.isAnimating = false; View.renderMemoryTestUI(wObj, displayMode); }, 500); 
              }
          }
          if (isEnglish) EnglishInput.reset();
      } else {
          Hardware.playSound('error'); Hardware.vibrate(60);
          inputEl.classList.remove('shake-anim'); void inputEl.offsetWidth; 
          inputEl.classList.add('shake-anim', 'error-state');
          Model.state.comboCount = Math.max(0, Model.state.comboCount - 3); View.updateComboBadge();
          Model.state.currentWordFailed = true;
          
          Model.state.spellFailCount = (Model.state.spellFailCount || 0) + 1;
          if (Model.state.spellFailCount >= 2) {
              let activeKbId = Model.state.mode === 'dual-track' ? 'dt-spell-keyboard' : 'mt-spell-keyboard';
              let hintWrap = View.getEl(activeKbId + '-hint-wrap');
              if (hintWrap) hintWrap.classList.add('show');
          }
      }
  },

  handleDtChoiceClick(btn, isCorrect) {
      if (Model.state.isAnimating) return;
      if (isCorrect) {
          Model.state.isAnimating = true; btn.classList.add('correct'); Hardware.playSound('success'); Hardware.vibrate(40); Model.state.comboCount++; Model.state.maxSessionCombo = Math.max(Model.state.maxSessionCombo, Model.state.comboCount); View.updateComboBadge();
          
          let wMeaning = View.getEl('w-meaning');
          if(wMeaning) { wMeaning.style.display = 'block'; View.syncRootsDisplay(); }

          document.getElementById('w-example-box').querySelectorAll('.dt-ex-cn.hidden-translation').forEach(el => { 
    el.style.transform = 'rotateX(90deg)'; el.style.opacity = '0'; 
    setTimeout(() => { 
        el.innerText = el.dataset.text; 
        el.className = 'dt-ex-cn revealed-translation'; 
        el.style.transform = 'rotateX(-90deg)'; 
        void el.offsetWidth; 
        el.style.transform = 'rotateX(0)'; 
        el.style.opacity = '1'; 
        if (localStorage.getItem('useRubyRender') === 'false' && window.MathJax) {
            MathJax.typesetPromise([el]);
        }
    }, 150); 
});
          document.querySelectorAll('.dt-choice-btn').forEach(b => b.style.pointerEvents = 'none'); setTimeout(() => this.dtAdvanceNext(), 600);
      } else { 
          Hardware.playSound('error'); Hardware.vibrate(50); 
          btn.classList.remove('shake-anim', 'wrong'); 
          requestAnimationFrame(() => {
              void btn.offsetWidth; 
              btn.classList.add('shake-anim', 'wrong'); 
          });
          Model.state.comboCount = Math.max(0, Model.state.comboCount - 3); View.updateComboBadge(); 
      }
  },

  handleMtChoiceClick(btn, isCorrect, wObj, displayMode) {
      if (Model.state.isAnimating) return;
      if (isCorrect) {
          Model.state.isAnimating = true; btn.classList.add('correct'); Hardware.playSound('success'); Hardware.vibrate(40); Model.state.comboCount++; Model.state.maxSessionCombo = Math.max(Model.state.maxSessionCombo, Model.state.comboCount); View.updateComboBadge();
          if (Model.state.mode === 'memory-test') {
              let round = Model.state.mtRound; let step = Model.state.mtStep;
              if (round === 1) { View.getEl('w-meaning').innerText = wObj.meaning; View.getEl('w-meaning').style.display = 'block'; View.syncRootsDisplay(); View.getEl('w-meaning').classList.add('shake-anim'); setTimeout(() => View.getEl('w-meaning').classList.remove('shake-anim'), 300); document.querySelectorAll('#mt-choice-buttons .dt-choice-btn').forEach(b => b.style.pointerEvents = 'none'); setTimeout(() => this.mtAdvanceNext(), 800); } 
              else if (round === 2) { if (step === 1) { View.getEl('w-word').innerText = wObj.word; View.getEl('w-word').style.display = 'block'; View.syncRootsDisplay(); View.getEl('w-word').classList.add('shake-anim'); setTimeout(() => View.getEl('w-word').classList.remove('shake-anim'), 300); setTimeout(() => { Model.state.mtStep = 2; Model.state.isAnimating = false; View.renderMemoryTestUI(wObj, displayMode); }, 600); } } 
              else if (round === 3) { if (step === 1) { View.getEl('w-meaning').innerText = wObj.meaning; View.getEl('w-meaning').style.display = 'block'; View.syncRootsDisplay(); View.getEl('w-meaning').classList.add('shake-anim'); setTimeout(() => View.getEl('w-meaning').classList.remove('shake-anim'), 300); setTimeout(() => { Model.state.mtStep = 2; Model.state.isAnimating = false; View.renderMemoryTestUI(wObj, displayMode); }, 600); } else if (step === 2) { View.getEl('w-word').innerText = wObj.word; View.getEl('w-word').style.display = 'block'; View.syncRootsDisplay(); View.getEl('w-word').classList.add('shake-anim'); setTimeout(() => View.getEl('w-word').classList.remove('shake-anim'), 300); document.querySelectorAll('#mt-choice-buttons .dt-choice-btn').forEach(b => b.style.pointerEvents = 'none'); setTimeout(() => this.mtAdvanceNext(), 800); } }
          } else {
              if (Model.state.mtStep === 1) { View.getEl('w-word').innerText = wObj.word; View.syncRootsDisplay(); View.getEl('w-word').classList.add('shake-anim'); setTimeout(() => View.getEl('w-word').classList.remove('shake-anim'), 300); setTimeout(() => { Model.state.mtStep = 2; Model.state.isAnimating = false; View.renderMemoryTestUI(wObj, displayMode); }, 600); } 
              else { if (displayMode === 'word' || displayMode === 'kana') { View.getEl('w-meaning').innerText = wObj.meaning; } else if (displayMode === 'meaning') { View.getEl('w-word').innerText = wObj.word; } View.syncRootsDisplay(); View.getEl('w-example-box').style.display = 'block'; document.querySelectorAll('#mt-choice-buttons .dt-choice-btn').forEach(b => b.style.pointerEvents = 'none'); setTimeout(() => this.mtAdvanceNext(), 800); }
          }
      } else { Hardware.playSound('error'); Hardware.vibrate(50); btn.classList.remove('shake-anim', 'wrong'); void btn.offsetWidth; btn.classList.add('shake-anim', 'wrong'); Model.state.comboCount = Math.max(0, Model.state.comboCount - 3); View.updateComboBadge(); Model.state.currentWordFailed = true; }
  },

  dtAdvanceNext() { Model.state.currentIndex++; if (Model.state.currentIndex >= Model.state.studyQueue.length) { this.finishPendulum(); } else { View.renderStudyCard('next'); } },
  mtAdvanceNext() { 
      if (Model.state.mode === 'memory-test') {
          if (Model.state.currentWordFailed) { let failedIdx = Model.state.studyQueue.shift(); Model.state.studyQueue.push(failedIdx); } else { Model.state.studyQueue.shift(); }
          Model.state.currentWordFailed = false; Model.state.mtStep = 1; Model.state.currentIndex = 0; 
          if (Model.state.studyQueue.length === 0) {
              // 日语 3 轮 / 英语 3 轮（听力杠替代读音杠）
              if (Model.state.mtRound < 3) { 
                  Model.state.mtRound++; 
                  Model.state.studyQueue = [...Model.state.mtBaseQueue].sort(() => Math.random() - 0.5); 
                  Hardware.playSound('success'); Hardware.vibrate(200); 
                  showToast(`第 ${Model.state.mtRound - 1} 轮清空！硬核进阶`); 
                  setTimeout(() => View.renderStudyCard('next'), 500); 
              } 
              else { 
    Model.state.mtBaseQueue.forEach(idx => { 
        let w = Model.db[idx];
        let wWord = w.word; 
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

    let gk = Model.state.currentGroupKey;
    Model.mtGroupClears[gk] = (Model.mtGroupClears[gk] || 0) + 1;
    
    let uniqueIndices = Model.state.mode === 'memory-test' ? Model.state.mtBaseQueue : [...new Set(Model.state.studyQueue)];
    uniqueIndices.forEach(idx => {
        let w = Model.db[idx];
        let wWord = w.word;
        if (!Model.mtWordClears[wWord] || typeof Model.mtWordClears[wWord] !== 'object') {
            Model.mtWordClears[wWord] = { kanji: false, kana: false, meaning: false };
        }
        // 统一三杠全亮
        Model.mtWordClears[wWord].kanji = true;
        Model.mtWordClears[wWord].kana = true;
        Model.mtWordClears[wWord].meaning = true;
    });
    Model.saveClears();

    let exist = Model.records.findIndex(x => x.date === t && x.group === Model.state.currentGroupLabel && x.type === 'pendulum');
    if(exist === -1) { Model.records.unshift({date: t, group: Model.state.currentGroupLabel, type: 'pendulum'}); Model.saveRecords(); }
    showToast("任务完成！该组词汇已全部通关"); View.getEl('btn-exit-study').click();
  },


  toggleBatchMode() { Hardware.playSound('click'); Hardware.vibrate(20); Model.state.batchMode = !Model.state.batchMode; Model.state.selectedSet.clear(); if (Model.state.batchMode && Model.state.manageMode) { Model.state.manageMode = false; } View.updateWordbankUI(); View.resetWordbankRenderer(); },
  createFolder() { 
    Hardware.vibrate(20); 
    showPrompt("请输入新文件夹名称", "", (name) => { 
      if(Model.folders.includes(name)) return showToast("文件夹已存在"); 
      const lang = Model.state.currentLangMode; // 强绑定为当前所处语言
      Model.folders.push(name); 
      Model.folderLangs[name] = lang;
      Model.saveFolders(); 
      Model.saveFolderLangs();
      View.updateWordbankUI(); 
    }); 
  },
  deleteFolder() { 
      Hardware.vibrate(20); 
      let filter = View.getEl('wb-folder-filter').value; 
      if (filter === 'all' || filter === '默认词库' || filter.startsWith('virtual_')) return showToast("内置分类不可删除"); 
      showConfirm('删除文件夹', `确定要删除「${filter}」吗？里面的单词会自动退回默认词库。`, () => { 
          if (Model.state.batchMode) this.toggleBatchMode();
          Model.db.forEach(w => { if(w.folder === filter) w.folder = "默认词库"; }); 
          Model.folders = Model.folders.filter(f => f !== filter); 
          delete Model.folderLangs[filter];
          Model.saveFolders(); 
          Model.saveFolderLangs();
          Model.saveDB(); 
          View.getEl('wb-folder-filter').value = "all"; 
          View.updateWordbankUI(); 
          View.resetWordbankRenderer(); 
          showToast("已删除"); 
      }); 
  },
    openMoveModal(idx) { 
      if (idx === -2 && Model.state.selectedSet.size === 0) return showToast("未选词"); 
      Model.state.moveTargetIdx = idx; 
      
      const container = View.getEl('move-folder-list');
      container.innerHTML = '';
      
      Model.folders.forEach(folderName => {
          const item = document.createElement('div');
          item.className = 'move-folder-item';
          item.setAttribute('tabindex', '0');
          item.setAttribute('role', 'button');
          item.innerHTML = `
              <span class="material-symbols-rounded folder-icon">folder</span>
              <span class="folder-name">${folderName}</span>
          `;
          
          item.onclick = () => {
              Hardware.playSound('success');
              Hardware.vibrate(40);
              this.executeMove(folderName);
          };
          container.appendChild(item);
      });
      
      window.toggleModal('move-overlay', true); 
  },

  executeMove(destFolder) {
      if (Model.state.moveTargetIdx === -2) { 
          Model.state.selectedSet.forEach(idx => Model.db[idx].folder = destFolder); 
          this.toggleBatchMode(); 
      } else { 
          Model.db[Model.state.moveTargetIdx].folder = destFolder; 
      }
      Model.saveDB(); 
      window.toggleModal('move-overlay', false); 
      View.resetWordbankRenderer(); 
      showToast(`已移至 ${destFolder}`);
  },

  confirmMove() { Hardware.playSound('success'); Hardware.vibrate(40); let dest = View.getEl('move-dest-select').value; if (Model.state.moveTargetIdx === -2) { Model.state.selectedSet.forEach(idx => Model.db[idx].folder = dest); this.toggleBatchMode(); } else { Model.db[Model.state.moveTargetIdx].folder = dest; } Model.saveDB(); window.toggleModal('move-overlay', false); View.resetWordbankRenderer(); showToast("移动成功");},
batchDelete() { 
    Hardware.playSound('click'); Hardware.vibrate(30); 
    if(Model.state.selectedSet.size === 0) return showToast("请先选择单词"); 
showConfirm('批量删除', '确定要删除选中的所有单词吗？', () => { 
    this.closeDetailIfOpen();
        
        Model.state.selectedSet.forEach(idx => {
            let wordKey = Model.db[idx].word;
            Model.stars = Model.stars.filter(w => w !== wordKey);
            delete Model.mtWordClears[wordKey];
        });
        Model.saveStars();
        Model.saveClears();
        
        Model.db = Model.db.filter((_, i) => !Model.state.selectedSet.has(i)); 
        Model.saveDB(); 
        this.toggleBatchMode();
        if (document.getElementById('tab-wordbank').classList.contains('active')) {
            Model.state.renderedStartIndex = -1;
            View.renderVirtualGrid();
        }
        showToast("已批量删除"); 
    }); 
},
  editWord(idx) { 
    Model.editingIdx = idx; 
    let w = Model.db[idx]; 
    const isEnEdit = w.lang === 'en';
    View.getEl('edit-word').value = w.word; 
    View.getEl('edit-kana').value = isEnEdit ? (w.phonetic || '') : (w.kana || ''); 
    View.getEl('edit-type').value = w.type; 
    View.getEl('edit-meaning').value = w.meaning; 
    let rootsInput = View.getEl('edit-roots');
    if(rootsInput) rootsInput.value = w.roots || '';
    // Update the kana label for English
    const kanaLabels = document.querySelectorAll('#edit-overlay label');
    kanaLabels.forEach(l => { 
        if (l.getAttribute('for') === 'edit-kana' || l.textContent.includes('假名')) {
            l.textContent = isEnEdit ? '音标' : '假名';
        }
    });
    window.toggleModal('edit-overlay', true); 
  },
deleteWord(idx) { 
    showConfirm('删除单词', '彻底删除该词？', () => { 
        this.closeDetailIfOpen();
        const word = Model.db[idx].word;
        Model.db.splice(idx,1); 
        Model.saveDB();
        Model.stars = Model.stars.filter(w => w !== word);
        delete Model.mtWordClears[word];
        Model.saveStars();
        Model.saveClears();
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
                  roots: parts[5] ? parts[5].trim() : "",
                  folder: target, 
                  srs: { ease: 2.5, interval: 0, nextReview: Date.now() } 
              }); 
              added++; 
          } 
      }); 
      if(added) { 
          Hardware.playSound('success');
          this.closeDetailIfOpen();
          Model.saveDB(); 
          View.resetWordbankRenderer(); 
          showToast(`成功导入 ${added} 词`); 
          View.getEl('custom-input').value=''; 
      } 
  },
  
  openDetailModal(idx) { 
      Model.state.detailArray = Model.state.filteredDb.map(item => item.idx).filter(id => id !== -999); 
      Model.state.activeDetailIdx = Model.state.detailArray.indexOf(idx); 
      
      if (Model.state.activeDetailIdx === -1) {
          Model.state.detailArray = [idx];
          Model.state.activeDetailIdx = 0;
      }

      window.toggleModal('detail-overlay', true); 
      this.renderDetailCard('none', true); 
  },
  
  navDetail(dir) { 
      Model.state.activeDetailIdx += dir; 
      let max = Model.state.detailArray.length; 
      if (Model.state.activeDetailIdx < 0) Model.state.activeDetailIdx = max - 1; 
      if (Model.state.activeDetailIdx >= max) Model.state.activeDetailIdx = 0; 
      
      let realIdx = Model.state.detailArray[Model.state.activeDetailIdx];
      let w = Model.db[realIdx];
      if (!w) {
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
      let visuals = View.getCardVisuals(w.type, w.lang); 
      document.querySelector('#detail-card-container .watermark-layer').style.background = visuals.bg; 
 
      View.getEl('dt-watermark').innerHTML = visuals.wm; 
      
      let dtWordEl = View.getEl('dt-word');
      dtWordEl.innerText = w.word; 
      let dtLen = Array.from(w.word || '').length;
      const isEnDetail = w.lang === 'en';
      
      if (isEnDetail) {
          if (dtLen >= 14) dtWordEl.style.fontSize = '1.8rem';
          else if (dtLen >= 11) dtWordEl.style.fontSize = '2.2rem';
          else if (dtLen >= 8) dtWordEl.style.fontSize = '2.8rem';
          else if (dtLen >= 5) dtWordEl.style.fontSize = '3.5rem';
          else dtWordEl.style.fontSize = '4.2rem';
      } else {
          if (dtLen >= 10) dtWordEl.style.fontSize = '1.8rem';
          else if (dtLen >= 7) dtWordEl.style.fontSize = '2.2rem';
          else if (dtLen >= 5) dtWordEl.style.fontSize = '2.6rem';
          else dtWordEl.style.fontSize = '';
      }
      if (isEnDetail) {
          let ph = w.phonetic || '';
          View.getEl('dt-kana').innerHTML = ph ? `<span class="material-symbols-rounded phonetic-speaker" style="font-size: 1.15rem; cursor: pointer;">volume_up</span><span style="display:inline-block; transform:translateY(1px);">${escapeHTML(ph)}</span>` : '';
          View.getEl('dt-kana').style.display = ph ? 'flex' : 'none';
      } else {
          View.getEl('dt-kana').innerText = w.kana || ''; 
          View.getEl('dt-kana').style.display = 'block';
      }
      View.getEl('dt-type').innerHTML = visuals.tagsHTML; 
      let rootsEl = View.getEl('dt-roots');
      let showRootsPref = localStorage.getItem('showRoots') !== 'false';
      if (rootsEl) {
          rootsEl.innerHTML = (w.lang === 'en' && w.roots && showRootsPref) ? View.renderRoots(w.roots) : '';
          rootsEl.style.display = (w.lang === 'en' && w.roots && showRootsPref) ? 'flex' : 'none';
      }
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
      if (triggerTTS && localStorage.getItem('autoSpeak') !== 'false') { Hardware.speakWord(w); } 
  },

  openAIModal(sentence, word) {
      if (!navigator.onLine) { showToast('AI 导师需要联网才能工作哦，请检查网络~'); return; }
      let apiKey = localStorage.getItem('deepseekApiKey');
      if (!apiKey) {
          showToast('请先在【偏好设置】中配置 DeepSeek API Key');
          Nav.switchTab('tab-settings', ' |【環境設定】', document.querySelector('[data-target="tab-settings"]'));
          return;
      }
      window.toggleModal('ai-modal-overlay', true);
      let contentArea = View.getEl('ai-content-area');
      contentArea.innerHTML = '<div class="ai-loading-pulse">DeepSeek 正在为您拆解句法，请稍候...</div>';
      this.callDeepSeekStream(sentence, word, apiKey, contentArea);
  },

  async callDeepSeekStream(sentence, word, apiKey, container) {
      // 预设给 AI 的顶级 Prompt，规定了严苛的排版标准
      const prompt = `你是精通多语言的私人外教。请解析以下例句。\n目标词汇：${word}\n例句：${sentence}\n\n请严格按以下结构输出，不要加多余的废话和客套话：\n### 🔪 骨架拆解\n（简明扼要地拆解主谓宾等语法结构）\n\n### 💡 核心亮点\n（指出地道表达、词汇连读或语法特殊点）\n\n### ✍️ 举一反三\n（用目标词汇 "${word}" 再给2个更简短、常用的生活例句，必须带中文翻译）`;
      try {
          const response = await fetch('https://api.deepseek.com/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
              body: JSON.stringify({ model: 'deepseek-chat', messages: [{role: 'user', content: prompt}], stream: true })
          });
          
          if (!response.ok) {
              if (response.status === 401) throw new Error('API Key 无效或余额不足，请检查设置。');
              throw new Error(`网络请求失败: 错误码 ${response.status}`);
          }
          
          container.innerHTML = '<div class="ai-response-box"></div>';
          let box = container.querySelector('.ai-response-box');
          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let fullText = "";
          
          // 流式接收打字机数据
          while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              let chunkStr = decoder.decode(value, {stream: true});
              let lines = chunkStr.split('\n');
              for (let line of lines) {
                  line = line.trim();
                  if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                      try {
                          let data = JSON.parse(line.slice(6));
                          let content = data.choices[0].delta.content;
                          if (content) {
                              fullText += content;
                              // 实时转换排版：拦截 ### 生成华丽标题，拦截 ** 生成高亮胶囊
                              let renderText = escapeHTML(fullText)
                                  .replace(/### (.*?)\n/g, '<h4>$1</h4>\n')
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\n/g, '<br>');
                              box.innerHTML = renderText;
                              container.scrollTop = container.scrollHeight;
                          }
                      } catch (e) {}
                  }
              }
          }
      } catch (err) {
          container.innerHTML = `<div style="color: var(--accent-red); padding: 20px; text-align: center; font-weight: bold;">呼叫失败：${err.message}</div>`;
      }
  }
};

window.onload = () => Controller.init();