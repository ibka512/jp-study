/**
  * 钟日 - 核心控制逻辑
 */

const DATA_SCHEMA_VERSION = 2;
const MIGRATION_SNAPSHOT_KEY = 'migrationSafetySnapshot_v1';

const BACKUP_FORMAT_ID = 'zhongri-backup';
const BACKUP_FORMAT_VERSION = 5;
const PRE_IMPORT_RESTORE_KEY = 'preImportRestorePoint_v1';

const BACKUP_PREFERENCE_KEYS = Object.freeze([
    'theme',
    'langMode',
    'autoSpeak',
    'showRoots',
        'darkBtnStyle',
    'postponeTested',
    'wordOrderMode',
    'skipMastered',
    'useRubyRender',
    'ttsEngine',
    'displayMode',
    'lastCustomGroupTxt',
    'lastCustomGroupVal',
    'lastSelectedFolder',
    'lastTestDisplay',
    'lastTestRange'
]);
const escapeHTML = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
};

const escapeRegExp = (str) => {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const JAPANESE_RUBY_INSTRUCTION = `

【日语注音格式规则】
凡是回答中出现日语，所有包含汉字的日语词语都必须标注假名读音。

请严格使用“日语原文《假名读音》”格式，例如：
日本語《にほんご》
勉強《べんきょう》する
食《た》べる
気持《きも》ち
一人《ひとり》

必须根据句子语境选择正确读音。
纯平假名、纯片假名和中文汉字不要标注。
不要直接输出 HTML、ruby 标签、括号读音或其他注音格式。
日语汉字不能遗漏注音。`;

const withJapaneseRubyInstruction = (prompt = '') => {
    const basePrompt = prompt || '你是精通多语言的私人外教，耐心解答用户的任何语言学习问题。';

    if (basePrompt.includes('【日语注音格式规则】')) {
        return basePrompt;
    }

    return basePrompt + JAPANESE_RUBY_INSTRUCTION;
};

const renderAIMessageHTML = (text, targetWord = '') => {
    /*
     * AI 流式输出偶尔会混入零宽字符，
     * 或使用外观相似的全角括号。
     * 先统一格式，再开始转义和渲染。
     */
    const normalizedText = String(text || '')
        .normalize('NFC')
        .replace(
            /[\u200B-\u200D\u2060\uFEFF]/g,
            ''
        )
        .replace(/[〈＜«]/g, '《')
        .replace(/[〉＞»]/g, '》')
        .replace(/《[\s\u00A0]+/g, '《')
        .replace(/[\s\u00A0]+》/g, '》');

    let html = escapeHTML(normalizedText);

    const safeTargetWord =
        escapeHTML(
            String(targetWord || '')
                .trim()
                .replace(
                    /[\u200B-\u200D\u2060\uFEFF]/g,
                    ''
                )
        );

    const rubyBlocks = [];

    /*
     * 将暂存的日语注音结构保存成占位符，
     * 避免后续标题、加粗和目标词高亮破坏 ruby。
     */
    const storeRuby = (
        match,
        baseText,
        readingText
    ) => {
        const cleanBase =
            String(baseText || '')
                .trim();

        const cleanReading =
            String(readingText || '')
                .trim();

        const containsKanji =
            /[\u3400-\u4DBF\u4E00-\u9FFF々〆ヶ]/
                .test(cleanBase);

        if (
            !containsKanji ||
            !cleanReading
        ) {
            return match;
        }

        const token =
            `@@JP_RUBY_${rubyBlocks.length}@@`;

        let rubyHTML =
            '<ruby class="jp-ruby">' +
                '<rb>' +
                    cleanBase +
                '</rb>' +
                '<rt>' +
                    cleanReading +
                '</rt>' +
            '</ruby>';

        /*
         * 目标词继续保留原来的胶囊高亮。
         */
        if (
            safeTargetWord &&
            (
                safeTargetWord.includes(
                    cleanBase
                ) ||
                cleanBase.includes(
                    safeTargetWord
                )
            )
        ) {
            rubyHTML =
                '<span class="ai-key-chip ai-key-chip-ruby">' +
                    rubyHTML +
                '</span>';
        }

        rubyBlocks.push(rubyHTML);

        return token;
    };

        /*
     * 只匹配紧贴注音括号的词。
     *
     * 可以正确处理：
     * 道《みち》
     * 道 《みち》
     * 食べる《たべる》
     *
     * 同时避免把“夜の道《みち》”
     * 整体误认为一个词。
     */
    html = html.replace(
        /([\u3400-\u4DBF\u4E00-\u9FFF々〆ヶ0-9０-９]+(?:[ぁ-ゖァ-ヺー]{1,6})?)[ \t\u00A0\u3000]*《([ぁ-ゖァ-ヺー・ \t\u00A0\u3000]+?)》/g,
        storeRuby
    );

    html = html
        .replace(
            /### (.*?)\n/g,
            '<h4>$1</h4>\n'
        )
        .replace(
            /\*\*(.*?)\*\*/g,
            '<strong>$1</strong>'
        )
        .replace(
            /\n/g,
            '<br>'
        );

    /*
     * 高亮没有被注音标记包住的目标词。
     */
    if (safeTargetWord) {
        const wordPattern =
            new RegExp(
                escapeRegExp(
                    safeTargetWord
                ),
                'g'
            );

        html = html.replace(
            wordPattern,
            '<span class="ai-key-chip">' +
                safeTargetWord +
            '</span>'
        );
    }

    /*
     * 恢复暂存的 ruby 注音结构。
     */
    html = html.replace(
        /@@JP_RUBY_(\d+)@@/g,
        (match, index) => {
            return (
                rubyBlocks[
                    Number(index)
                ] ||
                ''
            );
        }
    );

    return html;
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
    const titleEl = document.getElementById('prompt-title');
    const helperEl = document.getElementById('prompt-helper');
    const iconEl = document.getElementById('prompt-icon');
    const visibilityBtn = document.getElementById('prompt-visibility');
    const input = document.getElementById('prompt-input');

    titleEl.textContent = title;
    helperEl.hidden = true;
    helperEl.textContent = '';

    iconEl.textContent = 'edit';

    input.type = 'text';
    input.autocomplete = 'off';
    input.placeholder = '请输入内容';
    input.value = defaultVal || '';

    visibilityBtn.hidden = true;

    window.toggleModal('prompt-overlay', true);

    setTimeout(() => {
        input.focus();
        input.select();
    }, 100);

    document.getElementById('prompt-confirm').onclick = () => {
        Hardware.vibrate(15);

        const val = input.value.trim();

        if (val) {
            window.toggleModal('prompt-overlay', false);
            onConfirm(val);
        }
    };

    document.getElementById('prompt-cancel').onclick = () => {
        Hardware.vibrate(10);
        window.toggleModal('prompt-overlay', false);
    };
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
    el.addEventListener('focus', () => {
        if (el.closest('#ai-chat-view') || el.closest('#ai-sheet-overlay')) return;
        if(nav) nav.style.transform = 'translateY(150%)';
    });
    el.addEventListener('blur', () => {
        if (el.closest('#ai-chat-view') || el.closest('#ai-sheet-overlay')) return;
        if(nav) nav.style.transform = 'translateY(0)';
    });
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
} else if (targetId === 'tab-ai-history') {
    Controller.renderAIHistory();
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

            if (sel.style.marginBottom) {
                facade.style.marginBottom = sel.style.marginBottom;
            }

            if (sel.style.flex) {
                facade.style.flex = sel.style.flex;
            }

            if (sel.style.width) {
                facade.style.width = sel.style.width;
            }

            if (sel.style.marginTop) {
                facade.style.marginTop = sel.style.marginTop;
            }

            let textSpan = document.createElement('span');
            textSpan.className = 'bs-facade-text';
            textSpan.innerText =
                sel.options[sel.selectedIndex]?.text || '';

            let arrowSpan = document.createElement('span');
            arrowSpan.className = 'material-symbols-rounded';
            arrowSpan.innerText = 'keyboard_arrow_down';
            arrowSpan.style.opacity = '0.5';

            facade.appendChild(textSpan);
            facade.appendChild(arrowSpan);

            sel.style.display = 'none';
            sel.parentNode.insertBefore(facade, sel.nextSibling);

            facade.addEventListener('click', () => {
                Hardware.vibrate(10);
                this.open(sel, textSpan);
            });

            sel.addEventListener('facade-update', () => {
                textSpan.innerText =
                    sel.options[sel.selectedIndex]?.text || '';
            });
        });

        /*
         * 为所有带有顶部横条的底部抽屉
         * 自动安装拖动关闭功能。
         */
        this.initDragSupport();
    },

    initDragSupport() {
        document
            .querySelectorAll('.modal-overlay .bottom-sheet')
            .forEach(sheet => {
                /*
                 * 防止初始化函数重复执行时，
                 * 同一个抽屉被绑定多次事件。
                 */
                if (sheet.dataset.dragReady === 'true') {
                    return;
                }

                const overlay =
                    sheet.closest('.modal-overlay');

                /*
                 * 只寻找抽屉最外层的横条，
                 * 避免误选内容区内的同名元素。
                 */
                const handle =
                    Array.from(sheet.children).find(child => {
                        return child.classList.contains('bs-handle');
                    });

                if (!overlay || !handle) {
                    return;
                }

                sheet.dataset.dragReady = 'true';

                /*
                 * 横条同时支持键盘操作。
                 */
                handle.setAttribute('role', 'button');
                handle.setAttribute('tabindex', '0');
                handle.setAttribute(
                    'aria-label',
                    '向下拖动关闭抽屉'
                );

                let dragging = false;
                let pointerId = null;
                let startY = 0;
                let currentY = 0;
                let startTime = 0;
                let finishTimer = null;

                const clearMotionState = () => {
                    if (finishTimer) {
                        window.clearTimeout(finishTimer);
                        finishTimer = null;
                    }

                    dragging = false;
                    pointerId = null;
                    currentY = 0;

                    sheet.classList.remove(
                        'is-dragging',
                        'is-settling',
                        'is-dismissing'
                    );

                    handle.classList.remove('is-dragging');
                    overlay.classList.remove('sheet-dismissing');

                    sheet.style.removeProperty(
                        '--sheet-drag-y'
                    );
                };

                /*
                 * 没有达到关闭距离时，
                 * 让抽屉弹回原位。
                 */
                const springBack = () => {
                    sheet.classList.remove(
                        'is-dragging',
                        'is-dismissing'
                    );

                    handle.classList.remove('is-dragging');
                    overlay.classList.remove(
                        'sheet-dismissing'
                    );

                    sheet.classList.add('is-settling');

                    sheet.style.setProperty(
                        '--sheet-drag-y',
                        '0px'
                    );

                    finishTimer = window.setTimeout(() => {
                        sheet.classList.remove('is-settling');

                        sheet.style.removeProperty(
                            '--sheet-drag-y'
                        );

                        finishTimer = null;
                    }, 300);
                };

                /*
                 * 完整执行抽屉退出动画，
                 * 然后调用现有的弹窗关闭方法。
                 */
                const dismissSheet = () => {
                    sheet.classList.remove(
                        'is-dragging',
                        'is-settling'
                    );

                    handle.classList.remove('is-dragging');

                    sheet.classList.add('is-dismissing');
                    overlay.classList.add(
                        'sheet-dismissing'
                    );

                    const dismissDistance = Math.max(
                        window.innerHeight,
                        sheet.offsetHeight + 120
                    );

                    sheet.style.setProperty(
                        '--sheet-drag-y',
                        `${dismissDistance}px`
                    );

                    Hardware.vibrate(12);

                    finishTimer = window.setTimeout(() => {
                        window.toggleModal(
                            overlay.id,
                            false
                        );

                        finishTimer =
                            window.setTimeout(() => {
                                clearMotionState();
                            }, 420);
                    }, 220);
                };

                const endDrag = event => {
                    if (
                        !dragging ||
                        event.pointerId !== pointerId
                    ) {
                        return;
                    }

                    const elapsed = Math.max(
                        performance.now() - startTime,
                        1
                    );

                    const totalDistance = Math.max(
                        0,
                        event.clientY - startY
                    );

                    const velocity =
                        totalDistance / elapsed;

                    /*
                     * 抽屉越高，关闭阈值会适当增加，
                     * 但不会超过 160 像素。
                     */
                    const closeThreshold = Math.min(
                        160,
                        Math.max(
                            90,
                            sheet.offsetHeight * 0.22
                        )
                    );

                    dragging = false;

                    try {
                        handle.releasePointerCapture(
                            pointerId
                        );
                    } catch (error) {}

                    pointerId = null;

                    /*
                     * 满足任一条件即可关闭：
                     *
                     * 1. 下拉距离足够；
                     * 2. 下拉距离超过 28 像素，
                     *    并且手势速度足够快。
                     */
                    const shouldClose =
                        currentY > closeThreshold ||
                        (
                            currentY > 28 &&
                            velocity > 0.55
                        );

                    if (shouldClose) {
                        dismissSheet();
                    } else {
                        springBack();
                    }
                };

                handle.addEventListener(
                    'pointerdown',
                    event => {
                        if (
                            !overlay.classList.contains(
                                'active'
                            )
                        ) {
                            return;
                        }

                        if (
                            event.pointerType === 'mouse' &&
                            event.button !== 0
                        ) {
                            return;
                        }

                        if (
                            overlay.classList.contains(
                                'sheet-dismissing'
                            )
                        ) {
                            return;
                        }

                        event.preventDefault();

                        if (finishTimer) {
                            window.clearTimeout(
                                finishTimer
                            );

                            finishTimer = null;
                        }

                        dragging = true;
                        pointerId = event.pointerId;
                        startY = event.clientY;
                        currentY = 0;
                        startTime = performance.now();

                        sheet.classList.remove(
                            'is-settling',
                            'is-dismissing'
                        );

                        overlay.classList.remove(
                            'sheet-dismissing'
                        );

                        sheet.classList.add(
                            'is-dragging'
                        );

                        handle.classList.add(
                            'is-dragging'
                        );

                        sheet.style.setProperty(
                            '--sheet-drag-y',
                            '0px'
                        );

                        try {
                            handle.setPointerCapture(
                                pointerId
                            );
                        } catch (error) {}
                    }
                );

                handle.addEventListener(
                    'pointermove',
                    event => {
                        if (
                            !dragging ||
                            event.pointerId !== pointerId
                        ) {
                            return;
                        }

                        event.preventDefault();

                        const rawDistance =
                            event.clientY - startY;

                        /*
                         * 向下时完全跟手。
                         * 向上时增加阻力，最多只移动 18 像素。
                         */
                        currentY = rawDistance < 0
                            ? Math.max(
                                -18,
                                rawDistance * 0.18
                            )
                            : rawDistance;

                        sheet.style.setProperty(
                            '--sheet-drag-y',
                            `${currentY}px`
                        );
                    }
                );

                handle.addEventListener(
                    'pointerup',
                    endDrag
                );

                handle.addEventListener(
                    'pointercancel',
                    event => {
                        if (
                            !dragging ||
                            event.pointerId !== pointerId
                        ) {
                            return;
                        }

                        dragging = false;
                        pointerId = null;

                        springBack();
                    }
                );

                /*
                 * 为键盘和辅助设备提供关闭方式。
                 */
                handle.addEventListener(
                    'keydown',
                    event => {
                        if (
                            !overlay.classList.contains(
                                'active'
                            )
                        ) {
                            return;
                        }

                        if (
                            event.key === 'Enter' ||
                            event.key === ' ' ||
                            event.key === 'ArrowDown'
                        ) {
                            event.preventDefault();
                            dismissSheet();
                        }
                    }
                );
            });
    },

    open(selectEl, textSpan) {
        let container = document.getElementById('bs-options'); container.innerHTML = '';
        let titleMap = {
            'test-range-select': '选择检验范围',
            'test-display-select': '默认显示模式',
            'next-display-mode': (Model.state.mode === 'rote-learning' && Model.state.currentLangMode === 'en') ? '选择强化模式' : '遮盖模式',
            'wb-folder-filter': '选择词库',
            'move-dest-select': '移动至目标文件夹',
            'import-lang-select': '选择词汇语言',
            'import-folder-select': '选择目标词库',
            'import-duplicate-mode': '选择重复词处理方式',
            'setting-word-order-mode': '选择词汇排列方式'
        };
        document.getElementById('bs-title').innerText = titleMap[selectEl.id] || "请选择";
        
        Array.from(selectEl.options).forEach(opt => {
            if (opt.style.display === 'none') return; // 遇到隐藏选项，直接跳过不画
            let btn = document.createElement('div');
            btn.className = 'bs-option ' + (opt.selected ? 'selected' : '');
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('role', 'button');
            
            if (selectEl.id === 'test-range-select' || selectEl.id === 'wb-folder-filter' || selectEl.id === 'import-folder-select') {
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
db: [], folders: ["默认词库"], folderLangs: { "默认词库": "ja" }, stars: [], records: [], aiConversations: [], editingIdx: -1,
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
        comboCount: 0,
    maxProgressSeen: 0, uniqueWordCount: 0, initialQueueLength: 0,
    batchMode: false, manageMode: false, selectedSet: new Set(), activeDetailIdx: 0, detailArray: [], moveTargetIdx: -1, 
    isAnimating: false, filteredDb: [], renderedStartIndex: -1, renderedEndIndex: -1, currentLangMode: 'ja'
  },


  async init() {
      await this.loadData();
  },

  idbAvailable: true,

  async readStorageValue(key) {
      if (
          this.idbAvailable &&
          typeof idbKeyval !== 'undefined'
      ) {
          try {
              return await idbKeyval.get(key);
          } catch (error) {
              console.warn(
                  `[Storage] 读取 ${key} 失败，尝试本地备用存储`,
                  error
              );
          }
      }

      const rawValue = localStorage.getItem(key);

      if (rawValue === null) {
          return null;
      }

      try {
          return JSON.parse(rawValue);
      } catch (error) {
          return rawValue;
      }
  },

  async writeStorageValue(key, value) {
      if (
          this.idbAvailable &&
          typeof idbKeyval !== 'undefined'
      ) {
          try {
              await idbKeyval.set(key, value);
              return;
          } catch (error) {
              console.warn(
                  `[Storage] 写入 ${key} 失败，尝试本地备用存储`,
                  error
              );
          }
      }

      localStorage.setItem(
          key,
          JSON.stringify(value)
      );
  },

  async createMigrationSnapshot(fromVersion) {
      const snapshot = {
          type: 'migration-snapshot',
          createdAt: new Date().toISOString(),
          fromVersion,
          toVersion: DATA_SCHEMA_VERSION,

          db: structuredClone(this.db),
          folders: structuredClone(this.folders),
          folderLangs: structuredClone(this.folderLangs),
          stars: structuredClone(this.stars),
          records: structuredClone(this.records),
          mtGroupClears: structuredClone(
              this.mtGroupClears
          ),
          mtWordClears: structuredClone(
              this.mtWordClears
          ),
          aiConversations: structuredClone(
              this.aiConversations
          )
      };

      try {
          await this.writeStorageValue(
              MIGRATION_SNAPSHOT_KEY,
              snapshot
          );

          console.log(
              '[Migration] 更新前安全快照已保存'
          );
      } catch (error) {
          /*
           * 快照保存失败时停止迁移。
           * 宁可暂时不更新，也不能冒险改坏用户数据。
           */
          console.error(
              '[Migration] 无法建立安全快照',
              error
          );

          throw new Error(
              '无法建立数据安全快照，已停止更新'
          );
      }

      return snapshot;
  },

  async saveAllUserData() {
      await Promise.all([
          this.saveDB(),
          this.saveFolders(),
          this.saveFolderLangs(),
          this.saveStars(),
          this.saveRecords(),
          this.saveClears(),

          this.writeStorageValue(
              'aiConversations',
              this.aiConversations
          )
      ]);
  },

  async restoreMigrationSnapshot(snapshot) {
      if (!snapshot) {
          throw new Error('没有可恢复的数据快照');
      }

      this.db = Array.isArray(snapshot.db)
          ? structuredClone(snapshot.db)
          : [];

      this.folders = Array.isArray(snapshot.folders)
          ? structuredClone(snapshot.folders)
          : ['默认词库'];

      this.folderLangs =
          snapshot.folderLangs &&
          typeof snapshot.folderLangs === 'object'
              ? structuredClone(snapshot.folderLangs)
              : { '默认词库': 'ja' };

      this.stars = Array.isArray(snapshot.stars)
          ? structuredClone(snapshot.stars)
          : [];

      this.records = Array.isArray(snapshot.records)
          ? structuredClone(snapshot.records)
          : [];

      this.mtGroupClears =
          snapshot.mtGroupClears &&
          typeof snapshot.mtGroupClears === 'object'
              ? structuredClone(snapshot.mtGroupClears)
              : {};

      this.mtWordClears =
          snapshot.mtWordClears &&
          typeof snapshot.mtWordClears === 'object'
              ? structuredClone(snapshot.mtWordClears)
              : {};

      this.aiConversations =
          Array.isArray(snapshot.aiConversations)
              ? structuredClone(
                    snapshot.aiConversations
                )
              : [];

      await this.saveAllUserData();

      console.warn(
          '[Migration] 已恢复更新前的数据快照'
      );
  },

  async runDataMigrations() {
      let dbChanged = false;
      let foldersChanged = false;
      let clearsChanged = false;

      /*
       * 旧日语词没有语言字段时，
       * 自动补成日语，而不是删除重建。
       */
      for (const word of this.db) {
          if (!word.lang) {
              word.lang = 'ja';
              dbChanged = true;
          }
      }

      /*
       * 补齐每个词库的语言信息。
       */
      for (const folder of this.folders) {
          if (!this.folderLangs[folder]) {
              const containsEnglishWord =
                  this.db.some(word => {
                      return (
                          word.folder === folder &&
                          word.lang === 'en'
                      );
                  });

              this.folderLangs[folder] =
                  containsEnglishWord ? 'en' : 'ja';

              foldersChanged = true;
          }
      }

      /*
       * 修复旧版本中被误放进日语默认词库的英语词汇。
       * 先把它们送回内置英语词库，再检查缺失的内置词，
       * 可以避免更新后出现重复词汇。
       */
      if (
          typeof DefaultEnglishWords !== 'undefined'
      ) {
          const defaultEnglishFolder =
              DefaultEnglishWords.find(word => {
                  return Boolean(word.folder);
              })?.folder || '英语词库';

          const misplacedEnglishWords =
              this.db.filter(word => {
                  return (
                      word.lang === 'en' &&
                      word.folder === '默认词库'
                  );
              });

          if (misplacedEnglishWords.length > 0) {
              if (
                  !this.folders.includes(
                      defaultEnglishFolder
                  )
              ) {
                  this.folders.push(
                      defaultEnglishFolder
                  );
              }

              this.folderLangs[
                  defaultEnglishFolder
              ] = 'en';

              for (
                  const word of misplacedEnglishWords
              ) {
                  word.folder =
                      defaultEnglishFolder;
              }

              dbChanged = true;
              foldersChanged = true;
          }
      }

      /*
       * 补齐默认英语词库。
       * 只添加缺失内容，不覆盖用户修改。
       */
      if (
          typeof DefaultEnglishWords !== 'undefined'
      ) {
          const englishFolders = [
              ...new Set(
                  DefaultEnglishWords.map(word => {
                      return word.folder;
                  })
              )
          ];

          for (const folder of englishFolders) {
              if (!this.folders.includes(folder)) {
                  this.folders.push(folder);
                  this.folderLangs[folder] = 'en';
                  foldersChanged = true;
              }
          }

          const existingEnglishWords = new Set(
              this.db
                  .filter(word => {
                      return word.lang === 'en';
                  })
                  .map(word => {
                      return `${word.folder || ''}::${word.word}`;
                  })
          );

          for (const defaultWord of DefaultEnglishWords) {
              const identity =
                  `${defaultWord.folder || ''}::${defaultWord.word}`;

              if (!existingEnglishWords.has(identity)) {
                  this.db.push({
                      ...defaultWord
                  });

                  existingEnglishWords.add(identity);
                  dbChanged = true;
              }
          }
      }

      /*
       * 把早期数字形式的掌握状态，
       * 转换成现在的三项掌握结构。
       */
      for (
          const wordKey of Object.keys(
              this.mtWordClears
          )
      ) {
          if (
              typeof this.mtWordClears[wordKey] ===
              'number'
          ) {
              this.mtWordClears[wordKey] = {
                  kanji: false,
                  kana: false,
                  meaning: false
              };

              clearsChanged = true;
          }
      }

      if (dbChanged) {
          await this.saveDB();
      }

      if (foldersChanged) {
          await Promise.all([
              this.saveFolders(),
              this.saveFolderLangs()
          ]);
      }

      if (clearsChanged) {
          await this.saveClears();
      }
  },

  async loadData() {
    /*
     * 这里只读取数据格式版本。
     * 无论版本是否变化，都绝不删除用户数据。
     */
    const storedSchemaVersion = Number.parseInt(
        localStorage.getItem(
            'dataSchemaVersion'
        ) || '0',
        10
    );

    const needsMigration =
        storedSchemaVersion < DATA_SCHEMA_VERSION;

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
        this.aiConversations = await idbKeyval.get('aiConversations') || [];
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
            this.aiConversations = JSON.parse(localStorage.getItem('aiConversations')) || [];
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
  
    /*
     * 只有数据格式真正升级时，
     * 才创建更新前安全快照。
     */
    let migrationSnapshot = null;

    if (needsMigration) {
        migrationSnapshot =
            await this.createMigrationSnapshot(
                storedSchemaVersion
            );
    }

    try {
        /*
         * 迁移函数是可重复运行的：
         * 它只补缺失数据，不删除或覆盖用户内容。
         */
        await this.runDataMigrations();

        if (needsMigration) {
            localStorage.setItem(
                'dataSchemaVersion',
                String(DATA_SCHEMA_VERSION)
            );

            console.log(
                `[Migration] 数据格式已从 ${storedSchemaVersion} 升级到 ${DATA_SCHEMA_VERSION}`
            );
        }
    } catch (error) {
        console.error(
            '[Migration] 数据迁移失败',
            error
        );

        if (migrationSnapshot) {
            try {
                await this.restoreMigrationSnapshot(
                    migrationSnapshot
                );

                localStorage.setItem(
                    'dataSchemaVersion',
                    String(storedSchemaVersion)
                );
            } catch (restoreError) {
                console.error(
                    '[Migration] 自动恢复也失败',
                    restoreError
                );
            }
        }

        throw error;
    }
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

  playStudyFeedback(type) {
      const card = this.getEl('flash-card');
      if (!card) return;

      const correctClass = 'study-feedback-correct';
      const wrongClass = 'study-feedback-wrong';
      const activeClass = type === 'correct' ? correctClass : wrongClass;

      card.classList.remove(correctClass, wrongClass);
      void card.offsetWidth;
      card.classList.add(activeClass);

      window.setTimeout(() => {
          card.classList.remove(activeClass);
      }, type === 'correct' ? 360 : 300);
  },

  revealStudyElement(el) {
      if (!el) return;

      el.classList.remove('blur-text', 'answer-reveal');
      el.removeAttribute('aria-hidden');

      void el.offsetWidth;
      el.classList.add('answer-reveal');

      window.setTimeout(() => {
          el.classList.remove('answer-reveal');
      }, 460);
  },

  revealStudyAnswer() {
      const elements = [
          this.getEl('w-word'),
          this.getEl('w-kana'),
          this.getEl('w-type'),
          this.getEl('w-meaning'),
          this.getEl('w-roots'),
          this.getEl('w-example-box')
      ].filter(el => {
          return el && el.style.display !== 'none' && !el.classList.contains('hidden');
      });

      elements.forEach((el, index) => {
          window.setTimeout(() => {
              this.revealStudyElement(el);
          }, index * 40);
      });
  },
  
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
          let currentLang = Model.state.currentLangMode;

          let words = Model.db
              .map((w, i) => ({ w, i }))
              .filter(item => {
                  let wordLang = item.w.lang || 'ja';

                  return (
                      wordLang === currentLang &&
                      Model.checkFilter(item.w, catVal)
                  );
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
          
          let currentTabEl = Array.from(
              document.querySelectorAll('#gs-tabs .g-tab')
          ).find(tab => tab.dataset.cat === catVal);

          let catLabel = currentTabEl
              ? currentTabEl.innerText
              : (catVal === 'default' ? '默认词库' : catVal);

const GROUP_SIZE = 10;
const GROUP_STEP = 7;

while (i * GROUP_STEP < total) {
    let startIdx = i * GROUP_STEP;
    let endIdx = Math.min(startIdx + GROUP_SIZE, total);
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
        const isEnglishBook = Model.state.currentLangMode === 'en';
        modeSel.options[0].text = '全显';
        modeSel.options[1].text = isEnglishBook ? '英文' : '汉字';
        modeSel.options[2].text = isEnglishBook ? '音标' : '假名';
        modeSel.options[3].text = '释义';
        modeSel.options[0].style.display = '';
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
    // 切卡时自动收起 AI 解析面板
let aiPanel = View.getEl('ai-inline-panel');
if (aiPanel) aiPanel.classList.add('hidden');
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
    
    card.classList.remove(
    'anim-slide-next',
    'anim-slide-prev',
    'anim-slide-out-left',
    'anim-slide-out-right',
    'anim-slide-in-right',
    'anim-slide-in-left',
    'study-card-exit-next',
    'study-card-exit-prev',
    'study-card-enter-next',
    'study-card-enter-prev',
    'study-feedback-correct',
    'study-feedback-wrong',
    'shimmering'
);
void card.offsetWidth;
    
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

        const exitClass = anim === 'next'
            ? 'study-card-exit-next'
            : 'study-card-exit-prev';

        const enterClass = anim === 'next'
            ? 'study-card-enter-next'
            : 'study-card-enter-prev';

        card.classList.add(exitClass);

        window.setTimeout(() => {
            this.updateCardContent(
                w,
                visuals,
                mode,
                forceRoteFull,
                isMemTest,
                isRote,
                isFilterTest
            );

            triggerSRAnnouncement();

            card.classList.remove(exitClass);
            void card.offsetWidth;
            card.classList.add(enterClass);

            window.setTimeout(() => {
                card.classList.remove(enterClass);
                Model.state.isAnimating = false;
            }, 330);
        }, 180);
    } else {
        this.updateCardContent(
            w,
            visuals,
            mode,
            forceRoteFull,
            isMemTest,
            isRote,
            isFilterTest
        );

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
        if (mode === 'word') {
            if (isEnglish) {
                /*
                 * 英语“英文”模式：
                 * 先显示释义，让用户根据释义拼写英文。
                 */
                showWord = false;
                showKana = false;
                showMeaning = true;
            } else {
                showKana = Model.state.mtStep > 1;
                showMeaning = false;
            }
        } else if (mode === 'kana') {
            if (isEnglish) {
                showWord = false;
                showKana = true;
                showMeaning = false;
            } else {
                showWord = Model.state.mtStep > 1;
                showMeaning = false;
            }
        } else if (mode === 'meaning') {
            showWord = false;
            showKana = isEnglish ? false : Model.state.mtStep > 1;
            showMeaning = true;
        }
    }

    const wordIsMasked = !showWord && !isMemTest;

    /*
     * 英文单词隐藏时固定使用三个方块。
     * 不再按照单词字母数量生成方块，避免长单词冲出卡片。
     */
    let finalWord = wordIsMasked
        ? (isEnglish ? maskFixed : mask(w.word))
        : w.word;

    let wWordEl = this.getEl('w-word');
    wWordEl.innerText = finalWord;

    let wLen = Array.from(w.word || '').length;

    if (isEnglish) {
        if (wordIsMasked) {
            wWordEl.style.fontSize = '2.8rem';
        } else if (wLen >= 14) {
            wWordEl.style.fontSize = '1.8rem';
        } else if (wLen >= 11) {
            wWordEl.style.fontSize = '2.2rem';
        } else if (wLen >= 8) {
            wWordEl.style.fontSize = '2.8rem';
        } else if (wLen >= 5) {
            wWordEl.style.fontSize = '3.5rem';
        } else {
            wWordEl.style.fontSize = '4.2rem';
        }
    } else {
        if (wLen >= 10) {
            wWordEl.style.fontSize = '1.8rem';
        } else if (wLen >= 7) {
            wWordEl.style.fontSize = '2.2rem';
        } else if (wLen >= 5) {
            wWordEl.style.fontSize = '2.6rem';
        } else {
            wWordEl.style.fontSize = '';
        }
    }
 

    const isEnglishRoteSpell =
        isEnglish &&
        isRote &&
        !forceRoteFull &&
        Model.state.mtStep === 1 &&
        (mode === 'word' || mode === 'meaning');

    const isEnglishMemorySpell =
        isEnglish &&
        isMemTest &&
        Model.state.mtRound === 2;

    const hideEnglishPhonetic =
        isEnglish &&
        (
            isDtSpell ||
            isEnglishRoteSpell ||
            isEnglishMemorySpell
        );

    if (!isEnglish) {
        this.getEl('w-kana').innerText =
            (!showKana && !isMemTest)
                ? mask((w.kana || '').replace(/[【】\[\]()]/g, ''))
                : (w.kana || '');
    } else {
        this.getEl('w-kana').innerText = w.phonetic || '';
        this.getEl('w-kana').style.display =
            hideEnglishPhonetic ? 'none' : 'block';
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
        this.getEl('w-kana').style.display =
            hideEnglishPhonetic ? 'none' : 'block';

        this.getEl('w-meaning').style.display =
            isDtChoice ? 'none' : 'block';
    } else if (!isMemTest) {
        this.getEl('w-kana').style.display =
            hideEnglishPhonetic ? 'none' : 'block';

        this.getEl('w-meaning').style.display = 'block';
    }
    
    const isEnglishRoteTraining = isEnglish && isRote && !forceRoteFull;
    let hideSpeaker =
        isDtSpell ||
        isMemTest ||
        isEnglishRoteTraining ||
        (isRote && !isEnglish && mode !== 'kana' && mode !== 'all' && !forceRoteFull);
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
        
                let wordLang = targetWordObj ? (targetWordObj.lang || 'ja') : 'ja';
let sparkBtnHTML = `<span class="material-symbols-rounded ai-sparkle-icon" data-sentence="${escapeHTML(pureJpText)}" data-word="${targetWordObj ? escapeHTML(targetWordObj.word) : ''}" data-lang="${wordLang}">auto_awesome</span>`;
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
  
  setEnglishCardWord(wObj, masked = false, visible = true) {
      const wordEl = this.getEl('w-word');
      if (!wordEl) return;

      if (!visible) {
          wordEl.style.display = 'none';
          return;
      }

      wordEl.innerText = masked ? '■■■' : (wObj.word || '');
      wordEl.style.display = 'block';

      if (masked) {
          wordEl.style.fontSize = '2.8rem';
          return;
      }

      const wordLength = Array.from(wObj.word || '').length;
      if (wordLength >= 14) wordEl.style.fontSize = '1.8rem';
      else if (wordLength >= 11) wordEl.style.fontSize = '2.2rem';
      else if (wordLength >= 8) wordEl.style.fontSize = '2.8rem';
      else if (wordLength >= 5) wordEl.style.fontSize = '3.5rem';
      else wordEl.style.fontSize = '4.2rem';
  },

  showEnglishRoteFullCard(wObj) {
      const phoneticEl = this.getEl('w-kana');
      const meaningEl = this.getEl('w-meaning');
      const typeEl = this.getEl('w-type');
      const rootsEl = this.getEl('w-roots');
      const exampleEl = this.getEl('w-example-box');
      const blindAudioUi = this.getEl('mt-blind-audio-ui');

      if (blindAudioUi) blindAudioUi.classList.add('hidden');

      this.setEnglishCardWord(wObj, false, true);

      if (phoneticEl) {
          phoneticEl.innerText = wObj.phonetic || '';
          phoneticEl.style.display = 'block';
      }

      if (meaningEl) {
          meaningEl.innerText = wObj.meaning || '';
          meaningEl.style.display = 'block';
      }

      if (typeEl) typeEl.style.display = 'flex';

      if (rootsEl) {
          const showRoots = localStorage.getItem('showRoots') !== 'false';
          if (showRoots && wObj.roots) {
              rootsEl.innerHTML = this.renderRoots(wObj.roots, false, false);
              rootsEl.style.display = 'flex';
          } else {
              rootsEl.style.display = 'none';
          }
      }

      this.renderExampleBox(wObj.example, 'w-example-box', 'normal', wObj);
      if (exampleEl && wObj.example) exampleEl.style.display = 'block';

      this.syncRootsDisplay();
      this.revealStudyAnswer();
  },

  renderEnglishRoteUI(wObj, displayMode) {
      const mtWarning = this.getEl('mt-warning');
      const spellArea = this.getEl('mt-spell-area');
      const choiceArea = this.getEl('mt-choice-area');
      const blindAudioUi = this.getEl('mt-blind-audio-ui');
      const wordEl = this.getEl('w-word');
      const phoneticEl = this.getEl('w-kana');
      const meaningEl = this.getEl('w-meaning');
      const typeEl = this.getEl('w-type');
      const rootsEl = this.getEl('w-roots');
      const exampleEl = this.getEl('w-example-box');
      const speakerEl = this.getEl('btn-speaker');

      if (mtWarning) mtWarning.classList.add('hidden');
      if (spellArea) spellArea.classList.add('hidden');
      if (choiceArea) choiceArea.classList.add('hidden');
      if (blindAudioUi) blindAudioUi.classList.add('hidden');

      let mode = ['word', 'kana', 'meaning'].includes(displayMode)
          ? displayMode
          : 'word';

      if (mode !== displayMode) {
          const modeSelect = this.getEl('next-display-mode');
          if (modeSelect) {
              modeSelect.value = mode;
              modeSelect.dispatchEvent(new Event('facade-update'));
          }
          localStorage.setItem('displayMode', mode);
      }

      const step = Model.state.mtStep;
      let currentTestType = '';
      let isMeaning = false;
      let targetText = '';

      [wordEl, phoneticEl, meaningEl, typeEl].forEach(el => {
          if (!el) return;
          el.classList.remove('blur-text');
          el.removeAttribute('aria-hidden');
      });

      if (wordEl) wordEl.style.display = 'none';
      if (phoneticEl) phoneticEl.style.display = 'none';
      if (meaningEl) meaningEl.style.display = 'none';
      if (typeEl) typeEl.style.display = 'none';
      if (rootsEl) rootsEl.style.display = 'none';
      if (exampleEl) exampleEl.style.display = 'none';
      if (speakerEl) speakerEl.style.display = 'none';

      if (mode === 'word') {
          if (step === 1) {
              currentTestType = 'spell';
              this.setEnglishCardWord(wObj, true, true);

              if (meaningEl) {
                  meaningEl.innerText = wObj.meaning || '';
                  meaningEl.style.display = 'block';
              }
              if (typeEl) typeEl.style.display = 'flex';
          } else {
              currentTestType = 'choice-meaning';
              isMeaning = true;
              targetText = wObj.meaning || '';
              this.setEnglishCardWord(wObj, false, true);

              if (phoneticEl) {
                  phoneticEl.innerText = wObj.phonetic || '';
                  phoneticEl.style.display = 'block';
              }
              if (typeEl) typeEl.style.display = 'flex';
          }
      } else if (mode === 'kana') {
          if (step === 1) {
              currentTestType = 'choice-word';
              isMeaning = false;
              targetText = wObj.word || '';

              if (blindAudioUi) blindAudioUi.classList.remove('hidden');

              requestAnimationFrame(() => {
                  Hardware.unlockSpeech();
                  Hardware.speakWord(wObj);
              });
          } else {
              currentTestType = 'choice-meaning';
              isMeaning = true;
              targetText = wObj.meaning || '';
              this.setEnglishCardWord(wObj, false, true);

              if (phoneticEl) {
                  phoneticEl.innerText = wObj.phonetic || '';
                  phoneticEl.style.display = 'block';
              }
              if (typeEl) typeEl.style.display = 'flex';
          }
      } else {
          if (step === 1) {
              currentTestType = 'choice-meaning';
              isMeaning = true;
              targetText = wObj.meaning || '';
              this.setEnglishCardWord(wObj, false, true);

              if (phoneticEl) {
                  phoneticEl.innerText = wObj.phonetic || '';
                  phoneticEl.style.display = 'block';
              }
              if (typeEl) typeEl.style.display = 'flex';
          } else {
              currentTestType = 'choice-word';
              isMeaning = false;
              targetText = wObj.word || '';
              this.setEnglishCardWord(wObj, true, true);

              if (meaningEl) {
                  meaningEl.innerText = wObj.meaning || '';
                  meaningEl.style.display = 'block';
              }
              if (typeEl) typeEl.style.display = 'flex';
          }
      }

      if (currentTestType === 'spell') {
          if (spellArea) spellArea.classList.remove('hidden');
          RomajiEngine.reset();
          EnglishInput.reset();

          const inputEl = this.getEl('mt-spell-input');
          inputEl.innerHTML = '';
          inputEl.classList.remove('error-state', 'shake-anim');
          this.renderQwertyKeyboard('mt-spell-keyboard', inputEl, wObj, mode);
          return;
      }

      if (choiceArea) choiceArea.classList.remove('hidden');

      const wordLang = wObj.lang || 'en';
      let pool = Model.db.filter(x => {
          return (
              (x.lang || 'ja') === wordLang &&
              x.folder === wObj.folder &&
              x.type === wObj.type &&
              x.word !== wObj.word
          );
      });

      if (pool.length < 3) {
          pool = Model.db.filter(x => {
              return (
                  (x.lang || 'ja') === wordLang &&
                  x.word !== wObj.word
              );
          });
      }

      pool = pool.sort(() => Math.random() - 0.5).slice(0, 3);

      let choices = [{ text: targetText, correct: true }];
      pool.forEach(x => {
          choices.push({
              text: isMeaning ? x.meaning : x.word,
              correct: false
          });
      });
      choices.sort(() => Math.random() - 0.5);

      const choiceButtons = this.getEl('mt-choice-buttons');
      choiceButtons.innerHTML = '';

      choices.forEach((choice, index) => {
          const btn = document.createElement('div');
          btn.className = 'dt-choice-btn choice-flip-anim';
          btn.setAttribute('tabindex', '0');
          btn.setAttribute('role', 'button');

          const labelSpan = document.createElement('span');
          labelSpan.className = 'choice-label';
          labelSpan.innerText = String.fromCharCode(65 + index) + '.';

          const textSpan = document.createElement('span');
          textSpan.innerText = choice.text;

          btn.appendChild(labelSpan);
          btn.appendChild(textSpan);
          btn.onpointerdown = e => {
              e.preventDefault();
              Controller.handleMtChoiceClick(
                  btn,
                  choice.correct,
                  wObj,
                  mode
              );
          };
          choiceButtons.appendChild(btn);
      });
  },

  renderMemoryTestUI(wObj, displayMode) {
      let mtWarning = this.getEl('mt-warning');
      if (mtWarning) mtWarning.classList.add('hidden');

      this.getEl('mt-spell-area').classList.add('hidden');
      this.getEl('mt-choice-area').classList.add('hidden');

      let blindAudioUi = this.getEl('mt-blind-audio-ui');
      if (blindAudioUi) blindAudioUi.classList.add('hidden');

      let isMemTest = Model.state.mode === 'memory-test';

      if (!isMemTest && wObj.lang === 'en') {
          this.renderEnglishRoteUI(wObj, displayMode);
          return;
      }

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
              if (blindAudioUi) blindAudioUi.classList.remove('hidden');
              currentTestType = 'choice';
              isMeaning = true;
              targetText = wObj.meaning;
          } else if (round === 2) {
              if (isEnglishMt) {
                  if (blindAudioUi) blindAudioUi.classList.remove('hidden');
                  currentTestType = 'spell';
              } else if (step === 1) {
                  if (blindAudioUi) blindAudioUi.classList.remove('hidden');
                  currentTestType = 'choice';
                  isMeaning = false;
                  targetText = wObj.word;
              } else if (step === 2) {
                  this.getEl('w-word').style.display = 'block';
                  currentTestType = 'spell';
              }
          } else if (round === 3) {
              if (isEnglishMt) {
                  this.getEl('w-kana').style.display = 'block';
                  this.getEl('w-kana').innerText = wObj.phonetic || '';
                  currentTestType = 'choice';
                  isMeaning = true;
                  targetText = wObj.meaning;
              } else if (step === 1) {
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
          if (displayMode === 'all') {
              if (mtWarning) mtWarning.classList.remove('hidden');
              return;
          }

          if (displayMode === 'word') {
              currentTestType = Model.state.mtStep === 1
                  ? 'spell'
                  : 'choice-meaning';
          } else if (displayMode === 'kana') {
              currentTestType = Model.state.mtStep === 1
                  ? 'choice-word'
                  : 'choice-meaning';
          } else if (displayMode === 'meaning') {
              currentTestType = Model.state.mtStep === 1
                  ? 'spell'
                  : 'choice-word';
          }

          isMeaning = currentTestType === 'choice-meaning';
          targetText = isMeaning ? wObj.meaning : wObj.word;
      }

      if (currentTestType === 'spell') {
          this.getEl('mt-spell-area').classList.remove('hidden');
          RomajiEngine.reset();
          EnglishInput.reset();

          let inputEl = this.getEl('mt-spell-input');
          inputEl.innerHTML = '';
          inputEl.classList.remove('error-state', 'shake-anim');
          this.renderQwertyKeyboard(
              'mt-spell-keyboard',
              inputEl,
              wObj,
              displayMode
          );
          return;
      }

      if (currentTestType.startsWith('choice')) {
          this.getEl('mt-choice-area').classList.remove('hidden');

          const wordLang = wObj.lang || 'ja';
          let pool = Model.db.filter(x => {
              return (
                  (x.lang || 'ja') === wordLang &&
                  x.folder === wObj.folder &&
                  x.type === wObj.type &&
                  x.word !== wObj.word
              );
          });

          if (pool.length < 3) {
              pool = Model.db.filter(x => {
                  return (
                      (x.lang || 'ja') === wordLang &&
                      x.word !== wObj.word
                  );
              });
          }

          pool = pool.sort(() => Math.random() - 0.5).slice(0, 3);

          let choices = [{ text: targetText, correct: true }];
          pool.forEach(x => {
              choices.push({
                  text: isMeaning ? x.meaning : x.word,
                  correct: false
              });
          });
          choices.sort(() => Math.random() - 0.5);

          let cb = this.getEl('mt-choice-buttons');
          cb.innerHTML = '';

          choices.forEach((choice, index) => {
              let btn = document.createElement('div');
              btn.className = 'dt-choice-btn choice-flip-anim';
              btn.setAttribute('tabindex', '0');
              btn.setAttribute('role', 'button');

              let labelSpan = document.createElement('span');
              labelSpan.className = 'choice-label';
              labelSpan.innerText = String.fromCharCode(65 + index) + '.';

              let textSpan = document.createElement('span');
              textSpan.innerText = choice.text;

              btn.appendChild(labelSpan);
              btn.appendChild(textSpan);
              btn.onpointerdown = e => {
                  e.preventDefault();
                  Controller.handleMtChoiceClick(
                      btn,
                      choice.correct,
                      wObj,
                      displayMode
                  );
              };
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
          ? '<span class="material-symbols-rounded" style="font-size:1.1rem;">visibility</span> 查看首字母提示'
          : '<span class="material-symbols-rounded" style="font-size:1.1rem;">visibility</span> 查看假名提示';
      hintBtn.onpointerdown = (e) => {
          e.preventDefault();
          Hardware.vibrate(10);
          if (isEnglishKb) {
              let wWord = View.getEl('w-word');
              if (wWord) {
                  const firstLetter = (wObj.word || '').charAt(0).toLowerCase();
                  wWord.innerText = firstLetter ? firstLetter + '···' : '···';
                  wWord.style.display = 'block';
                  wWord.style.fontSize = '2.8rem';
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

const AI_TUTOR_BASE_PROMPT = `你是一名面向中文学习者的语言导师。
默认使用清晰、自然的中文解释，除非用户要求使用目标语言。
先直接回答问题，再补充必要说明；简单问题保持简短，复杂问题分层说明。
发现表达错误时，优先给出“原表达、修改后表达、修改原因”。
示例必须自然、常用并符合真实语境，区分口语、书面语、正式与非正式表达。
不要使用空洞的夸奖、客套开场或与问题无关的总结。
不确定时明确说明，不要编造词义、语法规则或固定搭配。`;

const AI_TUTOR_LANGUAGE_PROMPTS = Object.freeze({
    ja: `本次主要辅导日语。
注意区分日常口语、书面语和敬语，并指出中文直译造成的不自然表达。
解释词语时按需说明读音、词性、常见搭配和使用限制。`,

    en: `本次主要辅导英语。
解释单词时按需标注国际音标，并优先讲常见搭配和现代自然表达。
注意区分日常口语、书面语、正式与非正式表达。
不要添加日语假名注音，也不要堆砌冷僻词。`
});

const AI_CHAT_PRESETS = Object.freeze({
    free: {
        title: '自由答疑',
        icon: 'forum',
        description: '随时询问词汇、语法与表达',

        instruction: `根据用户的问题自然回答，不强制套用固定模板。
先解决用户当前最关心的问题，再按需要补充例子或提醒。`,

        welcome: {
            ja: '可以询问日语词汇、语法、表达是否自然，或直接粘贴一句话。',
            en: '可以询问英语词汇、语法、表达是否自然，或直接粘贴一句话。'
        },

        shortcuts: {
            ja: [
                '这个日语表达自然吗？',
                '比较两个近义词',
                '解释一个语法点',
                '帮我检查一句话'
            ],

            en: [
                '这个英语表达自然吗？',
                '比较两个近义词',
                '解释一个语法点',
                '帮我检查一句话'
            ]
        }
    },

    grammar: {
        title: '语法拆解',
        icon: 'account_tree',
        description: '分析句子结构与重点语法',

        instruction: `用户提供句子后，按需要从“句子大意、结构拆解、重点语法、自然度、相似例句”几个部分讲解。
不要为了凑齐栏目重复内容；句子很简单时可以合并说明。`,

        welcome: {
            ja: '粘贴一段日语，我会帮你拆开句子结构、语法和自然度。',
            en: '粘贴一段英语，我会帮你拆开句子结构、语法和自然度。'
        },

        shortcuts: {
            ja: [
                '拆解这句日语',
                '解释句中的语法',
                '这句话为什么这样说？',
                '给我相似例句'
            ],

            en: [
                '拆解这句英语',
                '解释句中的语法',
                '这句话为什么这样说？',
                '给我相似例句'
            ]
        }
    },

    vocabulary: {
        title: '单词精讲',
        icon: 'menu_book',
        description: '掌握词义、搭配与真实用法',

        instruction: `用户提供单词后，优先说明核心含义、词性或读音、常见搭配、容易混淆的词、真实使用场景和自然例句。
讲解结束时可给一个简短小测验，但用户只想查词时不要强迫练习。`,

        welcome: {
            ja: '输入一个日语单词，我会讲清读音、含义、搭配与使用场景。',
            en: '输入一个英语单词，我会讲清音标、含义、搭配与使用场景。'
        },

        shortcuts: {
            ja: [
                '解释这个单词',
                '比较两个近义词',
                '给我常见搭配',
                '用这个词考考我'
            ],

            en: [
                '解释这个单词',
                '比较两个近义词',
                '给我常见搭配',
                '用这个词考考我'
            ]
        }
    },

    polish: {
        title: '翻译润色',
        icon: 'translate',
        description: '翻译并改成更自然的表达',

        instruction: `先判断用户需要翻译、纠错还是润色。
必要时给出“直接版本、自然版本、其他语气版本、修改原因”。
保留原意，不擅自增加用户没有表达的信息。`,

        welcome: {
            ja: '输入中文或日语，我会翻译、纠错，并给出更自然的日语表达。',
            en: '输入中文或英语，我会翻译、纠错，并给出更自然的英语表达。'
        },

        shortcuts: {
            ja: [
                '翻译成自然日语',
                '改得更口语',
                '改得更正式',
                '检查是否地道'
            ],

            en: [
                '翻译成自然英语',
                '改得更口语',
                '改得更正式',
                '检查是否地道'
            ]
        }
    },

    guided: {
        title: '引导练习',
        icon: 'psychology_alt',
        description: '通过提示自己找到答案',

        instruction: `默认不要立刻公布完整答案。
先指出问题范围，再给一个小提示并等待用户尝试；根据用户的回答逐步增加提示。
用户明确要求直接看答案，或多次尝试仍不会时，再给出答案并总结原因。`,

        welcome: {
            ja: '选择一个练习方向，我会先给提示，让你自己找到日语答案。',
            en: '选择一个练习方向，我会先给提示，让你自己找到英语答案。'
        },

        shortcuts: {
            ja: [
                '给我一道翻译题',
                '陪我练习造句',
                '只给我一个提示',
                '检查我的答案'
            ],

            en: [
                '给我一道翻译题',
                '陪我练习造句',
                '只给我一个提示',
                '检查我的答案'
            ]
        }
    }
});

const buildAIChatSystemPrompt = (presetId, lang) => {
    const safeLang =
        lang === 'en'
            ? 'en'
            : 'ja';

    const preset =
        AI_CHAT_PRESETS[presetId] ||
        AI_CHAT_PRESETS.free;

    return [
        AI_TUTOR_BASE_PROMPT,
        AI_TUTOR_LANGUAGE_PROMPTS[safeLang],
        `【本次教学模式：${preset.title}】`,
        preset.instruction
    ].join('\n\n');
};

const Controller = {
  aiCache: {},
  currentChat: { systemPrompt: '', messages: [], cacheKey: '' },

  aiTabChat: {
      activeIdx: -1,
      messages: [],
      systemPrompt: '',
      cacheKey: '',
      presetId: '',
      lang: 'ja',
      word: '',
      sentence: ''
  },
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
    this.initializeImportPanel();
    await this.updateRestorePointUI();
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

    let savedWordOrderMode = localStorage.getItem('wordOrderMode');

    if (!['weak-first', 'new-first', 'original'].includes(savedWordOrderMode)) {
        const legacyPostponeTested =
            localStorage.getItem('postponeTested') === 'true';

        savedWordOrderMode =
            legacyPostponeTested
                ? 'new-first'
                : 'weak-first';

        localStorage.setItem(
            'wordOrderMode',
            savedWordOrderMode
        );
    }

    let wordOrderSelect =
        View.getEl('setting-word-order-mode');

    if (wordOrderSelect) {
        wordOrderSelect.value = savedWordOrderMode;
        wordOrderSelect.dispatchEvent(
            new Event('facade-update')
        );
    }

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
    
    View.getEl('btn-exit-study').addEventListener('click', () => { Hardware.vibrate(20); Hardware.stopAllAudio(); View.showPage('tab-home'); View.renderDashboard(); });

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
        Hardware.playSound('click');
        Hardware.vibrate(15);

        View.updateGroupTabs();

        const savedGroupKey =
            Model.state.currentGroupKey ||
            localStorage.getItem('lastCustomGroupVal') ||
            '';

        const [, savedCat] = savedGroupKey.split('|');

        const tabs = Array.from(
            View.getEl('gs-tabs').querySelectorAll('.g-tab')
        );

        const targetTab =
            tabs.find(tab => tab.dataset.cat === savedCat) ||
            tabs.find(tab => tab.classList.contains('active')) ||
            tabs[0];

        tabs.forEach(tab => {
            tab.classList.toggle('active', tab === targetTab);
        });

        const activeCat = targetTab
            ? targetTab.dataset.cat
            : 'default';

        window.toggleModal('group-select-overlay', true);

        setTimeout(() => {
            View.renderGroupBottomSheet(activeCat);
        }, 10);
    });

    View.getEl('gs-tabs').addEventListener('click', (e) => {
        const tab = e.target.closest('.g-tab');
        if (!tab) return;

        Hardware.playSound('click');
        Hardware.vibrate(10);

        View.getEl('gs-tabs')
            .querySelectorAll('.g-tab')
            .forEach(item => {
                item.classList.toggle('active', item === tab);
            });

        View.renderGroupBottomSheet(tab.dataset.cat);
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
    View.getEl('ft-know').addEventListener('click', () => {
        Hardware.playSound('click');
        Hardware.vibrate(20);

        Model.state.ftState = 'C';
        View.renderStudyCard('none');

        requestAnimationFrame(() => {
            View.revealStudyAnswer();
        });
    });
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

    let wordOrderSelect =
        View.getEl('setting-word-order-mode');

    if (wordOrderSelect) {
        wordOrderSelect.addEventListener(
            'change',
            (e) => {
                Hardware.playSound('click');
                Hardware.vibrate(15);

                localStorage.setItem(
                    'wordOrderMode',
                    e.target.value
                );

                const modeNames = {
                    'weak-first': '薄弱词优先',
                    'new-first': '新词优先',
                    'original': '词库原顺序'
                };

                showToast(
                    `词汇排列已切换为${modeNames[e.target.value]}`
                );
            }
        );
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

let aiSheetClose = View.getEl('ai-sheet-close');
if (aiSheetClose) {
    aiSheetClose.addEventListener('click', () => {
        Hardware.vibrate(10);
        window.toggleModal('ai-sheet-overlay', false);
        Controller._saveCurrentChat();
        let inputEl = View.getEl('ai-chat-input');
        if (inputEl) inputEl.value = '';
    });
}
let aiSheetCopy = View.getEl('ai-sheet-copy');
if (aiSheetCopy) {
    aiSheetCopy.addEventListener('click', () => {
        Hardware.vibrate(15);
        let c = View.getEl('ai-chat-messages');
        if (c) {
            let t = '';
            c.querySelectorAll('.ai-chat-bubble-text').forEach(b => {
                t += b.innerText + '\n\n';
            });
            t = t.trim();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(t).then(() => showToast('已复制对话全文')).catch(() => showToast('复制失败，请手动选择文字'));
            } else {
                showToast('复制失败，请手动选择文字');
            }
        }
    });
}
let btnNewAIChat = View.getEl('btn-new-ai-chat');

if (btnNewAIChat) {
    btnNewAIChat.addEventListener('click', () => {
        Hardware.vibrate(15);
        Controller.openAIPresetPicker();
    });
}

let aiPresetClose =
    View.getEl('ai-preset-close');

if (aiPresetClose) {
    aiPresetClose.addEventListener(
        'click',
        () => {
            Hardware.vibrate(10);

            window.toggleModal(
                'ai-preset-overlay',
                false
            );
        }
    );
}

document
    .querySelectorAll('.ai-preset-option')
    .forEach(option => {
        option.addEventListener(
            'click',
            () => {
                Hardware.vibrate(18);

                Controller.startAITabPreset(
                    option.dataset.preset
                );
            }
        );
    });

let btnAIChatBack = View.getEl('btn-ai-chat-back');

if (btnAIChatBack) {
    /*
     * 手指按下时立即触发震动，
     * 不必等到松手后才产生反馈。
     */
    btnAIChatBack.addEventListener(
        'pointerdown',
        (event) => {
            if (
                event.pointerType === 'mouse' &&
                event.button !== 0
            ) {
                return;
            }

            Hardware.vibrate(30);
        }
    );

    btnAIChatBack.addEventListener('click', () => {
        if (
            Controller.aiTabChat.messages.length > 0 &&
            Controller.aiTabChat.activeIdx === -1
        ) {
            let conv = {
                id: Date.now(),

                date:
                    new Date().toLocaleDateString('zh-CN') +
                    ' ' +
                    new Date().toLocaleTimeString(
                        'zh-CN',
                        {
                            hour: '2-digit',
                            minute: '2-digit'
                        }
                    ),

                sentence:
                    Controller.aiTabChat.sentence || '',

                word:
                    Controller.aiTabChat.word ||
                    '自由对话',

                lang:
                    Controller.aiTabChat.lang ||
                    Model.state.currentLangMode,

                cacheKey:
                    Controller.aiTabChat.cacheKey,

                                systemPrompt:
                    Controller.aiTabChat.systemPrompt,

                presetId:
                    Controller.aiTabChat.presetId || '',

                messages: [
                    ...Controller.aiTabChat.messages
                ]
            };

            Model.aiConversations.unshift(conv);
            Controller._persistConversations();
        }

        Controller.closeAITabChat();
    });
}

let aiTabChatSend = View.getEl('ai-tab-chat-send');
if (aiTabChatSend) {
    aiTabChatSend.addEventListener('click', () => {
        Hardware.vibrate(10);
        Controller.sendAITabMessage();
    });
}
let aiTabChatInput = View.getEl('ai-tab-chat-input');

if (aiTabChatInput) {
    /*
     * 点击输入框时立即给予轻微震动。
     * 使用 pointerdown，让反馈在手指按下时发生。
     */
    aiTabChatInput.addEventListener(
        'pointerdown',
        (event) => {
            if (
                event.pointerType === 'mouse' &&
                event.button !== 0
            ) {
                return;
            }

            Hardware.vibrate(18);
        }
    );

    aiTabChatInput.addEventListener(
        'keydown',
        (e) => {
            if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                document
                    .getElementById('tab-ai-history')
                    .classList.contains('active')
            ) {
                e.preventDefault();
                Controller.sendAITabMessage();
            }
        }
    );
}
let btnClearAI = View.getEl('btn-clear-ai-history');
if (btnClearAI) {
    btnClearAI.addEventListener('click', () => {
        Hardware.vibrate(20);
        showConfirm('清空全部记录', '确定要删除所有 AI 对话记录吗？此操作不可恢复。', () => {
            Model.aiConversations = [];
            Controller._persistConversations();
            Controller.renderAIHistory();
            showToast('已清空全部对话记录');
        });
    });
}

let aiHistDetailClose = View.getEl('ai-history-detail-close');
if (aiHistDetailClose) {
    aiHistDetailClose.addEventListener('click', () => {
        Hardware.vibrate(10);
        window.toggleModal('ai-history-detail-overlay', false);
    });
}
let aiHistDetailCopy = View.getEl('ai-history-detail-copy');
if (aiHistDetailCopy) {
    aiHistDetailCopy.addEventListener('click', () => {
        Hardware.vibrate(15);
        let c = View.getEl('ai-history-detail-messages');
        if (c) {
            let t = '';
            c.querySelectorAll('.ai-chat-bubble-text').forEach(b => { t += b.innerText + '\n\n'; });
            t = t.trim();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(t).then(() => showToast('已复制对话全文')).catch(() => showToast('复制失败'));
            } else {
                showToast('复制失败');
            }
        }
    });
}
let aiChatSend = View.getEl('ai-chat-send');
if (aiChatSend) {
    aiChatSend.addEventListener('click', () => {
        Hardware.vibrate(10);
        Controller.sendAIMessage();
    });
}
let aiChatInput = View.getEl('ai-chat-input');
if (aiChatInput) {
    aiChatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            Controller.sendAIMessage();
        }
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

    const btnExport = View.getEl('btn-export-backup');

    if (btnExport) {
        btnExport.addEventListener('click', () => {
            this.exportBackup();
        });
    }

    const btnImport = View.getEl('btn-import-backup');
    const fileImport = View.getEl('file-import-backup');

    if (btnImport && fileImport) {
        btnImport.addEventListener('click', () => {
            Hardware.vibrate(15);
            fileImport.click();
        });

        fileImport.addEventListener('change', event => {
            const selectedFile = event.target.files?.[0];

            if (selectedFile) {
                this.importBackup(selectedFile);
            }

            event.target.value = '';
        });
    }

    const btnUndoImport = View.getEl('btn-undo-import');

    if (btnUndoImport) {
        btnUndoImport.addEventListener('click', () => {
            this.restorePreImportBackup();
        });
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
        let aiBtn = e.target.closest('.ai-sparkle-btn, .ai-sparkle-capsule, .ai-sparkle-icon');
if (aiBtn) {
    Hardware.vibrate(15);
    Controller.openAISheet(aiBtn.dataset.sentence, aiBtn.dataset.word, aiBtn.dataset.lang || 'ja');
    return; 
}
        // AI 内联面板关闭按钮
let aiCloseBtn = e.target.closest('.ai-inline-close-btn');
if (aiCloseBtn) {
    let panel = aiCloseBtn.closest('.ai-inline-panel');
    if (panel) panel.classList.add('hidden');
    return;
}
        let target = e.target.closest('.blur-target, .wb-blur-trigger');

        if (
            target &&
            (
                target.classList.contains('blur-text') ||
                (
                    target.parentElement &&
                    target.parentElement.classList.contains('blur-text')
                )
            )
        ) {
            let el = target.classList.contains('blur-text')
                ? target
                : target.parentElement;

            View.revealStudyElement(el);

            if (el.id === 'w-word') {
                document.querySelectorAll('#w-roots .r-text').forEach(n => {
                    View.revealStudyElement(n);
                });
            } else if (el.id === 'w-meaning') {
                document.querySelectorAll('#w-roots .r-mean').forEach(n => {
                    View.revealStudyElement(n);
                });
            } else if (el.classList.contains('r-text')) {
                let wWord = document.getElementById('w-word');

                if (wWord) {
                    View.revealStudyElement(wWord);
                }

                document.querySelectorAll('#w-roots .r-text').forEach(n => {
                    View.revealStudyElement(n);
                });
            } else if (el.classList.contains('r-mean')) {
                let wMean = document.getElementById('w-meaning');

                if (wMean) {
                    View.revealStudyElement(wMean);
                }

                document.querySelectorAll('#w-roots .r-mean').forEach(n => {
                    View.revealStudyElement(n);
                });
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
    View.getEl('import-lang-select').addEventListener('change', () => {
        this.updateImportFormatUI();
        this.updateImportFolderOptions();
    });
    View.getEl('btn-view-settings').addEventListener('click', () => { Hardware.vibrate(15); window.toggleModal('view-settings-overlay', true); document.querySelectorAll('.vs-col-btn').forEach(b => { b.onclick = () => { Hardware.vibrate(10); document.querySelectorAll('.vs-col-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); View.getEl('wb-col-select').value = b.dataset.val; View.resetWordbankRenderer(); }}); document.querySelectorAll('.vs-blur-btn').forEach(b => { b.onclick = () => { Hardware.vibrate(10); document.querySelectorAll('.vs-blur-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); View.getEl('wb-blur-select').value = b.dataset.val; View.resetWordbankRenderer(); }}); });
    View.getEl('btn-reset-progress').addEventListener('click', () => {
        Hardware.vibrate(20);
        showConfirm(
            '清空学习进度？',
            '词库、收藏、AI 对话和设置都会保留；掌握度、通关与学习记录将归零。',
            () => this.clearLearningProgress()
        );
    });
    View.getEl('btn-remove-imported').addEventListener('click', () => {
        Hardware.vibrate(20);
        showConfirm(
            '恢复内置词库？',
            '个人导入词汇和自建词库将被移除，内置日语与英语词库会重新载入。',
            () => this.restoreBuiltInLibrary()
        );
    });
    View.getEl('btn-reset').addEventListener('click', () => {
        Hardware.vibrate(30);
        showConfirm(
            '完全重置应用？',
            '<strong style="color: var(--accent-red);">此操作会删除词库改动、收藏、学习记录、AI 对话和偏好设置。</strong><br><br>DeepSeek API Key 会保留，执行前会自动建立恢复点。',
            () => this.fullResetApp()
        );
    });
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

  collectBackupPreferences() {
      const preferences = {};

      for (const key of BACKUP_PREFERENCE_KEYS) {
          const value = localStorage.getItem(key);

          if (value !== null) {
              preferences[key] = value;
          }
      }

      return preferences;
  },

  applyBackupPreferences(preferences) {
      if (
          !preferences ||
          typeof preferences !== 'object' ||
          Array.isArray(preferences)
      ) {
          return;
      }

      for (const key of BACKUP_PREFERENCE_KEYS) {
          if (
              Object.prototype.hasOwnProperty.call(
                  preferences,
                  key
              )
          ) {
              localStorage.setItem(
                  key,
                  String(preferences[key])
              );
          }
      }
  },

  buildBackupPayload(kind = 'manual') {
      const cloneValue = value => {
          return JSON.parse(
              JSON.stringify(value)
          );
      };

      return {
          format: BACKUP_FORMAT_ID,
          backupVersion: BACKUP_FORMAT_VERSION,
          schemaVersion:
              typeof DATA_SCHEMA_VERSION === 'number'
                  ? DATA_SCHEMA_VERSION
                  : 1,

          appName: '钟日',
          kind,
          exportDate: new Date().toISOString(),

          data: {
              db: cloneValue(Model.db),
              folders: cloneValue(Model.folders),
              folderLangs: cloneValue(
                  Model.folderLangs
              ),
              stars: cloneValue(Model.stars),
              records: cloneValue(Model.records),
              mtGroupClears: cloneValue(
                  Model.mtGroupClears
              ),
              mtWordClears: cloneValue(
                  Model.mtWordClears
              ),
              aiConversations: cloneValue(
                  Model.aiConversations
              )
          },

          preferences:
              this.collectBackupPreferences()
      };
  },

  normalizeBackupPayload(rawData) {
      if (
          rawData &&
          rawData.format === BACKUP_FORMAT_ID &&
          rawData.data
      ) {
          return {
              format: BACKUP_FORMAT_ID,
              backupVersion:
                  Number(rawData.backupVersion) || 5,
              schemaVersion:
                  Number(rawData.schemaVersion) || 1,
              appName: rawData.appName || '钟日',
              kind: rawData.kind || 'manual',
              exportDate:
                  rawData.exportDate || null,

              data: {
                  db: rawData.data.db,
                  folders: rawData.data.folders,
                  folderLangs:
                      rawData.data.folderLangs,
                  stars: rawData.data.stars,
                  records: rawData.data.records,
                  mtGroupClears:
                      rawData.data.mtGroupClears,
                  mtWordClears:
                      rawData.data.mtWordClears,

                  aiConversations:
                      Array.isArray(
                          rawData.data.aiConversations
                      )
                          ? rawData.data.aiConversations
                          : null
              },

              preferences:
                  rawData.preferences &&
                  typeof rawData.preferences ===
                      'object'
                      ? rawData.preferences
                      : {}
          };
      }

      /*
       * 兼容旧版 v4 备份。
       */
      if (
          rawData &&
          Array.isArray(rawData.db) &&
          Array.isArray(rawData.folders)
      ) {
          return {
              format: BACKUP_FORMAT_ID,
              backupVersion: 4,
              schemaVersion: 0,
              appName: '钟日',
              kind: 'legacy',
              exportDate:
                  rawData.exportDate || null,

              data: {
                  db: rawData.db,
                  folders: rawData.folders,
                  folderLangs:
                      rawData.folderLangs || {},
                  stars: rawData.stars || [],
                  records: rawData.records || [],
                  mtGroupClears:
                      rawData.mtGroupClears || {},
                  mtWordClears:
                      rawData.mtWordClears || {},

                  aiConversations:
                      Array.isArray(
                          rawData.aiConversations
                      )
                          ? rawData.aiConversations
                          : null
              },

              preferences:
                  rawData.preferences &&
                  typeof rawData.preferences ===
                      'object'
                      ? rawData.preferences
                      : {}
          };
      }

      throw new Error('无法识别此备份文件');
  },

  validateBackupPayload(payload) {
      if (
          !payload ||
          payload.format !== BACKUP_FORMAT_ID ||
          !payload.data
      ) {
          throw new Error('备份文件格式不正确');
      }

      if (!Array.isArray(payload.data.db)) {
          throw new Error('备份中缺少词库数据');
      }

      if (!Array.isArray(payload.data.folders)) {
          throw new Error('备份中缺少文件夹数据');
      }

      const invalidWord = payload.data.db.find(word => {
          return (
              !word ||
              typeof word !== 'object' ||
              typeof word.word !== 'string'
          );
      });

      if (invalidWord) {
          throw new Error('备份中的词汇数据不完整');
      }

      return true;
  },

  renderBackupSummary(payload) {
      const data = payload.data;

      let dateText = '未知时间';

      if (payload.exportDate) {
          const parsedDate =
              new Date(payload.exportDate);

          if (!Number.isNaN(parsedDate.getTime())) {
              dateText =
                  parsedDate.toLocaleString('zh-CN');
          }
      }

      const wordCount =
          Array.isArray(data.db)
              ? data.db.length
              : 0;

      const folderCount =
          Array.isArray(data.folders)
              ? data.folders.length
              : 0;

      const recordCount =
          Array.isArray(data.records)
              ? data.records.length
              : 0;

      const aiIncluded =
          Array.isArray(data.aiConversations);

      const aiCount =
          aiIncluded
              ? data.aiConversations.length
              : 0;

      const preferenceCount =
          payload.preferences &&
          typeof payload.preferences === 'object'
              ? Object.keys(
                    payload.preferences
                ).length
              : 0;

      return `
          <div style="
              margin-top: 12px;
              padding: 16px;
              border-radius: 18px;
              background: var(--surface);
              border: 1px solid var(--outline);
              text-align: left;
              line-height: 1.8;
          ">
              <div>
                  <strong>备份时间：</strong>
                  ${escapeHTML(dateText)}
              </div>

              <div>
                  <strong>词汇：</strong>
                  ${wordCount} 条
              </div>

              <div>
                  <strong>词库：</strong>
                  ${folderCount} 个
              </div>

              <div>
                  <strong>学习记录：</strong>
                  ${recordCount} 条
              </div>

              <div>
                  <strong>AI 对话：</strong>
                  ${
                      aiIncluded
                          ? `${aiCount} 条`
                          : '旧版备份未包含'
                  }
              </div>

              <div>
                  <strong>偏好设置：</strong>
                  ${
                      preferenceCount > 0
                          ? `${preferenceCount} 项`
                          : '未包含'
                  }
              </div>
          </div>
      `;
  },

  async storePreImportRestorePoint(kind = 'pre-import-restore') {
      const restorePoint =
          this.buildBackupPayload(kind);

      await Model.writeStorageValue(
          PRE_IMPORT_RESTORE_KEY,
          restorePoint
      );

      await this.updateRestorePointUI();

      return restorePoint;
  },

  async removePreImportRestorePoint() {
      try {
          if (
              typeof idbKeyval !== 'undefined'
          ) {
              await idbKeyval.del(
                  PRE_IMPORT_RESTORE_KEY
              );
          }
      } catch (error) {
          console.warn(
              '[Backup] 删除 IndexedDB 恢复点失败',
              error
          );
      }

      localStorage.removeItem(
          PRE_IMPORT_RESTORE_KEY
      );

      await this.updateRestorePointUI();
  },

  async updateRestorePointUI() {
      const button =
          View.getEl('btn-undo-import');

      const note =
          View.getEl('backup-restore-note');

      if (!button && !note) {
          return;
      }

      let restorePoint = null;

      try {
          restorePoint =
              await Model.readStorageValue(
                  PRE_IMPORT_RESTORE_KEY
              );
      } catch (error) {
          console.warn(
              '[Backup] 读取导入恢复点失败',
              error
          );
      }

      const hasRestorePoint =
          Boolean(
              restorePoint &&
              restorePoint.data &&
              Array.isArray(
                  restorePoint.data.db
              )
          );

      if (button) {
          button.style.display =
              hasRestorePoint
                  ? 'flex'
                  : 'none';
      }

      if (note) {
          note.style.display =
              hasRestorePoint
                  ? 'block'
                  : 'none';
      }
  },

  async applyBackupPayload(payload) {
      this.validateBackupPayload(payload);

      const data = payload.data;

      const restoredDB =
          JSON.parse(
              JSON.stringify(data.db)
          );

      const restoredFolders =
          JSON.parse(
              JSON.stringify(data.folders)
          );

      const restoredFolderLangs =
          data.folderLangs &&
          typeof data.folderLangs === 'object'
              ? JSON.parse(
                    JSON.stringify(
                        data.folderLangs
                    )
                )
              : {};

      if (restoredFolders.length === 0) {
          restoredFolders.push('默认词库');
      }

      /*
       * 补齐词库语言。
       */
      for (const folder of restoredFolders) {
          if (!restoredFolderLangs[folder]) {
              const containsEnglish =
                  restoredDB.some(word => {
                      return (
                          word.folder === folder &&
                          word.lang === 'en'
                      );
                  });

              restoredFolderLangs[folder] =
                  containsEnglish
                      ? 'en'
                      : 'ja';
          }
      }

      /*
       * 补齐旧备份中没有语言信息的词汇。
       */
      for (const word of restoredDB) {
          if (!word.lang) {
              word.lang =
                  restoredFolderLangs[
                      word.folder
                  ] || 'ja';
          }
      }

      Model.db = restoredDB;
      Model.folders = restoredFolders;
      Model.folderLangs =
          restoredFolderLangs;

      Model.stars =
          Array.isArray(data.stars)
              ? JSON.parse(
                    JSON.stringify(data.stars)
                )
              : [];

      Model.records =
          Array.isArray(data.records)
              ? JSON.parse(
                    JSON.stringify(
                        data.records
                    )
                )
              : [];

      Model.mtGroupClears =
          data.mtGroupClears &&
          typeof data.mtGroupClears ===
              'object'
              ? JSON.parse(
                    JSON.stringify(
                        data.mtGroupClears
                    )
                )
              : {};

      Model.mtWordClears =
          data.mtWordClears &&
          typeof data.mtWordClears ===
              'object'
              ? JSON.parse(
                    JSON.stringify(
                        data.mtWordClears
                    )
                )
              : {};

      /*
       * 老备份没有 AI 对话时，
       * 保留设备里现有的 AI 对话，
       * 避免导入旧文件时意外清空。
       */
      if (
          Array.isArray(
              data.aiConversations
          )
      ) {
          Model.aiConversations =
              JSON.parse(
                  JSON.stringify(
                      data.aiConversations
                  )
              );
      }

      this.applyBackupPreferences(
          payload.preferences
      );

      await Model.saveAllUserData();
  },

  async exportBackup() {
      const payload =
          this.buildBackupPayload('manual');

      const dateStamp =
          new Date()
              .toISOString()
              .slice(0, 19)
              .replace(/[T:]/g, '-');

      const fileName =
          `钟日完整备份_${dateStamp}.json`;

      const blob = new Blob(
          [
              JSON.stringify(
                  payload,
                  null,
                  2
              )
          ],
          {
              type:
                  'application/json;charset=utf-8'
          }
      );

      Hardware.playSound('success');
      Hardware.vibrate(50);

      try {
          if (
              navigator.share &&
              navigator.canShare
          ) {
              const file = new File(
                  [blob],
                  fileName,
                  {
                      type:
                          'application/json'
                  }
              );

              if (
                  navigator.canShare({
                      files: [file]
                  })
              ) {
                  await navigator.share({
                      files: [file],
                      title: '钟日数据备份',
                      text:
                          '钟日完整学习数据备份'
                  });

                  showToast('备份文件已生成');
                  return;
              }
          }
      } catch (error) {
          if (error?.name === 'AbortError') {
              showToast('已取消导出');
              return;
          }

          console.warn(
              '[Backup] 系统分享失败，改用下载',
              error
          );
      }

      this.fallbackDownload(
          blob,
          fileName
      );
  },

  fallbackDownload(blob, fileName) {
      const url =
          URL.createObjectURL(blob);

      const anchor =
          document.createElement('a');

      anchor.style.display = 'none';
      anchor.href = url;
      anchor.download = fileName;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => {
          URL.revokeObjectURL(url);
      }, 1000);

      showToast('备份文件已生成');
  },

  async importBackup(file) {
      if (!file) {
          return;
      }

      if (file.size > 25 * 1024 * 1024) {
          Hardware.playSound('error');
          Hardware.vibrate(50);
          showToast('备份文件过大');
          return;
      }

      try {
          const fileText =
              await file.text();

          const rawData =
              JSON.parse(fileText);

          const payload =
              this.normalizeBackupPayload(
                  rawData
              );

          this.validateBackupPayload(
              payload
          );

          const summary =
              this.renderBackupSummary(
                  payload
              );

          showConfirm(
              '确认导入这份备份？',
              `
                  ${summary}

                  <div style="
                      margin-top: 14px;
                      color: var(--accent-red);
                      font-size: 0.86rem;
                      line-height: 1.65;
                  ">
                      当前词库和学习进度将被替换。
                      导入前会自动保存恢复点，
                      可以通过“撤销上次导入”恢复。
                  </div>
              `,
              async () => {
                  showToast('正在恢复数据…');

                  let restorePoint = null;

                  try {
                      restorePoint =
                          await this
                              .storePreImportRestorePoint();

                      await this.applyBackupPayload(
                          payload
                      );

                      Hardware.playSound(
                          'success'
                      );

                      Hardware.vibrate(100);

                      showToast('数据恢复成功');

                      window.setTimeout(() => {
                          location.reload();
                      }, 900);
                  } catch (error) {
                      console.error(
                          '[Backup] 导入失败',
                          error
                      );

                      if (restorePoint) {
                          try {
                              await this
                                  .applyBackupPayload(
                                      restorePoint
                                  );

                              showToast(
                                  '导入失败，已恢复原数据'
                              );
                          } catch (
                              restoreError
                          ) {
                              console.error(
                                  '[Backup] 自动恢复失败',
                                  restoreError
                              );

                              showToast(
                                  '导入和自动恢复均失败'
                              );
                          }
                      } else {
                          showToast(
                              '导入失败，未修改数据'
                          );
                      }

                      Hardware.playSound(
                          'error'
                      );

                      Hardware.vibrate(50);
                  }
              }
          );
      } catch (error) {
          console.error(
              '[Backup] 读取备份失败',
              error
          );

          Hardware.playSound('error');
          Hardware.vibrate(50);

          showToast(
              error?.message ||
              '无法读取备份文件'
          );
      }
  },

  async restorePreImportBackup() {
      let restorePoint = null;

      try {
          restorePoint =
              await Model.readStorageValue(
                  PRE_IMPORT_RESTORE_KEY
              );
      } catch (error) {
          console.error(
              '[Backup] 读取恢复点失败',
              error
          );
      }

      if (
          !restorePoint ||
          !restorePoint.data ||
          !Array.isArray(
              restorePoint.data.db
          )
      ) {
          showToast('没有可用的恢复点');
          await this.updateRestorePointUI();
          return;
      }

      const summary =
          this.renderBackupSummary(
              restorePoint
          );

      showConfirm(
          '撤销上次数据操作？',
          `
              ${summary}

              <div style="
                  margin-top: 14px;
                  color: var(--accent-red);
                  font-size: 0.86rem;
                  line-height: 1.65;
              ">
                  将恢复到上次导入或重置之前的状态。
              </div>
          `,
          async () => {
              /*
               * 先在内存中保存当前状态。
               * 如果撤销过程失败，仍能恢复回来。
               */
              const currentSafetyCopy =
                  this.buildBackupPayload(
                      'before-undo-data-operation'
                  );

              try {
                  showToast(
                      '正在恢复数据操作前的状态…'
                  );

                  await this.applyBackupPayload(
                      restorePoint
                  );

                  await this
                      .removePreImportRestorePoint();

                  Hardware.playSound(
                      'success'
                  );

                  Hardware.vibrate(100);

                  showToast(
                      '已撤销上次数据操作'
                  );

                  window.setTimeout(() => {
                      location.reload();
                  }, 900);
              } catch (error) {
                  console.error(
                      '[Backup] 撤销数据操作失败',
                      error
                  );

                  try {
                      await this.applyBackupPayload(
                          currentSafetyCopy
                      );

                      showToast(
                          '撤销失败，已保留当前数据'
                      );
                  } catch (
                      restoreError
                  ) {
                      console.error(
                          '[Backup] 保留当前数据失败',
                          restoreError
                      );

                      showToast(
                          '数据恢复出现严重错误'
                      );
                  }

                  Hardware.playSound('error');
                  Hardware.vibrate(50);
              }
          }
      );
  },

    startPendulum(launchMode = 'pendulum') {
    const currentLang = Model.state.currentLangMode;

    const defFolder =
        Model.folders.find(folder => {
            return (Model.folderLangs[folder] || 'ja') === currentLang;
        }) || '默认词库';

    const defCat =
        defFolder === '默认词库'
            ? 'default'
            : defFolder;

    let groupKey =
        Model.state.currentGroupKey ||
        localStorage.getItem('lastCustomGroupVal') ||
        `group|${defCat}|0`;

    let [prefix, catName, indexText] = groupKey.split('|');
    let groupIndex = Number.parseInt(indexText, 10);

    if (
        prefix !== 'group' ||
        !Number.isInteger(groupIndex) ||
        groupIndex < 0
    ) {
        catName = defCat;
        groupIndex = 0;
        groupKey = `group|${defCat}|0`;
    }

    const GROUP_SIZE = 10;
const GROUP_STEP = 7;
const startIdx = groupIndex * GROUP_STEP;

    const groupWords = Model.db
        .map((w, i) => ({ w, i }))
        .filter(item => {
            const wordLang = item.w.lang || 'ja';

            return (
                wordLang === currentLang &&
                Model.checkFilter(item.w, catName)
            );
        });

    const sourceWords = groupWords.slice(
        startIdx,
        startIdx + GROUP_SIZE
    );

    if (sourceWords.length === 0) {
        return showToast('所选范围内暂无词汇哦');
    }

    const virtualLabels = {
        virtual_cleared: '完全通关',
        virtual_uncleared: '所有未通关',
        virtual_miss_kanji:
            currentLang === 'en'
                ? '未掌握拼写'
                : '未了解汉字',
        virtual_miss_kana:
            currentLang === 'en'
                ? '未掌握听力'
                : '未了解读音',
        virtual_miss_meaning: '未了解释义',
        virtual_starred: '收藏'
    };

    const categoryLabel =
        catName === 'default'
            ? '默认词库'
            : (virtualLabels[catName] || catName);

    const actualEnd = startIdx + sourceWords.length;

    const groupLabel =
        `${categoryLabel} (第 ${startIdx + 1}-${actualEnd} 词)`;

    Model.state.currentGroupKey = groupKey;
    Model.state.currentGroupLabel = groupLabel;

    const groupText = View.getEl('custom-group-text');
    if (groupText) {
        groupText.innerText = groupLabel;
    }

    localStorage.setItem('lastCustomGroupVal', groupKey);
    localStorage.setItem('lastCustomGroupTxt', groupLabel);
    Hardware.playSound('click'); 
    Model.state.mode = launchMode; Model.state.currentIndex = 0; Model.state.dtWordAppearanceMap = {}; Model.state.mtStep = 1; Model.state.currentWordFailed = false; Model.state.comboCount = 0; Model.state.maxProgressSeen = 0; Model.state.uniqueWordCount = sourceWords.length;
    if (launchMode === 'memory-test') { Model.state.mtRound = 1; Model.state.mtBaseQueue = sourceWords.map(x => x.i); Model.state.studyQueue = [...Model.state.mtBaseQueue].sort(() => Math.random() - 0.5); Model.state.totalTestWords = Model.state.studyQueue.length; } 
    else { Model.state.studyQueue = []; let len = sourceWords.length; for (let i = 0; i < len; i++) { Model.state.studyQueue.push(sourceWords[i].i); for (let j = i - 1; j >= 0; j--) Model.state.studyQueue.push(sourceWords[j].i); for (let k = 1; k <= i; k++) Model.state.studyQueue.push(sourceWords[k].i); } }
    Model.state.initialQueueLength = (launchMode === 'memory-test') ? Model.state.mtBaseQueue.length : Model.state.studyQueue.length;
    View.updateComboBadge();
    const modeSelect = View.getEl('next-display-mode');
    let savedMode = localStorage.getItem('displayMode') || 'all';
    const isEnglishRote = currentLang === 'en' && launchMode === 'rote-learning';

    if (modeSelect) {
        if (isEnglishRote) {
            modeSelect.options[0].text = '全显预览';
            modeSelect.options[0].style.display = 'none';
            modeSelect.options[1].text = '拼写强化';
            modeSelect.options[2].text = '听力强化';
            modeSelect.options[3].text = '释义强化';

            if (!['word', 'kana', 'meaning'].includes(savedMode)) {
                savedMode = 'word';
                localStorage.setItem('displayMode', savedMode);
            }
        } else {
            modeSelect.options[0].text = '全显';
            modeSelect.options[0].style.display = '';
            modeSelect.options[1].text = currentLang === 'en' ? '英文' : '汉字';
            modeSelect.options[2].text = currentLang === 'en' ? '音标' : '假名';
            modeSelect.options[3].text = '释义';
        }

        modeSelect.value = savedMode;
        modeSelect.dispatchEvent(new Event('facade-update'));
    }
    View.showPage('study-area'); let c = View.getEl('pixel-matrix'); c.innerHTML=''; View.renderStudyCard('none'); Hardware.vibrate(40);
  },

  buildFilterTestQueue(rawQueue) {
      const savedMode =
          localStorage.getItem('wordOrderMode');

      const orderMode =
          ['weak-first', 'new-first', 'original']
              .includes(savedMode)
              ? savedMode
              : 'weak-first';

      const queue = [...rawQueue];

      if (orderMode === 'original') {
          return queue;
      }

      const newWords = [];
      const weakWords = [];
      const clearedWords = [];

      queue.forEach(idx => {
          const word = Model.db[idx];

          if (!word) {
              return;
          }

          const status =
              Model.mtWordClears[word.word];

          if (
              !status ||
              typeof status !== 'object'
          ) {
              newWords.push(idx);
              return;
          }

          const masteredCount = [
              status.kanji,
              status.kana,
              status.meaning
          ].filter(Boolean).length;

          if (status.needsReview === true) {
              weakWords.push(idx);
          } else if (masteredCount === 0) {
              newWords.push(idx);
          } else if (masteredCount === 3) {
              clearedWords.push(idx);
          } else {
              weakWords.push(idx);
          }
      });

      const shuffle = list => {
          return [...list].sort(
              () => Math.random() - 0.5
          );
      };

      if (orderMode === 'new-first') {
          return [
              ...shuffle(newWords),
              ...shuffle(weakWords),
              ...shuffle(clearedWords)
          ];
      }

      return [
          ...shuffle(weakWords),
          ...shuffle(newWords),
          ...shuffle(clearedWords)
      ];
  },

  startFilterTest() {
      let sel = View.getEl('test-range-select'); let cat = sel.value; if (!cat) return;
      let displayMode = View.getEl('test-display-select').value || 'kana';
      let isSkipEnabled = localStorage.getItem('skipMastered') === 'true';

      let sourceWords = Model.db
          .map((w, i) => ({ w, i }))
          .filter(item => {
          let wordLang = item.w.lang || 'ja';

          if (wordLang !== Model.state.currentLangMode) {
              return false;
          }

          let inRange =
              cat === 'all'
                  ? true
                  : Model.checkFilter(item.w, cat);

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
      Model.state.mode = 'filter-test'; Model.state.currentIndex = 0; Model.state.ftState = 'A'; Model.state.ftHint = null; Model.state.ftShowKanaHint = false; Model.state.maxProgressSeen = 0;
      
      const rawQueue =
          sourceWords.map(x => x.i);

      Model.state.studyQueue =
          this.buildFilterTestQueue(rawQueue);
      
      View.updateComboBadge(); View.showPage('study-area'); let c = View.getEl('pixel-matrix'); c.innerHTML=''; View.renderStudyCard('none'); Hardware.vibrate(40);
  },

    processFilterTestResult(isCorrect) {
      if (Model.state.isAnimating) return;
      Model.state.isAnimating = true;

      let w = Model.db[Model.state.studyQueue[Model.state.currentIndex]];
      let wordKey = w.word;
      const isEnglish = w.lang === 'en';

      if (
          !Model.mtWordClears[wordKey] ||
          typeof Model.mtWordClears[wordKey] !== 'object'
      ) {
          Model.mtWordClears[wordKey] = {
              kanji: false,
              kana: false,
              meaning: false
          };
      }

      let mode = View.getEl('test-display-select').value || 'kana';

      if (isEnglish && mode === 'kana') {
          mode = 'word';
      }

      if (isCorrect) {
          if (mode === 'word') {
              Model.mtWordClears[wordKey].kanji = true;
          } else if (mode === 'kana' || mode === 'audio') {
              Model.mtWordClears[wordKey].kana = true;
          } else if (mode === 'meaning') {
              Model.mtWordClears[wordKey].meaning = true;
          }

          if (
              Model.mtWordClears[wordKey].kana &&
              Model.mtWordClears[wordKey].meaning
          ) {
              Model.mtWordClears[wordKey].kanji = true;
          }

          if (
              Model.mtWordClears[wordKey].kanji &&
              Model.mtWordClears[wordKey].meaning
          ) {
              Model.mtWordClears[wordKey].kana = true;
          }

          if (
              Model.mtWordClears[wordKey].kanji &&
              Model.mtWordClears[wordKey].kana
          ) {
              Model.mtWordClears[wordKey].meaning = true;
          }

          if (
              Model.mtWordClears[wordKey].kanji &&
              Model.mtWordClears[wordKey].kana &&
              Model.mtWordClears[wordKey].meaning
          ) {
              Model.mtWordClears[wordKey].needsReview =
                  false;
          }
      } else {
          Model.mtWordClears[wordKey].needsReview =
              true;

          if (mode === 'word') {
              Model.mtWordClears[wordKey].kanji = false;
          } else if (mode === 'kana' || mode === 'audio') {
              Model.mtWordClears[wordKey].kana = false;
          } else if (mode === 'meaning') {
              Model.mtWordClears[wordKey].meaning = false;
          }
      }

      Model.saveClears();
      View.playStudyFeedback(isCorrect ? 'correct' : 'wrong');

      window.setTimeout(() => {
          Model.state.currentIndex++;
          Model.state.ftState = 'A';
          Model.state.ftHint = null;
          Model.state.ftShowKanaHint = false;

          if (Model.state.currentIndex >= Model.state.studyQueue.length) {
              Model.state.isAnimating = false;
              Hardware.playSound('success');
              Hardware.vibrate(1000);
              showToast('恭喜，全部靶向检验完成！');
              View.getEl('btn-exit-study').click();
          } else {
              View.renderStudyCard('next');
          }
      }, isCorrect ? 380 : 320);
  },

  handleSpellConfirm(inputEl, wObj, displayMode) {
      if (Model.state.isAnimating) return;

      const isEnglish = wObj.lang === 'en';
      const isEnglishRote =
          isEnglish && Model.state.mode === 'rote-learning';

      let targetClean;
      let inputClean;

      if (isEnglish) {
          targetClean = (wObj.word || '').toLowerCase().trim();
          inputClean = (EnglishInput.buffer || '').toLowerCase().trim();
      } else {
          targetClean = (wObj.kana || '').replace(/[【】\[\]()]/g, '');
          inputClean = RomajiEngine.getFinalText();
      }

      if (!inputClean) return;

      if (inputClean === targetClean) {
          Model.state.isAnimating = true;
          Hardware.playSound('success');
          Hardware.vibrate(50);
          View.playStudyFeedback('correct');

          Model.state.comboCount++;
          View.updateComboBadge();

          if (isEnglishRote) {
              View.showEnglishRoteFullCard(wObj);
              EnglishInput.reset();

              setTimeout(() => {
                  Model.state.mtStep = 2;
                  Model.state.isAnimating = false;
                  View.renderMemoryTestUI(wObj, displayMode);
              }, 700);
              return;
          }

          let wWord = View.getEl('w-word');
          let wKana = View.getEl('w-kana');
          let wMeaning = View.getEl('w-meaning');

          if (wWord) {
              wWord.innerText = wObj.word || '';
              wWord.style.display = 'block';
          }

          if (wKana) {
              wKana.innerText = isEnglish
                  ? (wObj.phonetic || '')
                  : (wObj.kana || '');
              wKana.style.display = 'block';
          }

          if (wMeaning) {
              wMeaning.innerText = wObj.meaning || '';
              wMeaning.style.display = 'block';
          }

          View.syncRootsDisplay();
          View.revealStudyAnswer();

          if (Model.state.mode === 'dual-track') {
              setTimeout(() => this.dtAdvanceNext(), 420);
          } else if (Model.state.mode === 'memory-test') {
              if (!isEnglish) {
                  View.getEl('w-kana').innerText = wObj.kana;
                  View.getEl('w-kana').style.display = 'block';
              }
              setTimeout(() => this.mtAdvanceNext(), 600);
          } else {
              if (
                  !isEnglish &&
                  (displayMode === 'word' || displayMode === 'meaning')
              ) {
                  View.getEl('w-kana').innerText = wObj.kana;
              }

              setTimeout(() => {
                  Model.state.mtStep = 2;
                  Model.state.isAnimating = false;
                  View.renderMemoryTestUI(wObj, displayMode);
              }, 500);
          }

          if (isEnglish) EnglishInput.reset();
          return;
      }

      Hardware.playSound('error');
      Hardware.vibrate(60);
      View.playStudyFeedback('wrong');

      inputEl.classList.remove('shake-anim');
      void inputEl.offsetWidth;
      inputEl.classList.add('shake-anim', 'error-state');

      Model.state.comboCount = Math.max(0, Model.state.comboCount - 3);
      View.updateComboBadge();
      Model.state.currentWordFailed = true;

      Model.state.spellFailCount =
          (Model.state.spellFailCount || 0) + 1;

      if (Model.state.spellFailCount >= 2) {
          let activeKbId = Model.state.mode === 'dual-track'
              ? 'dt-spell-keyboard'
              : 'mt-spell-keyboard';
          let hintWrap = View.getEl(activeKbId + '-hint-wrap');
          if (hintWrap) hintWrap.classList.add('show');
      }

      if (isEnglishRote && Model.state.spellFailCount >= 3) {
          Hardware.unlockSpeech();
          Hardware.speakWord(wObj);
      }
  },

  handleDtChoiceClick(btn, isCorrect) {
      if (Model.state.isAnimating) return;
      if (isCorrect) {
          Model.state.isAnimating = true;
          btn.classList.add('correct');
          Hardware.playSound('success');
          Hardware.vibrate(40);
          View.playStudyFeedback('correct');

          Model.state.comboCount++;
          View.updateComboBadge();
          
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
          Hardware.playSound('error');
          Hardware.vibrate(50);
          View.playStudyFeedback('wrong');

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

      if (!isCorrect) {
          Hardware.playSound('error');
          Hardware.vibrate(50);
          View.playStudyFeedback('wrong');

          btn.classList.remove('shake-anim', 'wrong');
          void btn.offsetWidth;
          btn.classList.add('shake-anim', 'wrong');

          Model.state.comboCount = Math.max(
              0,
              Model.state.comboCount - 3
          );
          View.updateComboBadge();
          Model.state.currentWordFailed = true;
          return;
      }

      Model.state.isAnimating = true;
      btn.classList.add('correct');
      Hardware.playSound('success');
      Hardware.vibrate(40);
      View.playStudyFeedback('correct');

      Model.state.comboCount++;
      View.updateComboBadge();

      const disableChoiceButtons = () => {
          document
              .querySelectorAll('#mt-choice-buttons .dt-choice-btn')
              .forEach(button => {
                  button.style.pointerEvents = 'none';
              });
      };

      if (Model.state.mode === 'memory-test') {
          let round = Model.state.mtRound;
          let step = Model.state.mtStep;

          if (round === 1) {
              View.getEl('w-meaning').innerText = wObj.meaning;
              View.getEl('w-meaning').style.display = 'block';
              View.syncRootsDisplay();
              View.revealStudyElement(View.getEl('w-meaning'));
              disableChoiceButtons();
              setTimeout(() => this.mtAdvanceNext(), 800);
          } else if (round === 2 && step === 1) {
              View.getEl('w-word').innerText = wObj.word;
              View.getEl('w-word').style.display = 'block';
              View.syncRootsDisplay();
              View.revealStudyElement(View.getEl('w-word'));

              setTimeout(() => {
                  Model.state.mtStep = 2;
                  Model.state.isAnimating = false;
                  View.renderMemoryTestUI(wObj, displayMode);
              }, 600);
          } else if (round === 3 && step === 1) {
              View.getEl('w-meaning').innerText = wObj.meaning;
              View.getEl('w-meaning').style.display = 'block';
              View.syncRootsDisplay();
              View.revealStudyElement(View.getEl('w-meaning'));

              setTimeout(() => {
                  Model.state.mtStep = 2;
                  Model.state.isAnimating = false;
                  View.renderMemoryTestUI(wObj, displayMode);
              }, 600);
          } else if (round === 3 && step === 2) {
              View.getEl('w-word').innerText = wObj.word;
              View.getEl('w-word').style.display = 'block';
              View.syncRootsDisplay();
              View.revealStudyElement(View.getEl('w-word'));
              disableChoiceButtons();
              setTimeout(() => this.mtAdvanceNext(), 800);
          }
          return;
      }

      const isEnglishRote =
          wObj.lang === 'en' &&
          Model.state.mode === 'rote-learning';

      if (isEnglishRote) {
          const step = Model.state.mtStep;
          const blindAudioUi = View.getEl('mt-blind-audio-ui');
          const phoneticEl = View.getEl('w-kana');
          const meaningEl = View.getEl('w-meaning');
          const typeEl = View.getEl('w-type');

          disableChoiceButtons();

          if (step === 1) {
              if (displayMode === 'kana') {
                  if (blindAudioUi) blindAudioUi.classList.add('hidden');
                  View.setEnglishCardWord(wObj, false, true);

                  if (phoneticEl) {
                      phoneticEl.innerText = wObj.phonetic || '';
                      phoneticEl.style.display = 'block';
                  }
                  if (typeEl) typeEl.style.display = 'flex';

                  View.revealStudyElement(View.getEl('w-word'));
                  View.revealStudyElement(phoneticEl);
              } else if (displayMode === 'meaning') {
                  if (meaningEl) {
                      meaningEl.innerText = wObj.meaning || '';
                      meaningEl.style.display = 'block';
                      View.revealStudyElement(meaningEl);
                  }
              }

              setTimeout(() => {
                  Model.state.mtStep = 2;
                  Model.state.isAnimating = false;
                  View.renderEnglishRoteUI(wObj, displayMode);
              }, 650);
              return;
          }

          View.showEnglishRoteFullCard(wObj);
          setTimeout(() => this.mtAdvanceNext(), 850);
          return;
      }

      if (Model.state.mtStep === 1) {
          View.getEl('w-word').innerText = wObj.word;
          View.syncRootsDisplay();
          View.revealStudyElement(View.getEl('w-word'));

          setTimeout(() => {
              Model.state.mtStep = 2;
              Model.state.isAnimating = false;
              View.renderMemoryTestUI(wObj, displayMode);
          }, 600);
      } else {
          if (displayMode === 'word' || displayMode === 'kana') {
              View.getEl('w-meaning').innerText = wObj.meaning;
          } else if (displayMode === 'meaning') {
              View.getEl('w-word').innerText = wObj.word;
          }

          View.syncRootsDisplay();
          View.getEl('w-example-box').style.display = 'block';
          disableChoiceButtons();
          setTimeout(() => this.mtAdvanceNext(), 800);
      }
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

      const folderFilter =
          View.getEl('wb-folder-filter');

      const filter = folderFilter.value;

      const builtInEnglishFolders =
          typeof DefaultEnglishWords !== 'undefined'
              ? [
                    ...new Set(
                        DefaultEnglishWords
                            .map(word => word.folder)
                            .filter(Boolean)
                    )
                ]
              : [];

      const builtInFolders = new Set([
          '默认词库',
          ...builtInEnglishFolders
      ]);

      if (
          filter === 'all' ||
          builtInFolders.has(filter) ||
          filter.startsWith('virtual_')
      ) {
          return showToast('内置分类不可删除');
      }

      const folderWords = Model.db.filter(word => {
          return word.folder === filter;
      });

      const folderLang =
          Model.folderLangs[filter] ||
          folderWords.find(word => word.lang)?.lang ||
          Model.state.currentLangMode ||
          'ja';

      const englishFallbackFolder =
          builtInEnglishFolders.find(folder => {
              return Model.folders.includes(folder);
          }) ||
          Model.folders.find(folder => {
              return (
                  folder !== filter &&
                  Model.folderLangs[folder] === 'en'
              );
          }) ||
          '英语词库';

      const mainFallbackFolder =
          folderLang === 'en'
              ? englishFallbackFolder
              : '默认词库';

      showConfirm(
          '删除文件夹',
          `确定要删除「${filter}」吗？里面的 ${folderWords.length} 个单词会自动移至同语言的默认词库「${mainFallbackFolder}」。`,
          () => {
              if (Model.state.batchMode) {
                  this.toggleBatchMode();
              }

              if (!Model.folders.includes('默认词库')) {
                  Model.folders.unshift('默认词库');
              }

              Model.folderLangs['默认词库'] = 'ja';

              const hasEnglishWord =
                  folderWords.some(word => {
                      return (
                          word.lang === 'en' ||
                          (
                              !word.lang &&
                              folderLang === 'en'
                          )
                      );
                  });

              if (hasEnglishWord) {
                  if (
                      !Model.folders.includes(
                          englishFallbackFolder
                      )
                  ) {
                      Model.folders.push(
                          englishFallbackFolder
                      );
                  }

                  Model.folderLangs[
                      englishFallbackFolder
                  ] = 'en';
              }

              Model.db.forEach(word => {
                  if (word.folder !== filter) {
                      return;
                  }

                  const wordLang =
                      word.lang || folderLang;

                  word.lang = wordLang;

                  word.folder =
                      wordLang === 'en'
                          ? englishFallbackFolder
                          : '默认词库';
              });

              Model.folders =
                  Model.folders.filter(folder => {
                      return folder !== filter;
                  });

              delete Model.folderLangs[filter];

              Model.saveFolders();
              Model.saveFolderLangs();
              Model.saveDB();

              folderFilter.value = 'all';

              localStorage.setItem(
                  'lastSelectedFolder',
                  'all'
              );

              folderFilter.dispatchEvent(
                  new Event('facade-update')
              );

              View.updateWordbankUI();
              View.resetWordbankRenderer();

              showToast(
                  '已删除，单词已按语言归档'
              );
          }
      );
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
    initializeImportPanel() {
      const langSelect = View.getEl('import-lang-select');
      if (!langSelect) return;

      langSelect.value = Model.state.currentLangMode === 'en' ? 'en' : 'ja';
      langSelect.dispatchEvent(new Event('facade-update'));
      this.updateImportFormatUI();
      this.updateImportFolderOptions();
  },

  updateImportFormatUI() {
      const lang = View.getEl('import-lang-select')?.value || 'ja';
      const formatText = View.getEl('import-format-text');
      const formatNote = View.getEl('import-format-note');
      const textarea = View.getEl('custom-input');

      if (lang === 'en') {
          if (formatText) formatText.textContent = '单词,音标,词性,释义,例句,词根';
          if (formatNote) formatNote.textContent = '前四项必填，例句和词根可选；例句含逗号时建议使用 Tab 分隔。';
          if (textarea) textarea.placeholder = 'abandon,/əˈbændən/,动词,放弃,They abandoned the plan.,a(去)-bandon(控制)';
      } else {
          if (formatText) formatText.textContent = '单词,假名,词性,释义,例句';
          if (formatNote) formatNote.textContent = '前四项必填，例句可选；例句含逗号时建议使用 Tab 分隔。';
          if (textarea) textarea.placeholder = '勉強,べんきょう,名・サ变,学习,毎日日本語を勉強する。';
      }
  },

  updateImportFolderOptions() {
      const lang = View.getEl('import-lang-select')?.value || 'ja';
      const select = View.getEl('import-folder-select');
      if (!select) return;

      const oldValue = select.value;
      const folders = Model.folders.filter(folder => {
          return (Model.folderLangs[folder] || 'ja') === lang;
      });

      select.innerHTML = '';

      if (folders.length === 0) {
          const option = document.createElement('option');
          option.value = '';
          option.textContent = lang === 'en' ? '暂无英语词库' : '暂无日语词库';
          select.appendChild(option);
          select.disabled = true;
      } else {
          select.disabled = false;
          folders.forEach(folder => {
              const option = document.createElement('option');
              option.value = folder;
              option.textContent = folder;
              select.appendChild(option);
          });
          select.value = folders.includes(oldValue) ? oldValue : folders[0];
      }

      select.dispatchEvent(new Event('facade-update'));
  },

  getImportIdentity(word) {
      const lang = word.lang || Model.folderLangs[word.folder] || 'ja';
      const name = lang === 'en'
          ? String(word.word || '').trim().toLowerCase()
          : String(word.word || '').trim();
      return `${lang}::${word.folder || ''}::${name}`;
  },

  importWords() {
      Hardware.playSound('click');
      Hardware.vibrate(15);

      const text = View.getEl('custom-input')?.value.trim() || '';
      const lang = View.getEl('import-lang-select')?.value || 'ja';
      const folder = View.getEl('import-folder-select')?.value || '';
      const duplicateMode = View.getEl('import-duplicate-mode')?.value || 'skip';

      if (!text) return showToast('请先粘贴词汇');
      if (!folder) return showToast('当前语言没有可用词库');

      const lines = text.split(/\r?\n/)
          .map((line, index) => ({ text: line.trim(), number: index + 1 }))
          .filter(item => item.text);

      const existingSet = new Set(Model.db.map(word => this.getImportIdentity(word)));
      const inputSet = new Set();
      const entries = [];
      const errors = [];
      let duplicateCount = 0;

      lines.forEach(item => {
          const parts = (item.text.includes('\t')
              ? item.text.split('\t')
              : item.text.split(/[,，]/)
          ).map(part => part.trim());

          if (parts.length < 4) {
              errors.push(`第 ${item.number} 行：只识别到 ${parts.length} 项，至少需要 4 项`);
              return;
          }

          const [word, reading, type, meaning] = parts;
          if (!word) return errors.push(`第 ${item.number} 行：缺少单词`);
          if (!type) return errors.push(`第 ${item.number} 行：缺少词性`);
          if (!meaning) return errors.push(`第 ${item.number} 行：缺少释义`);

          let example = '';
          let roots = '';

          if (lang === 'en') {
              if (parts.length === 5) example = parts[4];
              if (parts.length >= 6) {
                  example = parts.slice(4, -1).join(',');
                  roots = parts[parts.length - 1];
              }
          } else if (parts.length >= 5) {
              example = parts.slice(4).join(',');
          }

          const wordData = {
              word,
              type,
              meaning,
              example,
              folder,
              lang,
              isImported: true,
              importedAt: new Date().toISOString(),
              srs: { ease: 2.5, interval: 0, nextReview: Date.now() }
          };

          if (lang === 'en') {
              wordData.phonetic = reading;
              wordData.roots = roots;
          } else {
              wordData.kana = reading;
              wordData.roots = '';
          }

          const identity = this.getImportIdentity(wordData);
          const isDuplicate = existingSet.has(identity) || inputSet.has(identity);
          if (isDuplicate) duplicateCount++;
          inputSet.add(identity);
          entries.push({ wordData, identity, isDuplicate });
      });

      const actionableEntries = duplicateMode === 'skip'
          ? entries.filter(entry => !entry.isDuplicate)
          : entries;

      const previewRows = entries.slice(0, 5).map(entry => {
          const word = entry.wordData;
          const reading = lang === 'en' ? (word.phonetic || '无音标') : (word.kana || '无假名');
          const tag = entry.isDuplicate ? '<span style="color:#a86f31;">重复</span>' : '<span style="color:var(--tertiary);">可导入</span>';
          return `<div style="display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid var(--outline);"><span><strong>${escapeHTML(word.word)}</strong>　${escapeHTML(reading)}</span>${tag}</div>`;
      }).join('');

      const errorRows = errors.slice(0, 6).map(error => {
          return `<div style="margin-top:7px;color:var(--accent-red);font-size:.8rem;">${escapeHTML(error)}</div>`;
      }).join('');

      const modeText = {
          skip: '重复词会被跳过',
          overwrite: '重复词会覆盖原内容',
          keep: '重复词会被保留；同名单词可能共享收藏与掌握进度'
      }[duplicateMode];

      const summary = `
          <div style="text-align:left;line-height:1.7;">
              <div style="padding:14px;border-radius:16px;background:var(--surface);border:1px solid var(--outline);">
                  <strong>共识别 ${lines.length} 行</strong><br>
                  可处理 ${actionableEntries.length} 词 · 重复 ${duplicateCount} · 错误 ${errors.length}<br>
                  <span style="font-size:.82rem;opacity:.72;">${modeText}</span>
              </div>
              <div style="margin-top:12px;">${previewRows || '<span style="opacity:.65;">没有识别到有效词条</span>'}</div>
              ${entries.length > 5 ? `<div style="margin-top:8px;font-size:.78rem;opacity:.6;">另有 ${entries.length - 5} 个有效词条未展示</div>` : ''}
              ${errorRows}
              ${errors.length > 6 ? `<div style="margin-top:7px;color:var(--accent-red);font-size:.8rem;">另有 ${errors.length - 6} 行错误</div>` : ''}
          </div>
      `;

      if (actionableEntries.length === 0) {
          showConfirm('没有可导入的词汇', summary, () => {});
          return;
      }

      showConfirm('确认导入这些词汇？', summary, async () => {
          let restorePoint = null;

          try {
              restorePoint = await this.storePreImportRestorePoint('pre-import-restore');
              const liveMap = new Map();
              Model.db.forEach((word, index) => liveMap.set(this.getImportIdentity(word), index));

              let added = 0;
              let updated = 0;
              let skipped = 0;

              entries.forEach(entry => {
                  const existingIndex = liveMap.has(entry.identity) ? liveMap.get(entry.identity) : -1;

                  if (existingIndex >= 0 && duplicateMode === 'skip') {
                      skipped++;
                      return;
                  }

                  if (existingIndex >= 0 && duplicateMode === 'overwrite') {
                      const oldWord = Model.db[existingIndex];
                      const { isImported, importedAt, ...fields } = entry.wordData;
                      Object.assign(oldWord, fields);
                      if (oldWord.isImported === true) oldWord.importedAt = importedAt;
                      updated++;
                      return;
                  }

                  Model.db.push({ ...entry.wordData });
                  if (duplicateMode !== 'keep') liveMap.set(entry.identity, Model.db.length - 1);
                  added++;
              });

              await Model.saveDB();
              View.getEl('custom-input').value = '';
              View.updateWordbankUI();
              View.resetWordbankRenderer();
              await this.updateRestorePointUI();

              Hardware.playSound('success');
              Hardware.vibrate(100);

              const result = [];
              if (added) result.push(`新增 ${added} 词`);
              if (updated) result.push(`覆盖 ${updated} 词`);
              if (skipped) result.push(`跳过 ${skipped} 词`);
              showToast(result.join('，') || '没有需要写入的词汇');
          } catch (error) {
              console.error('[Import] 导入失败', error);
              if (restorePoint) {
                  try {
                      await this.applyBackupPayload(restorePoint);
                      showToast('导入失败，已恢复原数据');
                  } catch (restoreError) {
                      console.error('[Import] 自动恢复失败', restoreError);
                      showToast('导入失败，自动恢复也失败');
                  }
              } else {
                  showToast('导入失败，未修改数据');
              }
              Hardware.playSound('error');
              Hardware.vibrate(50);
          }
      });
  },

  getDefaultLibraryState() {
      const db = DefaultWords.map(word => ({ ...JSON.parse(JSON.stringify(word)), folder: '默认词库', lang: 'ja' }));
      const folders = ['默认词库'];
      const folderLangs = { '默认词库': 'ja' };

      if (typeof DefaultEnglishWords !== 'undefined') {
          DefaultEnglishWords.forEach(word => {
              const cloned = { ...JSON.parse(JSON.stringify(word)), lang: 'en' };
              cloned.folder = cloned.folder || '英语词库';
              db.push(cloned);
              if (!folders.includes(cloned.folder)) folders.push(cloned.folder);
              folderLangs[cloned.folder] = 'en';
          });
      }

      return { db, folders, folderLangs };
  },

  refreshAfterDataOperation() {
      Model.state.selectedSet.clear();
      Model.state.batchMode = false;
      Model.state.manageMode = false;
      Model.state.renderedStartIndex = -1;
      const folderFilter = View.getEl('wb-folder-filter');
      if (folderFilter) folderFilter.value = 'all';
      View.renderDashboard();
      View.updateWordbankUI();
      View.resetWordbankRenderer();
      this.updateImportFolderOptions();
  },

  async runSafeDataOperation(kind, action, successMessage, reload = false) {
      let restorePoint = null;

      try {
          restorePoint = await this.storePreImportRestorePoint(kind);
          await action();
          await this.updateRestorePointUI();

          Hardware.playSound('success');
          Hardware.vibrate(120);
          showToast(successMessage);

          if (reload) {
              window.setTimeout(() => location.reload(), 900);
          } else {
              this.refreshAfterDataOperation();
          }
      } catch (error) {
          console.error('[Reset] 数据操作失败', error);

          if (restorePoint) {
              try {
                  await this.applyBackupPayload(restorePoint);
                  showToast('操作失败，已恢复原数据');
              } catch (restoreError) {
                  console.error('[Reset] 自动恢复失败', restoreError);
                  showToast('操作失败，自动恢复也失败');
              }
          } else {
              showToast('操作失败，未修改数据');
          }

          Hardware.playSound('error');
          Hardware.vibrate(50);
      }
  },

  clearLearningProgress() {
      return this.runSafeDataOperation('pre-reset-progress', async () => {
          Model.records = [];
          Model.mtGroupClears = {};
          Model.mtWordClears = {};
          await Promise.all([Model.saveRecords(), Model.saveClears()]);
      }, '学习进度已清空');
  },

  restoreBuiltInLibrary() {
      return this.runSafeDataOperation('pre-remove-imported', async () => {
          const defaults = this.getDefaultLibraryState();
          const names = new Set(defaults.db.map(word => word.word));

          Model.db = defaults.db;
          Model.folders = defaults.folders;
          Model.folderLangs = defaults.folderLangs;
          Model.stars = Model.stars.filter(name => names.has(name));
          Model.mtWordClears = Object.fromEntries(
              Object.entries(Model.mtWordClears).filter(([name]) => names.has(name))
          );

          await Model.saveAllUserData();
      }, '已恢复内置词库');
  },

  fullResetApp() {
      return this.runSafeDataOperation('pre-full-reset', async () => {
          const defaults = this.getDefaultLibraryState();

          Model.db = defaults.db;
          Model.folders = defaults.folders;
          Model.folderLangs = defaults.folderLangs;
          Model.stars = [];
          Model.records = [];
          Model.mtGroupClears = {};
          Model.mtWordClears = {};
          Model.aiConversations = [];

          new Set([...BACKUP_PREFERENCE_KEYS, 'wordOrderMode']).forEach(key => {
              localStorage.removeItem(key);
          });

          await Model.saveAllUserData();
      }, '应用已恢复初始状态', true);
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
      // 切卡时自动收起详情卡 AI 面板
let dtAiPanel = View.getEl('dt-ai-inline-panel');
if (dtAiPanel) dtAiPanel.classList.add('hidden');
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

openAISheet(sentence, word, lang) {
    if (!navigator.onLine) { showToast('AI 导师需要联网才能工作哦，请检查网络~'); return; }
    let apiKey = localStorage.getItem('deepseekApiKey');
    if (!apiKey) {
        let self = this;
        Hardware.vibrate(20);
        const promptTitle = document.getElementById('prompt-title');
const promptHelper = document.getElementById('prompt-helper');
const promptIcon = document.getElementById('prompt-icon');
const visibilityBtn = document.getElementById('prompt-visibility');
let input = document.getElementById('prompt-input');

promptTitle.textContent = '配置 DeepSeek API Key';

promptHelper.textContent =
    '密钥会保存在当前设备，并仅用于发送 AI 请求。';
promptHelper.hidden = false;

promptIcon.textContent = 'vpn_key';

input.type = 'password';
input.autocomplete = 'new-password';
input.placeholder = '粘贴 API Key（sk-…）';
input.value = '';

visibilityBtn.hidden = false;
visibilityBtn.title = '显示密钥';
visibilityBtn.setAttribute('aria-label', '显示密钥');

const visibilityIcon =
    visibilityBtn.querySelector('.material-symbols-rounded');

if (visibilityIcon) {
    visibilityIcon.textContent = 'visibility';
}
        window.toggleModal('prompt-overlay', true);
        setTimeout(() => input.focus(), 100);
        document.getElementById('prompt-confirm').onclick = () => { 
            Hardware.vibrate(15);
            let val = input.value.trim(); 
            if(val) { 
                localStorage.setItem('deepseekApiKey', val);
                let settingInput = View.getEl('setting-ai-key');
                if (settingInput) settingInput.value = val;
                window.toggleModal('prompt-overlay', false);
                showToast('API Key 已保存');
                self.openAISheet(sentence, word, lang);
            }
        };
        document.getElementById('prompt-cancel').onclick = () => { Hardware.vibrate(10); window.toggleModal('prompt-overlay', false); };
        return;
    }
    let cacheKey = sentence + '|||' + word;
    let chatArea = View.getEl('ai-chat-messages');
    let copyBtn = View.getEl('ai-sheet-copy');
    let inputEl = View.getEl('ai-chat-input');
    if (!chatArea) return;
    window.toggleModal('ai-sheet-overlay', true);
    if (copyBtn) copyBtn.style.display = 'none';
    if (inputEl) inputEl.value = '';
    
    const isEnglish = lang === 'en';
    let systemPrompt = isEnglish
        ? `你是精通多语言的私人外教。用户正在学习以下英文例句。\n目标词汇：${word}\n例句：${sentence}\n\n请先按以下结构输出对这条例句的解析：\n### 🔪 骨架拆解\n（简明扼要地拆解主谓宾等语法结构）\n\n### 💡 核心亮点\n（指出地道表达、搭配或语法特殊点）\n\n### ✍️ 举一反三\n（用目标词汇 "${word}" 再给2个更简短、常用的生活例句，必须带中文翻译）\n\n完成解析后，告诉用户可以继续提问。`
        : `你是精通多语言的私人外教。用户正在学习以下日语例句。\n目标词汇：${word}\n例句：${sentence}\n\n请先按以下结构输出对这条例句的解析：\n### 🔪 骨架拆解\n（简明扼要地拆解主谓宾等语法结构）\n\n### 💡 核心亮点\n（指出地道表达、词汇连读或语法特殊点）\n\n### ✍️ 举一反三\n（用目标词汇 "${word}" 再给2个更简短、常用的生活例句，必须带中文翻译）\n\n完成解析后，告诉用户可以继续提问。`;
    
    this.currentChat = {
    systemPrompt: systemPrompt,
    messages: [],
    cacheKey: cacheKey,
    sentence: sentence,
    word: word,
    lang: lang
};
    
    if (this.aiCache[cacheKey]) {
        chatArea.innerHTML = this.aiCache[cacheKey];
        if (copyBtn) copyBtn.style.display = 'flex';
        this._scrollChatToBottom();
        return;
    }

    
    chatArea.innerHTML =
        '<div class="ai-chat-bubble ai-chat-bubble-ai is-thinking">' +
            '<div class="ai-chat-bubble-text">' +
                '<div class="ai-thinking-indicator" role="status" aria-label="AI 正在思考">' +
                    '<span></span><span></span><span></span>' +
                '</div>' +
            '</div>' +
        '</div>';
    this._scrollChatToBottom();
    this._startChatStream(apiKey, chatArea, copyBtn, inputEl);
},

_saveCurrentChat() {
    if (!this.currentChat || this.currentChat.messages.length === 0) return;
    let lastExisting = Model.aiConversations.findIndex(c => c.cacheKey === this.currentChat.cacheKey);
    let conv = {
        id: Date.now(),
        date: new Date().toLocaleDateString('zh-CN') + ' ' + new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'}),
        sentence: this.currentChat.sentence || '',
        word: this.currentChat.word || '',
        lang: this.currentChat.lang || 'ja',
        cacheKey: this.currentChat.cacheKey,
        systemPrompt: this.currentChat.systemPrompt,
        messages: [...this.currentChat.messages]
    };
    if (lastExisting !== -1) {
        Model.aiConversations[lastExisting] = conv;
    } else if (conv.messages.length > 0) {
        Model.aiConversations.unshift(conv);
        if (Model.aiConversations.length > 50) Model.aiConversations = Model.aiConversations.slice(0, 50);
    }
    this._persistConversations();
},

_persistConversations() {
    if (!Model.idbAvailable) {
        localStorage.setItem(
            'aiConversations',
            JSON.stringify(
                Model.aiConversations
            )
        );

        return Promise.resolve();
    }

    return idbKeyval.set(
        'aiConversations',
        Model.aiConversations
    );
},

openAIPresetPicker() {
    const lang =
        Model.state.currentLangMode === 'en'
            ? 'en'
            : 'ja';

    const langLabel =
        View.getEl(
            'ai-preset-language-label'
        );

    if (langLabel) {
        langLabel.textContent =
            lang === 'en'
                ? '当前将使用英语导师'
                : '当前将使用日语导师';
    }

    window.toggleModal(
        'ai-preset-overlay',
        true
    );
},

startAITabPreset(presetId) {
    const preset =
        AI_CHAT_PRESETS[presetId] ||
        AI_CHAT_PRESETS.free;

    const lang =
        Model.state.currentLangMode === 'en'
            ? 'en'
            : 'ja';

    this.aiTabChat.activeIdx = -1;
    this.aiTabChat.messages = [];
    this.aiTabChat.presetId = presetId;
    this.aiTabChat.lang = lang;

    this.aiTabChat.systemPrompt =
        buildAIChatSystemPrompt(
            presetId,
            lang
        );

    this.aiTabChat.cacheKey =
        `free_${presetId}_${Date.now()}`;

    this.aiTabChat.word =
        preset.title;

    this.aiTabChat.sentence = '';

    const listView =
        View.getEl('ai-list-view');

    const chatView =
        View.getEl('ai-chat-view');

    const messagesEl =
        View.getEl(
            'ai-tab-chat-messages'
        );

    const titleEl =
        View.getEl(
            'ai-chat-view-title'
        );

    const inputEl =
        View.getEl(
            'ai-tab-chat-input'
        );

    if (titleEl) {
        titleEl.textContent =
            this.getAITabChatTitle();
    }

    if (messagesEl) {
        messagesEl.innerHTML = '';
    }

    if (inputEl) {
        inputEl.value = '';

        inputEl.placeholder =
            lang === 'en'
                ? '输入英语学习问题…'
                : '输入日语学习问题…';
    }

    if (listView) {
        listView.classList.add(
            'hidden'
        );
    }

    if (chatView) {
        chatView.classList.remove(
            'hidden'
        );
    }

    this.renderAITabWelcome();

    window.toggleModal(
        'ai-preset-overlay',
        false
    );
},

getAITabChatTitle() {
    const preset =
        AI_CHAT_PRESETS[
            this.aiTabChat.presetId
        ];

    if (!preset) {
        return (
            this.aiTabChat.word ||
            '对话'
        );
    }

    const langName =
        this.aiTabChat.lang === 'en'
            ? '英语'
            : '日语';

    return (
        `${preset.title} · ${langName}`
    );
},

renderAITabWelcome() {
    const welcomeEl =
        View.getEl(
            'ai-chat-welcome'
        );

    const modeLabel =
        View.getEl(
            'ai-chat-mode-label'
        );

    const welcomeText =
        View.getEl(
            'ai-chat-welcome-text'
        );

    const quickActions =
        View.getEl(
            'ai-chat-quick-actions'
        );

    const inputEl =
        View.getEl(
            'ai-tab-chat-input'
        );

    if (
        !welcomeEl ||
        !quickActions
    ) {
        return;
    }

    const preset =
        AI_CHAT_PRESETS[
            this.aiTabChat.presetId
        ];

    if (
        !preset ||
        this.aiTabChat.messages.length > 0
    ) {
        welcomeEl.classList.add(
            'hidden'
        );

        quickActions.innerHTML = '';
        return;
    }

    const lang =
        this.aiTabChat.lang === 'en'
            ? 'en'
            : 'ja';

    const langName =
        lang === 'en'
            ? '英语'
            : '日语';

    if (modeLabel) {
        modeLabel.textContent =
            `${preset.title} · ${langName}`;
    }

    if (welcomeText) {
        welcomeText.textContent =
            preset.welcome[lang];
    }

    quickActions.innerHTML = '';

    preset.shortcuts[lang]
        .forEach(text => {
            const button =
                document.createElement(
                    'button'
                );

            button.type = 'button';

            button.className =
                'ai-chat-quick-chip';

            button.textContent = text;

            button.addEventListener(
                'click',
                () => {
                    Hardware.vibrate(12);

                    if (!inputEl) {
                        return;
                    }

                    inputEl.value = text;
                    inputEl.focus();

                    inputEl.dispatchEvent(
                        new Event(
                            'input',
                            {
                                bubbles: true
                            }
                        )
                    );
                }
            );

            quickActions.appendChild(
                button
            );
        });

    welcomeEl.classList.remove(
        'hidden'
    );
},

renderAIHistory() {
    let listEl = View.getEl('ai-history-list');
    let emptyEl = View.getEl('ai-history-empty');
    let chatView = View.getEl('ai-chat-view');
    let listView = View.getEl('ai-list-view');
    if (chatView) chatView.classList.add('hidden');
    if (listView) listView.classList.remove('hidden');
    if (!listEl) return;
    if (Model.aiConversations.length === 0) {
        listEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    let html = '';
    Model.aiConversations.forEach((conv, idx) => {
        let preview = '';
        let msgCount = 0;
        if (conv.messages && conv.messages.length > 0) {
            msgCount = conv.messages.length;
            let lastMsg = conv.messages[conv.messages.length - 1].content || '';
            preview = lastMsg.replace(/###.*?\n/g, '').replace(/\*\*/g, '').replace(/\n/g, ' ').substring(0, 60);
            if (lastMsg.length > 60) preview += '...';
        }
        let isEnglish = conv.lang === 'en';
        let wordDisplay = conv.word || '自由对话';
        html += '<div class="ai-history-card" data-idx="' + idx + '" tabindex="0" role="button">';
html += '<div class="ai-history-card-top">';
html += '<span class="ai-history-lang-tag">' + (isEnglish ? 'EN' : '日') + '</span>';
html += '<span class="ai-history-word">' + escapeHTML(wordDisplay) + '</span>';
html += '<span class="ai-history-msgcount">' + msgCount + ' 条对话</span>';
html += '<button class="ai-history-del-btn" data-idx="' + idx + '" title="删除这条对话" aria-label="删除这条对话"><span class="material-symbols-rounded">delete</span></button>';
html += '</div>';
html += '<div class="ai-history-preview">' + escapeHTML(preview || '点击继续对话。') + '</div>';
html += '<div class="ai-history-date">' + escapeHTML(conv.date) + '</div>';
html += '</div>';
    });
    listEl.innerHTML = html;
    
    listEl.querySelectorAll('.ai-history-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.ai-history-del-btn')) return;
            Hardware.vibrate(15);
            let idx = parseInt(card.dataset.idx);
            Controller.openAIChatFromTab(idx);
        });
    });
    listEl.querySelectorAll('.ai-history-del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            Hardware.vibrate(20);
            let idx = parseInt(btn.dataset.idx);
            showConfirm('删除对话', '确定要删除这条对话记录吗？', () => {
                Model.aiConversations.splice(idx, 1);
                Controller._persistConversations();
                Controller.renderAIHistory();
                showToast('已删除');
            });
        });
    });
},

openAIHistoryDetail(idx) {
    this.openAIChatFromTab(idx);
},

openAIChatFromTab(idx) {
    let conv = Model.aiConversations[idx];
    if (!conv) return;
    let listView = View.getEl('ai-list-view');
    let chatView = View.getEl('ai-chat-view');
    let messagesEl = View.getEl('ai-tab-chat-messages');
    let titleEl = View.getEl('ai-chat-view-title');
    let inputEl = View.getEl('ai-tab-chat-input');
    if (!messagesEl || !chatView || !listView) return;
    
    this.aiTabChat.activeIdx = idx;

    this.aiTabChat.messages =
        conv.messages
            ? [...conv.messages]
            : [];

    this.aiTabChat.cacheKey =
        conv.cacheKey || '';

    this.aiTabChat.sentence =
        conv.sentence || '';

    this.aiTabChat.lang =
        conv.lang === 'en'
            ? 'en'
            : 'ja';

    const hasPreset =
        !!AI_CHAT_PRESETS[
            conv.presetId
        ];

    const isLegacyFreeChat =
        !conv.presetId &&
        String(
            conv.cacheKey || ''
        ).startsWith('free_');

    this.aiTabChat.presetId =
        hasPreset
            ? conv.presetId
            : (
                isLegacyFreeChat
                    ? 'free'
                    : ''
            );

    const preset =
        AI_CHAT_PRESETS[
            this.aiTabChat.presetId
        ];

    this.aiTabChat.word =
        conv.word ||
        (
            preset
                ? preset.title
                : ''
        );

    this.aiTabChat.systemPrompt =
        conv.systemPrompt ||
        (
            preset
                ? buildAIChatSystemPrompt(
                    this.aiTabChat.presetId,
                    this.aiTabChat.lang
                )
                : ''
        );

    if (titleEl) {
        titleEl.textContent =
            this.getAITabChatTitle();
    }

    if (inputEl) {
        inputEl.value = '';
    }
    
    let html = '';
    let msgs = this.aiTabChat.messages;
if (msgs && msgs.length > 0) {
    msgs.forEach(msg => {
        if (msg.role === 'assistant') {
            let renderText = renderAIMessageHTML(msg.content, conv.word || '');
            html += '<div class="ai-chat-bubble ai-chat-bubble-ai"><div class="ai-chat-bubble-text ai-response-box">' + renderText + '</div></div>';
        } else if (msg.role === 'user') {
            html += '<div class="ai-chat-bubble ai-chat-bubble-user"><div class="ai-chat-bubble-text">' + escapeHTML(msg.content) + '</div></div>';
        }
    });
}
    messagesEl.innerHTML = html;
    this.renderAITabWelcome();
    
    listView.classList.add('hidden');
    chatView.classList.remove('hidden');
    setTimeout(() => {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 100);
},

closeAITabChat() {
    if (this.aiTabChat.activeIdx !== -1) {
        this._saveTabChat();
    }
    this.aiTabChat.activeIdx = -1;
    this.aiTabChat.messages = [];
    this.aiTabChat.systemPrompt = '';
    this.aiTabChat.cacheKey = '';
    this.aiTabChat.sentence = '';
    this.aiTabChat.word = '';
    this.aiTabChat.presetId = '';

    this.aiTabChat.lang =
        Model.state.currentLangMode === 'en'
            ? 'en'
            : 'ja';

    this.renderAIHistory();
},

_saveTabChat() {
    if (this.aiTabChat.activeIdx === -1 || this.aiTabChat.messages.length === 0) return;
    let idx = this.aiTabChat.activeIdx;
    if (idx >= Model.aiConversations.length) return;
    let conv = Model.aiConversations[idx];
    conv.messages =
        [...this.aiTabChat.messages];

    conv.systemPrompt =
        this.aiTabChat.systemPrompt;

    conv.presetId =
        this.aiTabChat.presetId || '';

    conv.word =
        this.aiTabChat.word ||
        conv.word ||
        '';

    conv.lang =
        this.aiTabChat.lang ||
        conv.lang ||
        'ja';

    conv.sentence =
        this.aiTabChat.sentence || '';

    conv.cacheKey =
        this.aiTabChat.cacheKey ||
        conv.cacheKey ||
        '';

    conv.date =
        new Date()
            .toLocaleDateString('zh-CN') +
        ' ' +
        new Date()
            .toLocaleTimeString(
                'zh-CN',
                {
                    hour: '2-digit',
                    minute: '2-digit'
                }
            );
    Model.aiConversations[idx] = conv;
    this._persistConversations();
},

sendAITabMessage() {
    let inputEl = View.getEl('ai-tab-chat-input');
    let messagesEl = View.getEl('ai-tab-chat-messages');
    let sendBtn = View.getEl('ai-tab-chat-send');
    if (!inputEl || !messagesEl) return;
    let text = inputEl.value.trim();
    if (!text) return;
        let apiKey = localStorage.getItem('deepseekApiKey');

    if (!apiKey) {
        const self = this;

        Hardware.vibrate(20);

        const promptTitle =
            document.getElementById('prompt-title');

        const promptHelper =
            document.getElementById('prompt-helper');

        const promptIcon =
            document.getElementById('prompt-icon');

        const visibilityBtn =
            document.getElementById('prompt-visibility');

        const promptInput =
            document.getElementById('prompt-input');

        promptTitle.textContent =
            '配置 DeepSeek API Key';

        promptHelper.textContent =
            '密钥会保存在当前设备，并仅用于发送 AI 请求。';

        promptHelper.hidden = false;

        promptIcon.textContent = 'vpn_key';

        promptInput.type = 'password';
        promptInput.autocomplete = 'new-password';
        promptInput.placeholder =
            '粘贴 API Key（sk-…）';

        promptInput.value = '';

        visibilityBtn.hidden = false;
        visibilityBtn.title = '显示密钥';

        visibilityBtn.setAttribute(
            'aria-label',
            '显示密钥'
        );

        const visibilityIcon =
            visibilityBtn.querySelector(
                '.material-symbols-rounded'
            );

        if (visibilityIcon) {
            visibilityIcon.textContent = 'visibility';
        }

        window.toggleModal(
            'prompt-overlay',
            true
        );

        setTimeout(() => {
            promptInput.focus();
        }, 100);

        document.getElementById(
            'prompt-confirm'
        ).onclick = () => {
            Hardware.vibrate(15);

            const value =
                promptInput.value.trim();

            if (!value) {
                return;
            }

            localStorage.setItem(
                'deepseekApiKey',
                value
            );

            const settingInput =
                View.getEl('setting-ai-key');

            if (settingInput) {
                settingInput.value = value;
            }

            window.toggleModal(
                'prompt-overlay',
                false
            );

            showToast('API Key 已保存');

            /*
             * 输入框里的消息仍然保留，
             * 保存密钥后自动重新执行发送。
             */
            self.sendAITabMessage();
        };

        document.getElementById(
            'prompt-cancel'
        ).onclick = () => {
            Hardware.vibrate(10);

            window.toggleModal(
                'prompt-overlay',
                false
            );
        };

        return;
    }

    inputEl.value = '';
    if (sendBtn) sendBtn.disabled = true;
    
    this.aiTabChat.messages.push({
        role: 'user',
        content: text
    });

    this.renderAITabWelcome();
    
    let userBubble =
        document.createElement('div');
    userBubble.className = 'ai-chat-bubble ai-chat-bubble-user';
    userBubble.innerHTML = '<div class="ai-chat-bubble-text">' + escapeHTML(text) + '</div>';
    messagesEl.appendChild(userBubble);
    
    let aiBubble = document.createElement('div');
    aiBubble.className =
        'ai-chat-bubble ai-chat-bubble-ai is-thinking';

    aiBubble.innerHTML =
        '<div class="ai-chat-bubble-text">' +
            '<div class="ai-thinking-indicator" role="status" aria-label="AI 正在思考">' +
                '<span></span><span></span><span></span>' +
            '</div>' +
        '</div>';
    messagesEl.appendChild(aiBubble);
    this._scrollTabChatToBottom();
    
    let messagesToSend = [
    {
        role: 'system',
        content: this.aiTabChat.lang === 'ja'
    ? withJapaneseRubyInstruction(
        this.aiTabChat.systemPrompt
    )
    : this.aiTabChat.systemPrompt
    },
            ...this.aiTabChat.messages
];
    this._streamTabChatResponse(apiKey, aiBubble, sendBtn);
},

async _streamTabChatResponse(apiKey, aiBubble, sendBtn) {
    let messagesToSend = [
    {
        role: 'system',
        content: this.aiTabChat.lang === 'ja'
    ? withJapaneseRubyInstruction(
        this.aiTabChat.systemPrompt
    )
    : this.aiTabChat.systemPrompt
    },
            ...this.aiTabChat.messages
];
    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model: 'deepseek-chat', messages: messagesToSend, stream: true })
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                aiBubble.innerHTML = '<div class="ai-chat-bubble-text" style="text-align:center; color:var(--accent-red);"><span class="material-symbols-rounded" style="font-size:2rem; opacity:0.5; display:block; margin-bottom:8px;">key_off</span>API Key 无效或余额不足</div>';
                if (sendBtn) sendBtn.disabled = false;
                return;
            }
            throw new Error('网络请求失败');
        }
        
        aiBubble.classList.remove(
            'is-thinking',
            'is-complete'
        );

        aiBubble.classList.add(
            'is-streaming'
        );

        let fullText = '';

        let textDiv =
            document.createElement('div');

        textDiv.className =
            'ai-chat-bubble-text ai-response-box';

        aiBubble.innerHTML = '';
        aiBubble.appendChild(textDiv);
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        
        while (true) {
            const { done, value } =
                await reader.read();

            if (done) {
                break;
            }

            let chunkStr =
                decoder.decode(
                    value,
                    { stream: true }
                );

            let lines =
                chunkStr.split('\n');

            for (let line of lines) {
                line = line.trim();

                if (
                    line.startsWith('data: ') &&
                    line !== 'data: [DONE]'
                ) {
                    try {
                        let data =
                            JSON.parse(
                                line.slice(6)
                            );

                        let chunk =
                            data.choices[0]
                                .delta.content;

                        if (chunk) {
                            fullText += chunk;

                            textDiv.innerHTML =
                                renderAIMessageHTML(
                                    fullText,
                                    this.aiTabChat.word || ''
                                );

                            this._scrollTabChatToBottom();
                        }
                    } catch (e) {}
                }
            }
        }

        /*
         * 主 AI 对话结束后，
         * 使用完整文本再渲染一次。
         */
        textDiv.innerHTML =
            renderAIMessageHTML(
                fullText,
                this.aiTabChat.word || ''
            );

        this._scrollTabChatToBottom();
        
        aiBubble.classList.remove(
            'is-streaming'
        );

        aiBubble.classList.add(
            'is-complete'
        );

        this.aiTabChat.messages.push({
            role: 'assistant',
            content: fullText
        });

        this._saveTabChat();

        if (sendBtn) {
            sendBtn.disabled = false;
        }
    } catch (err) {
        aiBubble.classList.remove(
            'is-thinking',
            'is-streaming'
        );

        aiBubble.innerHTML =
            '<div class="ai-chat-bubble-text" style="text-align:center; color:var(--accent-red);">连接失败</div>';

        if (sendBtn) {
            sendBtn.disabled = false;
        }
    }
},

_scrollTabChatToBottom() {
    let chatArea = View.getEl('ai-tab-chat-messages');
    if (chatArea) {
        setTimeout(() => { chatArea.scrollTop = chatArea.scrollHeight; }, 50);
    }
},

_scrollChatToBottom() {
    let chatArea = View.getEl('ai-chat-messages');
    if (chatArea) {
        setTimeout(() => { chatArea.scrollTop = chatArea.scrollHeight; }, 50);
    }
},

sendAIMessage() {
    let inputEl = View.getEl('ai-chat-input');
    let chatArea = View.getEl('ai-chat-messages');
    let sendBtn = View.getEl('ai-chat-send');
    if (!inputEl || !chatArea) return;
    let text = inputEl.value.trim();
    if (!text) return;
    let apiKey = localStorage.getItem('deepseekApiKey');
    if (!apiKey) return;
    
    inputEl.value = '';
    if (sendBtn) sendBtn.disabled = true;
    
    this.currentChat.messages.push({ role: 'user', content: text });
    let userBubble = document.createElement('div');
    userBubble.className = 'ai-chat-bubble ai-chat-bubble-user';
    userBubble.innerHTML = '<div class="ai-chat-bubble-text">' + escapeHTML(text) + '</div>';
    chatArea.appendChild(userBubble);
    
    let aiBubble = document.createElement('div');
    aiBubble.className =
        'ai-chat-bubble ai-chat-bubble-ai is-thinking';

    aiBubble.innerHTML =
        '<div class="ai-chat-bubble-text">' +
            '<div class="ai-thinking-indicator" role="status" aria-label="AI 正在思考">' +
                '<span></span><span></span><span></span>' +
            '</div>' +
        '</div>';
    chatArea.appendChild(aiBubble);
    this._scrollChatToBottom();
    
    let messagesToSend = [
    {
        role: 'system',
        content: withJapaneseRubyInstruction(this.currentChat.systemPrompt)
    },
    ...this.currentChat.messages
];
    this._streamChatResponse(apiKey, aiBubble, sendBtn);
},

_startChatStream(apiKey, chatArea, copyBtn, inputEl) {
    let messagesToSend = [{ role: 'system', content: this.currentChat.systemPrompt }];
    let aiBubble = chatArea.querySelector('.ai-chat-bubble-ai');
    if (!aiBubble) {
        aiBubble =
            document.createElement('div');

        aiBubble.className =
            'ai-chat-bubble ai-chat-bubble-ai is-thinking';

        aiBubble.innerHTML =
            '<div class="ai-chat-bubble-text">' +
                '<div class="ai-thinking-indicator" role="status" aria-label="AI 正在思考">' +
                    '<span></span><span></span><span></span>' +
                '</div>' +
            '</div>';

        chatArea.appendChild(aiBubble);
    }
    this._streamChatResponse(apiKey, aiBubble, null, copyBtn, inputEl);
},

async _streamChatResponse(apiKey, aiBubble, sendBtn, copyBtn, inputEl) {
    let messagesToSend = [
    {
        role: 'system',
        content: withJapaneseRubyInstruction(this.currentChat.systemPrompt)
    },
    ...this.currentChat.messages
];
    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model: 'deepseek-chat', messages: messagesToSend, stream: true })
        });
        
        if (!response.ok) {
            if (response.status === 401) {
    aiBubble.innerHTML = '<div class="ai-chat-bubble-text" style="text-align:center; color:var(--accent-red);"><span class="material-symbols-rounded" style="font-size:2rem; opacity:0.5; display:block; margin-bottom:8px;">key_off</span>API Key 无效或余额不足<button id="ai-rekey-btn" class="btn-outline" style="margin-top:12px; width:auto; display:inline-flex; padding:10px 20px; border-color:var(--tertiary) !important; color:var(--tertiary) !important;"><span class="material-symbols-rounded">vpn_key</span> 重新输入 Key</button></div>';
    this._scrollChatToBottom();
    setTimeout(() => {
        let btn = document.getElementById('ai-rekey-btn');
        if (btn) btn.onclick = () => {
            let self = this;
            Hardware.vibrate(15);
            const promptTitle = document.getElementById('prompt-title');
const promptHelper = document.getElementById('prompt-helper');
const promptIcon = document.getElementById('prompt-icon');
const visibilityBtn = document.getElementById('prompt-visibility');
let pInput = document.getElementById('prompt-input');

promptTitle.textContent = '重新输入 API Key';

promptHelper.textContent =
    '新密钥会替换当前设备中保存的旧密钥。';
promptHelper.hidden = false;

promptIcon.textContent = 'vpn_key';

pInput.type = 'password';
pInput.autocomplete = 'new-password';
pInput.placeholder = '粘贴新的 API Key（sk-…）';
pInput.value = '';

visibilityBtn.hidden = false;
visibilityBtn.title = '显示密钥';
visibilityBtn.setAttribute('aria-label', '显示密钥');

const visibilityIcon =
    visibilityBtn.querySelector('.material-symbols-rounded');

if (visibilityIcon) {
    visibilityIcon.textContent = 'visibility';
}
            window.toggleModal('prompt-overlay', true);
            setTimeout(() => pInput.focus(), 100);
            document.getElementById('prompt-confirm').onclick = () => { 
                Hardware.vibrate(15);
                let val = pInput.value.trim(); 
                if(val) { 
                    localStorage.setItem('deepseekApiKey', val);
                    let sInput = View.getEl('setting-ai-key');
                    if (sInput) sInput.value = val;
                    window.toggleModal('prompt-overlay', false);
                    showToast('API Key 已更新，请重新点击 AI 解析');
                }
            };
            document.getElementById('prompt-cancel').onclick = () => { Hardware.vibrate(10); window.toggleModal('prompt-overlay', false); };
        };
    }, 100);
    if (sendBtn) sendBtn.disabled = false;
    return;
}
            throw new Error('网络请求失败: 错误码 ' + response.status);
        }
        
        aiBubble.classList.remove(
            'is-thinking',
            'is-complete'
        );

        aiBubble.classList.add(
            'is-streaming'
        );

        let fullText = '';

        let textDiv =
            document.createElement('div');

        textDiv.className =
            'ai-chat-bubble-text ai-response-box';

        aiBubble.innerHTML = '';
        aiBubble.appendChild(textDiv);
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        
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
                        let chunk = data.choices[0].delta.content;
                        if (chunk) {
                            fullText += chunk;
                            textDiv.innerHTML = renderAIMessageHTML(fullText, this.currentChat.word || '');
this._scrollChatToBottom();
                        }
                    } catch (e) {}
                }
            }
        }

        /*
         * 例句继续追问结束后，
         * 使用完整文本再渲染一次。
         */
        textDiv.innerHTML =
            renderAIMessageHTML(
                fullText,
                this.currentChat.word || ''
            );

        this._scrollChatToBottom();
        
        aiBubble.classList.remove(
            'is-streaming'
        );

        aiBubble.classList.add(
            'is-complete'
        );

        this.currentChat.messages.push({
            role: 'assistant',
            content: fullText
        });
        
                if (this.currentChat.cacheKey && this.currentChat.messages.length === 1) {
            let chatArea = View.getEl('ai-chat-messages');
            if (chatArea) {
                Controller.aiCache[this.currentChat.cacheKey] = chatArea.innerHTML;
            }
        }
        if (copyBtn) copyBtn.style.display = 'flex';
        if (sendBtn) sendBtn.disabled = false;

    } catch (err) {
        aiBubble.classList.remove(
            'is-thinking',
            'is-streaming'
        );

        aiBubble.innerHTML =
            '<div class="ai-chat-bubble-text" style="text-align:center; color:var(--accent-red);">' +
                '<span class="material-symbols-rounded" style="font-size:2rem; opacity:0.5; display:block; margin-bottom:8px;">wifi_off</span>' +
                '连接失败：' +
                escapeHTML(err.message) +
            '</div>';

        if (sendBtn) {
            sendBtn.disabled = false;
        }
    }
},

