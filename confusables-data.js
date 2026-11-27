(function (root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    root.ZhongriConfusables = api.confusables;
    root.ZhongriRootFamilyNotes = api.rootFamilyNotes;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const confusables = [
        {
            id: 'conf-builtin-001',
            title: 'spend / take / pay / cost',
            words: ['spend', 'take', 'pay', 'cost'],
            diffNotes: [
                { word: 'spend', note: '主语为人，搭配 spend time/money on sth. 或 (in) doing sth.' },
                { word: 'take', note: '常用于 It takes sb. + 时间 + to do sth.，主语多为 it 或事件' },
                { word: 'pay', note: '主语为人，搭配 pay (money) for sth.，侧重付款买单' },
                { word: 'cost', note: '主语为物或事件，搭配 sth. costs (sb.) + 金钱/代价' }
            ],
            examples: [
                {
                    sentence: 'She spent two hours preparing for the English exam.',
                    blank: 'She ____ two hours preparing for the English exam.',
                    answer: 'spend',
                    translation: '她花了两个小时准备英语考试。'
                },
                {
                    sentence: 'It took us nearly three days to finish the report.',
                    blank: 'It ____ us nearly three days to finish the report.',
                    answer: 'take',
                    translation: '完成这份报告花了我们近三天时间。'
                },
                {
                    sentence: 'How much did you pay for that dictionary?',
                    blank: 'How much did you ____ for that dictionary?',
                    answer: 'pay',
                    translation: '你买那本词典花了多少钱？'
                },
                {
                    sentence: 'The new textbook cost me fifty yuan.',
                    blank: 'The new textbook ____ me fifty yuan.',
                    answer: 'cost',
                    translation: '这本新教材花了我五十元。'
                }
            ]
        },
        {
            id: 'conf-builtin-002',
            title: 'a number of / the number of',
            words: ['a number of', 'the number of'],
            diffNotes: [
                { word: 'a number of', note: '意为“许多、大量”，后接复数名词，谓语动词用复数' },
                { word: 'the number of', note: '意为“……的数量”，后接复数名词，谓语动词用单数' }
            ],
            examples: [
                {
                    sentence: 'A number of students are reviewing vocabulary in the library.',
                    blank: '____ students are reviewing vocabulary in the library.',
                    answer: 'a number of',
                    translation: '许多学生正在图书馆复习词汇。'
                },
                {
                    sentence: 'The number of applicants has increased sharply this year.',
                    blank: '____ applicants has increased sharply this year.',
                    answer: 'the number of',
                    translation: '今年报考人数大幅增长。'
                }
            ]
        },
        {
            id: 'conf-builtin-003',
            title: 'incident / accident',
            words: ['incident', 'accident'],
            diffNotes: [
                { word: 'incident', note: '指日常小插曲、事件，或政治/外交上的事变' },
                { word: 'accident', note: '指意外事故、不幸事件，常见搭配 by accident（偶然）' }
            ],
            examples: [
                {
                    sentence: 'He was badly injured in a traffic accident last week.',
                    blank: 'He was badly injured in a traffic ____ last week.',
                    answer: 'accident',
                    translation: '他上周在一场交通事故中受了重伤。'
                },
                {
                    sentence: 'She laughed off the embarrassing incident at the meeting.',
                    blank: 'She laughed off the embarrassing ____ at the meeting.',
                    answer: 'incident',
                    translation: '她一笑置之，淡化了会上那段尴尬的小插曲。'
                }
            ]
        },
        {
            id: 'conf-builtin-004',
            title: 'amount / number',
            words: ['amount', 'number'],
            diffNotes: [
                { word: 'amount', note: '用于不可数名词，搭配 a large amount of + 不可数名词' },
                { word: 'number', note: '用于可数名词复数，搭配 a large number of + 可数名词复数' }
            ],
            examples: [
                {
                    sentence: 'A large amount of water is wasted every day.',
                    blank: 'A large ____ of water is wasted every day.',
                    answer: 'amount',
                    translation: '每天都有大量的水被浪费。'
                },
                {
                    sentence: 'A growing number of graduates choose to take the exam.',
                    blank: 'A growing ____ of graduates choose to take the exam.',
                    answer: 'number',
                    translation: '越来越多的毕业生选择参加这场考试。'
                }
            ]
        },
        {
            id: 'conf-builtin-005',
            title: 'sound / voice / noise',
            words: ['sound', 'voice', 'noise'],
            diffNotes: [
                { word: 'sound', note: '泛指自然界或物体发出的一切声音' },
                { word: 'voice', note: '专指人的嗓音、说话声或歌声' },
                { word: 'noise', note: '指嘈杂声、噪音或令人不快的喧闹声' }
            ],
            examples: [
                {
                    sentence: 'Light travels much faster than sound.',
                    blank: 'Light travels much faster than ____.',
                    answer: 'sound',
                    translation: '光的传播速度比声音快得多。'
                },
                {
                    sentence: 'Please lower your voice in the reading room.',
                    blank: 'Please lower your ____ in the reading room.',
                    answer: 'voice',
                    translation: '在阅览室里请压低嗓音。'
                },
                {
                    sentence: 'I cannot focus with all that loud noise outside.',
                    blank: 'I cannot focus with all that loud ____ outside.',
                    answer: 'noise',
                    translation: '外面那么吵，我没法集中注意力。'
                }
            ]
        },
        {
            id: 'conf-builtin-006',
            title: 'cause / reason',
            words: ['cause', 'reason'],
            diffNotes: [
                { word: 'cause', note: '侧重造成事实或事故的直接起因，常搭配 the cause of...' },
                { word: 'reason', note: '侧重解释某种行为或现象的理由，常搭配 the reason for...' }
            ],
            examples: [
                {
                    sentence: 'Police are still investigating the cause of the fire.',
                    blank: 'Police are still investigating the ____ of the fire.',
                    answer: 'cause',
                    translation: '警方仍在调查起火原因。'
                },
                {
                    sentence: 'Could you tell me the reason for your absence?',
                    blank: 'Could you tell me the ____ for your absence?',
                    answer: 'reason',
                    translation: '你能告诉我你缺席的理由吗？'
                }
            ]
        },
        {
            id: 'conf-builtin-007',
            title: 'custom / habit',
            words: ['custom', 'habit'],
            diffNotes: [
                { word: 'custom', note: '指社会或民族沿袭的风俗、传统习俗' },
                { word: 'habit', note: '指个人长期养成的日常习惯，常搭配 get into the habit of doing' }
            ],
            examples: [
                {
                    sentence: 'Eating mooncakes is a traditional Chinese custom.',
                    blank: 'Eating mooncakes is a traditional Chinese ____.',
                    answer: 'custom',
                    translation: '吃月饼是中国的传统习俗。'
                },
                {
                    sentence: 'He has formed the habit of reading before bed.',
                    blank: 'He has formed the ____ of reading before bed.',
                    answer: 'habit',
                    translation: '他养成了睡前阅读的习惯。'
                }
            ]
        },
        {
            id: 'conf-builtin-008',
            title: 'weather / climate',
            words: ['weather', 'climate'],
            diffNotes: [
                { word: 'weather', note: '指短期内某一天的具体天气变化（晴雨冷暖）' },
                { word: 'climate', note: '指某一地区长期形成的总体气候特征' }
            ],
            examples: [
                {
                    sentence: 'What will the weather be like tomorrow morning?',
                    blank: 'What will the ____ be like tomorrow morning?',
                    answer: 'weather',
                    translation: '明天早上的天气怎么样？'
                },
                {
                    sentence: 'The mild coastal climate attracts many retirees.',
                    blank: 'The mild coastal ____ attracts many retirees.',
                    answer: 'climate',
                    translation: '温和的沿海气候吸引了许多退休人士。'
                }
            ]
        },
        {
            id: 'conf-builtin-009',
            title: 'rise / raise / arise',
            words: ['rise', 'raise', 'arise'],
            diffNotes: [
                { word: 'rise', note: '不及物动词（rose, risen），表示自然上升、上涨、起身' },
                { word: 'raise', note: '及物动词（raised, raised），表示举起、筹集、抚养、提出' },
                { word: 'arise', note: '不及物动词（arose, arisen），多指问题、困难或机会出现、产生' }
            ],
            examples: [
                {
                    sentence: 'Prices continue to rise during the holiday season.',
                    blank: 'Prices continue to ____ during the holiday season.',
                    answer: 'rise',
                    translation: '节假日期间物价持续上涨。'
                },
                {
                    sentence: 'They organized a concert to raise money for the school.',
                    blank: 'They organized a concert to ____ money for the school.',
                    answer: 'raise',
                    translation: '他们举办了一场音乐会为学校筹款。'
                },
                {
                    sentence: 'New problems often arise when a team grows too fast.',
                    blank: 'New problems often ____ when a team grows too fast.',
                    answer: 'arise',
                    translation: '团队扩张过快时往往会出现新问题。'
                }
            ]
        },
        {
            id: 'conf-builtin-010',
            title: 'borrow / lend / keep',
            words: ['borrow', 'lend', 'keep'],
            diffNotes: [
                { word: 'borrow', note: '借入（非延续），搭配 borrow sth. from sb.' },
                { word: 'lend', note: '借出（非延续），搭配 lend sth. to sb. / lend sb. sth.' },
                { word: 'keep', note: '保存、借用一段时间（延续性动词，可与 for + 时间段连用）' }
            ],
            examples: [
                {
                    sentence: 'May I borrow your notes from yesterday?',
                    blank: 'May I ____ your notes from yesterday?',
                    answer: 'borrow',
                    translation: '我可以借用一下你昨天的笔记吗？'
                },
                {
                    sentence: 'Could you lend me your umbrella for a moment?',
                    blank: 'Could you ____ me your umbrella for a moment?',
                    answer: 'lend',
                    translation: '能把你的雨伞借我用一下吗？'
                },
                {
                    sentence: 'You can keep this library book for two weeks.',
                    blank: 'You can ____ this library book for two weeks.',
                    answer: 'keep',
                    translation: '这本图书馆的书你可以借阅两周。'
                }
            ]
        },
        {
            id: 'conf-builtin-011',
            title: 'say / speak / talk / tell',
            words: ['say', 'speak', 'talk', 'tell'],
            diffNotes: [
                { word: 'say', note: '强调说话的具体内容，不直接接人作宾语（需用 say to sb.）' },
                { word: 'speak', note: '指开口说话、演讲，或接某种语言（speak English）' },
                { word: 'talk', note: '不及物动词，侧重双方交谈，常用 talk to/with sb. about sth.' },
                { word: 'tell', note: '及物动词，侧重告诉、讲述，常用 tell sb. sth. / tell a story' }
            ],
            examples: [
                {
                    sentence: 'She can speak three foreign languages fluently.',
                    blank: 'She can ____ three foreign languages fluently.',
                    answer: 'speak',
                    translation: '她能流利地讲三门外语。'
                },
                {
                    sentence: 'Please tell me the exact time of the interview.',
                    blank: 'Please ____ me the exact time of the interview.',
                    answer: 'tell',
                    translation: '请告诉我面试的确切时间。'
                },
                {
                    sentence: 'We need to talk with the advisor about our plan.',
                    blank: 'We need to ____ with the advisor about our plan.',
                    answer: 'talk',
                    translation: '我们需要和导师谈谈我们的计划。'
                }
            ]
        },
        {
            id: 'conf-builtin-012',
            title: 'look for / find / find out',
            words: ['look for', 'find', 'find out'],
            diffNotes: [
                { word: 'look for', note: '强调“寻找”的动作和过程' },
                { word: 'find', note: '强调“找到、发现”的结果' },
                { word: 'find out', note: '指经过调查、询问或研究后“查明、弄清楚”真相或信息' }
            ],
            examples: [
                {
                    sentence: 'He is looking for his student card everywhere.',
                    blank: 'He is ____ his student card everywhere.',
                    answer: 'look for',
                    translation: '他正四处寻找他的学生证。'
                },
                {
                    sentence: 'We must find out when the train leaves.',
                    blank: 'We must ____ when the train leaves.',
                    answer: 'find out',
                    translation: '我们必须查清楚火车什么时候发车。'
                },
                {
                    sentence: 'Did you find the missing key under the desk?',
                    blank: 'Did you ____ the missing key under the desk?',
                    answer: 'find',
                    translation: '你在书桌底下找到那把丢失的钥匙了吗？'
                }
            ]
        }
    ];

    // 预留母词/词根族注释表（后续可直接由 tools/confusables_compiler.py --mode root-families 编译 58 组母词导入）
    const rootFamilyNotes = {
        act: {
            group: 1,
            title: 'act 行动',
            rootKeys: ['act'],
            coreMeaning: '行动、做',
            note: 're-(回)+act→react 反应；inter-(相互)+act→interact 互动；trans-(跨越)+act→transaction 交易。'
        },
        port: {
            group: 2,
            title: 'port 搬运、港口',
            rootKeys: ['port'],
            coreMeaning: '搬运、携带、港口',
            note: 'trans-(跨越)+port→transport 运输；im-(入)/ex-(出)+port→import/export；sup-(下)+port→support 支持承载。'
        },
        pend: {
            group: 3,
            title: 'pen 钱 / pend 悬挂',
            rootKeys: ['pen', 'pend'],
            coreMeaning: '称重、花费、悬挂',
            note: 'de-(下)+pend→depend 依靠；sus-(下)+pend→suspend 悬挂/暂停；ex-(出)+pend→expend 花费。'
        },
        vol: {
            group: 4,
            title: 'vol / volv 卷、转',
            rootKeys: ['vol', 'volv'],
            coreMeaning: '卷、旋转',
            note: '辨析：move 是“移动”，“旋转”用 revolve；e-(出)+volve→evolve 进化；in-(入)+volve→involve 卷入涉及。'
        },
        volv: {
            group: 4,
            title: 'vol / volv 卷、转',
            rootKeys: ['vol', 'volv'],
            coreMeaning: '卷、旋转',
            note: '辨析：move 是“移动”，“旋转”用 revolve；e-(出)+volve→evolve 进化；in-(入)+volve→involve 卷入涉及。'
        },
        sens: {
            group: 5,
            title: 'sens / sent 感觉',
            rootKeys: ['sens', 'sent'],
            coreMeaning: '感觉、感知',
            note: '辨析：sensible 表示“明智的、合情理的”，sensitive 表示“敏感的”；con-(共同)+sent→consent 同意。'
        },
        sent: {
            group: 5,
            title: 'sens / sent 感觉',
            rootKeys: ['sens', 'sent'],
            coreMeaning: '感觉、感知',
            note: '辨析：sensible 表示“明智的、合情理的”，sensitive 表示“敏感的”；con-(共同)+sent→consent 同意。'
        },
        tract: {
            group: 6,
            title: 'tract 拉、拖、抽',
            rootKeys: ['tract'],
            coreMeaning: '拉扯、抽取',
            note: 'abs-(离去)+tract→abstract 抽出/抽象的；at-(朝向)+tract→attract 吸引；con-(共同)+tract→contract 收缩/合同。'
        },
        vis: {
            group: 7,
            title: 'vis / vid 看',
            rootKeys: ['vis', 'vid'],
            coreMeaning: '看见、视察',
            note: 're-(再)+vise→revise 修订复习；super-(上)+vise→supervise 监督；pro-(提前)+vide→provide 提供。'
        },
        spect: {
            group: 8,
            title: 'spect / spec 看、观察',
            rootKeys: ['spect', 'spec'],
            coreMeaning: '看、注视',
            note: 're-(回)+spect→respect 尊重；in-(向内)+spect→inspect 检查；pro-(向前)+spect→prospect 前景。'
        }
    };

    return { confusables, rootFamilyNotes };
});
