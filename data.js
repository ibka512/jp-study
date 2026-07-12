/**
 * 钟日 - 日语词库（开发精简版，25词）
 */

const DefaultWords = [
{
  _id: "builtin-ja-core-00001",
  builtIn: true,
  word: "気",
  kana: "き",
  type: "名词",
  meaning: "精神；心情；注意力。",
  example: "$\\overset{きせつ}{季節}$の$\\overset{か}{変}$わり$\\overset{め}{目}$は$\\overset{き}{気}$をつけてください。/季节交替时请多加留意。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00002",
  builtIn: true,
  word: "季節",
  kana: "きせつ",
  type: "名词",
  meaning: "季节。",
  example: "$\\overset{き}{気}$のせいか、$\\overset{ことし}{今年}$の$\\overset{きせつ}{季節}$の$\\overset{か}{変}$わり$\\overset{め}{目}$は$\\overset{はや}{早}$い。/不知道是不是心理作用，今年的季节交替感觉很早。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00003",
  builtIn: true,
  word: "気持ち",
  kana: "きもち",
  type: "名词",
  meaning: "心情；感觉。",
  example: "$\\overset{しんせん}{新鮮}$な$\\overset{くうき}{空気}$を$\\overset{す}{吸}$うと、$\\overset{きも}{気持}$ちが$\\overset{よ}{良}$くなる。/呼吸新鲜空气后，心情会变好。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00004",
  builtIn: true,
  word: "空気",
  kana: "くうき",
  type: "名词",
  meaning: "空气；气氛。",
  example: "ここはおいしい$\\overset{くうき}{空気}$があって、$\\overset{げんき}{元気}$が$\\overset{で}{出}$る。/这里空气清新，让人充满活力。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00005",
  builtIn: true,
  word: "元気",
  kana: "げんき",
  type: "名・形动",
  meaning: "精神充沛，健康。",
  example: "$\\overset{かぜ}{風邪}$を$\\overset{ひ}{引}$いたが、もう$\\overset{げんき}{元気}$を$\\overset{と}{取}$り$\\overset{もど}{戻}$した。/虽然感冒了，但已经恢复了精神。 || $\\overset{かれ}{彼}$は$\\overset{しごと}{仕事}$で$\\overset{いそが}{忙}$しいが、いつも$\\overset{げんき}{元気}$だ。/他虽然工作很忙，但总是精神饱满。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00006",
  builtIn: true,
  word: "仕事",
  kana: "しごと",
  type: "名・サ变动词する自",
  meaning: "工作，职业。",
  example: "$\\overset{しょうがつ}{正月}$が$\\overset{お}{終}$わって、$\\overset{あした}{明日}$から$\\overset{しごと}{仕事}$だ。/正月过完了，明天开始工作。 || $\\overset{まいにち}{毎日}$$\\overset{よる}{夜}$$\\overset{おそ}{遅}$くまで$\\overset{しごと}{仕事}$をしている。/每天工作到深夜。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00007",
  builtIn: true,
  word: "正月",
  kana: "しょうがつ",
  type: "名词",
  meaning: "新年，正月。",
  example: "$\\overset{しょうがつ}{正月}$に$\\overset{かぞく}{家族}$と$\\overset{いっしょ}{一緒}$に$\\overset{しょくじ}{食事}$をした。/过年时和家人一起吃了饭。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00008",
  builtIn: true,
  word: "食事",
  kana: "しょくじ",
  type: "名・サ变动词する自",
  meaning: "进餐，吃饭。",
  example: "バランスの$\\overset{よ}{良}$い$\\overset{しょくじ}{食事}$は$\\overset{けんこう}{健康}$にいい。/均衡的饮食对健康有益。 || $\\overset{せんげつ}{先月}$、あのレストランで$\\overset{しょくじ}{食事}$した。/上个月在那家餐厅吃了饭。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00009",
  builtIn: true,
  word: "新聞",
  kana: "しんぶん",
  type: "名词",
  meaning: "报纸。",
  example: "$\\overset{せんげつ}{先月}$の$\\overset{しんぶん}{新聞}$を$\\overset{す}{捨}$てて、$\\overset{そうじ}{掃除}$をした。/把上个月的报纸扔掉，打扫了卫生。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00010",
  builtIn: true,
  word: "洗濯",
  kana: "せんたく",
  type: "名・サ变动词する他",
  meaning: "洗衣服。",
  example: "$\\overset{きょう}{今日}$は$\\overset{てんき}{天気}$がいいので、$\\overset{せんたく}{洗濯}$の$\\overset{ひ}{日}$だ。/今天天气好，是个洗衣服的日子。 || $\\overset{しゅうまつ}{週末}$に$\\overset{ふく}{服}$をまとめて$\\overset{せんたく}{洗濯}$する。/周末把衣服集中起来洗。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00011",
  builtIn: true,
  word: "天気",
  kana: "てんき",
  type: "名词",
  meaning: "天气。",
  example: "$\\overset{てんき}{天気}$の$\\overset{へんか}{変化}$が$\\overset{はげ}{激}$しいので、$\\overset{き}{気}$をつけてください。/天气变化剧烈，请多加小心。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00012",
  builtIn: true,
  word: "時計",
  kana: "とけい",
  type: "名词",
  meaning: "钟表。",
  example: "$\\overset{とけい}{時計}$を$\\overset{み}{見}$たら、$\\overset{にゅういん}{入院}$の$\\overset{じかん}{時間}$が$\\overset{ちか}{近}$づいていた。/看了看表，发现快到入院的时间了。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00013",
  builtIn: true,
  word: "入院",
  kana: "にゅういん",
  type: "名・サ变动词する自",
  meaning: "住院。",
  example: "$\\overset{かれ}{彼}$の$\\overset{にゅういん}{入院}$の$\\overset{りゆう}{理由}$は$\\overset{びょうき}{病気}$です。/他住院的原因是生病了。 || $\\overset{おも}{重}$い$\\overset{びょうき}{病気}$で$\\overset{びょういん}{病院}$に$\\overset{にゅういん}{入院}$することになった。/因为生重病，决定住院了。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00014",
  builtIn: true,
  word: "病気",
  kana: "びょうき",
  type: "名词",
  meaning: "疾病，生病。",
  example: "$\\overset{びょうき}{病気}$が$\\overset{なお}{治}$って、$\\overset{ぶじ}{無事}$に$\\overset{たいいん}{退院}$した。/病好了，平安出院了。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00015",
  builtIn: true,
  word: "無事",
  kana: "ぶじ",
  type: "名・形动",
  meaning: "平安，无事。",
  example: "$\\overset{かぞく}{家族}$の$\\overset{ぶじ}{無事}$を$\\overset{いの}{祈}$る。/祈求家人平安。 || $\\overset{じこ}{事故}$に$\\overset{あ}{遭}$ったが、$\\overset{かれ}{彼}$は$\\overset{ぶじ}{無事}$だった。/虽然遭遇了事故，但他平安无事。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00016",
  builtIn: true,
  word: "変化",
  kana: "へんか",
  type: "名・サ变动词する自他",
  meaning: "变化。",
  example: "$\\overset{ちかごろ}{近頃}$、$\\overset{きこう}{気候}$の$\\overset{へんか}{変化}$が$\\overset{はげ}{激}$しい。/最近气候变化很剧烈。 || $\\overset{じだい}{時代}$とともにもう$\\overset{へんか}{変化}$している。/已经随着时代发生了变化。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00017",
  builtIn: true,
  word: "返事",
  kana: "へんじ",
  type: "名・サ变动词する自",
  meaning: "回答，答复。",
  example: "$\\overset{てがみ}{手紙}$の$\\overset{へんじ}{返事}$を$\\overset{ほんだな}{本棚}$に$\\overset{お}{置}$いた。/把回信放在了书架上。 || $\\overset{なまえ}{名前}$を$\\overset{よ}{呼}$ばれたら、$\\overset{おお}{大}$きな$\\overset{こえ}{声}$で$\\overset{へんじ}{返事}$をしなさい。/被叫到名字的话，请大声回答。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00018",
  builtIn: true,
  word: "勇気",
  kana: "ゆうき",
  type: "名词",
  meaning: "勇气。",
  example: "$\\overset{こんなん}{困難}$に$\\overset{た}{立}$ち$\\overset{む}{向}$かう$\\overset{ゆうき}{勇気}$を$\\overset{も}{持}$ってください。/请拿出面对困难的勇气。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00019",
  builtIn: true,
  word: "油断",
  kana: "ゆだん",
  type: "名・サ变动词する自",
  meaning: "疏忽，大意。",
  example: "$\\overset{ゆだん}{油断}$$\\overset{たいてき}{大敵}$という$\\overset{ことば}{言葉}$を$\\overset{おぼ}{覚}$えておこう。/记住“疏忽是大敌”这句话吧。 || $\\overset{あんぜん}{安全}$だからといって、$\\overset{ゆだん}{油断}$してはいけない。/不能因为安全就掉以轻心。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00020",
  builtIn: true,
  word: "料理",
  kana: "りょうり",
  type: "名・サ变动词する他",
  meaning: "菜肴；烹饪。",
  example: "$\\overset{はは}{母}$の$\\overset{つく}{作}$った$\\overset{りょうり}{料理}$はとても$\\overset{おい}{美味}$しい。/妈妈做的菜非常好吃。 || $\\overset{しょうがつ}{正月}$に$\\overset{おせちりょうり}{御節料理}$を$\\overset{りょうり}{料理}$した。/过年的时候做了御节料理。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00021",
  builtIn: true,
  word: "安全",
  kana: "あんぜん",
  type: "名・形动",
  meaning: "安全。",
  example: "$\\overset{こうつう}{交通}$$\\overset{あんぜん}{安全}$に$\\overset{じゅうぶん}{十分}$$\\overset{き}{気}$をつけてください。/请充分注意交通安全。 || あの$\\overset{いち}{位置}$はとても$\\overset{あんぜん}{安全}$だと$\\overset{おも}{思}$う。/我觉得那个位置很安全。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00022",
  builtIn: true,
  word: "位置",
  kana: "いち",
  type: "名・サ变动词",
  meaning: "位置，方位。",
  example: "$\\overset{がっこう}{学校}$の$\\overset{いち}{位置}$を$\\overset{ちず}{地図}$で$\\overset{かくにん}{確認}$する。/在地图上确认学校的位置。 || $\\overset{わたし}{私}$の$\\overset{いえ}{家}$は$\\overset{えき}{駅}$の$\\overset{ちか}{近}$くに$\\overset{いち}{位置}$している。/我家位于车站附近。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00023",
  builtIn: true,
  word: "家事",
  kana: "かじ",
  type: "名词",
  meaning: "家务。",
  example: "$\\overset{はは}{母}$は$\\overset{まいにち}{毎日}$$\\overset{かじ}{家事}$で$\\overset{いそが}{忙}$しい。/妈妈每天忙于家务。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00024",
  builtIn: true,
  word: "計画",
  kana: "けいかく",
  type: "名・サ变动词する他",
  meaning: "计划。",
  example: "$\\overset{りょこう}{旅行}$の$\\overset{けいかく}{計画}$を$\\overset{た}{立}$てる。/制定旅行计划。 || $\\overset{なつやす}{夏休}$みに$\\overset{うみ}{海}$へ$\\overset{い}{行}$くことを$\\overset{けいかく}{計画}$している。/正计划暑假去海边。",
  lang: "ja"
},
{
  _id: "builtin-ja-core-00025",
  builtIn: true,
  word: "警察",
  kana: "けいさつ",
  type: "名词",
  meaning: "警察，警察局。",
  example: "$\\overset{じけん}{事件}$が$\\overset{お}{起}$きて、すぐ$\\overset{けいさつ}{警察}$を$\\overset{よ}{呼}$んだ。/发生了案件，立刻叫了警察。",
  lang: "ja"
}
];

const Gojuon = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ".split('');


/* 第五轮元数据默认值：后续正式词库请在每条数据中明确填写 level 与 difficulty。 */
DefaultWords.forEach((word, index) => {
  word._id = word._id || `ja-built-in-${String(index + 1).padStart(6, '0')}`;
  word.level = word.level || '';
  word.difficulty = Number.isInteger(word.difficulty) ? word.difficulty : 0;
  word.tags = Array.isArray(word.tags) ? word.tags : [];
  word.builtIn = true;
});