async callDeepSeekStream(sentence, word, lang, apiKey, container, cacheKey, copyBtn) {
    const isEnglish = lang === 'en';
    const prompt = isEnglish 
        ? `你是精通多语言的私人外教。请解析以下英文例句。\n目标词汇：${word}\n例句：${sentence}\n\n请严格按以下结构输出，不要加多余的废话和客套话：\n### 🔪 骨架拆解\n（简明扼要地拆解主谓宾等语法结构）\n\n### 💡 核心亮点\n（指出地道表达、搭配或语法特殊点）\n\n### ✍️ 举一反三\n（用目标词汇 "${word}" 再给2个更简短、常用的生活例句，必须带中文翻译）`
        : `你是精通多语言的私人外教。请解析以下日语例句。\n目标词汇：${word}\n例句：${sentence}\n\n请严格按以下结构输出，不要加多余的废话和客套话：\n### 🔪 骨架拆解\n（简明扼要地拆解主谓宾等语法结构）\n\n### 💡 核心亮点\n（指出地道表达、词汇连读或语法特殊点）\n\n### ✍️ 举一反三\n（用目标词汇 "${word}" 再给2个更简短、常用的生活例句，必须带中文翻译）`;
    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [
        {
            role: 'user',
            content: withJapaneseRubyInstruction(prompt)
        }
    ],
    stream: true
})
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                container.innerHTML = '<div style="text-align:center; padding: 40px 20px; color: var(--accent-red);"><span class="material-symbols-rounded" style="font-size:3rem; opacity:0.5;">key_off</span><div style="font-weight:800; margin-top:16px;">API Key 无效或余额不足</div><button id="ai-goto-settings" class="btn-outline" style="margin-top:20px; width:auto; display:inline-flex; padding:12px 28px; border-color:var(--tertiary) !important; color:var(--tertiary) !important;"><span class="material-symbols-rounded">settings</span> 前往设置修改</button></div>';
                setTimeout(() => {
                    let btn = document.getElementById('ai-goto-settings');
                    if (btn) btn.onclick = () => {
                        window.toggleModal('ai-sheet-overlay', false);
                        Nav.switchTab('tab-settings', 'settings|環境設定', document.querySelector('[data-target="tab-settings"]'));
                    };
                }, 100);
                return;
            }
            throw new Error('网络请求失败: 错误码 ' + response.status);
        }
        
        container.innerHTML = '<div class="ai-response-box"></div>';
        let box = container.querySelector('.ai-response-box');
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";
        
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
                        let chunk = data.choices[0].delta.content;
                        if (chunk) {
                            fullText += chunk;
                            box.innerHTML = renderAIMessageHTML(fullText, word || '');
container.scrollTop = container.scrollHeight;
                        }
                    } catch (e) {}
                }
            }
        }

        /*
         * 流式输出结束后，
         * 使用完整文本再渲染一次。
         *
         * 防止最后一个注音刚好跨越两个数据片段，
         * 导致页面停留在半完成状态。
         */
        box.innerHTML =
            renderAIMessageHTML(
                fullText,
                word || ''
            );

        container.scrollTop =
            container.scrollHeight;

        if (cacheKey && fullText) {
            Controller.aiCache[cacheKey] =
                container.innerHTML;
        }
        if (copyBtn) {
            copyBtn.style.display = 'flex';
        }
    } catch (err) {
        container.innerHTML = '<div style="text-align:center; padding: 40px 20px; color: var(--accent-red);"><span class="material-symbols-rounded" style="font-size:3rem; opacity:0.5;">wifi_off</span><div style="font-weight:800; margin-top:16px;">连接失败</div><div style="opacity:0.7; margin-top:8px;">' + escapeHTML(err.message) + '</div></div>';
    }
}
};

window.onload = () => {
    const visibilityBtn =
        document.getElementById('prompt-visibility');

    const input =
        document.getElementById('prompt-input');

    if (visibilityBtn && input) {
        visibilityBtn.addEventListener('click', () => {
            Hardware.vibrate(10);

            const shouldShow =
                input.type === 'password';

            input.type =
                shouldShow ? 'text' : 'password';

            const icon =
                visibilityBtn.querySelector(
                    '.material-symbols-rounded'
                );

            if (icon) {
                icon.textContent =
                    shouldShow
                        ? 'visibility_off'
                        : 'visibility';
            }

            visibilityBtn.title =
                shouldShow ? '隐藏密钥' : '显示密钥';

            visibilityBtn.setAttribute(
                'aria-label',
                shouldShow ? '隐藏密钥' : '显示密钥'
            );

            input.focus();

            try {
                input.setSelectionRange(
                    input.value.length,
                    input.value.length
                );
            } catch (error) {}
        });
    }

    Controller.init();
};