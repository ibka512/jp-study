/**
 * 钟日 - 英语词库数据
 * 英语学习模式：单词 → 释义（二维结构）
 */

const DefaultEnglishWords = [
{
  word: "abandon",
  type: "动词",
  phonetic: "/əˈbændən/",
  meaning: "放弃；抛弃；遗弃",
  example: "They had to abandon the plan due to bad weather. || 由于天气恶劣，他们不得不放弃计划。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "ability",
  type: "名词",
  phonetic: "/əˈbɪləti/",
  meaning: "能力；才能",
  example: "She has the ability to learn languages quickly. || 她有能力快速学习语言。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "abroad",
  type: "副词",
  phonetic: "/əˈbrɔːd/",
  meaning: "在国外；到国外",
  example: "He dreams of studying abroad next year. || 他梦想着明年出国留学。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "absence",
  type: "名词",
  phonetic: "/ˈæbsəns/",
  meaning: "缺席；不在；缺乏",
  example: "In the absence of evidence, the case was dismissed. || 由于缺乏证据，案件被驳回了。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "absolute",
  type: "形容词",
  phonetic: "/ˈæbsəluːt/",
  meaning: "绝对的；完全的",
  example: "The experiment requires absolute precision. || 这个实验需要绝对的精确度。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "absorb",
  type: "动词",
  phonetic: "/əbˈzɔːb/",
  meaning: "吸收；吸引（注意力）",
  example: "Plants absorb carbon dioxide and release oxygen. || 植物吸收二氧化碳并释放氧气。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "abstract",
  type: "形容词・名词",
  phonetic: "/ˈæbstrækt/",
  meaning: "抽象的；摘要",
  example: "The concept is too abstract for most people to understand. || 这个概念对大多数人来说太抽象了，难以理解。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "abundant",
  type: "形容词",
  phonetic: "/əˈbʌndənt/",
  meaning: "丰富的；充裕的",
  example: "The region has abundant natural resources. || 该地区拥有丰富的自然资源。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "academic",
  type: "形容词・名词",
  phonetic: "/ˌækəˈdemɪk/",
  meaning: "学术的；学者",
  example: "She published several papers in academic journals. || 她在学术期刊上发表了多篇论文。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "accelerate",
  type: "动词",
  phonetic: "/əkˈseləreɪt/",
  meaning: "加速；加快",
  example: "The driver accelerated to overtake the truck. || 司机加速超车，超过了那辆卡车。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "access",
  type: "名词・动词",
  phonetic: "/ˈækses/",
  meaning: "进入；通道；访问",
  example: "Students have free access to the library database. || 学生可以免费使用图书馆的数据库。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "accommodate",
  type: "动词",
  phonetic: "/əˈkɒmədeɪt/",
  meaning: "容纳；提供住宿；适应",
  example: "The hotel can accommodate up to 500 guests. || 这家酒店最多可容纳500位客人。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "accompany",
  type: "动词",
  phonetic: "/əˈkʌmpəni/",
  meaning: "陪伴；伴随",
  example: "She asked me to accompany her to the party. || 她请我陪她去参加派对。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "accomplish",
  type: "动词",
  phonetic: "/əˈkʌmplɪʃ/",
  meaning: "完成；实现；达到",
  example: "He accomplished his goal of running a marathon. || 他实现了跑马拉松的目标。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "accurate",
  type: "形容词",
  phonetic: "/ˈækjərət/",
  meaning: "准确的；精确的",
  example: "The weather forecast turned out to be accurate. || 天气预报结果证明是准确的。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "achieve",
  type: "动词",
  phonetic: "/əˈtʃiːv/",
  meaning: "达到；取得；实现",
  example: "She worked hard to achieve her dreams. || 她努力工作以实现自己的梦想。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "acknowledge",
  type: "动词",
  phonetic: "/əkˈnɒlɪdʒ/",
  meaning: "承认；认可；感谢",
  example: "He refused to acknowledge his mistake. || 他拒绝承认自己的错误。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "acquire",
  type: "动词",
  phonetic: "/əˈkwaɪər/",
  meaning: "获得；习得",
  example: "It takes years to acquire a new language fluently. || 流利掌握一门新语言需要多年时间。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "adapt",
  type: "动词",
  phonetic: "/əˈdæpt/",
  meaning: "适应；改编",
  example: "Animals must adapt to changing environments. || 动物必须适应不断变化的环境。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "adequate",
  type: "形容词",
  phonetic: "/ˈædɪkwət/",
  meaning: "足够的；适当的",
  example: "The room is adequate for our needs. || 这个房间足以满足我们的需求。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "adjust",
  type: "动词",
  phonetic: "/əˈdʒʌst/",
  meaning: "调整；适应",
  example: "You can adjust the volume with this button. || 你可以用这个按钮调节音量。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "administration",
  type: "名词",
  phonetic: "/ədˌmɪnɪˈstreɪʃn/",
  meaning: "管理；行政；政府",
  example: "The new administration introduced several reforms. || 新一届政府推行了多项改革。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "admire",
  type: "动词",
  phonetic: "/ədˈmaɪər/",
  meaning: "钦佩；赞赏",
  example: "I really admire her dedication to work. || 我真的很钦佩她对工作的奉献精神。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "adopt",
  type: "动词",
  phonetic: "/əˈdɒpt/",
  meaning: "采用；收养",
  example: "The company decided to adopt a new strategy. || 公司决定采用一项新策略。",
  folder: "四级词汇",
  lang: "en"
},
{
  word: "advance",
  type: "动词・名词",
  phonetic: "/ədˈvɑːns/",
  meaning: "前进；进步；预付款",
  example: "Technology continues to advance at a rapid pace. || 科技继续以惊人的速度发展。",
  folder: "四级词汇",
  lang: "en"
}
];
