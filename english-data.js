/**
 * 钟日 - 英语词库数据
 * 英语学习模式：单词 → 释义（二维结构）配有词根拆解功能
 */

const DefaultEnglishWords = [
{
  word: "abandon",
  type: "动词",
  phonetic: "/əˈbændən/",
  meaning: "放弃；抛弃；遗弃",
  example: "They had to abandon the plan due to bad weather. || 由于天气恶劣，他们不得不放弃计划。",
  roots: "a(去)-ban(禁止)-don(给予)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "ability",
  type: "名词",
  phonetic: "/əˈbɪləti/",
  meaning: "能力；才能",
  example: "She has the ability to learn languages quickly. || 她有能力快速学习语言。",
  roots: "abil(能力)-ity(名词后缀)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "abroad",
  type: "副词",
  phonetic: "/əˈbrɔːd/",
  meaning: "在国外；到国外",
  example: "He dreams of studying abroad next year. || 他梦想着明年出国留学。",
  roots: "a(在...)-broad(宽阔)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "absence",
  type: "名词",
  phonetic: "/ˈæbsəns/",
  meaning: "缺席；不在；缺乏",
  example: "In the absence of evidence, the case was dismissed. || 由于缺乏证据，案件被驳回了。",
  roots: "ab(离去)-sence(存在)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "absolute",
  type: "形容词",
  phonetic: "/ˈæbsəluːt/",
  meaning: "绝对的；完全的",
  example: "The experiment requires absolute precision. || 这个实验需要绝对的精确度。",
  roots: "ab(离去)-solute(松开)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "absorb",
  type: "动词",
  phonetic: "/əbˈzɔːb/",
  meaning: "吸收；吸引（注意力）",
  example: "Plants absorb carbon dioxide and release oxygen. || 植物吸收二氧化碳并释放氧气。",
  roots: "ab(离去)-sorb(吸收)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "abstract",
  type: "形容词・名词",
  phonetic: "/ˈæbstrækt/",
  meaning: "抽象的；摘要",
  example: "The concept is too abstract for most people to understand. || 这个概念对大多数人来说太抽象了，难以理解。",
  roots: "abs(离去)-tract(拉扯)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "abundant",
  type: "形容词",
  phonetic: "/əˈbʌndənt/",
  meaning: "丰富的；充裕的",
  example: "The region has abundant natural resources. || 该地区拥有丰富的自然资源。",
  roots: "ab(加强)-und(波浪)-ant(形容词后缀)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "academic",
  type: "形容词・名词",
  phonetic: "/ˌækəˈdemɪk/",
  meaning: "学术的；学者",
  example: "She published several papers in academic journals. || 她在学术期刊上发表了多篇论文。",
  roots: "academy(学院)-ic(形容词后缀)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "accelerate",
  type: "动词",
  phonetic: "/əkˈseləreɪt/",
  meaning: "加速；加快",
  example: "The driver accelerated to overtake the truck. || 司机加速超车，超过了那辆卡车。",
  roots: "ac(加强)-celer(速度)-ate(动词后缀)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "access",
  type: "名词・动词",
  phonetic: "/ˈækses/",
  meaning: "进入；通道；访问",
  example: "Students have free access to the library database. || 学生可以免费使用图书馆的数据库。",
  roots: "ac(加强)-cess(走)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "accommodate",
  type: "动词",
  phonetic: "/əˈkɒmədeɪt/",
  meaning: "容纳；提供住宿；适应",
  example: "The hotel can accommodate up to 500 guests. || 这家酒店最多可容纳500位客人。",
  roots: "ac(加强)-com(共同)-mod(模式)-ate(动词后缀)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "accompany",
  type: "动词",
  phonetic: "/əˈkʌmpəni/",
  meaning: "陪伴；伴随",
  example: "She asked me to accompany her to the party. || 她请我陪她去参加派对。",
  roots: "ac(加强)-company(同伴)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "accomplish",
  type: "动词",
  phonetic: "/əˈkʌmplɪʃ/",
  meaning: "完成；实现；达到",
  example: "He accomplished his goal of running a marathon. || 他实现了跑马拉松的目标。",
  roots: "ac(加强)-com(共同)-pli(填满)-sh(动词后缀)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "accurate",
  type: "形容词",
  phonetic: "/ˈækjərət/",
  meaning: "准确的；精确的",
  example: "The weather forecast turned out to be accurate. || 天气预报结果证明是准确的。",
  roots: "ac(加强)-cur(关心)-ate(形容词后缀)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "achieve",
  type: "动词",
  phonetic: "/əˈtʃiːv/",
  meaning: "达到；取得；实现",
  example: "She worked hard to achieve her dreams. || 她努力工作以实现自己的梦想。",
  roots: "a(去)-chieve(头)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "acknowledge",
  type: "动词",
  phonetic: "/əkˈnɒlɪdʒ/",
  meaning: "承认；认可；感谢",
  example: "He refused to acknowledge his mistake. || 他拒绝承认自己的错误。",
  roots: "ac(加强)-knowledge(知识)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "acquire",
  type: "动词",
  phonetic: "/əˈkwaɪər/",
  meaning: "获得；习得",
  example: "It takes years to acquire a new language fluently. || 流利掌握一门新语言需要多年时间。",
  roots: "ac(加强)-quire(寻求)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "adapt",
  type: "动词",
  phonetic: "/əˈdæpt/",
  meaning: "适应；改编",
  example: "Animals must adapt to changing environments. || 动物必须适应不断变化的环境。",
  roots: "ad(加强)-apt(适合)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "adequate",
  type: "形容词",
  phonetic: "/ˈædɪkwət/",
  meaning: "足够的；适当的",
  example: "The room is adequate for our needs. || 这个房间足以满足我们的需求。",
  roots: "ad(加强)-equ(平等)-ate(形容词后缀)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "adjust",
  type: "动词",
  phonetic: "/əˈdʒʌst/",
  meaning: "调整；适应",
  example: "You can adjust the volume with this button. || 你可以用这个按钮调节音量。",
  roots: "ad(加强)-just(正确)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "administration",
  type: "名词",
  phonetic: "/ədˌmɪnɪˈstreɪʃn/",
  meaning: "管理；行政；政府",
  example: "The new administration introduced several reforms. || 新一届政府推行了多项改革。",
  roots: "ad(加强)-minister(服务)-ation(名词后缀)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "admire",
  type: "动词",
  phonetic: "/ədˈmaɪər/",
  meaning: "钦佩；赞赏",
  example: "I really admire her dedication to work. || 我真的很钦佩她对工作的奉献精神。",
  roots: "ad(加强)-mire(惊奇)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "adopt",
  type: "动词",
  phonetic: "/əˈdɒpt/",
  meaning: "采用；收养",
  example: "The company decided to adopt a new strategy. || 公司决定采用一项新策略。",
  roots: "ad(加强)-opt(选择)",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "advance",
  type: "动词・名词",
  phonetic: "/ədˈvɑːns/",
  meaning: "前进；进步；预付款",
  example: "Technology continues to advance at a rapid pace. || 科技继续以惊人的速度发展。",
  roots: "ad(加强)-van(前方)-ce(名词/动词后缀)",
  folder: "四级词汇",
  lang: "en"
}
];


/* 第五轮元数据默认值：当前英语样例属于四级词库，难度等待逐词标注。 */
DefaultEnglishWords.forEach((word, index) => {
  word._id = word._id || `en-cet4-${String(index + 1).padStart(6, '0')}`;
  word.level = word.level || 'CET-4';
  word.difficulty = Number.isInteger(word.difficulty) ? word.difficulty : 0;
  word.tags = Array.isArray(word.tags) ? word.tags : [];
  word.builtIn = true;
});
