/**
 * 钟摆日语 - 词库与常量数据
 */

const DefaultWords = [
{
  word: "気",
  kana: "き",
  type: "名词",
  meaning: "精神；心情；注意力。",
  example: "$\\overset{きせつ}{季節}$の$\\overset{か}{変}$わり$\\overset{め}{目}$は$\\overset{き}{気}$をつけてください。/季节交替时请多加留意。"
},
{
  word: "季節",
  kana: "きせつ",
  type: "名词",
  meaning: "季节。",
  example: "$\\overset{き}{気}$のせいか、$\\overset{ことし}{今年}$の$\\overset{きせつ}{季節}$の$\\overset{か}{変}$わり$\\overset{め}{目}$は$\\overset{はや}{早}$い。/不知道是不是心理作用，今年的季节交替感觉很早。"
},
{
  word: "気持ち",
  kana: "きもち",
  type: "名词",
  meaning: "心情；感觉。",
  example: "$\\overset{しんせん}{新鮮}$な$\\overset{くうき}{空気}$を$\\overset{す}{吸}$うと、$\\overset{きも}{気持}$ちが$\\overset{よ}{良}$くなる。/呼吸新鲜空气后，心情会变好。"
},
{
  word: "空気",
  kana: "くうき",
  type: "名词",
  meaning: "空气；气氛。",
  example: "ここはおいしい$\\overset{くうき}{空気}$があって、$\\overset{げんき}{元気}$が$\\overset{で}{出}$る。/这里空气清新，让人充满活力。"
},
{
  word: "元気",
  kana: "げんき",
  type: "名・形动",
  meaning: "精神充沛，健康。",
  example: "$\\overset{かぜ}{風邪}$を$\\overset{ひ}{引}$いたが、もう$\\overset{げんき}{元気}$を$\\overset{と}{取}$り$\\overset{もど}{戻}$した。/虽然感冒了，但已经恢复了精神。 || $\\overset{かれ}{彼}$は$\\overset{しごと}{仕事}$で$\\overset{いそが}{忙}$しいが、いつも$\\overset{げんき}{元気}$だ。/他虽然工作很忙，但总是精神饱满。"
},
{
  word: "仕事",
  kana: "しごと",
  type: "名・サ变动词する自",
  meaning: "工作，职业。",
  example: "$\\overset{しょうがつ}{正月}$が$\\overset{お}{終}$わって、$\\overset{あした}{明日}$から$\\overset{しごと}{仕事}$だ。/正月过完了，明天开始工作。 || $\\overset{まいにち}{毎日}$$\\overset{よる}{夜}$$\\overset{おそ}{遅}$くまで$\\overset{しごと}{仕事}$をしている。/每天工作到深夜。"
},
{
  word: "正月",
  kana: "しょうがつ",
  type: "名词",
  meaning: "新年，正月。",
  example: "$\\overset{しょうがつ}{正月}$に$\\overset{かぞく}{家族}$と$\\overset{いっしょ}{一緒}$に$\\overset{しょくじ}{食事}$をした。/过年时和家人一起吃了饭。"
},
{
  word: "食事",
  kana: "しょくじ",
  type: "名・サ变动词する自",
  meaning: "进餐，吃饭。",
  example: "バランスの$\\overset{よ}{良}$い$\\overset{しょくじ}{食事}$は$\\overset{けんこう}{健康}$にいい。/均衡的饮食对健康有益。 || $\\overset{せんげつ}{先月}$、あのレストランで$\\overset{しょくじ}{食事}$した。/上个月在那家餐厅吃了饭。"
},
{
  word: "新聞",
  kana: "しんぶん",
  type: "名词",
  meaning: "报纸。",
  example: "$\\overset{せんげつ}{先月}$の$\\overset{しんぶん}{新聞}$を$\\overset{す}{捨}$てて、$\\overset{そうじ}{掃除}$をした。/把上个月的报纸扔掉，打扫了卫生。"
},
{
  word: "先月",
  kana: "せんげつ",
  type: "名词",
  meaning: "上个月。",
  example: "$\\overset{せんげつ}{先月}$、$\\overset{あたら}{新}$しい$\\overset{せんたく}{洗濯}$$\\overset{き}{機}$を$\\overset{か}{買}$った。/上个月买了新的洗衣机。"
},
{
  word: "洗濯",
  kana: "せんたく",
  type: "名・サ变动词する他",
  meaning: "洗衣服。",
  example: "$\\overset{きょう}{今日}$は$\\overset{てんき}{天気}$がいいので、$\\overset{せんたく}{洗濯}$の$\\overset{ひ}{日}$だ。/今天天气好，是个洗衣服的日子。 || $\\overset{しゅうまつ}{週末}$に$\\overset{ふく}{服}$をまとめて$\\overset{せんたく}{洗濯}$する。/周末把衣服集中起来洗。"
},
{
  word: "掃除",
  kana: "そうじ",
  type: "名・サ变动词する他",
  meaning: "打扫，清扫。",
  example: "$\\overset{へや}{部屋}$の$\\overset{そうじ}{掃除}$をしてから、$\\overset{で}{出}$かける。/打扫完房间再出门。 || $\\overset{まいにち}{毎日}$$\\overset{きょうしつ}{教室}$を$\\overset{そうじ}{掃除}$しなければならない。/每天都必须打扫教室。"
},
{
  word: "中華料理",
  kana: "ちゅうかりょうり",
  type: "名词",
  meaning: "中国菜。",
  example: "$\\overset{きのう}{昨日}$、$\\overset{おい}{美味}$しい$\\overset{ちゅうかりょうり}{中華料理}$の$\\overset{みせ}{店}$を$\\overset{み}{見}$つけた。/昨天找到了一家很好吃的中餐馆。"
},
{
  word: "天気",
  kana: "てんき",
  type: "名词",
  meaning: "天气。",
  example: "$\\overset{てんき}{天気}$の$\\overset{へんか}{変化}$が$\\overset{はげ}{激}$しいので、$\\overset{き}{気}$をつけてください。/天气变化剧烈，请多加小心。"
},
{
  word: "時計",
  kana: "とけい",
  type: "名词",
  meaning: "钟表。",
  example: "$\\overset{とけい}{時計}$を$\\overset{み}{見}$たら、$\\overset{にゅういん}{入院}$の$\\overset{じかん}{時間}$が$\\overset{ちか}{近}$づいていた。/看了看表，发现快到入院的时间了。"
},
{
  word: "入院",
  kana: "にゅういん",
  type: "名・サ变动词する自",
  meaning: "住院。",
  example: "$\\overset{かれ}{彼}$の$\\overset{にゅういん}{入院}$の$\\overset{りゆう}{理由}$は$\\overset{びょうき}{病気}$です。/他住院的原因是生病了。 || $\\overset{おも}{重}$い$\\overset{びょうき}{病気}$で$\\overset{びょういん}{病院}$に$\\overset{にゅういん}{入院}$することになった。/因为生重病，决定住院了。"
},
{
  word: "病気",
  kana: "びょうき",
  type: "名词",
  meaning: "疾病，生病。",
  example: "$\\overset{びょうき}{病気}$が$\\overset{なお}{治}$って、$\\overset{ぶじ}{無事}$に$\\overset{たいいん}{退院}$した。/病好了，平安出院了。"
},
{
  word: "無事",
  kana: "ぶじ",
  type: "名・形动",
  meaning: "平安，无事。",
  example: "$\\overset{かぞく}{家族}$の$\\overset{ぶじ}{無事}$を$\\overset{いの}{祈}$る。/祈求家人平安。 || $\\overset{じこ}{事故}$に$\\overset{あ}{遭}$ったが、$\\overset{かれ}{彼}$は$\\overset{ぶじ}{無事}$だった。/虽然遭遇了事故，但他平安无事。"
},
{
  word: "変化",
  kana: "へんか",
  type: "名・サ变动词する自他",
  meaning: "变化。",
  example: "$\\overset{ちかごろ}{近頃}$、$\\overset{きこう}{気候}$の$\\overset{へんか}{変化}$が$\\overset{はげ}{激}$しい。/最近气候变化很剧烈。 || $\\overset{じだい}{時代}$とともにもう$\\overset{へんか}{変化}$している。/已经随着时代发生了变化。"
},
{
  word: "返事",
  kana: "へんじ",
  type: "名・サ变动词する自",
  meaning: "回答，答复。",
  example: "$\\overset{てがみ}{手紙}$の$\\overset{へんじ}{返事}$を$\\overset{ほんだな}{本棚}$に$\\overset{お}{置}$いた。/把回信放在了书架上。 || $\\overset{なまえ}{名前}$を$\\overset{よ}{呼}$ばれたら、$\\overset{おお}{大}$きな$\\overset{こえ}{声}$で$\\overset{へんじ}{返事}$をしなさい。/被叫到名字的话，请大声回答。"
},
{
  word: "本棚",
  kana: "ほんだな",
  type: "名词",
  meaning: "书架。",
  example: "$\\overset{ほんだな}{本棚}$の$\\overset{せいり}{整理}$をするのに$\\overset{ゆうき}{勇気}$がいる。/整理书架需要一点勇气（因为书太多）。"
},
{
  word: "勇気",
  kana: "ゆうき",
  type: "名词",
  meaning: "勇气。",
  example: "$\\overset{こんなん}{困難}$に$\\overset{た}{立}$ち$\\overset{む}{向}$かう$\\overset{ゆうき}{勇気}$を$\\overset{も}{持}$ってください。/请拿出面对困难的勇气。"
},
{
  word: "油断",
  kana: "ゆだん",
  type: "名・サ变动词する自",
  meaning: "疏忽，大意。",
  example: "$\\overset{ゆだん}{油断}$$\\overset{たいてき}{大敵}$という$\\overset{ことば}{言葉}$を$\\overset{おぼ}{覚}$えておこう。/记住“疏忽是大敌”这句话吧。 || $\\overset{あんぜん}{安全}$だからといって、$\\overset{ゆだん}{油断}$してはいけない。/不能因为安全就掉以轻心。"
},
{
  word: "料理",
  kana: "りょうり",
  type: "名・サ变动词する他",
  meaning: "菜肴；烹饪。",
  example: "$\\overset{はは}{母}$の$\\overset{つく}{作}$った$\\overset{りょうり}{料理}$はとても$\\overset{おい}{美味}$しい。/妈妈做的菜非常好吃。 || $\\overset{しょうがつ}{正月}$に$\\overset{おせちりょうり}{御節料理}$を$\\overset{りょうり}{料理}$した。/过年的时候做了御节料理。"
},
{
  word: "安全",
  kana: "あんぜん",
  type: "名・形动",
  meaning: "安全。",
  example: "$\\overset{こうつう}{交通}$$\\overset{あんぜん}{安全}$に$\\overset{じゅうぶん}{十分}$$\\overset{き}{気}$をつけてください。/请充分注意交通安全。 || あの$\\overset{いち}{位置}$はとても$\\overset{あんぜん}{安全}$だと$\\overset{おも}{思}$う。/我觉得那个位置很安全。"
},
{
  word: "位置",
  kana: "いち",
  type: "名・サ变动词",
  meaning: "位置，方位。",
  example: "$\\overset{がっこう}{学校}$の$\\overset{いち}{位置}$を$\\overset{ちず}{地図}$で$\\overset{かくにん}{確認}$する。/在地图上确认学校的位置。 || $\\overset{わたし}{私}$の$\\overset{いえ}{家}$は$\\overset{えき}{駅}$の$\\overset{ちか}{近}$くに$\\overset{いち}{位置}$している。/我家位于车站附近。"
},
{
  word: "映像",
  kana: "えいぞう",
  type: "名词",
  meaning: "影像，视频。",
  example: "$\\overset{かじ}{家事}$をしながら、テレビの$\\overset{えいぞう}{映像}$を$\\overset{み}{見}$る。/一边做家务，一边看电视里的影像。"
},
{
  word: "御節料理",
  kana: "おせちりょうり",
  type: "名词",
  meaning: "新年佳肴，御节料理。",
  example: "$\\overset{しょうがつ}{正月}$に$\\overset{かぞく}{家族}$と$\\overset{おせちりょうり}{御節料理}$を$\\overset{た}{食}$べた。/过年时和家人吃了御节料理。"
},
{
  word: "家事",
  kana: "かじ",
  type: "名词",
  meaning: "家务。",
  example: "$\\overset{はは}{母}$は$\\overset{まいにち}{毎日}$$\\overset{かじ}{家事}$で$\\overset{いそが}{忙}$しい。/妈妈每天忙于家务。"
},
{
  word: "火事",
  kana: "かじ",
  type: "名词",
  meaning: "火灾。",
  example: "$\\overset{ちか}{近}$くで$\\overset{かじ}{火事}$があり、$\\overset{きゅう}{急}$に$\\overset{そと}{外}$へ$\\overset{に}{逃}$げた。/附近发生了火灾，急忙逃到了外面。"
},
{
  word: "気候",
  kana: "きこう",
  type: "名词",
  meaning: "气候。",
  example: "この$\\overset{ちいき}{地域}$の$\\overset{きこう}{気候}$はとても$\\overset{す}{過}$ごしやすい。/这个地区的气候非常宜人。"
},
{
  word: "気付く",
  kana: "きづく",
  type: "五段动词自",
  meaning: "发觉，注意到。",
  example: "$\\overset{かれ}{彼}$が$\\overset{きづ}{気付}$いたときには、もう$\\overset{おそ}{遅}$かった。/当他发觉的时候，已经太迟了。"
},
{
  word: "気の毒",
  kana: "きのどく",
  type: "名・形动",
  meaning: "可怜，遗憾。",
  example: "$\\overset{かれ}{彼}$の$\\overset{しっぱい}{失敗}$を$\\overset{き}{気}$の$\\overset{どく}{毒}$に$\\overset{おも}{思}$う。/对他的失败感到遗憾/可怜。 || $\\overset{き}{気}$の$\\overset{どく}{毒}$な$\\overset{じじょう}{事情}$があって、$\\overset{がっこう}{学校}$をやめた。/因为一些可怜的情况，退学了。"
},
{
  word: "気分",
  kana: "きぶん",
  type: "名词",
  meaning: "心情；身体状况。",
  example: "$\\overset{きゅう}{急}$に$\\overset{きぶん}{気分}$が$\\overset{わる}{悪}$くなって、$\\overset{たお}{倒}$れてしまった。/突然觉得不舒服，就倒下了。"
},
{
  word: "急",
  kana: "きゅう",
  type: "名・形动・副",
  meaning: "突然；紧急；陡峭。",
  example: "$\\overset{きゅう}{急}$な$\\overset{ようじ}{用事}$ができて、$\\overset{い}{行}$けなくなりました。/有了急事，去不了了。 || $\\overset{きゅう}{急}$な$\\overset{さかみち}{坂道}$を$\\overset{のぼ}{登}$る。/爬陡峭的坡道。"
},
{
  word: "計画",
  kana: "けいかく",
  type: "名・サ变动词する他",
  meaning: "计划。",
  example: "$\\overset{りょこう}{旅行}$の$\\overset{けいかく}{計画}$を$\\overset{た}{立}$てる。/制定旅行计划。 || $\\overset{なつやす}{夏休}$みに$\\overset{うみ}{海}$へ$\\overset{い}{行}$くことを$\\overset{けいかく}{計画}$している。/正计划暑假去海边。"
},
{
  word: "景気",
  kana: "けいき",
  type: "名词",
  meaning: "经济状况，景气。",
  example: "$\\overset{さいきん}{最近}$、$\\overset{けいき}{景気}$が$\\overset{かいふく}{回復}$してきたようだ。/最近经济状况似乎恢复了。"
},
{
  word: "警察",
  kana: "けいさつ",
  type: "名词",
  meaning: "警察，警察局。",
  example: "$\\overset{じけん}{事件}$が$\\overset{お}{起}$きて、すぐ$\\overset{けいさつ}{警察}$を$\\overset{よ}{呼}$んだ。/发生了案件，立刻叫了警察。"
},
{
  word: "健康",
  kana: "けんこう",
  type: "名・形动",
  meaning: "健康。",
  example: "$\\overset{けんこう}{健康}$のために、$\\overset{まいにち}{毎日}$$\\overset{さんぽ}{散歩}$をしている。/为了健康，每天都在散步。 || $\\overset{かれ}{彼}$はとても$\\overset{けんこう}{健康}$な$\\overset{からだ}{体}$をしている。/他有着非常健康的身体。"
},
{
  word: "高校",
  kana: "こうこう",
  type: "名词",
  meaning: "高中。",
  example: "$\\overset{こうこう}{高校}$を$\\overset{そつぎょう}{卒業}$したら、$\\overset{だいがく}{大学}$に$\\overset{しんがく}{進学}$する。/高中毕业后升入大学。"
},
{
  word: "工事",
  kana: "こうじ",
  type: "名・サ变动词する自",
  meaning: "工程，施工。",
  example: "$\\overset{どうろ}{道路}$の$\\overset{こうじ}{工事}$で、$\\overset{みち}{道}$が$\\overset{じゅうたい}{渋滞}$している。/因为道路施工，路上堵车了。 || $\\overset{いま}{今}$、$\\overset{あたら}{新}$しいビルを$\\overset{こうじ}{工事}$している。/现在正在建造新大楼。"
},
{
  word: "困難",
  kana: "こんなん",
  type: "名・形动",
  meaning: "困难。",
  example: "$\\overset{こんなん}{困難}$を$\\overset{の}{乗}$り$\\overset{こ}{越}$えて、$\\overset{せいこう}{成功}$した。/克服了困难，取得了成功。 || この$\\overset{もんだい}{問題}$を$\\overset{かいけつ}{解決}$するのは$\\overset{こんなん}{困難}$だ。/解决这个问题很困难。"
},
{
  word: "酸素",
  kana: "さんそ",
  type: "名词",
  meaning: "氧气。",
  example: "$\\overset{しょくぶつ}{植物}$は$\\overset{にさんかたんそ}{二酸化炭素}$を$\\overset{きゅうしゅう}{吸収}$し、$\\overset{さんそ}{酸素}$を$\\overset{だ}{出}$す。/植物吸收二氧化碳，释放氧气。"
},
{
  word: "散歩",
  kana: "さんぽ",
  type: "名・サ变动词する自",
  meaning: "散步。",
  example: "$\\overset{あさ}{朝}$の$\\overset{さんぽ}{散歩}$は$\\overset{きも}{気持}$ちがいい。/早晨的散步让人心情愉悦。 || $\\overset{こうえん}{公園}$を$\\overset{さんぽ}{散歩}$していたら、$\\overset{じけん}{事件}$を$\\overset{もくげき}{目撃}$した。/在公园散步时，目击了案件。"
},
{
  word: "事件",
  kana: "じけん",
  type: "名词",
  meaning: "案件，事件。",
  example: "あの$\\overset{じけん}{事件}$の$\\overset{じじつ}{事実}$を$\\overset{ちょうさ}{調査}$する。/调查那起案件的真相。"
},
{
  word: "事故",
  kana: "じこ",
  type: "名词",
  meaning: "事故。",
  example: "$\\overset{こうつう}{交通}$$\\overset{じこ}{事故}$に$\\overset{あ}{遭}$わないように$\\overset{き}{気}$をつける。/小心不要遭遇交通事故。"
},
{
  word: "事実",
  kana: "じじつ",
  type: "名词",
  meaning: "事实。",
  example: "それは$\\overset{じじつ}{事実}$であることを$\\overset{しょうめい}{証明}$した。/证明了那是事实。"
},
{
  word: "事情",
  kana: "じじょう",
  type: "名词",
  meaning: "情况，缘故。",
  example: "$\\overset{かれ}{彼}$には$\\overset{がっこう}{学校}$を$\\overset{やす}{休}$む$\\overset{とくべつ}{特別}$な$\\overset{じじょう}{事情}$がある。/他有缺课的特殊情况。"
},
{
  word: "修理",
  kana: "しゅうり",
  type: "名・サ变动词する他",
  meaning: "修理。",
  example: "パソコンの$\\overset{しゅうり}{修理}$には$\\overset{じかん}{時間}$がかかる。/修电脑需要花时间。 || $\\overset{こわ}{壊}$れた$\\overset{とけい}{時計}$を$\\overset{しゅうり}{修理}$してもらった。/请人修好了坏掉的表。"
},
{
  word: "条件",
  kana: "じょうけん",
  type: "名词",
  meaning: "条件。",
  example: "この$\\overset{しごと}{仕事}$の$\\overset{じょうけん}{条件}$はとても$\\overset{きび}{厳}$しい。/这份工作的条件非常严格。"
},
{
  word: "小説",
  kana: "しょうせつ",
  type: "名词",
  meaning: "小说。",
  example: "$\\overset{としょかん}{図書館}$で$\\overset{おもしろ}{面白}$い$\\overset{しょうせつ}{小説}$を$\\overset{か}{借}$りた。/在图书馆借了一本有趣的小说。"
},
{
  word: "招待",
  kana: "しょうたい",
  type: "名・サ变动词する他",
  meaning: "邀请，招待。",
  example: "$\\overset{ともだち}{友達}$から$\\overset{けっこんしき}{結婚式}$の$\\overset{しょうたい}{招待}$を$\\overset{う}{受}$けた。/收到了朋友婚礼的邀请。 || パーティーにお$\\overset{きゃく}{客}$さんを$\\overset{しょうたい}{招待}$する。/邀请客人来参加派对。"
},
{
  word: "状態",
  kana: "じょうたい",
  type: "名词",
  meaning: "状态，情况。",
  example: "$\\overset{かんじゃ}{患者}$の$\\overset{けんこう}{健康}$$\\overset{じょうたい}{状態}$は$\\overset{よ}{良}$くなっている。/患者的健康状态正在好转。"
},
{
  word: "証明",
  kana: "しょうめい",
  type: "名・サ变动词する他",
  meaning: "证明。",
  example: "$\\overset{みぶん}{身分}$の$\\overset{しょうめい}{証明}$が$\\overset{ひつよう}{必要}$です。/需要身份证明。 || $\\overset{かれ}{彼}$が$\\overset{はんにん}{犯人}$ではないことを$\\overset{しょうめい}{証明}$する。/证明他不是犯人。"
},
{
  word: "処理",
  kana: "しょり",
  type: "名・サ变动词する他",
  meaning: "处理。",
  example: "ゴミの$\\overset{しょり}{処理}$に$\\overset{こま}{困}$っている。/正为垃圾处理感到头疼。 || $\\overset{ふくざつ}{複雑}$な$\\overset{もんだい}{問題}$を$\\overset{てきせつ}{適切}$に$\\overset{しょり}{処理}$する。/妥善处理复杂的问题。"
},
{
  word: "整理",
  kana: "せいり",
  type: "名・サ变动词する他",
  meaning: "整理，收拾。",
  example: "$\\overset{へや}{部屋}$の$\\overset{せいり}{整理}$をしてから$\\overset{で}{出}$かける。/整理好房间再出门。 || $\\overset{ほんだな}{本棚}$の$\\overset{ほん}{本}$を$\\overset{きれい}{綺麗}$に$\\overset{せいり}{整理}$した。/把书架上的书整理干净了。"
},
{
  word: "説明",
  kana: "せつめい",
  type: "名・サ变动词する他",
  meaning: "说明，解释。",
  example: "$\\overset{せんせい}{先生}$の$\\overset{せつめい}{説明}$はとても$\\overset{わ}{分}$かりやすい。/老师的讲解非常易懂。 || $\\overset{ちこく}{遅刻}$の$\\overset{りゆう}{理由}$を$\\overset{せつめい}{説明}$してください。/请说明迟到的理由。"
},
{
  word: "増加",
  kana: "ぞうか",
  type: "名・サ变动词する自他",
  meaning: "增加。",
  example: "$\\overset{じんこう}{人口}$の$\\overset{ぞうか}{増加}$が$\\overset{もんだい}{問題}$になっている。/人口增加成了一个问题。 || $\\overset{ことし}{今年}$は$\\overset{かんこう}{観光}$$\\overset{きゃく}{客}$が$\\overset{ぞうか}{増加}$した。/今年游客增加了。"
},
{
  word: "調査",
  kana: "ちょうさ",
  type: "名・サ变动词する他",
  meaning: "调查。",
  example: "$\\overset{ちり}{地理}$の$\\overset{ちょうさ}{調査}$を$\\overset{おこな}{行}$う。/进行地理调查。 || $\\overset{じけん}{事件}$の$\\overset{げんいん}{原因}$を$\\overset{ちょうさ}{調査}$している。/正在调查案件的原因。"
},
{
  word: "地理",
  kana: "ちり",
  type: "名词",
  meaning: "地理。",
  example: "$\\overset{わたし}{私}$は$\\overset{れきし}{歴史}$より$\\overset{ちり}{地理}$のほうが$\\overset{す}{好}$きだ。/比起历史，我更喜欢地理。"
},
{
  word: "伝統",
  kana: "でんとう",
  type: "名词",
  meaning: "传统。",
  example: "$\\overset{にほん}{日本}$の$\\overset{でんとう}{伝統}$$\\overset{ぶんか}{文化}$に$\\overset{みりょく}{魅力}$を$\\overset{かん}{感}$じる。/感受到了日本传统文化的魅力。"
},
{
  word: "到着",
  kana: "とうちゃく",
  type: "名・サ变动词する自",
  meaning: "到达。",
  example: "$\\overset{ひこうき}{飛行機}$の$\\overset{とうちゃく}{到着}$が$\\overset{おく}{遅}$れた。/飞机的到达晚点了。 || $\\overset{にもつ}{荷物}$が$\\overset{ぶじ}{無事}$に$\\overset{とうちゃく}{到着}$した。/行李平安到达了。"
},
{
  word: "特別",
  kana: "とくべつ",
  type: "名・形动・副",
  meaning: "特别，格外。",
  example: "$\\overset{きょう}{今日}$は$\\overset{とくべつ}{特別}$の$\\overset{ひ}{日}$です。/今天是个特别的日子。 || これは$\\overset{とくべつ}{特別}$な$\\overset{りょうり}{料理}$です。/这是一道特别的菜。"
},
{
  word: "二酸化炭素",
  kana: "にさんかたんそ",
  type: "名词",
  meaning: "二氧化碳。",
  example: "$\\overset{くうき}{空気}$$\\overset{ちゅう}{中}$には$\\overset{にさんかたんそ}{二酸化炭素}$が$\\overset{ふく}{含}$まれている。/空气中含有二氧化碳。"
},
{
  word: "複雑",
  kana: "ふくざつ",
  type: "名・形动",
  meaning: "复杂。",
  example: "$\\overset{かれ}{彼}$の$\\overset{きも}{気持}$ちは$\\overset{ふくざつ}{複雑}$だ。/他的心情很复杂。 || これはとても$\\overset{ふくざつ}{複雑}$な$\\overset{もんだい}{問題}$です。/这是一个非常复杂的问题。"
},
{
  word: "物理",
  kana: "ぶつり",
  type: "名词",
  meaning: "物理。",
  example: "$\\overset{りかけい}{理科系}$の$\\overset{がくせい}{学生}$は$\\overset{ぶつり}{物理}$を$\\overset{べんきょう}{勉強}$する。/理科生要学物理。"
},
{
  word: "平気",
  kana: "へいき",
  type: "名・形动",
  meaning: "平静，不在乎，没事。",
  example: "$\\overset{かれ}{彼}$は$\\overset{へいき}{平気}$な$\\overset{かお}{顔}$をしている。/他一脸无所谓的表情。 || $\\overset{さむ}{寒}$くても$\\overset{へいき}{平気}$だ。/再冷也没事。"
},
{
  word: "変",
  kana: "へん",
  type: "名・形动",
  meaning: "奇怪，不正常。",
  example: "$\\overset{へん}{変}$な$\\overset{おと}{音}$が$\\overset{き}{聞}$こえる。/听到了奇怪的声音。 || このパソコンはどこか$\\overset{へん}{変}$だ。/这台电脑哪里有点怪。"
},
{
  word: "摩擦",
  kana: "まさつ",
  type: "名・サ变动词",
  meaning: "摩擦；矛盾。",
  example: "$\\overset{にんげん}{人間}$$\\overset{かんけい}{関係}$の$\\overset{まさつ}{摩擦}$は$\\overset{さ}{避}$けられない。/人际关系的摩擦是不可避免的。 || $\\overset{くつ}{靴}$が$\\overset{ゆか}{床}$と$\\overset{まさつ}{摩擦}$して$\\overset{おと}{音}$が$\\overset{で}{出}$る。/鞋子和地板摩擦发出声音。"
},
{
  word: "魅力",
  kana: "みりょく",
  type: "名词",
  meaning: "魅力，吸引力。",
  example: "この$\\overset{しょうせつ}{小説}$には$\\overset{ふしぎ}{不思議}$な$\\overset{みりょく}{魅力}$がある。/这本小说有一种不可思议的魅力。"
},
{
  word: "無理",
  kana: "むり",
  type: "名・形动・サ变动词",
  meaning: "勉强，难以办到。",
  example: "$\\overset{むり}{無理}$なお$\\overset{ねが}{願}$いをしてすみません。/提出勉强的请求，真对不起。 || $\\overset{いちにち}{一日}$で$\\overset{ぜんぶ}{全部}$$\\overset{おぼ}{覚}$えるのは$\\overset{むり}{無理}$だ。/一天之内全部记住是不可能的。 || あまり$\\overset{むり}{無理}$をしないでください。/请不要太勉强自己。"
},
{
  word: "面倒",
  kana: "めんどう",
  type: "名・形动",
  meaning: "麻烦；照顾。",
  example: "$\\overset{おや}{親}$の$\\overset{めんどう}{面倒}$を$\\overset{み}{見}$る。/照顾父母。 || $\\overset{めんどう}{面倒}$な$\\overset{ようじ}{用事}$を$\\overset{たの}{頼}$まれた。/被拜托了一件麻烦的差事。"
},
{
  word: "要求",
  kana: "ようきゅう",
  type: "名・サ变动词する他",
  meaning: "要求。",
  example: "$\\overset{かれ}{彼}$の$\\overset{ようきゅう}{要求}$は$\\overset{たか}{高}$すぎる。/他的要求太高了。 || $\\overset{がっこう}{学校}$に$\\overset{じょうけん}{条件}$の$\\overset{かいぜん}{改善}$を$\\overset{ようきゅう}{要求}$する。/向学校要求改善条件。"
},
{
  word: "用事",
  kana: "ようじ",
  type: "名词",
  meaning: "事情，办事。",
  example: "$\\overset{きょう}{今日}$は$\\overset{ごご}{午後}$から$\\overset{ようじ}{用事}$があります。/今天下午我有事情。"
},
{
  word: "理解",
  kana: "りかい",
  type: "名・サ变动词する他",
  meaning: "理解，懂。",
  example: "$\\overset{かれ}{彼}$は$\\overset{りかい}{理解}$が$\\overset{はや}{早}$い。/他理解得很快。 || その$\\overset{ふくざつ}{複雑}$な$\\overset{りろん}{理論}$を$\\overset{りかい}{理解}$するのは$\\overset{むずか}{難}$しい。/理解那个复杂的理论很难。"
},
{
  word: "理想",
  kana: "りそう",
  type: "名词",
  meaning: "理想。",
  example: "$\\overset{りそう}{理想}$と$\\overset{げんじつ}{現実}$は$\\overset{ちが}{違}$う。/理想和现实是不同的。"
},
{
  word: "理由",
  kana: "りゆう",
  type: "名词",
  meaning: "理由，原因。",
  example: "$\\overset{ちこく}{遅刻}$した$\\overset{りゆう}{理由}$を$\\overset{せつめい}{説明}$してください。/请说明迟到的理由。"
},
{
  word: "理論",
  kana: "りろん",
  type: "名词",
  meaning: "理论。",
  example: "$\\overset{かれ}{彼}$の$\\overset{りろん}{理論}$は$\\overset{ぶつり}{物理}$$\\overset{がく}{学}$に$\\overset{おお}{大}$きな$\\overset{えいきょう}{影響}$を$\\overset{あた}{与}$えた。/他的理论对物理学产生了巨大影响。"
},
{
  word: "お宅",
  kana: "おたく",
  type: "名词",
  meaning: "府上（敬语）；您家。",
  example: "$\\overset{あした}{明日}$、$\\overset{せんせい}{先生}$のお$\\overset{たく}{宅}$に$\\overset{うかが}{伺}$います。/明天我要去拜访老师的家。"
},
{
  word: "回復",
  kana: "かいふく",
  type: "名・サ变动词する自他",
  meaning: "恢复。",
  example: "$\\overset{けいき}{景気}$の$\\overset{かいふく}{回復}$を$\\overset{ま}{待}$っている。/正在等待经济的复苏。 || $\\overset{びょうき}{病気}$が$\\overset{かいふく}{回復}$して、$\\overset{ぶじ}{無事}$に$\\overset{たいいん}{退院}$した。/病情恢复，平安出院了。"
},
{
  word: "貝",
  kana: "かい",
  type: "名词",
  meaning: "贝类，贝壳。",
  example: "$\\overset{うみ}{海}$で$\\overset{かい}{貝}$を$\\overset{ひろ}{拾}$う。/在海边捡贝壳。"
},
{
  word: "火山",
  kana: "かざん",
  type: "名词",
  meaning: "火山。",
  example: "あの$\\overset{やま}{山}$は$\\overset{かっ}{活}$$\\overset{かざん}{火山}$だ。/那座山是活火山。"
},
{
  word: "気温",
  kana: "きおん",
  type: "名词",
  meaning: "气温。",
  example: "$\\overset{きょう}{今日}$は$\\overset{きおん}{気温}$が$\\overset{きゅう}{急}$に$\\overset{さ}{下}$がった。/今天气温骤降。"
},
{
  word: "記事",
  kana: "きじ",
  type: "名词",
  meaning: "报道，消息，文章。",
  example: "$\\overset{しんぶん}{新聞}$でその$\\overset{じけん}{事件}$の$\\overset{きじ}{記事}$を$\\overset{よ}{読}$んだ。/在报纸上读了那起事件的报道。"
},
{
  word: "校庭",
  kana: "こうてい",
  type: "名词",
  meaning: "校园，操场。",
  example: "$\\overset{せいと}{生徒}$たちは$\\overset{こうてい}{校庭}$で$\\overset{はし}{走}$っている。/学生们正在操场上跑步。"
},
{
  word: "古代",
  kana: "こだい",
  type: "名词",
  meaning: "古代。",
  example: "$\\overset{こだい}{古代}$の$\\overset{れきし}{歴史}$に$\\overset{きょうみ}{興味}$がある。/对古代历史感兴趣。"
},
{
  word: "四季",
  kana: "しき",
  type: "名词",
  meaning: "四季。",
  example: "$\\overset{にほん}{日本}$には$\\overset{うつく}{美}$しい$\\overset{しき}{四季}$がある。/日本有美丽的四季。"
},
{
  word: "事業",
  kana: "じぎょう",
  type: "名词",
  meaning: "事业，企业。",
  example: "$\\overset{かれ}{彼}$は$\\overset{あたら}{新}$しい$\\overset{じぎょう}{事業}$を$\\overset{はじ}{始}$めた。/他开始了新的事业。"
},
{
  word: "事務",
  kana: "じむ",
  type: "名词",
  meaning: "事务，办公。",
  example: "$\\overset{かれ}{彼}$は$\\overset{かいしゃ}{会社}$で$\\overset{じむ}{事務}$の$\\overset{しごと}{仕事}$をしている。/他在公司做行政事务工作。"
},
{
  word: "挑戦",
  kana: "ちょうせん",
  type: "名・サ变动词する自",
  meaning: "挑战。",
  example: "$\\overset{あたら}{新}$しいことへの$\\overset{ちょうせん}{挑戦}$は$\\overset{たいせつ}{大切}$だ。/向新事物发起挑战很重要。 || $\\overset{こんなん}{困難}$な$\\overset{しごと}{仕事}$に$\\overset{ちょうせん}{挑戦}$する。/挑战困难的工作。"
},
{
  word: "内容",
  kana: "ないよう",
  type: "名词",
  meaning: "内容。",
  example: "その$\\overset{きじ}{記事}$の$\\overset{ないよう}{内容}$を$\\overset{りかい}{理解}$した。/理解了那篇报道的内容。"
},
{
  word: "能率",
  kana: "のうりつ",
  type: "名词",
  meaning: "效率。",
  example: "$\\overset{しごと}{仕事}$の$\\overset{のうりつ}{能率}$を$\\overset{あ}{上}$げるために$\\overset{くふう}{工夫}$する。/为了提高工作效率而想办法。"
},
{
  word: "理科系",
  kana: "りかけい",
  type: "名词",
  meaning: "理科。",
  example: "$\\overset{かれ}{彼}$は$\\overset{りかけい}{理科系}$の$\\overset{だいがく}{大学}$を$\\overset{そつぎょう}{卒業}$した。/他毕业于理科大学。"
},
{
  word: "気体",
  kana: "きたい",
  type: "名词",
  meaning: "气体。",
  example: "$\\overset{さんそ}{酸素}$は$\\overset{め}{目}$に$\\overset{み}{見}$えない$\\overset{きたい}{気体}$だ。/氧气是看不见的气体。"
},
{
  word: "求人",
  kana: "きゅうじん",
  type: "名词",
  meaning: "招聘。",
  example: "$\\overset{ざっし}{雑誌}$で$\\overset{きゅうじん}{求人}$の$\\overset{じょうほう}{情報}$を$\\overset{さが}{探}$す。/在杂志上寻找招聘信息。"
},
{
  word: "現象",
  kana: "げんしょう",
  type: "名词",
  meaning: "现象。",
  example: "これは$\\overset{めずら}{珍}$しい$\\overset{しぜん}{自然}$$\\overset{げんしょう}{現象}$だ。/这是一种罕见的自然现象。"
},
{
  word: "考慮",
  kana: "こうりょ",
  type: "名・サ变动词する他",
  meaning: "考虑。",
  example: "その$\\overset{けん}{件}$については$\\overset{こうりょ}{考慮}$の$\\overset{よち}{余地}$がある。/关于那件事还有考虑的余地。 || $\\overset{あいて}{相手}$の$\\overset{じじょう}{事情}$を$\\overset{こうりょ}{考慮}$して$\\overset{けってい}{決定}$する。/考虑到对方的情况做决定。"
},
{
  word: "情報",
  kana: "じょうほう",
  type: "名词",
  meaning: "信息，情报。",
  example: "インターネットで$\\overset{あたら}{新}$しい$\\overset{じょうほう}{情報}$を$\\overset{あつ}{集}$める。/在网上收集新信息。"
},
{
  word: "省略",
  kana: "しょうりゃく",
  type: "名・サ变动词する他",
  meaning: "省略。",
  example: "$\\overset{せつめい}{説明}$の$\\overset{しょうりゃく}{省略}$は$\\overset{ごかい}{誤解}$を$\\overset{まね}{招}$く。/省略说明会引起误解。 || $\\overset{じかん}{時間}$がないので、$\\overset{あいさつ}{挨拶}$を$\\overset{しょうりゃく}{省略}$する。/因为没有时间，所以省略了寒暄。"
},
{
  word: "第一",
  kana: "だいいち",
  type: "名・副词",
  meaning: "第一，最重要；首先。",
  example: "$\\overset{あんぜん}{安全}$を$\\overset{だいいち}{第一}$に$\\overset{かんが}{考}$える。/把安全放在第一位。 || $\\overset{だいいち}{第一}$に、$\\overset{りゆう}{理由}$を$\\overset{せつめい}{説明}$してください。/首先，请说明理由。"
},
{
  word: "犯人",
  kana: "はんにん",
  type: "名词",
  meaning: "犯人，罪犯。",
  example: "$\\overset{けいさつ}{警察}$はあの$\\overset{じけん}{事件}$の$\\overset{はんにん}{犯人}$を$\\overset{たいほ}{逮捕}$した。/警察逮捕了那起案件的犯人。"
},
{
  word: "略",
  kana: "りゃく",
  type: "名词",
  meaning: "省略，简略。",
  example: "$\\overset{いか}{以下}$の$\\overset{ぶんしょう}{文章}$は$\\overset{りゃく}{略}$します。/以下文章省略。"
},
{
  word: "挨拶",
  kana: "あいさつ",
  type: "名・サ变动词する自",
  meaning: "寒暄，打招呼。",
  example: "$\\overset{えがお}{笑顔}$で$\\overset{あいさつ}{挨拶}$をするのは$\\overset{たいせつ}{大切}$だ。/带着笑容打招呼很重要。 || $\\overset{せんせい}{先生}$に$\\overset{あ}{会}$ったら、$\\overset{げんき}{元気}$に$\\overset{あいさつ}{挨拶}$しなさい。/遇见老师的话，要精神饱满地打招呼。"
},
{
  word: "椅子",
  kana: "いす",
  type: "名词",
  meaning: "椅子。",
  example: "$\\overset{いす}{椅子}$に$\\overset{すわ}{座}$って、ゆっくりお$\\overset{かし}{菓子}$を$\\overset{た}{食}$べる。/坐在椅子上，慢慢吃点心。"
},
{
  word: "意味",
  kana: "いみ",
  type: "名・サ变动词する他",
  meaning: "意思，意义。",
  example: "その$\\overset{かんじ}{漢字}$の$\\overset{いみ}{意味}$を$\\overset{じしょ}{辞書}$で$\\overset{しら}{調}$べる。/用字典查那个汉字的意思。 || $\\overset{かれ}{彼}$の$\\overset{ことば}{言葉}$が$\\overset{いみ}{意味}$するものを$\\overset{かんが}{考}$える。/思考他话语中所包含的意义。"
},
{
  word: "お菓子",
  kana: "おかし",
  type: "名词",
  meaning: "点心，糖果。",
  example: "$\\overset{こども}{子供}$たちが$\\overset{あつま}{集}$まって、お$\\overset{かし}{菓子}$を$\\overset{た}{食}$べている。/孩子们聚在一起吃点心。"
},
{
  word: "歌手",
  kana: "かしゅ",
  type: "名词",
  meaning: "歌手。",
  example: "あの$\\overset{いちばん}{一番}$$\\overset{にんき}{人気}$がある$\\overset{かしゅ}{歌手}$に$\\overset{あいさつ}{挨拶}$をした。/向那位最受欢迎的歌手打了招呼。"
},
{
  word: "漢字",
  kana: "かんじ",
  type: "名词",
  meaning: "汉字。",
  example: "$\\overset{こくばん}{黒板}$に$\\overset{か}{書}$いてある$\\overset{かんじ}{漢字}$が$\\overset{よ}{読}$めない。/看不懂写在黑板上的汉字。"
},
{
  word: "切符",
  kana: "きっぷ",
  type: "名词",
  meaning: "票，车票。",
  example: "$\\overset{さいふ}{財布}$から$\\overset{ちかてつ}{地下鉄}$の$\\overset{きっぷ}{切符}$を$\\overset{と}{取}$り$\\overset{だ}{出}$す。/从钱包里拿出地铁票。"
},
{
  word: "きれい",
  kana: "きれい",
  type: "形动",
  meaning: "漂亮，干净。",
  example: "きれいな$\\overset{ふく}{服}$を$\\overset{き}{着}$て、$\\overset{がいしゅつ}{外出}$する。/穿上漂亮的衣服出门。"
},
{
  word: "勤労",
  kana: "きんろう",
  type: "名・サ变动词",
  meaning: "劳动，工作。",
  example: "$\\overset{きんろう}{勤労}$の$\\overset{よろこ}{喜}$びを$\\overset{かん}{感}$じる。/感受劳动的喜悦。 || $\\overset{しゃかい}{社会}$のために$\\overset{きんろう}{勤労}$する。/为了社会而劳动。"
},
{
  word: "決して",
  kana: "けっして",
  type: "副词",
  meaning: "决不，绝对（后接否定）。",
  example: "この$\\overset{やくそく}{約束}$は$\\overset{けっ}{決}$して$\\overset{わす}{忘}$れません。/这个约定我决不会忘记。"
},
{
  word: "黒板",
  kana: "こくばん",
  type: "名词",
  meaning: "黑板。",
  example: "$\\overset{ぞうきん}{雑巾}$で$\\overset{こくばん}{黒板}$の$\\overset{じ}{字}$をきれいに$\\overset{け}{消}$す。/用抹布把黑板上的字擦干净。"
},
{
  word: "財布",
  kana: "さいふ",
  type: "名词",
  meaning: "钱包。",
  example: "$\\overset{き}{気}$をつけて、$\\overset{けっ}{決}$して$\\overset{さいふ}{財布}$を$\\overset{お}{落}$とさないでください。/请小心，千万别把钱包掉了。"
},
{
  word: "自己紹介",
  kana: "じこしょうかい",
  type: "名・サ变动词する自他",
  meaning: "自我介绍。",
  example: "$\\overset{さいしょ}{最初}$に$\\overset{じぶん}{自分}$の$\\overset{じこしょうかい}{自己紹介}$をします。/首先进行自我介绍。 || $\\overset{あたら}{新}$しいクラスメートに$\\overset{じこしょうかい}{自己紹介}$する。/向新同学做自我介绍。"
},
{
  word: "自転車",
  kana: "じてんしゃ",
  type: "名词",
  meaning: "自行车。",
  example: "$\\overset{たいいん}{退院}$して、だんだん$\\overset{じてんしゃ}{自転車}$に$\\overset{の}{乗}$れるようになった。/出院后，渐渐地能骑自行车了。"
},
{
  word: "自分",
  kana: "じぶん",
  type: "名词",
  meaning: "自己。",
  example: "$\\overset{じぶん}{自分}$の$\\overset{とくい}{得意}$なことを$\\overset{じこしょうかい}{自己紹介}$で$\\overset{はな}{話}$す。/在自我介绍时谈论自己擅长的事情。"
},
{
  word: "水泳",
  kana: "すいえい",
  type: "名・サ变动词する自",
  meaning: "游泳。",
  example: "$\\overset{わたし}{私}$の$\\overset{しゅみ}{趣味}$は$\\overset{すいえい}{水泳}$です。/我的爱好是游泳。 || $\\overset{かわ}{川}$で$\\overset{すいえい}{水泳}$するのは$\\overset{きけん}{危険}$だ。/在河里游泳很危险。"
},
{
  word: "雑巾",
  kana: "ぞうきん",
  type: "名词",
  meaning: "抹布。",
  example: "$\\overset{ぞうきん}{雑巾}$で$\\overset{よご}{汚}$れた$\\overset{いす}{椅子}$をきれいに$\\overset{ふ}{拭}$く。/用抹布把弄脏的椅子擦干净。"
},
{
  word: "退院",
  kana: "たいいん",
  type: "名・サ变动词する自",
  meaning: "出院。",
  example: "$\\overset{あした}{明日}$、$\\overset{そぼ}{祖母}$の$\\overset{たいいん}{退院}$の$\\overset{ひ}{日}$です。/明天是祖母出院的日子。 || $\\overset{びょうき}{病気}$が$\\overset{なお}{治}$って、$\\overset{ぶじ}{無事}$に$\\overset{たいいん}{退院}$した。/病好了，平安出院了。"
},
{
  word: "だんだん",
  kana: "だんだん",
  type: "副词",
  meaning: "渐渐地，逐渐地。",
  example: "$\\overset{ふゆ}{冬}$が$\\overset{ちか}{近}$づいて、だんだん$\\overset{さむ}{寒}$くなってきた。/冬天临近，渐渐变冷了。"
},
{
  word: "地図",
  kana: "ちず",
  type: "名词",
  meaning: "地图。",
  example: "$\\overset{ちず}{地図}$を$\\overset{み}{見}$て、$\\overset{やくそく}{約束}$の$\\overset{ばしょ}{場所}$へ$\\overset{む}{向}$かう。/看着地图，前往约定的地点。"
},
{
  word: "電子決済",
  kana: "でんしけっさい",
  type: "名词する他",
  meaning: "电子支付。",
  example: "$\\overset{さいきん}{最近}$、$\\overset{でんしけっさい}{電子決済}$で$\\overset{ふく}{服}$や$\\overset{ぼうし}{帽子}$を$\\overset{か}{買}$う$\\overset{ひと}{人}$が$\\overset{ふ}{増}$えた。/最近，用电子支付买衣服和帽子的人增加了。"
},
{
  word: "得意",
  kana: "とくい",
  type: "名・形动",
  meaning: "擅长；得意。",
  example: "$\\overset{かれ}{彼}$の$\\overset{とくい}{得意}$は$\\overset{すいえい}{水泳}$と$\\overset{うた}{歌}$です。/他擅长的是游泳和唱歌。 || $\\overset{かれ}{彼}$は$\\overset{とくい}{得意}$な$\\overset{かお}{顔}$で$\\overset{じまん}{自慢}$した。/他一脸得意地炫耀。"
},
{
  word: "服",
  kana: "ふく",
  type: "名词",
  meaning: "衣服。",
  example: "$\\overset{あたら}{新}$しい$\\overset{ふく}{服}$を$\\overset{き}{着}$て$\\overset{で}{出}$かける。/穿上新衣服出门。"
},
{
  word: "帽子",
  kana: "ぼうし",
  type: "名词",
  meaning: "帽子。",
  example: "$\\overset{たいよう}{太陽}$が$\\overset{まぶ}{眩}$しいので、$\\overset{ぼうし}{帽子}$を$\\overset{かぶ}{被}$る。/太阳很刺眼，所以戴上了帽子。"
},
{
  word: "約束",
  kana: "やくそく",
  type: "名・サ变动词する他",
  meaning: "约定，答应。",
  example: "$\\overset{ともだち}{友達}$との$\\overset{やくそく}{約束}$を$\\overset{まも}{守}$る。/遵守和朋友的约定。 || $\\overset{あした}{明日}$また$\\overset{あ}{会}$うことを$\\overset{やくそく}{約束}$した。/约定了明天再见。"
},
{
  word: "以下",
  kana: "いか",
  type: "名词",
  meaning: "以下，在……之下。",
  example: "$\\overset{ろくじゅう}{六十}$$\\overset{てん}{点}$$\\overset{いか}{以下}$は$\\overset{ふごうかく}{不合格}$です。/六十分以下是不及格。"
},
{
  word: "意義",
  kana: "いぎ",
  type: "名词",
  meaning: "意义。",
  example: "$\\overset{しぜん}{自然}$を$\\overset{ほご}{保護}$する$\\overset{かつどう}{活動}$には$\\overset{おお}{大}$きな$\\overset{いぎ}{意義}$がある。/保护自然的活动具有重大的意义。"
},
{
  word: "意見",
  kana: "いけん",
  type: "名词",
  meaning: "意见，看法。",
  example: "$\\overset{じぶん}{自分}$の$\\overset{いけん}{意見}$をはっきりと$\\overset{しゅちょう}{主張}$する。/清楚地主张自己的意见。"
},
{
  word: "意志",
  kana: "いし",
  type: "名词",
  meaning: "意志，意向。",
  example: "$\\overset{かれ}{彼}$は$\\overset{つよ}{強}$い$\\overset{いし}{意志}$を$\\overset{も}{持}$って$\\overset{こんなん}{困難}$を$\\overset{の}{乗}$り$\\overset{こ}{越}$えた。/他凭着坚强的意志克服了困难。"
},
{
  word: "意識",
  kana: "いしき",
  type: "名・サ变动词",
  meaning: "意识，觉悟。",
  example: "$\\overset{かんきょう}{環境}$$\\overset{ほご}{保護}$の$\\overset{いしき}{意識}$を$\\overset{たか}{高}$めるべきだ。/应该提高环境保护的意识。 || $\\overset{じしん}{地震}$などの$\\overset{さいがい}{災害}$を$\\overset{いしき}{意識}$して$\\overset{せいかつ}{生活}$する。/在生活中时刻意识到地震等灾害（的存在）。"
},
{
  word: "観察",
  kana: "かんさつ",
  type: "名・サ变动词する他",
  meaning: "观察。",
  example: "$\\overset{こうがい}{郊外}$で$\\overset{しょくぶつ}{植物}$の$\\overset{かんさつ}{観察}$を$\\overset{おこな}{行}$う。/在郊外进行植物观察。 || $\\overset{とり}{鳥}$の$\\overset{ようす}{様子}$を$\\overset{ちゅうい}{注意}$$\\overset{ぶか}{深}$く$\\overset{かんさつ}{観察}$する。/仔细观察鸟的情况。"
},
{
  word: "間接",
  kana: "かんせつ",
  type: "名词",
  meaning: "间接。",
  example: "$\\overset{かれ}{彼}$の$\\overset{いけん}{意見}$を$\\overset{かんせつ}{間接}$的$\\overset{てき}{的}$に$\\overset{き}{聞}$いた。/间接地听到了他的意见。"
},
{
  word: "現在",
  kana: "げんざい",
  type: "名词",
  meaning: "现在，目前。",
  example: "$\\overset{げんざい}{現在}$、$\\overset{じどうしゃ}{自動車}$の$\\overset{こしょう}{故障}$を$\\overset{しゅうり}{修理}$している。/现在正在修理汽车的故障。"
},
{
  word: "郊外",
  kana: "こうがい",
  type: "名词",
  meaning: "郊外。",
  example: "$\\overset{しゅうまつ}{週末}$は$\\overset{こうがい}{郊外}$の$\\overset{しぜん}{自然}$の$\\overset{なか}{中}$で$\\overset{す}{過}$ごす。/周末在郊外的自然中度过。"
},
{
  word: "故障",
  kana: "こしょう",
  type: "名・サ变动词する自",
  meaning: "故障，毛病。",
  example: "$\\overset{じどうしゃ}{自動車}$の$\\overset{こしょう}{故障}$で$\\overset{ちこく}{遅刻}$した。/因为汽车故障迟到了。 || この$\\overset{きかい}{機械}$はよく$\\overset{こしょう}{故障}$する。/这台机器经常出故障。"
},
{
  word: "災害",
  kana: "さいがい",
  type: "名词",
  meaning: "灾害。",
  example: "$\\overset{じしん}{地震}$による$\\overset{さいがい}{災害}$から$\\overset{み}{身}$を$\\overset{まも}{守}$る。/保护自己免受地震带来的灾害。"
},
{
  word: "資源",
  kana: "しげん",
  type: "名词",
  meaning: "资源。",
  example: "$\\overset{ちきゅう}{地球}$の$\\overset{しげん}{資源}$を$\\overset{たいせつ}{大切}$に$\\overset{ほぞん}{保存}$する。/好好保存地球的资源。"
},
{
  word: "地震",
  kana: "じしん",
  type: "名词",
  meaning: "地震。",
  example: "$\\overset{きのう}{昨日}$、$\\overset{おお}{大}$きな$\\overset{じしん}{地震}$があった。/昨天发生了大地震。"
},
{
  word: "自身",
  kana: "じしん",
  type: "名词",
  meaning: "自身，自己。",
  example: "$\\overset{かれ}{彼}$$\\overset{じしん}{自身}$の$\\overset{いし}{意志}$で$\\overset{き}{決}$めたことだ。/这是他凭自身意志决定的事。"
},
{
  word: "自然",
  kana: "しぜん",
  type: "名・形动",
  meaning: "自然。",
  example: "$\\overset{うつく}{美}$しい$\\overset{しぜん}{自然}$の$\\overset{ふうけい}{風景}$を$\\overset{しゃしん}{写真}$に$\\overset{と}{撮}$る。/拍下美丽的自然风景。 || $\\overset{かれ}{彼}$の$\\overset{えんぎ}{演技}$はとても$\\overset{しぜん}{自然}$だ。/他的演技非常自然。"
},
{
  word: "自動車",
  kana: "じどうしゃ",
  type: "名词",
  meaning: "汽车。",
  example: "$\\overset{じどうしゃ}{自動車}$で$\\overset{こうがい}{郊外}$へドライブに行$\\overset{い}{行}$く。/开车去郊外兜风。"
},
{
  word: "自慢",
  kana: "じまん",
  type: "名・サ变动词する他",
  meaning: "自满，骄傲，夸耀。",
  example: "$\\overset{むすこ}{息子}$の$\\overset{せいせき}{成績}$が$\\overset{かれ}{彼}$の$\\overset{じまん}{自慢}$だ。/儿子的成绩是他的骄傲。 || $\\overset{じぶん}{自分}$の$\\overset{せいか}{成果}$を$\\overset{じまん}{自慢}$してはいけない。/不应该夸耀自己的成果。"
},
{
  word: "地味",
  kana: "じみ",
  type: "名・形动",
  meaning: "朴素，不起眼。",
  example: "$\\overset{かのじょ}{彼女}$の$\\overset{ふく}{服}$は$\\overset{じみ}{地味}$な$\\overset{いろ}{色}$が$\\overset{おお}{多}$い。/她的衣服多是朴素的颜色。 || $\\overset{じみ}{地味}$な$\\overset{がら}{柄}$の$\\overset{たんす}{箪笥}$を$\\overset{か}{買}$った。/买了一个花纹朴素的衣橱。"
},
{
  word: "自由",
  kana: "じゆう",
  type: "名・形动",
  meaning: "自由。",
  example: "$\\overset{かれ}{彼}$は$\\overset{じゆう}{自由}$を$\\overset{もと}{求}$めて$\\overset{どくりつ}{独立}$した。/他为了追求自由而独立了。 || $\\overset{じゆう}{自由}$に$\\overset{いけん}{意見}$を$\\overset{い}{言}$ってください。/请自由发表意见。"
},
{
  word: "主張",
  kana: "しゅちょう",
  type: "名・サ变动词する他",
  meaning: "主张。",
  example: "$\\overset{かれ}{彼}$の$\\overset{しゅちょう}{主張}$は$\\overset{ただ}{正}$しいと$\\overset{おも}{思}$う。/我认为他的主张是正确的。 || $\\overset{じぶん}{自分}$の$\\overset{けんり}{権利}$を$\\overset{つよ}{強}$く$\\overset{しゅちょう}{主張}$する。/强烈主张自己的权利。"
},
{
  word: "順序",
  kana: "じゅんじょ",
  type: "名词",
  meaning: "顺序。",
  example: "$\\overset{ただ}{正}$しい$\\overset{じゅんじょ}{順序}$で$\\overset{きかい}{機械}$を$\\overset{く}{組}$み$\\overset{た}{立}$てる。/按照正确的顺序组装机器。"
},
{
  word: "少子化",
  kana: "しょうしか",
  type: "名词",
  meaning: "少子化（儿童数量减少的现象）。",
  example: "この$\\overset{ちいき}{地域}$でも$\\overset{しょうしか}{少子化}$が$\\overset{すす}{進}$んでいる。/这个地区的少子化也在加剧。"
},
{
  word: "自立",
  kana: "じりつ",
  type: "名・サ变动词する自",
  meaning: "自立，独立。",
  example: "$\\overset{こども}{子供}$の$\\overset{じりつ}{自立}$を$\\overset{しえん}{支援}$する。/支援孩子们的自立。 || $\\overset{けいざい}{経済}$的$\\overset{てき}{的}$に$\\overset{おや}{親}$から$\\overset{じりつ}{自立}$する。/在经济上从父母那里独立。"
},
{
  word: "神社",
  kana: "じんじゃ",
  type: "名词",
  meaning: "神社。",
  example: "$\\overset{しょうがつ}{正月}$に$\\overset{じんじゃ}{神社}$へ$\\overset{い}{行}$って$\\overset{あいさつ}{挨拶}$をする。/过年去神社参拜（打招呼）。"
},
{
  word: "成果",
  kana: "せいか",
  type: "名词",
  meaning: "成果，成绩。",
  example: "$\\overset{まいにち}{毎日}$の$\\overset{どりょく}{努力}$が$\\overset{せいか}{成果}$となって$\\overset{あらわ}{表}$れた。/每天的努力化作了成果体现出来。"
},
{
  word: "太陽",
  kana: "たいよう",
  type: "名词",
  meaning: "太阳。",
  example: "$\\overset{たいよう}{太陽}$の$\\overset{ひかり}{光}$を$\\overset{あ}{浴}$びて、$\\overset{ちきゅう}{地球}$は$\\overset{あたた}{暖}$かくなる。/沐浴着太阳的光辉，地球变得温暖。"
},
{
  word: "箪笥",
  kana: "たんす",
  type: "名词",
  meaning: "衣橱，柜子。",
  example: "$\\overset{わしつ}{和室}$に$\\overset{ふる}{古}$い$\\overset{たんす}{箪笥}$が$\\overset{お}{置}$いてある。/和室里放着一个旧衣橱。"
},
{
  word: "地域",
  kana: "ちいき",
  type: "名词",
  meaning: "地区，区域。",
  example: "この$\\overset{ちいき}{地域}$は$\\overset{ちかてつ}{地下鉄}$があって$\\overset{べんり}{便利}$だ。/这个地区有地铁，很方便。"
},
{
  word: "地下鉄",
  kana: "ちかてつ",
  type: "名词",
  meaning: "地铁。",
  example: "$\\overset{ちかてつ}{地下鉄}$に$\\overset{の}{乗}$って$\\overset{しない}{市内}$へ$\\overset{い}{行}$く。/坐地铁去市里。"
},
{
  word: "地球",
  kana: "ちきゅう",
  type: "名词",
  meaning: "地球。",
  example: "$\\overset{ちきゅう}{地球}$の$\\overset{かんきょう}{環境}$を$\\overset{ほご}{保護}$する$\\overset{いしき}{意識}$を$\\overset{も}{持}$つ。/保持保护地球环境的意识。"
},
{
  word: "注意",
  kana: "ちゅうい",
  type: "名・サ变动词する自他",
  meaning: "注意，当心；提醒。",
  example: "$\\overset{こうつう}{交通}$$\\overset{あんぜん}{安全}$に$\\overset{ちゅうい}{注意}$が$\\overset{ひつよう}{必要}$だ。/需要注意交通安全。 || $\\overset{せんせい}{先生}$に$\\overset{じゅぎょう}{授業}$$\\overset{ちゅう}{中}$の$\\overset{たいど}{態度}$を$\\overset{ちゅうい}{注意}$された。/上课时的态度被老师提醒了。"
},
{
  word: "調子",
  kana: "ちょうし",
  type: "名词",
  meaning: "情况，状况；势头。",
  example: "$\\overset{きょう}{今日}$は$\\overset{からだ}{体}$の$\\overset{ちょうし}{調子}$がとてもいい。/今天身体状况非常好。"
},
{
  word: "直接",
  kana: "ちょくせつ",
  type: "名・副词",
  meaning: "直接。",
  example: "$\\overset{ちょくせつ}{直接}$の$\\overset{げんいん}{原因}$は$\\overset{ふめい}{不明}$だ。/直接原因不明。 || $\\overset{かれ}{彼}$に$\\overset{ちょくせつ}{直接}$$\\overset{いけん}{意見}$を$\\overset{い}{言}$う。/直接对他提意见。"
},
{
  word: "敵",
  kana: "てき",
  type: "名词",
  meaning: "敌人，对手。",
  example: "$\\overset{しあい}{試合}$で$\\overset{つよ}{強}$い$\\overset{てき}{敵}$と$\\overset{しょうとつ}{衝突}$した。/在比赛中与强敌发生了冲突（交锋）。"
},
{
  word: "独立",
  kana: "どくりつ",
  type: "名・サ变动词する自",
  meaning: "独立。",
  example: "$\\overset{くに}{国}$の$\\overset{どくりつ}{独立}$を$\\overset{いわ}{祝}$う。/庆祝国家独立。 || $\\overset{かれ}{彼}$は$\\overset{かいしゃ}{会社}$を$\\overset{や}{辞}$めて$\\overset{どくりつ}{独立}$した。/他辞去公司职务独立创业了。"
},
{
  word: "土地",
  kana: "とち",
  type: "名词",
  meaning: "土地。",
  example: "$\\overset{こうがい}{郊外}$に$\\overset{いえ}{家}$を$\\overset{た}{建}$てる$\\overset{とち}{土地}$を$\\overset{か}{買}$った。/在郊外买了建房子的土地。"
},
{
  word: "範囲",
  kana: "はんい",
  type: "名词",
  meaning: "范围。",
  example: "テストの$\\overset{はんい}{範囲}$をしっかり$\\overset{ふくしゅう}{復習}$する。/好好复习考试的范围。"
},
{
  word: "被災地",
  kana: "ひさいち",
  type: "名词",
  meaning: "受灾区。",
  example: "$\\overset{ひさいち}{被災地}$の$\\overset{しえん}{支援}$に$\\overset{ちょくせつ}{直接}$$\\overset{む}{向}$かう。/直接前往支援受灾区。"
},
{
  word: "評判",
  kana: "ひょうばん",
  type: "名・サ变动词",
  meaning: "评价，名声，口碑。",
  example: "あの$\\overset{みせ}{店}$の$\\overset{りょうり}{料理}$は$\\overset{ひょうばん}{評判}$がいい。/那家店的菜口碑很好。 || $\\overset{かれ}{彼}$の$\\overset{しんせつ}{親切}$な$\\overset{こうどう}{行動}$が$\\overset{ひょうばん}{評判}$されている。/他热心的行动受到了好评。"
},
{
  word: "保存",
  kana: "ほぞん",
  type: "名・サ变动词する他",
  meaning: "保存。",
  example: "$\\overset{しょくひん}{食品}$の$\\overset{ほぞん}{保存}$に$\\overset{き}{気}$をつける。/注意食品的保存。 || パソコンにデータを$\\overset{ようい}{用意}$して$\\overset{ほぞん}{保存}$する。/在电脑上准备好数据并保存。"
},
{
  word: "模様",
  kana: "もよう",
  type: "名词",
  meaning: "花纹，图案；情况。",
  example: "この$\\overset{しょうじ}{障子}$の$\\overset{もよう}{模様}$はとてもきれいだ。/这扇纸拉门的花纹非常漂亮。"
},
{
  word: "門",
  kana: "もん",
  type: "名词",
  meaning: "门，大门。",
  example: "$\\overset{がっこう}{学校}$の$\\overset{もん}{門}$の$\\overset{まえ}{前}$で$\\overset{ともだち}{友達}$と$\\overset{やくそく}{約束}$した。/和朋友约在学校大门前见。"
},
{
  word: "用意",
  kana: "ようい",
  type: "名・サ变动词する他",
  meaning: "准备。",
  example: "$\\overset{しょくじ}{食事}$の$\\overset{ようい}{用意}$ができました。/饭菜准备好了。 || $\\overset{あした}{明日}$の$\\overset{じゅぎょう}{授業}$のためにノートを$\\overset{ようい}{用意}$する。/为了明天的课准备好笔记本。"
},
{
  word: "様子",
  kana: "ようす",
  type: "名词",
  meaning: "样子，情况。",
  example: "$\\overset{かんじゃ}{患者}$の$\\overset{ようす}{様子}$を$\\overset{ちゅうい}{注意}$$\\overset{ぶか}{深}$く$\\overset{かんさつ}{観察}$する。/仔细观察患者的情况。"
},
{
  word: "和室",
  kana: "わしつ",
  type: "名词",
  meaning: "日式房间，和室。",
  example: "$\\overset{わしつ}{和室}$には$\\overset{しょうじ}{障子}$と$\\overset{たんす}{箪笥}$がある。/和室里有纸拉门和衣橱。"
},
{
  word: "愛",
  kana: "あい",
  type: "名词",
  meaning: "爱。",
  example: "$\\overset{かぞく}{家族}$への$\\overset{あい}{愛}$を$\\overset{むね}{胸}$に$\\overset{だ}{抱}$いて$\\overset{こきょう}{故郷}$を$\\overset{はな}{離}$れる。/怀着对家人的爱离开故乡。"
},
{
  word: "以外",
  kana: "いがい",
  type: "名词",
  meaning: "以外，除……之外。",
  example: "この$\\overset{きょうしつ}{教室}$には、$\\overset{わたし}{私}$$\\overset{いがい}{以外}$$\\overset{だれ}{誰}$もいない。/这间教室里除了我以外谁也没有。"
},
{
  word: "以後",
  kana: "いご",
  type: "名词",
  meaning: "以后，今后。",
  example: "$\\overset{いご}{以後}$、このような$\\overset{じこ}{事故}$が$\\overset{お}{起}$きないように$\\overset{ちゅうい}{注意}$する。/以后注意不要再发生这样的事故。"
},
{
  word: "以上",
  kana: "いじょう",
  type: "名词",
  meaning: "以上，既然……就。",
  example: "これ$\\overset{いじょう}{以上}$、$\\overset{かれ}{彼}$の$\\overset{こうい}{好意}$に$\\overset{あま}{甘}$えるわけにはいかない。/不能再这样依靠他的好意了。"
},
{
  word: "以前",
  kana: "いぜん",
  type: "名词",
  meaning: "以前，过去。",
  example: "$\\overset{いぜん}{以前}$、この$\\overset{しない}{市内}$で$\\overset{せいかつ}{生活}$していた。/以前在这个市里生活过。"
},
{
  word: "以内",
  kana: "いない",
  type: "名词",
  meaning: "以内。",
  example: "$\\overset{いちじかん}{一時間}$$\\overset{いない}{以内}$に$\\overset{じっか}{実家}$に$\\overset{とうちゃく}{到着}$する$\\overset{よてい}{予定}$だ。/预计一小时以内到达老家。"
},
{
  word: "意欲",
  kana: "いよく",
  type: "名词",
  meaning: "热情，意愿，积极性。",
  example: "$\\overset{かれ}{彼}$は$\\overset{がくりょく}{学力}$$\\overset{こうじょう}{向上}$への$\\overset{いよく}{意欲}$を$\\overset{も}{持}$っている。/他有着提高学习能力的积极性。"
},
{
  word: "原子力",
  kana: "げんしりょく",
  type: "名词",
  meaning: "核能，原子能。",
  example: "$\\overset{げんしりょく}{原子力}$$\\overset{はつでんしょ}{発電所}$の$\\overset{けんせつ}{建設}$について$\\overset{ぎろん}{議論}$する。/就核电站的建设进行讨论。"
},
{
  word: "建設",
  kana: "けんせつ",
  type: "名・サ变动词する他",
  meaning: "建设，建筑。",
  example: "$\\overset{あたら}{新}$しい$\\overset{はつでんしょ}{発電所}$の$\\overset{けんせつ}{建設}$が$\\overset{はじ}{始}$まった。/新发电站的建设开始了。 || $\\overset{しない}{市内}$に$\\overset{おお}{大}$きなビルを$\\overset{けんせつ}{建設}$する。/在市内建造大楼。"
},
{
  word: "好意",
  kana: "こうい",
  type: "名词",
  meaning: "好意，善意。",
  example: "$\\overset{かれ}{彼}$の$\\overset{こうい}{好意}$に$\\overset{こころ}{心}$から$\\overset{かんしゃ}{感謝}$する。/衷心感谢他的好意。"
},
{
  word: "故郷",
  kana: "こきょう",
  type: "名词",
  meaning: "故乡。",
  example: "$\\overset{いぜん}{以前}$$\\overset{す}{住}$んでいた$\\overset{こきょう}{故郷}$の$\\overset{ようす}{様子}$を$\\overset{おも}{思}$い$\\overset{だ}{出}$す。/回想起以前住过的故乡的样子。"
},
{
  word: "自信",
  kana: "じしん",
  type: "名词",
  meaning: "自信。",
  example: "$\\overset{じぶん}{自分}$の$\\overset{のうりょく}{能力}$に$\\overset{じしん}{自信}$を$\\overset{も}{持}$つことが$\\overset{たいせつ}{大切}$だ。/对自己的能力抱有自信很重要。"
},
{
  word: "思想",
  kana: "しそう",
  type: "名词",
  meaning: "思想。",
  example: "$\\overset{かれ}{彼}$の$\\overset{しそう}{思想}$は$\\overset{おお}{多}$くの$\\overset{しょせき}{書籍}$に$\\overset{えいきょう}{影響}$を$\\overset{あた}{与}$えた。/他的思想影响了许多书籍。"
},
{
  word: "市内",
  kana: "しない",
  type: "名词",
  meaning: "市内。",
  example: "$\\overset{きょう}{今日}$は$\\overset{じてんしゃ}{自転車}$で$\\overset{しない}{市内}$を$\\overset{あんない}{案内}$します。/今天骑自行车带你游览市内。"
},
{
  word: "定規",
  kana: "じょうぎ",
  type: "名词",
  meaning: "尺子。",
  example: "$\\overset{じょうぎ}{定規}$を$\\overset{つか}{使}$って、$\\overset{こくばん}{黒板}$にまっすぐな$\\overset{せん}{線}$を$\\overset{ひ}{引}$く。/用尺子在黑板上画一条直线。"
},
{
  word: "障子",
  kana: "しょうじ",
  type: "名词",
  meaning: "纸拉门。",
  example: "$\\overset{わしつ}{和室}$の$\\overset{しょうじ}{障子}$を$\\overset{あ}{開}$けて、$\\overset{しんせん}{新鮮}$な$\\overset{くうき}{空気}$を$\\overset{い}{入}$れる。/打开和室的纸拉门，让新鲜空气进来。"
},
{
  word: "女子",
  kana: "じょし",
  type: "名词",
  meaning: "女子，女孩。",
  example: "このクラスは$\\overset{だんし}{男子}$より$\\overset{じょし}{女子}$の$\\overset{ほう}{方}$が$\\overset{おお}{多}$い。/这个班级女生比男生多。"
},
{
  word: "男子",
  kana: "だんし",
  type: "名词",
  meaning: "男子，男孩。",
  example: "$\\overset{だんし}{男子}$$\\overset{せいと}{生徒}$たちが$\\overset{こうてい}{校庭}$で$\\overset{はし}{走}$っている。/男学生们正在操场上跑步。"
},
{
  word: "電子",
  kana: "でんし",
  type: "名词",
  meaning: "电子。",
  example: "$\\overset{さいきん}{最近}$、$\\overset{でんし}{電子}$$\\overset{しょせき}{書籍}$の$\\overset{どうにゅう}{導入}$が$\\overset{すす}{進}$んでいる。/最近正在推进电子书的引入。"
},
{
  word: "葡萄",
  kana: "ぶどう",
  type: "名词",
  meaning: "葡萄。",
  example: "$\\overset{しょくご}{食後}$に$\\overset{あま}{甘}$い$\\overset{ぶどう}{葡萄}$を$\\overset{た}{食}$べる。/饭后吃甜葡萄。"
},
{
  word: "塀",
  kana: "へい",
  type: "名词",
  meaning: "围墙。",
  example: "$\\overset{じっか}{実家}$の$\\overset{ふる}{古}$い$\\overset{へい}{塀}$を$\\overset{しゅうり}{修理}$する。/修理老家的旧围墙。"
},
{
  word: "名刺",
  kana: "めいし",
  type: "名词",
  meaning: "名片。",
  example: "$\\overset{はじ}{初}$めて$\\overset{あ}{会}$った$\\overset{ひと}{人}$と$\\overset{めいし}{名刺}$を$\\overset{こうかん}{交換}$する。/和初次见面的人交换名片。"
},
{
  word: "利口",
  kana: "りこう",
  type: "名・形动",
  meaning: "聪明，机灵。",
  example: "$\\overset{かれ}{彼}$は$\\overset{りこう}{利口}$に$\\overset{もんだい}{問題}$を$\\overset{かいけつ}{解決}$した。/他机智地解决了问题。 || あの$\\overset{いぬ}{犬}$はとても$\\overset{りこう}{利口}$だ。/那只狗非常聪明。"
},
{
  word: "衝突",
  kana: "しょうとつ",
  type: "名・サ变动词する自",
  meaning: "冲突，相撞。",
  example: "$\\overset{いけん}{意見}$の$\\overset{しょうとつ}{衝突}$を$\\overset{さ}{避}$ける。/避免意见的冲突。 || $\\overset{こうさてん}{交差点}$で$\\overset{じどうしゃ}{自動車}$が$\\overset{しょうとつ}{衝突}$した。/汽车在十字路口相撞了。"
},
{
  word: "向上",
  kana: "こうじょう",
  type: "名・サ变动词する自",
  meaning: "向上，提高，进步。",
  example: "$\\overset{がくりょく}{学力}$の$\\overset{こうじょう}{向上}$を$\\overset{めざ}{目指}$して$\\overset{がんば}{頑張}$る。/以提高学习能力为目标而努力。 || $\\overset{せいかつ}{生活}$$\\overset{すいじゅん}{水準}$が$\\overset{こうじょう}{向上}$する。/生活水平提高。"
},
{
  word: "支援",
  kana: "しえん",
  type: "名・サ变动词する他",
  meaning: "支援，援助。",
  example: "$\\overset{ひさいち}{被災地}$への$\\overset{しえん}{支援}$が$\\overset{もと}{求}$められている。/人们正在寻求对受灾区的支援。 || $\\overset{かれ}{彼}$の$\\overset{どくりつ}{独立}$を$\\overset{けいざい}{経済}$的$\\overset{てき}{的}$に$\\overset{しえん}{支援}$する。/在经济上支援他的独立。"
},
{
  word: "実家",
  kana: "じっか",
  type: "名词",
  meaning: "老家，娘家。",
  example: "$\\overset{しょうがつ}{正月}$$\\overset{やす}{休}$みに$\\overset{じっか}{実家}$へ$\\overset{かえ}{帰}$る$\\overset{よてい}{予定}$だ。/打算在正月假期回老家。"
},
{
  word: "焦点",
  kana: "しょうてん",
  type: "名词",
  meaning: "焦点，重点。",
  example: "その$\\overset{はつげん}{発言}$が$\\overset{ぎろん}{議論}$の$\\overset{しょうてん}{焦点}$となった。/那次发言成为了讨论的焦点。"
},
{
  word: "書籍",
  kana: "しょせき",
  type: "名词",
  meaning: "书籍。",
  example: "$\\overset{としょかん}{図書館}$で$\\overset{せんもん}{専門}$の$\\overset{しょせき}{書籍}$を$\\overset{か}{借}$りる。/在图书馆借阅专业的书籍。"
},
{
  word: "存在",
  kana: "そんざい",
  type: "名・サ变动词する自",
  meaning: "存在。",
  example: "$\\overset{かれ}{彼}$の$\\overset{そんざい}{存在}$がチームを$\\overset{つよ}{強}$くする。/他的存在使队伍变得强大。 || この$\\overset{ちいき}{地域}$には$\\overset{ふる}{古}$い$\\overset{じんじゃ}{神社}$が$\\overset{そんざい}{存在}$する。/这个地区存在着古老的神社。"
},
{
  word: "導入",
  kana: "どうにゅう",
  type: "名・サ变动词する他",
  meaning: "引进，引入。",
  example: "$\\overset{あたら}{新}$しい$\\overset{ぎじゅつ}{技術}$の$\\overset{どうにゅう}{導入}$を$\\overset{けんとう}{検討}$する。/探讨引进新技术。 || $\\overset{がっこう}{学校}$に$\\overset{でんし}{電子}$$\\overset{こくばん}{黒板}$を$\\overset{どうにゅう}{導入}$した。/学校引进了电子黑板。"
},
{
  word: "日常生活",
  kana: "にちじょうせいかつ",
  type: "名词",
  meaning: "日常生活。",
  example: "$\\overset{にちじょうせいかつ}{日常生活}$の$\\overset{なか}{中}$で$\\overset{しぜん}{自然}$を$\\overset{いしき}{意識}$する。/在日常生活中保持对自然的意识。"
},
{
  word: "発言",
  kana: "はつげん",
  type: "名・サ变动词する自",
  meaning: "发言。",
  example: "$\\overset{かれ}{彼}$の$\\overset{はつげん}{発言}$にみんなが$\\overset{ちゅうもく}{注目}$した。/大家都关注着他的发言。 || $\\overset{かいぎ}{会議}$で$\\overset{じぶん}{自分}$の$\\overset{いけん}{意見}$を$\\overset{はつげん}{発言}$する。/在会议上发表自己的意见。"
},
{
  word: "発電所",
  kana: "はつでんしょ",
  type: "名词",
  meaning: "发电站。",
  example: "$\\overset{こうがい}{郊外}$に$\\overset{あたら}{新}$しい$\\overset{はつでんしょ}{発電所}$がある。/郊外有一座新的发电站。"
},
{
  word: "不明",
  kana: "ふめい",
  type: "名・形动",
  meaning: "不明，不清楚。",
  example: "$\\overset{げんいん}{原因}$は$\\overset{いま}{未}$だに$\\overset{ふめい}{不明}$のままだ。/原因至今依然不明。 || $\\overset{ゆくえ}{行方}$$\\overset{ふめい}{不明}$の$\\overset{いぬ}{犬}$を$\\overset{さが}{探}$している。/正在寻找下落不明的狗。"
},
{
  word: "医者",
  kana: "いしゃ",
  type: "名词",
  meaning: "医生。",
  example: "$\\overset{しんせつ}{親切}$な$\\overset{いしゃ}{医者}$の$\\overset{せわ}{世話}$になった。/多亏了热情大夫的照顾。"
},
{
  word: "お礼",
  kana: "おれい",
  type: "名词",
  meaning: "感谢，谢礼。",
  example: "$\\overset{いしゃ}{医者}$に$\\overset{ていねい}{丁寧}$なお$\\overset{れい}{礼}$を$\\overset{い}{言}$った。/向医生表达了诚挚的感谢。"
},
{
  word: "金融",
  kana: "きんゆう",
  type: "名词",
  meaning: "金融。",
  example: "$\\overset{きんようび}{金曜日}$に$\\overset{きんゆう}{金融}$に$\\overset{かん}{関}$する$\\overset{ほうこく}{報告}$を$\\overset{き}{聞}$く。/星期五听关于金融的报告。"
},
{
  word: "金曜日",
  kana: "きんようび",
  type: "名词",
  meaning: "星期五。",
  example: "$\\overset{まいしゅう}{毎週}$の$\\overset{きんようび}{金曜日}$に$\\overset{じゅうどう}{柔道}$の$\\overset{れんしゅう}{練習}$をする。/每周的星期五练习柔道。"
},
{
  word: "検討",
  kana: "けんとう",
  type: "名・サ变动词する他",
  meaning: "探讨，研究。",
  example: "$\\overset{しゅみ}{趣味}$のクラブを$\\overset{つく}{作}$るかどうか、$\\overset{けんとう}{検討}$の$\\overset{よち}{余地}$がある。/要不要建一个兴趣俱乐部，还有探讨的余地。 || $\\overset{あたら}{新}$しい$\\overset{けいかく}{計画}$をみんなで$\\overset{けんとう}{検討}$する。/大家一起探讨新的计划。"
},
{
  word: "柔道",
  kana: "じゅうどう",
  type: "名词",
  meaning: "柔道。",
  example: "$\\overset{かれ}{彼}$の$\\overset{しゅみ}{趣味}$は$\\overset{じゅうどう}{柔道}$をすることです。/他的爱好是练柔道。"
},
{
  word: "趣味",
  kana: "しゅみ",
  type: "名词",
  meaning: "爱好，兴趣。",
  example: "$\\overset{わたし}{私}$と$\\overset{かれ}{彼}$は$\\overset{しゅみ}{趣味}$が$\\overset{ぜんぜん}{全然}$$\\overset{ちが}{違}$う。/我和他的爱好完全不同。"
},
{
  word: "親切",
  kana: "しんせつ",
  type: "名・形动",
  meaning: "亲切，热情。",
  example: "$\\overset{かれ}{彼}$の$\\overset{しんせつ}{親切}$に$\\overset{こころ}{心}$から$\\overset{かんしゃ}{感謝}$する。/对他的热情衷心感谢。 || $\\overset{しんせつ}{親切}$な$\\overset{ひと}{人}$に$\\overset{せわ}{世話}$になった。/得到了热情之人的照顾。"
},
{
  word: "新鮮",
  kana: "しんせん",
  type: "名・形动",
  meaning: "新鲜。",
  example: "$\\overset{しんせん}{新鮮}$さを$\\overset{たも}{保}$つために$\\overset{れいぞうこ}{冷蔵庫}$に$\\overset{い}{入}$れる。/为了保持新鲜而放进冰箱。 || $\\overset{あさ}{朝}$、$\\overset{しんせん}{新鮮}$な$\\overset{くうき}{空気}$を$\\overset{す}{吸}$いながら$\\overset{つうきん}{通勤}$する。/早晨一边呼吸着新鲜的空气一边通勤。"
},
{
  word: "世話",
  kana: "せわ",
  type: "名・サ变动词する他",
  meaning: "照顾，帮助。",
  example: "$\\overset{りょうしん}{両親}$の$\\overset{せわ}{世話}$になる。/受到父母的照顾。 || $\\overset{びょうき}{病気}$の$\\overset{しんるい}{親類}$を$\\overset{せわ}{世話}$する。/照顾生病的亲戚。"
},
{
  word: "全然",
  kana: "ぜんぜん",
  type: "副词",
  meaning: "完全（不），根本（后接否定语）。",
  example: "$\\overset{つうきん}{通勤}$の$\\overset{つか}{疲}$れが$\\overset{ぜんぜん}{全然}$とれない。/通勤的疲劳完全没有消除。"
},
{
  word: "通勤",
  kana: "つうきん",
  type: "名・サ变动词する自",
  meaning: "通勤（上下班）。",
  example: "$\\overset{まいあさ}{毎朝}$の$\\overset{つうきん}{通勤}$はとても$\\overset{たいへん}{大変}$だ。/每天早晨的通勤非常辛苦。 || $\\overset{ふつう}{普通}$、$\\overset{でんしゃ}{電車}$で$\\overset{かいしゃ}{会社}$に$\\overset{つうきん}{通勤}$している。/平常坐电车上下班。"
},
{
  word: "通じる",
  kana: "つうじる",
  type: "一段动词自他",
  meaning: "懂，通晓；通往。",
  example: "$\\overset{かれ}{彼}$の$\\overset{ことば}{言葉}$は$\\overset{つうやく}{通訳}$を$\\overset{つう}{通}$じて$\\overset{みな}{皆}$に$\\overset{つた}{伝}$わった。/他的话通过口译传达给了大家。"
},
{
  word: "通訳",
  kana: "つうやく",
  type: "名・サ变动词する他",
  meaning: "口译，翻译（人员）。",
  example: "$\\overset{つうやく}{通訳}$を$\\overset{つう}{通}$じて$\\overset{かいわ}{会話}$をする。/通过翻译进行对话。 || $\\overset{かいぎ}{会議}$で$\\overset{かれ}{彼}$の$\\overset{はつげん}{発言}$を$\\overset{つうやく}{通訳}$する。/在会议上口译他的发言。"
},
{
  word: "普通",
  kana: "ふつう",
  type: "名・形动・副词",
  meaning: "普通，平常。",
  example: "これは$\\overset{ふつう}{普通}$の$\\overset{ようふく}{洋服}$です。/这是一件普通的西装。 || $\\overset{へいわ}{平和}$な$\\overset{ひ}{日}$は$\\overset{ふつう}{普通}$に$\\overset{す}{過}$ぎていく。/和平的日子平常地流逝着。"
},
{
  word: "平和",
  kana: "へいわ",
  type: "名・形动",
  meaning: "和平。",
  example: "$\\overset{せかい}{世界}$の$\\overset{へいわ}{平和}$を$\\overset{いの}{祈}$る。/祈求世界和平。 || $\\overset{へいわ}{平和}$な$\\overset{みらい}{未来}$について$\\overset{ほうこく}{報告}$する。/就和平的未来进行报告。"
},
{
  word: "報告",
  kana: "ほうこく",
  type: "名・サ变动词する他",
  meaning: "报告。",
  example: "$\\overset{ほんやく}{翻訳}$の$\\overset{しごと}{仕事}$に$\\overset{かん}{関}$する$\\overset{ほうこく}{報告}$を$\\overset{だ}{出}$す。/提交关于翻译工作的报告。 || $\\overset{しゃちょう}{社長}$に$\\overset{けいひ}{経費}$の$\\overset{けいさん}{計算}$を$\\overset{ほうこく}{報告}$する。/向总经理报告经费的计算情况。"
},
{
  word: "翻訳",
  kana: "ほんやく",
  type: "名・サ变动词する他",
  meaning: "笔译，翻译。",
  example: "この$\\overset{しょうせつ}{小説}$の$\\overset{ほんやく}{翻訳}$は$\\overset{すばら}{素晴}$らしい。/这本小说的翻译非常棒。 || $\\overset{へいわ}{平和}$に$\\overset{かん}{関}$する$\\overset{ほん}{本}$を$\\overset{ほんやく}{翻訳}$する。/翻译关于和平的书籍。"
},
{
  word: "安心",
  kana: "あんしん",
  type: "名・形动・サ变动词する自",
  meaning: "放心，安心。",
  example: "$\\overset{い}{胃}$の$\\overset{いた}{痛}$みが$\\overset{なお}{治}$って、$\\overset{あんしん}{安心}$した。/胃痛好了，放心了。 || ここはとても$\\overset{あんしん}{安心}$な$\\overset{ばしょ}{場所}$だ。/这里是个非常让人安心的地方。 || $\\overset{かれ}{彼}$が$\\overset{ぶじ}{無事}$に$\\overset{とうちゃく}{到着}$したので$\\overset{あんしん}{安心}$した。/因为他平安到达，所以放心了。"
},
{
  word: "胃",
  kana: "い",
  type: "名词",
  meaning: "胃。",
  example: "$\\overset{い}{胃}$の$\\overset{ぐあい}{具合}$が$\\overset{わる}{悪}$いので$\\overset{うんてん}{運転}$できない。/胃不舒服，所以不能开车。"
},
{
  word: "運転",
  kana: "うんてん",
  type: "名・サ变动词する他",
  meaning: "驾驶，开车。",
  example: "$\\overset{かれ}{彼}$は$\\overset{くるま}{車}$の$\\overset{うんてん}{運転}$が$\\overset{とくい}{得意}$だ。/他擅长开车。 || $\\overset{くるま}{車}$を$\\overset{うんてん}{運転}$して$\\overset{かぶき}{歌舞伎}$を$\\overset{み}{見}$に$\\overset{い}{行}$く。/开车去看歌舞伎。"
},
{
  word: "演じる",
  kana: "えんじる",
  type: "一段动词他",
  meaning: "表演，扮演。",
  example: "$\\overset{かれ}{彼}$は$\\overset{かこ}{過去}$の$\\overset{えいゆう}{英雄}$を$\\overset{えん}{演}$じた。/他扮演了过去的英雄。"
},
{
  word: "お辞儀",
  kana: "おじぎ",
  type: "名・サ变动词する自",
  meaning: "鞠躬。",
  example: "$\\overset{うんてんしゅ}{運転手}$に$\\overset{ていねい}{丁寧}$なお$\\overset{じぎ}{辞儀}$をした。/向司机恭敬地鞠了躬。 || $\\overset{せんせい}{先生}$に$\\overset{あ}{会}$って$\\overset{ふか}{深}$くお$\\overset{じぎ}{辞儀}$する。/遇到老师并深深地鞠躬。"
},
{
  word: "過去",
  kana: "かこ",
  type: "名词",
  meaning: "过去。",
  example: "$\\overset{かこ}{過去}$の$\\overset{けいけん}{経験}$に$\\overset{おお}{多}$くの$\\overset{かんしん}{関心}$を$\\overset{も}{持}$つ。/对过去的经验抱有很大兴趣。"
},
{
  word: "歌舞伎",
  kana: "かぶき",
  type: "名词",
  meaning: "歌舞伎。",
  example: "$\\overset{かぶき}{歌舞伎}$の$\\overset{きそ}{基礎}$に$\\overset{かんしん}{関心}$がある。/对歌舞伎的基础感兴趣。"
},
{
  word: "関心",
  kana: "かんしん",
  type: "名词",
  meaning: "关心，兴趣。",
  example: "$\\overset{きょうつう}{共通}$の$\\overset{ぎもん}{疑問}$に$\\overset{かんしん}{関心}$を$\\overset{も}{持}$つ。/对共同的疑问抱有关心。"
},
{
  word: "基礎",
  kana: "きそ",
  type: "名词",
  meaning: "基础。",
  example: "$\\overset{けいざい}{経済}$の$\\overset{きそ}{基礎}$からしっかり$\\overset{べんきょう}{勉強}$する。/从经济的基础开始好好学习。"
},
{
  word: "疑問",
  kana: "ぎもん",
  type: "名词",
  meaning: "疑问。",
  example: "$\\overset{きょり}{距離}$の$\\overset{けいさん}{計算}$に$\\overset{ぎもん}{疑問}$がある。/对距离的计算存有疑问。"
},
{
  word: "共通",
  kana: "きょうつう",
  type: "名・形动・サ变动词",
  meaning: "共同，共通。",
  example: "$\\overset{ふたり}{二人}$には$\\overset{きょうつう}{共通}$の$\\overset{しゅみ}{趣味}$がある。/两人有共同的爱好。 || $\\overset{わたし}{私}$たちの$\\overset{けいけん}{経験}$は$\\overset{きょうつう}{共通}$している。/我们的经历是共通的。"
},
{
  word: "距離",
  kana: "きょり",
  type: "名词",
  meaning: "距离。",
  example: "$\\overset{けいえいしゃ}{経営者}$と$\\overset{ろうどうしゃ}{労働者}$の$\\overset{きょり}{距離}$を$\\overset{ちぢ}{縮}$める。/缩短经营者和劳动者之间的距离。"
},
{
  word: "経営",
  kana: "けいえい",
  type: "名・サ变动词する他",
  meaning: "经营。",
  example: "$\\overset{かいしゃ}{会社}$の$\\overset{けいえい}{経営}$には$\\overset{けいひ}{経費}$がかかる。/公司的经营需要经费。 || $\\overset{かれ}{彼}$は$\\overset{ちい}{小}$さな$\\overset{ばいてん}{売店}$を$\\overset{けいえい}{経営}$している。/他经营着一家小卖部。"
},
{
  word: "経験",
  kana: "けいけん",
  type: "名・サ变动词する他",
  meaning: "经验，经历。",
  example: "$\\overset{かこ}{過去}$の$\\overset{けいけん}{経験}$を$\\overset{けいざい}{経済}$の$\\overset{けいさん}{計算}$に$\\overset{い}{生}$かす。/将过去的经验运用到经济的计算中。 || $\\overset{かいがい}{海外}$で$\\overset{さまざま}{様々}$なことを$\\overset{けいけん}{経験}$した。/在海外经历了很多事情。"
},
{
  word: "経済",
  kana: "けいざい",
  type: "名词",
  meaning: "经济。",
  example: "$\\overset{くに}{国}$の$\\overset{けいざい}{経済}$がだんだん$\\overset{かいふく}{回復}$している。/国家的经济正在渐渐恢复。"
},
{
  word: "計算",
  kana: "けいさん",
  type: "名・サ变动词する他",
  meaning: "计算。",
  example: "$\\overset{けいひ}{経費}$の$\\overset{けいさん}{計算}$に$\\overset{ぎもん}{疑問}$を$\\overset{いだ}{抱}$く。/对经费的计算抱有疑问。 || $\\overset{ぜいきん}{税金}$を$\\overset{せいかく}{正確}$に$\\overset{けいさん}{計算}$する。/准确地计算税金。"
},
{
  word: "経費",
  kana: "けいひ",
  type: "名词",
  meaning: "经费，开销。",
  example: "$\\overset{けいひ}{経費}$を$\\overset{へ}{減}$らす$\\overset{けっしん}{決心}$をした。/下定决心减少开销。"
},
{
  word: "決心",
  kana: "けっしん",
  type: "名・サ变动词する他",
  meaning: "决心。",
  example: "$\\overset{かれ}{彼}$の$\\overset{けっしん}{決心}$はとても$\\overset{かた}{固}$い。/他的决心非常坚定。 || $\\overset{じぶん}{自分}$の$\\overset{けってん}{欠点}$を$\\overset{なお}{直}$す$\\overset{けっしん}{決心}$をした。/下定决心改正自己的缺点。"
},
{
  word: "欠点",
  kana: "けってん",
  type: "名词",
  meaning: "缺点。",
  example: "$\\overset{こうへい}{公平}$に$\\overset{かれ}{彼}$の$\\overset{けってん}{欠点}$を$\\overset{してき}{指摘}$する。/公平地指出他的缺点。"
},
{
  word: "広告",
  kana: "こうこく",
  type: "名・サ变动词",
  meaning: "广告。",
  example: "$\\overset{しょうひん}{商品}$の$\\overset{こうこく}{広告}$に$\\overset{けいひ}{経費}$を$\\overset{つか}{使}$う。/把经费花在商品广告上。 || $\\overset{あたら}{新}$しい$\\overset{ようふく}{洋服}$を$\\overset{ざっし}{雑誌}$で$\\overset{こうこく}{広告}$する。/在杂志上为新西服打广告。"
},
{
  word: "公平",
  kana: "こうへい",
  type: "名・形动",
  meaning: "公平。",
  example: "$\\overset{さいばん}{裁判}$には$\\overset{こうへい}{公平}$が$\\overset{もと}{求}$められる。/审判要求公平。 || $\\overset{だれ}{誰}$に$\\overset{たい}{対}$しても$\\overset{こうへい}{公平}$な$\\overset{たいど}{態度}$をとる。/对谁都采取公平的态度。"
},
{
  word: "個性",
  kana: "こせい",
  type: "名词",
  meaning: "个性。",
  example: "$\\overset{さくしゃ}{作者}$の$\\overset{こせい}{個性}$が$\\overset{さくひん}{作品}$に$\\overset{あらわ}{表}$れている。/作者的个性体现在作品中。"
},
{
  word: "根性",
  kana: "こんじょう",
  type: "名词",
  meaning: "毅力，秉性。",
  example: "$\\overset{こんじょう}{根性}$を$\\overset{だ}{出}$して$\\overset{じぶん}{自分}$の$\\overset{けってん}{欠点}$を$\\overset{こくふく}{克服}$する。/拿出毅力来克服自己的缺点。"
},
{
  word: "財産",
  kana: "ざいさん",
  type: "名词",
  meaning: "财产。",
  example: "$\\overset{ざいさん}{財産}$をめぐる$\\overset{さいばん}{裁判}$が$\\overset{お}{起}$きた。/发生了围绕财产的审判。"
},
{
  word: "裁判",
  kana: "さいばん",
  type: "名・サ变动词する他",
  meaning: "审判，裁判。",
  example: "$\\overset{こうへい}{公平}$な$\\overset{さいばん}{裁判}$を$\\overset{もと}{求}$める。/寻求公平的审判。 || $\\overset{じけん}{事件}$を$\\overset{さいばん}{裁判}$する。/对案件进行审判。"
},
{
  word: "作者",
  kana: "さくしゃ",
  type: "名词",
  meaning: "作者。",
  example: "その$\\overset{さくひん}{作品}$の$\\overset{さくしゃ}{作者}$の$\\overset{こせい}{個性}$を$\\overset{そんちょう}{尊重}$する。/尊重那部作品作者的个性。"
},
{
  word: "作品",
  kana: "さくひん",
  type: "名词",
  meaning: "作品。",
  example: "$\\overset{しつ}{質}$の$\\overset{たか}{高}$い$\\overset{さくひん}{作品}$を$\\overset{つく}{作}$る。/创作出高质量的作品。"
},
{
  word: "質",
  kana: "しつ",
  type: "名词",
  meaning: "质量。",
  example: "$\\overset{しょうひん}{商品}$の$\\overset{しつ}{質}$を$\\overset{こうじょう}{向上}$させる。/提高商品的质量。"
},
{
  word: "首都",
  kana: "しゅと",
  type: "名词",
  meaning: "首都。",
  example: "$\\overset{しゅと}{首都}$の$\\overset{ちゅうしん}{中心}$で$\\overset{あたら}{新}$しい$\\overset{しょうひん}{商品}$の$\\overset{こうこく}{広告}$を$\\overset{だ}{出}$す。/在首都中心发布新商品的广告。"
},
{
  word: "使用",
  kana: "しよう",
  type: "名・サ变动词する他",
  meaning: "使用。",
  example: "この$\\overset{しせつ}{施設}$の$\\overset{しよう}{使用}$には$\\overset{かね}{金}$がかかる。/使用这个设施需要花钱。 || $\\overset{じょうしき}{常識}$の$\\overset{はんい}{範囲}$で$\\overset{しょうひん}{商品}$を$\\overset{しよう}{使用}$する。/在常识范围内使用商品。"
},
{
  word: "常識",
  kana: "じょうしき",
  type: "名词",
  meaning: "常识。",
  example: "それは$\\overset{しゃかい}{社会}$の$\\overset{じょうしき}{常識}$として$\\overset{し}{知}$られている。/那作为社会常识被人们所熟知。"
},
{
  word: "衝突",
  kana: "しょうとつ",
  type: "名・サ变动词する自",
  meaning: "冲突，相撞。",
  example: "$\\overset{いけん}{意見}$の$\\overset{しょうとつ}{衝突}$を$\\overset{さ}{避}$ける。/避免意见的冲突。 || $\\overset{くるま}{車}$が$\\overset{しょうとつ}{衝突}$して、$\\overset{しょうひん}{商品}$が$\\overset{こわ}{壊}$れた。/汽车相撞，商品损坏了。"
},
{
  word: "商品",
  kana: "しょうひん",
  type: "名词",
  meaning: "商品。",
  example: "$\\overset{しつ}{質}$の$\\overset{よ}{良}$い$\\overset{しょうひん}{商品}$を$\\overset{こうこく}{広告}$する。/为质量好的商品打广告。"
},
{
  word: "将来",
  kana: "しょうらい",
  type: "名词",
  meaning: "将来。",
  example: "$\\overset{じょせい}{女性}$の$\\overset{しょうらい}{将来}$について$\\overset{そうだん}{相談}$する。/就女性的将来进行商量。"
},
{
  word: "女性",
  kana: "じょせい",
  type: "名词",
  meaning: "女性。",
  example: "$\\overset{しんせき}{親戚}$の$\\overset{じょせい}{女性}$が$\\overset{しんぞう}{心臓}$の$\\overset{びょうき}{病気}$になった。/亲戚家的女性患了心脏病。"
},
{
  word: "親戚",
  kana: "しんせき",
  type: "名词",
  meaning: "亲戚。",
  example: "$\\overset{しんせき}{親戚}$と$\\overset{しんゆう}{親友}$を$\\overset{けっこんしき}{結婚式}$に$\\overset{しょうたい}{招待}$する。/邀请亲戚和挚友参加婚礼。"
},
{
  word: "心臓",
  kana: "しんぞう",
  type: "名词",
  meaning: "心脏。",
  example: "$\\overset{しんぞう}{心臓}$の$\\overset{びょうき}{病気}$を$\\overset{しんぱい}{心配}$する。/担心心脏的疾病。"
},
{
  word: "心配",
  kana: "しんぱい",
  type: "名・形动・サ变动词する自他",
  meaning: "担心。",
  example: "$\\overset{しんゆう}{親友}$の$\\overset{しょうらい}{将来}$が$\\overset{しんぱい}{心配}$だ。/担心挚友的将来。 || $\\overset{しけん}{試験}$の$\\overset{けっか}{結果}$を$\\overset{しんぱい}{心配}$している。/正担心考试的结果。"
},
{
  word: "親友",
  kana: "しんゆう",
  type: "名词",
  meaning: "挚友，好朋友。",
  example: "$\\overset{しんゆう}{親友}$の$\\overset{せいかく}{性格}$はとても$\\overset{よ}{良}$い。/挚友的性格非常好。"
},
{
  word: "信用",
  kana: "しんよう",
  type: "名・サ变动词する他",
  meaning: "信用，信任。",
  example: "$\\overset{かれ}{彼}$は$\\overset{しんよう}{信用}$のある$\\overset{だんせい}{男性}$だ。/他是个有信誉的男性。 || $\\overset{しんゆう}{親友}$を$\\overset{しんよう}{信用}$して$\\overset{ひみつ}{秘密}$を$\\overset{はな}{話}$す。/信任挚友并说出了秘密。"
},
{
  word: "性格",
  kana: "せいかく",
  type: "名词",
  meaning: "性格。",
  example: "$\\overset{かれ}{彼}$の$\\overset{せいかく}{性格}$と$\\overset{せいしつ}{性質}$を$\\overset{りかい}{理解}$する。/理解他的性格和秉性。"
},
{
  word: "税金",
  kana: "ぜいきん",
  type: "名词",
  meaning: "税金。",
  example: "$\\overset{ぜいきん}{税金}$の$\\overset{けいさん}{計算}$について$\\overset{そうだん}{相談}$する。/就税金的计算进行商量。"
},
{
  word: "性質",
  kana: "せいしつ",
  type: "名词",
  meaning: "性质，秉性。",
  example: "この$\\overset{しょうひん}{商品}$の$\\overset{せいしつ}{性質}$を$\\overset{そんちょう}{尊重}$する。/尊重这件商品的性质。"
},
{
  word: "相談",
  kana: "そうだん",
  type: "名・サ变动词する自他",
  meaning: "商量，咨询。",
  example: "$\\overset{せんせい}{先生}$に$\\overset{しょうらい}{将来}$の$\\overset{そうだん}{相談}$をする。/找老师商量将来的事。 || $\\overset{ぜいきん}{税金}$のことで$\\overset{だんせい}{男性}$に$\\overset{そうだん}{相談}$する。/因为税金的事找一位男性商量。"
},
{
  word: "尊重",
  kana: "そんちょう",
  type: "名・サ变动词する他",
  meaning: "尊重。",
  example: "$\\overset{こせい}{個性}$の$\\overset{そんちょう}{尊重}$が$\\overset{たいせつ}{大切}$だ。/尊重个性很重要。 || $\\overset{じょせい}{女性}$と$\\overset{だんせい}{男性}$の$\\overset{いけん}{意見}$を$\\overset{そんちょう}{尊重}$する。/尊重女性和男性的意见。"
},
{
  word: "男性",
  kana: "だんせい",
  type: "名词",
  meaning: "男性。",
  example: "あの$\\overset{だんせい}{男性}$は$\\overset{ちえ}{知恵}$がある。/那位男性很有智慧。"
},
{
  word: "知恵",
  kana: "ちえ",
  type: "名词",
  meaning: "智慧。",
  example: "$\\overset{ちえ}{知恵}$を$\\overset{しぼ}{絞}$って$\\overset{りえき}{利益}$を$\\overset{だ}{出}$す。/绞尽脑汁创造利润。"
},
{
  word: "注射",
  kana: "ちゅうしゃ",
  type: "名・サ变动词",
  meaning: "注射，打针。",
  example: "$\\overset{ちゅうしゃ}{注射}$の$\\overset{いた}{痛}$みを$\\overset{がまん}{我慢}$する。/忍受打针的疼痛。 || $\\overset{ちゅうしん}{中心}$の$\\overset{びょういん}{病院}$で$\\overset{ちゅうしゃ}{注射}$を$\\overset{う}{受}$ける。/在市中心的医院接受注射（打针）。"
},
{
  word: "中心",
  kana: "ちゅうしん",
  type: "名词",
  meaning: "中心。",
  example: "$\\overset{しゅと}{首都}$の$\\overset{ちゅうしん}{中心}$にある$\\overset{ばいてん}{売店}$。/位于首都中心的小卖部。"
},
{
  word: "貯金",
  kana: "ちょきん",
  type: "名・サ变动词する他",
  meaning: "存款，攒钱。",
  example: "$\\overset{ちょきん}{貯金}$がだんだん$\\overset{ふ}{増}$えている。/存款在渐渐增加。 || $\\overset{ねっしん}{熱心}$に$\\overset{ちょきん}{貯金}$して$\\overset{みらい}{未来}$に$\\overset{そな}{備}$える。/热心地攒钱以备未来。"
},
{
  word: "熱心",
  kana: "ねっしん",
  type: "名・形动",
  meaning: "热心，热情。",
  example: "$\\overset{しごと}{仕事}$への$\\overset{ねっしん}{熱心}$さが$\\overset{つた}{伝}$わる。/对工作的热心传达了过来。 || $\\overset{かれ}{彼}$は$\\overset{ひよう}{費用}$の$\\overset{けいさん}{計算}$に$\\overset{ねっしん}{熱心}$だ。/他对计算费用很热心。"
},
{
  word: "売店",
  kana: "ばいてん",
  type: "名词",
  meaning: "小卖部。",
  example: "$\\overset{ばいてん}{売店}$で$\\overset{ようふく}{洋服}$や$\\overset{びん}{瓶}$を$\\overset{か}{買}$う。/在小卖部买西服和瓶子。"
},
{
  word: "非常",
  kana: "ひじょう",
  type: "名・形动",
  meaning: "非常，紧急。",
  example: "$\\overset{ひじょう}{非常}$の$\\overset{さい}{際}$にはこの$\\overset{でぐち}{出口}$を$\\overset{つか}{使}$う。/紧急时刻使用这个出口。 || $\\overset{ひじょう}{非常}$な$\\overset{ひよう}{費用}$がかかる。/需要花费非常大的费用。"
},
{
  word: "費用",
  kana: "ひよう",
  type: "名词",
  meaning: "费用。",
  example: "$\\overset{ようふく}{洋服}$を$\\overset{か}{買}$う$\\overset{ひよう}{費用}$を$\\overset{ちょきん}{貯金}$する。/把买衣服的费用存起来。"
},
{
  word: "瓶",
  kana: "びん",
  type: "名词",
  meaning: "瓶子。",
  example: "$\\overset{びん}{瓶}$に$\\overset{はい}{入}$った$\\overset{しんせん}{新鮮}$な$\\overset{ぎゅうにゅう}{牛乳}$を$\\overset{の}{飲}$む。/喝装在瓶子里的新鲜牛奶。"
},
{
  word: "平均",
  kana: "へいきん",
  type: "名・サ变动词",
  meaning: "平均。",
  example: "テストの$\\overset{へいきん}{平均}$$\\overset{てん}{点}$を$\\overset{したまわ}{下回}$った。/低于考试的平均分。 || $\\overset{りえき}{利益}$を$\\overset{へいきん}{平均}$して$\\overset{けいさん}{計算}$する。/把利润平均起来计算。"
},
{
  word: "未来",
  kana: "みらい",
  type: "名词",
  meaning: "未来。",
  example: "$\\overset{みらい}{未来}$の$\\overset{りえき}{利益}$のために$\\overset{ちょきん}{貯金}$する。/为了未来的利益而攒钱。"
},
{
  word: "勿論",
  kana: "もちろん",
  type: "副词",
  meaning: "当然。",
  example: "$\\overset{りょうしん}{両親}$はもちろん、$\\overset{しんせき}{親戚}$も$\\overset{く}{来}$る。/父母自不必说，亲戚也会来。"
},
{
  word: "洋服",
  kana: "ようふく",
  type: "名词",
  meaning: "西装，西式服装。",
  example: "$\\overset{ばいてん}{売店}$で$\\overset{ようふく}{洋服}$の$\\overset{ひよう}{費用}$を$\\overset{はら}{払}$う。/在小卖部付西服的钱。"
},
{
  word: "利益",
  kana: "りえき",
  type: "名词",
  meaning: "利益，利润。",
  example: "$\\overset{ろうどう}{労働}$を$\\overset{りよう}{利用}$して$\\overset{りえき}{利益}$を$\\overset{え}{得}$る。/利用劳动获取利润。"
},
{
  word: "利用",
  kana: "りよう",
  type: "名・サ变动词する他",
  meaning: "利用。",
  example: "$\\overset{しせつ}{施設}$の$\\overset{りよう}{利用}$は$\\overset{むりょう}{無料}$です。/设施的利用是免费的。 || $\\overset{としょかん}{図書館}$を$\\overset{りよう}{利用}$して$\\overset{べんきょう}{勉強}$する。/利用图书馆学习。"
},
{
  word: "両親",
  kana: "りょうしん",
  type: "名词",
  meaning: "父母，双亲。",
  example: "$\\overset{りょうしん}{両親}$に$\\overset{ろうどう}{労働}$の$\\overset{くろう}{苦労}$を$\\overset{き}{聞}$く。/听父母讲述劳动的辛苦。"
},
{
  word: "労働",
  kana: "ろうどう",
  type: "名・サ变动词する自",
  meaning: "劳动。",
  example: "$\\overset{ろうどう}{労働}$の$\\overset{やす}{休}$みに$\\overset{かいすいよく}{海水浴}$へ$\\overset{い}{行}$く。/趁着劳动的休息时间去海水浴。 || $\\overset{こうじょう}{工場}$で$\\overset{まいにち}{毎日}$$\\overset{ろうどう}{労働}$している。/每天在工厂里劳动。"
},
{
  word: "海水浴",
  kana: "かいすいよく",
  type: "名・サ变动词する自",
  meaning: "海水浴，海滨游泳。",
  example: "$\\overset{なつやす}{夏休}$みに$\\overset{かいすいよく}{海水浴}$の$\\overset{けいかく}{計画}$を$\\overset{た}{立}$てる。/制定暑假去海水浴的计划。 || $\\overset{かいすいよく}{海水浴}$で$\\overset{つめ}{冷}$たい$\\overset{かん}{缶}$ジュースを$\\overset{の}{飲}$む。/在海水浴时喝冰镇罐装果汁。"
},
{
  word: "缶",
  kana: "かん",
  type: "名词",
  meaning: "罐头，易拉罐。",
  example: "$\\overset{きんぞく}{金属}$$\\overset{せい}{製}$の$\\overset{あ}{空}$き$\\overset{かん}{缶}$を$\\overset{ひろ}{拾}$う。/捡金属制的空易拉罐。"
},
{
  word: "金",
  kana: "きん",
  type: "名词",
  meaning: "金，黄金。",
  example: "$\\overset{きん}{金}$や$\\overset{きんぞく}{金属}$の$\\overset{せいひん}{製品}$を$\\overset{つく}{作}$る。/制造金子或金属的制品。"
},
{
  word: "金魚",
  kana: "きんぎょ",
  type: "名词",
  meaning: "金鱼。",
  example: "$\\overset{げじゅん}{下旬}$に$\\overset{まつ}{祭}$りで$\\overset{きんぎょ}{金魚}$をすくう。/下旬在庙会上捞金鱼。"
},
{
  word: "金属",
  kana: "きんぞく",
  type: "名词",
  meaning: "金属。",
  example: "$\\overset{きんぞく}{金属}$の$\\overset{しせつ}{施設}$を$\\overset{けんせつ}{建設}$する。/建设金属设施。"
},
{
  word: "下旬",
  kana: "げじゅん",
  type: "名词",
  meaning: "下旬。",
  example: "$\\overset{こんげつ}{今月}$の$\\overset{げじゅん}{下旬}$に$\\overset{けしょう}{化粧}$$\\overset{ひん}{品}$を$\\overset{か}{買}$う。/这个月下旬买化妆品。"
},
{
  word: "化粧",
  kana: "けしょう",
  type: "名・サ变动词",
  meaning: "化妆。",
  example: "$\\overset{かのじょ}{彼女}$は$\\overset{けしょう}{化粧}$がとても$\\overset{じょうず}{上手}$だ。/她非常擅长化妆。 || $\\overset{まいあさ}{毎朝}$$\\overset{けしょう}{化粧}$をするのに$\\overset{じかん}{時間}$がかかる。/每天早晨化妆很费时间。"
},
{
  word: "札",
  kana: "さつ",
  type: "名词",
  meaning: "钞票，纸币。",
  example: "$\\overset{せんえん}{千円}$$\\overset{さつ}{札}$で$\\overset{にちようひん}{日用品}$を$\\overset{か}{買}$う。/用千元纸币买日用品。"
},
{
  word: "施設",
  kana: "しせつ",
  type: "名词",
  meaning: "设施。",
  example: "$\\overset{しんるい}{親類}$の$\\overset{かいご}{介護}$$\\overset{しせつ}{施設}$を$\\overset{ほうもん}{訪問}$する。/访问亲戚所在的护理设施。"
},
{
  word: "神経",
  kana: "しんけい",
  type: "名词",
  meaning: "神经；敏感。",
  example: "$\\overset{しせつ}{施設}$の$\\overset{かんり}{管理}$に$\\overset{しんけい}{神経}$を$\\overset{つか}{使}$う。/在设施的管理上费尽神经（心思）。"
},
{
  word: "親類",
  kana: "しんるい",
  type: "名词",
  meaning: "亲属，亲戚。",
  example: "$\\overset{しんるい}{親類}$の$\\overset{せいぞう}{製造}$$\\overset{かいしゃ}{会社}$で$\\overset{はたら}{働}$く。/在亲戚的制造公司工作。"
},
{
  word: "製",
  kana: "せい",
  type: "后缀",
  meaning: "……制，……制造。",
  example: "$\\overset{きんぞく}{金属}$$\\overset{せい}{製}$の$\\overset{ぶひん}{部品}$を$\\overset{かんり}{管理}$する。/管理金属制的零件。"
},
{
  word: "製造",
  kana: "せいぞう",
  type: "名・サ变动词する他",
  meaning: "制造。",
  example: "この$\\overset{せいひん}{製品}$の$\\overset{せいぞう}{製造}$は$\\overset{むずか}{難}$しい。/这种产品的制造很困难。 || $\\overset{せっけん}{石鹸}$や$\\overset{にちようひん}{日用品}$を$\\overset{せいぞう}{製造}$する。/制造肥皂和日用品。"
},
{
  word: "製品",
  kana: "せいひん",
  type: "名词",
  meaning: "制品，产品。",
  example: "$\\overset{あたら}{新}$しい$\\overset{てつ}{鉄}$の$\\overset{せいひん}{製品}$を$\\overset{かいはつ}{開発}$する。/开发新的铁制品。"
},
{
  word: "石鹸",
  kana: "せっけん",
  type: "名词",
  meaning: "香皂，肥皂。",
  example: "$\\overset{せっけん}{石鹸}$などの$\\overset{にちようひん}{日用品}$を$\\overset{か}{買}$う。/买肥皂等日用品。"
},
{
  word: "太平洋",
  kana: "たいへいよう",
  type: "名词",
  meaning: "太平洋。",
  example: "$\\overset{たいへいよう}{太平洋}$の$\\overset{めんせき}{面積}$は$\\overset{ひろ}{広}$い。/太平洋的面积很广阔。"
},
{
  word: "鉄",
  kana: "てつ",
  type: "名词",
  meaning: "铁。",
  example: "$\\overset{てつ}{鉄}$の$\\overset{ぼう}{棒}$で$\\overset{しせつ}{施設}$を$\\overset{つく}{作}$る。/用铁棒建造设施。"
},
{
  word: "日用品",
  kana: "にちようひん",
  type: "名词",
  meaning: "日用品。",
  example: "$\\overset{ひょうじゅん}{標準}$的$\\overset{てき}{的}$な$\\overset{にちようひん}{日用品}$を$\\overset{つか}{使}$う。/使用标准的日用品。"
},
{
  word: "秒",
  kana: "びょう",
  type: "名词",
  meaning: "秒。",
  example: "$\\overset{りくじょうきょうぎ}{陸上競技}$で$\\overset{いち}{一}$$\\overset{びょう}{秒}$を$\\overset{あらそ}{争}$う。/在田径比赛中争分夺秒。"
},
{
  word: "標準",
  kana: "ひょうじゅん",
  type: "名词",
  meaning: "标准。",
  example: "$\\overset{ひんしつ}{品質}$の$\\overset{ひょうじゅん}{標準}$を$\\overset{まも}{守}$って$\\overset{ぶひん}{部品}$を$\\overset{つく}{作}$る。/遵守质量标准来制造零件。"
},
{
  word: "部品",
  kana: "ぶひん",
  type: "名词",
  meaning: "零件，部件。",
  example: "$\\overset{じどうしゃ}{自動車}$の$\\overset{ぶひん}{部品}$を$\\overset{せいぞう}{製造}$する。/制造汽车零件。"
},
{
  word: "平野",
  kana: "へいや",
  type: "名词",
  meaning: "平原。",
  example: "$\\overset{ひろ}{広}$い$\\overset{へいや}{平野}$の$\\overset{めんせき}{面積}$を$\\overset{けいさん}{計算}$する。/计算广阔平原的面积。"
},
{
  word: "棒",
  kana: "ぼう",
  type: "名词",
  meaning: "棒子，棍子。",
  example: "$\\overset{てつ}{鉄}$の$\\overset{ぼう}{棒}$を$\\overset{ひろ}{拾}$って$\\overset{あそ}{遊}$ぶ。/捡起铁棍玩耍。"
},
{
  word: "毎朝",
  kana: "まいあさ",
  type: "名词・副词",
  meaning: "每天早晨。",
  example: "$\\overset{まいあさ}{毎朝}$、$\\overset{りくじょうきょうぎ}{陸上競技}$の$\\overset{れんしゅう}{練習}$をする。/每天早晨进行田径练习。"
},
{
  word: "面積",
  kana: "めんせき",
  type: "名词",
  meaning: "面积。",
  example: "$\\overset{たいへいよう}{太平洋}$の$\\overset{めんせき}{面積}$は$\\overset{ひじょう}{非常}$に$\\overset{おお}{大}$きい。/太平洋的面积非常大。"
},
{
  word: "用",
  kana: "よう",
  type: "名词",
  meaning: "事情；用途。",
  example: "$\\overset{にちようひん}{日用品}$を$\\overset{か}{買}$う$\\overset{よう}{用}$があって$\\overset{がいしゅつ}{外出}$する。/因为有买日用品的事而外出。"
},
{
  word: "陸上競技",
  kana: "りくじょうきょうぎ",
  type: "名词",
  meaning: "田径运动。",
  example: "$\\overset{かれ}{彼}$は$\\overset{りくじょうきょうぎ}{陸上競技}$の$\\overset{せんしゅ}{選手}$として$\\overset{ぼしゅう}{募集}$された。/他作为田径选手被招募了。"
},
{
  word: "良心",
  kana: "りょうしん",
  type: "名词",
  meaning: "良心。",
  example: "$\\overset{りょうしん}{良心}$に$\\overset{したが}{従}$って$\\overset{ひんしつ}{品質}$を$\\overset{かんり}{管理}$する。/凭良心管理质量。"
},
{
  word: "介護",
  kana: "かいご",
  type: "名・サ变动词する他",
  meaning: "护理，照料。",
  example: "$\\overset{しんるい}{親類}$の$\\overset{かいご}{介護}$に$\\overset{じゅうじ}{従事}$する。/从事照顾亲戚的工作。 || $\\overset{ろうじん}{老人}$を$\\overset{ていねい}{丁寧}$に$\\overset{かいご}{介護}$する。/细心照料老人。"
},
{
  word: "管理",
  kana: "かんり",
  type: "名・サ变动词する他",
  meaning: "管理。",
  example: "$\\overset{ひんしつ}{品質}$の$\\overset{かんり}{管理}$が$\\overset{きび}{厳}$しい。/质量管理很严格。 || $\\overset{きかん}{機関}$の$\\overset{けいひ}{経費}$を$\\overset{かんり}{管理}$する。/管理机构的经费。"
},
{
  word: "機関",
  kana: "きかん",
  type: "名词",
  meaning: "机构，机关。",
  example: "$\\overset{ぐんじ}{軍事}$$\\overset{きかん}{機関}$で$\\overset{はたら}{働}$いている。/在军事机构工作。"
},
{
  word: "軍事",
  kana: "ぐんじ",
  type: "名词",
  meaning: "军事。",
  example: "$\\overset{ぐんじ}{軍事}$の$\\overset{きかん}{機関}$に$\\overset{かんしん}{関心}$がある。/对军事机构感兴趣。"
},
{
  word: "景品",
  kana: "けいひん",
  type: "名词",
  meaning: "赠品，奖品。",
  example: "$\\overset{しんしょうひん}{新商品}$の$\\overset{けいひん}{景品}$をもらう。/拿到了新商品的赠品。"
},
{
  word: "言動",
  kana: "げんどう",
  type: "名词",
  meaning: "言行。",
  example: "$\\overset{りょうしん}{良心}$的$\\overset{てき}{的}$な$\\overset{げんどう}{言動}$を$\\overset{こころ}{心}$がける。/留意保持有良知的言行。"
},
{
  word: "今月",
  kana: "こんげつ",
  type: "名词",
  meaning: "这个月。",
  example: "$\\overset{こんげつ}{今月}$の$\\overset{げじゅん}{下旬}$に$\\overset{けいひん}{景品}$を$\\overset{くば}{配}$る。/这个月下旬发放赠品。"
},
{
  word: "再利用",
  kana: "さいりよう",
  type: "名・サ变动词する他",
  meaning: "再利用，回收利用。",
  example: "$\\overset{かみ}{紙}$の$\\overset{さいりよう}{再利用}$を$\\overset{すいしん}{推進}$する。/推进纸张的再利用。 || $\\overset{しゃない}{社内}$で$\\overset{びん}{瓶}$の$\\overset{さいりよう}{再利用}$を$\\overset{けんとう}{検討}$する。/探讨在公司内对瓶子进行再利用。"
},
{
  word: "社内",
  kana: "しゃない",
  type: "名词",
  meaning: "公司内，社内。",
  example: "$\\overset{しゃない}{社内}$で$\\overset{ひんしつ}{品質}$の$\\overset{かんり}{管理}$を$\\overset{てってい}{徹底}$する。/在公司内彻底落实质量管理。"
},
{
  word: "従事",
  kana: "じゅうじ",
  type: "名・サ变动词する自",
  meaning: "从事。",
  example: "$\\overset{のうぎょう}{農業}$への$\\overset{じゅうじ}{従事}$を$\\overset{きぼう}{希望}$する。/希望能从事农业。 || $\\overset{かいご}{介護}$の$\\overset{しごと}{仕事}$に$\\overset{じゅうじ}{従事}$する$\\overset{ろうどうしゃ}{労働者}$。/从事护理工作的劳动者。"
},
{
  word: "新商品",
  kana: "しんしょうひん",
  type: "名词",
  meaning: "新商品。",
  example: "$\\overset{しんしょうひん}{新商品}$の$\\overset{ひんしつ}{品質}$を$\\overset{けんとう}{検討}$する。/探讨新商品的质量。"
},
{
  word: "船内",
  kana: "せんない",
  type: "名词",
  meaning: "船内。",
  example: "$\\overset{せんない}{船内}$で$\\overset{びょうどう}{平等}$に$\\overset{けいひん}{景品}$を$\\overset{わ}{分}$ける。/在船内平等地分配赠品。"
},
{
  word: "拍動",
  kana: "はくどう",
  type: "名・サ变动词する自",
  meaning: "搏动，跳动。",
  example: "$\\overset{しんぞう}{心臓}$の$\\overset{はくどう}{拍動}$が$\\overset{はや}{速}$くなる。/心脏的搏动加快。 || $\\overset{しんぞう}{心臓}$が$\\overset{はげ}{激}$しく$\\overset{はくどう}{拍動}$する。/心脏剧烈地跳动。"
},
{
  word: "平等",
  kana: "びょうどう",
  type: "名・形动",
  meaning: "平等。",
  example: "$\\overset{だんじょ}{男女}$の$\\overset{びょうどう}{平等}$を$\\overset{もと}{求}$める。/追求男女平等。 || $\\overset{ろうどうしゃ}{労働者}$は$\\overset{びょうどう}{平等}$でなければならない。/劳动者必须是平等的。"
},
{
  word: "品質",
  kana: "ひんしつ",
  type: "名词",
  meaning: "质量，品质。",
  example: "$\\overset{しんしょうひん}{新商品}$の$\\overset{ひんしつ}{品質}$を$\\overset{かんり}{管理}$する。/管理新商品的质量。"
},
{
  word: "募集",
  kana: "ぼしゅう",
  type: "名・サ变动词する他",
  meaning: "招募，募集。",
  example: "アルバイトの$\\overset{ぼしゅう}{募集}$を$\\overset{み}{見}$る。/看到了打工的招募。 || $\\overset{しゃない}{社内}$で$\\overset{あたら}{新}$しい$\\overset{ろうどうしゃ}{労働者}$を$\\overset{ぼしゅう}{募集}$する。/在公司内招募新的劳动者。"
},
{
  word: "労働者",
  kana: "ろうどうしゃ",
  type: "名词",
  meaning: "劳动者，工人。",
  example: "$\\overset{ぼしゅう}{募集}$した$\\overset{ろうどうしゃ}{労働者}$が$\\overset{かいご}{介護}$に$\\overset{じゅうじ}{従事}$する。/招募来的劳动者从事护理工作。"
},
{
  word: "運動",
  kana: "うんどう",
  type: "名・サ变动词する自",
  meaning: "运动。",
  example: "$\\overset{まいにち}{毎日}$の$\\overset{うんどう}{運動}$は$\\overset{からだ}{体}$に$\\overset{よ}{良}$い。/每天的运动对身体有益。 || $\\overset{きょねん}{去年}$から$\\overset{こうえん}{公園}$で$\\overset{うんどう}{運動}$している。/从去年开始在公园里运动。"
},
{
  word: "感じる",
  kana: "かんじる",
  type: "一段动词自他",
  meaning: "感觉，觉得。",
  example: "この$\\overset{こうじょう}{工場}$は$\\overset{ねつ}{熱}$$\\overset{き}{気}$を$\\overset{かん}{感}$じる。/感觉这个工厂里充满了热气。"
},
{
  word: "感動",
  kana: "かんどう",
  type: "名・サ变动词する自",
  meaning: "感动。",
  example: "その$\\overset{えいが}{映画}$はたくさんの$\\overset{かんどう}{感動}$を$\\overset{あた}{与}$えた。/那部电影给人带来了很多感动。 || $\\overset{ゆうめい}{有名}$な$\\overset{かんばん}{看板}$の$\\overset{ことば}{言葉}$に$\\overset{かんどう}{感動}$した。/被著名招牌上的话语感动了。"
},
{
  word: "看板",
  kana: "かんばん",
  type: "名词",
  meaning: "招牌，广告牌。",
  example: "$\\overset{こうえん}{公園}$の$\\overset{い}{入}$り$\\overset{ぐち}{口}$に$\\overset{おお}{大}$きな$\\overset{かんばん}{看板}$がある。/公园入口处有一块大招牌。"
},
{
  word: "去年",
  kana: "きょねん",
  type: "名词",
  meaning: "去年。",
  example: "$\\overset{きょねん}{去年}$、$\\overset{ひこうき}{飛行機}$で$\\overset{りょこう}{旅行}$に$\\overset{い}{行}$った。/去年坐飞机去旅行了。"
},
{
  word: "空港",
  kana: "くうこう",
  type: "名词",
  meaning: "机场。",
  example: "$\\overset{じゅうたい}{渋滞}$を$\\overset{さ}{避}$けて$\\overset{くうこう}{空港}$へ$\\overset{む}{向}$かう。/避开堵车前往机场。"
},
{
  word: "携帯電話",
  kana: "けいたいでんわ",
  type: "名词",
  meaning: "手机。",
  example: "$\\overset{とちゅう}{途中}$で$\\overset{けいたいでんわ}{携帯電話}$の$\\overset{ばんごう}{番号}$を$\\overset{こうかん}{交換}$した。/在途中交换了手机号码。"
},
{
  word: "公園",
  kana: "こうえん",
  type: "名词",
  meaning: "公园。",
  example: "$\\overset{でんしゃ}{電車}$を$\\overset{お}{降}$りて、$\\overset{こうえん}{公園}$を$\\overset{さんぽ}{散歩}$する。/下电车后，在公园散步。"
},
{
  word: "工場",
  kana: "こうじょう",
  type: "名词",
  meaning: "工厂。",
  example: "あそこの$\\overset{こうじょう}{工場}$は$\\overset{でんき}{電気}$を$\\overset{つく}{作}$っている。/那边的工厂是发电的。"
},
{
  word: "試験",
  kana: "しけん",
  type: "名・サ变动词する他",
  meaning: "考试，测验。",
  example: "$\\overset{あした}{明日}$の$\\overset{しけん}{試験}$のために$\\overset{べんきょう}{勉強}$する。/为了明天的考试而学习。 || $\\overset{あたら}{新}$しい$\\overset{きかい}{機械}$を$\\overset{しけん}{試験}$する。/测试新机器。"
},
{
  word: "渋滞",
  kana: "じゅうたい",
  type: "名・サ变动词する自",
  meaning: "堵车，交通拥堵。",
  example: "$\\overset{こうつう}{交通}$の$\\overset{じゅうたい}{渋滞}$で$\\overset{ちこく}{遅刻}$した。/因为交通拥堵迟到了。 || $\\overset{みち}{道}$が$\\overset{はげ}{激}$しく$\\overset{じゅうたい}{渋滞}$していて、$\\overset{くるま}{車}$が$\\overset{すす}{進}$まない。/道路严重拥堵，车子无法前进。"
},
{
  word: "新幹線",
  kana: "しんかんせん",
  type: "名词",
  meaning: "新干线（日本的高铁）。",
  example: "$\\overset{しんかんせん}{新幹線}$に$\\overset{の}{乗}$って$\\overset{ゆうめい}{有名}$な$\\overset{ばしょ}{場所}$へ$\\overset{い}{行}$く。/乘坐新干线去有名的地方。"
},
{
  word: "中止",
  kana: "ちゅうし",
  type: "名・サ变动词する自他",
  meaning: "中止，取消。",
  example: "$\\overset{あめ}{雨}$のため、$\\overset{しあい}{試合}$は$\\overset{ちゅうし}{中止}$になった。/因为下雨，比赛取消了。 || $\\overset{りょこう}{旅行}$の$\\overset{けいかく}{計画}$を$\\overset{ちゅうし}{中止}$する。/取消旅行计划。"
},
{
  word: "電気",
  kana: "でんき",
  type: "名词",
  meaning: "电，电灯。",
  example: "$\\overset{で}{出}$かける$\\overset{まえ}{前}$に$\\overset{でんき}{電気}$を$\\overset{け}{消}$すのを$\\overset{わす}{忘}$れないでください。/出门前请不要忘记关灯。"
},
{
  word: "電車",
  kana: "でんしゃ",
  type: "名词",
  meaning: "电车。",
  example: "$\\overset{とちゅう}{途中}$で$\\overset{でんしゃ}{電車}$から$\\overset{しんかんせん}{新幹線}$に$\\overset{の}{乗}$り$\\overset{か}{換}$える。/中途从电车换乘新干线。"
},
{
  word: "途中",
  kana: "とちゅう",
  type: "名词",
  meaning: "中途，半路。",
  example: "$\\overset{がっこう}{学校}$へ$\\overset{い}{行}$く$\\overset{とちゅう}{途中}$で、$\\overset{べんとう}{弁当}$を$\\overset{か}{買}$った。/在去学校的半路上买了便当。"
},
{
  word: "どなた",
  kana: "どなた",
  type: "代词",
  meaning: "哪位，谁（「だれ」的敬语形式）。",
  example: "あそこで$\\overset{あんない}{案内}$をしているのは、どなたですか。/在那边做向导的是哪位？"
},
{
  word: "熱",
  kana: "ねつ",
  type: "名词",
  meaning: "发烧；热度，热情。",
  example: "$\\overset{ねつ}{熱}$があるので、$\\overset{りょこう}{旅行}$を$\\overset{がまん}{我慢}$して$\\overset{やす}{休}$む。/因为发烧了，所以忍痛放弃旅行休息。"
},
{
  word: "場所",
  kana: "ばしょ",
  type: "名词",
  meaning: "场所，地方。",
  example: "ここは$\\overset{ほんとう}{本当}$に$\\overset{ゆうめい}{有名}$な$\\overset{ばしょ}{場所}$です。/这里真的是个有名的地方。"
},
{
  word: "番号",
  kana: "ばんごう",
  type: "名词",
  meaning: "号码。",
  example: "$\\overset{けいたいでんわ}{携帯電話}$の$\\overset{ばんごう}{番号}$を$\\overset{あんない}{案内}$の$\\overset{かみ}{紙}$に$\\overset{か}{書}$く。/把手机号码写在向导的纸上。"
},
{
  word: "飛行機",
  kana: "ひこうき",
  type: "名词",
  meaning: "飞机。",
  example: "$\\overset{ひこうき}{飛行機}$の$\\overset{おうふく}{往復}$チケットを$\\overset{よやく}{予約}$した。/预订了飞机的往返机票。"
},
{
  word: "弁当",
  kana: "べんとう",
  type: "名词",
  meaning: "便当，盒饭。",
  example: "$\\overset{りょこう}{旅行}$の$\\overset{とちゅう}{途中}$で$\\overset{おい}{美味}$しい$\\overset{べんとう}{弁当}$を$\\overset{た}{食}$べた。/在旅行途中吃了好吃的便当。"
},
{
  word: "本当",
  kana: "ほんとう",
  type: "名・形动",
  meaning: "真的，真实。",
  example: "$\\overset{かれ}{彼}$の$\\overset{い}{言}$ったことは$\\overset{ほんとう}{本当}$だ。/他说的是真的。 || $\\overset{ほんとう}{本当}$な$\\overset{きも}{気持}$ちを$\\overset{つた}{伝}$える。/传达真实的心情。"
},
{
  word: "有名",
  kana: "ゆうめい",
  type: "形动",
  meaning: "有名，出名。",
  example: "この$\\overset{りょかん}{旅館}$は$\\overset{りょうり}{料理}$が$\\overset{おい}{美味}$しいことで$\\overset{ゆうめい}{有名}$だ。/这家旅馆以菜肴美味而出名。"
},
{
  word: "旅行",
  kana: "りょこう",
  type: "名・サ变动词する自",
  meaning: "旅行。",
  example: "$\\overset{らいげつ}{来月}$の$\\overset{りょこう}{旅行}$が$\\overset{たの}{楽}$しみだ。/期待下个月的旅行。 || $\\overset{ひこうき}{飛行機}$で$\\overset{かいがい}{海外}$へ$\\overset{りょこう}{旅行}$する。/坐飞机去海外旅行。"
},
{
  word: "案内",
  kana: "あんない",
  type: "名・サ变动词する他",
  meaning: "向导，引导，通知。",
  example: "$\\overset{みち}{道}$の$\\overset{あんない}{案内}$を$\\overset{たの}{頼}$む。/拜托带路。 || お$\\overset{きゃく}{客}$さんを$\\overset{こうじょう}{工場}$へ$\\overset{あんない}{案内}$する。/带领客人参观工厂。"
},
{
  word: "往復",
  kana: "おうふく",
  type: "名・サ变动词する自",
  meaning: "往返。",
  example: "$\\overset{おうふく}{往復}$の$\\overset{きっぷ}{切符}$を$\\overset{か}{買}$う。/买往返车票。 || $\\overset{いえ}{家}$と$\\overset{がっこう}{学校}$の$\\overset{あいだ}{間}$を$\\overset{おうふく}{往復}$する。/在学校和家之间往返。"
},
{
  word: "活動",
  kana: "かつどう",
  type: "名・サ变动词する自",
  meaning: "活动。",
  example: "クラブの$\\overset{かつどう}{活動}$に$\\overset{さんか}{参加}$する。/参加俱乐部的活动。 || $\\overset{せっきょく}{積極}$的$\\overset{てき}{的}$に$\\overset{かつどう}{活動}$している。/正在积极地活动。"
},
{
  word: "可能",
  kana: "かのう",
  type: "名・形动",
  meaning: "可能。",
  example: "$\\overset{けいかく}{計画}$の$\\overset{じつげん}{実現}$は$\\overset{かのう}{可能}$だ。/计划的实现是可能的。 || $\\overset{かのう}{可能}$な$\\overset{かぎ}{限}$り$\\overset{どりょく}{努力}$する。/尽可能地努力。"
},
{
  word: "我慢",
  kana: "がまん",
  type: "名・サ变动词する他",
  meaning: "忍耐，忍受。",
  example: "$\\overset{がまん}{我慢}$の$\\overset{げんかい}{限界}$を$\\overset{こ}{超}$えた。/超出了忍耐的极限。 || $\\overset{いた}{痛}$みを$\\overset{がまん}{我慢}$して$\\overset{しけん}{試験}$を$\\overset{う}{受}$けた。/忍着痛参加了考试。"
},
{
  word: "感覚",
  kana: "かんかく",
  type: "名词",
  meaning: "感觉。",
  example: "$\\overset{さむ}{寒}$さで$\\overset{て}{手}$の$\\overset{かんかく}{感覚}$がなくなった。/因为寒冷，手失去了感觉。"
},
{
  word: "感謝",
  kana: "かんしゃ",
  type: "名・サ变动词する自他",
  meaning: "感谢。",
  example: "$\\overset{せんせい}{先生}$に$\\overset{かんしゃ}{感謝}$の$\\overset{きも}{気持}$ちを$\\overset{つた}{伝}$える。/向老师表达感谢的心情。 || $\\overset{りょうしん}{両親}$の$\\overset{しえん}{支援}$に$\\overset{ふか}{深}$く$\\overset{かんしゃ}{感謝}$する。/深深感谢父母的支援。"
},
{
  word: "感情",
  kana: "かんじょう",
  type: "名词",
  meaning: "感情，情绪。",
  example: "$\\overset{かれ}{彼}$は$\\overset{かんじょう}{感情}$を$\\overset{おもて}{表}$に$\\overset{だ}{出}$さない。/他喜怒不形于色。"
},
{
  word: "勘定",
  kana: "かんじょう",
  type: "名・サ变动词する他",
  meaning: "算账，结账；考虑。",
  example: "レストランで$\\overset{かんじょう}{勘定}$を$\\overset{す}{済}$ませる。/在餐厅结完账。 || $\\overset{にんずう}{人数}$を$\\overset{かんじょう}{勘定}$して$\\overset{べんとう}{弁当}$を$\\overset{ようい}{用意}$する。/清点人数并准备便当。"
},
{
  word: "感心",
  kana: "かんしん",
  type: "名・形动・サ变动词する自",
  meaning: "佩服，钦佩。",
  example: "$\\overset{かれ}{彼}$の$\\overset{どりょく}{努力}$には$\\overset{かんしん}{感心}$の$\\overset{ことば}{言葉}$しかない。/对他的努力只有钦佩之词。 || $\\overset{かんしん}{感心}$な$\\overset{たいど}{態度}$で$\\overset{はな}{話}$を$\\overset{き}{聞}$く。/以令人钦佩的态度听讲。 || $\\overset{かのじょ}{彼女}$の$\\overset{ゆうき}{勇気}$に$\\overset{かんしん}{感心}$した。/钦佩她的勇气。"
},
{
  word: "感想",
  kana: "かんそう",
  type: "名词",
  meaning: "感想。",
  example: "$\\overset{えいが}{映画}$を$\\overset{み}{見}$て、$\\overset{かんそう}{感想}$を$\\overset{さくぶん}{作文}$に$\\overset{か}{書}$いた。/看了电影后，把感想写在了作文里。"
},
{
  word: "漢方薬",
  kana: "かんぽうやく",
  type: "名词",
  meaning: "中药。",
  example: "$\\overset{せき}{咳}$が$\\overset{で}{出}$るので$\\overset{かんぽうやく}{漢方薬}$を$\\overset{の}{飲}$む。/因为咳嗽，所以喝中药。"
},
{
  word: "希望",
  kana: "きぼう",
  type: "名・サ变动词",
  meaning: "希望。",
  example: "$\\overset{みらい}{未来}$への$\\overset{きぼう}{希望}$を$\\overset{も}{持}$つ。/对未来抱有希望。 || $\\overset{かれ}{彼}$は$\\overset{だいがく}{大学}$への$\\overset{しんがく}{進学}$を$\\overset{きぼう}{希望}$している。/他希望升入大学。"
},
{
  word: "逆",
  kana: "ぎゃく",
  type: "名・形动",
  meaning: "相反，逆。",
  example: "$\\overset{かれ}{彼}$の$\\overset{いけん}{意見}$は$\\overset{わたし}{私}$の$\\overset{ぎゃく}{逆}$だ。/他的意见和我的相反。 || $\\overset{ぎゃく}{逆}$な$\\overset{ほうこう}{方向}$へ$\\overset{すす}{進}$んでしまった。/朝相反的方向走去了。"
},
{
  word: "記録",
  kana: "きろく",
  type: "名・サ变动词する他",
  meaning: "记录。",
  example: "スポーツ$\\overset{たいかい}{大会}$で$\\overset{あたら}{新}$しい$\\overset{きろく}{記録}$が$\\overset{で}{出}$た。/运动大会上出现了新记录。 || $\\overset{じっけん}{実験}$のデータを$\\overset{み}{見}$て$\\overset{きろく}{記録}$する。/看着实验数据进行记录。"
},
{
  word: "銀行",
  kana: "ぎんこう",
  type: "名词",
  meaning: "银行。",
  example: "$\\overset{ぎんこう}{銀行}$へ$\\overset{い}{行}$ってお$\\overset{かね}{金}$を$\\overset{りょうがえ}{両替}$する。/去银行换钱。"
},
{
  word: "禁止",
  kana: "きんし",
  type: "名・サ变动词する他",
  meaning: "禁止。",
  example: "ここでの$\\overset{さつえい}{撮影}$は$\\overset{きんし}{禁止}$です。/这里禁止拍照。 || $\\overset{ほうりつ}{法律}$でその$\\overset{こうい}{行為}$を$\\overset{きんし}{禁止}$する。/法律禁止该行为。"
},
{
  word: "区別",
  kana: "くべつ",
  type: "名・サ变动词する他",
  meaning: "区别，辨别。",
  example: "$\\overset{よ}{良}$いものと$\\overset{わる}{悪}$いものの$\\overset{くべつ}{区別}$がつかない。/分不清好的和坏的。 || $\\overset{ふた}{二}$つの$\\overset{げんご}{言語}$を$\\overset{せいかく}{正確}$に$\\overset{くべつ}{区別}$する。/准确地区别两种语言。"
},
{
  word: "稽古",
  kana: "けいこ",
  type: "名・サ变动词する他",
  meaning: "排练，练习（艺术、武术等）。",
  example: "$\\overset{げき}{劇}$の$\\overset{けいこ}{稽古}$が$\\overset{お}{終}$わった。/戏剧的排练结束了。 || $\\overset{まいにち}{毎日}$$\\overset{じゅうどう}{柔道}$を$\\overset{けいこ}{稽古}$している。/每天练习柔道。"
},
{
  word: "形式",
  kana: "けいしき",
  type: "名词",
  meaning: "形式。",
  example: "$\\overset{しけん}{試験}$の$\\overset{けいしき}{形式}$が$\\overset{ことし}{今年}$から$\\overset{か}{変}$わった。/考试的形式从今年开始改变了。"
},
{
  word: "劇",
  kana: "げき",
  type: "名词",
  meaning: "戏剧，话剧。",
  example: "$\\overset{はいゆう}{俳優}$たちが$\\overset{げき}{劇}$の$\\overset{けいこ}{稽古}$をしている。/演员们正在排练话剧。"
},
{
  word: "結局",
  kana: "けっきょく",
  type: "名・副词",
  meaning: "结果，归根结底。",
  example: "$\\overset{じけん}{事件}$の$\\overset{けっきょく}{結局}$はどうなりましたか。/事件的结局怎么样了？ || $\\overset{けっきょく}{結局}$、$\\overset{かれ}{彼}$は$\\overset{こ}{来}$なかった。/结果他还是没来。"
},
{
  word: "口述試験",
  kana: "こうじゅつしけん",
  type: "名词",
  meaning: "口试。",
  example: "$\\overset{ひっきしけん}{筆記試験}$のあとで$\\overset{こうじゅつしけん}{口述試験}$を$\\overset{う}{受}$ける。/笔试之后参加口试。"
},
{
  word: "行動",
  kana: "こうどう",
  type: "名・サ变动词する自",
  meaning: "行动。",
  example: "$\\overset{せきにん}{責任}$のある$\\overset{こうどう}{行動}$をとる。/采取负责任的行动。 || $\\overset{けいかく}{計画}$を$\\overset{じっこう}{実行}$するために$\\overset{こうどう}{行動}$する。/为了实行计划而行动。"
},
{
  word: "参加",
  kana: "さんか",
  type: "名・サ变动词する自",
  meaning: "参加。",
  example: "$\\overset{ぎょうじ}{行事}$への$\\overset{さんか}{参加}$を$\\overset{かんげい}{歓迎}$する。/欢迎参加活动。 || $\\overset{かれ}{彼}$もその$\\overset{かいぎ}{会議}$に$\\overset{さんか}{参加}$した。/他也参加了那次会议。"
},
{
  word: "実験",
  kana: "じっけん",
  type: "名・サ变动词する他",
  meaning: "实验。",
  example: "$\\overset{りか}{理科}$の$\\overset{じゅぎょう}{授業}$で$\\overset{じっけん}{実験}$をする。/在理科课上做实验。 || $\\overset{あたら}{新}$しい$\\overset{ほうほう}{方法}$を$\\overset{じっけん}{実験}$する。/对新方法进行实验。"
},
{
  word: "実行",
  kana: "じっこう",
  type: "名・サ变动词する他",
  meaning: "实行，执行。",
  example: "$\\overset{けいかく}{計画}$の$\\overset{じっこう}{実行}$に$\\overset{うつ}{移}$す。/转移到计划的实行阶段。 || $\\overset{き}{決}$めたことを$\\overset{かなら}{必}$ず$\\overset{じっこう}{実行}$する。/决定的事情一定要实行。"
},
{
  word: "支配",
  kana: "しはい",
  type: "名・サ变动词する他",
  meaning: "支配，统治，控制。",
  example: "$\\overset{しぜん}{自然}$の$\\overset{しはい}{支配}$から$\\overset{に}{逃}$がれることはできない。/无法逃脱自然的支配。 || $\\overset{きょうふ}{恐怖}$が$\\overset{かれ}{彼}$の$\\overset{こころ}{心}$を$\\overset{しはい}{支配}$した。/恐惧控制了他的心。"
},
{
  word: "就職",
  kana: "しゅうしょく",
  type: "名・サ变动词する自",
  meaning: "就职，找工作。",
  example: "$\\overset{だいがく}{大学}$を$\\overset{そつぎょう}{卒業}$して$\\overset{しゅうしょく}{就職}$する。/大学毕业后就职。 || あの$\\overset{ゆうめい}{有名}$な$\\overset{かいしゃ}{会社}$に$\\overset{しゅうしょく}{就職}$したい。/想去那家有名的公司就职。"
},
{
  word: "受験",
  kana: "じゅけん",
  type: "名・サ变动词する他",
  meaning: "应考，参加考试。",
  example: "$\\overset{じゅけん}{受験}$の$\\overset{じゅんび}{準備}$で$\\overset{いそが}{忙}$しい。/忙于应考的准备。 || $\\overset{ことし}{今年}$$\\overset{だいがく}{大学}$を$\\overset{じゅけん}{受験}$する$\\overset{よてい}{予定}$だ。/打算今年报考大学。"
},
{
  word: "需要",
  kana: "じゅよう",
  type: "名词",
  meaning: "需求，需要。",
  example: "この$\\overset{しょうひん}{商品}$は$\\overset{じゅよう}{需要}$が$\\overset{おお}{大}$きい。/这件商品的需求量很大。"
},
{
  word: "春節",
  kana: "しゅんせつ",
  type: "名词",
  meaning: "春节。",
  example: "$\\overset{しゅんせつ}{春節}$は$\\overset{ちゅうごく}{中国}$の$\\overset{しんねん}{新年}$の$\\overset{しゅくじつ}{祝日}$です。/春节是中国的农历新年假日。"
},
{
  word: "少年",
  kana: "しょうねん",
  type: "名词",
  meaning: "少年。",
  example: "その$\\overset{しょうねん}{少年}$は$\\overset{せいねん}{青年}$に$\\overset{せいちょう}{成長}$した。/那个少年成长为了青年。"
},
{
  word: "新年",
  kana: "しんねん",
  type: "名词",
  meaning: "新年。",
  example: "$\\overset{しんねん}{新年}$の$\\overset{ぎょうじ}{行事}$が$\\overset{せいだい}{盛大}$に$\\overset{おこな}{行}$われる。/盛大举行新年的活动。"
},
{
  word: "青年",
  kana: "せいねん",
  type: "名词",
  meaning: "青年。",
  example: "$\\overset{かれ}{彼}$は$\\overset{りっぱ}{立派}$な$\\overset{せいねん}{青年}$になった。/他成了一个出色的青年。"
},
{
  word: "政府",
  kana: "せいふ",
  type: "名词",
  meaning: "政府。",
  example: "$\\overset{せいふ}{政府}$は$\\overset{あたら}{新}$しい$\\overset{ほうりつ}{法律}$を$\\overset{じっし}{実施}$した。/政府实施了新法律。"
},
{
  word: "咳",
  kana: "せき",
  type: "名词",
  meaning: "咳嗽。",
  example: "$\\overset{せき}{咳}$が$\\overset{で}{出}$るので$\\overset{やっきょく}{薬局}$で$\\overset{くすり}{薬}$を$\\overset{か}{買}$った。/因为咳嗽，所以在药房买了药。"
},
{
  word: "設備",
  kana: "せつび",
  type: "名词",
  meaning: "设备，设施。",
  example: "この$\\overset{こうじょう}{工場}$の$\\overset{せつび}{設備}$はとても$\\overset{あたら}{新}$しい。/这家工厂的设备非常新。"
},
{
  word: "線",
  kana: "せん",
  type: "名词",
  meaning: "线，线条。",
  example: "ノートに$\\overset{へいこう}{平行}$な$\\overset{せん}{線}$を$\\overset{ひ}{引}$く。/在笔记本上画平行线。"
},
{
  word: "相当",
  kana: "そうとう",
  type: "名・形动・副词・サ变动词",
  meaning: "相当，非常；适合。",
  example: "$\\overset{きょう}{今日}$の$\\overset{しけん}{試験}$は$\\overset{そうとう}{相当}$$\\overset{むずか}{難}$しかった。/今天的考试相当难。 || $\\overset{せんえん}{千円}$に$\\overset{そうとう}{相当}$する$\\overset{しなもの}{品物}$。/相当于一千日元的物品。"
},
{
  word: "対する",
  kana: "たいする",
  type: "サ变动词自",
  meaning: "面对；对于，针对（常作「～に対する」）。",
  example: "$\\overset{せんせい}{先生}$に$\\overset{たい}{対}$する$\\overset{れいぎ}{礼儀}$を$\\overset{わす}{忘}$れないでください。/请不要忘记对老师的礼仪。"
},
{
  word: "地方",
  kana: "ちほう",
  type: "名词",
  meaning: "地方，地区。",
  example: "$\\overset{ちほう}{地方}$の$\\overset{ほうげん}{方言}$には$\\overset{どくとく}{独特}$の$\\overset{みりょく}{魅力}$がある。/地方方言有着独特的魅力。"
},
{
  word: "適当",
  kana: "てきとう",
  type: "形动",
  meaning: "合适，适当；敷衍，马虎。",
  example: "$\\overset{てきとう}{適当}$な$\\overset{ほうこう}{方法}$で$\\overset{もんだい}{問題}$を$\\overset{かいけつ}{解決}$する。/用合适的方法解决问题。 || $\\overset{てきとう}{適当}$な$\\overset{へんじ}{返事}$をしてはいけない。/不能敷衍地回答。"
},
{
  word: "天井",
  kana: "てんじょう",
  type: "名词",
  meaning: "天花板。",
  example: "$\\overset{てんじょう}{天井}$の$\\overset{でんとう}{電灯}$を$\\overset{こうかん}{交換}$する。/更换天花板上的电灯。"
},
{
  word: "当然",
  kana: "とうぜん",
  type: "名・形动・副词",
  meaning: "理所当然，应该。",
  example: "ルールを$\\overset{まも}{守}$るのは$\\overset{とうぜん}{当然}$のことだ。/遵守规则是理所当然的事。 || $\\overset{かれ}{彼}$が$\\overset{おこ}{怒}$るのも$\\overset{とうぜん}{当然}$だ。/他生气也是理所当然的。"
},
{
  word: "当番",
  kana: "とうばん",
  type: "名词",
  meaning: "值日，值班。",
  example: "$\\overset{きょう}{今日}$の$\\overset{そうじ}{掃除}$の$\\overset{とうばん}{当番}$は$\\overset{わたし}{私}$です。/今天打扫卫生的值日生是我。"
},
{
  word: "年配",
  kana: "ねんぱい",
  type: "名词",
  meaning: "年长。",
  example: "$\\overset{ねんぱい}{年配}$$\\overset{しゃ}{者}$には$\\overset{れいぎただ}{礼儀正}$しく$\\overset{っせ}{接}$するべきだ。/对待年长者应该有礼貌。"
},
{
  word: "俳優",
  kana: "はいゆう",
  type: "名词",
  meaning: "演员。",
  example: "あの$\\overset{はいゆう}{俳優}$は$\\overset{ゆうめい}{有名}$な$\\overset{げき}{劇}$に$\\overset{しゅつえん}{出演}$した。/那位演员出演了有名的戏剧。"
},
{
  word: "反省",
  kana: "はんせい",
  type: "名・サ变动词する自他",
  meaning: "反省。",
  example: "$\\overset{じぶん}{自分}$の$\\overset{かしつ}{過失}$を$\\overset{ふか}{深}$く$\\overset{はんせい}{反省}$する。/对自己的过失进行深刻的反省。 || $\\overset{しっぱい}{失敗}$を$\\overset{はんせい}{反省}$して、$\\overset{つぎ}{次}$に$\\overset{い}{生}$かす。/反省失败，运用到下一次。"
},
{
  word: "筆記試験",
  kana: "ひっきしけん",
  type: "名词",
  meaning: "笔试。",
  example: "$\\overset{あした}{明日}$、$\\overset{ひっきしけん}{筆記試験}$と$\\overset{めんせつ}{面接}$がある。/明天有笔试和面试。"
},
{
  word: "必要",
  kana: "ひつよう",
  type: "名・形动",
  meaning: "必要，需要。",
  example: "お$\\overset{かね}{金}$の$\\overset{ひつよう}{必要}$が$\\overset{しょう}{生}$じた。/产生了对钱的需要。 || $\\overset{しけん}{試験}$に$\\overset{ごうかく}{合格}$するためには$\\overset{どりょく}{努力}$が$\\overset{ひつよう}{必要}$だ。/为了通过考试，努力是必要的。"
},
{
  word: "布団",
  kana: "ふとん",
  type: "名词",
  meaning: "被褥，被子。",
  example: "$\\overset{りょかん}{旅館}$で$\\overset{あたた}{温}$かい$\\overset{ふとん}{布団}$に$\\overset{ね}{寝}$る。/在旅馆里睡在温暖的被窝里。"
},
{
  word: "平行",
  kana: "へいこう",
  type: "名・サ变动词・形动する自",
  meaning: "平行。",
  example: "$\\overset{ふた}{二}$つの$\\overset{せん}{線}$が$\\overset{へいこう}{平行}$になっている。/两条线平行。 || $\\overset{みち}{道}$と$\\overset{かわ}{川}$が$\\overset{へいこう}{平行}$して$\\overset{はし}{走}$っている。/道路和河流平行延伸。"
},
{
  word: "方向",
  kana: "ほうこう",
  type: "名词",
  meaning: "方向。",
  example: "$\\overset{ぎゃく}{逆}$の$\\overset{ほうこう}{方向}$へ$\\overset{ある}{歩}$いてしまった。/朝相反的方向走去了。"
},
{
  word: "方法",
  kana: "ほうほう",
  type: "名词",
  meaning: "方法。",
  example: "$\\overset{いちばん}{一番}$$\\overset{ゆうり}{有利}$な$\\overset{ほうほう}{方法}$を$\\overset{えら}{選}$ぶ。/选择最有利的方法。"
},
{
  word: "味方",
  kana: "みかた",
  type: "名・サ变动词",
  meaning: "同伴，自己人；支持。",
  example: "$\\overset{かれ}{彼}$はいつだって$\\overset{わたし}{私}$の$\\overset{みかた}{味方}$だ。/他什么时候都是我这边的（支持者）。 || $\\overset{よわ}{弱}$い$\\overset{もの}{者}$に$\\overset{みかた}{味方}$する。/支持/站在弱者一边。"
},
{
  word: "面接",
  kana: "めんせつ",
  type: "名・サ变动词する他",
  meaning: "面试。",
  example: "$\\overset{しゅうしょく}{就職}$の$\\overset{めんせつ}{面接}$を$\\overset{う}{受}$ける。/参加就职的面试。 || $\\overset{あした}{明日}$$\\overset{しゃちょう}{社長}$と$\\overset{めんせつ}{面接}$する。/明天和总经理面试。"
},
{
  word: "紅葉",
  kana: "こうよう",
  type: "名・サ变动词する自",
  meaning: "红叶；树叶变红。",
  example: "$\\overset{あき}{秋}$の$\\overset{こうよう}{紅葉}$がとてもきれいだ。/秋天的红叶非常漂亮。 || $\\overset{やま}{山}$が$\\overset{うつく}{美}$しく$\\overset{こうよう}{紅葉}$している。/漫山遍野红叶如画。"
},
{
  word: "薬局",
  kana: "やっきょく",
  type: "名词",
  meaning: "药店。",
  example: "$\\overset{やっきょく}{薬局}$で$\\overset{かんぽうやく}{漢方薬}$を$\\overset{か}{買}$う。/在药店买中药。"
},
{
  word: "欲",
  kana: "よく",
  type: "名词",
  meaning: "欲望，贪心。",
  example: "$\\overset{にんげん}{人間}$には$\\overset{さまざま}{様々}$な$\\overset{よく}{欲}$がある。/人有各种各样的欲望。"
},
{
  word: "流行",
  kana: "りゅうこう",
  type: "名・サ变动词する自",
  meaning: "流行。",
  example: "$\\overset{ことし}{今年}$の$\\overset{りゅうこう}{流行}$の$\\overset{ふく}{服}$を$\\overset{か}{買}$う。/买今年流行的衣服。 || $\\overset{わかもの}{若者}$の$\\overset{あいだ}{間}$で$\\overset{あたら}{新}$しいゲームが$\\overset{りゅうこう}{流行}$している。/年轻人在流行一款新游戏。"
},
{
  word: "両替",
  kana: "りょうがえ",
  type: "名・サ变动词する他",
  meaning: "兑换，换钱。",
  example: "$\\overset{くうこう}{空港}$で$\\overset{りょうがえ}{両替}$をする。/在机场换钱。 || $\\overset{ぎんこう}{銀行}$で$\\overset{えん}{円}$を$\\overset{げん}{元}$に$\\overset{りょうがえ}{両替}$する。/在银行把日元换成人民币。"
},
{
  word: "両方",
  kana: "りょうほう",
  type: "名词",
  meaning: "双方，两边。",
  example: "$\\overset{にく}{肉}$と$\\overset{さかな}{魚}$の$\\overset{りょうほう}{両方}$が$\\overset{す}{好}$きだ。/肉和鱼两边（都）喜欢。"
},
{
  word: "旅館",
  kana: "りょかん",
  type: "名词",
  meaning: "旅馆（日式）。",
  example: "$\\overset{りょこう}{旅行}$の$\\overset{とき}{時}$、$\\overset{りょかん}{旅館}$の$\\overset{わしつ}{和室}$に$\\overset{と}{泊}$まった。/旅行的时候，住在了旅馆的和室里。"
},
{
  word: "礼儀",
  kana: "れいぎ",
  type: "名词",
  meaning: "礼节，礼仪。",
  example: "$\\overset{めんせつ}{面接}$では$\\overset{れいぎ}{礼儀}$がとても$\\overset{じゅうよう}{重要}$だ。/在面试中礼仪非常重要。"
},
{
  word: "一方",
  kana: "いっぽう",
  type: "名词・接续词",
  meaning: "一方面；（表示转折）另一方面。",
  example: "$\\overset{みち}{道}$の$\\overset{いっぽう}{一方}$は$\\overset{かわ}{川}$になっている。/道路的一边是河。 || $\\overset{かれ}{彼}$は$\\overset{やさ}{優}$しい。$\\overset{いっぽう}{一方}$、$\\overset{おとうと}{弟}$は$\\overset{つめ}{冷}$たい。/他很温柔。另一方面，弟弟却很冷酷。"
},
{
  word: "運動場",
  kana: "うんどうじょう",
  type: "名词",
  meaning: "操场，运动场。",
  example: "$\\overset{うんどうじょう}{運動場}$で$\\overset{しょうねん}{少年}$たちが$\\overset{はし}{走}$っている。/少年们在操场上奔跑。"
},
{
  word: "円",
  kana: "えん",
  type: "名词",
  meaning: "日元；圆。",
  example: "$\\overset{ぎんこう}{銀行}$で$\\overset{いちまん}{一万}$$\\overset{えん}{円}$を$\\overset{お}{下}$ろす。/在银行取一万日元。"
},
{
  word: "感じ",
  kana: "かんじ",
  type: "名词",
  meaning: "感觉，印象。",
  example: "あの$\\overset{ひと}{人}$はとても$\\overset{よ}{良}$い$\\overset{かんじ}{感}$じがする。/那个人给人很好的感觉。"
},
{
  word: "技師",
  kana: "ぎし",
  type: "名词",
  meaning: "工程师，技师。",
  example: "$\\overset{こうじょう}{工場}$の$\\overset{ぎし}{技師}$が$\\overset{せつび}{設備}$を$\\overset{しゅうり}{修理}$する。/工厂的工程师修理设备。"
},
{
  word: "汽車",
  kana: "きしゃ",
  type: "名词",
  meaning: "火车。",
  example: "$\\overset{きしゃ}{汽車}$に$\\overset{の}{乗}$って$\\overset{こきょう}{故郷}$へ$\\overset{かえ}{帰}$る。/坐火车回故乡。"
},
{
  word: "急行",
  kana: "きゅうこう",
  type: "名・サ变动词",
  meaning: "快车；急行，赶赴。",
  example: "$\\overset{でんしゃ}{電車}$は$\\overset{きゅうこう}{急行}$に$\\overset{の}{乗}$ったほうが$\\overset{はや}{早}$い。/电车坐快车比较快。 || $\\overset{じこ}{事故}$の$\\overset{げんば}{現場}$へ$\\overset{きゅうこう}{急行}$する。/赶赴事故现场。"
},
{
  word: "旧暦",
  kana: "きゅうれき",
  type: "名词",
  meaning: "农历，旧历。",
  example: "$\\overset{しゅんせつ}{春節}$は$\\overset{きゅうれき}{旧暦}$の$\\overset{しんねん}{新年}$です。/春节是农历的新年。"
},
{
  word: "行",
  kana: "ぎょう",
  type: "名词",
  meaning: "行，排。",
  example: "ノートの$\\overset{つぎ}{次}$の$\\overset{ぎょう}{行}$から$\\overset{か}{書}$き$\\overset{はじ}{始}$める。/从笔记本的下一行开始写。"
},
{
  word: "供給",
  kana: "きょうきゅう",
  type: "名・サ变动词",
  meaning: "供给，供应。",
  example: "$\\overset{じゅよう}{需要}$と$\\overset{きょうきゅう}{供給}$のバランスが$\\overset{たいせつ}{大切}$だ。/需求和供给的平衡很重要。 || $\\overset{こうじょう}{工場}$に$\\overset{でんき}{電気}$を$\\overset{きょうきゅう}{供給}$する。/向工厂供电。"
},
{
  word: "曲",
  kana: "きょく",
  type: "名词",
  meaning: "曲子，乐曲。",
  example: "$\\overset{りゅうこう}{流行}$の$\\overset{きょく}{曲}$を$\\overset{うた}{歌}$う。/唱流行的曲子。"
},
{
  word: "元",
  kana: "げん",
  type: "名词",
  meaning: "元（货币单位）；本源，原来。",
  example: "$\\overset{ぎんこう}{銀行}$で$\\overset{えん}{円}$を$\\overset{げん}{元}$に$\\overset{りょうがえ}{両替}$する。/在银行把日元换成人民币。"
},
{
  word: "現場",
  kana: "げんば",
  type: "名词",
  meaning: "现场。",
  example: "$\\overset{じこ}{事故}$の$\\overset{げんば}{現場}$を$\\overset{かくにん}{確認}$する。/确认事故的现场。"
},
{
  word: "個",
  kana: "こ",
  type: "量词",
  meaning: "个。",
  example: "りんごを$\\overset{さん}{三}$$\\overset{こ}{個}$$\\overset{こうにゅう}{購入}$した。/买了三个苹果。"
},
{
  word: "行為",
  kana: "こうい",
  type: "名词",
  meaning: "行为。",
  example: "$\\overset{かれ}{彼}$の$\\overset{りっぱ}{立派}$な$\\overset{こうい}{行為}$に$\\overset{かんしん}{感心}$した。/对他的出色行为感到钦佩。"
},
{
  word: "ご覧",
  kana: "ごらん",
  type: "名・连语",
  meaning: "看（「見る」的尊敬语）。",
  example: "あの$\\overset{そら}{空}$をごらんください。/请看那片天空。"
},
{
  word: "今晩",
  kana: "こんばん",
  type: "名词",
  meaning: "今晚。",
  example: "$\\overset{こんばん}{今晩}$、$\\overset{ともだち}{友達}$と$\\overset{でんわ}{電話}$で$\\overset{はな}{話}$す$\\overset{よてい}{予定}$だ。/今晚打算和朋友打电话。"
},
{
  word: "今夜",
  kana: "こんや",
  type: "名词",
  meaning: "今夜，今晚。",
  example: "$\\overset{こんや}{今夜}$は$\\overset{つき}{月}$がとてもきれいです。/今夜的月亮非常美。"
},
{
  word: "歳月",
  kana: "さいげつ",
  type: "名词",
  meaning: "岁月。",
  example: "$\\overset{なが}{長}$い$\\overset{さいげつ}{歳月}$が$\\overset{なが}{流}$れた。/漫长的岁月流逝了。"
},
{
  word: "最中",
  kana: "さいちゅう",
  type: "名词",
  meaning: "正在……之中。",
  example: "$\\overset{かいぎ}{会議}$の$\\overset{さいちゅう}{最中}$に$\\overset{けいたいでんわ}{携帯電話}$が$\\overset{な}{鳴}$った。/开会的时候手机响了。"
},
{
  word: "仕方",
  kana: "しかた",
  type: "名词",
  meaning: "方法，办法。",
  example: "その$\\overset{きかい}{機械}$の$\\overset{つか}{使}$い$\\overset{しかた}{仕方}$がわからない。/不知道那台机器的使用方法。"
},
{
  word: "少女",
  kana: "しょうじょ",
  type: "名词",
  meaning: "少女。",
  example: "あの$\\overset{しょうじょ}{少女}$は$\\overset{しょうらい}{将来}$が$\\overset{たの}{楽}$しみだ。/那位少女的未来值得期待。"
},
{
  word: "職場",
  kana: "しょくば",
  type: "名词",
  meaning: "职场，工作场所。",
  example: "$\\overset{しょくば}{職場}$の$\\overset{どうりょう}{同僚}$と$\\overset{ぼうねんかい}{忘年会}$をする。/和职场的同事开忘年会。"
},
{
  word: "中央",
  kana: "ちゅうおう",
  type: "名词",
  meaning: "中央，中心。",
  example: "$\\overset{へや}{部屋}$の$\\overset{ちゅうおう}{中央}$に$\\overset{おお}{大}$きな$\\overset{つくえ}{机}$がある。/房间中央有一张大桌子。"
},
{
  word: "駐車場",
  kana: "ちゅうしゃじょう",
  type: "名词",
  meaning: "停车场。",
  example: "$\\overset{くるま}{車}$を$\\overset{ちゅうしゃじょう}{駐車場}$に$\\overset{と}{止}$める。/把车停在停车场。"
},
{
  word: "電池",
  kana: "でんち",
  type: "名词",
  meaning: "电池。",
  example: "$\\overset{けいたいでんわ}{携帯電話}$の$\\overset{でんち}{電池}$が$\\overset{き}{切}$れそうだ。/手机电池好像要没电了。"
},
{
  word: "電灯",
  kana: "でんとう",
  type: "名词",
  meaning: "电灯。",
  example: "$\\overset{くら}{暗}$くなったので、$\\overset{でんとう}{電灯}$をつける。/天变暗了，所以开电灯。"
},
{
  word: "電話",
  kana: "でんわ",
  type: "名・サ变动词",
  meaning: "电话。",
  example: "$\\overset{おや}{親}$から$\\overset{でんわ}{電話}$がかかってきた。/父母打来了电话。 || $\\overset{ようじ}{用事}$があって$\\overset{ともだち}{友達}$に$\\overset{でんわ}{電話}$する。/有事给朋友打电话。"
},
{
  word: "とも",
  kana: "とも",
  type: "助词・接尾词",
  meaning: "和……一起；共，都。",
  example: "$\\overset{かぞく}{家族}$とともに$\\overset{しゅくじつ}{祝日}$を$\\overset{す}{過}$ごす。/和家人一起度过节日。 || $\\overset{かれ}{彼}$ら$\\overset{ふたり}{二人}$とも$\\overset{しけん}{試験}$に$\\overset{ごうかく}{合格}$した。/他们两个人都通过了考试。"
},
{
  word: "年賀状",
  kana: "ねんがじょう",
  type: "名词",
  meaning: "贺年卡。",
  example: "$\\overset{しんねん}{新年}$に$\\overset{せんせい}{先生}$へ$\\overset{ねんがじょう}{年賀状}$を$\\overset{だ}{出}$す。/新年给老师寄贺年卡。"
},
{
  word: "年末",
  kana: "ねんまつ",
  type: "名词",
  meaning: "年末，年底。",
  example: "$\\overset{ねんまつ}{年末}$は$\\overset{か}{買}$い$\\overset{もの}{物}$で$\\overset{いそが}{忙}$しい。/年末因为购物很忙。"
},
{
  word: "馬鹿",
  kana: "ばか",
  type: "名・形动",
  meaning: "傻瓜；荒唐，愚蠢。",
  example: "$\\overset{かれ}{彼}$を$\\overset{ばか}{馬鹿}$にしてはいけない。/不能把他当傻瓜（看不起他）。 || $\\overset{ばか}{馬鹿}$なことを$\\overset{い}{言}$わないで。/别说傻话了。"
},
{
  word: "場面",
  kana: "ばめん",
  type: "名词",
  meaning: "场面，情景。",
  example: "$\\overset{えいが}{映画}$の$\\overset{さいご}{最後}$の$\\overset{ばめん}{場面}$に$\\overset{かんどう}{感動}$した。/被电影最后的场面感动了。"
},
{
  word: "番",
  kana: "ばん",
  type: "名词",
  meaning: "顺序，轮次；看守。",
  example: "$\\overset{つぎ}{次}$は$\\overset{わたし}{私}$の$\\overset{ばん}{番}$です。/接下来轮到我了。"
},
{
  word: "万年筆",
  kana: "まんねんひつ",
  type: "名词",
  meaning: "钢笔。",
  example: "$\\overset{まんねんひつ}{万年筆}$で$\\overset{てがみ}{手紙}$を$\\overset{か}{書}$く。/用钢笔写信。"
},
{
  word: "留守番電話",
  kana: "るすばんでんわ",
  type: "名词",
  meaning: "电话留言机。",
  example: "$\\overset{るすばんでんわ}{留守番電話}$にメッセージを$\\overset{のこ}{残}$す。/在电话留言机里留言。"
},
{
  word: "列",
  kana: "れつ",
  type: "名词",
  meaning: "队列，行列。",
  example: "$\\overset{れつ}{列}$に$\\overset{なら}{並}$んで$\\overset{じゅんばん}{順番}$を$\\overset{ま}{待}$つ。/排在队列里等候顺序。"
},
{
  word: "曖昧",
  kana: "あいまい",
  type: "形动",
  meaning: "含糊，暧昧。",
  example: "$\\overset{あいまい}{曖昧}$な$\\overset{へんじ}{返事}$をしないで、はっきりと$\\overset{い}{言}$ってください。/请不要含糊其辞，清楚地说出来。"
},
{
  word: "安定",
  kana: "あんてい",
  type: "名・サ变动词",
  meaning: "稳定。",
  example: "$\\overset{しゃかい}{社会}$の$\\overset{あんてい}{安定}$を$\\overset{たも}{保}$つ。/保持社会的稳定。 || $\\overset{かれ}{彼}$の$\\overset{せいせき}{成績}$は$\\overset{あんてい}{安定}$している。/他的成绩很稳定。"
},
{
  word: "音痴",
  kana: "おんち",
  type: "名词",
  meaning: "五音不全，音盲；对某方面缺乏感觉的人。",
  example: "$\\overset{わたし}{私}$は$\\overset{おんち}{音痴}$だから、$\\overset{うた}{歌}$を$\\overset{うた}{歌}$うのが$\\overset{いや}{嫌}$だ。/我五音不全，所以讨厌唱歌。"
},
{
  word: "改革",
  kana: "かいかく",
  type: "名・サ变动词する他",
  meaning: "改革。",
  example: "$\\overset{きょういく}{教育}$の$\\overset{かいかく}{改革}$が$\\overset{ひつよう}{必要}$だ。/教育的改革是必要的。 || $\\overset{ふる}{古}$い$\\overset{せいど}{制度}$を$\\overset{かいかく}{改革}$する。/改革旧制度。"
},
{
  word: "確認",
  kana: "かくにん",
  type: "名・サ变动词する他",
  meaning: "确认。",
  example: "$\\overset{けいやく}{契約}$の$\\overset{かくにん}{確認}$をお$\\overset{ねが}{願}$いします。/麻烦确认一下合同。 || $\\overset{でんわ}{電話}$で$\\overset{よてい}{予定}$を$\\overset{かくにん}{確認}$する。/用电话确认行程。"
},
{
  word: "過失",
  kana: "かしつ",
  type: "名词",
  meaning: "过失，错误。",
  example: "$\\overset{じぶん}{自分}$の$\\overset{かしつ}{過失}$を$\\overset{すなお}{素直}$に$\\overset{みと}{認}$める。/坦率地承认自己的过失。"
},
{
  word: "貴重",
  kana: "きちょう",
  type: "形动",
  meaning: "贵重，宝贵。",
  example: "$\\overset{せんせい}{先生}$から$\\overset{きちょう}{貴重}$な$\\overset{いけん}{意見}$をもらった。/从老师那里得到了宝贵的意见。"
},
{
  word: "行事",
  kana: "ぎょうじ",
  type: "名词",
  meaning: "活动，仪式。",
  example: "$\\overset{がっこう}{学校}$の$\\overset{せいだい}{盛大}$な$\\overset{ぎょうじ}{行事}$に$\\overset{さんか}{参加}$する。/参加学校盛大的活动。"
},
{
  word: "行政",
  kana: "ぎょうせい",
  type: "名词",
  meaning: "行政。",
  example: "$\\overset{せいふ}{政府}$の$\\overset{ぎょうせい}{行政}$$\\overset{きかん}{機関}$で$\\overset{はたら}{働}$く。/在政府的行政机关工作。"
},
{
  word: "蜘蛛",
  kana: "くも",
  type: "名词",
  meaning: "蜘蛛。",
  example: "$\\overset{てんじょう}{天井}$に$\\overset{くも}{蜘蛛}$の$\\overset{す}{巣}$がある。/天花板上有蜘蛛网。"
},
{
  word: "契約",
  kana: "けいやく",
  type: "名・サ变动词",
  meaning: "契约，合同。",
  example: "$\\overset{かいしゃ}{会社}$と$\\overset{けいやく}{契約}$を$\\overset{むす}{結}$ぶ。/和公司签订合同。 || アパートを$\\overset{いちねんかん}{一年間}$$\\overset{けいやく}{契約}$する。/租一年的公寓（签一年合同）。"
},
{
  word: "言語",
  kana: "げんご",
  type: "名词",
  meaning: "语言。",
  example: "$\\overset{がいこく}{外国}$の$\\overset{げんご}{言語}$を$\\overset{べんきょう}{勉強}$する。/学习外国的语言。"
},
{
  word: "公共",
  kana: "こうきょう",
  type: "名词",
  meaning: "公共。",
  example: "$\\overset{こうきょう}{公共}$の$\\overset{しせつ}{施設}$を$\\overset{たいせつ}{大切}$に$\\overset{つか}{使}$う。/爱护使用公共设施。"
},
{
  word: "公私",
  kana: "こうし",
  type: "名词",
  meaning: "公私。",
  example: "$\\overset{こうし}{公私}$をはっきりと$\\overset{くべつ}{区別}$する。/公私分明。"
},
{
  word: "購入",
  kana: "こうにゅう",
  type: "名・サ变动词する他",
  meaning: "购入，购买。",
  example: "$\\overset{あたら}{新}$しい$\\overset{きかい}{機械}$の$\\overset{こうにゅう}{購入}$を$\\overset{けんとう}{検討}$する。/探讨购买新机器。 || スーパーで$\\overset{にちようひん}{日用品}$を$\\overset{こうにゅう}{購入}$する。/在超市购买日用品。"
},
{
  word: "再現",
  kana: "さいげん",
  type: "名・サ变动词",
  meaning: "再现，重现。",
  example: "あの$\\overset{げき}{劇}$の$\\overset{さいげん}{再現}$は$\\overset{すばら}{素晴}$らしい。/那部剧的重现非常棒。 || $\\overset{かこ}{過去}$の$\\overset{じっけん}{実験}$を$\\overset{さいげん}{再現}$する。/重现过去的实验。"
},
{
  word: "撮影",
  kana: "さつえい",
  type: "名・サ变动词する他",
  meaning: "摄影，拍照。",
  example: "ここで$\\overset{えいが}{映画}$の$\\overset{さつえい}{撮影}$が$\\overset{おこな}{行}$われている。/这里正在进行电影的拍摄。 || $\\overset{うつく}{美}$しい$\\overset{こうよう}{紅葉}$をカメラで$\\overset{さつえい}{撮影}$する。/用相机拍摄美丽的红叶。"
},
{
  word: "自治",
  kana: "じち",
  type: "名・サ变动词する自",
  meaning: "自治。",
  example: "$\\overset{ちほう}{地方}$$\\overset{じち}{自治}$の$\\overset{せいど}{制度}$を$\\overset{まな}{学}$ぶ。/学习地方自治的制度。 || $\\overset{せいと}{生徒}$たちが$\\overset{じぶん}{自分}$の$\\overset{がっこう}{学校}$を$\\overset{じち}{自治}$する。/学生们自治自己的学校。"
},
{
  word: "実施",
  kana: "じっし",
  type: "名・サ变动词する他",
  meaning: "实施。",
  example: "$\\overset{あたら}{新}$しい$\\overset{けいかく}{計画}$の$\\overset{じっし}{実施}$を$\\overset{ま}{待}$つ。/等待新计划的实施。 || $\\overset{らいげつ}{来月}$から$\\overset{しけん}{試験}$を$\\overset{じっし}{実施}$する。/从下个月开始实施考试。"
},
{
  word: "集権",
  kana: "しゅうけん",
  type: "名词",
  meaning: "集权。",
  example: "$\\overset{ちゅうおう}{中央}$$\\overset{しゅうけん}{集権}$の$\\overset{せいど}{制度}$について$\\overset{ぎろん}{議論}$する。/讨论中央集权的制度。"
},
{
  word: "充電",
  kana: "じゅうでん",
  type: "名・サ变动词する他",
  meaning: "充电。",
  example: "$\\overset{けいたいでんわ}{携帯電話}$の$\\overset{じゅうでん}{充電}$が$\\overset{き}{切}$れた。/手机没电了。 || $\\overset{ね}{寝}$る$\\overset{まえ}{前}$に$\\overset{でんち}{電池}$を$\\overset{じゅうでん}{充電}$する。/睡前给电池充电。"
},
{
  word: "祝日",
  kana: "しゅくじつ",
  type: "名词",
  meaning: "节日，假日。",
  example: "$\\overset{らいしゅう}{来週}$の$\\overset{げつようび}{月曜日}$は$\\overset{しゅくじつ}{祝日}$で$\\overset{やす}{休}$みです。/下周一是节日，放假。"
},
{
  word: "盛大",
  kana: "せいだい",
  type: "形动",
  meaning: "盛大。",
  example: "$\\overset{しんねん}{新年}$の$\\overset{ぎょうじ}{行事}$が$\\overset{せいだい}{盛大}$に$\\overset{おこな}{行}$われた。/盛大举行了新年的活动。"
},
{
  word: "体験",
  kana: "たいけん",
  type: "名・サ变动词する他",
  meaning: "体验。",
  example: "$\\overset{がいこく}{外国}$での$\\overset{たいけん}{体験}$は$\\overset{きちょう}{貴重}$だ。/在国外的体验很宝贵。 || $\\overset{さどう}{茶道}$の$\\overset{ぶんか}{文化}$を$\\overset{たいけん}{体験}$する。/体验茶道文化。"
},
{
  word: "着陸",
  kana: "ちゃくりく",
  type: "名・サ变动词",
  meaning: "着陆，降落。",
  example: "$\\overset{ひこうき}{飛行機}$の$\\overset{ちゃくりく}{着陸}$が$\\overset{ぶじ}{無事}$に$\\overset{お}{終}$わった。/飞机的降落平安结束了。 || $\\overset{くうこう}{空港}$に$\\overset{ひこうき}{飛行機}$が$\\overset{ちゃくりく}{着陸}$する。/飞机在机场降落。"
},
{
  word: "中華街",
  kana: "ちゅうかがい",
  type: "名词",
  meaning: "中华街，唐人街。",
  example: "$\\overset{ちゅうかがい}{中華街}$で$\\overset{おい}{美味}$しい$\\overset{ちゅうかりょうり}{中華料理}$を$\\overset{た}{食}$べる。/在中华街吃美味的中国菜。"
},
{
  word: "年中",
  kana: "ねんじゅう",
  type: "名・副词",
  meaning: "全年，一年到头。",
  example: "この$\\overset{みせ}{店}$は$\\overset{ねんじゅう}{年中}$$\\overset{むきゅう}{無休}$です。/这家店全年无休。 || $\\overset{かれ}{彼}$は$\\overset{ねんじゅう}{年中}$$\\overset{いそが}{忙}$しく$\\overset{はたら}{働}$いている。/他一年到头都在忙着工作。"
},
{
  word: "年配者",
  kana: "ねんぱいしゃ",
  type: "名词",
  meaning: "年长者。",
  example: "$\\overset{ねんぱいしゃ}{年配者}$の$\\overset{いけん}{意見}$を$\\overset{そんちょう}{尊重}$する。/尊重年长者的意见。"
},
{
  word: "頻繁",
  kana: "ひんぱん",
  type: "形动",
  meaning: "频繁。",
  example: "$\\overset{さいきん}{最近}$、$\\overset{じしん}{地震}$が$\\overset{ひんぱん}{頻繁}$に$\\overset{お}{起}$こる。/最近频繁发生地震。"
},
{
  word: "ほう",
  kana: "ほう",
  type: "名词",
  meaning: "方面，方向；比较的选择（「～ほうがいい」）。",
  example: "$\\overset{わたし}{私}$のほうから$\\overset{かれ}{彼}$に$\\overset{でんわ}{電話}$します。/由我这边给他打电话。"
},
{
  word: "方言",
  kana: "ほうげん",
  type: "名词",
  meaning: "方言。",
  example: "$\\overset{ちほう}{地方}$の$\\overset{ほうげん}{方言}$を$\\overset{りかい}{理解}$するのは$\\overset{むずか}{難}$しい。/理解地方方言很难。"
},
{
  word: "有利",
  kana: "ゆうり",
  type: "名・形动",
  meaning: "有利。",
  example: "$\\overset{しあい}{試合}$は$\\overset{わたし}{私}$たちに$\\overset{ゆうり}{有利}$に$\\overset{すす}{進}$んでいる。/比赛正朝着对我们有利的方向进行。 || $\\overset{めんせつ}{面接}$で$\\overset{ゆうり}{有利}$な$\\overset{じょうけん}{条件}$を$\\overset{も}{持}$つ。/在面试中拥有有利的条件。"
},
{
  word: "礼儀正しい",
  kana: "れいぎただしい",
  type: "形容词",
  meaning: "有礼貌。",
  example: "$\\overset{かれ}{彼}$は$\\overset{だれ}{誰}$に$\\overset{たい}{対}$しても$\\overset{れいぎただ}{礼儀正}$しい$\\overset{せいねん}{青年}$だ。/他是个对谁都彬彬有礼的青年。"
},
{
  word: "英語",
  kana: "えいご",
  type: "名词",
  meaning: "英语。",
  example: "$\\overset{さっそく}{早速}$ですが、$\\overset{えいご}{英語}$の$\\overset{しつもん}{質問}$があります。/说来就来（马上），我有一个关于英语的问题。"
},
{
  word: "早速",
  kana: "さっそく",
  type: "副词",
  meaning: "立刻，马上。",
  example: "$\\overset{さっそく}{早速}$$\\overset{せき}{席}$に$\\overset{つ}{着}$いて、$\\overset{にもつ}{荷物}$を$\\overset{せいり}{整理}$する。/立刻在座位上坐好，整理行李。"
},
{
  word: "席",
  kana: "せき",
  type: "名词",
  meaning: "座位。",
  example: "$\\overset{えいがかん}{映画館}$の$\\overset{せき}{席}$を$\\overset{よやく}{予約}$する。/预订电影院的座位。"
},
{
  word: "荷物",
  kana: "にもつ",
  type: "名词",
  meaning: "行李，包裹。",
  example: "$\\overset{がいこく}{外国}$から$\\overset{とど}{届}$いた$\\overset{にもつ}{荷物}$にりんごが$\\overset{はい}{入}$っていた。/从外国寄来的包裹里装有苹果。"
},
{
  word: "りんご",
  kana: "りんご",
  type: "名词",
  meaning: "苹果。",
  example: "$\\overset{ばん}{晩}$ごはんにりんごと$\\overset{やさい}{野菜}$を$\\overset{た}{食}$べた。/晚饭吃了苹果和蔬菜。"
},
{
  word: "外国",
  kana: "がいこく",
  type: "名词",
  meaning: "外国。",
  example: "$\\overset{がいこく}{外国}$の$\\overset{ぶんか}{文化}$に$\\overset{かん}{関}$する$\\overset{しつもん}{質問}$をする。/提出关于外国文化的问题。"
},
{
  word: "質問",
  kana: "しつもん",
  type: "名・サ变动词",
  meaning: "提问，问题。",
  example: "$\\overset{せんせい}{先生}$に$\\overset{えいご}{英語}$の$\\overset{しつもん}{質問}$をする。/向老师提英语问题。 || $\\overset{わ}{分}$からないところを$\\overset{しつもん}{質問}$してください。/不懂的地方请提问。"
},
{
  word: "台所",
  kana: "だいどころ",
  type: "名词",
  meaning: "厨房。",
  example: "$\\overset{ばん}{晩}$、$\\overset{だいどころ}{台所}$で$\\overset{ゆうしょく}{夕食}$の$\\overset{じゅんび}{準備}$をする。/晚上在厨房准备晚饭。"
},
{
  word: "晩",
  kana: "ばん",
  type: "名词",
  meaning: "晚上。",
  example: "$\\overset{あした}{明日}$の$\\overset{ばん}{晩}$、$\\overset{やきゅう}{野球}$の$\\overset{しあい}{試合}$を$\\overset{けんぶつ}{見物}$する$\\overset{よてい}{予定}$だ。/明晚打算去观看棒球比赛。"
},
{
  word: "欠席",
  kana: "けっせき",
  type: "名・サ变动词する自他",
  meaning: "缺席。",
  example: "$\\overset{きょう}{今日}$の$\\overset{じゅぎょう}{授業}$の$\\overset{けっせき}{欠席}$$\\overset{しゃ}{者}$は$\\overset{だれ}{誰}$ですか。/今天课上的缺席者是谁？ || $\\overset{かぜ}{風邪}$を$\\overset{ひ}{引}$いたので、$\\overset{かいぎ}{会議}$を$\\overset{けっせき}{欠席}$する。/因为感冒了，所以缺席会议。"
},
{
  word: "出席",
  kana: "しゅっせき",
  type: "名・サ变动词する自",
  meaning: "出席。",
  example: "$\\overset{あした}{明日}$の$\\overset{かいぎ}{会議}$に$\\overset{しゅっせき}{出席}$する$\\overset{よてい}{予定}$です。/打算出席明天的会议。 || $\\overset{しゅっちょう}{出張}$から$\\overset{もど}{戻}$り、$\\overset{しき}{式}$に$\\overset{しゅっせき}{出席}$した。/出差回来后，出席了仪式。"
},
{
  word: "中国",
  kana: "ちゅうごく",
  type: "名词",
  meaning: "中国。",
  example: "$\\overset{ちゅうごく}{中国}$の$\\overset{きょうげき}{京劇}$を$\\overset{けんぶつ}{見物}$する。/观看中国的京剧。"
},
{
  word: "野球",
  kana: "やきゅう",
  type: "名词",
  meaning: "棒球。",
  example: "$\\overset{しゅうまつ}{週末}$に$\\overset{ともだち}{友達}$と$\\overset{やきゅう}{野球}$をして$\\overset{あそ}{遊}$ぶ。/周末和朋友打棒球玩。"
},
{
  word: "見物",
  kana: "けんぶつ",
  type: "名・サ变动词",
  meaning: "参观，游览。",
  example: "$\\overset{めいしょきゅうせき}{名所旧跡}$の$\\overset{けんぶつ}{見物}$に$\\overset{い}{行}$く。/去游览名胜古迹。 || $\\overset{しゅっちょう}{出張}$の$\\overset{とちゅう}{途中}$で$\\overset{いせき}{遺跡}$を$\\overset{けんぶつ}{見物}$した。/出差途中参观了遗迹。"
},
{
  word: "出張",
  kana: "しゅっちょう",
  type: "名・サ变动词する自",
  meaning: "出差。",
  example: "$\\overset{こんど}{今度}$の$\\overset{しゅっちょう}{出張}$は$\\overset{がいこく}{外国}$です。/这次的出差是去外国。 || $\\overset{らいしゅう}{来週}$、$\\overset{ちゅうごく}{中国}$へ$\\overset{しゅっちょう}{出張}$する。/下周去中国出差。"
},
{
  word: "点",
  kana: "てん",
  type: "名词",
  meaning: "分数；点，要点。",
  example: "テストで$\\overset{ひゃく}{百}$$\\overset{てん}{点}$を$\\overset{と}{取}$って$\\overset{すてき}{素敵}$だ。/考试考了一百分，真棒。"
},
{
  word: "訳す",
  kana: "やくす",
  type: "五段动词他",
  meaning: "翻译。",
  example: "この$\\overset{えいご}{英語}$の$\\overset{ぶんしょう}{文章}$を$\\overset{ちゅうごくご}{中国語}$に$\\overset{やく}{訳}$す。/把这篇英语文章翻译成中文。"
},
{
  word: "今度",
  kana: "こんど",
  type: "名词",
  meaning: "这次；下次。",
  example: "$\\overset{こんど}{今度}$の$\\overset{やす}{休}$みに$\\overset{どうぶつ}{動物}$$\\overset{えん}{園}$へ$\\overset{い}{行}$く。/下次放假去动物园。"
},
{
  word: "素敵",
  kana: "すてき",
  type: "形动",
  meaning: "极好，出色，漂亮。",
  example: "あの$\\overset{りっぱ}{立派}$な$\\overset{いせき}{遺跡}$はとても$\\overset{すてき}{素敵}$だ。/那个壮观的遗迹非常漂亮。"
},
{
  word: "動物",
  kana: "どうぶつ",
  type: "名词",
  meaning: "动物。",
  example: "$\\overset{しぜん}{自然}$の$\\overset{どうぶつ}{動物}$と$\\overset{しょくぶつ}{植物}$を$\\overset{ほご}{保護}$する。/保护自然界中的动物和植物。"
},
{
  word: "野菜",
  kana: "やさい",
  type: "名词",
  meaning: "蔬菜。",
  example: "$\\overset{しんせん}{新鮮}$な$\\overset{やさい}{野菜}$と$\\overset{ぎゅうにく}{牛肉}$を$\\overset{か}{買}$う。/买新鲜的蔬菜和牛肉。"
},
{
  word: "遺産",
  kana: "いさん",
  type: "名词",
  meaning: "遗产。",
  example: "$\\overset{こくさい}{国際}$的$\\overset{てき}{的}$な$\\overset{ぶんか}{文化}$$\\overset{いさん}{遺産}$を$\\overset{ほご}{保護}$する。/保护国际文化遗产。"
},
{
  word: "国際",
  kana: "こくさい",
  type: "名词",
  meaning: "国际。",
  example: "$\\overset{こくさい}{国際}$$\\overset{もんだい}{問題}$について$\\overset{こくみん}{国民}$が$\\overset{ちゅうもく}{注目}$する。/国民关注国际问题。"
},
{
  word: "震度",
  kana: "しんど",
  type: "名词",
  meaning: "震级，地震烈度。",
  example: "テレビで$\\overset{じしん}{地震}$の$\\overset{しんど}{震度}$を$\\overset{ほう}{報}$じる。/电视上播报地震的烈度。"
},
{
  word: "普段",
  kana: "ふだん",
  type: "名词・副词",
  meaning: "平时，平常。",
  example: "$\\overset{ふだん}{普段}$の$\\overset{たいど}{態度}$が$\\overset{たいせつ}{大切}$だ。/平时的态度很重要。 || $\\overset{ふだん}{普段}$から$\\overset{さいがい}{災害}$を$\\overset{よそう}{予想}$して$\\overset{よぼう}{予防}$する。/从平时就预测灾害并进行预防。"
},
{
  word: "予想",
  kana: "よそう",
  type: "名・サ变动词する他",
  meaning: "预料，预计。",
  example: "$\\overset{けっか}{結果}$は$\\overset{よそう}{予想}$と$\\overset{ぜんぜん}{全然}$$\\overset{ちが}{違}$った。/结果和预料的完全不同。 || $\\overset{てんきよほう}{天気予報}$で$\\overset{あした}{明日}$の$\\overset{おんど}{温度}$を$\\overset{よそう}{予想}$する。/在天气预报中预测明天的温度。"
},
{
  word: "遺跡",
  kana: "いせき",
  type: "名词",
  meaning: "遗迹。",
  example: "$\\overset{りっぱ}{立派}$な$\\overset{いせき}{遺跡}$を$\\overset{かんこう}{観光}$する$\\overset{よてい}{予定}$だ。/打算去观光壮观的遗迹。"
},
{
  word: "国民",
  kana: "こくみん",
  type: "名词",
  meaning: "国民。",
  example: "$\\overset{こくみん}{国民}$の$\\overset{せいかつ}{生活}$を$\\overset{ほご}{保護}$する$\\overset{せいど}{制度}$を$\\overset{つく}{作}$る。/制定保护国民生活的制度。"
},
{
  word: "制度",
  kana: "せいど",
  type: "名词",
  meaning: "制度。",
  example: "$\\overset{あたら}{新}$しい$\\overset{きょういく}{教育}$$\\overset{せいど}{制度}$を$\\overset{こうちく}{構築}$する。/构建新的教育制度。"
},
{
  word: "保護",
  kana: "ほご",
  type: "名・サ变动词する他",
  meaning: "保护。",
  example: "$\\overset{かんきょう}{環境}$$\\overset{ほご}{保護}$のために$\\overset{ししゅつ}{支出}$を$\\overset{ふ}{増}$やす。/为了环境保护而增加支出。 || $\\overset{めいしょきゅうせき}{名所旧跡}$を$\\overset{たいせつ}{大切}$に$\\overset{ほご}{保護}$する。/好好地保护名胜古迹。"
},
{
  word: "予定",
  kana: "よてい",
  type: "名・サ变动词する他",
  meaning: "预定，计划。",
  example: "$\\overset{あした}{明日}$の$\\overset{よてい}{予定}$を$\\overset{かくにん}{確認}$する。/确认明天的日程。 || $\\overset{ごご}{午後}$に$\\overset{しゅっぱつ}{出発}$する$\\overset{よてい}{予定}$だ。/打算下午出发。"
},
{
  word: "遠慮",
  kana: "えんりょ",
  type: "名・サ变动词する自他",
  meaning: "客气，辞让。",
  example: "どうぞご$\\overset{えんりょ}{遠慮}$なく$\\overset{しつもん}{質問}$してください。/请不要客气，随便提问。 || $\\overset{ほか}{他}$の$\\overset{ひと}{人}$の$\\overset{めいわく}{迷惑}$になるので$\\overset{えんりょ}{遠慮}$する。/因为会给别人添麻烦，所以就不去了（推辞）。"
},
{
  word: "支出",
  kana: "ししゅつ",
  type: "名・サ变动词する自他",
  meaning: "支出。",
  example: "$\\overset{こんげつ}{今月}$の$\\overset{しゅうにゅう}{収入}$と$\\overset{ししゅつ}{支出}$を$\\overset{けいさん}{計算}$する。/计算这个月的收入和支出。 || $\\overset{よさん}{予算}$の$\\overset{はんい}{範囲}$$\\overset{ない}{内}$で$\\overset{ししゅつ}{支出}$する。/在预算范围内进行支出。"
},
{
  word: "絶対",
  kana: "ぜったい",
  type: "名・副词",
  meaning: "绝对。",
  example: "$\\overset{ぜったい}{絶対}$の$\\overset{かち}{価値}$がある。/具有绝对的价值。 || $\\overset{かれ}{彼}$は$\\overset{ぜったい}{絶対}$に$\\overset{やくそく}{約束}$を$\\overset{まも}{守}$る。/他绝对会遵守约定。"
},
{
  word: "迷惑",
  kana: "めいわく",
  type: "名・形动・サ变动词する自",
  meaning: "麻烦，打扰。",
  example: "$\\overset{きんじょ}{近所}$の$\\overset{ひと}{人}$に$\\overset{めいわく}{迷惑}$をかける。/给邻居添麻烦。 || $\\overset{とつぜん}{突然}$の$\\overset{ほうもん}{訪問}$は$\\overset{めいわく}{迷惑}$だ。/突然的拜访很惹人烦。 || $\\overset{そうおん}{騒音}$で$\\overset{じゅうみん}{住民}$が$\\overset{めいわく}{迷惑}$している。/居民正因为噪音而感到困扰。"
},
{
  word: "予防",
  kana: "よぼう",
  type: "名・サ变动词する他",
  meaning: "预防。",
  example: "$\\overset{かぜ}{風邪}$の$\\overset{よぼう}{予防}$のために$\\overset{て}{手}$を$\\overset{あら}{洗}$う。/为了预防感冒而洗手。 || $\\overset{だいしんさい}{大震災}$の$\\overset{ひがい}{被害}$を$\\overset{よぼう}{予防}$する。/预防大地震的受灾情况。"
},
{
  word: "温度",
  kana: "おんど",
  type: "名词",
  meaning: "温度。",
  example: "$\\overset{おんどけい}{温度計}$で$\\overset{れいぞうこ}{冷蔵庫}$の$\\overset{おんど}{温度}$を$\\overset{はか}{測}$る。/用温度计测量冰箱的温度。"
},
{
  word: "支度",
  kana: "したく",
  type: "名・サ变动词する他",
  meaning: "准备。",
  example: "$\\overset{がいしゅつ}{外出}$の$\\overset{したく}{支度}$をする。/做外出的准备。 || $\\overset{いそ}{急}$いで$\\overset{ゆうしょく}{夕食}$を$\\overset{したく}{支度}$する。/急急忙忙地准备晚饭。"
},
{
  word: "態度",
  kana: "たいど",
  type: "名词",
  meaning: "态度。",
  example: "$\\overset{りっぱ}{立派}$な$\\overset{たいど}{態度}$で$\\overset{めんせつ}{面接}$を$\\overset{う}{受}$ける。/以落落大方的态度参加面试。"
},
{
  word: "毛布",
  kana: "もうふ",
  type: "名词",
  meaning: "毛毯。",
  example: "$\\overset{さむ}{寒}$いので、$\\overset{もうふ}{毛布}$を$\\overset{だ}{出}$して$\\overset{じゅんび}{準備}$する。/因为冷，所以拿出毛毯准备好。"
},
{
  word: "立派",
  kana: "りっぱ",
  type: "形动",
  meaning: "出色，壮观；正派。",
  example: "$\\overset{かれ}{彼}$は$\\overset{りっぱ}{立派}$な$\\overset{おとな}{大人}$に$\\overset{せいちょう}{成長}$した。/他成长为了一个出色的大人。"
},
{
  word: "価値",
  kana: "かち",
  type: "名词",
  meaning: "价值。",
  example: "この$\\overset{はくぶつかん}{博物館}$の$\\overset{いさん}{遺産}$はとても$\\overset{かち}{価値}$がある。/这家博物馆的遗产非常有价值。"
},
{
  word: "住所",
  kana: "じゅうしょ",
  type: "名词",
  meaning: "住址。",
  example: "$\\overset{やくしょ}{役所}$に$\\overset{い}{行}$って$\\overset{じゅうしょ}{住所}$の$\\overset{へんこう}{変更}$をする。/去政府机关进行住址变更。"
},
{
  word: "程度",
  kana: "ていど",
  type: "名词",
  meaning: "程度。",
  example: "$\\overset{ひがい}{被害}$の$\\overset{ていど}{程度}$を$\\overset{よそう}{予想}$する。/预测受灾的程度。"
},
{
  word: "役所",
  kana: "やくしょ",
  type: "名词",
  meaning: "政府机关，办事处。",
  example: "$\\overset{やくしょ}{役所}$で$\\overset{こせき}{戸籍}$の$\\overset{てつづ}{手続}$きをする。/在政府机关办理户籍手续。"
},
{
  word: "量",
  kana: "りょう",
  type: "名词",
  meaning: "量，数量。",
  example: "$\\overset{ことし}{今年}$の$\\overset{のうさんぶつ}{農産物}$の$\\overset{しゅうかく}{収穫}$$\\overset{りょう}{量}$が$\\overset{じょうしょう}{上昇}$した。/今年农产品的收获量上升了。"
},
{
  word: "京劇",
  kana: "きょうげき",
  type: "名词",
  meaning: "京剧。",
  example: "$\\overset{ちゅうごく}{中国}$で$\\overset{きょうげき}{京劇}$の$\\overset{しゅうだん}{集団}$の$\\overset{えんぎ}{演技}$を$\\overset{み}{見}$る。/在中国观看京剧团体的表演。"
},
{
  word: "集団",
  kana: "しゅうだん",
  type: "名词",
  meaning: "集团，群体。",
  example: "$\\overset{しゅうだん}{集団}$で$\\overset{こうどう}{行動}$するときはルールを$\\overset{まも}{守}$る。/集体行动时要遵守规则。"
},
{
  word: "天気予報",
  kana: "てんきよほう",
  type: "名词",
  meaning: "天气预报。",
  example: "$\\overset{てんきよほう}{天気予報}$によると、$\\overset{あした}{明日}$は$\\overset{あめ}{雨}$が$\\overset{ふ}{降}$るそうだ。/根据天气预报，明天好像要下雨。"
},
{
  word: "輸出",
  kana: "ゆしゅつ",
  type: "名・サ变动词する他",
  meaning: "出口。",
  example: "$\\overset{じどうしゃ}{自動車}$の$\\overset{ゆしゅつ}{輸出}$が$\\overset{ふ}{増}$える。/汽车的出口增加。 || $\\overset{じこく}{自国}$の$\\overset{のうさんぶつ}{農産物}$を$\\overset{がいこく}{外国}$へ$\\overset{ゆしゅつ}{輸出}$する。/将本国的农产品出口到外国。"
},
{
  word: "零",
  kana: "れい",
  type: "名词",
  meaning: "零。",
  example: "$\\overset{おんどけい}{温度計}$が$\\overset{れい}{零}$$\\overset{ど}{度}$を$\\overset{さ}{指}$している。/温度计指着零度。"
},
{
  word: "近所",
  kana: "きんじょ",
  type: "名词",
  meaning: "附近，邻居。",
  example: "$\\overset{きんじょ}{近所}$のスーパーで$\\overset{ぎゅうにゅう}{牛乳}$を$\\overset{か}{買}$う。/在附近的超市买牛奶。"
},
{
  word: "収入",
  kana: "しゅうにゅう",
  type: "名词",
  meaning: "收入。",
  example: "$\\overset{まいつき}{毎月}$の$\\overset{しゅうにゅう}{収入}$で$\\overset{せいかつ}{生活}$の$\\overset{よさん}{予算}$を$\\overset{た}{立}$てる。/用每月的收入制定生活预算。"
},
{
  word: "突然",
  kana: "とつぜん",
  type: "名・形动・副词",
  meaning: "突然。",
  example: "$\\overset{とつぜん}{突然}$、$\\overset{あめ}{雨}$が$\\overset{ふ}{降}$り$\\overset{だ}{出}$した。/突然下起雨来了。 || $\\overset{とつぜん}{突然}$のニュースに$\\overset{おどろ}{驚}$いた。/对突然的新闻感到惊讶。"
},
{
  word: "輸入",
  kana: "ゆにゅう",
  type: "名・サ变动词する他",
  meaning: "进口。",
  example: "$\\overset{がいこく}{外国}$からの$\\overset{ゆにゅう}{輸入}$に$\\overset{たよ}{頼}$る。/依赖从外国的进口。 || $\\overset{おお}{多}$くの$\\overset{ぎゅうにく}{牛肉}$を$\\overset{ゆにゅう}{輸入}$している。/正在进口大量的牛肉。"
},
{
  word: "冷蔵庫",
  kana: "れいぞうこ",
  type: "名词",
  meaning: "冰箱。",
  example: "$\\overset{か}{買}$ってきた$\\overset{やさい}{野菜}$を$\\overset{れいぞうこ}{冷蔵庫}$に$\\overset{い}{入}$れる。/把买来的蔬菜放进冰箱。"
},
{
  word: "結果",
  kana: "けっか",
  type: "名词",
  meaning: "结果。",
  example: "$\\overset{しけん}{試験}$の$\\overset{けっか}{結果}$を$\\overset{せんせい}{先生}$に$\\overset{ほうこく}{報告}$する。/向老师报告考试的结果。"
},
{
  word: "準備",
  kana: "じゅんび",
  type: "名・サ变动词する他",
  meaning: "准备。",
  example: "$\\overset{りょこう}{旅行}$の$\\overset{じゅんび}{準備}$で$\\overset{いそが}{忙}$しい。/忙于旅行的准备。 || $\\overset{じゅぎょう}{授業}$の$\\overset{よしゅう}{予習}$を$\\overset{じゅんび}{準備}$する。/准备课前预习。"
},
{
  word: "配達",
  kana: "はいたつ",
  type: "名・サ变动词する他",
  meaning: "投递，送货。",
  example: "$\\overset{にもつ}{荷物}$の$\\overset{はいたつ}{配達}$を$\\overset{ま}{待}$つ。/等待包裹的投递。 || $\\overset{しんぶん}{新聞}$を$\\overset{きんじょ}{近所}$に$\\overset{はいたつ}{配達}$する。/给附近投递报纸。"
},
{
  word: "予算",
  kana: "よさん",
  type: "名・サ变动词",
  meaning: "预算。",
  example: "$\\overset{よさん}{予算}$の$\\overset{はんい}{範囲}$で$\\overset{か}{買}$い$\\overset{もの}{物}$をする。/在预算范围内购物。 || $\\overset{らいねん}{来年}$の$\\overset{けいひ}{経費}$を$\\overset{よさん}{予算}$する。/对明年的经费进行预算。"
},
{
  word: "原因",
  kana: "げんいん",
  type: "名・サ变动词",
  meaning: "原因。",
  example: "$\\overset{じこ}{事故}$の$\\overset{さいだい}{最大}$の$\\overset{げんいん}{原因}$を$\\overset{しら}{調}$べる。/调查事故的最大原因。 || $\\overset{こうがい}{公害}$に$\\overset{げんいん}{原因}$する$\\overset{びょうき}{病気}$。/起因于公害的疾病。"
},
{
  word: "植物",
  kana: "しょくぶつ",
  type: "名词",
  meaning: "植物。",
  example: "$\\overset{やま}{山}$で$\\overset{めずら}{珍}$しい$\\overset{しょくぶつ}{植物}$を$\\overset{はっけん}{発見}$した。/在山里发现了罕见的植物。"
},
{
  word: "服装",
  kana: "ふくそう",
  type: "名词",
  meaning: "服装，打扮。",
  example: "$\\overset{めんせつ}{面接}$の$\\overset{とき}{時}$は、きちんとした$\\overset{ふくそう}{服装}$で$\\overset{い}{行}$く。/面试的时候，要穿戴整齐地去。"
},
{
  word: "予習",
  kana: "よしゅう",
  type: "名・サ变动词する他",
  meaning: "预习。",
  example: "$\\overset{あした}{明日}$の$\\overset{じゅぎょう}{授業}$のために$\\overset{よしゅう}{予習}$が$\\overset{ひつよう}{必要}$だ。/为了明天的课，预习是必要的。 || $\\overset{えいご}{英語}$の$\\overset{きょうかしょ}{教科書}$を$\\overset{よしゅう}{予習}$する。/预习英语教科书。"
},
{
  word: "映画館",
  kana: "えいがかん",
  type: "名词",
  meaning: "电影院。",
  example: "$\\overset{しゅうまつ}{週末}$に$\\overset{ともだち}{友達}$と$\\overset{えいがかん}{映画館}$へ$\\overset{い}{行}$った。/周末和朋友去了电影院。"
},
{
  word: "牛肉",
  kana: "ぎゅうにく",
  type: "名词",
  meaning: "牛肉。",
  example: "$\\overset{こんや}{今夜}$の$\\overset{ばん}{晩}$ごはんは$\\overset{ぎゅうにく}{牛肉}$です。/今晚的晚饭是牛肉。"
},
{
  word: "作物",
  kana: "さくもつ",
  type: "名词",
  meaning: "农作物。",
  example: "$\\overset{はたけ}{畑}$で$\\overset{さまざま}{様々}$な$\\overset{さくもつ}{作物}$を$\\overset{そだ}{育}$てる。/在田里种植各种各样的农作物。"
},
{
  word: "農産物",
  kana: "のうさんぶつ",
  type: "名词",
  meaning: "农产品。",
  example: "この$\\overset{けん}{県}$は$\\overset{のうさんぶつ}{農産物}$の$\\overset{しゅうかく}{収穫}$が$\\overset{おお}{多}$い。/这个县农产品的收获量很大。"
},
{
  word: "名所旧跡",
  kana: "めいしょきゅうせき",
  type: "名词",
  meaning: "名胜古迹。",
  example: "$\\overset{ぜんこく}{全国}$の$\\overset{めいしょきゅうせき}{名所旧跡}$を$\\overset{かんこう}{観光}$する。/观光全国的名胜古迹。"
},
{
  word: "海産物",
  kana: "かいさんぶつ",
  type: "名词",
  meaning: "海产品。",
  example: "$\\overset{しんせん}{新鮮}$な$\\overset{かいさんぶつ}{海産物}$を$\\overset{いちば}{市場}$で$\\overset{か}{買}$う。/在市场买新鲜的海产品。"
},
{
  word: "県",
  kana: "けん",
  type: "名词",
  meaning: "县（日本行政区划，相当于中国的省）。",
  example: "この$\\overset{けん}{県}$の$\\overset{じもと}{地元}$の$\\overset{りょうり}{料理}$は$\\overset{おい}{美味}$しい。/这个县的当地美食很好吃。"
},
{
  word: "請求",
  kana: "せいきゅう",
  type: "名・サ变动词する他",
  meaning: "请求，索要，索款。",
  example: "お$\\overset{かね}{金}$の$\\overset{せいきゅう}{請求}$が$\\overset{き}{来}$た。/付款通知单（索款）来了。 || $\\overset{かいしゃ}{会社}$に$\\overset{しゅっちょう}{出張}$の$\\overset{けいひ}{経費}$を$\\overset{せいきゅう}{請求}$する。/向公司报销（索要）出差的经费。"
},
{
  word: "博物館",
  kana: "はくぶつかん",
  type: "名词",
  meaning: "博物馆。",
  example: "$\\overset{やす}{休}$みの$\\overset{ひ}{日}$に$\\overset{はくぶつかん}{博物館}$を$\\overset{けんぶつ}{見物}$する。/休息日去参观博物馆。"
},
{
  word: "滅多に",
  kana: "めったに",
  type: "副词",
  meaning: "很少，不常（后接否定）。",
  example: "$\\overset{かれ}{彼}$は$\\overset{めった}{滅多}$に$\\overset{がいしゅつ}{外出}$しない。/他很少出门。"
},
{
  word: "外出",
  kana: "がいしゅつ",
  type: "名・サ变动词する自",
  meaning: "外出，出门。",
  example: "$\\overset{てんき}{天気}$が$\\overset{わる}{悪}$いので$\\overset{がいしゅつ}{外出}$を$\\overset{ひか}{控}$える。/因为天气不好，所以控制外出。 || $\\overset{はは}{母}$は$\\overset{いま}{今}$$\\overset{がいしゅつ}{外出}$しています。/妈妈现在出门了。"
},
{
  word: "公害",
  kana: "こうがい",
  type: "名词",
  meaning: "公害，环境污染。",
  example: "$\\overset{こうじょう}{工場}$の$\\overset{こうがい}{公害}$$\\overset{もんだい}{問題}$に$\\overset{ちゅうもく}{注目}$する。/关注工厂的环境污染问题。"
},
{
  word: "全国",
  kana: "ぜんこく",
  type: "名词",
  meaning: "全国。",
  example: "この$\\overset{てんきよほう}{天気予報}$は$\\overset{ぜんこく}{全国}$に$\\overset{ほうそう}{放送}$される。/这个天气预报在全国播出。"
},
{
  word: "万里の長城",
  kana: "ばんりのちょうじょう",
  type: "名词",
  meaning: "万里长城。",
  example: "$\\overset{ちゅうごく}{中国}$の$\\overset{ばんり}{万里}$の$\\overset{ちょうじょう}{長城}$は$\\overset{さいだい}{最大}$の$\\overset{いせき}{遺跡}$だ。/中国的万里长城是最大的遗迹。"
},
{
  word: "予報",
  kana: "よほう",
  type: "名・サ变动词する他",
  meaning: "预报。",
  example: "$\\overset{てんき}{天気}$の$\\overset{よほう}{予報}$が$\\overset{あ}{当}$たった。/天气预报说中了。 || $\\overset{あした}{明日}$の$\\overset{きおん}{気温}$の$\\overset{じょうしょう}{上昇}$を$\\overset{よほう}{予報}$する。/预报明天会升温。"
},
{
  word: "外来語",
  kana: "がいらいご",
  type: "名词",
  meaning: "外来语。",
  example: "$\\overset{にほんご}{日本語}$には$\\overset{えいご}{英語}$からの$\\overset{がいらいご}{外来語}$が$\\overset{おお}{多}$い。/日语里有很多来自英语的外来语。"
},
{
  word: "国語",
  kana: "こくご",
  type: "名词",
  meaning: "国语，语文。",
  example: "$\\overset{こくご}{国語}$の$\\overset{じゅぎょう}{授業}$で$\\overset{だいめいし}{代名詞}$を$\\overset{べんきょう}{勉強}$する。/在语文课上学习代词。"
},
{
  word: "祖国",
  kana: "そこく",
  type: "名词",
  meaning: "祖国。",
  example: "$\\overset{がいこく}{外国}$で$\\overset{せいかつ}{生活}$しながら、$\\overset{そこく}{祖国}$を$\\overset{おも}{思}$う。/一边在外国生活，一边思念祖国。"
},
{
  word: "物価",
  kana: "ぶっか",
  type: "名词",
  meaning: "物价。",
  example: "$\\overset{えんやす}{円安}$の$\\overset{えいきょう}{影響}$で、$\\overset{ぶっか}{物価}$が$\\overset{じょうしょう}{上昇}$している。/受日元贬值的影响，物价正在上涨。"
},
{
  word: "予約",
  kana: "よやく",
  type: "名・サ变动词する他",
  meaning: "预约，预订。",
  example: "ホテルに$\\overset{よやく}{予約}$の$\\overset{でんわ}{電話}$を$\\overset{い}{入}$れる。/给酒店打预约电话。 || $\\overset{しんかんせん}{新幹線}$の$\\overset{せき}{席}$を$\\overset{よやく}{予約}$する。/预订新干线的座位。"
},
{
  word: "観光",
  kana: "かんこう",
  type: "名・サ变动词",
  meaning: "观光，旅游。",
  example: "$\\overset{きょうと}{京都}$で$\\overset{かんこう}{観光}$を$\\overset{たの}{楽}$しむ。/在京都享受观光的乐趣。 || $\\overset{ばんり}{万里}$の$\\overset{ちょうじょう}{長城}$を$\\overset{かんこう}{観光}$する$\\overset{よてい}{予定}$だ。/打算去观光万里长城。"
},
{
  word: "国土",
  kana: "こくど",
  type: "名词",
  meaning: "国土。",
  example: "$\\overset{にほん}{日本}$の$\\overset{こくど}{国土}$の$\\overset{めんせき}{面積}$は$\\overset{なん}{何}$$\\overset{へいほう}{平方}$キロメートルですか。/日本的国土面积是多少平方公里？"
},
{
  word: "停留所",
  kana: "ていりゅうじょ",
  type: "名词",
  meaning: "车站，停靠站（多指公交车站）。",
  example: "バスの$\\overset{ていりゅうじょ}{停留所}$でバスを$\\overset{ま}{待}$つ。/在公交车站等公交车。"
},
{
  word: "放送",
  kana: "ほうそう",
  type: "名・サ变动词する他",
  meaning: "广播，播送。",
  example: "テレビの$\\overset{ほうそう}{放送}$を$\\overset{み}{見}$る。/看电视广播。 || $\\overset{だいしんさい}{大震災}$のニュースを$\\overset{ほうそう}{放送}$する。/播出关于大地震的新闻。"
},
{
  word: "寮",
  kana: "りょう",
  type: "名词",
  meaning: "宿舍。",
  example: "$\\overset{だいがく}{大学}$の$\\overset{りょう}{寮}$で$\\overset{ともだち}{友達}$と$\\overset{いっしょ}{一緒}$に$\\overset{せいかつ}{生活}$する。/在大学宿舍和朋友一起生活。"
},
{
  word: "円安",
  kana: "えんやす",
  type: "名词",
  meaning: "日元贬值。",
  example: "$\\overset{えんやす}{円安}$が$\\overset{ゆしゅつ}{輸出}$に$\\overset{ゆうり}{有利}$な$\\overset{けっか}{結果}$をもたらす。/日元贬值给出口带来了有利的结果。"
},
{
  word: "戸籍",
  kana: "こせき",
  type: "名词",
  meaning: "户籍。",
  example: "$\\overset{やくしょ}{役所}$で$\\overset{こせき}{戸籍}$の$\\overset{しょるい}{書類}$を$\\overset{しんせい}{申請}$する。/在政府机关申请户籍资料。"
},
{
  word: "収穫",
  kana: "しゅうかく",
  type: "名・サ变动词する他",
  meaning: "收获。",
  example: "$\\overset{ことし}{今年}$の$\\overset{さくもつ}{作物}$の$\\overset{しゅうかく}{収穫}$は$\\overset{よ}{良}$かった。/今年农作物的收获很好。 || $\\overset{はたけ}{畑}$で$\\overset{やさい}{野菜}$を$\\overset{しゅうかく}{収穫}$する。/在田里收获蔬菜。"
},
{
  word: "代名詞",
  kana: "だいめいし",
  type: "名词",
  meaning: "代词；代名词。",
  example: "$\\overset{こくご}{国語}$の$\\overset{ぶんぽう}{文法}$で$\\overset{だいめいし}{代名詞}$を$\\overset{まな}{学}$ぶ。/在语文语法里学习代词。"
},
{
  word: "平方",
  kana: "へいほう",
  type: "名词",
  meaning: "平方。",
  example: "この$\\overset{へや}{部屋}$の$\\overset{ひろ}{広}$さは$\\overset{にじゅう}{二十}$$\\overset{へいほう}{平方}$メートルだ。/这个房间的大小是二十平方米。"
},
{
  word: "温度計",
  kana: "おんどけい",
  type: "名词",
  meaning: "温度计。",
  example: "$\\overset{おんどけい}{温度計}$の$\\overset{ど}{度}$が$\\overset{あ}{上}$がっている。/温度计的度数正在上升。"
},
{
  word: "最大",
  kana: "さいだい",
  type: "名词",
  meaning: "最大。",
  example: "これが$\\overset{ことし}{今年}$$\\overset{さいだい}{最大}$のニュースとして$\\overset{ほう}{報}$じられた。/这作为今年最大的新闻被报道了。"
},
{
  word: "上昇",
  kana: "じょうしょう",
  type: "名・サ变动词する自",
  meaning: "上升，上涨。",
  example: "$\\overset{ぶっか}{物価}$の$\\overset{じょうしょう}{上昇}$が$\\overset{こくみん}{国民}$の$\\overset{せいかつ}{生活}$に$\\overset{えいきょう}{影響}$する。/物价的上涨影响了国民的生活。 || $\\overset{きおん}{気温}$が$\\overset{きゅう}{急}$に$\\overset{じょうしょう}{上昇}$する。/气温突然上升。"
},
{
  word: "注目",
  kana: "ちゅうもく",
  type: "名・サ变动词する自他",
  meaning: "注目，关注。",
  example: "$\\overset{かんきょう}{環境}$$\\overset{もんだい}{問題}$への$\\overset{ちゅうもく}{注目}$が$\\overset{あつ}{集}$まっている。/对环境问题的关注正在聚集。 || $\\overset{あたら}{新}$しい$\\overset{せいど}{制度}$の$\\overset{こうちく}{構築}$に$\\overset{ちゅうもく}{注目}$する。/关注新制度的构建。"
},
{
  word: "報じる",
  kana: "ほうじる",
  type: "一段动词他",
  meaning: "报道，报导。",
  example: "テレビが$\\overset{じもと}{地元}$の$\\overset{だいしんさい}{大震災}$のニュースを$\\overset{ほう}{報}$じる。/电视报道了当地大地震的新闻。"
},
{
  word: "構築",
  kana: "こうちく",
  type: "名・サ变动词する他",
  meaning: "构建，建立。",
  example: "$\\overset{よ}{良}$い$\\overset{にんげん}{人間}$$\\overset{かんけい}{関係}$の$\\overset{こうちく}{構築}$が$\\overset{たいせつ}{大切}$だ。/建立良好的人际关系很重要。 || $\\overset{へいわ}{平和}$な$\\overset{しゃかい}{社会}$を$\\overset{こうちく}{構築}$する。/构建和平的社会。"
},
{
  word: "地元",
  kana: "じもと",
  type: "名词",
  meaning: "当地，本地。",
  example: "$\\overset{じもと}{地元}$の$\\overset{のうさんぶつ}{農産物}$をたくさん$\\overset{か}{買}$う。/买了很多当地的农产品。"
},
{
  word: "大震災",
  kana: "だいしんさい",
  type: "名词",
  meaning: "大地震。",
  example: "$\\overset{だいしんさい}{大震災}$の$\\overset{ひがい}{被害}$を$\\overset{わす}{忘}$れないで、$\\overset{よぼう}{予防}$に$\\overset{つと}{努}$める。/不要忘记大地震的灾害，努力做好预防。"
},
{
  word: "度",
  kana: "ど",
  type: "名词・后缀",
  meaning: "次数，度数；程度。",
  example: "$\\overset{おんどけい}{温度計}$が$\\overset{さんじゅう}{三十}$$\\overset{ど}{度}$を$\\overset{こ}{超}$えた。/温度计超过了三十度。"
},
{
  word: "切手",
  kana: "きって",
  type: "名词",
  meaning: "邮票。",
  example: "$\\overset{こうばん}{交番}$の$\\overset{となり}{隣}$の$\\overset{ゆうびんきょく}{郵便局}$で$\\overset{きって}{切手}$を$\\overset{か}{買}$う。/在派出所旁边的邮局买邮票。"
},
{
  word: "教室",
  kana: "きょうしつ",
  type: "名词",
  meaning: "教室。",
  example: "$\\overset{ごご}{午後}$、$\\overset{きょうしつ}{教室}$で$\\overset{こうはい}{後輩}$と$\\overset{いっしょ}{一緒}$に$\\overset{べんきょう}{勉強}$する。/下午，在教室里和后辈一起学习。"
},
{
  word: "後輩",
  kana: "こうはい",
  type: "名词",
  meaning: "后辈，学弟学妹。",
  example: "$\\overset{ごぜん}{午前}$$\\overset{ちゅう}{中}$に$\\overset{こうはい}{後輩}$に$\\overset{ざっし}{雑誌}$を$\\overset{か}{貸}$した。/上午把杂志借给了后辈。"
},
{
  word: "交番",
  kana: "こうばん",
  type: "名词",
  meaning: "派出所。",
  example: "$\\overset{みち}{道}$に$\\overset{まよ}{迷}$ったので、$\\overset{こうばん}{交番}$で$\\overset{き}{聞}$いてみる。/因为迷路了，所以去派出所问问。"
},
{
  word: "午後",
  kana: "ごご",
  type: "名词",
  meaning: "下午。",
  example: "$\\overset{ごご}{午後}$から$\\overset{びょういん}{病院}$へ$\\overset{い}{行}$く$\\overset{よてい}{予定}$だ。/打算下午去医院。"
},
{
  word: "午前",
  kana: "ごぜん",
  type: "名词",
  meaning: "上午。",
  example: "$\\overset{ごぜん}{午前}$の$\\overset{じゅぎょう}{授業}$は$\\overset{ぜんぶ}{全部}$$\\overset{お}{終}$わった。/上午的课全部结束了。"
},
{
  word: "ご馳走",
  kana: "ごちそう",
  type: "名・サ变动词",
  meaning: "款待，好吃的饭菜。",
  example: "$\\overset{はは}{母}$の$\\overset{てづく}{手作}$りのご$\\overset{ちそう}{馳走}$を$\\overset{た}{食}$べる。/吃妈妈亲手做的美味佳肴。 || $\\overset{せんぱい}{先輩}$に$\\overset{ばん}{晩}$ごはんをご$\\overset{ちそう}{馳走}$してもらった。/前辈请我吃了晚饭。"
},
{
  word: "雑誌",
  kana: "ざっし",
  type: "名词",
  meaning: "杂志。",
  example: "$\\overset{としょ}{図書}$$\\overset{かん}{館}$で$\\overset{れきし}{歴史}$の$\\overset{ざっし}{雑誌}$を$\\overset{よ}{読}$む。/在图书馆读历史杂志。"
},
{
  word: "砂糖",
  kana: "さとう",
  type: "名词",
  meaning: "糖，白糖。",
  example: "コーヒーに$\\overset{さとう}{砂糖}$を$\\overset{ぜんぶ}{全部}$$\\overset{い}{入}$れる。/把糖全部放进咖啡里。"
},
{
  word: "失礼",
  kana: "しつれい",
  type: "名・形动・サ变动词する自",
  meaning: "失礼，没礼貌；告辞。",
  example: "$\\overset{せんぱい}{先輩}$に$\\overset{たい}{対}$して$\\overset{しつれい}{失礼}$があってはならない。/对前辈绝不能有失礼之处。 || そんなことを$\\overset{い}{言}$うのは$\\overset{しつれい}{失礼}$だ。/说那种话很没礼貌。 || お$\\overset{さき}{先}$に$\\overset{しつれい}{失礼}$します。/我先告辞了。"
},
{
  word: "小学校",
  kana: "しょうがっこう",
  type: "名词",
  meaning: "小学。",
  example: "$\\overset{しょうがっこう}{小学校}$から$\\overset{ちゅうがっこう}{中学校}$まで$\\overset{おな}{同}$じ$\\overset{たんにん}{担任}$だった。/从小学到初中都是同一个班主任。"
},
{
  word: "信号",
  kana: "しんごう",
  type: "名词",
  meaning: "红绿灯，信号。",
  example: "$\\overset{こうさてん}{交差点}$の$\\overset{しんごう}{信号}$が$\\overset{あか}{赤}$に$\\overset{か}{変}$わった。/十字路口的红绿灯变红了。"
},
{
  word: "全部",
  kana: "ぜんぶ",
  type: "名・副词",
  meaning: "全部。",
  example: "$\\overset{しゅくだい}{宿題}$の$\\overset{ぜんぶ}{全部}$を$\\overset{お}{終}$わらせた。/完成了全部的作业。 || $\\overset{としょ}{図書}$$\\overset{かん}{館}$の$\\overset{ほん}{本}$を$\\overset{ぜんぶ}{全部}$$\\overset{よ}{読}$みたい。/想把图书馆的书全部读完。"
},
{
  word: "担任",
  kana: "たんにん",
  type: "名・サ变动词",
  meaning: "班主任，担任。",
  example: "$\\overset{ことし}{今年}$の$\\overset{たんにん}{担任}$の$\\overset{せんせい}{先生}$は$\\overset{やさ}{優}$しい。/今年的班主任老师很温柔。 || $\\overset{あたら}{新}$しいクラスを$\\overset{たんにん}{担任}$する。/担任新班级的班主任。"
},
{
  word: "中学校",
  kana: "ちゅうがっこう",
  type: "名词",
  meaning: "初中。",
  example: "$\\overset{ちゅうがっこう}{中学校}$の$\\overset{れきし}{歴史}$の$\\overset{べんきょう}{勉強}$は$\\overset{おも}{面}$$\\overset{しろ}{白}$い。/初中的历史学习很有趣。"
},
{
  word: "図書",
  kana: "としょ",
  type: "名词",
  meaning: "图书。",
  example: "$\\overset{むりょう}{無料}$で$\\overset{としょ}{図書}$を$\\overset{か}{借}$りて$\\overset{べんきょう}{勉強}$する。/免费借阅图书来学习。"
},
{
  word: "病院",
  kana: "びょういん",
  type: "名词",
  meaning: "医院。",
  example: "$\\overset{こうつう}{交通}$が$\\overset{ふべん}{不便}$な$\\overset{ばしょ}{場所}$に$\\overset{びょういん}{病院}$がある。/医院在交通不便的地方。"
},
{
  word: "表情",
  kana: "ひょうじょう",
  type: "名词",
  meaning: "表情。",
  example: "$\\overset{かれ}{彼}$の$\\overset{あか}{明}$るい$\\overset{ひょうじょう}{表情}$を$\\overset{み}{見}$て$\\overset{あんしん}{安心}$した。/看到他开朗的表情就放心了。"
},
{
  word: "不便",
  kana: "ふべん",
  type: "名・形动",
  meaning: "不方便。",
  example: "$\\overset{せいかつ}{生活}$の$\\overset{ふべん}{不便}$を$\\overset{かん}{感}$じる。/感受到生活的不便。 || ここから$\\overset{がっこう}{学校}$へ$\\overset{かよ}{通}$うのは$\\overset{ふべん}{不便}$だ。/从这里上学很不方便。"
},
{
  word: "勉強",
  kana: "べんきょう",
  type: "名・サ变动词する自他",
  meaning: "学习。",
  example: "$\\overset{まいにち}{毎日}$の$\\overset{べんきょう}{勉強}$が$\\overset{たいせつ}{大切}$だ。/每天的学习很重要。 || $\\overset{れきし}{歴史}$と$\\overset{きょういく}{教育}$について$\\overset{べんきょう}{勉強}$する。/学习关于历史和教育的知识。"
},
{
  word: "便利",
  kana: "べんり",
  type: "名・形动",
  meaning: "方便。",
  example: "$\\overset{どうぐ}{道具}$の$\\overset{べんり}{便利}$さに$\\overset{おどろ}{驚}$く。/对工具的便利性感到惊讶。 || この$\\overset{でんし}{電子}$$\\overset{じしょ}{辞書}$はとても$\\overset{べんり}{便利}$だ。/这本电子词典非常方便。"
},
{
  word: "無料",
  kana: "むりょう",
  type: "名词",
  meaning: "免费。",
  example: "この$\\overset{びじゅつかん}{美術館}$は$\\overset{がくせい}{学生}$なら$\\overset{むりょう}{無料}$で$\\overset{はい}{入}$れる。/这家美术馆学生可以免费进入。"
},
{
  word: "有料",
  kana: "ゆうりょう",
  type: "名词",
  meaning: "收费。",
  example: "$\\overset{ゆうりょう}{有料}$の$\\overset{どうろ}{道路}$を$\\overset{とお}{通}$って$\\overset{いそ}{急}$ぐ。/穿过收费道路赶路。"
},
{
  word: "歴史",
  kana: "れきし",
  type: "名词",
  meaning: "历史。",
  example: "$\\overset{ふる}{古}$い$\\overset{れきし}{歴史}$を$\\overset{も}{持}$つ$\\overset{がっこう}{学校}$で$\\overset{きょういく}{教育}$を$\\overset{う}{受}$ける。/在拥有悠久历史的学校接受教育。"
},
{
  word: "廊下",
  kana: "ろうか",
  type: "名词",
  meaning: "走廊。",
  example: "$\\overset{ろうか}{廊下}$を$\\overset{はし}{走}$らないでください。/请不要在走廊上奔跑。"
},
{
  word: "楽器",
  kana: "がっき",
  type: "名词",
  meaning: "乐器。",
  example: "$\\overset{きょうしつ}{教室}$で$\\overset{がっき}{楽器}$を$\\overset{れんしゅう}{練習}$した$\\overset{きおく}{記憶}$がある。/有在教室里练习乐器的记忆。"
},
{
  word: "記憶",
  kana: "きおく",
  type: "名・サ变动词する他",
  meaning: "记忆。",
  example: "$\\overset{こ}{子}$どもの$\\overset{ころ}{頃}$の$\\overset{きおく}{記憶}$が$\\overset{よみがえ}{蘇}$る。/儿时的记忆复苏了。 || $\\overset{きょうかしょ}{教科書}$の$\\overset{ないよう}{内容}$を$\\overset{せいかく}{正確}$に$\\overset{きおく}{記憶}$する。/准确地记住教科书的内容。"
},
{
  word: "給料",
  kana: "きゅうりょう",
  type: "名词",
  meaning: "工资。",
  example: "$\\overset{きゅうりょう}{給料}$をもらって、$\\overset{きょうよう}{教養}$の$\\overset{ほん}{本}$を$\\overset{か}{買}$う。/领了工资，买关于修养的书。"
},
{
  word: "教育",
  kana: "きょういく",
  type: "名・サ变动词する他",
  meaning: "教育。",
  example: "$\\overset{こ}{子}$どもの$\\overset{きょういく}{教育}$に$\\overset{ちから}{力}$を$\\overset{い}{入}$れる。/在孩子的教育上倾注力量。 || $\\overset{がっこう}{学校}$で$\\overset{りっぱ}{立派}$な$\\overset{こくみん}{国民}$を$\\overset{きょういく}{教育}$する。/在学校教育出优秀的国民。"
},
{
  word: "教科書",
  kana: "きょうかしょ",
  type: "名词",
  meaning: "教科书。",
  example: "$\\overset{ずひょう}{図表}$が$\\overset{おお}{多}$い$\\overset{きょうかしょ}{教科書}$で$\\overset{べんきょう}{勉強}$する。/用图表很多的教科书学习。"
},
{
  word: "教養",
  kana: "きょうよう",
  type: "名词",
  meaning: "修养，教养。",
  example: "$\\overset{さどう}{茶道}$や$\\overset{しょどう}{書道}$を$\\overset{とお}{通}$じて$\\overset{きょうよう}{教養}$を$\\overset{み}{身}$につける。/通过茶道和书法来培养修养。"
},
{
  word: "原料",
  kana: "げんりょう",
  type: "名词",
  meaning: "原料。",
  example: "$\\overset{せきゆ}{石油}$は$\\overset{さまざま}{様々}$な$\\overset{せいひん}{製品}$の$\\overset{げんりょう}{原料}$になる。/石油是各种产品的原料。"
},
{
  word: "後悔",
  kana: "こうかい",
  type: "名・サ变动词する自他",
  meaning: "后悔。",
  example: "$\\overset{こうかい}{後悔}$の$\\overset{な}{無}$いように$\\overset{さいご}{最後}$まで$\\overset{がんば}{頑張}$る。/为了不留遗憾（后悔），努力到最后。 || あの$\\overset{とき}{時}$、$\\overset{べんきょう}{勉強}$しなかったことを$\\overset{こうかい}{後悔}$している。/正在后悔那时没有学习。"
},
{
  word: "交差点",
  kana: "こうさてん",
  type: "名词",
  meaning: "十字路口。",
  example: "$\\overset{こうさてん}{交差点}$で$\\overset{こうつう}{交通}$$\\overset{じこ}{事故}$が$\\overset{お}{起}$きた。/十字路口发生了交通事故。"
},
{
  word: "交通",
  kana: "こうつう",
  type: "名词",
  meaning: "交通。",
  example: "ここから$\\overset{じゅく}{塾}$までは$\\overset{こうつう}{交通}$が$\\overset{べんり}{便利}$だ。/从这里到补习班交通很方便。"
},
{
  word: "交流",
  kana: "こうりゅう",
  type: "名・サ变动词する自",
  meaning: "交流。",
  example: "$\\overset{がいこく}{外国}$の$\\overset{ひと}{人}$と$\\overset{ぶんか}{文化}$の$\\overset{こうりゅう}{交流}$をする。/和外国人进行文化交流。 || $\\overset{こうりゅうかい}{交流会}$で$\\overset{いけん}{意見}$を$\\overset{こうりゅう}{交流}$する。/在交流会上交流意见。"
},
{
  word: "最後",
  kana: "さいご",
  type: "名词",
  meaning: "最后。",
  example: "$\\overset{さいご}{最後}$の$\\overset{ざいりょう}{材料}$を$\\overset{なべ}{鍋}$に$\\overset{い}{入}$れる。/把最后的材料放进锅里。"
},
{
  word: "材料",
  kana: "ざいりょう",
  type: "名词",
  meaning: "材料。",
  example: "$\\overset{しんせん}{新鮮}$な$\\overset{ざいりょう}{材料}$と$\\overset{しょうゆ}{醤油}$で$\\overset{りょうり}{料理}$を$\\overset{つく}{作}$る。/用新鲜的材料和酱油做菜。"
},
{
  word: "茶道",
  kana: "さどう",
  type: "名词",
  meaning: "茶道。",
  example: "$\\overset{さどう}{茶道}$は$\\overset{にほん}{日本}$$\\overset{ぶんか}{文化}$の$\\overset{しょうちょう}{象徴}$の一つだ。/茶道是日本文化的象征之一。"
},
{
  word: "塾",
  kana: "じゅく",
  type: "名词",
  meaning: "私塾，补习班。",
  example: "$\\overset{ほうかご}{放課後}$、$\\overset{じゅく}{塾}$へ$\\overset{い}{行}$って$\\overset{べんきょう}{勉強}$する。/放学后去补习班学习。"
},
{
  word: "象徴",
  kana: "しょうちょう",
  type: "名・サ变动词",
  meaning: "象征。",
  example: "$\\overset{へいわ}{平和}$の$\\overset{しょうちょう}{象徴}$である$\\overset{はと}{鳩}$。/作为和平象征的鸽子。 || $\\overset{ふじさん}{富士山}$は$\\overset{にほん}{日本}$を$\\overset{しょうちょう}{象徴}$する$\\overset{やま}{山}$だ。/富士山是象征日本的山。"
},
{
  word: "醤油",
  kana: "しょうゆ",
  type: "名词",
  meaning: "酱油。",
  example: "$\\overset{ちょうみりょう}{調味料}$として$\\overset{しょうゆ}{醤油}$を$\\overset{つか}{使}$う。/使用酱油作为调味料。"
},
{
  word: "書道",
  kana: "しょどう",
  type: "名词",
  meaning: "书法。",
  example: "$\\overset{びじゅつ}{美術}$の$\\overset{じゅぎょう}{授業}$で$\\overset{しょどう}{書道}$の$\\overset{どうぐ}{道具}$を$\\overset{つか}{使}$う。/在美术课上使用书法的工具。"
},
{
  word: "信じる",
  kana: "しんじる",
  type: "一段动词他",
  meaning: "相信。",
  example: "$\\overset{かれ}{彼}$の$\\overset{せいかく}{正確}$な$\\overset{はんだん}{判断}$を$\\overset{しん}{信}$じる。/相信他准确的判断。"
},
{
  word: "水道",
  kana: "すいどう",
  type: "名词",
  meaning: "自来水，自来水管道。",
  example: "$\\overset{すいどう}{水道}$の$\\overset{りょうきん}{料金}$を$\\overset{ゆうびんきょく}{郵便局}$で$\\overset{はら}{払}$う。/在邮局交自来水费。"
},
{
  word: "図表",
  kana: "ずひょう",
  type: "名词",
  meaning: "图表。",
  example: "$\\overset{きょうかしょ}{教科書}$の$\\overset{ずひょう}{図表}$を$\\overset{み}{見}$て$\\overset{せいかく}{正確}$に$\\overset{こた}{答}$える。/看教科书的图表准确作答。"
},
{
  word: "正確",
  kana: "せいかく",
  type: "名・形动",
  meaning: "准确，正确。",
  example: "$\\overset{じかん}{時間}$の$\\overset{せいかく}{正確}$さが$\\overset{もと}{求}$められる。/要求时间的准确性。 || $\\overset{せいかく}{正確}$な$\\overset{ほうどう}{報道}$を$\\overset{おこな}{行}$う。/进行准确的报道。"
},
{
  word: "石油",
  kana: "せきゆ",
  type: "名词",
  meaning: "石油。",
  example: "$\\overset{せきゆ}{石油}$などの$\\overset{ねんりょう}{燃料}$の$\\overset{かかく}{価格}$が$\\overset{あ}{上}$がる。/石油等燃料的价格上涨。"
},
{
  word: "選挙",
  kana: "せんきょ",
  type: "名・サ变动词する他",
  meaning: "选举。",
  example: "$\\overset{あした}{明日}$、$\\overset{だいひょう}{代表}$の$\\overset{せんきょ}{選挙}$が$\\overset{おこな}{行}$われる。/明天举行代表的选举。 || $\\overset{あたら}{新}$しい$\\overset{しちょう}{市長}$を$\\overset{せんきょ}{選挙}$する。/选举新的市长。"
},
{
  word: "選手",
  kana: "せんしゅ",
  type: "名词",
  meaning: "选手，运动员。",
  example: "あの$\\overset{せんしゅ}{選手}$は$\\overset{しあい}{試合}$で$\\overset{みごと}{見事}$に$\\overset{ゆうしょう}{優勝}$した。/那名选手在比赛中漂亮地夺冠了。"
},
{
  word: "戦争",
  kana: "せんそう",
  type: "名・サ变动词する自",
  meaning: "战争。",
  example: "$\\overset{せんご}{戦後}$、$\\overset{せんそう}{戦争}$の$\\overset{ひさん}{悲惨}$さを$\\overset{つた}{伝}$える。/战后传达战争的悲惨。 || $\\overset{くに}{国}$$\\overset{どうし}{同士}$が$\\overset{せんそう}{戦争}$する。/国家之间发生战争。"
},
{
  word: "代表",
  kana: "だいひょう",
  type: "名・サ变动词する他",
  meaning: "代表。",
  example: "クラスの$\\overset{だいひょう}{代表}$として$\\overset{はつげん}{発言}$する。/作为班级代表发言。 || $\\overset{かれ}{彼}$は$\\overset{にほん}{日本}$を$\\overset{だいひょう}{代表}$する$\\overset{せんしゅ}{選手}$だ。/他是代表日本的选手。"
},
{
  word: "道具",
  kana: "どうぐ",
  type: "名词",
  meaning: "工具，道具。",
  example: "$\\overset{びじゅつ}{美術}$の$\\overset{ひょうげん}{表現}$のために$\\overset{どうぐ}{道具}$を$\\overset{じゅんび}{準備}$する。/为了美术的表达而准备工具。"
},
{
  word: "道路",
  kana: "どうろ",
  type: "名词",
  meaning: "道路。",
  example: "$\\overset{どうろ}{道路}$の$\\overset{ひだりがわ}{左側}$を$\\overset{つうこう}{通行}$する。/在道路左侧通行。"
},
{
  word: "燃料",
  kana: "ねんりょう",
  type: "名词",
  meaning: "燃料。",
  example: "$\\overset{せきゆ}{石油}$は$\\overset{じどうしゃ}{自動車}$の$\\overset{ねんりょう}{燃料}$として$\\overset{つか}{使}$われる。/石油被用作汽车的燃料。"
},
{
  word: "派手",
  kana: "はで",
  type: "名・形动",
  meaning: "华丽，显眼，花哨。",
  example: "$\\overset{はで}{派手}$を$\\overset{この}{好}$む$\\overset{わかもの}{若者}$たち。/喜欢花哨的年轻人们。 || $\\overset{ひょうめん}{表面}$は$\\overset{はで}{派手}$だが、$\\overset{なかみ}{中身}$はない。/表面华丽，但没有内涵。"
},
{
  word: "判断",
  kana: "はんだん",
  type: "名・サ变动词する他",
  meaning: "判断。",
  example: "$\\overset{かれ}{彼}$の$\\overset{てきかく}{的確}$な$\\overset{はんだん}{判断}$に$\\overset{たす}{助}$けられた。/多亏了他准确的判断。 || $\\overset{じょうきょう}{状況}$を$\\overset{み}{見}$て$\\overset{じぶん}{自分}$で$\\overset{はんだん}{判断}$する。/看情况自己做出判断。"
},
{
  word: "美術",
  kana: "びじゅつ",
  type: "名词",
  meaning: "美术。",
  example: "$\\overset{びじゅつ}{美術}$$\\overset{かん}{館}$を$\\overset{ほうもん}{訪問}$して$\\overset{さくひん}{作品}$を$\\overset{み}{見}$る。/访问美术馆看作品。"
},
{
  word: "表現",
  kana: "ひょうげん",
  type: "名・サ变动词する他",
  meaning: "表达，表现。",
  example: "$\\overset{ゆた}{豊}$かな$\\overset{ひょうげん}{表現}$$\\overset{りょく}{力}$を$\\overset{も}{持}$つ。/拥有丰富的表现力。 || $\\overset{じぶん}{自分}$の$\\overset{かんじょう}{感情}$を$\\overset{すなお}{素直}$に$\\overset{ひょうげん}{表現}$する。/坦率地表达自己的感情。"
},
{
  word: "表面",
  kana: "ひょうめん",
  type: "名词",
  meaning: "表面。",
  example: "$\\overset{みず}{水}$の$\\overset{ひょうめん}{表面}$に$\\overset{つき}{月}$が$\\overset{うつ}{映}$っている。/水面上倒映着月亮。"
},
{
  word: "訪問",
  kana: "ほうもん",
  type: "名・サ变动词する他",
  meaning: "访问，拜访。",
  example: "$\\overset{とつぜん}{突然}$の$\\overset{ほうもん}{訪問}$で$\\overset{しつれい}{失礼}$します。/突然的拜访，太失礼了。 || $\\overset{あした}{明日}$、$\\overset{せんせい}{先生}$のお$\\overset{たく}{宅}$を$\\overset{ほうもん}{訪問}$する。/明天拜访老师的家。"
},
{
  word: "報道",
  kana: "ほうどう",
  type: "名・サ变动词する他",
  meaning: "报道，新闻。",
  example: "テレビの$\\overset{ほうどう}{報道}$で$\\overset{じけん}{事件}$を$\\overset{し}{知}$った。/通过电视的报道知道了案件。 || $\\overset{しんぶん}{新聞}$が$\\overset{せんきょ}{選挙}$の$\\overset{けっか}{結果}$を$\\overset{ほうどう}{報道}$する。/报纸报道选举的结果。"
},
{
  word: "歩道",
  kana: "ほどう",
  type: "名词",
  meaning: "人行道。",
  example: "$\\overset{しゃどう}{車道}$ではなく、$\\overset{ほどう}{歩道}$を$\\overset{ある}{歩}$きなさい。/不要走车道，走人行道。"
},
{
  word: "役",
  kana: "やく",
  type: "名词",
  meaning: "职务，作用；角色。",
  example: "$\\overset{げき}{劇}$で$\\overset{しゅやく}{主役}$の$\\overset{やく}{役}$を$\\overset{えん}{演}$じる。/在话剧里扮演主角的作用/角色。"
},
{
  word: "愉快",
  kana: "ゆかい",
  type: "名・形动",
  meaning: "愉快，快乐。",
  example: "$\\overset{かれ}{彼}$の$\\overset{はな}{話}$は$\\overset{ゆかい}{愉快}$だ。/他的话很有趣。 || $\\overset{れんきゅう}{連休}$$\\overset{ちゅう}{中}$に$\\overset{ゆかい}{愉快}$な$\\overset{りょこう}{旅行}$をした。/在连休期间进行了一次愉快的旅行。"
},
{
  word: "由来",
  kana: "ゆらい",
  type: "名・サ变动词する自",
  meaning: "由来，起源。",
  example: "この$\\overset{まち}{町}$の$\\overset{なまえ}{名前}$の$\\overset{ゆらい}{由来}$を$\\overset{しら}{調}$べる。/调查这个城镇名字的由来。 || $\\overset{れきし}{歴史}$に$\\overset{ゆらい}{由来}$する$\\overset{でんとう}{伝統}$。/源自历史的传统。"
},
{
  word: "了解",
  kana: "りょうかい",
  type: "名・サ变动词する他",
  meaning: "了解，明白。",
  example: "$\\overset{じぜん}{事前}$の$\\overset{りょうかい}{了解}$を$\\overset{え}{得}$る。/获得事前的同意（了解）。 || $\\overset{れんらく}{連絡}$の$\\overset{ないよう}{内容}$を$\\overset{りょうかい}{了解}$しました。/明白联络的内容了。"
},
{
  word: "料金",
  kana: "りょうきん",
  type: "名词",
  meaning: "费用。",
  example: "$\\overset{でんき}{電気}$や$\\overset{すいどう}{水道}$の$\\overset{りょうきん}{料金}$を$\\overset{はら}{払}$う。/付水电费。"
},
{
  word: "連休",
  kana: "れんきゅう",
  type: "名词",
  meaning: "连休，连续假日。",
  example: "$\\overset{れんきゅう}{連休}$を$\\overset{りよう}{利用}$して$\\overset{ふじさん}{富士山}$へ$\\overset{い}{行}$く。/利用连休去富士山。"
},
{
  word: "連絡",
  kana: "れんらく",
  type: "名・サ变动词する自他",
  meaning: "联络，联系。",
  example: "$\\overset{けいじばん}{掲示板}$で$\\overset{れんらく}{連絡}$$\\overset{じこう}{事項}$を$\\overset{かくにん}{確認}$する。/在布告栏上确认联络事项。 || $\\overset{とうちゃく}{到着}$したらすぐ$\\overset{れんらく}{連絡}$してください。/到达后请立刻联系。"
},
{
  word: "握手",
  kana: "あくしゅ",
  type: "名・サ变动词する自",
  meaning: "握手。",
  example: "$\\overset{がいこう}{外交}$の$\\overset{ば}{場}$で$\\overset{あくしゅ}{握手}$を$\\overset{か}{交}$わす。/在外交场合握手。 || $\\overset{さいかい}{再会}$を$\\overset{よろこ}{喜}$んで$\\overset{あくしゅ}{握手}$する。/为重逢感到高兴而握手。"
},
{
  word: "依頼",
  kana: "いらい",
  type: "名・サ变动词する他",
  meaning: "委托，请求。",
  example: "$\\overset{けいさつかん}{警察官}$からの$\\overset{いらい}{依頼}$を$\\overset{う}{受}$ける。/接受来自警察的委托。 || $\\overset{せんもんか}{専門家}$に$\\overset{しごと}{仕事}$を$\\overset{いらい}{依頼}$する。/委托专家工作。"
},
{
  word: "運転手",
  kana: "うんてんしゅ",
  type: "名词",
  meaning: "司机。",
  example: "バスの$\\overset{うんてんしゅ}{運転手}$に$\\overset{みち}{道}$を$\\overset{たず}{尋}$ねる。/向公交车司机问路。"
},
{
  word: "運命",
  kana: "うんめい",
  type: "名词",
  meaning: "命运。",
  example: "$\\overset{かれ}{彼}$らは$\\overset{さいかい}{再会}$する$\\overset{うんめい}{運命}$にあった。/他们注定（命中）会重逢。"
},
{
  word: "外交",
  kana: "がいこう",
  type: "名词",
  meaning: "外交。",
  example: "$\\overset{せいふ}{政府}$は$\\overset{へいわ}{平和}$的$\\overset{てき}{的}$な$\\overset{がいこう}{外交}$を$\\overset{てんかい}{展開}$する。/政府开展和平的外交。"
},
{
  word: "患者",
  kana: "かんじゃ",
  type: "名词",
  meaning: "患者，病人。",
  example: "$\\overset{びょういん}{病院}$で$\\overset{いし}{医師}$が$\\overset{かんじゃ}{患者}$を$\\overset{しゅじゅつ}{手術}$する。/在医院里医生给患者做手术。"
},
{
  word: "教師",
  kana: "きょうし",
  type: "名词",
  meaning: "教师。",
  example: "$\\overset{かれ}{彼}$は$\\overset{ちゅうがっこう}{中学校}$の$\\overset{きょうし}{教師}$をしている。/他是一名初中教师。"
},
{
  word: "掲示板",
  kana: "けいじばん",
  type: "名词",
  meaning: "布告栏。",
  example: "$\\overset{えき}{駅}$の$\\overset{けいじばん}{掲示板}$で$\\overset{れんらくさき}{連絡先}$を$\\overset{さが}{探}$す。/在车站的布告栏上寻找联系方式。"
},
{
  word: "軒",
  kana: "けん",
  type: "量词・名词",
  meaning: "栋，所，家（量词）；屋檐。",
  example: "この$\\overset{まち}{町}$には$\\overset{びよういん}{美容院}$が$\\overset{さん}{三}$$\\overset{けん}{軒}$ある。/这个镇上有三家美容院。"
},
{
  word: "交換",
  kana: "こうかん",
  type: "名・サ变动词する他",
  meaning: "交换。",
  example: "$\\overset{めいし}{名刺}$の$\\overset{こうかん}{交換}$をする。/交换名片。 || $\\overset{こうりゅうかい}{交流会}$で$\\overset{れんらくさき}{連絡先}$を$\\overset{こうかん}{交換}$する。/在交流会上交换联系方式。"
},
{
  word: "交響曲",
  kana: "こうきょうきょく",
  type: "名词",
  meaning: "交响曲。",
  example: "$\\overset{げき}{劇}$の$\\overset{しゅやく}{主役}$が$\\overset{とうじょう}{登場}$する$\\overset{とき}{時}$、$\\overset{こうきょうきょく}{交響曲}$が$\\overset{なが}{流}$れる。/话剧主角登场时，播放了交响曲。"
},
{
  word: "今後",
  kana: "こんご",
  type: "名・副词",
  meaning: "今后。",
  example: "$\\overset{こんご}{今後}$の$\\overset{けいかく}{計画}$を$\\overset{さくせい}{作成}$する。/制定今后的计划。"
},
{
  word: "市",
  kana: "し",
  type: "名词",
  meaning: "市（行政区划）。",
  example: "この$\\overset{し}{市}$では$\\overset{としょ}{図書}$$\\overset{かん}{館}$の$\\overset{ふきゅう}{普及}$が$\\overset{すす}{進}$んでいる。/这个市正在推进图书馆的普及。"
},
{
  word: "車道",
  kana: "しゃどう",
  type: "名词",
  meaning: "车道。",
  example: "$\\overset{じてんしゃ}{自転車}$で$\\overset{しゃどう}{車道}$の$\\overset{ひだりがわ}{左側}$を$\\overset{つうこう}{通行}$する。/骑自行车在车道的左侧通行。"
},
{
  word: "宗教",
  kana: "しゅうきょう",
  type: "名词",
  meaning: "宗教。",
  example: "$\\overset{しそうてき}{思想的}$な$\\overset{じゆう}{自由}$と$\\overset{しゅうきょう}{宗教}$を$\\overset{そんちょう}{尊重}$する。/尊重思想自由和宗教。"
},
{
  word: "手術",
  kana: "しゅじゅつ",
  type: "名・サ变动词する自他",
  meaning: "手术。",
  example: "$\\overset{かんじゃ}{患者}$の$\\overset{しゅじゅつ}{手術}$は$\\overset{せいこう}{成功}$した。/患者的手术成功了。 || $\\overset{びょういん}{病院}$で$\\overset{い}{胃}$を$\\overset{しゅじゅつ}{手術}$する。/在医院给胃做手术。"
},
{
  word: "食料",
  kana: "しょくりょう",
  type: "名词",
  meaning: "食物，粮食。",
  example: "$\\overset{じしん}{地震}$に$\\overset{そな}{備}$えて$\\overset{しょくりょう}{食料}$を$\\overset{か}{買}$う。/为了防备地震而购买食物。"
},
{
  word: "戦後",
  kana: "せんご",
  type: "名词",
  meaning: "战后。",
  example: "$\\overset{せんご}{戦後}$の$\\overset{にほん}{日本}$は$\\overset{おお}{大}$きく$\\overset{はってん}{発展}$した。/战后的日本取得了巨大的发展。"
},
{
  word: "洗濯機",
  kana: "せんたくき",
  type: "名词",
  meaning: "洗衣机。",
  example: "$\\overset{せんたくき}{洗濯機}$に$\\overset{せんざい}{洗剤}$を$\\overset{い}{入}$れる。/把洗涤剂放进洗衣机里。"
},
{
  word: "暖房",
  kana: "だんぼう",
  type: "名・サ变动词",
  meaning: "暖气，供暖。",
  example: "$\\overset{へや}{部屋}$の$\\overset{だんぼう}{暖房}$をつける。/打开房间的暖气。 || $\\overset{きょうしつ}{教室}$を$\\overset{だんぼう}{暖房}$して$\\overset{あたた}{温}$める。/给教室供暖使其暖和。"
},
{
  word: "調味料",
  kana: "ちょうみりょう",
  type: "名词",
  meaning: "调味料。",
  example: "$\\overset{だいどころ}{台所}$に$\\overset{しょうゆ}{醤油}$などの$\\overset{ちょうみりょう}{調味料}$を$\\overset{お}{置}$く。/把酱油等调味料放在厨房。"
},
{
  word: "鉄道",
  kana: "てつどう",
  type: "名词",
  meaning: "铁路。",
  example: "$\\overset{てつどう}{鉄道}$を$\\overset{りよう}{利用}$して$\\overset{し}{市}$の$\\overset{ちゅうしん}{中心}$へ$\\overset{い}{行}$く。/利用铁路前往市中心。"
},
{
  word: "店員",
  kana: "てんいん",
  type: "名词",
  meaning: "店员。",
  example: "$\\overset{てんいん}{店員}$に$\\overset{ていねい}{丁寧}$な$\\overset{けいご}{敬語}$で$\\overset{はな}{話}$しかける。/用礼貌的敬语向店员搭话。"
},
{
  word: "同士",
  kana: "どうし",
  type: "名词",
  meaning: "同伴，互相。",
  example: "$\\overset{がくせい}{学生}$$\\overset{どうし}{同士}$で$\\overset{こうりゅうかい}{交流会}$を$\\overset{ひら}{開}$く。/学生们互相之间举办交流会。"
},
{
  word: "図書館",
  kana: "としょかん",
  type: "名词",
  meaning: "图书馆。",
  example: "$\\overset{ほうかご}{放課後}$に$\\overset{としょかん}{図書館}$で$\\overset{としょ}{図書}$を$\\overset{よ}{読}$む。/放学后在图书馆读书。"
},
{
  word: "倍",
  kana: "ばい",
  type: "名词・量词",
  meaning: "倍，加倍。",
  example: "$\\overset{ことし}{今年}$の$\\overset{しゅうにゅう}{収入}$は$\\overset{きょねん}{去年}$の$\\overset{に}{二}$$\\overset{ばい}{倍}$になった。/今年的收入变成了去年的两倍。"
},
{
  word: "皮膚",
  kana: "ひふ",
  type: "名词",
  meaning: "皮肤。",
  example: "$\\overset{かんそう}{乾燥}$して$\\overset{ひふ}{皮膚}$が$\\overset{いた}{痛}$い。/因为干燥，皮肤很痛。"
},
{
  word: "美容院",
  kana: "びよういん",
  type: "名词",
  meaning: "美容院，理发店。",
  example: "$\\overset{やす}{休}$みの$\\overset{ひ}{日}$に$\\overset{びよういん}{美容院}$で$\\overset{かみ}{髪}$を$\\overset{き}{切}$る。/休息日去理发店剪头发。"
},
{
  word: "表紙",
  kana: "ひょうし",
  type: "名词",
  meaning: "封面。",
  example: "$\\overset{ざっし}{雑誌}$の$\\overset{ひょうし}{表紙}$に$\\overset{はで}{派手}$な$\\overset{しゃしん}{写真}$がある。/杂志封面上有一张花哨的照片。"
},
{
  word: "封筒",
  kana: "ふうとう",
  type: "名词",
  meaning: "信封。",
  example: "$\\overset{ゆうびんきょく}{郵便局}$で$\\overset{ふうとう}{封筒}$と$\\overset{きって}{切手}$を$\\overset{か}{買}$う。/在邮局买信封和邮票。"
},
{
  word: "普及",
  kana: "ふきゅう",
  type: "名・サ变动词",
  meaning: "普及。",
  example: "インターネットの$\\overset{ふきゅう}{普及}$で$\\overset{せいかつ}{生活}$が$\\overset{べんり}{便利}$になった。/随着互联网的普及，生活变得方便了。 || $\\overset{あたら}{新}$しい$\\overset{ぎじゅつ}{技術}$が$\\overset{ぜんこく}{全国}$に$\\overset{ふきゅう}{普及}$する。/新技术在全国普及。"
},
{
  word: "富士山",
  kana: "ふじさん",
  type: "名词",
  meaning: "富士山。",
  example: "$\\overset{ふじさん}{富士山}$は$\\overset{にほん}{日本}$を$\\overset{だいひょう}{代表}$する$\\overset{やま}{山}$です。/富士山是代表日本的山。"
},
{
  word: "放課後",
  kana: "ほうかご",
  type: "名词",
  meaning: "放学后。",
  example: "$\\overset{ほうかご}{放課後}$、$\\overset{うんどうじょう}{運動場}$で$\\overset{かっぱつ}{活発}$に$\\overset{あそ}{遊}$ぶ。/放学后在操场上活泼地玩耍。"
},
{
  word: "無",
  kana: "む",
  type: "名词",
  meaning: "无，没有。",
  example: "$\\overset{どりょく}{努力}$が$\\overset{む}{無}$になることはない。/努力是不会化为乌有的（白费的）。"
},
{
  word: "郵便局",
  kana: "ゆうびんきょく",
  type: "名词",
  meaning: "邮局。",
  example: "$\\overset{てがみ}{手紙}$を$\\overset{だ}{出}$すために$\\overset{ゆうびんきょく}{郵便局}$へ$\\overset{い}{行}$く。/为了寄信去邮局。"
},
{
  word: "横断",
  kana: "おうだん",
  type: "名・サ变动词する自他",
  meaning: "横穿，横断。",
  example: "$\\overset{おうだん}{横断}$$\\overset{ほどう}{歩道}$を$\\overset{わた}{渡}$る。/走斑马线（横断步道）。 || $\\overset{き}{気}$をつけて$\\overset{どうろ}{道路}$を$\\overset{おうだん}{横断}$する。/小心地横穿道路。"
},
{
  word: "活発",
  kana: "かっぱつ",
  type: "名・形动",
  meaning: "活泼，活跃。",
  example: "$\\overset{かっぱつ}{活発}$な$\\overset{ぎろん}{議論}$を$\\overset{てんかい}{展開}$する。/展开活跃的讨论。 || $\\overset{かのじょ}{彼女}$はとても$\\overset{かっぱつ}{活発}$な$\\overset{しょうじょ}{少女}$だ。/她是个非常活泼的少女。"
},
{
  word: "記憶力",
  kana: "きおくりょく",
  type: "名词",
  meaning: "记忆力。",
  example: "$\\overset{べんきょう}{勉強}$して$\\overset{きおくりょく}{記憶力}$を$\\overset{たか}{高}$める。/通过学习提高记忆力。"
},
{
  word: "危機",
  kana: "きき",
  type: "名词",
  meaning: "危机。",
  example: "$\\overset{かいしゃ}{会社}$の$\\overset{きき}{危機}$をみんなで$\\overset{の}{乗}$り$\\overset{こ}{越}$える。/大家一起度过公司的危机。"
},
{
  word: "敬語",
  kana: "けいご",
  type: "名词",
  meaning: "敬语。",
  example: "$\\overset{ねんぱいしゃ}{年配者}$には$\\overset{けいご}{敬語}$を$\\overset{つか}{使}$うのが$\\overset{れいぎ}{礼儀}$だ。/对长辈使用敬语是礼仪。"
},
{
  word: "警察官",
  kana: "けいさつかん",
  type: "名词",
  meaning: "警察。",
  example: "$\\overset{こうばん}{交番}$の$\\overset{けいさつかん}{警察官}$に$\\overset{みち}{道}$を$\\overset{き}{聞}$く。/向派出所的警察问路。"
},
{
  word: "交流会",
  kana: "こうりゅうかい",
  type: "名词",
  meaning: "交流会。",
  example: "$\\overset{がっこう}{学校}$で$\\overset{りゅうがくせい}{留学生}$との$\\overset{こうりゅうかい}{交流会}$がある。/学校有和留学生的交流会。"
},
{
  word: "最速",
  kana: "さいそく",
  type: "名・形动",
  meaning: "最快。",
  example: "$\\overset{さいそく}{最速}$の$\\overset{きろく}{記録}$を$\\overset{だ}{出}$して$\\overset{ゆうしょう}{優勝}$した。/创造了最快的记录并夺冠。 || $\\overset{さいそく}{最速}$な$\\overset{そくど}{速度}$で$\\overset{はし}{走}$る。/以最快的速度奔跑。"
},
{
  word: "作成",
  kana: "さくせい",
  type: "名・サ变动词する他",
  meaning: "制作，编制。",
  example: "$\\overset{しりょう}{資料}$の$\\overset{さくせい}{作成}$を$\\overset{いらい}{依頼}$する。/委托制作资料。 || $\\overset{ひょう}{表}$を$\\overset{さくせい}{作成}$して$\\overset{けっか}{結果}$をまとめる。/制作表格来总结结果。"
},
{
  word: "思想的",
  kana: "しそうてき",
  type: "形动",
  meaning: "思想上的。",
  example: "$\\overset{しそうてき}{思想的}$な$\\overset{ちが}{違}$いを$\\overset{りかい}{理解}$する。/理解思想上的差异。"
},
{
  word: "時速",
  kana: "じそく",
  type: "名词",
  meaning: "时速。",
  example: "$\\overset{じそく}{時速}$$\\overset{ひゃく}{百}$キロの$\\overset{そくど}{速度}$で$\\overset{くるま}{車}$が$\\overset{はし}{走}$る。/汽车以时速一百公里的速度行驶。"
},
{
  word: "主役",
  kana: "しゅやく",
  type: "名词",
  meaning: "主角。",
  example: "$\\overset{かのじょ}{彼女}$は$\\overset{こんかい}{今回}$の$\\overset{げき}{劇}$の$\\overset{しゅやく}{主役}$だ。/她是这次话剧的主角。"
},
{
  word: "設置",
  kana: "せっち",
  type: "名・サ变动词する他",
  meaning: "设置，安装。",
  example: "$\\overset{あたら}{新}$しい$\\overset{きかい}{機械}$の$\\overset{せっち}{設置}$が$\\overset{お}{終}$わった。/新机器的安装结束了。 || $\\overset{きょうしつ}{教室}$に$\\overset{だんぼう}{暖房}$を$\\overset{せっち}{設置}$する。/在教室里安装暖气。"
},
{
  word: "速度",
  kana: "そくど",
  type: "名词",
  meaning: "速度。",
  example: "$\\overset{あんぜん}{安全}$な$\\overset{そくど}{速度}$で$\\overset{つうこう}{通行}$してください。/请以安全的速度通行。"
},
{
  word: "通行",
  kana: "つうこう",
  type: "名・サ变动词する自",
  meaning: "通行。",
  example: "$\\overset{ひだりがわ}{左側}$$\\overset{つうこう}{通行}$のルールを$\\overset{まも}{守}$る。/遵守靠左侧通行的规则。 || この$\\overset{どうろ}{道路}$は$\\overset{くるま}{車}$が$\\overset{つうこう}{通行}$できない。/这条道路汽车无法通行。"
},
{
  word: "提唱",
  kana: "ていしょう",
  type: "名・サ变动词する他",
  meaning: "提倡，倡导。",
  example: "$\\overset{へいわ}{平和}$の$\\overset{ていしょう}{提唱}$に$\\overset{さんせい}{賛成}$する。/赞成对和平的提倡。 || $\\overset{あたら}{新}$しい$\\overset{きょういく}{教育}$の$\\overset{ほうほう}{方法}$を$\\overset{ていしょう}{提唱}$する。/提倡新的教育方法。"
},
{
  word: "展開",
  kana: "てんかい",
  type: "名・サ变动词する自他",
  meaning: "开展，展开。",
  example: "$\\overset{げき}{劇}$の$\\overset{てんかい}{展開}$が$\\overset{おも}{面}$$\\overset{しろ}{白}$い。/剧情的展开很有趣。 || $\\overset{かっぱつ}{活発}$な$\\overset{ぎろん}{議論}$を$\\overset{てんかい}{展開}$する。/展开活跃的讨论。"
},
{
  word: "左側",
  kana: "ひだりがわ",
  type: "名词",
  meaning: "左侧。",
  example: "$\\overset{どうろ}{道路}$の$\\overset{ひだりがわ}{左側}$を$\\overset{ある}{歩}$いてください。/请走道路的左侧。"
},
{
  word: "表",
  kana: "ひょう",
  type: "名词",
  meaning: "表格；表面，正面。",
  example: "$\\overset{ずひょう}{図表}$や$\\overset{ひょう}{表}$を$\\overset{さくせい}{作成}$して$\\overset{せつめい}{説明}$する。/制作图表和表格进行说明。"
},
{
  word: "不足",
  kana: "ふそく",
  type: "名・形动・サ变动词",
  meaning: "不足，不够。",
  example: "$\\overset{すいみん}{睡眠}$$\\overset{ふそく}{不足}$で$\\overset{あたま}{頭}$が$\\overset{いた}{痛}$い。/因为睡眠不足而头痛。 || $\\overset{ざいりょう}{材料}$が$\\overset{ふそく}{不足}$な$\\overset{じょうたい}{状態}$だ。/处于材料不足的状态。 || $\\overset{けいけん}{経験}$が$\\overset{ふそく}{不足}$している。/经验不足。"
},
{
  word: "無教養",
  kana: "むきょうよう",
  type: "名・形动",
  meaning: "没教养，没文化。",
  example: "$\\overset{むきょうよう}{無教養}$を$\\overset{はんせい}{反省}$する。/反省自己的没教养。 || $\\overset{むきょうよう}{無教養}$な$\\overset{たいど}{態度}$をとる。/采取没教养的态度。"
},
{
  word: "無視",
  kana: "むし",
  type: "名・サ变动词する他",
  meaning: "无视，忽视。",
  example: "$\\overset{しんごう}{信号}$$\\overset{むし}{無視}$は$\\overset{きけん}{危険}$だ。/无视红绿灯很危险。 || $\\overset{ひと}{人}$の$\\overset{ちゅうこく}{忠告}$を$\\overset{むし}{無視}$してはいけない。/不能无视别人的忠告。"
},
{
  word: "優勝",
  kana: "ゆうしょう",
  type: "名・サ变动词する自",
  meaning: "获胜，夺冠。",
  example: "$\\overset{ゆうしょう}{優勝}$を$\\overset{めざ}{目指}$して$\\overset{がんば}{頑張}$る。/以夺冠为目标而努力。 || $\\overset{さいご}{最後}$の$\\overset{しあい}{試合}$で$\\overset{ゆうしょう}{優勝}$した。/在最后一场比赛中获胜了。"
},
{
  word: "連絡先",
  kana: "れんらくさき",
  type: "名词",
  meaning: "联系方式，联络地址。",
  example: "$\\overset{ひょう}{表}$に$\\overset{じぶん}{自分}$の$\\overset{れんらくさき}{連絡先}$を$\\overset{か}{書}$く。/在表格上写下自己的联系方式。"
},
{
  word: "映画",
  kana: "えいが",
  type: "名词",
  meaning: "电影。",
  example: "$\\overset{えいが}{映画}$の$\\overset{かんそう}{感想}$を$\\overset{えんぴつ}{鉛筆}$で$\\overset{さくぶん}{作文}$に$\\overset{か}{書}$く。/用铅笔把电影的感想写在作文里。"
},
{
  word: "鉛筆",
  kana: "えんぴつ",
  type: "名词",
  meaning: "铅笔。",
  example: "この$\\overset{えんぴつ}{鉛筆}$はとても$\\overset{か}{書}$きやすい。/这支铅笔非常容易写。"
},
{
  word: "看護師",
  kana: "かんごし",
  type: "名词",
  meaning: "护士。",
  example: "あの$\\overset{びょういん}{病院}$の$\\overset{かんごし}{看護師}$はいつも$\\overset{しんけん}{真剣}$だ。/那家医院的护士总是很认真。"
},
{
  word: "喧嘩",
  kana: "けんか",
  type: "名・サ变动词する自",
  meaning: "吵架，打架。",
  example: "$\\overset{ともだち}{友達}$との$\\overset{けんか}{喧嘩}$はもうやめた。/已经停止和朋友吵架了。 || $\\overset{せいと}{生徒}$$\\overset{どうし}{同士}$が$\\overset{きょうしつ}{教室}$で$\\overset{けんか}{喧嘩}$する。/学生们在教室里吵架。"
},
{
  word: "作文",
  kana: "さくぶん",
  type: "名・サ变动词",
  meaning: "作文，写文章。",
  example: "$\\overset{あした}{明日}$までに$\\overset{えいご}{英語}$の$\\overset{さくぶん}{作文}$を$\\overset{ていしゅつ}{提出}$する。/明天之前提交英语作文。 || $\\overset{かれ}{彼}$は$\\overset{りっぱ}{立派}$な$\\overset{ぶんしょう}{文章}$を$\\overset{さくぶん}{作文}$した。/他写出了一篇出色的文章。"
},
{
  word: "賛成",
  kana: "さんせい",
  type: "名・サ变动词する自",
  meaning: "赞成，同意。",
  example: "$\\overset{かれ}{彼}$の$\\overset{ていあん}{提案}$に$\\overset{さんせい}{賛成}$の$\\overset{い}{意}$を$\\overset{あらわ}{表}$す。/对他的提案表示赞成。 || $\\overset{せんぱい}{先輩}$の$\\overset{いけん}{意見}$に$\\overset{かんぜん}{完全}$に$\\overset{さんせい}{賛成}$する。/完全赞成前辈的意见。"
},
{
  word: "辞書",
  kana: "じしょ",
  type: "名词",
  meaning: "词典，字典。",
  example: "$\\overset{じしょ}{辞書}$を$\\overset{ひ}{引}$いて、$\\overset{しんけん}{真剣}$に$\\overset{べんきょう}{勉強}$する。/查字典，认真地学习。"
},
{
  word: "邪魔",
  kana: "じゃま",
  type: "名・形动・サ变动词する他",
  meaning: "打扰，妨碍。",
  example: "$\\overset{べんきょう}{勉強}$の$\\overset{じゃま}{邪魔}$にならないようにする。/注意不要妨碍学习。 || $\\overset{みち}{道}$の$\\overset{ま}{真}$ん$\\overset{なか}{中}$に$\\overset{じてんしゃ}{自転車}$を$\\overset{お}{置}$くのは$\\overset{じゃま}{邪魔}$だ。/把自行车放在路中间很碍事。 || $\\overset{ひと}{人}$の$\\overset{せいかつ}{生活}$を$\\overset{じゃま}{邪魔}$してはいけない。/不能打扰别人的生活。"
},
{
  word: "真剣",
  kana: "しんけん",
  type: "名・形动",
  meaning: "认真，严肃。",
  example: "$\\overset{しんけん}{真剣}$な$\\overset{かお}{顔}$で$\\overset{はな}{話}$を$\\overset{き}{聞}$く。/一脸严肃地听话。 || $\\overset{せいせき}{成績}$を$\\overset{あ}{上}$げるために$\\overset{しんけん}{真剣}$に$\\overset{と}{取}$り$\\overset{く}{組}$む。/为了提高成绩而认真对待。"
},
{
  word: "生活",
  kana: "せいかつ",
  type: "名・サ变动词する自",
  meaning: "生活。",
  example: "$\\overset{にほん}{日本}$での$\\overset{せいかつ}{生活}$にだんだん$\\overset{な}{慣}$れてきた。/渐渐习惯了在日本的生活。 || $\\overset{まいにち}{毎日}$$\\overset{けんこう}{健康}$に$\\overset{せいかつ}{生活}$している。/每天都健康地生活着。"
},
{
  word: "成績",
  kana: "せいせき",
  type: "名词",
  meaning: "成绩。",
  example: "$\\overset{いっしょうけんめい}{一生懸命}$$\\overset{べんきょう}{勉強}$して、$\\overset{せいせき}{成績}$が$\\overset{あ}{上}$がった。/拼命学习，成绩提高了。"
},
{
  word: "生徒",
  kana: "せいと",
  type: "名词",
  meaning: "学生（中、小学生）。",
  example: "$\\overset{せんせい}{先生}$と$\\overset{せいと}{生徒}$が$\\overset{きょうしつ}{教室}$を$\\overset{そうじ}{掃除}$する。/老师和学生打扫教室。"
},
{
  word: "世界",
  kana: "せかい",
  type: "名词",
  meaning: "世界。",
  example: "$\\overset{せかい}{世界}$の$\\overset{ぶんか}{文化}$に$\\overset{えいきょう}{影響}$を$\\overset{あた}{与}$える。/对世界文化产生影响。"
},
{
  word: "先生",
  kana: "せんせい",
  type: "名词",
  meaning: "老师。",
  example: "$\\overset{せんせい}{先生}$に$\\overset{さくぶん}{作文}$の$\\overset{しどう}{指導}$をお$\\overset{ねが}{願}$いする。/请老师指导作文。"
},
{
  word: "先輩",
  kana: "せんぱい",
  type: "名词",
  meaning: "前辈，学长学姐。",
  example: "$\\overset{せんぱい}{先輩}$の$\\overset{ていあん}{提案}$はとても$\\overset{やくだ}{役立}$つ。/前辈的提议非常有用。"
},
{
  word: "沢山",
  kana: "たくさん",
  type: "名・副词",
  meaning: "很多。",
  example: "$\\overset{たくさん}{沢山}$の$\\overset{ひと}{人}$が$\\overset{ぶんかさい}{文化祭}$に$\\overset{き}{来}$た。/很多人来到了文化祭。 || $\\overset{たんじょうび}{誕生日}$にプレゼントを$\\overset{たくさん}{沢山}$もらった。/生日时收到了很多礼物。"
},
{
  word: "多分",
  kana: "たぶん",
  type: "副词",
  meaning: "大概，也许。",
  example: "$\\overset{かれ}{彼}$は$\\overset{たくさん}{沢山}$$\\overset{れんしゅう}{練習}$したので、$\\overset{たぶん}{多分}$$\\overset{せいこう}{成功}$するだろう。/他练习了很多，大概会成功吧。"
},
{
  word: "誕生日",
  kana: "たんじょうび",
  type: "名词",
  meaning: "生日。",
  example: "$\\overset{ちゅうがくせい}{中学生}$の$\\overset{いもうと}{妹}$の$\\overset{たんじょうび}{誕生日}$を$\\overset{いわ}{祝}$う。/庆祝初中生妹妹的生日。"
},
{
  word: "中学生",
  kana: "ちゅうがくせい",
  type: "名词",
  meaning: "初中生。",
  example: "$\\overset{ちゅうがくせい}{中学生}$の$\\overset{ころ}{頃}$から$\\overset{まんが}{漫画}$を$\\overset{か}{描}$いている。/从初中时代起就在画漫画。"
},
{
  word: "提案",
  kana: "ていあん",
  type: "名・サ变动词する他",
  meaning: "提议，提案。",
  example: "$\\overset{かれ}{彼}$の$\\overset{ていあん}{提案}$に$\\overset{ぜんいん}{全員}$が$\\overset{なっとく}{納得}$した。/所有人对他提案感到心服口服。 || $\\overset{あたら}{新}$しい$\\overset{ほうほう}{方法}$を$\\overset{せんせい}{先生}$に$\\overset{ていあん}{提案}$する。/向老师提议新的方法。"
},
{
  word: "人形",
  kana: "にんぎょう",
  type: "名词",
  meaning: "人偶，娃娃。",
  example: "$\\overset{たんじょうび}{誕生日}$に$\\overset{うつく}{美}$しい$\\overset{にんぎょう}{人形}$をもらった。/生日收到了美丽的人偶。"
},
{
  word: "人間",
  kana: "にんげん",
  type: "名词",
  meaning: "人，人类。",
  example: "$\\overset{にんげん}{人間}$と$\\overset{しぜん}{自然}$の$\\overset{せいたい}{生態}$を$\\overset{けんきゅう}{研究}$する。/研究人类和自然的生态。"
},
{
  word: "人参",
  kana: "にんじん",
  type: "名词",
  meaning: "胡萝卜。",
  example: "$\\overset{はくさい}{白菜}$と$\\overset{にんじん}{人参}$の$\\overset{ねだん}{値段}$が$\\overset{あ}{上}$がった。/白菜和胡萝卜的价格上涨了。"
},
{
  word: "値段",
  kana: "ねだん",
  type: "名词",
  meaning: "价格。",
  example: "この$\\overset{ぶんぼうぐ}{文房具}$は$\\overset{ねだん}{値段}$が$\\overset{やす}{安}$い。/这个文具价格很便宜。"
},
{
  word: "白菜",
  kana: "はくさい",
  type: "名词",
  meaning: "白菜。",
  example: "$\\overset{なべ}{鍋}$に$\\overset{はくさい}{白菜}$を$\\overset{はんぶん}{半分}$ $\\overset{い}{入}$れる。/在锅里放入半个白菜。"
},
{
  word: "半分",
  kana: "はんぶん",
  type: "名词",
  meaning: "一半。",
  example: "ケーキを$\\overset{はんぶん}{半分}$に$\\overset{き}{切}$って$\\overset{わ}{分}$ける。/把蛋糕切成一半分着吃。"
},
{
  word: "文化",
  kana: "ぶんか",
  type: "名词",
  meaning: "文化。",
  example: "$\\overset{いぶんか}{異文化}$を$\\overset{りかい}{理解}$することは$\\overset{たいせつ}{大切}$だ。/理解异国文化很重要。"
},
{
  word: "文章",
  kana: "ぶんしょう",
  type: "名词",
  meaning: "文章，句子。",
  example: "$\\overset{じしょ}{辞書}$を$\\overset{つか}{使}$って、$\\overset{なが}{長}$い$\\overset{ぶんしょう}{文章}$を$\\overset{やく}{訳}$す。/使用字典翻译长篇文章。"
},
{
  word: "文房具",
  kana: "ぶんぼうぐ",
  type: "名词",
  meaning: "文具。",
  example: "$\\overset{ほん}{本}$や$\\overset{ぶんぼうぐ}{文房具}$を$\\overset{たくさん}{沢山}$$\\overset{か}{買}$った。/买了很多书和文具。"
},
{
  word: "本",
  kana: "ほん",
  type: "名词",
  meaning: "书。",
  example: "$\\overset{いっしょうけんめい}{一生懸命}$に$\\overset{にほんご}{日本語}$の$\\overset{ほん}{本}$を$\\overset{よ}{読}$む。/拼命地读日语书。"
},
{
  word: "漫画",
  kana: "まんが",
  type: "名词",
  meaning: "漫画。",
  example: "$\\overset{にほん}{日本}$の$\\overset{まんが}{漫画}$は$\\overset{せかい}{世界}$で$\\overset{にんき}{人気}$がある。/日本的漫画在世界上很受欢迎。"
},
{
  word: "役立つ",
  kana: "やくだつ",
  type: "五段动词自",
  meaning: "有用，有益。",
  example: "この$\\overset{けいけん}{経験}$は$\\overset{しょうらい}{将来}$きっと$\\overset{やくだ}{役立}$つだろう。/这个经验对将来一定会有用的吧。"
},
{
  word: "一生懸命",
  kana: "いっしょうけんめい",
  type: "形动・副词",
  meaning: "拼命地，努力地。",
  example: "$\\overset{かれ}{彼}$の$\\overset{いっしょうけんめい}{一生懸命}$な$\\overset{すがた}{姿}$に$\\overset{かんどう}{感動}$した。/被他拼命努力的身影感动了。 || $\\overset{もくひょう}{目標}$に$\\overset{む}{向}$かって$\\overset{いっしょうけんめい}{一生懸命}$$\\overset{はし}{走}$る。/朝着目标拼命奔跑。"
},
{
  word: "異文化",
  kana: "いぶんか",
  type: "名词",
  meaning: "异国文化。",
  example: "$\\overset{りゅうがく}{留学}$して$\\overset{いぶんか}{異文化}$の$\\overset{しげき}{刺激}$を$\\overset{う}{受}$ける。/去留学接受异国文化的刺激。"
},
{
  word: "印象",
  kana: "いんしょう",
  type: "名词",
  meaning: "印象。",
  example: "$\\overset{おんせん}{温泉}$$\\overset{りょこう}{旅行}$で$\\overset{つよ}{強}$い$\\overset{いんしょう}{印象}$を$\\overset{う}{受}$けた。/温泉旅行给我留下了深刻的印象。"
},
{
  word: "影響",
  kana: "えいきょう",
  type: "名・サ变动词する自",
  meaning: "影响。",
  example: "$\\overset{せんせい}{先生}$の$\\overset{ことば}{言葉}$から$\\overset{おお}{大}$きな$\\overset{えいきょう}{影響}$を$\\overset{う}{受}$けた。/从老师的话里受到了很大的影响。 || $\\overset{げいじゅつ}{芸術}$は$\\overset{ひと}{人}$の$\\overset{こころ}{心}$に$\\overset{えいきょう}{影響}$する。/艺术影响人的心灵。"
},
{
  word: "温泉",
  kana: "おんせん",
  type: "名词",
  meaning: "温泉。",
  example: "$\\overset{やす}{休}$みの$\\overset{ひ}{日}$に$\\overset{かぞく}{家族}$と$\\overset{おんせん}{温泉}$に$\\overset{い}{行}$く。/休息日和家人去温泉。"
},
{
  word: "学生",
  kana: "がくせい",
  type: "名词",
  meaning: "学生（多指大学生）。",
  example: "$\\overset{がくせい}{学生}$の$\\overset{じだい}{時代}$に$\\overset{たくさん}{沢山}$の$\\overset{ほん}{本}$を$\\overset{よ}{読}$むべきだ。/学生时代应该多读书。"
},
{
  word: "関係",
  kana: "かんけい",
  type: "名・サ变动词",
  meaning: "关系。",
  example: "$\\overset{かれ}{彼}$とは$\\overset{よ}{良}$い$\\overset{にんげん}{人間}$$\\overset{かんけい}{関係}$を$\\overset{きず}{築}$いている。/和他建立着良好的人际关系。 || この$\\overset{もんだい}{問題}$は$\\overset{わたし}{私}$たちの$\\overset{せいかつ}{生活}$に$\\overset{かんけい}{関係}$する。/这个问题关系到我们的生活。"
},
{
  word: "完成",
  kana: "かんせい",
  type: "名・サ变动词する自他",
  meaning: "完成。",
  example: "$\\overset{え}{絵}$の$\\overset{かんせい}{完成}$を$\\overset{たの}{楽}$しみに$\\overset{ま}{待}$つ。/期待着画的完成。 || $\\overset{なが}{長}$い$\\overset{じかん}{時間}$をかけて$\\overset{ろんぶん}{論文}$を$\\overset{かんせい}{完成}$させた。/花了很长时间完成了论文。"
},
{
  word: "完全",
  kana: "かんぜん",
  type: "名・形动",
  meaning: "完全。",
  example: "$\\overset{かんぜん}{完全}$を$\\overset{もと}{求}$めて$\\overset{どりょく}{努力}$する。/追求完全（完美）而努力。 || あの$\\overset{たてもの}{建物}$は$\\overset{かんぜん}{完全}$に$\\overset{ほうかい}{崩壊}$した。/那栋建筑物完全崩溃了。"
},
{
  word: "危険",
  kana: "きけん",
  type: "名・形动",
  meaning: "危险。",
  example: "$\\overset{いのち}{命}$の$\\overset{きけん}{危険}$を$\\overset{かん}{感}$じる。/感受到了生命的危险。 || $\\overset{きけん}{危険}$な$\\overset{ばしょ}{場所}$に$\\overset{ちか}{近}$づかないでください。/请不要靠近危险的地方。"
},
{
  word: "義務",
  kana: "ぎむ",
  type: "名词",
  meaning: "义务。",
  example: "$\\overset{こくみん}{国民}$としての$\\overset{ぎむ}{義務}$と$\\overset{けんり}{権利}$を$\\overset{も}{持}$つ。/拥有作为国民的义务和权利。"
},
{
  word: "傾向",
  kana: "けいこう",
  type: "名词",
  meaning: "倾向，趋势。",
  example: "$\\overset{さいきん}{最近}$、$\\overset{しょうしか}{少子化}$の$\\overset{けいこう}{傾向}$がある。/最近有少子化的趋势。"
},
{
  word: "芸術",
  kana: "げいじゅつ",
  type: "名词",
  meaning: "艺术。",
  example: "$\\overset{かれ}{彼}$は$\\overset{げいじゅつ}{芸術}$の$\\overset{さいのう}{才能}$がある。/他有艺术的才能。"
},
{
  word: "結婚",
  kana: "けっこん",
  type: "名・サ变动词する自",
  meaning: "结婚。",
  example: "$\\overset{けっこん}{結婚}$の$\\overset{ほうこく}{報告}$を$\\overset{ゆうじん}{友人}$にする。/向友人报告结婚的事。 || $\\overset{かのじょ}{彼女}$は$\\overset{らいげつ}{来月}$、$\\overset{けっこん}{結婚}$する$\\overset{よてい}{予定}$だ。/她打算下个月结婚。"
},
{
  word: "研究",
  kana: "けんきゅう",
  type: "名・サ变动词する他",
  meaning: "研究。",
  example: "$\\overset{せいぶつ}{生物}$の$\\overset{けんきゅう}{研究}$に$\\overset{いっしょうけんめい}{一生懸命}$だ。/拼命致力于生物的研究。 || $\\overset{あたら}{新}$しい$\\overset{くすり}{薬}$を$\\overset{けんきゅう}{研究}$している。/正在研究新药。"
},
{
  word: "権利",
  kana: "けんり",
  type: "名词",
  meaning: "权利。",
  example: "$\\overset{こじん}{個人}$の$\\overset{こうふく}{幸福}$を$\\overset{ついきゅう}{追求}$する$\\overset{けんり}{権利}$がある。/有追求个人幸福的权利。"
},
{
  word: "幸福",
  kana: "こうふく",
  type: "名・形动",
  meaning: "幸福。",
  example: "$\\overset{しょうがい}{生涯}$の$\\overset{こうふく}{幸福}$を$\\overset{いの}{祈}$る。/祈求一生的幸福。 || $\\overset{かぞく}{家族}$と$\\overset{いっしょ}{一緒}$にいて$\\overset{こうふく}{幸福}$だ。/和家人在一起很幸福。"
},
{
  word: "個人",
  kana: "こじん",
  type: "名词",
  meaning: "个人。",
  example: "$\\overset{しゅうだん}{集団}$より$\\overset{こじん}{個人}$の$\\overset{けんり}{権利}$を$\\overset{おもん}{重ん}$じる。/比起集体更看重个人的权利。"
},
{
  word: "骨",
  kana: "ほね",
  type: "名词",
  meaning: "骨头；劳苦，费力。",
  example: "$\\overset{ころ}{転}$んで$\\overset{あし}{足}$の$\\overset{ほね}{骨}$を$\\overset{お}{折}$ってしまった。/摔倒把脚的骨头折断了。"
},
{
  word: "差",
  kana: "さ",
  type: "名词",
  meaning: "差别，差异。",
  example: "$\\overset{ふた}{二}$つの$\\overset{しょうひん}{商品}$の$\\overset{ねだん}{値段}$に$\\overset{おお}{大}$きな$\\overset{さ}{差}$がある。/两件商品的价格有很大的差异。"
},
{
  word: "最近",
  kana: "さいきん",
  type: "名・副词",
  meaning: "最近。",
  example: "$\\overset{さいきん}{最近}$の$\\overset{てんき}{天気}$は$\\overset{へん}{変}$だ。/最近的天气很奇怪。 || $\\overset{さいきん}{最近}$、$\\overset{えいご}{英語}$の$\\overset{べんきょう}{勉強}$を$\\overset{はじ}{始}$めた。/最近开始学习英语了。"
},
{
  word: "才能",
  kana: "さいのう",
  type: "名词",
  meaning: "才能。",
  example: "$\\overset{かれ}{彼}$は$\\overset{おんがく}{音楽}$の$\\overset{さいのう}{才能}$に$\\overset{めぐ}{恵}$まれている。/他被赋予了音乐的才能。"
},
{
  word: "刺激",
  kana: "しげき",
  type: "名・サ变动词",
  meaning: "刺激。",
  example: "$\\overset{つよ}{強}$い$\\overset{しげき}{刺激}$を$\\overset{う}{受}$けて$\\overset{せいちょう}{成長}$する。/受到强烈的刺激而成长。 || $\\overset{め}{目}$を$\\overset{しげき}{刺激}$するような$\\overset{ひかり}{光}$。/刺激眼睛般的光芒。"
},
{
  word: "時代",
  kana: "じだい",
  type: "名词",
  meaning: "时代。",
  example: "この$\\overset{たてもの}{建物}$は$\\overset{ふる}{古}$い$\\overset{じだい}{時代}$の$\\overset{しょうちょう}{象徴}$だ。/这栋建筑是旧时代的象征。"
},
{
  word: "失敗",
  kana: "しっぱい",
  type: "名・サ变动词する自",
  meaning: "失败。",
  example: "$\\overset{しっぱい}{失敗}$を$\\overset{おそ}{恐}$れずに$\\overset{ちょうせん}{挑戦}$する。/不畏失败地挑战。 || $\\overset{しけん}{試験}$に$\\overset{しっぱい}{失敗}$して$\\overset{こうかい}{後悔}$した。/考试失败了感到后悔。"
},
{
  word: "指導",
  kana: "しどう",
  type: "名・サ变动词する他",
  meaning: "指导。",
  example: "$\\overset{せんせい}{先生}$の$\\overset{しどう}{指導}$のおかげで$\\overset{ごうかく}{合格}$できた。/多亏了老师的指导才得以合格。 || $\\overset{こうはい}{後輩}$を$\\overset{ていねい}{丁寧}$に$\\overset{しどう}{指導}$する。/耐心地指导后辈。"
},
{
  word: "十分",
  kana: "じゅうぶん",
  type: "名・形动・副词",
  meaning: "十分，充分。",
  example: "$\\overset{じゅうぶん}{十分}$な$\\overset{すいみん}{睡眠}$をとる。/保持充足的睡眠。 || その$\\overset{せつめい}{説明}$で$\\overset{じゅうぶん}{十分}$わかりました。/那个说明已经十分明白了。"
},
{
  word: "主人",
  kana: "しゅじん",
  type: "名词",
  meaning: "主人，丈夫。",
  example: "この$\\overset{いえ}{家}$の$\\overset{しゅじん}{主人}$は$\\overset{しょうじき}{正直}$な$\\overset{ひと}{人}$だ。/这家的主人是个诚实的人。"
},
{
  word: "生涯",
  kana: "しょうがい",
  type: "名词",
  meaning: "生涯，一生。",
  example: "$\\overset{しょうがい}{生涯}$を$\\overset{きょういく}{教育}$の$\\overset{しごと}{仕事}$に$\\overset{ささ}{捧}$げる。/将一生奉献给教育工作。"
},
{
  word: "正直",
  kana: "しょうじき",
  type: "名・形动",
  meaning: "诚实，老实。",
  example: "$\\overset{かれ}{彼}$は$\\overset{しょうじき}{正直}$が$\\overset{と}{取}$り$\\overset{え}{柄}$だ。/诚实是他的优点。 || $\\overset{しょうじき}{正直}$な$\\overset{いけん}{意見}$を$\\overset{き}{聞}$かせてください。/请让我听听你诚实的意见。"
},
{
  word: "冗談",
  kana: "じょうだん",
  type: "名词",
  meaning: "玩笑。",
  example: "$\\overset{じょうだん}{冗談}$を$\\overset{い}{言}$って$\\overset{ゆうじん}{友人}$を$\\overset{わら}{笑}$わせる。/开玩笑逗朋友笑。"
},
{
  word: "人口",
  kana: "じんこう",
  type: "名词",
  meaning: "人口。",
  example: "$\\overset{にほん}{日本}$の$\\overset{じんこう}{人口}$は$\\overset{げんしょう}{減少}$している。/日本的人口正在减少。"
},
{
  word: "人生",
  kana: "じんせい",
  type: "名词",
  meaning: "人生。",
  example: "$\\overset{かれ}{彼}$の$\\overset{じんせい}{人生}$は$\\overset{せいこう}{成功}$と$\\overset{しっぱい}{失敗}$の$\\overset{れんぞく}{連続}$だった。/他的人生是成功和失败的连续。"
},
{
  word: "随分",
  kana: "ずいぶん",
  type: "形动・副词",
  meaning: "相当，非常。",
  example: "$\\overset{ずいぶん}{随分}$な$\\overset{い}{言}$い$\\overset{かた}{方}$をする。/说法太过分了。 || $\\overset{きょう}{今日}$は$\\overset{ずいぶん}{随分}$と$\\overset{さむ}{寒}$いですね。/今天相当冷啊。"
},
{
  word: "成功",
  kana: "せいこう",
  type: "名・サ变动词する自",
  meaning: "成功。",
  example: "$\\overset{じっけん}{実験}$の$\\overset{せいこう}{成功}$を$\\overset{いの}{祈}$る。/祈求实验的成功。 || $\\overset{かれ}{彼}$はビジネスで$\\overset{おお}{大}$きく$\\overset{せいこう}{成功}$した。/他在商业上取得了巨大的成功。"
},
{
  word: "政治",
  kana: "せいじ",
  type: "名词",
  meaning: "政治。",
  example: "$\\overset{せいじ}{政治}$のニュースに$\\overset{ちゅうもく}{注目}$する。/关注政治的新闻。"
},
{
  word: "生存",
  kana: "せいぞん",
  type: "名・サ变动词",
  meaning: "生存。",
  example: "$\\overset{せいぞん}{生存}$の$\\overset{きょうそう}{競争}$が$\\overset{はげ}{激}$しい。/生存竞争很激烈。 || $\\overset{だいしんさい}{大震災}$から$\\overset{ぶじ}{無事}$に$\\overset{せいぞん}{生存}$した。/从大地震中平安生存了下来。"
},
{
  word: "生態",
  kana: "せいたい",
  type: "名词",
  meaning: "生态。",
  example: "$\\overset{どうぶつ}{動物}$の$\\overset{ふしぎ}{不思議}$な$\\overset{せいたい}{生態}$を$\\overset{けんきゅう}{研究}$する。/研究动物不可思议的生态。"
},
{
  word: "贅沢",
  kana: "ぜいたく",
  type: "名・形动・サ变动词",
  meaning: "奢侈，奢华。",
  example: "$\\overset{ぜいたく}{贅沢}$は$\\overset{てき}{敵}$だ。/奢侈是大敌。 || $\\overset{かれ}{彼}$は$\\overset{ぜいたく}{贅沢}$な$\\overset{せいかつ}{生活}$を$\\overset{おく}{送}$っている。/他过着奢侈的生活。 || たまには$\\overset{ぜいたく}{贅沢}$して$\\overset{おい}{美味}$しいものを$\\overset{た}{食}$べよう。/偶尔奢侈一下吃点好吃的吧。"
},
{
  word: "成長",
  kana: "せいちょう",
  type: "名・サ变动词する自",
  meaning: "成长。",
  example: "$\\overset{こ}{子}$どもの$\\overset{せいちょう}{成長}$は$\\overset{はや}{早}$い。/孩子的成长很快。 || $\\overset{さまざま}{様々}$な$\\overset{けいけん}{経験}$を$\\overset{とお}{通}$じて$\\overset{せいちょう}{成長}$する。/通过各种经验成长。"
},
{
  word: "生物",
  kana: "せいぶつ",
  type: "名词",
  meaning: "生物。",
  example: "$\\overset{うみ}{海}$には$\\overset{おお}{多}$くの$\\overset{せいぶつ}{生物}$が$\\overset{せいぞん}{生存}$している。/海里生存着许多生物。"
},
{
  word: "先祖",
  kana: "せんぞ",
  type: "名词",
  meaning: "祖先。",
  example: "$\\overset{せんぞ}{先祖}$のお$\\overset{はか}{墓}$$\\overset{まい}{参}$りに$\\overset{い}{行}$く。/去给祖先扫墓。"
},
{
  word: "尊敬",
  kana: "そんけい",
  type: "名・サ变动词する他",
  meaning: "尊敬。",
  example: "$\\overset{せんぱい}{先輩}$への$\\overset{そんけい}{尊敬}$を$\\overset{わす}{忘}$れない。/不忘对前辈的尊敬。 || $\\overset{たにん}{他人}$の$\\overset{いけん}{意見}$を$\\overset{そんけい}{尊敬}$して$\\overset{き}{聞}$く。/尊敬地听取别人的意见。"
},
{
  word: "他人",
  kana: "たにん",
  type: "名词",
  meaning: "他人，别人。",
  example: "$\\overset{たにん}{他人}$に$\\overset{めいわく}{迷惑}$をかけてはいけない。/不能给别人添麻烦。"
},
{
  word: "注文",
  kana: "ちゅうもん",
  type: "名・サ变动词する他",
  meaning: "订购，点菜。",
  example: "$\\overset{りょうり}{料理}$の$\\overset{ちゅうもん}{注文}$をお$\\overset{ねが}{願}$いします。/麻烦点一下菜。 || インターネットで$\\overset{ほん}{本}$を$\\overset{ちゅうもん}{注文}$する。/在网上订购书。"
},
{
  word: "丁寧",
  kana: "ていねい",
  type: "名・形动",
  meaning: "礼貌，恭敬；仔细。",
  example: "$\\overset{かれ}{彼}$の$\\overset{ことば}{言葉}$$\\overset{づか}{遣}$いは$\\overset{ていねい}{丁寧}$だ。/他的遣词造句很礼貌。 || $\\overset{どうぐ}{道具}$を$\\overset{ていねい}{丁寧}$に$\\overset{あつか}{扱}$う。/仔细地对待（使用）工具。"
},
{
  word: "特徴",
  kana: "とくちょう",
  type: "名词",
  meaning: "特征。",
  example: "この$\\overset{どうぶつ}{動物}$の$\\overset{とくちょう}{特徴}$を$\\overset{せつめい}{説明}$してください。/请说明这种动物的特征。"
},
{
  word: "納得",
  kana: "なっとく",
  type: "名・サ变动词する自他",
  meaning: "理解，同意，心服。",
  example: "$\\overset{かれ}{彼}$の$\\overset{せつめい}{説明}$には$\\overset{なっとく}{納得}$がいかない。/对他的说明无法心服口服。 || $\\overset{じゅうぶん}{十分}$に$\\overset{はな}{話}$し$\\overset{あ}{合}$って$\\overset{なっとく}{納得}$する。/充分讨论并达成共识（理解）。"
},
{
  word: "人気",
  kana: "にんき",
  type: "名词",
  meaning: "受欢迎，人气。",
  example: "あの$\\overset{まんが}{漫画}$は$\\overset{がくせい}{学生}$の$\\overset{あいだ}{間}$で$\\overset{にんき}{人気}$がある。/那部漫画在学生中间很受欢迎。"
},
{
  word: "比較",
  kana: "ひかく",
  type: "名・サ变动词する他",
  meaning: "比较。",
  example: "$\\overset{ねだん}{値段}$の$\\overset{ひかく}{比較}$をしてから$\\overset{か}{買}$う。/比较价格之后再买。 || $\\overset{ふた}{二}$つの$\\overset{ぶんしょう}{文章}$を$\\overset{ひかく}{比較}$して$\\overset{ぶんせき}{分析}$する。/比较两篇文章并进行分析。"
},
{
  word: "不思議",
  kana: "ふしぎ",
  type: "名・形动",
  meaning: "不可思议，奇怪。",
  example: "$\\overset{うちゅう}{宇宙}$の$\\overset{ふしぎ}{不思議}$を$\\overset{けんきゅう}{研究}$する。/研究宇宙的不可思议之处。 || $\\overset{ふしぎ}{不思議}$な$\\overset{できごと}{出来事}$が$\\overset{お}{起}$きた。/发生了不可思议的事情。"
},
{
  word: "部分",
  kana: "ぶぶん",
  type: "名词",
  meaning: "部分。",
  example: "$\\overset{ろんぶん}{論文}$のこの$\\overset{ぶぶん}{部分}$を$\\overset{なお}{直}$してください。/请修改论文的这个部分。"
},
{
  word: "文化祭",
  kana: "ぶんかさい",
  type: "名词",
  meaning: "校园文化节。",
  example: "$\\overset{ぶんかさい}{文化祭}$で$\\overset{げき}{劇}$を$\\overset{じょうえん}{上演}$する。/在文化节上上演话剧。"
},
{
  word: "分析",
  kana: "ぶんせき",
  type: "名・サ变动词する他",
  meaning: "分析。",
  example: "データの$\\overset{おお}{大}$きな$\\overset{ぶんせき}{分析}$が$\\overset{かんりょう}{完了}$した。/数据的大型分析完成了。 || $\\overset{しっぱい}{失敗}$の$\\overset{げんいん}{原因}$を$\\overset{せいかく}{正確}$に$\\overset{ぶんせき}{分析}$する。/准确地分析失败的原因。"
},
{
  word: "分類",
  kana: "ぶんるい",
  type: "名・サ变动词する他",
  meaning: "分类。",
  example: "$\\overset{せいぶつ}{生物}$の$\\overset{ぶんるい}{分類}$を$\\overset{おぼ}{覚}$える。/记住生物的分类。 || $\\overset{ほん}{本}$を$\\overset{ないよう}{内容}$によって$\\overset{ぶんるい}{分類}$する。/根据内容将书进行分类。"
},
{
  word: "崩壊",
  kana: "ほうかい",
  type: "名・サ变动词する自",
  meaning: "崩溃，瓦解，倒塌。",
  example: "$\\overset{ふる}{古}$い$\\overset{せいど}{制度}$の$\\overset{ほうかい}{崩壊}$。/旧制度的瓦解。 || $\\overset{だいしんさい}{大震災}$で$\\overset{たてもの}{建物}$が$\\overset{ほうかい}{崩壊}$した。/因大地震建筑物倒塌了。"
},
{
  word: "身分",
  kana: "みぶん",
  type: "名词",
  meaning: "身份。",
  example: "$\\overset{みぶん}{身分}$を$\\overset{しょうめい}{証明}$する$\\overset{しょるい}{書類}$を$\\overset{だ}{出}$す。/出示证明身份的文件。"
},
{
  word: "文字",
  kana: "もじ",
  type: "名词",
  meaning: "文字。",
  example: "$\\overset{きれい}{綺麗}$な$\\overset{もじ}{文字}$で$\\overset{さくぶん}{作文}$を$\\overset{か}{書}$く。/用漂亮的文字写作文。"
},
{
  word: "老人",
  kana: "ろうじん",
  type: "名词",
  meaning: "老人。",
  example: "$\\overset{せき}{席}$を$\\overset{ろうじん}{老人}$や$\\overset{びょうにん}{病人}$に$\\overset{ゆず}{譲}$る。/把座位让给老人和病人。"
},
{
  word: "位",
  kana: "くらい",
  type: "副助词・名词",
  meaning: "大概，大约；程度。",
  example: "$\\overset{えき}{駅}$まで$\\overset{じゅっぷん}{十分}$$\\overset{くらい}{位}$かかります。/到车站大约需要十分钟。 || $\\overset{かれ}{彼}$と$\\overset{おな}{同}$じ$\\overset{くらい}{位}$の$\\overset{せ}{背}$の$\\overset{たか}{高}$さだ。/和他一样高的程度。"
},
{
  word: "格好",
  kana: "かっこう",
  type: "名词",
  meaning: "打扮，装束；姿态。",
  example: "$\\overset{はで}{派手}$な$\\overset{かっこう}{格好}$で$\\overset{ぶんかさい}{文化祭}$に$\\overset{さんか}{参加}$する。/以花哨的打扮参加文化节。"
},
{
  word: "機嫌",
  kana: "きげん",
  type: "名词",
  meaning: "心情，情绪。",
  example: "$\\overset{かれ}{彼}$は$\\overset{きょう}{今日}$とても$\\overset{きげん}{機嫌}$が$\\overset{よ}{良}$い。/他今天心情非常好。"
},
{
  word: "今回",
  kana: "こんかい",
  type: "名・副词",
  meaning: "这次。",
  example: "$\\overset{こんかい}{今回}$のテストは$\\overset{せいせき}{成績}$が$\\overset{よ}{良}$かった。/这次的考试成绩很好。"
},
{
  word: "混雑",
  kana: "こんざつ",
  type: "名・サ变动词",
  meaning: "拥挤，混乱。",
  example: "$\\overset{みち}{道}$の$\\overset{こんざつ}{混雑}$を$\\overset{さ}{避}$けて$\\overset{ある}{歩}$く。/避开道路的拥挤行走。 || $\\overset{あさ}{朝}$の$\\overset{でんしゃ}{電車}$はいつも$\\overset{こんざつ}{混雑}$している。/早上的电车总是很拥挤。"
},
{
  word: "詩",
  kana: "し",
  type: "名词",
  meaning: "诗歌。",
  example: "$\\overset{ゆうめい}{有名}$な$\\overset{し}{詩}$の$\\overset{ぶんしょう}{文章}$を$\\overset{よ}{読}$む。/读著名的诗歌文章。"
},
{
  word: "紹介",
  kana: "しょうかい",
  type: "名・サ变动词する他",
  meaning: "介绍。",
  example: "$\\overset{じこ}{自己}$$\\overset{しょうかい}{紹介}$をお$\\overset{ねが}{願}$いします。/麻烦自我介绍一下。 || $\\overset{ゆうじん}{友人}$に$\\overset{どうきゅうせい}{同級生}$を$\\overset{しょうかい}{紹介}$する。/向友人介绍同班同学。"
},
{
  word: "人物",
  kana: "じんぶつ",
  type: "名词",
  meaning: "人物。",
  example: "$\\overset{れきし}{歴史}$$\\overset{じょう}{上}$の$\\overset{じゅうよう}{重要}$な$\\overset{じんぶつ}{人物}$について$\\overset{まな}{学}$ぶ。/学习历史上的重要人物。"
},
{
  word: "人類",
  kana: "じんるい",
  type: "名词",
  meaning: "人类。",
  example: "$\\overset{じんるい}{人類}$の$\\overset{へいわ}{平和}$と$\\overset{こうふく}{幸福}$を$\\overset{いの}{祈}$る。/祈求人类的和平与幸福。"
},
{
  word: "寿司",
  kana: "すし",
  type: "名词",
  meaning: "寿司。",
  example: "$\\overset{ばん}{晩}$ごはんに$\\overset{てんぷら}{天婦羅}$と$\\overset{すし}{寿司}$を$\\overset{た}{食}$べた。/晚饭吃了天妇罗和寿司。"
},
{
  word: "制服",
  kana: "せいふく",
  type: "名词",
  meaning: "制服，校服。",
  example: "$\\overset{ちゅうがくせい}{中学生}$になって$\\overset{あたら}{新}$しい$\\overset{せいふく}{制服}$を$\\overset{き}{着}$る。/成为初中生后穿上了新校服。"
},
{
  word: "生命",
  kana: "せいめい",
  type: "名词",
  meaning: "生命。",
  example: "$\\overset{せいめい}{生命}$の$\\overset{ふしぎ}{不思議}$を$\\overset{けんきゅう}{研究}$する。/研究生命的不可思议。"
},
{
  word: "積極的",
  kana: "せっきょくてき",
  type: "形动",
  meaning: "积极。",
  example: "$\\overset{じゅぎょう}{授業}$で$\\overset{せっきょくてき}{積極的}$に$\\overset{はつげん}{発言}$する。/在课上积极发言。"
},
{
  word: "天婦羅",
  kana: "てんぷら",
  type: "名词",
  meaning: "天妇罗（油炸食品）。",
  example: "この$\\overset{みせ}{店}$の$\\overset{てんぷら}{天婦羅}$は$\\overset{おい}{美味}$しい。/这家店的天妇罗很好吃。"
},
{
  word: "同級生",
  kana: "どうきゅうせい",
  type: "名词",
  meaning: "同班同学，同年级同学。",
  example: "$\\overset{どうきゅうせい}{同級生}$と$\\overset{いっしょ}{一緒}$に$\\overset{しゅくだい}{宿題}$をする。/和同班同学一起做作业。"
},
{
  word: "半",
  kana: "はん",
  type: "名词",
  meaning: "一半；半（时间）。",
  example: "$\\overset{はちじ}{八時}$$\\overset{はん}{半}$に$\\overset{がっこう}{学校}$へ$\\overset{い}{行}$く。/八点半去学校。"
},
{
  word: "病人",
  kana: "びょうにん",
  type: "名词",
  meaning: "病人。",
  example: "$\\overset{かんごし}{看護師}$が$\\overset{びょうにん}{病人}$の$\\overset{せわ}{世話}$をする。/护士照顾病人。"
},
{
  word: "文",
  kana: "ぶん",
  type: "名词",
  meaning: "句子，文章。",
  example: "$\\overset{ぶんぽう}{文法}$に$\\overset{ちゅうい}{注意}$して$\\overset{ぶん}{文}$を$\\overset{つく}{作}$る。/注意语法来造句。"
},
{
  word: "分",
  kana: "ふん",
  type: "量词・名词",
  meaning: "分钟；份儿，部分。",
  example: "ここから$\\overset{えき}{駅}$まで$\\overset{ご}{五}$$\\overset{ふん}{分}$くらいかかる。/从这里到车站大概花五分钟。"
},
{
  word: "文科系",
  kana: "ぶんかけい",
  type: "名词",
  meaning: "文科。",
  example: "$\\overset{かのじょ}{彼女}$は$\\overset{ぶんかけい}{文科系}$の$\\overset{だいがく}{大学}$に$\\overset{しんがく}{進学}$した。/她升入了文科大学。"
},
{
  word: "文通",
  kana: "ぶんつう",
  type: "名・サ变动词する自",
  meaning: "通信，写信联系。",
  example: "$\\overset{がいこく}{外国}$の$\\overset{ゆうじん}{友人}$と$\\overset{ぶんつう}{文通}$を$\\overset{はじ}{始}$めた。/开始和外国的友人通信。 || $\\overset{むかし}{昔}$の$\\overset{どうきゅうせい}{同級生}$と$\\overset{ぶんつう}{文通}$している。/正在和以前的同班同学通信。"
},
{
  word: "文法",
  kana: "ぶんぽう",
  type: "名词",
  meaning: "语法。",
  example: "$\\overset{えいご}{英語}$の$\\overset{ぶんぽう}{文法}$は$\\overset{むずか}{難}$しい。/英语的语法很难。"
},
{
  word: "友人",
  kana: "ゆうじん",
  type: "名词",
  meaning: "友人，朋友。",
  example: "$\\overset{した}{親}$しい$\\overset{ゆうじん}{友人}$と$\\overset{りょこう}{旅行}$に$\\overset{で}{出}$かける。/和亲近的朋友出门旅行。"
},
{
  word: "論文",
  kana: "ろんぶん",
  type: "名词",
  meaning: "论文。",
  example: "$\\overset{けんきゅう}{研究}$の$\\overset{けっか}{結果}$を$\\overset{ろんぶん}{論文}$にまとめる。/将研究结果总结成论文。"
},
{
  word: "寄付",
  kana: "きふ",
  type: "名・サ变动词する他",
  meaning: "捐款，捐赠。",
  example: "$\\overset{としょ}{図書}$$\\overset{かん}{館}$へ$\\overset{ほん}{本}$の$\\overset{きふ}{寄付}$をお$\\overset{ねが}{願}$いする。/请求向图书馆捐赠书籍。 || $\\overset{しょうがくきん}{奨学金}$のために$\\overset{すこ}{少}$しお$\\overset{かね}{金}$を$\\overset{きふ}{寄付}$する。/为了奖学金捐一点钱。"
},
{
  word: "高速",
  kana: "こうそく",
  type: "名词",
  meaning: "高速。",
  example: "$\\overset{こうそく}{高速}$$\\overset{どうろ}{道路}$を$\\overset{とお}{通}$って$\\overset{いそ}{急}$いで$\\overset{い}{行}$く。/穿过高速公路急忙赶去。"
},
{
  word: "時差",
  kana: "じさ",
  type: "名词",
  meaning: "时差。",
  example: "$\\overset{にほん}{日本}$と$\\overset{ちゅうごく}{中国}$には$\\overset{いち}{一}$$\\overset{じかん}{時間}$の$\\overset{じさ}{時差}$がある。/日本和中国有一小时的时差。"
},
{
  word: "奨学金",
  kana: "しょうがくきん",
  type: "名词",
  meaning: "奖学金。",
  example: "$\\overset{しょうがくきん}{奨学金}$をもらって$\\overset{だいがく}{大学}$で$\\overset{べんきょう}{勉強}$する。/拿奖学金在大学学习。"
},
{
  word: "選択",
  kana: "せんたく",
  type: "名・サ变动词する他",
  meaning: "选择。",
  example: "$\\overset{じんせい}{人生}$には$\\overset{おお}{多}$くの$\\overset{せんたく}{選択}$がある。/人生有很多选择。 || $\\overset{ぶんかけい}{文科系}$の$\\overset{かもく}{科目}$を$\\overset{せんたく}{選択}$する。/选择文科科目。"
},
{
  word: "暴露",
  kana: "ばくろ",
  type: "名・サ变动词する他",
  meaning: "暴露，揭露。",
  example: "$\\overset{ひみつ}{秘密}$の$\\overset{ばくろ}{暴露}$に$\\overset{おどろ}{驚}$いた。/对秘密的揭露感到惊讶。 || $\\overset{かれ}{彼}$の$\\overset{うそ}{嘘}$をみんなの$\\overset{まえ}{前}$で$\\overset{ばくろ}{暴露}$する。/在大家面前揭穿他的谎言。"
},
{
  word: "部分的",
  kana: "ぶぶんてき",
  type: "形动",
  meaning: "部分的，局部的。",
  example: "$\\overset{ぶぶんてき}{部分的}$に$\\overset{なお}{直}$せば、$\\overset{かんぜん}{完全}$な$\\overset{ぶんしょう}{文章}$になる。/只要局部修改一下，就会变成完美的文章。"
},
{
  word: "一",
  kana: "いち",
  type: "名词",
  meaning: "一。",
  example: "$\\overset{いちばん}{一番}$の$\\overset{せいせき}{成績}$を$\\overset{と}{取}$るために、$\\overset{いち}{一}$から$\\overset{べんきょう}{勉強}$する。/为了取得第一的成绩，从零（一）开始学习。"
},
{
  word: "一番",
  kana: "いちばん",
  type: "名・副词",
  meaning: "第一；最。",
  example: "$\\overset{かれ}{彼}$はクラスで$\\overset{いちばん}{一番}$だ。/他是班里的第一名。 || $\\overset{いっしょ}{一緒}$にいる$\\overset{とき}{時}$が$\\overset{いちばん}{一番}$$\\overset{たの}{楽}$しい。/在一起的时候是最开心的。"
},
{
  word: "一緒",
  kana: "いっしょ",
  type: "名・副词",
  meaning: "一起，相同。",
  example: "$\\overset{わたし}{私}$の$\\overset{いけん}{意見}$は$\\overset{かれ}{彼}$と$\\overset{いっしょ}{一緒}$です。/我的意见和他一样。 || お$\\overset{きゃく}{客}$さんと$\\overset{いっしょ}{一緒}$にお$\\overset{ちゃ}{茶}$を$\\overset{の}{飲}$む。/和客人一起喝茶。"
},
{
  word: "一体",
  kana: "いったい",
  type: "名・副词",
  meaning: "一体，同心协力；到底，究竟（表疑问）。",
  example: "クラスが$\\overset{いったい}{一体}$となって$\\overset{どりょく}{努力}$する。/班级团结一致地努力。 || $\\overset{いったい}{一体}$、$\\overset{げんかん}{玄関}$で$\\overset{なに}{何}$が$\\overset{お}{起}$きたのですか。/玄关到底发生了什么事？"
},
{
  word: "一杯",
  kana: "いっぱい",
  type: "名・副词",
  meaning: "一杯；满满的，很多。",
  example: "$\\overset{ぎゅうにゅう}{牛乳}$をもう$\\overset{いっぱい}{一杯}$ください。/请再给我一杯牛奶。 || お$\\overset{なか}{腹}$が$\\overset{いっぱい}{一杯}$で、もう$\\overset{た}{食}$べられない。/肚子吃得饱饱的，吃不下了。"
},
{
  word: "お客",
  kana: "おきゃく",
  type: "名词",
  meaning: "客人。",
  example: "$\\overset{きんちょう}{緊張}$しながら、$\\overset{げんかん}{玄関}$でお$\\overset{きゃく}{客}$を$\\overset{むか}{迎}$える。/一边紧张着，一边在玄关迎接客人。"
},
{
  word: "九",
  kana: "きゅう",
  type: "名词",
  meaning: "九。",
  example: "$\\overset{きゅう}{九}$$\\overset{にん}{人}$のお$\\overset{きゃく}{客}$さんに$\\overset{いっぱい}{一杯}$ずつ$\\overset{ぎゅうにゅう}{牛乳}$を$\\overset{だ}{出}$す。/给九位客人每人端上一杯牛奶。"
},
{
  word: "給食",
  kana: "きゅうしょく",
  type: "名・サ变动词",
  meaning: "学校的配餐，供给伙食。",
  example: "$\\overset{きょう}{今日}$の$\\overset{きゅうしょく}{給食}$には$\\overset{ぎゅうにゅう}{牛乳}$が$\\overset{で}{出}$る。/今天的学校配餐有牛奶。 || $\\overset{ひさいち}{被災地}$で$\\overset{きゅうしょく}{給食}$する。/在受灾区提供伙食。"
},
{
  word: "牛乳",
  kana: "ぎゅうにゅう",
  type: "名词",
  meaning: "牛奶。",
  example: "$\\overset{まいあさ}{毎朝}$の$\\overset{きゅうしょく}{給食}$で$\\overset{ぎゅうにゅう}{牛乳}$を$\\overset{の}{飲}$む。/在每天早晨的配餐中喝牛奶。"
},
{
  word: "緊張",
  kana: "きんちょう",
  type: "名・サ变动词する自",
  meaning: "紧张。",
  example: "$\\overset{きんちょう}{緊張}$のあまり、$\\overset{ことば}{言葉}$が$\\overset{で}{出}$なかった。/过度紧张以至于说不出话来。 || $\\overset{めんせつ}{面接}$の$\\overset{まえ}{前}$はいつも$\\overset{きんちょう}{緊張}$する。/面试前总是很紧张。"
},
{
  word: "工夫",
  kana: "くふう",
  type: "名・サ变动词する他",
  meaning: "想办法，下功夫。",
  example: "$\\overset{りょうり}{料理}$の$\\overset{くふう}{工夫}$が$\\overset{た}{足}$りない。/在做菜上的心思不够。 || $\\overset{しゅくだい}{宿題}$を$\\overset{はや}{早}$く$\\overset{お}{終}$わらせるために$\\overset{くふう}{工夫}$する。/为了早点完成作业而想办法。"
},
{
  word: "玄関",
  kana: "げんかん",
  type: "名词",
  meaning: "玄关，正门入口。",
  example: "$\\overset{げんかん}{玄関}$で$\\overset{くつ}{靴}$を$\\overset{ぬ}{脱}$いでから$\\overset{あ}{上}$がってください。/请在玄关脱鞋后再上来。"
},
{
  word: "五",
  kana: "ご",
  type: "名词",
  meaning: "五。",
  example: "$\\overset{げんかん}{玄関}$に$\\overset{ご}{五}$$\\overset{そく}{足}$の$\\overset{くつ}{靴}$がある。/玄关有五双鞋。"
},
{
  word: "三",
  kana: "さん",
  type: "名词",
  meaning: "三。",
  example: "$\\overset{けいかく}{計画}$の$\\overset{じつげん}{実現}$に$\\overset{さん}{三}$$\\overset{ねん}{年}$かかる。/计划的实现需要三年。"
},
{
  word: "実現",
  kana: "じつげん",
  type: "名・サ变动词する自他",
  meaning: "实现。",
  example: "$\\overset{ゆめ}{夢}$の$\\overset{じつげん}{実現}$に$\\overset{む}{向}$かって$\\overset{どりょく}{努力}$する。/朝着梦想的实现而努力。 || $\\overset{かれ}{彼}$はついに$\\overset{ながねん}{長年}$の$\\overset{ゆめ}{夢}$を$\\overset{じつげん}{実現}$した。/他终于实现了多年的梦想。"
},
{
  word: "十",
  kana: "じゅう",
  type: "名词",
  meaning: "十。",
  example: "$\\overset{じゅう}{十}$$\\overset{じ}{時}$までに$\\overset{しゅくだい}{宿題}$を$\\overset{お}{終}$わらせる。/在十点之前完成作业。"
},
{
  word: "宿題",
  kana: "しゅくだい",
  type: "名词",
  meaning: "作业。",
  example: "$\\overset{しょくどう}{食堂}$でご$\\overset{はん}{飯}$を$\\overset{た}{食}$べた$\\overset{あと}{後}$、$\\overset{しゅくだい}{宿題}$をする。/在食堂吃完饭后做作业。"
},
{
  word: "食堂",
  kana: "しょくどう",
  type: "名词",
  meaning: "食堂。",
  example: "$\\overset{せんしゅう}{先週}$、$\\overset{がっこう}{学校}$の$\\overset{しょくどう}{食堂}$で$\\overset{しょっき}{食器}$を$\\overset{あら}{洗}$った。/上周在学校的食堂洗了餐具。"
},
{
  word: "食器",
  kana: "しょっき",
  type: "名词",
  meaning: "餐具。",
  example: "$\\overset{ゆうしょく}{夕食}$の$\\overset{あと}{後}$で$\\overset{しょっき}{食器}$を$\\overset{かたづ}{片付}$ける。/晚饭后收拾餐具。"
},
{
  word: "先週",
  kana: "せんしゅう",
  type: "名词",
  meaning: "上周。",
  example: "$\\overset{せんしゅう}{先週}$の$\\overset{たいいく}{体育}$の$\\overset{じゅぎょう}{授業}$で$\\overset{たっきゅう}{卓球}$をした。/上周的体育课上打了乒乓球。"
},
{
  word: "体育",
  kana: "たいいく",
  type: "名词",
  meaning: "体育。",
  example: "$\\overset{たいいく}{体育}$の$\\overset{じかん}{時間}$に$\\overset{たっきゅう}{卓球}$の$\\overset{れんしゅう}{練習}$をする。/在体育课时间练习乒乓球。"
},
{
  word: "卓球",
  kana: "たっきゅう",
  type: "名・サ变动词",
  meaning: "乒乓球。",
  example: "$\\overset{かれ}{彼}$は$\\overset{たっきゅう}{卓球}$が$\\overset{とくい}{得意}$だ。/他擅长打乒乓球。 || $\\overset{たいいくかん}{体育館}$で$\\overset{ともだち}{友達}$と$\\overset{たっきゅう}{卓球}$する。/在体育馆和朋友打乒乓球。"
},
{
  word: "七",
  kana: "なな",
  type: "名词",
  meaning: "七。",
  example: "$\\overset{まいにち}{毎日}$$\\overset{なな}{七}$$\\overset{じ}{時}$に$\\overset{お}{起}$きて$\\overset{にっき}{日記}$を$\\overset{か}{書}$く。/每天七点起床写日记。"
},
{
  word: "二",
  kana: "に",
  type: "名词",
  meaning: "二。",
  example: "$\\overset{にほん}{日本}$に$\\overset{に}{二}$$\\overset{ねん}{年}$$\\overset{かん}{間}$$\\overset{す}{住}$んでいた。/在日本住了两年。"
},
{
  word: "日記",
  kana: "にっき",
  type: "名词",
  meaning: "日记。",
  example: "$\\overset{まいにち}{毎日}$の$\\overset{できごと}{出来事}$をパソコンで$\\overset{にっき}{日記}$に$\\overset{にゅうりょく}{入力}$する。/把每天发生的事情用电脑输入日记里。"
},
{
  word: "日本",
  kana: "にほん",
  type: "名词",
  meaning: "日本。",
  example: "$\\overset{にほん}{日本}$の$\\overset{いしょくじゅう}{衣食住}$について$\\overset{しら}{調}$べる。/调查关于日本的衣食住行。"
},
{
  word: "入力",
  kana: "にゅうりょく",
  type: "名・サ变动词",
  meaning: "输入。",
  example: "データの$\\overset{たいりょう}{大量}$な$\\overset{にゅうりょく}{入力}$を$\\overset{まか}{任}$される。/被委任进行大量数据的输入。 || $\\overset{かれ}{彼}$の$\\overset{はな}{話}$を$\\overset{き}{聞}$きながらパソコンに$\\overset{にゅうりょく}{入力}$する。/一边听他说话一边输入电脑。"
},
{
  word: "八",
  kana: "はち",
  type: "名词",
  meaning: "八。",
  example: "$\\overset{ゆうしょく}{夕食}$は$\\overset{はち}{八}$$\\overset{じ}{時}$に$\\overset{た}{食}$べます。/晚饭在八点吃。"
},
{
  word: "話",
  kana: "はなし",
  type: "名词",
  meaning: "话，故事。",
  example: "$\\overset{まいにち}{毎日}$、$\\overset{おもしろ}{面白}$い$\\overset{はなし}{話}$を$\\overset{き}{聞}$かせてくれる。/每天都讲有趣的故事给我听。"
},
{
  word: "毎日",
  kana: "まいにち",
  type: "名・副词",
  meaning: "每天。",
  example: "$\\overset{まいにち}{毎日}$の$\\overset{せいかつ}{生活}$が$\\overset{たの}{楽}$しい。/每天的生活都很快乐。 || $\\overset{まいにち}{毎日}$$\\overset{はち}{八}$$\\overset{じ}{時}$に$\\overset{ゆうしょく}{夕食}$を$\\overset{た}{食}$べる。/每天八点吃晚饭。"
},
{
  word: "万",
  kana: "まん",
  type: "名词",
  meaning: "万。",
  example: "この$\\overset{もんだい}{問題}$を$\\overset{かいけつ}{解決}$するのに$\\overset{いちまん}{一万}$$\\overset{えん}{円}$かかった。/解决这个问题花了一万日元。"
},
{
  word: "蜜柑",
  kana: "みかん",
  type: "名词",
  meaning: "橘子，蜜柑。",
  example: "$\\overset{ゆうしょく}{夕食}$の$\\overset{あと}{後}$に$\\overset{みかん}{蜜柑}$を$\\overset{た}{食}$べる。/晚饭后吃橘子。"
},
{
  word: "味噌汁",
  kana: "みそしる",
  type: "名词",
  meaning: "味噌汤。",
  example: "$\\overset{まいにち}{毎日}$の$\\overset{ゆうしょく}{夕食}$に$\\overset{あたた}{温}$かい$\\overset{みそしる}{味噌汁}$を$\\overset{の}{飲}$む。/每天晚饭喝热乎的味噌汤。"
},
{
  word: "問題",
  kana: "もんだい",
  type: "名词",
  meaning: "问题。",
  example: "$\\overset{かんきょう}{環境}$の$\\overset{おせん}{汚染}$は$\\overset{しんこく}{深刻}$な$\\overset{もんだい}{問題}$だ。/环境污染是严重的问题。"
},
{
  word: "夕食",
  kana: "ゆうしょく",
  type: "名・サ变动词",
  meaning: "晚饭。",
  example: "$\\overset{かぞく}{家族}$と$\\overset{いっしょ}{一緒}$に$\\overset{ゆうしょく}{夕食}$をとる。/和家人一起吃晚饭。 || $\\overset{そと}{外}$のレストランで$\\overset{ゆうしょく}{夕食}$する。/在外面的餐厅吃晚饭。"
},
{
  word: "四",
  kana: "よん",
  type: "名词",
  meaning: "四。",
  example: "$\\overset{よん}{四}$$\\overset{にん}{人}$で$\\overset{いっしょ}{一緒}$に$\\overset{かだい}{課題}$を$\\overset{かいけつ}{解決}$する。/四个人一起解决课题。"
},
{
  word: "六",
  kana: "ろく",
  type: "名词",
  meaning: "六。",
  example: "$\\overset{あさ}{朝}$$\\overset{ろく}{六}$$\\overset{じ}{時}$に$\\overset{お}{起}$きて$\\overset{えいよう}{栄養}$のある$\\overset{ちょうしょく}{朝食}$を$\\overset{つく}{作}$る。/早晨六点起床做有营养的早饭。"
},
{
  word: "衣食住",
  kana: "いしょくじゅう",
  type: "名词",
  meaning: "衣食住（生活的基本需要）。",
  example: "$\\overset{いっぱん}{一般}$の$\\overset{ひとびと}{人々}$の$\\overset{いしょくじゅう}{衣食住}$が$\\overset{かいぜん}{改善}$された。/一般人的衣食住行得到了改善。"
},
{
  word: "一層",
  kana: "いっそう",
  type: "副词",
  meaning: "更加，越发。",
  example: "$\\overset{えいよう}{栄養}$をとって、$\\overset{いっそう}{一層}$$\\overset{げんき}{元気}$になった。/补充了营养，变得更加精神了。"
},
{
  word: "一般",
  kana: "いっぱん",
  type: "名・形动",
  meaning: "一般，普遍。",
  example: "$\\overset{いっぱん}{一般}$の$\\overset{いけん}{意見}$を$\\overset{さんこう}{参考}$にする。/参考一般的意见。 || これはごく$\\overset{いっぱん}{一般}$な$\\overset{げんしょう}{現象}$だ。/这是极为普遍的现象。"
},
{
  word: "栄養",
  kana: "えいよう",
  type: "名词",
  meaning: "营养。",
  example: "$\\overset{しょくひん}{食品}$の$\\overset{えいよう}{栄養}$バランスを$\\overset{かんが}{考}$える。/考虑食品的营养均衡。"
},
{
  word: "汚染",
  kana: "おせん",
  type: "名・サ变动词する自他",
  meaning: "污染。",
  example: "$\\overset{かんきょう}{環境}$の$\\overset{おせん}{汚染}$が$\\overset{もんだい}{問題}$になっている。/环境的污染正在成为问题。 || $\\overset{かわ}{川}$が$\\overset{こうじょう}{工場}$の$\\overset{えきたい}{液体}$で$\\overset{おせん}{汚染}$される。/河流被工厂的液体污染。"
},
{
  word: "解決",
  kana: "かいけつ",
  type: "名・サ变动词する自他",
  meaning: "解决。",
  example: "$\\overset{もんだい}{問題}$の$\\overset{かいけつ}{解決}$に$\\overset{む}{向}$けて$\\overset{どりょく}{努力}$する。/朝着问题的解决而努力。 || みんなと$\\overset{きょうりょく}{協力}$して$\\overset{かだい}{課題}$を$\\overset{かいけつ}{解決}$する。/和大家合作解决课题。"
},
{
  word: "課題",
  kana: "かだい",
  type: "名词",
  meaning: "课题，任务。",
  example: "$\\overset{かんきょう}{環境}$の$\\overset{ほご}{保護}$は$\\overset{わたし}{私}$たちの$\\overset{じゅうよう}{重要}$な$\\overset{かだい}{課題}$だ。/环境的保护是我们重要的课题。"
},
{
  word: "環境",
  kana: "かんきょう",
  type: "名词",
  meaning: "环境。",
  example: "$\\overset{しぜん}{自然}$の$\\overset{かんきょう}{環境}$の$\\overset{はかい}{破壊}$を$\\overset{ふせ}{防}$ぐ。/防止自然环境的破坏。"
},
{
  word: "簡単",
  kana: "かんたん",
  type: "形动",
  meaning: "简单。",
  example: "$\\overset{きゅうじつ}{休日}$に$\\overset{かんたん}{簡単}$な$\\overset{りょうり}{料理}$を$\\overset{つく}{作}$る。/在休息日做简单的菜。"
},
{
  word: "休日",
  kana: "きゅうじつ",
  type: "名词",
  meaning: "休息日，假日。",
  example: "$\\overset{きゅうじつ}{休日}$には$\\overset{じぶん}{自分}$の$\\overset{きょうみ}{興味}$があることをする。/在休息日做自己感兴趣的事。"
},
{
  word: "興味",
  kana: "きょうみ",
  type: "名词",
  meaning: "兴趣。",
  example: "$\\overset{れきし}{歴史}$に$\\overset{つよ}{強}$い$\\overset{きょうみ}{興味}$を$\\overset{も}{持}$っている。/对历史抱有浓厚的兴趣。"
},
{
  word: "協力",
  kana: "きょうりょく",
  type: "名・サ变动词する自",
  meaning: "合作，协力。",
  example: "$\\overset{もんだい}{問題}$の$\\overset{かいけつ}{解決}$には$\\overset{みな}{皆}$の$\\overset{きょうりょく}{協力}$が$\\overset{ひつよう}{必要}$だ。/解决问题需要大家的合作。 || チーム$\\overset{ぜんたい}{全体}$で$\\overset{きょうりょく}{協力}$して$\\overset{くんれん}{訓練}$する。/整个队伍合作进行训练。"
},
{
  word: "訓練",
  kana: "くんれん",
  type: "名・サ变动词する他",
  meaning: "训练。",
  example: "$\\overset{きび}{厳}$しい$\\overset{くんれん}{訓練}$を$\\overset{の}{乗}$り$\\overset{こ}{越}$える。/克服严格的训练。 || $\\overset{さいがい}{災害}$に$\\overset{そな}{備}$えて$\\overset{ひなん}{避難}$を$\\overset{くんれん}{訓練}$する。/防备灾害进行避难训练。"
},
{
  word: "現実",
  kana: "げんじつ",
  type: "名词",
  meaning: "现实。",
  example: "$\\overset{りそう}{理想}$と$\\overset{げんじつ}{現実}$の$\\overset{さ}{差}$を$\\overset{じっかん}{実感}$する。/深切感受到理想与现实的差距。"
},
{
  word: "最初",
  kana: "さいしょ",
  type: "名词",
  meaning: "最初，开始。",
  example: "$\\overset{さいしょ}{最初}$の$\\overset{じっしゅう}{実習}$で$\\overset{しゅうちゅうりょく}{集中力}$を$\\overset{うしな}{失}$った。/在最初的实习中失去了注意力。"
},
{
  word: "実習",
  kana: "じっしゅう",
  type: "名・サ变动词する自他",
  meaning: "实习。",
  example: "$\\overset{こうじょう}{工場}$での$\\overset{じっしゅう}{実習}$が$\\overset{はじ}{始}$まる。/在工厂的实习开始了。 || $\\overset{がっこう}{学校}$で$\\overset{まな}{学}$んだことを$\\overset{げんば}{現場}$で$\\overset{じっしゅう}{実習}$する。/将在学校学到的东西在现场进行实习。"
},
{
  word: "集中力",
  kana: "しゅうちゅうりょく",
  type: "名词",
  meaning: "注意力，集中力。",
  example: "$\\overset{えいが}{映画}$の$\\overset{じょうえい}{上映}$$\\overset{ちゅう}{中}$は$\\overset{しゅうちゅうりょく}{集中力}$が$\\overset{つづ}{続}$いた。/在电影上映期间注意力一直很集中。"
},
{
  word: "上映",
  kana: "じょうえい",
  type: "名・サ变动词する他",
  meaning: "上映，放映。",
  example: "$\\overset{あたら}{新}$しい$\\overset{えいが}{映画}$の$\\overset{じょうえい}{上映}$を$\\overset{たの}{楽}$しみにしている。/期待着新电影的上映。 || その$\\overset{どうわ}{童話}$は$\\overset{えいがかん}{映画館}$で$\\overset{じょうえい}{上映}$される。/那部童话将在电影院上映。"
},
{
  word: "消費",
  kana: "しょうひ",
  type: "名・サ变动词する他",
  meaning: "消费，消耗。",
  example: "$\\overset{しょくひん}{食品}$の$\\overset{しょうひ}{消費}$が$\\overset{おお}{多}$い。/食品的消费很多。 || $\\overset{せいしん}{精神}$と$\\overset{たいりょく}{体力}$を$\\overset{はげ}{激}$しく$\\overset{しょうひ}{消費}$する。/剧烈地消耗精神和体力。"
},
{
  word: "食品",
  kana: "しょくひん",
  type: "名词",
  meaning: "食品。",
  example: "$\\overset{けんこう}{健康}$な$\\overset{しょくひん}{食品}$を$\\overset{か}{買}$うように$\\overset{くふう}{工夫}$する。/想办法买健康的食品。"
},
{
  word: "精神",
  kana: "せいしん",
  type: "名词",
  meaning: "精神。",
  example: "$\\overset{せきにん}{責任}$を$\\overset{も}{持}$って$\\overset{しごと}{仕事}$をする$\\overset{せいしん}{精神}$が$\\overset{たいせつ}{大切}$だ。/带着责任工作的精神很重要。"
},
{
  word: "責任",
  kana: "せきにん",
  type: "名词",
  meaning: "责任。",
  example: "$\\overset{だんたい}{団体}$の$\\overset{ぜんたい}{全体}$に$\\overset{たい}{対}$する$\\overset{せきにん}{責任}$を$\\overset{も}{持}$つ。/对团体全体负有责任。"
},
{
  word: "せっかく",
  kana: "せっかく",
  type: "副词",
  meaning: "特意，好不容易。",
  example: "せっかくの$\\overset{きゅうじつ}{休日}$なのに、$\\overset{たいふう}{台風}$が$\\overset{き}{来}$た。/好不容易的休息日，台风却来了。"
},
{
  word: "全体",
  kana: "ぜんたい",
  type: "名词",
  meaning: "全体，整体。",
  example: "$\\overset{そしき}{組織}$の$\\overset{ぜんたい}{全体}$が$\\overset{きょうりょく}{協力}$して$\\overset{どりょく}{努力}$する。/组织全体合作努力。"
},
{
  word: "想像",
  kana: "そうぞう",
  type: "名・サ变动词する他",
  meaning: "想象。",
  example: "$\\overset{かれ}{彼}$の$\\overset{そうぞう}{想像}$は$\\overset{げんじつ}{現実}$になった。/他的想象变成了现实。 || $\\overset{みらい}{未来}$の$\\overset{しゃかい}{社会}$を$\\overset{そうぞう}{想像}$する。/想象未来的社会。"
},
{
  word: "組織",
  kana: "そしき",
  type: "名・サ变动词する他",
  meaning: "组织。",
  example: "$\\overset{かいしゃ}{会社}$の$\\overset{そしき}{組織}$を$\\overset{か}{変}$える。/改变公司的组织。 || イベントのために$\\overset{あたら}{新}$しい$\\overset{だんたい}{団体}$を$\\overset{そしき}{組織}$する。/为了活动组织新的团体。"
},
{
  word: "体操",
  kana: "たいそう",
  type: "名・サ变动词する自",
  meaning: "体操。",
  example: "$\\overset{あさ}{朝}$の$\\overset{たいそう}{体操}$は$\\overset{けんこう}{健康}$に$\\overset{よ}{良}$い。/早晨的体操对健康有益。 || $\\overset{おんがく}{音楽}$に$\\overset{あ}{合}$わせて$\\overset{たいそう}{体操}$する。/配合着音乐做体操。"
},
{
  word: "台風",
  kana: "たいふう",
  type: "名词",
  meaning: "台风。",
  example: "$\\overset{たいふう}{台風}$のせいで$\\overset{いえ}{家}$が$\\overset{はかい}{破壊}$された。/因为台风，房子被破坏了。"
},
{
  word: "団体",
  kana: "だんたい",
  type: "名词",
  meaning: "团体。",
  example: "$\\overset{だんたい}{団体}$の$\\overset{やくわり}{役割}$をしっかり$\\overset{は}{果}$たす。/好好地完成团体的职责。"
},
{
  word: "努力",
  kana: "どりょく",
  type: "名・サ变动词する自",
  meaning: "努力。",
  example: "$\\overset{かれ}{彼}$の$\\overset{どりょく}{努力}$は$\\overset{むだ}{無駄}$にならなかった。/他的努力没有白费。 || $\\overset{もくひょう}{目標}$に$\\overset{む}{向}$かって$\\overset{いっしょうけんめい}{一生懸命}$$\\overset{どりょく}{努力}$する。/朝着目标拼命努力。"
},
{
  word: "能力",
  kana: "のうりょく",
  type: "名词",
  meaning: "能力。",
  example: "$\\overset{じぶん}{自分}$の$\\overset{のうりょく}{能力}$を$\\overset{しん}{信}$じて$\\overset{じっせん}{実践}$する。/相信自己的能力去实践。"
},
{
  word: "破壊",
  kana: "はかい",
  type: "名・サ变动词する他",
  meaning: "破坏。",
  example: "$\\overset{かんきょう}{環境}$の$\\overset{はかい}{破壊}$が$\\overset{すす}{進}$んでいる。/环境的破坏正在加剧。 || $\\overset{たいふう}{台風}$が$\\overset{おお}{多}$くの$\\overset{たてもの}{建物}$を$\\overset{はかい}{破壊}$した。/台风破坏了许多建筑物。"
},
{
  word: "無駄",
  kana: "むだ",
  type: "名・形动",
  meaning: "白费，徒劳。",
  example: "$\\overset{じかん}{時間}$の$\\overset{むだ}{無駄}$を$\\overset{はぶ}{省}$く。/省去时间的浪费。 || せっかくの$\\overset{どりょく}{努力}$が$\\overset{むだ}{無駄}$になった。/好不容易的努力化为了乌有（白费了）。"
},
{
  word: "命令",
  kana: "めいれい",
  type: "名・サ变动词する他",
  meaning: "命令。",
  example: "$\\overset{じょうし}{上司}$の$\\overset{めいれい}{命令}$に$\\overset{したが}{従}$う。/服从上司的命令。 || $\\overset{ぶか}{部下}$に$\\overset{しごと}{仕事}$を$\\overset{めいれい}{命令}$する。/向部下命令工作。"
},
{
  word: "役割",
  kana: "やくわり",
  type: "名词",
  meaning: "作用，职责，角色。",
  example: "$\\overset{そしき}{組織}$の$\\overset{なか}{中}$で$\\overset{じぶん}{自分}$の$\\overset{やくわり}{役割}$を$\\overset{は}{果}$たす。/在组织中履行自己的职责。"
},
{
  word: "楽",
  kana: "らく",
  type: "名・形动",
  meaning: "轻松，快乐。",
  example: "$\\overset{き}{気}$が$\\overset{らく}{楽}$になる$\\overset{わだい}{話題}$を$\\overset{はな}{話}$す。/谈论让人心情轻松的话题。 || この$\\overset{しごと}{仕事}$はとても$\\overset{らく}{楽}$だ。/这份工作非常轻松。"
},
{
  word: "留守",
  kana: "るす",
  type: "名・サ变动词",
  meaning: "不在家。",
  example: "$\\overset{かれ}{彼}$は$\\overset{いま}{今}$、$\\overset{るす}{留守}$にしています。/他现在不在家。 || $\\overset{おや}{親}$が$\\overset{いえ}{家}$を$\\overset{るす}{留守}$にしている。/父母不在家。"
},
{
  word: "話題",
  kana: "わだい",
  type: "名词",
  meaning: "话题。",
  example: "$\\overset{きのう}{昨日}$の$\\overset{きょうぎ}{競技}$が$\\overset{きょう}{今日}$の$\\overset{わだい}{話題}$になった。/昨天的比赛成了今天的话题。"
},
{
  word: "液体",
  kana: "えきたい",
  type: "名词",
  meaning: "液体。",
  example: "この$\\overset{えきたい}{液体}$には$\\overset{どく}{毒}$が$\\overset{はい}{入}$っている。/这种液体里有毒。"
},
{
  word: "確実",
  kana: "かくじつ",
  type: "形动",
  meaning: "确切，可靠。",
  example: "$\\overset{けってい}{決定}$した$\\overset{にちじ}{日時}$を$\\overset{かくじつ}{確実}$に$\\overset{つた}{伝}$える。/把决定好的日期确切地传达。"
},
{
  word: "競技",
  kana: "きょうぎ",
  type: "名・サ变动词",
  meaning: "竞技，比赛。",
  example: "オリンピックの$\\overset{きょうぎ}{競技}$で$\\overset{ぎん}{銀}$メダルを$\\overset{と}{取}$った。/在奥运会的比赛中获得了银牌。 || $\\overset{たいいくかん}{体育館}$で$\\overset{がくせい}{学生}$たちが$\\overset{きょうぎ}{競技}$する。/学生们在体育馆比赛。"
},
{
  word: "銀",
  kana: "ぎん",
  type: "名词",
  meaning: "银，银牌。",
  example: "$\\overset{かれ}{彼}$は$\\overset{きょうぎ}{競技}$で$\\overset{ぎん}{銀}$メダルを$\\overset{かくとく}{獲得}$した。/他在比赛中获得了银牌。"
},
{
  word: "決定",
  kana: "けってい",
  type: "名・サ变动词する自他",
  meaning: "决定。",
  example: "$\\overset{けんさ}{検査}$の$\\overset{にちじ}{日時}$の$\\overset{けってい}{決定}$を$\\overset{ま}{待}$つ。/等待检查日期的决定。 || $\\overset{はなし}{話}$し$\\overset{あ}{合}$いで$\\overset{せいかい}{正解}$を$\\overset{けってい}{決定}$する。/通过讨论决定正确的答案。"
},
{
  word: "検査",
  kana: "けんさ",
  type: "名・サ变动词する他",
  meaning: "检查，检验。",
  example: "$\\overset{びょういん}{病院}$で$\\overset{しんちょう}{身長}$と$\\overset{たいじゅう}{体重}$の$\\overset{けんさ}{検査}$を$\\overset{う}{受}$ける。/在医院接受身高和体重的检查。 || $\\overset{えきたい}{液体}$の$\\overset{せいぶん}{成分}$を$\\overset{けんさ}{検査}$する。/检查液体的成分。"
},
{
  word: "参考",
  kana: "さんこう",
  type: "名・サ变动词",
  meaning: "参考。",
  example: "$\\overset{せんせい}{先生}$の$\\overset{いけん}{意見}$を$\\overset{さんこう}{参考}$にする。/参考老师的意见。 || $\\overset{いろいろ}{色々}$な$\\overset{ほん}{本}$を$\\overset{さんこう}{参考}$して$\\overset{じっせん}{実践}$する。/参考各种各样的书去实践。"
},
{
  word: "式",
  kana: "しき",
  type: "名词",
  meaning: "仪式；公式，方式。",
  example: "$\\overset{にゅうしゃしき}{入社式}$が$\\overset{せいだい}{盛大}$に$\\overset{おこな}{行}$われた。/入职仪式盛大举行了。"
},
{
  word: "実践",
  kana: "じっせん",
  type: "名・サ变动词する他",
  meaning: "实践。",
  example: "$\\overset{りろん}{理論}$より$\\overset{じっせん}{実践}$が$\\overset{たいせつ}{大切}$だ。/比起理论，实践更重要。 || $\\overset{がっこう}{学校}$で$\\overset{まな}{学}$んだことを$\\overset{じっさい}{実際}$に$\\overset{じっせん}{実践}$する。/将学校学到的东西在实际上进行实践。"
},
{
  word: "実際",
  kana: "じっさい",
  type: "名・副词",
  meaning: "实际；其实。",
  example: "$\\overset{そうぞう}{想像}$と$\\overset{じっさい}{実際}$は$\\overset{ちが}{違}$う。/想象和实际是不同的。 || $\\overset{じっさい}{実際}$に$\\overset{み}{見}$てみると、$\\overset{いがい}{意外}$と$\\overset{ちい}{小}$さかった。/实际一看，意外地很小。"
},
{
  word: "実は",
  kana: "じつは",
  type: "副词",
  meaning: "其实，实际上。",
  example: "$\\overset{じつ}{実}$は、$\\overset{せんじつ}{先日}$$\\overset{かれ}{彼}$に$\\overset{あ}{会}$いました。/其实，前几天我见到了他。"
},
{
  word: "収集",
  kana: "しゅうしゅう",
  type: "名・サ变动词する他",
  meaning: "收集。",
  example: "ゴミの$\\overset{しゅうしゅう}{収集}$$\\overset{び}{日}$を$\\overset{かくにん}{確認}$する。/确认垃圾的收集日。 || $\\overset{かいが}{絵画}$を$\\overset{しゅうしゅう}{収集}$するのが$\\overset{しゅみ}{趣味}$だ。/爱好是收集绘画。"
},
{
  word: "身長",
  kana: "しんちょう",
  type: "名词",
  meaning: "身高。",
  example: "$\\overset{たいじゅう}{体重}$と$\\overset{しんちょう}{身長}$を$\\overset{まいつき}{毎月}$$\\overset{けんさ}{検査}$する。/每个月检查体重和身高。"
},
{
  word: "西瓜",
  kana: "すいか",
  type: "名词",
  meaning: "西瓜。",
  example: "$\\overset{ちゅうしょく}{昼食}$のデザートに$\\overset{すいか}{西瓜}$を$\\overset{た}{食}$べる。/午餐甜点吃西瓜。"
},
{
  word: "正解",
  kana: "せいかい",
  type: "名・サ变动词する自",
  meaning: "正确答案；做对。",
  example: "この$\\overset{もんだい}{問題}$の$\\overset{せいかい}{正解}$がわからない。/不知道这道题的正确答案。 || テストで$\\overset{ぜんもん}{全問}$を$\\overset{せいかい}{正解}$する。/考试中所有题目都答对了。"
},
{
  word: "先日",
  kana: "せんじつ",
  type: "名词",
  meaning: "前几天。",
  example: "$\\overset{せんじつ}{先日}$、$\\overset{びじゅつかん}{美術館}$で$\\overset{ぞう}{像}$と$\\overset{かいが}{絵画}$を$\\overset{み}{見}$た。/前几天，在美术馆看了雕像和绘画。"
},
{
  word: "像",
  kana: "ぞう",
  type: "名词",
  meaning: "雕像，塑像；形象。",
  example: "$\\overset{こうえん}{公園}$の$\\overset{ま}{真}$ん$\\overset{なか}{中}$に$\\overset{りっぱ}{立派}$な$\\overset{ぞう}{像}$がある。/公园正中央有一座气派的雕像。"
},
{
  word: "題",
  kana: "だい",
  type: "名词",
  meaning: "题目。",
  example: "$\\overset{ぜんもん}{全問}$の$\\overset{だい}{題}$を$\\overset{よ}{読}$んでから$\\overset{こた}{答}$えを$\\overset{きにゅう}{記入}$する。/读完所有问题的题目后再填写答案。"
},
{
  word: "体重",
  kana: "たいじゅう",
  type: "名词",
  meaning: "体重。",
  example: "$\\overset{さいきん}{最近}$、$\\overset{たいじゅう}{体重}$が$\\overset{いがい}{意外}$と$\\overset{ふ}{増}$えた。/最近，体重意外地增加了。"
},
{
  word: "昼食",
  kana: "ちゅうしょく",
  type: "名・サ变动词",
  meaning: "午饭。",
  example: "$\\overset{いっしょ}{一緒}$に$\\overset{しょくどう}{食堂}$で$\\overset{ちゅうしょく}{昼食}$をとる。/一起在食堂吃午饭。 || $\\overset{ともだち}{友達}$とレストランで$\\overset{ちゅうしょく}{昼食}$する。/和朋友在餐厅吃午饭。"
},
{
  word: "朝食",
  kana: "ちょうしょく",
  type: "名・サ变动词",
  meaning: "早饭。",
  example: "$\\overset{まいあさ}{毎朝}$きちんと$\\overset{ちょうしょく}{朝食}$を$\\overset{た}{食}$べる。/每天早晨好好吃早饭。 || ホテルで$\\overset{ちょうしょく}{朝食}$する。/在酒店吃早饭。"
},
{
  word: "伝言",
  kana: "でんごん",
  type: "名・サ变动词",
  meaning: "口信，留言。",
  example: "$\\overset{るす}{留守}$の$\\overset{とき}{時}$に$\\overset{でんごん}{伝言}$を$\\overset{のこ}{残}$す。/不在家的时候留下口信。 || $\\overset{ともだち}{友達}$に$\\overset{にちじ}{日時}$を$\\overset{でんごん}{伝言}$する。/给朋友留言告知日期。"
},
{
  word: "童話",
  kana: "どうわ",
  type: "名词",
  meaning: "童话。",
  example: "$\\overset{ようじ}{幼児}$に$\\overset{むかしばなし}{昔話}$や$\\overset{どうわ}{童話}$を$\\overset{き}{聞}$かせる。/给幼儿讲民间故事和童话。"
},
{
  word: "日時",
  kana: "にちじ",
  type: "名词",
  meaning: "日期和时间。",
  example: "$\\overset{にゅうしゃしき}{入社式}$の$\\overset{にちじ}{日時}$が$\\overset{けってい}{決定}$した。/入职仪式的日期时间决定了。"
},
{
  word: "意外",
  kana: "いがい",
  type: "名・形动",
  meaning: "意外，意想不到。",
  example: "$\\overset{しけん}{試験}$の$\\overset{ぜんもん}{全問}$$\\overset{せいかい}{正解}$は$\\overset{いがい}{意外}$だった。/考试全部答对很让人意外。 || $\\overset{かれ}{彼}$は$\\overset{いがい}{意外}$な$\\overset{はんのう}{反応}$を$\\overset{しめ}{示}$した。/他表现出了意外的反应。"
},
{
  word: "依存",
  kana: "いぞん",
  type: "名・サ变动词する自",
  meaning: "依赖。",
  example: "$\\overset{おや}{親}$への$\\overset{いぞん}{依存}$から$\\overset{ぬ}{抜}$け$\\overset{だ}{出}$す。/摆脱对父母的依赖。 || $\\overset{たにん}{他人}$に$\\overset{いぞん}{依存}$して$\\overset{せいかつ}{生活}$する。/依赖别人生活。"
},
{
  word: "絵画",
  kana: "かいが",
  type: "名词",
  meaning: "绘画。",
  example: "$\\overset{びじゅつかん}{美術館}$で$\\overset{ゆうめい}{有名}$な$\\overset{かいが}{絵画}$を$\\overset{かんしょう}{鑑賞}$する。/在美术馆欣赏有名的绘画。"
},
{
  word: "価値観",
  kana: "かちかん",
  type: "名词",
  meaning: "价值观。",
  example: "$\\overset{ひと}{人}$それぞれ$\\overset{かちかん}{価値観}$は$\\overset{ちが}{違}$う。/每个人的价值观都不同。"
},
{
  word: "記入",
  kana: "きにゅう",
  type: "名・サ变动词する他",
  meaning: "填写，记入。",
  example: "$\\overset{ひつよう}{必要}$な$\\overset{じこう}{事項}$の$\\overset{きにゅう}{記入}$を$\\overset{お}{終}$える。/完成必要事项的填写。 || $\\overset{ようし}{用紙}$に$\\overset{なまえ}{名前}$を$\\overset{きにゅう}{記入}$する。/在表格上填写名字。"
},
{
  word: "教材",
  kana: "きょうざい",
  type: "名词",
  meaning: "教材。",
  example: "$\\overset{あした}{明日}$の$\\overset{じゅぎょう}{授業}$の$\\overset{きょうざい}{教材}$を$\\overset{じさん}{持参}$する。/带来明天上课的教材。"
},
{
  word: "持参",
  kana: "じさん",
  type: "名・サ变动词する他",
  meaning: "自带，携带。",
  example: "$\\overset{べんとう}{弁当}$を$\\overset{じさん}{持参}$して$\\overset{こうえん}{公園}$へ$\\overset{い}{行}$く。/自带便当去公园。 || $\\overset{しょるい}{書類}$を$\\overset{じさん}{持参}$して$\\overset{やくしょ}{役所}$へ$\\overset{む}{向}$かう。/携带文件前往政府机关。"
},
{
  word: "実感",
  kana: "じっかん",
  type: "名・サ变动词する他",
  meaning: "真实感，切身感受。",
  example: "$\\overset{ごうかく}{合格}$した$\\overset{じっかん}{実感}$がまだ$\\overset{わ}{湧}$かない。/及格的真实感还没有涌现。 || $\\overset{かれ}{彼}$の$\\overset{やさ}{優}$しさを$\\overset{つうせつ}{痛切}$に$\\overset{じっかん}{実感}$した。/深切地感受到了他的温柔。"
},
{
  word: "実",
  kana: "み",
  type: "名词",
  meaning: "果实，种子；内容。",
  example: "$\\overset{き}{木}$に$\\overset{あか}{赤}$い$\\overset{み}{実}$がなっている。/树上结了红色的果实。"
},
{
  word: "主義",
  kana: "しゅぎ",
  type: "名词",
  meaning: "主义，原则。",
  example: "$\\overset{かれ}{彼}$は$\\overset{へいわ}{平和}$$\\overset{しゅぎ}{主義}$を$\\overset{ていしょう}{提唱}$している。/他提倡和平主义。"
},
{
  word: "消費税",
  kana: "しょうひぜい",
  type: "名词",
  meaning: "消费税。",
  example: "$\\overset{か}{買}$い$\\overset{もの}{物}$の$\\overset{とき}{時}$に$\\overset{しょうひぜい}{消費税}$を$\\overset{はら}{払}$う。/购物时支付消费税。"
},
{
  word: "全問",
  kana: "ぜんもん",
  type: "名词",
  meaning: "全部问题。",
  example: "テストで$\\overset{ぜんもん}{全問}$に$\\overset{せいかい}{正解}$して$\\overset{うれ}{嬉}$しい。/考试中全部问题都答对了很开心。"
},
{
  word: "体育館",
  kana: "たいいくかん",
  type: "名词",
  meaning: "体育馆。",
  example: "$\\overset{たいいくかん}{体育館}$で$\\overset{にゅうしゃしき}{入社式}$を$\\overset{おこな}{行}$う。/在体育馆举行入职仪式。"
},
{
  word: "痛切",
  kana: "つうせつ",
  type: "形动",
  meaning: "深切，痛切。",
  example: "$\\overset{けんこう}{健康}$のありがたさを$\\overset{つうせつ}{痛切}$に$\\overset{かん}{感}$じる。/深切地感受到健康的可贵。"
},
{
  word: "毒",
  kana: "どく",
  type: "名词",
  meaning: "毒。",
  example: "あの$\\overset{えきたい}{液体}$は$\\overset{へんしょく}{変色}$して、$\\overset{どく}{毒}$があるかもしれない。/那种液体变色了，可能有毒。"
},
{
  word: "入社式",
  kana: "にゅうしゃしき",
  type: "名词",
  meaning: "入职仪式。",
  example: "$\\overset{しがつ}{四月}$に$\\overset{かいしゃ}{会社}$の$\\overset{にゅうしゃしき}{入社式}$がある。/四月份有公司的入职仪式。"
},
{
  word: "発信",
  kana: "はっしん",
  type: "名・サ变动词する他",
  meaning: "发信，发送。",
  example: "$\\overset{じょうほう}{情報}$の$\\overset{はっしん}{発信}$を$\\overset{つづ}{続}$ける。/继续发送信息。 || $\\overset{じぶん}{自分}$の$\\overset{いけん}{意見}$をインターネットで$\\overset{はっしん}{発信}$する。/在网上发布自己的意见。"
},
{
  word: "反応",
  kana: "はんのう",
  type: "名・サ变动词する自",
  meaning: "反应。",
  example: "$\\overset{かれ}{彼}$の$\\overset{はんのう}{反応}$は$\\overset{いがい}{意外}$だった。/他的反应很出人意料。 || $\\overset{どく}{毒}$に$\\overset{ふ}{触}$れて$\\overset{ひふ}{皮膚}$が$\\overset{はんのう}{反応}$する。/接触毒物后皮肤产生了反应。"
},
{
  word: "変色",
  kana: "へんしょく",
  type: "名・サ变动词する自",
  meaning: "变色。",
  example: "$\\overset{は}{葉}$の$\\overset{へんしょく}{変色}$を$\\overset{かんさつ}{観察}$する。/观察叶子的变色。 || $\\overset{ながねん}{長年}$$\\overset{つか}{使}$った$\\overset{ほん}{本}$が$\\overset{へんしょく}{変色}$した。/用了很多年的书变色了。"
},
{
  word: "味噌",
  kana: "みそ",
  type: "名词",
  meaning: "大酱，味噌。",
  example: "$\\overset{ちょうしょく}{朝食}$に$\\overset{みそ}{味噌}$で$\\overset{つく}{作}$った$\\overset{しる}{汁}$を$\\overset{の}{飲}$む。/早饭喝用大酱做的汤。"
},
{
  word: "昔話",
  kana: "むかしばなし",
  type: "名词",
  meaning: "民间故事，老话。",
  example: "$\\overset{ようじ}{幼児}$の$\\overset{ころ}{頃}$に$\\overset{そぼ}{祖母}$から$\\overset{むかしばなし}{昔話}$を$\\overset{き}{聞}$いた。/在幼儿时期听祖母讲过民间故事。"
},
{
  word: "幼児",
  kana: "ようじ",
  type: "名词",
  meaning: "幼儿。",
  example: "$\\overset{ようじ}{幼児}$が$\\overset{こうえん}{公園}$で$\\overset{かっぱつ}{活発}$に$\\overset{あそ}{遊}$んでいる。/幼儿在公园里活泼地玩耍。"
},
{
  word: "うどん",
  kana: "うどん",
  type: "名词",
  meaning: "乌冬面。",
  example: "$\\overset{きゅうけい}{休憩}$の$\\overset{じかん}{時間}$に$\\overset{あたた}{温}$かいうどんを$\\overset{た}{食}$べる。/在休息时间吃热乎的乌冬面。"
},
{
  word: "お茶",
  kana: "おちゃ",
  type: "名词",
  meaning: "茶。",
  example: "$\\overset{かいだん}{階段}$を$\\overset{のぼ}{上}$ってから、お$\\overset{ちゃ}{茶}$を$\\overset{の}{飲}$んで$\\overset{きゅうけい}{休憩}$する。/爬上楼梯后，喝杯茶休息一下。"
},
{
  word: "階段",
  kana: "かいだん",
  type: "名词",
  meaning: "楼梯。",
  example: "$\\overset{いそ}{急}$いで$\\overset{かいだん}{階段}$を$\\overset{お}{降}$りて$\\overset{しゅっぱつ}{出発}$する。/急急忙忙下楼梯出发。"
},
{
  word: "休憩",
  kana: "きゅうけい",
  type: "名・サ变动词する自",
  meaning: "休息。",
  example: "$\\overset{じゅっぷん}{十分}$の$\\overset{きゅうけい}{休憩}$のあとで$\\overset{じゅぎょう}{授業}$が$\\overset{はじ}{始}$まる。/十分钟的休息之后开始上课。 || $\\overset{ざんぎょう}{残業}$の$\\overset{とちゅう}{途中}$で$\\overset{すこ}{少}$し$\\overset{きゅうけい}{休憩}$する。/在加班中途稍微休息一下。"
},
{
  word: "具合",
  kana: "ぐあい",
  type: "名词",
  meaning: "情况，状态；身体状况。",
  example: "$\\overset{からだ}{体}$の$\\overset{ぐあい}{具合}$が$\\overset{わる}{悪}$くて$\\overset{しんさつ}{診察}$を$\\overset{う}{受}$ける。/身体状况不好，去接受了诊察。"
},
{
  word: "合格",
  kana: "ごうかく",
  type: "名・サ变动词する自",
  meaning: "及格，合格。",
  example: "$\\overset{だいがく}{大学}$の$\\overset{ごうかく}{合格}$の$\\overset{し}{知}$らせを$\\overset{き}{聞}$く。/听到大学录取（合格）的通知。 || $\\overset{しけん}{試験}$に$\\overset{ぶじ}{無事}$に$\\overset{ごうかく}{合格}$した。/顺利通过了考试。"
},
{
  word: "紅茶",
  kana: "こうちゃ",
  type: "名词",
  meaning: "红茶。",
  example: "ご$\\overset{はん}{飯}$のあとで$\\overset{あたた}{温}$かい$\\overset{こうちゃ}{紅茶}$を$\\overset{の}{飲}$む。/吃完饭后喝热红茶。"
},
{
  word: "ご飯",
  kana: "ごはん",
  type: "名词",
  meaning: "饭，米饭。",
  example: "$\\overset{しあい}{試合}$の$\\overset{まえ}{前}$にしっかりご$\\overset{はん}{飯}$を$\\overset{た}{食}$べる。/比赛前好好吃饭。"
},
{
  word: "残業",
  kana: "ざんぎょう",
  type: "名・サ变动词する自",
  meaning: "加班。",
  example: "$\\overset{さいきん}{最近}$、$\\overset{ざんぎょう}{残業}$の$\\overset{じかん}{時間}$が$\\overset{なが}{長}$い。/最近加班的时间很长。 || $\\overset{しごと}{仕事}$が$\\overset{お}{終}$わらないので$\\overset{ざんぎょう}{残業}$する。/因为工作没做完，所以加班。"
},
{
  word: "試合",
  kana: "しあい",
  type: "名词",
  meaning: "比赛。",
  example: "$\\overset{あした}{明日}$の$\\overset{しあい}{試合}$の$\\overset{じかん}{時間}$と$\\overset{ばしょ}{場所}$を$\\overset{かくにん}{確認}$する。/确认明天比赛的时间和地点。"
},
{
  word: "時間",
  kana: "じかん",
  type: "名词",
  meaning: "时间。",
  example: "$\\overset{じゅぎょう}{授業}$の$\\overset{かいし}{開始}$$\\overset{じかん}{時間}$に$\\overset{おく}{遅}$れないようにする。/注意不要错过上课的开始时间。"
},
{
  word: "授業",
  kana: "じゅぎょう",
  type: "名・サ变动词する他",
  meaning: "上课，授课。",
  example: "$\\overset{えいご}{英語}$の$\\overset{じゅぎょう}{授業}$に$\\overset{ちこく}{遅刻}$した。/英语课迟到了。 || $\\overset{せんせい}{先生}$が$\\overset{はつおん}{発音}$について$\\overset{じゅぎょう}{授業}$する。/老师就发音进行授课。"
},
{
  word: "出発",
  kana: "しゅっぱつ",
  type: "名・サ变动词する自",
  meaning: "出发。",
  example: "$\\overset{ひこうき}{飛行機}$の$\\overset{しゅっぱつ}{出発}$の$\\overset{じかん}{時間}$が$\\overset{ちか}{近}$づく。/飞机出发的时间临近了。 || $\\overset{じょうぶ}{丈夫}$な$\\overset{くつ}{靴}$を$\\overset{は}{履}$いて$\\overset{しゅっぱつ}{出発}$する。/穿上结实的鞋子出发。"
},
{
  word: "丈夫",
  kana: "じょうぶ",
  type: "形动",
  meaning: "结实，健壮。",
  example: "$\\overset{かれ}{彼}$は$\\overset{からだ}{体}$が$\\overset{じょうぶ}{丈夫}$だから、$\\overset{けが}{怪我}$をしても$\\overset{だいじょうぶ}{大丈夫}$だ。/他身体很健壮，所以受了伤也没事。"
},
{
  word: "診察",
  kana: "しんさつ",
  type: "名・サ变动词する他",
  meaning: "诊察，看病。",
  example: "$\\overset{びょういん}{病院}$で$\\overset{いし}{医師}$の$\\overset{しんさつ}{診察}$を$\\overset{ま}{待}$つ。/在医院等待医生的诊察。 || $\\overset{ぐあい}{具合}$の$\\overset{わる}{悪}$い$\\overset{かんじゃ}{患者}$を$\\overset{しんさつ}{診察}$する。/诊察身体不舒服的患者。"
},
{
  word: "酢",
  kana: "す",
  type: "名词",
  meaning: "醋。",
  example: "この$\\overset{りょうり}{料理}$には$\\overset{すこ}{少}$し$\\overset{す}{酢}$が$\\overset{はい}{入}$っている。/这道菜里放了一点醋。"
},
{
  word: "卒業",
  kana: "そつぎょう",
  type: "名・サ变动词する他",
  meaning: "毕业。",
  example: "$\\overset{だいがく}{大学}$の$\\overset{そつぎょう}{卒業}$$\\overset{しき}{式}$に$\\overset{さんか}{参加}$する。/参加大学的毕业典礼。 || $\\overset{こうこう}{高校}$を$\\overset{そつぎょう}{卒業}$して$\\overset{しゅうしょく}{就職}$した。/高中毕业后就职了。"
},
{
  word: "大丈夫",
  kana: "だいじょうぶ",
  type: "形动・副词",
  meaning: "没关系，没问题；一定，绝对。",
  example: "$\\overset{ぐあい}{具合}$は$\\overset{だいぶ}{大分}$$\\overset{よ}{良}$くなったから、もう$\\overset{だいじょうぶ}{大丈夫}$だ。/身体状况好多了，已经没问题了。 || $\\overset{かれ}{彼}$なら$\\overset{だいじょうぶ}{大丈夫}$、きっと$\\overset{ごうかく}{合格}$する。/他的话绝对没问题，一定会及格的。"
},
{
  word: "大切",
  kana: "たいせつ",
  type: "形动",
  meaning: "重要，要紧。",
  example: "$\\overset{たいせつ}{大切}$な$\\overset{じかん}{時間}$を$\\overset{むだ}{無駄}$にしてはいけない。/不能把重要的时间白白浪费掉。"
},
{
  word: "大分",
  kana: "だいぶ",
  type: "副词",
  meaning: "很，相当，大半。",
  example: "$\\overset{れんしゅう}{練習}$のおかげで、$\\overset{はつおん}{発音}$が$\\overset{だいぶ}{大分}$$\\overset{よ}{良}$くなった。/多亏了练习，发音变好了很多。"
},
{
  word: "大変",
  kana: "たいへん",
  type: "形动・副词",
  meaning: "严重，辛苦；非常。",
  example: "$\\overset{そつぎょう}{卒業}$のための$\\overset{ろんぶん}{論文}$を$\\overset{か}{書}$くのは$\\overset{たいへん}{大変}$だ。/写为了毕业的论文很辛苦。 || $\\overset{きょう}{今日}$の$\\overset{じゅぎょう}{授業}$は$\\overset{たいへん}{大変}$$\\overset{おもしろ}{面白}$かった。/今天的课非常有趣。"
},
{
  word: "都合",
  kana: "つごう",
  type: "名词",
  meaning: "方便（与否），情况。",
  example: "$\\overset{あした}{明日}$は$\\overset{つごう}{都合}$が$\\overset{わる}{悪}$いので、$\\overset{しゅっぱつ}{出発}$を$\\overset{おく}{遅}$らせる。/明天不方便（没空），所以推迟出发。"
},
{
  word: "発音",
  kana: "はつおん",
  type: "名・サ变动词する他",
  meaning: "发音。",
  example: "$\\overset{えいご}{英語}$の$\\overset{はつおん}{発音}$の$\\overset{れんしゅう}{練習}$をする。/做英语发音的练习。 || $\\overset{たんご}{單語}$を$\\overset{ただ}{正}$しく$\\overset{はつおん}{発音}$する。/正确地发音单词。"
},
{
  word: "反対",
  kana: "はんたい",
  type: "名・形动・サ变动词する自",
  meaning: "反对，相反。",
  example: "$\\overset{おや}{親}$の$\\overset{はんたい}{反対}$を$\\overset{の}{乗}$り$\\overset{こ}{越}$えて$\\overset{しんがく}{進学}$する。/克服父母的反对继续升学。 || みんなと$\\overset{はんたい}{反対}$の$\\overset{ほうこう}{方向}$へ$\\overset{すす}{進}$む。/朝着和大家相反的方向前进。 || $\\overset{かれ}{彼}$の$\\overset{いけん}{意見}$に$\\overset{つよ}{強}$く$\\overset{はんたい}{反対}$する。/强烈反对他的意见。"
},
{
  word: "例",
  kana: "れい",
  type: "名词",
  meaning: "例子。",
  example: "$\\overset{はんたい}{反対}$の$\\overset{いけん}{意見}$の$\\overset{れい}{例}$をいくつか$\\overset{あ}{挙}$げる。/举几个反对意见的例子。"
},
{
  word: "練習",
  kana: "れんしゅう",
  type: "名・サ变动词する他",
  meaning: "练习。",
  example: "$\\overset{まいにち}{毎日}$の$\\overset{れんしゅう}{練習}$が$\\overset{たいせつ}{大切}$だ。/每天的练习很重要。 || $\\overset{しあい}{試合}$のために$\\overset{いっしょうけんめい}{一生懸命}$$\\overset{れんしゅう}{練習}$する。/为了比赛拼命练习。"
},
{
  word: "宇宙",
  kana: "うちゅう",
  type: "名词",
  meaning: "宇宙。",
  example: "$\\overset{うちゅう}{宇宙}$の$\\overset{かいはつ}{開発}$に$\\overset{おお}{多}$くの$\\overset{くに}{国}$が$\\overset{さんか}{参加}$する。/很多国家参与宇宙的开发。"
},
{
  word: "運",
  kana: "うん",
  type: "名词",
  meaning: "运气，命运。",
  example: "$\\overset{かれ}{彼}$は$\\overset{うん}{運}$よく$\\overset{かいがん}{海岸}$で$\\overset{きちょう}{貴重}$なものを$\\overset{はっけん}{発見}$した。/他运气好，在海岸上发现了贵重的东西。"
},
{
  word: "応援",
  kana: "おうえん",
  type: "名・サ变动词する他",
  meaning: "声援，加油，支持。",
  example: "$\\overset{みな}{皆}$の$\\overset{おうえん}{応援}$が$\\overset{ちから}{力}$になった。/大家的声援变成了力量。 || $\\overset{しあい}{試合}$に$\\overset{で}{出}$る$\\overset{ともだち}{友達}$を$\\overset{おうえん}{応援}$する。/给参加比赛的朋友加油。"
},
{
  word: "海岸",
  kana: "かいがん",
  type: "名词",
  meaning: "海岸，海滨。",
  example: "$\\overset{かいがん}{海岸}$の$\\overset{かいはつ}{開発}$には$\\overset{きび}{厳}$しい$\\overset{きそく}{規則}$がある。/海岸的开发有严格的规定。"
},
{
  word: "開発",
  kana: "かいはつ",
  type: "名・サ变动词する他",
  meaning: "开发。",
  example: "$\\overset{こうぎょう}{工業}$の$\\overset{かいはつ}{開発}$が$\\overset{すす}{進}$んでいる。/工业的开发正在推进。 || $\\overset{あたら}{新}$しい$\\overset{ぎじゅつ}{技術}$を$\\overset{かいはつ}{開発}$する。/开发新的技术。"
},
{
  word: "規則",
  kana: "きそく",
  type: "名词",
  meaning: "规则，规定。",
  example: "$\\overset{がっこう}{學校}$の$\\overset{きそく}{規則}$をしっかり$\\overset{まも}{守}$る。/好好遵守学校的规定。"
},
{
  word: "喫茶店",
  kana: "きっさてん",
  type: "名词",
  meaning: "咖啡馆，茶座。",
  example: "$\\overset{きっさてん}{喫茶店}$でコーヒーを$\\overset{の}{飲}$みながら$\\overset{きゅうけい}{休憩}$する。/在咖啡馆一边喝咖啡一边休息。"
},
{
  word: "急に",
  kana: "きゅうに",
  type: "副词",
  meaning: "突然。",
  example: "$\\overset{きゅう}{急}$に$\\overset{けが}{怪我}$をして、$\\overset{けっこう}{結構}$$\\overset{くろう}{苦労}$した。/突然受了伤，相当受苦。"
},
{
  word: "苦労",
  kana: "くろう",
  type: "名・サ变动词する自",
  meaning: "辛苦，劳苦。",
  example: "$\\overset{おや}{親}$の$\\overset{くろう}{苦労}$を$\\overset{りかい}{理解}$する。/理解父母的辛苦。 || $\\overset{けんちく}{建築}$の$\\overset{しごと}{仕事}$で$\\overset{くろう}{苦労}$している。/在建筑工作上很辛苦。"
},
{
  word: "怪我",
  kana: "けが",
  type: "名・サ变动词する自他",
  meaning: "受伤。",
  example: "$\\overset{あし}{足}$の$\\overset{けが}{怪我}$が$\\overset{なお}{治}$った。/脚的伤好了。 || $\\overset{ころ}{転}$んで$\\overset{けが}{怪我}$をしてしまった。/摔倒受伤了。"
},
{
  word: "結構",
  kana: "けっこう",
  type: "形动・副词",
  meaning: "足够，不需要（形动）；相当，很好（副词/形动）。",
  example: "もう$\\overset{じゅうぶん}{十分}$いただきましたから、$\\overset{けっこう}{結構}$です。/我已经吃得足够了，不需要了。 || この$\\overset{きっさてん}{喫茶店}$は$\\overset{けっこう}{結構}$$\\overset{にんき}{人気}$がある。/这家咖啡馆相当受欢迎。"
},
{
  word: "建築",
  kana: "けんちく",
  type: "名・サ变动词する他",
  meaning: "建筑。",
  example: "$\\overset{ふる}{古}$い$\\overset{けんちく}{建築}$$\\overset{ぶつ}{物}$を$\\overset{ほご}{保護}$する。/保护古老的建筑物。 || $\\overset{こうぎょう}{工業}$$\\overset{ちたい}{地帯}$に$\\overset{こうじょう}{工場}$を$\\overset{けんちく}{建築}$する。/在工业地带建造工厂。"
},
{
  word: "工業",
  kana: "こうぎょう",
  type: "名词",
  meaning: "工业。",
  example: "この$\\overset{とし}{都市}$は$\\overset{こうぎょう}{工業}$が$\\overset{とく}{特}$に$\\overset{はったつ}{発達}$している。/这座城市的工业特别发达。"
},
{
  word: "合計",
  kana: "ごうけい",
  type: "名・サ变动词する他",
  meaning: "合计，总共。",
  example: "$\\overset{ひよう}{費用}$の$\\overset{ごうけい}{合計}$を$\\overset{けいさん}{計算}$する。/计算费用的总和。 || $\\overset{てんすう}{点数}$を$\\overset{ごうけい}{合計}$して$\\overset{せいせき}{成績}$を$\\overset{だ}{出}$す。/合计分数得出成绩。"
},
{
  word: "呼吸",
  kana: "こきゅう",
  type: "名・サ变动词する自他",
  meaning: "呼吸。",
  example: "$\\overset{ふか}{深}$い$\\overset{こきゅう}{呼吸}$をして$\\overset{きんちょう}{緊張}$を$\\overset{やわ}{和}$らげる。/做深呼吸来缓解紧张。 || $\\overset{たいき}{大気}$$\\overset{ちゅう}{中}$の$\\overset{さんそ}{酸素}$を$\\overset{こきゅう}{呼吸}$する。/呼吸大气中的氧气。"
},
{
  word: "産業",
  kana: "さんぎょう",
  type: "名词",
  meaning: "产业。",
  example: "$\\overset{くに}{国}$の$\\overset{さんぎょう}{産業}$と$\\overset{しょうぎょう}{商業}$が$\\overset{はってん}{発展}$する。/国家的产业和商业得到发展。"
},
{
  word: "残念",
  kana: "ざんねん",
  type: "名・形动",
  meaning: "遗憾，可惜。",
  example: "$\\overset{かれ}{彼}$が$\\overset{けっせき}{欠席}$したのは$\\overset{ざんねん}{残念}$の$\\overset{きわ}{極}$みだ。/他缺席了真是遗憾至极。 || $\\overset{しあい}{試合}$に$\\overset{ま}{負}$けて$\\overset{ざんねん}{残念}$だ。/输了比赛很遗憾。"
},
{
  word: "習慣",
  kana: "しゅうかん",
  type: "名词",
  meaning: "习惯。",
  example: "$\\overset{まいあさ}{毎朝}$$\\overset{ろく}{六}$$\\overset{じ}{時}$に$\\overset{お}{起}$きる$\\overset{しゅうかん}{習慣}$がある。/有每天早晨六点起床的习惯。"
},
{
  word: "商業",
  kana: "しょうぎょう",
  type: "名词",
  meaning: "商业。",
  example: "この$\\overset{まち}{町}$は$\\overset{ふる}{古}$くから$\\overset{しょうぎょう}{商業}$で$\\overset{さか}{栄}$えている。/这个城镇自古以来就因商业而繁荣。"
},
{
  word: "承知",
  kana: "しょうち",
  type: "名・サ变动词する他",
  meaning: "知道，同意，明白。",
  example: "その$\\overset{けん}{件}$については$\\overset{しょうち}{承知}$の$\\overset{とお}{通}$りです。/关于那件事，正如您所知。 || $\\overset{かれ}{彼}$の$\\overset{しょくぎょう}{職業}$が$\\overset{たいへん}{大変}$だとは$\\overset{しょうち}{承知}$している。/我明白他的职业很辛苦。"
},
{
  word: "職業",
  kana: "しょくぎょう",
  type: "名词",
  meaning: "职业。",
  example: "$\\overset{すもう}{相撲}$は$\\overset{にほん}{日本}$の$\\overset{でんとう}{伝統}$的$\\overset{てき}{的}$な$\\overset{しょくぎょう}{職業}$の一つだ。/相扑是日本传统的职业之一。"
},
{
  word: "相撲",
  kana: "すもう",
  type: "名词",
  meaning: "相扑。",
  example: "テレビで$\\overset{すもう}{相撲}$の$\\overset{しあい}{試合}$を$\\overset{かんせん}{観戦}$する。/在电视上观看相扑比赛。"
},
{
  word: "西洋",
  kana: "せいよう",
  type: "名词",
  meaning: "西洋，西方。",
  example: "$\\overset{せいよう}{西洋}$の$\\overset{ぶんか}{文化}$と$\\overset{しゅうかん}{習慣}$を$\\overset{けんきゅう}{研究}$する。/研究西方的文化和习惯。"
},
{
  word: "石炭",
  kana: "せきたん",
  type: "名词",
  meaning: "煤炭。",
  example: "$\\overset{こうぎょう}{工業}$の$\\overset{はってん}{発展}$に$\\overset{せきたん}{石炭}$が$\\overset{つか}{使}$われた。/煤炭被用于工业的发展。"
},
{
  word: "是非",
  kana: "ぜひ",
  type: "名・副词",
  meaning: "务必，一定（副词）；是非，对错（名词）。",
  example: "$\\overset{こんど}{今度}$の$\\overset{たいかい}{大会}$には$\\overset{ぜひ}{是非}$$\\overset{さんか}{参加}$してください。/下次的大会请务必参加。 || $\\overset{ものごと}{物事}$の$\\overset{ぜひ}{是非}$を$\\overset{はんだん}{判断}$する。/判断事物的对错。"
},
{
  word: "専門",
  kana: "せんもん",
  type: "名词",
  meaning: "专业，专门。",
  example: "$\\overset{だいがく}{大学}$で$\\overset{のうぎょう}{農業}$の$\\overset{せんもん}{専門}$$\\overset{ちしき}{知識}$を$\\overset{まな}{学}$ぶ。/在大学学习农业的专业知识。"
},
{
  word: "大学",
  kana: "だいがく",
  type: "名词",
  meaning: "大学。",
  example: "$\\overset{たいくつ}{退屈}$な$\\overset{だいがく}{大学}$の$\\overset{じゅぎょう}{授業}$を$\\overset{がまん}{我慢}$する。/忍受无聊的大学课程。"
},
{
  word: "大気",
  kana: "たいき",
  type: "名词",
  meaning: "大气，空气。",
  example: "$\\overset{たいき}{大気}$の$\\overset{おせん}{汚染}$は$\\overset{だいじ}{大事}$な$\\overset{もんだい}{問題}$だ。/大气的污染是一个重要的问题。"
},
{
  word: "退屈",
  kana: "たいくつ",
  type: "名・形动・サ变动词する自",
  meaning: "无聊，闷。",
  example: "$\\overset{たいくつ}{退屈}$しのぎに$\\overset{ほん}{本}$を$\\overset{よ}{読}$む。/为了打发无聊而读书。 || $\\overset{たいくつ}{退屈}$な$\\overset{えいが}{映画}$を$\\overset{み}{見}$て$\\overset{ねむ}{眠}$くなった。/看了无聊的电影变得困了。 || $\\overset{なに}{何}$もすることがなくて$\\overset{たいくつ}{退屈}$する。/无事可做感到无聊。"
},
{
  word: "大事",
  kana: "だいじ",
  type: "名・形动",
  meaning: "重要，要紧。",
  example: "$\\overset{だいじ}{大事}$を$\\overset{と}{取}$って$\\overset{やす}{休}$む。/为了保险起见（慎重对待）而休息。 || $\\overset{だいじ}{大事}$な$\\overset{しょるい}{書類}$を$\\overset{わす}{忘}$れないでください。/请不要忘记重要的文件。"
},
{
  word: "大体",
  kana: "だいたい",
  type: "名・副词",
  meaning: "大概，大体上。",
  example: "$\\overset{じけん}{事件}$の$\\overset{だいたい}{大体}$がわかった。/案件的大概清楚了。 || $\\overset{だいたい}{大体}$$\\overset{おな}{同}$じ$\\overset{じかん}{時間}$に$\\overset{とうちゃく}{到着}$した。/大概在同一时间到达了。"
},
{
  word: "大抵",
  kana: "たいてい",
  type: "副词",
  meaning: "大概，一般，大都。",
  example: "$\\overset{かれ}{彼}$は$\\overset{たいてい}{大抵}$、$\\overset{としょかん}{図書館}$で$\\overset{べんきょう}{勉強}$している。/他大都（一般）在图书馆学习。"
},
{
  word: "大陸",
  kana: "たいりく",
  type: "名词",
  meaning: "大陆。",
  example: "$\\overset{たいりく}{大陸}$の$\\overset{きこう}{気候}$は$\\overset{たいてい}{大抵}$$\\overset{かんそう}{乾燥}$している。/大陆的气候一般都比较干燥。"
},
{
  word: "同時",
  kana: "どうじ",
  type: "名词",
  meaning: "同时。",
  example: "$\\overset{ふたり}{二人}$が$\\overset{どうじ}{同時}$にゴールに$\\overset{と}{飛}$び$\\overset{こ}{込}$んだ。/两人同时冲过了终点线。"
},
{
  word: "特に",
  kana: "とくに",
  type: "副词",
  meaning: "特别，尤其。",
  example: "この$\\overset{ほん}{本}$は$\\overset{とく}{特}$に$\\overset{おも}{面}$$\\overset{しろ}{白}$い。/这本书特别有趣。"
},
{
  word: "農業",
  kana: "のうぎょう",
  type: "名词",
  meaning: "农业。",
  example: "この$\\overset{むら}{村}$は$\\overset{とく}{特}$に$\\overset{のうぎょう}{農業}$が$\\overset{はったつ}{発達}$している。/这个村子的农业特别发达。"
},
{
  word: "発見",
  kana: "はっけん",
  type: "名・サ变动词する他",
  meaning: "发现。",
  example: "$\\overset{あたら}{新}$しい$\\overset{ほし}{星}$の$\\overset{はっけん}{発見}$に$\\overset{おどろ}{驚}$く。/对新星星的发现感到惊讶。 || $\\overset{いせき}{遺跡}$から$\\overset{ふる}{古}$い$\\overset{ちゃわん}{茶碗}$を$\\overset{はっけん}{発見}$した。/从遗迹中发现了古老的茶碗。"
},
{
  word: "発達",
  kana: "はったつ",
  type: "名・サ变动词する自",
  meaning: "发达，发育。",
  example: "$\\overset{こども}{子供}$の$\\overset{しんしん}{心身}$の$\\overset{はったつ}{発達}$。/孩子身心的发育。 || $\\overset{こうつう}{交通}$が$\\overset{はったつ}{発達}$して$\\overset{べんり}{便利}$になった。/交通发达变得方便了。"
},
{
  word: "発展",
  kana: "はってん",
  type: "名・サ变动词する自",
  meaning: "发展。",
  example: "$\\overset{ぼうえき}{貿易}$の$\\overset{はってん}{発展}$が$\\overset{くに}{国}$を$\\overset{ゆた}{豊}$かにする。/贸易的发展使国家富裕。 || $\\overset{けいざい}{経済}$が$\\overset{きゅうそく}{急速}$に$\\overset{はってん}{発展}$している。/经济正在急速发展。"
},
{
  word: "発表",
  kana: "はっぴょう",
  type: "名・サ变动词する他",
  meaning: "发表，发布。",
  example: "$\\overset{あたら}{新}$しい$\\overset{はつめい}{発明}$の$\\overset{はっぴょう}{発表}$を$\\overset{き}{聞}$く。/听取关于新发明的发布。 || $\\overset{じゅぎょう}{授業}$の$\\overset{まえ}{前}$で$\\overset{いけん}{意見}$を$\\overset{はっぴょう}{発表}$する。/在课堂上发表意见。"
},
{
  word: "発明",
  kana: "はつめい",
  type: "名・サ变动词する他",
  meaning: "发明。",
  example: "$\\overset{でんきゅう}{電球}$の$\\overset{はつめい}{発明}$は$\\overset{せいかつ}{生活}$を$\\overset{か}{変}$えた。/电灯泡的发明改变了生活。 || $\\overset{かれ}{彼}$は$\\overset{べんり}{便利}$な$\\overset{どうぐ}{道具}$を$\\overset{はつめい}{発明}$した。/他发明了方便的工具。"
},
{
  word: "不安",
  kana: "ふあん",
  type: "名・形动",
  meaning: "不安，担心。",
  example: "$\\overset{しょうらい}{将来}$への$\\overset{ふあん}{不安}$を$\\overset{かん}{感}$じる。/感受到对将来的不安。 || $\\overset{しけん}{試験}$の$\\overset{まえ}{前}$で$\\overset{ふあん}{不安}$な$\\overset{きも}{気持}$ちだ。/考试前不安的心情。"
},
{
  word: "貿易",
  kana: "ぼうえき",
  type: "名・サ变动词する自他",
  meaning: "贸易。",
  example: "$\\overset{がいこく}{外国}$との$\\overset{ぼうえき}{貿易}$が$\\overset{さか}{盛}$んだ。/与外国的贸易很繁盛。 || $\\overset{たこく}{他国}$と$\\overset{のうさんぶつ}{農産物}$を$\\overset{ぼうえき}{貿易}$する。/和他国进行农产品的贸易。"
},
{
  word: "科",
  kana: "か",
  type: "名词",
  meaning: "科（科目、科室等）。",
  example: "$\\overset{びょういん}{病院}$の$\\overset{げか}{外科}$で$\\overset{しんさつ}{診察}$を$\\overset{う}{受}$ける。/在医院的外科接受诊察。"
},
{
  word: "科目",
  kana: "かもく",
  type: "名词",
  meaning: "科目。",
  example: "$\\overset{だいがく}{大学}$の$\\overset{ひっしゅう}{必修}$$\\overset{かもく}{科目}$を$\\overset{きんべん}{勤勉}$に$\\overset{まな}{学}$ぶ。/勤奋地学习大学的必修科目。"
},
{
  word: "勤勉",
  kana: "きんべん",
  type: "名・形动",
  meaning: "勤奋，勤勉。",
  example: "$\\overset{かれ}{彼}$の$\\overset{きんべん}{勤勉}$さを$\\overset{そんけい}{尊敬}$する。/尊敬他的勤奋。 || $\\overset{きんべん}{勤勉}$な$\\overset{がくせい}{学生}$は$\\overset{せいせき}{成績}$が$\\overset{よ}{良}$い。/勤奋的学生成绩好。"
},
{
  word: "後",
  kana: "あと",
  type: "名词",
  meaning: "后面，之后。",
  example: "$\\overset{しゅうごう}{集合}$のあとで、$\\overset{さぎょう}{作業}$を$\\overset{はじ}{始}$める。/集合之后，开始工作（作业）。"
},
{
  word: "細工",
  kana: "さいく",
  type: "名・サ变动词する自他",
  meaning: "工艺，做手脚。",
  example: "$\\overset{みごと}{見事}$な$\\overset{さいく}{細工}$が$\\overset{ほどこ}{施}$された$\\overset{ちゃわん}{茶碗}$。/施加了精湛工艺的茶碗。 || $\\overset{どうぐ}{道具}$に$\\overset{さいく}{細工}$して$\\overset{つか}{使}$いやすくする。/对工具进行加工使其容易使用。"
},
{
  word: "作業",
  kana: "さぎょう",
  type: "名・サ变动词する自",
  meaning: "作业，工作。",
  example: "$\\overset{だいく}{大工}$の$\\overset{さぎょう}{作業}$を$\\overset{けんがく}{見学}$する。/参观木匠的工作。 || $\\overset{こうじょう}{工場}$で$\\overset{よる}{夜}$まで$\\overset{さぎょう}{作業}$する。/在工厂工作到晚上。"
},
{
  word: "集合",
  kana: "しゅうごう",
  type: "名・サ变动词する自",
  meaning: "集合。",
  example: "$\\overset{しゅうごう}{集合}$$\\overset{じかん}{時間}$に$\\overset{おく}{遅}$れないでください。/请不要错过集合时间。 || $\\overset{えきまえ}{駅前}$に$\\overset{ぜんいん}{全員}$が$\\overset{しゅうごう}{集合}$する。/所有人都在站前集合。"
},
{
  word: "消化",
  kana: "しょうか",
  type: "名・サ变动词する自他",
  meaning: "消化。",
  example: "$\\overset{しょうか}{消化}$に$\\overset{よ}{良}$い$\\overset{しょくひん}{食品}$を$\\overset{た}{食}$べる。/吃容易消化的食品。 || $\\overset{たくさん}{沢山}$食$\\overset{た}{べ}$たが、すぐ$\\overset{しょうか}{消化}$した。/虽然吃了很多，但马上就消化了。"
},
{
  word: "大会",
  kana: "たいかい",
  type: "名词",
  meaning: "大会，比赛。",
  example: "スポーツの$\\overset{たいかい}{大会}$で$\\overset{ゆうしょう}{優勝}$した。/在体育比赛中获得了冠军。"
},
{
  word: "大工",
  kana: "だいく",
  type: "名词",
  meaning: "木匠。",
  example: "あの$\\overset{ひと}{人}$は$\\overset{たいした}{大した}$$\\overset{うで}{腕}$の$\\overset{だいく}{大工}$だ。/那个人是手艺了得的木匠。"
},
{
  word: "大した",
  kana: "たいした",
  type: "连体词",
  meaning: "了不起的；（后接否定）没什么大不了的。",
  example: "$\\overset{かれ}{彼}$の$\\overset{さいのう}{才能}$は$\\overset{たいした}{大した}$ものだ。/他的才能真是了不起。"
},
{
  word: "大臣",
  kana: "だいじん",
  type: "名词",
  meaning: "大臣，部长。",
  example: "$\\overset{ないかく}{内閣}$の$\\overset{だいじん}{大臣}$が$\\overset{にんめい}{任命}$された。/内阁的大臣被任命了。"
},
{
  word: "大西洋",
  kana: "たいせいよう",
  type: "名词",
  meaning: "大西洋。",
  example: "$\\overset{たいせいよう}{大西洋}$を$\\overset{わた}{渡}$る$\\overset{ふね}{船}$に$\\overset{の}{乗}$る。/乘坐横渡大西洋的船。"
},
{
  word: "大多数",
  kana: "だいたすう",
  type: "名词",
  meaning: "大多数。",
  example: "$\\overset{だいたすう}{大多数}$の$\\overset{いけん}{意見}$に$\\overset{さんせい}{賛成}$する。/赞成大多数人的意见。"
},
{
  word: "大部分",
  kana: "だいぶぶん",
  type: "名词",
  meaning: "大部分。",
  example: "$\\overset{しゅくだい}{宿題}$は$\\overset{だいぶぶん}{大部分}$$\\overset{お}{終}$わりました。/作业大部分已经做完了。"
},
{
  word: "茶色",
  kana: "ちゃいろ",
  type: "名词",
  meaning: "茶色，褐色。",
  example: "$\\overset{ちゃいろ}{茶色}$の$\\overset{ちゃわん}{茶碗}$でお$\\overset{ちゃ}{茶}$を$\\overset{の}{飲}$む。/用褐色的茶碗喝茶。"
},
{
  word: "茶碗",
  kana: "ちゃわん",
  type: "名词",
  meaning: "茶碗，饭碗。",
  example: "ご$\\overset{はん}{飯}$を$\\overset{ちゃわん}{茶碗}$に$\\overset{いっぱい}{一杯}$よそって$\\overset{た}{食}$べる。/盛一碗饭吃。"
},
{
  word: "頂上",
  kana: "ちょうじょう",
  type: "名词",
  meaning: "山顶，顶点。",
  example: "$\\overset{ふじさん}{富士山}$の$\\overset{ちょうじょう}{頂上}$で$\\overset{たいき}{大気}$を$\\overset{かん}{感}$じる。/在富士山山顶感受空气。"
},
{
  word: "天皇",
  kana: "てんのう",
  type: "名词",
  meaning: "天皇。",
  example: "$\\overset{れきし}{歴史}$の$\\overset{じゅぎょう}{授業}$で$\\overset{てんのう}{天皇}$について$\\overset{まな}{学}$ぶ。/在历史课上学习关于天皇的知识。"
},
{
  word: "都市",
  kana: "とし",
  type: "名词",
  meaning: "都市，城市。",
  example: "この$\\overset{とし}{都市}$の$\\overset{じんこう}{人口}$は$\\overset{だいぶぶん}{大部分}$が$\\overset{ぞうか}{増加}$している。/这座城市的人口大部分都在增加。"
},
{
  word: "杯",
  kana: "はい",
  type: "名词・量词",
  meaning: "杯。",
  example: "お$\\overset{ちゃ}{茶}$をもう$\\overset{いっぱい}{一杯}$いかがですか。/再来一杯茶怎么样？"
},
{
  word: "別に",
  kana: "べつに",
  type: "副词",
  meaning: "另外；（后接否定）并不，没特别。",
  example: "$\\overset{べつ}{別}$に$\\overset{おこ}{怒}$っているわけではありません。/我并没有在生气。"
},
{
  word: "別",
  kana: "べつ",
  type: "名・形动",
  meaning: "不同，区别，另外。",
  example: "これとそれは$\\overset{べつ}{別}$の$\\overset{もんだい}{問題}$だ。/这个和那个是不同的问题。 || $\\overset{かれ}{彼}$は$\\overset{べつ}{別}$な$\\overset{あたり}{辺}$に$\\overset{い}{行}$った。/他去了另一个地方。"
},
{
  word: "辺",
  kana: "へん",
  type: "名词",
  meaning: "一带，附近。",
  example: "この$\\overset{へん}{辺}$には$\\overset{きっさてん}{喫茶店}$がない。/这一带没有咖啡馆。"
},
{
  word: "約",
  kana: "やく",
  type: "副词",
  meaning: "大约。",
  example: "$\\overset{りく}{陸}$まで$\\overset{やく}{約}$$\\overset{いち}{一}$キロの$\\overset{きょり}{距離}$がある。/到陆地大约有一公里的距离。"
},
{
  word: "陸",
  kana: "りく",
  type: "名词",
  meaning: "陆地。",
  example: "$\\overset{ふね}{船}$から$\\overset{りく}{陸}$に$\\overset{あ}{上}$がる。/从船上来到陆地上。"
},
{
  word: "革命",
  kana: "かくめい",
  type: "名词",
  meaning: "革命。",
  example: "$\\overset{しほんしゅぎ}{資本主義}$の$\\overset{しゃかい}{社会}$で$\\overset{かくめい}{革命}$が$\\overset{お}{起}$きる。/在资本主义社会发生革命。"
},
{
  word: "確立",
  kana: "かくりつ",
  type: "名・サ变动词する自他",
  meaning: "确立。",
  example: "$\\overset{あたら}{新}$しい$\\overset{たいせい}{体制}$の$\\overset{かくりつ}{確立}$を$\\overset{いそ}{急}$ぐ。/急于确立新的体制。 || $\\overset{じぶん}{自分}$の$\\overset{ちい}{地位}$を$\\overset{かくりつ}{確立}$する。/确立自己的地位。"
},
{
  word: "観戦",
  kana: "かんせん",
  type: "名・サ变动词する他",
  meaning: "观战，观看比赛。",
  example: "$\\overset{やきゅう}{野球}$の$\\overset{かんせん}{観戦}$に$\\overset{い}{行}$く$\\overset{よてい}{予定}$だ。/打算去观看棒球比赛。 || スタジアムで$\\overset{しあい}{試合}$を$\\overset{かんせん}{観戦}$する。/在体育场观看比赛。"
},
{
  word: "急速",
  kana: "きゅうそく",
  type: "形动",
  meaning: "急速，迅速。",
  example: "$\\overset{じんこうちのう}{人工知能}$の$\\overset{ぎじゅつ}{技術}$が$\\overset{きゅうそく}{急速}$に$\\overset{はってん}{発展}$している。/人工智能的技术正在迅速发展。"
},
{
  word: "効果",
  kana: "こうか",
  type: "名词",
  meaning: "效果。",
  example: "$\\overset{くすり}{薬}$の$\\overset{こうか}{効果}$が$\\overset{じょじょ}{徐々}$に$\\overset{あらわ}{現}$れる。/药的效果渐渐显现出来。"
},
{
  word: "合流",
  kana: "ごうりゅう",
  type: "名・サ变动词する自",
  meaning: "汇合，合流。",
  example: "$\\overset{ふた}{二}$つの$\\overset{かわ}{川}$が$\\overset{ごうりゅう}{合流}$する$\\overset{ちてん}{地点}$。/两条河汇合的地点。 || $\\overset{ともだち}{友達}$と$\\overset{えき}{駅}$で$\\overset{ごうりゅう}{合流}$する。/和朋友在车站汇合。"
},
{
  word: "再開",
  kana: "さいかい",
  type: "名・サ变动词する自他",
  meaning: "重新开始，恢复。",
  example: "$\\overset{しあい}{試合}$の$\\overset{さいかい}{再開}$を$\\overset{ま}{待}$つ。/等待比赛的重新开始。 || $\\overset{ごご}{午後}$から$\\overset{じゅぎょう}{授業}$を$\\overset{さいかい}{再開}$する。/从下午开始恢复上课。"
},
{
  word: "最古",
  kana: "さいこ",
  type: "名词",
  meaning: "最古老。",
  example: "これは$\\overset{にほん}{日本}$$\\overset{さいこ}{最古}$の$\\overset{けんちく}{建築}$$\\overset{ぶつ}{物}$です。/这是日本最古老的建筑物。"
},
{
  word: "次第",
  kana: "しだい",
  type: "名・接尾词",
  meaning: "情况，缘由（名词）；全凭……，一……就（接尾词）。",
  example: "$\\overset{こと}{事}$の$\\overset{しだい}{次第}$を$\\overset{せつめい}{説明}$する。/说明事情的缘由。 || $\\overset{てんき}{天気}$$\\overset{しだい}{次第}$で$\\overset{しゅっぱつ}{出発}$する。/全凭天气（决定是否）出发。"
},
{
  word: "次第に",
  kana: "しだいに",
  type: "副词",
  meaning: "逐渐地。",
  example: "$\\overset{てんこう}{天候}$が$\\overset{しだい}{次第}$に$\\overset{わる}{悪}$くなった。/天气渐渐变坏了。"
},
{
  word: "資本主義",
  kana: "しほんしゅぎ",
  type: "名词",
  meaning: "资本主义。",
  example: "$\\overset{しほんしゅぎ}{資本主義}$の$\\overset{たいせい}{体制}$の$\\overset{した}{下}$で$\\overset{しょうぎょう}{商業}$が$\\overset{はってん}{発展}$する。/在资本主义的体制下商业得到发展。"
},
{
  word: "指名",
  kana: "しめい",
  type: "名・サ变动词する他",
  meaning: "指名，提名。",
  example: "$\\overset{そうり}{総理}$$\\overset{だいじん}{大臣}$の$\\overset{しめい}{指名}$を$\\overset{う}{受}$ける。/接受总理大臣的提名。 || $\\overset{かいぎ}{会議}$で$\\overset{かれ}{彼}$を$\\overset{だいひょう}{代表}$に$\\overset{しめい}{指名}$する。/在会议上提名他为代表。"
},
{
  word: "従来",
  kana: "じゅうらい",
  type: "名・副词",
  meaning: "从来，以往。",
  example: "$\\overset{じゅうらい}{従来}$のやり$\\overset{かた}{方}$を$\\overset{かいかく}{改革}$する。/改革以往的做法。 || $\\overset{じゅうらい}{従来}$$\\overset{とお}{通}$りに$\\overset{さぎょう}{作業}$を$\\overset{すす}{進}$める。/和以往一样推进工作。"
},
{
  word: "徐々に",
  kana: "じょじょに",
  type: "副词",
  meaning: "慢慢地，徐徐地。",
  example: "$\\overset{ひこうし}{飛行士}$が$\\overset{の}{乗}$る$\\overset{ふね}{船}$が$\\overset{じょじょ}{徐々}$に$\\overset{たいきけん}{大気圏}$へ$\\overset{とつにゅう}{突入}$する。/飞行员乘坐的飞船慢慢地突入大气层。"
},
{
  word: "進学",
  kana: "しんがく",
  type: "名・サ变动词する自",
  meaning: "升学。",
  example: "$\\overset{しんがく}{進学}$のために$\\overset{ひっしゅう}{必修}$$\\overset{かもく}{科目}$を$\\overset{まな}{学}$ぶ。/为了升学学习必修科目。 || $\\overset{かれ}{彼}$は$\\overset{だいがく}{大学}$へ$\\overset{しんがく}{進学}$する$\\overset{よてい}{予定}$だ。/他打算升入大学。"
},
{
  word: "人工知能",
  kana: "じんこうちのう",
  type: "名词",
  meaning: "人工智能。",
  example: "$\\overset{じんこうちのう}{人工知能}$が$\\overset{たんじゅん}{単純}$な$\\overset{さぎょう}{作業}$を$\\overset{か}{代}$わりに$\\overset{おこな}{行}$う。/人工智能代替（人类）进行简单的工作。"
},
{
  word: "総理",
  kana: "そうり",
  type: "名词",
  meaning: "总理，首相。",
  example: "$\\overset{ないかく}{内閣}$$\\overset{そうり}{総理}$$\\overset{だいじん}{大臣}$が$\\overset{あたら}{新}$しい$\\overset{たいせい}{体制}$を$\\overset{はっぴょう}{発表}$した。/内阁总理大臣发布了新的体制。"
},
{
  word: "大気圏",
  kana: "たいきけん",
  type: "名词",
  meaning: "大气层。",
  example: "$\\overset{うちゅう}{宇宙}$$\\overset{せん}{船}$が$\\overset{たいきけん}{大気圏}$に$\\overset{とつにゅう}{突入}$する。/宇宙飞船突入大气层。"
},
{
  word: "体制",
  kana: "たいせい",
  type: "名词",
  meaning: "体制。",
  example: "$\\overset{あたら}{新}$しい$\\overset{かいしゃ}{会社}$の$\\overset{たいせい}{体制}$を$\\overset{かくりつ}{確立}$する。/确立新公司的体制。"
},
{
  word: "単純",
  kana: "たんじゅん",
  type: "名・形动",
  meaning: "单纯，简单。",
  example: "$\\overset{もんだい}{問題}$の$\\overset{かいけつ}{解決}$は$\\overset{たんじゅん}{単純}$ではない。/问题的解决并不简单。 || $\\overset{たんじゅん}{単純}$な$\\overset{たんそ}{炭素}$の$\\overset{こうぞう}{構造}$を$\\overset{けんきゅう}{研究}$する。/研究简单的碳结构。"
},
{
  word: "炭素",
  kana: "たんそ",
  type: "名词",
  meaning: "碳。",
  example: "$\\overset{しょくぶつ}{植物}$は$\\overset{にさんか}{二酸化}$$\\overset{たんそ}{炭素}$を$\\overset{きゅうしゅう}{吸収}$する。/植物吸收二氧化碳。"
},
{
  word: "電球",
  kana: "でんきゅう",
  type: "名词",
  meaning: "电灯泡。",
  example: "$\\overset{へや}{部屋}$の$\\overset{でんきゅう}{電球}$が$\\overset{き}{切}$れたので$\\overset{こうかん}{交換}$する。/房间的灯泡坏（断）了所以要更换。"
},
{
  word: "天候",
  kana: "てんこう",
  type: "名词",
  meaning: "天气，气候。",
  example: "$\\overset{てんこう}{天候}$が$\\overset{わる}{悪}$いので、$\\overset{はなび}{花火}$$\\overset{たいかい}{大会}$は$\\overset{ちゅうし}{中止}$になった。/因为天气不好，所以烟火大会取消了。"
},
{
  word: "突入",
  kana: "とつにゅう",
  type: "名・サ变动词する自",
  meaning: "冲入，突入。",
  example: "$\\overset{たいきけん}{大気圏}$への$\\overset{とつにゅう}{突入}$は$\\overset{きけん}{危険}$だ。/突入大气层是危险的。 || $\\overset{あたら}{新}$しい$\\overset{じだい}{時代}$に$\\overset{とつにゅう}{突入}$する。/迈入（突入）新的时代。"
},
{
  word: "内閣",
  kana: "ないかく",
  type: "名词",
  meaning: "内阁。",
  example: "$\\overset{ないかく}{内閣}$が$\\overset{だいじん}{大臣}$を$\\overset{にんめい}{任命}$する。/内阁任命大臣。"
},
{
  word: "任命",
  kana: "にんめい",
  type: "名・サ变动词する他",
  meaning: "任命。",
  example: "$\\overset{あたら}{新}$しい$\\overset{やく}{役}$の$\\overset{にんめい}{任命}$を$\\overset{う}{受}$ける。/接受新职务的任命。 || $\\overset{かれ}{彼}$をリーダーに$\\overset{にんめい}{任命}$する。/任命他为领导。"
},
{
  word: "花火",
  kana: "はなび",
  type: "名词",
  meaning: "烟花。",
  example: "$\\overset{うみ}{海}$に$\\overset{めん}{面}$する$\\overset{こうえん}{公園}$で$\\overset{はなび}{花火}$を$\\overset{み}{見}$る。/在面向大海的公园看烟花。"
},
{
  word: "飛行士",
  kana: "ひこうし",
  type: "名词",
  meaning: "飞行员，宇航员。",
  example: "$\\overset{うちゅう}{宇宙}$$\\overset{ひこうし}{飛行士}$になるための$\\overset{くんれん}{訓練}$を$\\overset{う}{受}$ける。/接受成为宇航员的训练。"
},
{
  word: "必修",
  kana: "ひっしゅう",
  type: "名词",
  meaning: "必修。",
  example: "この$\\overset{かもく}{科目}$は$\\overset{そつぎょう}{卒業}$のための$\\overset{ひっしゅう}{必修}$です。/这门科目是为了毕业的必修课。"
},
{
  word: "面する",
  kana: "めんする",
  type: "サ变动词する自",
  meaning: "面向，面临。",
  example: "$\\overset{みなみ}{南}$に$\\overset{めん}{面}$する$\\overset{へや}{部屋}$は$\\overset{ひあ}{日当}$たりが$\\overset{よ}{良}$い。/朝南（面向南边）的房间采光很好。"
},
{
  word: "音楽",
  kana: "おんがく",
  type: "名词",
  meaning: "音乐。",
  example: "$\\overset{がっこう}{学校}$で$\\overset{かぞく}{家族}$と$\\overset{いっしょ}{一緒}$に$\\overset{おんがく}{音楽}$を$\\overset{き}{聴}$く。/在学校和家人一起听音乐。"
},
{
  word: "会社",
  kana: "かいしゃ",
  type: "名词",
  meaning: "公司。",
  example: "$\\overset{かようび}{火曜日}$に$\\overset{かいしゃ}{会社}$で$\\overset{かがく}{化学}$の$\\overset{かいぎ}{会議}$がある。/星期二在公司有关于化学的会议。"
},
{
  word: "会話",
  kana: "かいわ",
  type: "名・サ变动词する自",
  meaning: "会话，交谈。",
  example: "$\\overset{かぞく}{家族}$との$\\overset{かいわ}{会話}$の$\\overset{きかい}{機会}$を$\\overset{たいせつ}{大切}$にする。/重视和家人交谈的机会。 || $\\overset{がっこう}{学校}$で$\\overset{ともだち}{友達}$と$\\overset{えいご}{英語}$で$\\overset{かいわ}{会話}$する。/在学校和朋友用英语交谈。"
},
{
  word: "化学",
  kana: "かがく",
  type: "名词",
  meaning: "化学。",
  example: "$\\overset{かいしゃ}{会社}$で$\\overset{かがく}{科学}$と$\\overset{かがく}{化学}$の$\\overset{ちしき}{知識}$を$\\overset{まな}{学}$ぶ。/在公司学习科学和化学的知识。"
},
{
  word: "科学",
  kana: "かがく",
  type: "名词",
  meaning: "科学。",
  example: "$\\overset{げんだい}{現代}$の$\\overset{しゃかい}{社会}$では$\\overset{かがく}{科学}$の$\\overset{ちしき}{知識}$が$\\overset{じゅうよう}{重要}$だ。/在现代社会科学知识很重要。"
},
{
  word: "家族",
  kana: "かぞく",
  type: "名词",
  meaning: "家人，家族。",
  example: "$\\overset{しゅうまつ}{週末}$は$\\overset{かぞく}{家族}$や$\\overset{きょうだい}{兄弟}$と$\\overset{す}{過}$ごす。/周末和家人兄弟一起度过。"
},
{
  word: "学校",
  kana: "がっこう",
  type: "名词",
  meaning: "学校。",
  example: "$\\overset{げつようび}{月曜日}$から$\\overset{きんようび}{金曜日}$まで$\\overset{がっこう}{学校}$へ$\\overset{つうがく}{通学}$する。/从星期一到星期五去学校上学。"
},
{
  word: "火曜日",
  kana: "かようび",
  type: "名词",
  meaning: "星期二。",
  example: "$\\overset{かようび}{火曜日}$と$\\overset{すいようび}{水曜日}$に$\\overset{ぶかつ}{部活}$の$\\overset{れんしゅう}{練習}$がある。/星期二和星期三有社团活动的练习。"
},
{
  word: "機会",
  kana: "きかい",
  type: "名词",
  meaning: "机会。",
  example: "$\\overset{とかい}{都会}$の$\\overset{がっこう}{学校}$に$\\overset{にゅうがく}{入学}$する$\\overset{きかい}{機会}$を$\\overset{え}{得}$た。/得到了进入大城市学校就读的机会。"
},
{
  word: "兄弟",
  kana: "きょうだい",
  type: "名词",
  meaning: "兄弟姐妹。",
  example: "$\\overset{きょうだい}{兄弟}$で$\\overset{いっしょ}{一緒}$に$\\overset{きねん}{記念}$の$\\overset{しゃしん}{写真}$を$\\overset{と}{撮}$る。/兄弟姐妹一起拍纪念照。"
},
{
  word: "月曜日",
  kana: "げつようび",
  type: "名词",
  meaning: "星期一。",
  example: "$\\overset{らいしゅう}{来週}$の$\\overset{げつようび}{月曜日}$に$\\overset{しゅうがくりょこう}{修学旅行}$に$\\overset{しゅっぱつ}{出発}$する。/下周一出发去修学旅行。"
},
{
  word: "視野",
  kana: "しや",
  type: "名词",
  meaning: "视野。",
  example: "$\\overset{とかい}{都会}$での$\\overset{せいかつ}{生活}$が$\\overset{かれ}{彼}$の$\\overset{しや}{視野}$を$\\overset{ひろ}{広}$げた。/在大城市的生活开阔了他的视野。"
},
{
  word: "写真",
  kana: "しゃしん",
  type: "名词",
  meaning: "照片。",
  example: "$\\overset{にちようび}{日曜日}$に$\\overset{かぞく}{家族}$と$\\overset{しゃしん}{写真}$を$\\overset{と}{撮}$りに$\\overset{い}{行}$く。/星期天和家人去拍照。"
},
{
  word: "知識",
  kana: "ちしき",
  type: "名词",
  meaning: "知识。",
  example: "$\\overset{がくもん}{学問}$を$\\overset{とお}{通}$じて$\\overset{ふか}{深}$い$\\overset{ちしき}{知識}$を$\\overset{しゅうとく}{習得}$する。/通过做学问掌握渊博的知识。"
},
{
  word: "通学",
  kana: "つうがく",
  type: "名・サ变动词する自",
  meaning: "走读，上学。",
  example: "$\\overset{まいあさ}{毎朝}$の$\\overset{つうがく}{通学}$に$\\overset{いち}{一}$$\\overset{じかん}{時間}$かかる。/每天早晨上学要花一个小时。 || $\\overset{でんしゃ}{電車}$で$\\overset{とかい}{都会}$の$\\overset{がっこう}{学校}$に$\\overset{つうがく}{通学}$する。/坐电车去大城市的学校上学。"
},
{
  word: "都会",
  kana: "とかい",
  type: "名词",
  meaning: "大城市，都市。",
  example: "$\\overset{とかい}{都会}$の$\\overset{せいかつ}{生活}$は$\\overset{べんり}{便利}$だが、$\\overset{ぶっか}{物価}$が$\\overset{たか}{高}$い。/大城市的生活很方便，但是物价很高。"
},
{
  word: "土曜日",
  kana: "どようび",
  type: "名词",
  meaning: "星期六。",
  example: "$\\overset{どようび}{土曜日}$と$\\overset{にちようび}{日曜日}$は$\\overset{かいしゃ}{会社}$が$\\overset{やす}{休}$みだ。/星期六和星期天公司休息。"
},
{
  word: "日曜日",
  kana: "にちようび",
  type: "名词",
  meaning: "星期日。",
  example: "$\\overset{にちようび}{日曜日}$に$\\overset{かぞく}{家族}$で$\\overset{てんらんかい}{展覧会}$へ$\\overset{い}{行}$く。/星期天一家人去展览会。"
},
{
  word: "入学",
  kana: "にゅうがく",
  type: "名・サ变动词する自",
  meaning: "入学。",
  example: "$\\overset{だいがく}{大学}$の$\\overset{にゅうがく}{入学}$$\\overset{しき}{式}$に$\\overset{しゅっせき}{出席}$する。/出席大学的入学典礼。 || $\\overset{らいねん}{来年}$、あの$\\overset{がっこう}{学校}$に$\\overset{にゅうがく}{入学}$する$\\overset{よてい}{予定}$だ。/打算明年进入那所学校就读。"
},
{
  word: "水曜日",
  kana: "すいようび",
  type: "名词",
  meaning: "星期三。",
  example: "$\\overset{すいようび}{水曜日}$と$\\overset{もくようび}{木曜日}$に$\\overset{えいご}{英語}$の$\\overset{じゅぎょう}{授業}$がある。/星期三和星期四有英语课。"
},
{
  word: "木曜日",
  kana: "もくようび",
  type: "名词",
  meaning: "星期四。",
  example: "$\\overset{もくようび}{木曜日}$の$\\overset{ごご}{午後}$に$\\overset{じゅうよう}{重要}$な$\\overset{かいぎ}{会議}$がある。/星期四下午有重要的会议。"
},
{
  word: "有意義",
  kana: "ゆういぎ",
  type: "名・形动",
  meaning: "有意义。",
  example: "$\\overset{ゆういぎ}{有意義}$な$\\overset{しゅうまつ}{週末}$を$\\overset{す}{過}$ごす。/度过一个有意义的周末。 || $\\overset{りゅうがく}{留学}$の$\\overset{けいけん}{経験}$は$\\overset{ゆういぎ}{有意義}$だった。/留学的经验很有意义。"
},
{
  word: "会議",
  kana: "かいぎ",
  type: "名词",
  meaning: "会议。",
  example: "$\\overset{ぎじゅつ}{技術}$に$\\overset{かん}{関}$する$\\overset{かいぎ}{会議}$に$\\overset{しゅっせき}{出席}$する。/出席关于技术的会议。"
},
{
  word: "解消",
  kana: "かいしょう",
  type: "名・サ变动词する自他",
  meaning: "解除，取消，消除。",
  example: "ストレスの$\\overset{かいしょう}{解消}$に$\\overset{おんがく}{音楽}$を$\\overset{き}{聴}$く。/为了消除压力而听音乐。 || $\\overset{ともだち}{友達}$と$\\overset{かいわ}{会話}$して$\\overset{ふあん}{不安}$を$\\overset{かいしょう}{解消}$する。/和朋友交谈消除了不安。"
},
{
  word: "核家族",
  kana: "かくかぞく",
  type: "名词",
  meaning: "核心家庭（仅由父母及未婚子女组成的家庭）。",
  example: "$\\overset{げんだい}{現代}$の$\\overset{しゃかい}{社会}$では$\\overset{かくかぞく}{核家族}$が$\\overset{ふ}{増}$えている。/现代社会中核心家庭正在增加。"
},
{
  word: "学問",
  kana: "がくもん",
  type: "名词",
  meaning: "学问，学术。",
  example: "$\\overset{だいがく}{大学}$で$\\overset{がくもん}{学問}$と$\\overset{ぎじゅつ}{技術}$を$\\overset{ふか}{深}$く$\\overset{まな}{学}$ぶ。/在大学深入学习学问和技术。"
},
{
  word: "家庭",
  kana: "かてい",
  type: "名词",
  meaning: "家庭。",
  example: "$\\overset{びんぼう}{貧乏}$な$\\overset{かてい}{家庭}$で$\\overset{そだ}{育}$ったが、$\\overset{まいにち}{毎日}$$\\overset{まんぞく}{満足}$だ。/虽然在贫穷的家庭长大，但每天都很满足。"
},
{
  word: "機械",
  kana: "きかい",
  type: "名词",
  meaning: "机械，机器。",
  example: "$\\overset{かいしゃ}{会社}$で$\\overset{あたら}{新}$しい$\\overset{きかい}{機械}$と$\\overset{ぎじゅつ}{技術}$を$\\overset{どうにゅう}{導入}$する。/公司引进新的机器和技术。"
},
{
  word: "技術",
  kana: "ぎじゅつ",
  type: "名词",
  meaning: "技术。",
  example: "$\\overset{さいしん}{最新}$の$\\overset{ぎじゅつ}{技術}$を$\\overset{てんじ}{展示}$する$\\overset{かい}{会}$に$\\overset{い}{行}$く。/去展示最新技术的展会。"
},
{
  word: "帰省",
  kana: "きせい",
  type: "名・サ变动词する自",
  meaning: "回乡探亲。",
  example: "$\\overset{なつやす}{夏休}$みの$\\overset{きせい}{帰省}$を$\\overset{たの}{楽}$しみにしている。/期待着暑假的回乡探亲。 || $\\overset{しゅうまつ}{週末}$に$\\overset{じっか}{実家}$へ$\\overset{きせい}{帰省}$する。/周末回老家探亲。"
},
{
  word: "期待",
  kana: "きたい",
  type: "名・サ变动词する他",
  meaning: "期待。",
  example: "$\\overset{おや}{親}$の$\\overset{きたい}{期待}$に$\\overset{こた}{応}$えて$\\overset{べんきょう}{勉強}$する。/为了回应父母的期待而学习。 || $\\overset{あたら}{新}$しい$\\overset{ぎじゅつ}{技術}$の$\\overset{しんぽ}{進歩}$を$\\overset{きたい}{期待}$する。/期待新技术的进步。"
},
{
  word: "記念",
  kana: "きねん",
  type: "名・サ变动词する他",
  meaning: "纪念。",
  example: "$\\overset{そつぎょう}{卒業}$の$\\overset{きねん}{記念}$に$\\overset{しゃしん}{写真}$を$\\overset{と}{撮}$る。/作为毕业的纪念拍照。 || $\\overset{てんらんかい}{展覧会}$の$\\overset{かいさい}{開催}$を$\\overset{きねん}{記念}$する。/纪念展览会的举办。"
},
{
  word: "競争",
  kana: "きょうそう",
  type: "名・サ变动词する自",
  meaning: "竞争。",
  example: "$\\overset{しょうばい}{商売}$の$\\overset{きょうそう}{競争}$が$\\overset{はげ}{激}$しい。/买卖的竞争很激烈。 || $\\overset{なかま}{仲間}$と$\\overset{せいせき}{成績}$を$\\overset{きょうそう}{競争}$する。/和伙伴竞争成绩。"
},
{
  word: "見学",
  kana: "けんがく",
  type: "名・サ变动词する他",
  meaning: "参观，见习。",
  example: "$\\overset{こうじょう}{工場}$の$\\overset{けんがく}{見学}$に$\\overset{い}{行}$く。/去参观工厂。 || $\\overset{てんらんかい}{展覧会}$で$\\overset{かぐ}{家具}$を$\\overset{けんがく}{見学}$する。/在展览会上参观家具。"
},
{
  word: "社会",
  kana: "しゃかい",
  type: "名词",
  meaning: "社会。",
  example: "$\\overset{げんだい}{現代}$の$\\overset{しゃかい}{社会}$において$\\overset{ほうりつ}{法律}$は$\\overset{じゅうよう}{重要}$だ。/在现代社会中法律很重要。"
},
{
  word: "修学旅行",
  kana: "しゅうがくりょこう",
  type: "名词",
  meaning: "修学旅行。",
  example: "$\\overset{しゅうがくりょこう}{修学旅行}$で$\\overset{めいしょきゅうせき}{名所旧跡}$を$\\overset{けんがく}{見学}$する。/在修学旅行中参观名胜古迹。"
},
{
  word: "重要",
  kana: "じゅうよう",
  type: "名・形动",
  meaning: "重要。",
  example: "$\\overset{じゅうよう}{重要}$な$\\overset{かいぎ}{会議}$に$\\overset{ちこく}{遅刻}$してはいけない。/重要的会议不能迟到。 || $\\overset{ふくしゅう}{復習}$は$\\overset{がくしゅう}{学習}$において$\\overset{じゅうよう}{重要}$だ。/复习在学习中很重要。"
},
{
  word: "種類",
  kana: "しゅるい",
  type: "名词",
  meaning: "种类。",
  example: "$\\overset{てんらんかい}{展覧会}$に$\\overset{おお}{多}$くの$\\overset{しゅるい}{種類}$の$\\overset{かぐ}{家具}$がある。/展览会上有很多种类的家具。"
},
{
  word: "商売",
  kana: "しょうばい",
  type: "名・サ变动词する自",
  meaning: "做买卖，经商。",
  example: "$\\overset{かれ}{彼}$の$\\overset{しょうばい}{商売}$は$\\overset{せいこう}{成功}$している。/他的生意很成功。 || $\\overset{まち}{町}$で$\\overset{ふく}{服}$を$\\overset{う}{売}$って$\\overset{しょうばい}{商売}$する。/在镇上卖衣服做买卖。"
},
{
  word: "数学",
  kana: "すうがく",
  type: "名词",
  meaning: "数学。",
  example: "$\\overset{すうがく}{数学}$の$\\overset{ふくしゅう}{復習}$をして$\\overset{ちしき}{知識}$を$\\overset{ていちゃく}{定着}$させる。/复习数学，让知识巩固下来。"
},
{
  word: "団欒",
  kana: "だんらん",
  type: "名・サ变动词する自",
  meaning: "团圆，欢聚。",
  example: "$\\overset{かぞく}{家族}$の$\\overset{だんらん}{団欒}$の$\\overset{じかん}{時間}$を$\\overset{たいせつ}{大切}$にする。/珍惜一家人团聚的时间。 || $\\overset{しゅうまつ}{週末}$、$\\overset{かない}{家内}$と$\\overset{だんらん}{団欒}$する。/周末和妻子欢聚。"
},
{
  word: "遅刻",
  kana: "ちこく",
  type: "名・サ变动词する自",
  meaning: "迟到。",
  example: "$\\overset{きょう}{今日}$の$\\overset{じゅぎょう}{授業}$の$\\overset{ちこく}{遅刻}$$\\overset{しゃ}{者}$は$\\overset{だれ}{誰}$ですか。/今天上课的迟到者是谁？ || $\\overset{ねぼう}{寝坊}$して$\\overset{ぶかつ}{部活}$に$\\overset{ちこく}{遅刻}$した。/睡过头了，社团活动迟到了。"
},
{
  word: "展覧会",
  kana: "てんらんかい",
  type: "名词",
  meaning: "展览会。",
  example: "$\\overset{てんらんかい}{展覧会}$の$\\overset{かいじょう}{会場}$で$\\overset{さくひん}{作品}$を$\\overset{てんじ}{展示}$する。/在展览会的会场展示作品。"
},
{
  word: "得",
  kana: "とく",
  type: "名・形动・サ变动词する自",
  meaning: "得益，合算，占便宜。",
  example: "$\\overset{やす}{安}$く$\\overset{か}{買}$えて$\\overset{とく}{得}$をした。/买得便宜，占了便宜。 || $\\overset{とく}{得}$な$\\overset{しょうばい}{商売}$を$\\overset{み}{見}$つけた。/找到了合算的买卖。 || この$\\overset{ほん}{本}$を$\\overset{よ}{読}$むと$\\overset{とく}{得}$するよ。/读这本书会受益的。"
},
{
  word: "貧乏",
  kana: "びんぼう",
  type: "名・形动・サ变动词する自",
  meaning: "贫穷。",
  example: "$\\overset{びんぼう}{貧乏}$な$\\overset{のうか}{農家}$の$\\overset{しゅっしん}{出身}$だ。/出身于贫穷的农家。 || $\\overset{むかし}{昔}$はとても$\\overset{びんぼう}{貧乏}$だった。/以前非常贫穷。"
},
{
  word: "夫婦",
  kana: "ふうふ",
  type: "名词",
  meaning: "夫妇，夫妻。",
  example: "$\\overset{ふうふ}{夫婦}$で$\\overset{いっしょ}{一緒}$に$\\overset{しんしつ}{寝室}$の$\\overset{かぐ}{家具}$を$\\overset{えら}{選}$ぶ。/夫妻一起挑选卧室的家具。"
},
{
  word: "部活",
  kana: "ぶかつ",
  type: "名词",
  meaning: "社团活动（「部活動」的略称）。",
  example: "$\\overset{ほうかご}{放課後}$に$\\overset{ぶかつ}{部活}$の$\\overset{れんしゅう}{練習}$に$\\overset{さんか}{参加}$する。/放学后参加社团活动的练习。"
},
{
  word: "復習",
  kana: "ふくしゅう",
  type: "名・サ变动词する他",
  meaning: "复习。",
  example: "$\\overset{まいにち}{毎日}$の$\\overset{よしゅう}{予習}$と$\\overset{ふくしゅう}{復習}$は$\\overset{ふかけつ}{不可欠}$だ。/每天的预习和复习是不可缺少的。 || $\\overset{すうがく}{数学}$の$\\overset{じゅぎょう}{授業}$で$\\overset{まな}{学}$んだことを$\\overset{ふくしゅう}{復習}$する。/复习在数学课上学到的东西。"
},
{
  word: "法律",
  kana: "ほうりつ",
  type: "名词",
  meaning: "法律。",
  example: "$\\overset{しゃかい}{社会}$の$\\overset{ちつじょ}{秩序}$を$\\overset{いじ}{維持}$するために$\\overset{ほうりつ}{法律}$を$\\overset{まも}{守}$る。/为了维持社会秩序而遵守法律。"
},
{
  word: "満足",
  kana: "まんぞく",
  type: "名・形动・サ变动词する自",
  meaning: "满足，满意。",
  example: "$\\overset{どりょく}{努力}$の$\\overset{けっか}{結果}$に$\\overset{おお}{大}$きな$\\overset{まんぞく}{満足}$を$\\overset{え}{得}$る。/对努力的结果感到极大的满足。 || $\\overset{いま}{現在}$の$\\overset{せいかつ}{生活}$に$\\overset{まんぞく}{満足}$な$\\overset{きも}{気持}$ちだ。/对现在的生活感到满意的状态。 || $\\overset{しけん}{試験}$の$\\overset{せいせき}{成績}$に$\\overset{まんぞく}{満足}$する。/对考试成绩感到满意。"
},
{
  word: "民族",
  kana: "みんぞく",
  type: "名词",
  meaning: "民族。",
  example: "$\\overset{みんぞく}{民族}$の$\\overset{こゆう}{固有}$の$\\overset{ぶんか}{文化}$を$\\overset{ていちゃく}{定着}$させる。/让民族固有的文化扎根。"
},
{
  word: "目的",
  kana: "もくてき",
  type: "名词",
  meaning: "目的。",
  example: "$\\overset{りゅうがく}{留学}$の$\\overset{もくてき}{目的}$は$\\overset{がいこくご}{外国語}$の$\\overset{しゅうとく}{習得}$だ。/留学的目的是掌握外语。"
},
{
  word: "留学",
  kana: "りゅうがく",
  type: "名・サ变动词する自",
  meaning: "留学。",
  example: "$\\overset{わたし}{私}$の$\\overset{ゆめ}{夢}$は$\\overset{にほん}{日本}$への$\\overset{りゅうがく}{留学}$です。/我的梦想是去日本留学。 || $\\overset{にほん}{日本}$に$\\overset{りゅうがく}{留学}$して$\\overset{ぶんがく}{文学}$を$\\overset{まな}{学}$ぶ。/去日本留学学习文学。"
},
{
  word: "会",
  kana: "かい",
  type: "名词",
  meaning: "会，集会。",
  example: "$\\overset{てんじ}{展示}$の$\\overset{かい}{会}$を$\\overset{かいじょう}{会場}$で$\\overset{ひら}{開}$く。/在会场举办展览会。"
},
{
  word: "会場",
  kana: "かいじょう",
  type: "名词",
  meaning: "会场。",
  example: "$\\overset{てんらんかい}{展覧会}$の$\\overset{かいじょう}{会場}$に$\\overset{かぐ}{家具}$を$\\overset{はこ}{運}$ぶ。/把家具搬到展览会的会场。"
},
{
  word: "家具",
  kana: "かぐ",
  type: "名词",
  meaning: "家具。",
  example: "$\\overset{あたら}{新}$しい$\\overset{いえ}{家}$のために$\\overset{しんしつ}{寝室}$の$\\overset{かぐ}{家具}$を$\\overset{か}{買}$う。/为了新家买卧室的家具。"
},
{
  word: "学者",
  kana: "がくしゃ",
  type: "名词",
  meaning: "学者。",
  example: "あの$\\overset{がくしゃ}{学者}$は$\\overset{げんだい}{現代}$$\\overset{ぶんがく}{文学}$の$\\overset{けんきゅう}{研究}$をしている。/那位学者在进行现代文学的研究。"
},
{
  word: "学習",
  kana: "がくしゅう",
  type: "名・サ变动词する他",
  meaning: "学习。",
  example: "$\\overset{がいこくご}{外国語}$の$\\overset{がくしゅう}{学習}$に$\\overset{さいてき}{最適}$な$\\overset{ほうほう}{方法}$。/最适合外语学习的方法。 || $\\overset{きほん}{基本}$からしっかり$\\overset{がくしゅう}{学習}$する。/从基础开始好好学习。"
},
{
  word: "家内",
  kana: "かない",
  type: "名词",
  meaning: "妻子（对人谦称自己的妻子）；家内。",
  example: "$\\overset{しゅうまつ}{週末}$は$\\overset{かない}{家内}$と$\\overset{いっしょ}{一緒}$に$\\overset{か}{買}$い$\\overset{もの}{物}$へ$\\overset{い}{行}$く。/周末和妻子一起去购物。"
},
{
  word: "間",
  kana: "あいだ",
  type: "名词",
  meaning: "期间，之间；空间，距离。",
  example: "$\\overset{なつやす}{夏休}$みの$\\overset{あいだ}{間}$に、$\\overset{がくひ}{学費}$を$\\overset{かせ}{稼}$ぐ。/在暑假期间赚学费。"
},
{
  word: "現代",
  kana: "げんだい",
  type: "名词",
  meaning: "现代。",
  example: "$\\overset{げんだい}{現代}$の$\\overset{ぶんがく}{文学}$について$\\overset{がくしゃ}{学者}$と$\\overset{ろんぎ}{論議}$する。/和学者就现代文学进行讨论。"
},
{
  word: "作曲家",
  kana: "さっきょくか",
  type: "名词",
  meaning: "作曲家。",
  example: "あの$\\overset{ゆうめい}{有名}$な$\\overset{さっきょくか}{作曲家}$は$\\overset{にちじょう}{日常}$から$\\overset{おんがく}{音楽}$を$\\overset{う}{生}$み$\\overset{だ}{出}$す。/那位有名的作曲家从日常中创作出音乐。"
},
{
  word: "三角",
  kana: "さんかく",
  type: "名词",
  meaning: "三角。",
  example: "ノートに$\\overset{さんかく}{三角}$や$\\overset{しかく}{四角}$の$\\overset{ずけい}{図形}$を$\\overset{か}{描}$く。/在笔记本上画三角和四角的图形。"
},
{
  word: "四角",
  kana: "しかく",
  type: "名・形动",
  meaning: "四角，方形。",
  example: "$\\overset{しかく}{四角}$の$\\overset{かたち}{形}$をした$\\overset{かぐ}{家具}$を$\\overset{えら}{選}$ぶ。/挑选方形形状的家具。 || $\\overset{しかく}{四角}$な$\\overset{へや}{部屋}$の$\\overset{そうじ}{掃除}$をする。/打扫四四方方的房间。"
},
{
  word: "寝室",
  kana: "しんしつ",
  type: "名词",
  meaning: "卧室。",
  example: "$\\overset{しんしつ}{寝室}$に$\\overset{しかく}{四角}$のベッドを$\\overset{お}{置}$く。/在卧室里放一张方形的床。"
},
{
  word: "進歩",
  kana: "しんぽ",
  type: "名・サ变动词する自",
  meaning: "进步。",
  example: "$\\overset{かがく}{科学}$$\\overset{ぎじゅつ}{技術}$の$\\overset{しんぽ}{進歩}$は$\\overset{はや}{快}$い。/科学技术的进步很快。 || $\\overset{まいにち}{毎日}$$\\overset{がくしゅう}{学習}$して$\\overset{すこ}{少}$しずつ$\\overset{しんぽ}{進歩}$する。/每天学习，一点一点进步。"
},
{
  word: "損",
  kana: "そん",
  type: "名・形动・サ变动词する自他",
  meaning: "吃亏，损失。",
  example: "$\\overset{か}{買}$わなければ$\\overset{そん}{損}$だ。/不买就亏了。 || $\\overset{そん}{損}$な$\\overset{やくめ}{役目}$を$\\overset{ひ}{引}$き$\\overset{う}{受}$ける。/接下吃亏的差事。 || $\\overset{かぶ}{株}$で$\\overset{おお}{大}$きく$\\overset{そん}{損}$する。/炒股亏了一大笔。"
},
{
  word: "展示",
  kana: "てんじ",
  type: "名・サ变动词する他",
  meaning: "展示，展出。",
  example: "$\\overset{びじゅつかん}{美術館}$の$\\overset{てんじ}{展示}$を$\\overset{み}{見}$に$\\overset{い}{行}$く。/去美术馆看展览。 || $\\overset{かいじょう}{会場}$で$\\overset{あたら}{新}$しい$\\overset{かぐ}{家具}$を$\\overset{てんじ}{展示}$する。/在会场展示新家具。"
},
{
  word: "農家",
  kana: "のうか",
  type: "名词",
  meaning: "农家，农民。",
  example: "$\\overset{のうか}{農家}$で$\\overset{ほうふ}{豊富}$な$\\overset{やさい}{野菜}$を$\\overset{さいばい}{栽培}$している。/在农家种植着丰富的蔬菜。"
},
{
  word: "拝見",
  kana: "はいけん",
  type: "名・サ变动词する他",
  meaning: "看，拜读（「見る」的谦让语）。",
  example: "$\\overset{しりょう}{資料}$の$\\overset{はいけん}{拝見}$をお$\\overset{ねが}{願}$いします。/请允许我看一下资料。 || $\\overset{せんせい}{先生}$の$\\overset{てがみ}{手紙}$を$\\overset{はいけん}{拝見}$しました。/拜读了老师的信。"
},
{
  word: "文学",
  kana: "ぶんがく",
  type: "名词",
  meaning: "文学。",
  example: "$\\overset{だいがく}{大学}$の$\\overset{ぶんがく}{文学}$$\\overset{ぶ}{部}$に$\\overset{にゅうがく}{入学}$する。/考入大学的文学部。"
},
{
  word: "維持",
  kana: "いじ",
  type: "名・サ变动词する他",
  meaning: "维持。",
  example: "$\\overset{けんこう}{健康}$の$\\overset{いじ}{維持}$には$\\overset{うんどう}{運動}$が$\\overset{ふかけつ}{不可欠}$だ。/为了维持健康，运动是不可或缺的。 || $\\overset{げんざい}{現在}$の$\\overset{せいせき}{成績}$を$\\overset{いじ}{維持}$する。/维持现在的成绩。"
},
{
  word: "縁",
  kana: "えん",
  type: "名词",
  meaning: "缘分，关系（えん）；边缘（ふち）。",
  example: "これも$\\overset{なに}{何}$かの$\\overset{えん}{縁}$ですから、よろしくお$\\overset{ねが}{願}$いします。/这也是一种缘分，请多关照。"
},
{
  word: "延期",
  kana: "えんき",
  type: "名・サ变动词する他",
  meaning: "延期。",
  example: "$\\overset{あめ}{雨}$のため、$\\overset{しあい}{試合}$は$\\overset{えんき}{延期}$になった。/因为下雨，比赛延期了。 || $\\overset{よてい}{予定}$を$\\overset{らいしゅう}{来週}$に$\\overset{えんき}{延期}$する。/将计划延期到下周。"
},
{
  word: "開設",
  kana: "かいせつ",
  type: "名・サ变动词する他",
  meaning: "开设，建立。",
  example: "$\\overset{あたら}{新}$しい$\\overset{がっか}{学科}$の$\\overset{かいせつ}{開設}$を$\\overset{じゅんび}{準備}$する。/准备开设新的学科。 || $\\overset{ぎんこう}{銀行}$で$\\overset{こうざ}{口座}$を$\\overset{かいせつ}{開設}$する。/在银行开设账户。"
},
{
  word: "学年",
  kana: "がくねん",
  type: "名词",
  meaning: "学年，年级。",
  example: "$\\overset{あたら}{新}$しい$\\overset{がくねん}{学年}$になって、$\\overset{きほん}{基本}$から$\\overset{ふくしゅう}{復習}$する。/升入新学年后，从基础开始复习。"
},
{
  word: "学費",
  kana: "がくひ",
  type: "名词",
  meaning: "学费。",
  example: "$\\overset{だいがく}{大学}$の$\\overset{がくひ}{学費}$を$\\overset{はら}{払}$うためにアルバイトをする。/为了交大学学费而打工。"
},
{
  word: "学部",
  kana: "がくぶ",
  type: "名词",
  meaning: "学部，学院（大学的）。",
  example: "$\\overset{ぶんがく}{文学}$$\\overset{ぶ}{部}$で$\\overset{げんご}{言語}$について$\\overset{がくしゅう}{学習}$する。/在文学院学习语言。"
},
{
  word: "学科",
  kana: "がっか",
  type: "名词",
  meaning: "学科，专业。",
  example: "$\\overset{りか}{理科}$の$\\overset{がっか}{学科}$で$\\overset{かがく}{化学}$を$\\overset{せんもん}{専門}$に$\\overset{まな}{学}$ぶ。/在理科专业专门学习化学。"
},
{
  word: "感想文",
  kana: "かんそうぶん",
  type: "名词",
  meaning: "读后感，观后感。",
  example: "$\\overset{えいが}{映画}$を$\\overset{み}{見}$て$\\overset{かんそうぶん}{感想文}$を$\\overset{か}{書}$く。/看了电影写观后感。"
},
{
  word: "基本",
  kana: "きほん",
  type: "名词",
  meaning: "基本，基础。",
  example: "$\\overset{なにごと}{何事}$も$\\overset{きほん}{基本}$を$\\overset{じゅうし}{重視}$することが$\\overset{たいせつ}{大切}$だ。/凡事重视基础很重要。"
},
{
  word: "固有",
  kana: "こゆう",
  type: "名・形动",
  meaning: "固有，特有。",
  example: "これは$\\overset{にほん}{日本}$$\\overset{こゆう}{固有}$の$\\overset{ぶんか}{文化}$だ。/这是日本固有的文化。 || その$\\overset{ちほう}{地方}$に$\\overset{こゆう}{固有}$な$\\overset{しゅうかん}{習慣}$がある。/那个地方有特有的习惯。"
},
{
  word: "今週",
  kana: "こんしゅう",
  type: "名词",
  meaning: "本周。",
  example: "$\\overset{こんしゅう}{今週}$の$\\overset{しゅうまつ}{週末}$に$\\overset{てんらんかい}{展覧会}$の$\\overset{よてい}{予定}$を$\\overset{へんこう}{変更}$する。/把展览会的计划改到本周末。"
},
{
  word: "最適",
  kana: "さいてき",
  type: "名・形动",
  meaning: "最合适。",
  example: "$\\overset{がくしゅう}{学習}$に$\\overset{さいてき}{最適}$な$\\overset{かんきょう}{環境}$を$\\overset{つく}{作}$る。/创造最适合学习的环境。 || この$\\overset{ほん}{本}$は$\\overset{しょしん}{初心}$$\\overset{しゃ}{者}$に$\\overset{さいてき}{最適}$だ。/这本书最适合初学者。"
},
{
  word: "三角形",
  kana: "さんかくけい",
  type: "名词",
  meaning: "三角形。",
  example: "$\\overset{すうがく}{数学}$の$\\overset{じゅぎょう}{授業}$で$\\overset{さんかくけい}{三角形}$と$\\overset{しかくけい}{四角形}$の$\\overset{ずけい}{図形}$を$\\overset{まな}{学}$ぶ。/在数学课上学习三角形和四边形的图形。"
},
{
  word: "四角形",
  kana: "しかくけい",
  type: "名词",
  meaning: "四角形，四边形。",
  example: "ノートに$\\overset{しかくけい}{四角形}$の$\\overset{ずけい}{図形}$を$\\overset{か}{描}$く。/在笔记本上画四边形的图形。"
},
{
  word: "自己",
  kana: "じこ",
  type: "名词",
  meaning: "自己。",
  example: "$\\overset{じこ}{自己}$の$\\overset{しめい}{使命}$を$\\overset{は}{果}$たすために$\\overset{どりょく}{努力}$する。/为了完成自己的使命而努力。"
},
{
  word: "使命",
  kana: "しめい",
  type: "名词",
  meaning: "使命。",
  example: "$\\overset{きょうし}{教師}$としての$\\overset{しめい}{使命}$$\\overset{かん}{感}$を$\\overset{も}{持}$つ。/拥有作为教师的使命感。"
},
{
  word: "重視",
  kana: "じゅうし",
  type: "名・サ变动词する他",
  meaning: "重视。",
  example: "$\\overset{がくりょく}{学力}$の$\\overset{じゅうし}{重視}$が$\\overset{けいこう}{傾向}$となっている。/重视学习能力成为了一种趋势。 || $\\overset{きほん}{基本}$の$\\overset{ちしき}{知識}$を$\\overset{じゅうし}{重視}$して$\\overset{ふくしゅう}{復習}$する。/重视基础知识进行复习。"
},
{
  word: "週末",
  kana: "しゅうまつ",
  type: "名词",
  meaning: "周末。",
  example: "$\\overset{しゅうまつ}{週末}$は$\\overset{ぜっこう}{絶好}$の$\\overset{りょこう}{旅行}$$\\overset{びより}{日和}$だ。/周末是绝佳的旅行好天气。"
},
{
  word: "習得",
  kana: "しゅうとく",
  type: "名・サ变动词する他",
  meaning: "学会，掌握。",
  example: "$\\overset{がいこくご}{外国語}$の$\\overset{しゅうとく}{習得}$には$\\overset{じかん}{時間}$がかかる。/掌握外语需要花时间。 || $\\overset{あたら}{新}$しい$\\overset{ぎじゅつ}{技術}$を$\\overset{しゅうとく}{習得}$する。/掌握新技术。"
},
{
  word: "上",
  kana: "じょう",
  type: "名词",
  meaning: "上，上面（うえ）；在……方面，从……来看（じょう）。",
  example: "$\\overset{きょういく}{教育}$$\\overset{じょう}{上}$、その$\\overset{もんだい}{問題}$の$\\overset{かいけつ}{解決}$は$\\overset{ふかけつ}{不可欠}$だ。/在教育上，那个问题的解决是不可或缺的。"
},
{
  word: "図形",
  kana: "ずけい",
  type: "名词",
  meaning: "图形。",
  example: "$\\overset{ふくざつ}{複雑}$な$\\overset{ずけい}{図形}$の$\\overset{もんだい}{問題}$を$\\overset{と}{解}$く。/解答复杂的图形问题。"
},
{
  word: "絶好",
  kana: "ぜっこう",
  type: "名・形动",
  meaning: "绝好，极好。",
  example: "$\\overset{ぜっこう}{絶好}$の$\\overset{きかい}{機会}$を$\\overset{のが}{逃}$してはいけない。/不能错过绝好的机会。 || $\\overset{きょう}{今日}$は$\\overset{ぜっこう}{絶好}$な$\\overset{てんき}{天気}$だ。/今天是极好的天气。"
},
{
  word: "定着",
  kana: "ていちゃく",
  type: "名・サ变动词する自",
  meaning: "固定，扎根，普及。",
  example: "$\\overset{あたら}{新}$しい$\\overset{せいど}{制度}$の$\\overset{ていちゃく}{定着}$を$\\overset{はか}{図}$る。/谋求新制度的扎根。 || $\\overset{まな}{学}$んだ$\\overset{ちしき}{知識}$が$\\overset{あたま}{頭}$に$\\overset{ていちゃく}{定着}$する。/学到的知识在脑海中巩固扎根了。"
},
{
  word: "日常",
  kana: "にちじょう",
  type: "名词",
  meaning: "日常。",
  example: "$\\overset{にちじょう}{日常}$の$\\overset{せいかつ}{生活}$に$\\overset{ふかけつ}{不可欠}$なもの。/日常生活中不可缺少的物品。"
},
{
  word: "入学式",
  kana: "にゅうがくしき",
  type: "名词",
  meaning: "入学典礼。",
  example: "$\\overset{しがつ}{四月}$に$\\overset{がっこう}{学校}$の$\\overset{にゅうがくしき}{入学式}$が$\\overset{おこな}{行}$われる。/四月份举行学校的入学典礼。"
},
{
  word: "不可欠",
  kana: "ふかけつ",
  type: "名・形动",
  meaning: "不可或缺。",
  example: "$\\overset{みず}{水}$は$\\overset{せいめい}{生命}$に$\\overset{ふかけつ}{不可欠}$のものだ。/水对生命是不可或缺的。 || $\\overset{せいこう}{成功}$に$\\overset{ふかけつ}{不可欠}$な$\\overset{じょうけん}{条件}$を$\\overset{みた}{満}$たす。/满足成功不可或缺的条件。"
},
{
  word: "変更",
  kana: "へんこう",
  type: "名・サ变动词する他",
  meaning: "变更，改变。",
  example: "$\\overset{よてい}{予定}$の$\\overset{へんこう}{変更}$をお$\\overset{し}{知}$らせします。/通知您计划的变更。 || $\\overset{かいぎ}{会議}$の$\\overset{じかん}{時間}$を$\\overset{へんこう}{変更}$する。/变更会议的时间。"
},
{
  word: "豊富",
  kana: "ほうふ",
  type: "名・形动",
  meaning: "丰富。",
  example: "$\\overset{ほうふ}{豊富}$な$\\overset{けいけん}{経験}$を$\\overset{も}{持}$つ$\\overset{がくしゃ}{学者}$。/拥有丰富经验的学者。 || この$\\overset{くに}{国}$は$\\overset{しげん}{資源}$が$\\overset{ほうふ}{豊富}$だ。/这个国家资源丰富。"
},
{
  word: "未婚",
  kana: "みこん",
  type: "名词",
  meaning: "未婚。",
  example: "$\\overset{かれ}{彼}$は$\\overset{みこん}{未婚}$だが、$\\overset{りっぱ}{立派}$な$\\overset{かてい}{家庭}$を$\\overset{きず}{築}$きたいと$\\overset{おも}{思}$っている。/他虽然未婚，但想建立一个美好的家庭。"
},
{
  word: "論議",
  kana: "ろんぎ",
  type: "名・サ变动词する他",
  meaning: "议论，讨论。",
  example: "$\\overset{ほうりつ}{法律}$の$\\overset{へんこう}{変更}$について$\\overset{ろんぎ}{論議}$が$\\overset{か}{交}$わされる。/关于法律的修改展开了讨论。 || $\\overset{げんだい}{現代}$の$\\overset{きょういく}{教育}$$\\overset{もんだい}{問題}$を$\\overset{ろんぎ}{論議}$する。/讨论现代的教育问题。"
},
{
  word: "青い",
  kana: "あおい",
  type: "形容词",
  meaning: "蓝色的，青色的。",
  example: "$\\overset{あお}{青}$い$\\overset{くつした}{靴下}$を$\\overset{う}{売}$り$\\overset{ば}{場}$で$\\overset{さが}{探}$す。/在柜台寻找蓝色的袜子。"
},
{
  word: "言う",
  kana: "いう",
  type: "五段他动词",
  meaning: "说。",
  example: "$\\overset{つぎつぎ}{次々}$とそれについて$\\overset{じぶん}{自分}$の$\\overset{いけん}{意見}$を$\\overset{い}{言}$う。/接连不断地就那件事发表自己的意见。"
},
{
  word: "入り口",
  kana: "いりぐち",
  type: "名词",
  meaning: "入口。",
  example: "デパートの$\\overset{い}{入}$り$\\overset{ぐち}{口}$で$\\overset{かれ}{彼}$に$\\overset{であ}{出会}$う。/在百货商场的入口遇见了他。"
},
{
  word: "売り場",
  kana: "うりば",
  type: "名词",
  meaning: "柜台，卖场。",
  example: "$\\overset{したぎ}{下着}$の$\\overset{う}{売}$り$\\overset{ば}{場}$は$\\overset{した}{下}$の$\\overset{かい}{階}$にあると$\\overset{い}{言}$う。/据说内衣柜台在下面一层。"
},
{
  word: "売る",
  kana: "うる",
  type: "五段他动词",
  meaning: "卖。",
  example: "この$\\overset{みせ}{店}$は$\\overset{あお}{青}$い$\\overset{くつした}{靴下}$を$\\overset{う}{売}$っている。/这家店卖蓝色的袜子。"
},
{
  word: "口",
  kana: "くち",
  type: "名词",
  meaning: "嘴；口，入口。",
  example: "$\\overset{ねむ}{眠}$いので、$\\overset{おお}{大}$きく$\\overset{くち}{口}$を$\\overset{あ}{開}$けてあくびをした。/因为很困，所以张大嘴巴打了个哈欠。"
},
{
  word: "靴下",
  kana: "くつした",
  type: "名词",
  meaning: "袜子。",
  example: "$\\overset{で}{出}$かける$\\overset{まえ}{前}$に$\\overset{あたら}{新}$しい$\\overset{くつした}{靴下}$を$\\overset{は}{履}$く。/出门前穿上新袜子。"
},
{
  word: "下",
  kana: "した",
  type: "名词",
  meaning: "下，下面。",
  example: "ベッドの$\\overset{した}{下}$から$\\overset{ふる}{古}$い$\\overset{くつした}{靴下}$が$\\overset{で}{出}$る。/从床底下翻出了旧袜子。"
},
{
  word: "それ",
  kana: "それ",
  type: "代词",
  meaning: "那个（指代离听话人近的事物）。",
  example: "それを$\\overset{も}{持}$って$\\overset{できるだけ}{できるだけ}$$\\overset{はや}{早}$く$\\overset{で}{出}$かける。/带上那个尽可能早点出门。"
},
{
  word: "次々",
  kana: "つぎつぎ",
  type: "名・副词",
  meaning: "接连不断，一个接一个。",
  example: "$\\overset{つぎつぎ}{次々}$の$\\overset{できごと}{出来事}$に$\\overset{おどろ}{驚}$く。/对接连发生的事情感到惊讶。 || お$\\overset{きゃく}{客}$さんが$\\overset{つぎつぎ}{次々}$と$\\overset{みせ}{店}$に$\\overset{はい}{入}$ってくる。/客人接连不断地走进店里。"
},
{
  word: "出会う",
  kana: "であう",
  type: "五段自动词",
  meaning: "遇见，碰见。",
  example: "$\\overset{たび}{旅}$の$\\overset{とちゅう}{途中}$で$\\overset{さまざま}{様々}$な$\\overset{ひと}{人}$に$\\overset{であ}{出会}$う。/在旅途中遇见各种各样的人。"
},
{
  word: "出掛ける",
  kana: "でかける",
  type: "一段自动词",
  meaning: "出门，外出。",
  example: "$\\overset{きょう}{今日}$は$\\overset{てんき}{天気}$がいいので、$\\overset{そと}{外}$へ$\\overset{で}{出}$かける。/今天天气很好，所以出门去。"
},
{
  word: "できる",
  kana: "できる",
  type: "一段自动词",
  meaning: "能，会；做好，建成。",
  example: "$\\overset{わたし}{私}$に$\\overset{できる}{できる}$$\\overset{かぎ}{限}$りの$\\overset{しごと}{仕事}$を$\\overset{ひ}{引}$き$\\overset{う}{受}$ける。/接下我力所能及的工作。"
},
{
  word: "できるだけ",
  kana: "できるだけ",
  type: "副词",
  meaning: "尽量，尽可能。",
  example: "$\\overset{できるだけ}{できるだけ}$$\\overset{はや}{早}$く$\\overset{ね}{寝}$て、$\\overset{すいみん}{睡眠}$をとる。/尽量早点睡，保证睡眠。"
},
{
  word: "出る",
  kana: "でる",
  type: "一段自动词",
  meaning: "出，出来；参加。",
  example: "$\\overset{へや}{部屋}$から$\\overset{で}{出}$て、$\\overset{あたら}{新}$しい$\\overset{いえ}{家}$へ$\\overset{ひっこ}{引っ越}$す。/从房间出来，搬到新家去。"
},
{
  word: "眠い",
  kana: "ねむい",
  type: "形容词",
  meaning: "困倦的。",
  example: "$\\overset{よる}{夜}$$\\overset{おそ}{遅}$くまで$\\overset{お}{起}$きていたので、$\\overset{きょう}{今日}$はとても$\\overset{ねむ}{眠}$い。/因为熬夜到很晚，所以今天非常困。"
},
{
  word: "寝る",
  kana: "ねる",
  type: "一段自动词",
  meaning: "睡觉，躺下。",
  example: "$\\overset{ねむ}{眠}$いので、$\\overset{できるだけ}{できるだけ}$$\\overset{はや}{早}$く$\\overset{ね}{寝}$ることにした。/因为很困，所以决定尽可能早点睡。"
},
{
  word: "引き受ける",
  kana: "ひきうける",
  type: "一段他动词",
  meaning: "承担，接受。",
  example: "その$\\overset{たいへん}{大変}$な$\\overset{しごと}{仕事}$を$\\overset{ひ}{引}$き$\\overset{う}{受}$ける。/承担下那份辛苦的工作。"
},
{
  word: "引く",
  kana: "ひく",
  type: "五段自他动词",
  meaning: "拉，抽；查（字典）；感冒（风邪を～）。",
  example: "$\\overset{ひ}{引}$き$\\overset{だ}{出}$しを$\\overset{ひ}{引}$いて、$\\overset{したぎ}{下着}$を$\\overset{だ}{出}$す。/拉开抽屉，拿出内衣。 || $\\overset{しお}{潮}$が$\\overset{ひ}{引}$く。/退潮。"
},
{
  word: "引っ越す",
  kana: "ひっこす",
  type: "五段自动词",
  meaning: "搬家。",
  example: "$\\overset{らいげつ}{来月}$、$\\overset{あたら}{新}$しい$\\overset{じゅうたく}{住宅}$に$\\overset{ひっこ}{引っ越}$す$\\overset{よてい}{予定}$だ。/打算下个月搬到新住宅去。"
},
{
  word: "目",
  kana: "め",
  type: "名词",
  meaning: "眼睛。",
  example: "$\\overset{かのじょ}{彼女}$は$\\overset{め}{目}$と$\\overset{くちびる}{唇}$がとても$\\overset{きれい}{綺麗}$で$\\overset{めだ}{目立}$つ。/她的眼睛和嘴唇非常漂亮，很引人注目。"
},
{
  word: "呼ぶ",
  kana: "よぶ",
  type: "五段他动词",
  meaning: "呼唤，叫。",
  example: "$\\overset{おお}{大}$きな$\\overset{こえ}{声}$で$\\overset{ゆうじん}{友人}$の$\\overset{なまえ}{名前}$を$\\overset{よ}{呼}$ぶ。/大声呼唤朋友的名字。"
},
{
  word: "考え直す",
  kana: "かんがえなおす",
  type: "五段他动词",
  meaning: "重新考虑。",
  example: "$\\overset{ひっこ}{引っ越}$しの$\\overset{けいかく}{計画}$をもう$\\overset{いちど}{一度}$$\\overset{かんが}{考}$え$\\overset{なお}{直}$す。/把搬家的计划再重新考虑一遍。"
},
{
  word: "唇",
  kana: "くちびる",
  type: "名词",
  meaning: "嘴唇。",
  example: "$\\overset{くちびる}{唇}$が$\\overset{かんそう}{乾燥}$しているのでリップを$\\overset{ぬ}{塗}$る。/嘴唇很干所以涂唇膏。"
},
{
  word: "下着",
  kana: "したぎ",
  type: "名词",
  meaning: "内衣。",
  example: "$\\overset{ひ}{引}$き$\\overset{だ}{出}$しの$\\overset{なか}{中}$にそれぞれの$\\overset{したぎ}{下着}$をしまう。/把各自的内衣收进抽屉里。"
},
{
  word: "それぞれ",
  kana: "それぞれ",
  type: "名・副词",
  meaning: "各自，分别。",
  example: "それぞれに$\\overset{かんが}{考}$えがある。/每个人都有各自的想法。 || $\\overset{せいと}{生徒}$たちはそれぞれ$\\overset{ちが}{違}$う$\\overset{あおじゃしん}{青写真}$を$\\overset{も}{持}$っている。/学生们分别有着不同的蓝图（规划）。"
},
{
  word: "眠る",
  kana: "ねむる",
  type: "五段自动词",
  meaning: "睡觉，睡眠。",
  example: "$\\overset{さくや}{昨夜}$はぐっすりと$\\overset{ねむ}{眠}$ることができた。/昨晚睡得很香。"
},
{
  word: "引き出し",
  kana: "ひきだし",
  type: "名词",
  meaning: "抽屉。",
  example: "$\\overset{ひ}{引}$き$\\overset{だ}{出}$しの$\\overset{なか}{中}$から$\\overset{あお}{青}$いペンを$\\overset{だ}{出}$す。/从抽屉里拿出蓝色的笔。"
},
{
  word: "目立つ",
  kana: "めだつ",
  type: "五段自动词",
  meaning: "显眼，引人注目。",
  example: "$\\overset{しばふ}{芝生}$の$\\overset{うえ}{上}$で$\\overset{あお}{青}$い$\\overset{ふく}{服}$がとても$\\overset{めだ}{目立}$つ。/在草坪上蓝色的衣服非常显眼。"
},
{
  word: "青",
  kana: "あお",
  type: "名词",
  meaning: "蓝色，青色。",
  example: "$\\overset{す}{澄}$んだ$\\overset{そら}{空}$の$\\overset{あお}{青}$が$\\overset{うつく}{美}$しい。/清澈天空的蔚蓝很美。"
},
{
  word: "言い表す",
  kana: "いいあらわす",
  type: "五段他动词",
  meaning: "表达，用语言表达。",
  example: "この$\\overset{かぎ}{限}$りない$\\overset{よろこ}{喜}$びをどう$\\overset{い}{言}$い$\\overset{あらわ}{表}$せばいいのか。/这无尽的喜悦该如何用语言表达呢。"
},
{
  word: "限りない",
  kana: "かぎりない",
  type: "形容词",
  meaning: "无限的，无尽的。",
  example: "$\\overset{あおぞら}{青空}$の$\\overset{した}{下}$、$\\overset{かぎ}{限}$りない$\\overset{しばふ}{芝生}$が$\\overset{ひろ}{広}$がっている。/蓝天之下，无尽的草坪蔓延开来。"
},
{
  word: "芝生",
  kana: "しばふ",
  type: "名词",
  meaning: "草坪。",
  example: "$\\overset{やす}{休}$みの$\\overset{ひ}{日}$に$\\overset{しばふ}{芝生}$でぐっすり$\\overset{ねむ}{眠}$る。/休息日在草坪上熟睡。"
},
{
  word: "せい",
  kana: "せい",
  type: "名词",
  meaning: "原因，过错（多接在名词「の」或动词连体形后，表消极原因）。",
  example: "$\\overset{ねぼう}{寝坊}$したのは、$\\overset{めざまし}{目覚まし}$が$\\overset{なら}{鳴}$らなかったせいだ。/睡过头是因为闹钟没响的缘故。"
},
{
  word: "それから",
  kana: "それから",
  type: "接续词",
  meaning: "然后，还有。",
  example: "ご$\\overset{はん}{飯}$を$\\overset{た}{食}$べて、それから$\\overset{で}{出}$かける。/吃完饭，然后出门。"
},
{
  word: "それで",
  kana: "それで",
  type: "接续词",
  meaning: "因此，所以。",
  example: "$\\overset{みち}{道}$が$\\overset{こん}{混}$んでいた。それで、$\\overset{ちこく}{遅刻}$してしまった。/路很堵。因此，迟到了。"
},
{
  word: "それでは",
  kana: "それでは",
  type: "接续词",
  meaning: "那么（用于转换话题或结束）。",
  example: "それでは、$\\overset{つぎ}{次}$の$\\overset{できごと}{出来事}$について$\\overset{はな}{話}$しましょう。/那么，我们来谈谈下一件事吧。"
},
{
  word: "それでも",
  kana: "それでも",
  type: "接续词",
  meaning: "尽管如此，即使那样。",
  example: "$\\overset{あめ}{雨}$が$\\overset{ふ}{降}$っている。それでも、$\\overset{かれ}{彼}$は$\\overset{で}{出}$かけた。/正在下雨。尽管如此，他还是出门了。"
},
{
  word: "それとも",
  kana: "それとも",
  type: "接续词",
  meaning: "还是（用于两者选一）。",
  example: "コーヒーにしますか、それともお$\\overset{ちゃ}{茶}$にしますか。/您要喝咖啡，还是要喝茶？"
},
{
  word: "それなのに",
  kana: "それなのに",
  type: "接续词",
  meaning: "虽然那样，然而。",
  example: "$\\overset{いっしょうけんめい}{一生懸命}$$\\overset{べんきょう}{勉強}$した。それなのに、$\\overset{しけん}{試験}$に$\\overset{お}{落}$ちた。/拼命学习了。然而，考试却落榜了。"
},
{
  word: "それに",
  kana: "それに",
  type: "接续词",
  meaning: "而且，加上。",
  example: "この$\\overset{みせ}{店}$は$\\overset{おい}{美味}$しい。それに、$\\overset{ねだん}{値段}$も$\\overset{やす}{安}$い。/这家店很好吃。而且，价格也便宜。"
},
{
  word: "それほど",
  kana: "それほど",
  type: "副词",
  meaning: "那么，那种程度；（后接否定）并不怎么。",
  example: "$\\overset{きょう}{今日}$の$\\overset{さむ}{寒}$さはそれほど$\\overset{きび}{厳}$しくない。/今天的寒冷并没有那么严峻。"
},
{
  word: "出来上がる",
  kana: "できあがる",
  type: "五段自动词",
  meaning: "做好，完成。",
  example: "$\\overset{うつく}{美}$しい$\\overset{あおじゃしん}{青写真}$がようやく$\\overset{できあ}{出来上}$がった。/美丽的蓝图终于完成了。"
},
{
  word: "出来事",
  kana: "できごと",
  type: "名词",
  meaning: "事件，发生的事。",
  example: "$\\overset{きょう}{今日}$の$\\overset{できごと}{出来事}$を$\\overset{にっき}{日記}$に$\\overset{か}{書}$く。/把今天发生的事情写在日记里。"
},
{
  word: "出口",
  kana: "でぐち",
  type: "名词",
  meaning: "出口。",
  example: "$\\overset{ひじょうぐち}{非常口}$と$\\overset{でぐち}{出口}$の$\\overset{ばしょ}{場所}$を$\\overset{かくにん}{確認}$する。/确认安全出口和出口的位置。"
},
{
  word: "中",
  kana: "なか",
  type: "名词",
  meaning: "里面，中。",
  example: "$\\overset{へや}{部屋}$の$\\overset{なか}{中}$でぐっすりと$\\overset{いねむり}{居眠り}$をする。/在房间里面香甜地打瞌睡。"
},
{
  word: "寝坊",
  kana: "ねぼう",
  type: "名・サ变动词する自",
  meaning: "睡懒觉，睡过头。",
  example: "$\\overset{きゅうじつ}{休日}$の$\\overset{ねぼう}{寝坊}$は$\\overset{さいこう}{最高}$だ。/休息日的睡懒觉是最棒的。 || $\\overset{ねぶそく}{寝不足}$のせいで$\\overset{けさ}{今朝}$は$\\overset{ねぼう}{寝坊}$してしまった。/因为睡眠不足的缘故，今天早晨睡过头了。"
},
{
  word: "呼び掛ける",
  kana: "よびかける",
  type: "一段他动词",
  meaning: "呼唤，招呼；呼吁。",
  example: "$\\overset{たいしゅう}{大衆}$に$\\overset{む}{向}$かって$\\overset{へいわ}{平和}$を$\\overset{よ}{呼}$び$\\overset{か}{掛}$ける。/向大众呼吁和平。"
},
{
  word: "藍",
  kana: "あい",
  type: "名词",
  meaning: "靛蓝，深蓝色。",
  example: "$\\overset{あい}{藍}$$\\overset{いろ}{色}$に$\\overset{す}{澄}$んだ$\\overset{そら}{空}$を$\\overset{あお}{仰}$ぐ。/仰望靛蓝色清澈的天空。"
},
{
  word: "仰ぐ",
  kana: "あおぐ",
  type: "五段他动词",
  meaning: "仰望；尊敬；请示。",
  example: "$\\overset{せんせい}{先生}$の$\\overset{しどう}{指導}$を$\\overset{あお}{仰}$ぐ。/请示（仰仗）老师的指导。"
},
{
  word: "青写真",
  kana: "あおじゃしん",
  type: "名词",
  meaning: "蓝图，计划。",
  example: "$\\overset{しょうらい}{将来}$の$\\overset{あおじゃしん}{青写真}$を$\\overset{かんが}{考}$える。/思考未来的蓝图。"
},
{
  word: "青信号",
  kana: "あおしんごう",
  type: "名词",
  meaning: "绿灯。",
  example: "$\\overset{こうさてん}{交差点}$で$\\overset{あおしんごう}{青信号}$になってから$\\overset{うせつ}{右折}$する。/在十字路口等绿灯亮了之后再右转。"
},
{
  word: "青空",
  kana: "あおぞら",
  type: "名词",
  meaning: "蓝天。",
  example: "$\\overset{あおぞら}{青空}$の$\\overset{した}{下}$で$\\overset{ふか}{深}$$\\overset{こきゅう}{呼吸}$をする。/在蓝天之下深呼吸。"
},
{
  word: "青み",
  kana: "あおみ",
  type: "名词",
  meaning: "发青，带青色。",
  example: "$\\overset{すこ}{少}$し$\\overset{あお}{青}$みを$\\overset{お}{帯}$びた$\\overset{いろ}{色}$をしている。/呈现出稍微带点青色的颜色。"
},
{
  word: "言い終わる",
  kana: "いいおわる",
  type: "五段他动词",
  meaning: "说完。",
  example: "$\\overset{かれ}{彼}$が$\\overset{い}{言}$い$\\overset{お}{終}$わるまで$\\overset{だま}{黙}$って$\\overset{き}{聞}$く。/默默地听到他说完。"
},
{
  word: "言い返す",
  kana: "いいかえす",
  type: "五段他动词",
  meaning: "回嘴，反驳。",
  example: "$\\overset{ぶか}{部下}$が$\\overset{めうえ}{目上}$の$\\overset{ひと}{人}$に$\\overset{い}{言}$い$\\overset{かえ}{返}$してはいけない。/部下不能顶撞长辈/上司。"
},
{
  word: "言い換える",
  kana: "いいかえる",
  type: "一段他动词",
  meaning: "换句话说，改口。",
  example: "$\\overset{わ}{分}$かりやすい$\\overset{い}{言}$い$\\overset{かた}{方}$に$\\overset{い}{言}$い$\\overset{か}{換}$える。/换成容易听懂的说法。"
},
{
  word: "言い方",
  kana: "いいかた",
  type: "名词",
  meaning: "说法，表达方式。",
  example: "その$\\overset{い}{言}$い$\\overset{かた}{方}$は$\\overset{すこ}{少}$し$\\overset{おおげさ}{大袈裟}$だ。/那种说法有点夸张。"
},
{
  word: "言い切る",
  kana: "いいきる",
  type: "五段他动词",
  meaning: "断言，说尽。",
  example: "$\\overset{かれ}{彼}$は$\\overset{じぶん}{自分}$の$\\overset{いけん}{意見}$が$\\overset{ただ}{正}$しいときっぱり$\\overset{い}{言}$い$\\overset{き}{切}$った。/他果断地断言自己的意见是正确的。"
},
{
  word: "言い過ぎる",
  kana: "いいすぎる",
  type: "一段他动词",
  meaning: "说得过分。",
  example: "$\\overset{こうふん}{興奮}$して、つい$\\overset{い}{言}$い$\\overset{す}{過}$ぎてしまった。/一激动，不小心说得过分了。"
},
{
  word: "言い出す",
  kana: "いいだす",
  type: "五段他动词",
  meaning: "开始说，说出口。",
  example: "$\\overset{かれ}{彼}$が$\\overset{きゅう}{急}$に$\\overset{じょうだん}{冗談}$を$\\overset{い}{言}$い$\\overset{だ}{出}$した。/他突然开始开玩笑了。"
},
{
  word: "言い直す",
  kana: "いいなおす",
  type: "五段他动词",
  meaning: "改口，重说。",
  example: "$\\overset{まちが}{間違}$えに$\\overset{きづ}{気付}$いて、$\\overset{あわ}{慌}$てて$\\overset{い}{言}$い$\\overset{なお}{直}$す。/意识到错误，慌忙改口。"
},
{
  word: "言い張る",
  kana: "いいはる",
  type: "五段他动词",
  meaning: "固执己见，坚称。",
  example: "$\\overset{じぶん}{自分}$が$\\overset{わる}{悪}$くないと$\\overset{い}{言}$い$\\overset{は}{張}$る。/坚称自己没有错。"
},
{
  word: "言い訳",
  kana: "いいわけ",
  type: "名・サ变动词する自",
  meaning: "借口，辩解。",
  example: "$\\overset{ちこく}{遅刻}$の$\\overset{い}{言}$い$\\overset{わけ}{訳}$を$\\overset{き}{聞}$きたくない。/不想听迟到的借口。 || $\\overset{いまさら}{今更}$$\\overset{い}{言}$い$\\overset{わけ}{訳}$しても$\\overset{おそ}{遅}$い。/事到如今再怎么辩解也晚了。"
},
{
  word: "言うまでもない",
  kana: "いうまでもない",
  type: "连语/词组",
  meaning: "不言而喻，不用说。",
  example: "$\\overset{かれ}{彼}$の$\\overset{どりょく}{努力}$が$\\overset{すば}{素晴}$らしいのは$\\overset{い}{言}$うまでもない。/他的努力有多棒自然是不言而喻的。"
},
{
  word: "居眠り",
  kana: "いねむり",
  type: "名・サ变动词する自",
  meaning: "打瞌睡。",
  example: "$\\overset{じゅぎょう}{授業}$$\\overset{ちゅう}{中}$の$\\overset{いねむり}{居眠り}$を$\\overset{ちゅうい}{注意}$される。/上课打瞌睡被提醒了。 || $\\overset{ねむけ}{眠気}$に$\\overset{おそ}{襲}$われて、$\\overset{でんしゃ}{電車}$で$\\overset{いねむり}{居眠り}$する。/被睡意袭来，在电车上打起了瞌睡。"
},
{
  word: "言わば",
  kana: "いわば",
  type: "副词",
  meaning: "可以说是，譬如说。",
  example: "$\\overset{かれ}{彼}$は$\\overset{いわば}{言わば}$$\\overset{ある}{歩}$く$\\overset{じしょ}{辞書}$だ。/他可以说是活字典。"
},
{
  word: "右折",
  kana: "うせつ",
  type: "名・サ变动词する自",
  meaning: "右转。",
  example: "この$\\overset{こうさてん}{交差点}$は$\\overset{うせつ}{右折}$$\\overset{きんし}{禁止}$です。/这个十字路口禁止右转。 || $\\overset{しんごう}{信号}$を$\\overset{す}{過}$ぎてから$\\overset{うせつ}{右折}$する。/过了红绿灯之后右转。"
},
{
  word: "鰻",
  kana: "うなぎ",
  type: "名词",
  meaning: "鳗鱼。",
  example: "$\\overset{でまえ}{出前}$で$\\overset{うなぎ}{鰻}$の$\\overset{べんとう}{弁当}$を$\\overset{たの}{頼}$む。/叫外卖点鳗鱼便当。"
},
{
  word: "売り上げ",
  kana: "うりあげ",
  type: "名词",
  meaning: "销售额。",
  example: "この$\\overset{しょうひん}{商品}$が$\\overset{う}{売}$れて、$\\overset{う}{売}$り$\\overset{あ}{上}$げが$\\overset{あ}{上}$がった。/这件商品大卖，销售额上升了。"
},
{
  word: "売り切れ",
  kana: "うりきれ",
  type: "名词",
  meaning: "售罄，卖光。",
  example: "$\\overset{にんき}{人気}$$\\overset{しょうひん}{商品}$のため、もう$\\overset{う}{売}$り$\\overset{き}{切}$れだ。/因为是人气商品，已经卖光了。"
},
{
  word: "売り切れる",
  kana: "うりきれる",
  type: "一段自动词",
  meaning: "全部卖光。",
  example: "$\\overset{う}{売}$り$\\overset{だ}{出}$したチケットがすぐに$\\overset{う}{売}$り$\\overset{き}{切}$れた。/开始发售的票马上就卖光了。"
},
{
  word: "売り出す",
  kana: "うりだす",
  type: "五段他动词",
  meaning: "开始发售，推出。",
  example: "$\\overset{あたら}{新}$しい$\\overset{じゅうたく}{住宅}$を$\\overset{う}{売}$り$\\overset{だ}{出}$す。/开始发售新住宅。"
},
{
  word: "売れ行き",
  kana: "うれゆき",
  type: "名词",
  meaning: "销路，销售情况。",
  example: "この$\\overset{ほん}{本}$の$\\overset{う}{売}$れ$\\overset{ゆ}{行}$きは$\\overset{ひじょう}{非常}$に$\\overset{よ}{良}$い。/这本书的销路非常好。"
},
{
  word: "売れる",
  kana: "うれる",
  type: "一段自动词",
  meaning: "畅销，卖得出去。",
  example: "このデザインの$\\overset{くつした}{靴下}$はよく$\\overset{う}{売}$れる。/这种设计的袜子很畅销。"
},
{
  word: "大袈裟",
  kana: "おおげさ",
  type: "名・形动",
  meaning: "夸张，小题大做。",
  example: "$\\overset{おおげさ}{大袈裟}$に$\\overset{おどろ}{驚}$いて$\\overset{み}{見}$せる。/夸张地表现出惊讶的样子。 || $\\overset{かれ}{彼}$の$\\overset{はな}{話}$はいつも$\\overset{おおげさ}{大袈裟}$だ。/他的话总是很夸张。"
},
{
  word: "襲う",
  kana: "おそう",
  type: "五段他动词",
  meaning: "袭击，侵袭。",
  example: "ひどい$\\overset{ねむけ}{眠気}$が$\\overset{わたし}{私}$を$\\overset{おそ}{襲}$う。/严重的睡意向我袭来。"
},
{
  word: "帯びる",
  kana: "おびる",
  type: "一段他动词",
  meaning: "带有，呈现；佩戴。",
  example: "$\\overset{しんこく}{深刻}$な$\\overset{いみ}{意味}$を$\\overset{お}{帯}$びた$\\overset{できごと}{出来事}$。/带有着深刻意义的事件。"
},
{
  word: "改札口",
  kana: "かいさつぐち",
  type: "名词",
  meaning: "检票口。",
  example: "$\\overset{えき}{駅}$の$\\overset{かいさつぐち}{改札口}$で$\\overset{でむか}{出迎}$えをする。/在车站的检票口迎接。"
},
{
  word: "かねる",
  kana: "かねる",
  type: "一段他动词",
  meaning: "兼有；（接在动词连用形后）难以，不能。",
  example: "ご$\\overset{ようぼう}{要望}$にはお$\\overset{こた}{応}$えしかねます。/难以满足您的要求（此用法高考常考）。"
},
{
  word: "かわいがる",
  kana: "かわいがる",
  type: "五段他动词",
  meaning: "疼爱，宠爱。",
  example: "$\\overset{めした}{目下}$の$\\overset{ぶか}{部下}$をかわいがる。/疼爱手下的部下。"
},
{
  word: "考え",
  kana: "かんがえ",
  type: "名词",
  meaning: "想法，思考。",
  example: "$\\overset{たいしゅう}{大衆}$の$\\overset{かんがえ}{考え}$を$\\overset{りかい}{理解}$する。/理解大众的想法。"
},
{
  word: "口癖",
  kana: "くちぐせ",
  type: "名词",
  meaning: "口头禅。",
  example: "あの$\\overset{ひと}{人}$の$\\overset{くちぐせ}{口癖}$は$\\overset{まね}{真似}$しやすい。/那个人的口头禅很容易模仿。"
},
{
  word: "口々",
  kana: "くちぐち",
  type: "名・副词",
  meaning: "异口同声，七嘴八舌。",
  example: "$\\overset{ひと}{人}$の$\\overset{くちぐち}{口々}$に$\\overset{のぼ}{上}$る$\\overset{わだい}{話題}$。/人们七嘴八舌谈论的话题。 || $\\overset{かれ}{彼}$らは$\\overset{くちぐち}{口々}$に$\\overset{もんく}{文句}$を$\\overset{い}{言}$う。/他们七嘴八舌地发牢骚。"
},
{
  word: "口振り",
  kana: "くちぶり",
  type: "名词",
  meaning: "口气，说话的态度。",
  example: "$\\overset{じしん}{自信}$に$\\overset{み}{満}$ちた$\\overset{くちぶり}{口振り}$で$\\overset{い}{言}$い$\\overset{き}{切}$る。/用充满自信的口气断言。"
},
{
  word: "口紅",
  kana: "くちべに",
  type: "名词",
  meaning: "口红。",
  example: "$\\overset{くちびる}{唇}$に$\\overset{あか}{赤}$い$\\overset{くちべに}{口紅}$を$\\overset{ぬ}{塗}$る。/在嘴唇上涂红色的口红。"
},
{
  word: "ぐっすり",
  kana: "ぐっすり",
  type: "副词",
  meaning: "熟睡貌。",
  example: "$\\overset{ねぶそく}{寝不足}$だったので、ぐっすりと$\\overset{ねむ}{眠}$った。/因为睡眠不足，所以睡得很香。"
},
{
  word: "きっぱり",
  kana: "きっぱり",
  type: "副词・サ变动词する自",
  meaning: "断然，干脆。",
  example: "$\\overset{さそ}{誘}$いをきっぱりと$\\overset{ことわ}{断}$る。/干脆地拒绝邀请。 || $\\overset{たいど}{態度}$をきっぱりする。/态度坚决干脆。"
},
{
  word: "下回る",
  kana: "したまわる",
  type: "五段自动词",
  meaning: "低于，在……以下。",
  example: "$\\overset{う}{売}$り$\\overset{あ}{上}$げが$\\overset{もくひょう}{目標}$を$\\overset{したまわ}{下回}$る。/销售额低于目标。"
},
{
  word: "蛇口",
  kana: "じゃぐち",
  type: "名词",
  meaning: "水龙头。",
  example: "$\\overset{じゃぐち}{蛇口}$を$\\overset{ひね}{捻}$って、$\\overset{す}{澄}$んだ$\\overset{みず}{水}$を$\\overset{だ}{出}$す。/拧开水龙头，放出清澈的水。"
},
{
  word: "住宅",
  kana: "じゅうたく",
  type: "名词",
  meaning: "住宅。",
  example: "$\\overset{もよ}{最寄}$りの$\\overset{えき}{駅}$から$\\overset{ちか}{近}$い$\\overset{じゅうたく}{住宅}$。/离最近的车站很近的住宅。"
},
{
  word: "上達",
  kana: "じょうたつ",
  type: "名・サ变动词する自",
  meaning: "进步，提高。",
  example: "$\\overset{ごがく}{語学}$の$\\overset{じょうたつ}{上達}$が$\\overset{はや}{早}$い。/外语的进步很快。 || $\\overset{まいにち}{毎日}$$\\overset{れんしゅう}{練習}$してピアノが$\\overset{じょうたつ}{上達}$した。/每天练习，钢琴进步了。"
},
{
  word: "しょっちゅう",
  kana: "しょっちゅう",
  type: "副词",
  meaning: "经常，总是。",
  example: "$\\overset{かれ}{彼}$はしょっちゅう$\\overset{ちこく}{遅刻}$して、$\\overset{もんく}{文句}$を$\\overset{い}{言}$われる。/他总是迟到，然后被发牢骚抱怨。"
},
{
  word: "深刻",
  kana: "しんこく",
  type: "名・形动",
  meaning: "深刻，严重。",
  example: "$\\overset{じたい}{事態}$の$\\overset{しんこく}{深刻}$さを$\\overset{し}{知}$る。/了解事态的严重性。 || これは$\\overset{しんこく}{深刻}$な$\\overset{もんだい}{問題}$だ。/这是一个严重的问题。"
},
{
  word: "澄む",
  kana: "すむ",
  type: "五段自动词",
  meaning: "清澈，清澄。",
  example: "$\\overset{あき}{秋}$の$\\overset{そら}{空}$は$\\overset{あお}{青}$く$\\overset{す}{澄}$んでいる。/秋天的天空蔚蓝而清澈。"
},
{
  word: "擦り切れる",
  kana: "すりきれる",
  type: "一段自动词",
  meaning: "磨损，磨破。",
  example: "$\\overset{なが}{長}$く$\\overset{は}{履}$いた$\\overset{くつした}{靴下}$が$\\overset{す}{擦}$り$\\overset{き}{切}$れる。/穿了很久的袜子磨破了。"
},
{
  word: "迫る",
  kana: "せまる",
  type: "五段自他动词",
  meaning: "逼近，迫近（自）；强迫（他）。",
  example: "$\\overset{にゅうし}{入試}$の$\\overset{ひ}{日}$が$\\overset{め}{目}$の$\\overset{まえ}{前}$に$\\overset{せま}{迫}$る。/入学考试的日子迫在眼前。 || $\\overset{へんさい}{返済}$を$\\overset{せま}{迫}$る。/逼迫还款。"
},
{
  word: "それなら",
  kana: "それなら",
  type: "接续词",
  meaning: "既然那样，如果那样的话。",
  example: "それなら、$\\overset{いっしょ}{一緒}$に$\\overset{で}{出}$かけましょう。/既然那样，我们一起出门吧。"
},
{
  word: "大衆",
  kana: "たいしゅう",
  type: "名词",
  meaning: "大众。",
  example: "$\\overset{たいしゅう}{大衆}$の$\\overset{いけん}{意見}$を$\\overset{ひ}{引}$き$\\overset{つ}{付}$ける。/吸引大众的意见。"
},
{
  word: "出会い",
  kana: "であい",
  type: "名词",
  meaning: "相遇，邂逅。",
  example: "$\\overset{たび}{旅}$での$\\overset{すば}{素晴}$らしい$\\overset{であ}{出会}$いを$\\overset{たいせつ}{大切}$にする。/珍惜旅途中的美好相遇。"
},
{
  word: "出前",
  kana: "でまえ",
  type: "名・サ变动词する他",
  meaning: "外卖。",
  example: "$\\overset{でまえ}{出前}$の$\\overset{うなぎ}{鰻}$を$\\overset{た}{食}$べる。/吃外卖的鳗鱼。 || お$\\overset{なか}{腹}$が$\\overset{す}{空}$いたのでピザを$\\overset{でまえ}{出前}$する。/肚子饿了，所以点披萨外卖。"
},
{
  word: "出迎え",
  kana: "でむかえ",
  type: "名词",
  meaning: "迎接。",
  example: "$\\overset{えき}{駅}$まで$\\overset{ともだち}{友達}$の$\\overset{でむかえ}{出迎}$えに$\\overset{い}{行}$く。/去车站迎接朋友。"
},
{
  word: "舐める",
  kana: "なめる",
  type: "一段他动词",
  meaning: "舔；轻视，小看。",
  example: "$\\overset{あいて}{相手}$を$\\overset{な}{舐}$めると、$\\overset{いた}{痛}$い$\\overset{め}{目}$に$\\overset{あ}{遭}$う。/如果小看对手，就会吃苦头。"
},
{
  word: "鈍る",
  kana: "にぶる",
  type: "五段自动词",
  meaning: "变钝，迟钝。",
  example: "$\\overset{れんしゅう}{練習}$を$\\overset{やす}{休}$むと、$\\overset{かんかく}{感覚}$が$\\overset{にぶ}{鈍}$る。/停止练习的话，感觉就会变迟钝。"
},
{
  word: "入試",
  kana: "にゅうし",
  type: "名词",
  meaning: "入学考试（「入学試験」的略称）。",
  example: "$\\overset{にゅうし}{入試}$に$\\overset{む}{向}$けて、$\\overset{ねぶそく}{寝不足}$で$\\overset{べんきょう}{勉強}$する。/为了入学考试，睡眠不足地学习。"
},
{
  word: "寝溜め",
  kana: "ねだめ",
  type: "名・サ变动词する自",
  meaning: "补觉，多睡以备后用。",
  example: "$\\overset{しゅうまつ}{週末}$の$\\overset{ねだめ}{寝溜め}$で$\\overset{つか}{疲}$れをとる。/用周末的补觉来消除疲劳。 || $\\overset{やす}{休}$みの$\\overset{ひ}{日}$に$\\overset{ねだめ}{寝溜め}$する。/在休息日补觉。"
},
{
  word: "寝不足",
  kana: "ねぶそく",
  type: "名・形动",
  meaning: "睡眠不足。",
  example: "$\\overset{さいきん}{最近}$、$\\overset{ねぶそく}{寝不足}$が$\\overset{つづ}{続}$いている。/最近一直睡眠不足。 || $\\overset{ねぶそく}{寝不足}$な$\\overset{じょうたい}{状態}$で$\\overset{うんてん}{運転}$するのは$\\overset{きけん}{危険}$だ。/在睡眠不足的状态下驾驶很危险。"
},
{
  word: "眠気",
  kana: "ねむけ",
  type: "名词",
  meaning: "睡意。",
  example: "$\\overset{じゅぎょう}{授業}$$\\overset{ちゅう}{中}$に$\\overset{ねむけ}{眠気}$に$\\overset{おそ}{襲}$われる。/上课时被睡意袭来。"
},
{
  word: "ばったり",
  kana: "ばったり",
  type: "副词",
  meaning: "突然相遇貌；突然倒下/掉落貌。",
  example: "$\\overset{えき}{駅}$でばったりと$\\overset{むかし}{昔}$の$\\overset{ゆうじん}{友人}$に$\\overset{であ}{出会}$った。/在车站偶然遇见了以前的友人。"
},
{
  word: "引き起こす",
  kana: "ひきおこす",
  type: "五段他动词",
  meaning: "引起，惹起。",
  example: "$\\overset{おお}{大}$きな$\\overset{もんだい}{問題}$を$\\overset{ひ}{引}$き$\\overset{お}{起}$こす。/引发大问题。"
},
{
  word: "引き返す",
  kana: "ひきかえす",
  type: "五段自动词",
  meaning: "返回，折回。",
  example: "$\\overset{わす}{忘}$れ$\\overset{もの}{物}$に$\\overset{きづ}{気付}$いて、$\\overset{いえ}{家}$に$\\overset{ひ}{引}$き$\\overset{かえ}{返}$す。/意识到忘了东西，于是折返回家。"
},
{
  word: "引き付ける",
  kana: "ひきつける",
  type: "一段他动词",
  meaning: "吸引，诱惑；引起痉挛。",
  example: "$\\overset{かのじょ}{彼女}$の$\\overset{えがお}{笑顔}$は$\\overset{たいしゅう}{大衆}$の$\\overset{こころ}{心}$を$\\overset{ひ}{引}$き$\\overset{つ}{付}$ける。/她的笑容吸引了大众的心。"
},
{
  word: "引き分け",
  kana: "ひきわけ",
  type: "名词",
  meaning: "平局，不分胜负。",
  example: "$\\overset{しあい}{試合}$は$\\overset{いってん}{一点}$$\\overset{さ}{差}$で$\\overset{ひ}{引}$き$\\overset{わ}{分}$けに$\\overset{お}{終}$わった。/比赛以一分之差平局结束。"
},
{
  word: "非常口",
  kana: "ひじょうぐち",
  type: "名词",
  meaning: "安全出口。",
  example: "$\\overset{ひじょうぐち}{非常口}$の$\\overset{ちか}{近}$くに$\\overset{あつ}{集}$まる。/聚集在安全出口附近。"
},
{
  word: "引っ張る",
  kana: "ひっぱる",
  type: "五段他动词",
  meaning: "拉，拽；带领。",
  example: "チームを$\\overset{ひ}{引}$っ$\\overset{ぱ}{張}$って$\\overset{ゆうしょう}{優勝}$を$\\overset{めざ}{目指}$す。/带领队伍以夺冠为目标。"
},
{
  word: "捻る",
  kana: "ひねる",
  type: "五段他动词",
  meaning: "拧，扭；绞尽脑汁。",
  example: "$\\overset{じゃぐち}{蛇口}$を$\\overset{ひね}{捻}$って$\\overset{て}{手}$を$\\overset{あら}{洗}$う。/拧开水龙头洗手。"
},
{
  word: "部下",
  kana: "ぶか",
  type: "名词",
  meaning: "部下，下属。",
  example: "$\\overset{めうえ}{目上}$の$\\overset{じょうし}{上司}$が$\\overset{ぶか}{部下}$を$\\overset{よ}{呼}$び$\\overset{だ}{出}$す。/作为上司的长辈把部下叫出来。"
},
{
  word: "振り返る",
  kana: "ふりかえる",
  type: "五段自他动词",
  meaning: "回头看；回顾。",
  example: "$\\overset{こえ}{声}$がしたので、$\\overset{うし}{後}$ろを$\\overset{ふ}{振}$り$\\overset{かえ}{返}$る。/听到了声音，所以回头看。 || $\\overset{かこ}{過去}$の$\\overset{れきし}{歴史}$を$\\overset{ふ}{振}$り$\\overset{かえ}{返}$る。/回顾过去的历史。"
},
{
  word: "窓口",
  kana: "まどぐち",
  type: "名词",
  meaning: "窗口。",
  example: "$\\overset{えき}{駅}$の$\\overset{まどぐち}{窓口}$で$\\overset{きっぷ}{切符}$を$\\overset{か}{買}$う。/在车站的窗口买车票。"
},
{
  word: "真似る",
  kana: "まねる",
  type: "一段他动词",
  meaning: "模仿。",
  example: "$\\overset{せんぱい}{先輩}$のやり$\\overset{かた}{方}$を$\\overset{まね}{真似}$て$\\overset{れんしゅう}{練習}$する。/模仿前辈的做法进行练习。"
},
{
  word: "無口",
  kana: "むくち",
  type: "名・形动",
  meaning: "沉默寡言。",
  example: "$\\overset{かれ}{彼}$は$\\overset{むくち}{無口}$で、あまりしゃべらない。/他沉默寡言，不怎么说话。 || $\\overset{むくち}{無口}$な$\\overset{ひと}{人}$は$\\overset{かんが}{考}$えが$\\overset{ふか}{深}$いことが多い。/沉默寡言的人往往思想深刻。"
},
{
  word: "目上",
  kana: "めうえ",
  type: "名词",
  meaning: "长辈，上级。",
  example: "$\\overset{めうえ}{目上}$の$\\overset{ひと}{人}$には$\\overset{ていねい}{丁寧}$な$\\overset{ことば}{言葉}$を$\\overset{つか}{使}$う。/对长辈要使用礼貌的语言。"
},
{
  word: "目指す",
  kana: "めざす",
  type: "五段他动词",
  meaning: "以……为目标，瞄准。",
  example: "$\\overset{だいがく}{大学}$$\\overset{ごうかく}{合格}$を$\\overset{めざ}{目指}$して$\\overset{がんば}{頑張}$る。/以考上大学为目标而努力。"
},
{
  word: "目覚まし",
  kana: "めざまし",
  type: "名词",
  meaning: "闹钟（「目覚まし時計」的略称）；提神。",
  example: "$\\overset{めざまし}{目覚まし}$の$\\overset{おと}{音}$で$\\overset{お}{起}$きて$\\overset{で}{出}$かける。/被闹钟的声音叫醒并出门。"
},
{
  word: "目下",
  kana: "めした",
  type: "名词",
  meaning: "晚辈，下级。",
  example: "$\\overset{めした}{目下}$の$\\overset{ぶか}{部下}$を$\\overset{やさ}{優}$しく$\\overset{しどう}{指導}$する。/温柔地指导作为晚辈的下属。"
},
{
  word: "目の前",
  kana: "めのまえ",
  type: "名词",
  meaning: "眼前，面前。",
  example: "$\\overset{にゅうし}{入試}$が$\\overset{め}{目}$の$\\overset{まえ}{前}$に$\\overset{せま}{迫}$っている。/入学考试迫在眉睫。"
},
{
  word: "目眩",
  kana: "めまい",
  type: "名词",
  meaning: "头晕，目眩。",
  example: "$\\overset{ねぶそく}{寝不足}$のせいで$\\overset{めまい}{目眩}$がする。/因为睡眠不足的缘故感到头晕。"
},
{
  word: "最寄り",
  kana: "もより",
  type: "名词",
  meaning: "最近，附近。",
  example: "$\\overset{もよ}{最寄}$りの$\\overset{えき}{駅}$で$\\overset{ゆうじん}{友人}$と$\\overset{ごうりゅう}{合流}$する。/在最近的车站和朋友汇合。"
},
{
  word: "文句",
  kana: "もんく",
  type: "名词",
  meaning: "怨言，牢骚；词句。",
  example: "$\\overset{かれ}{彼}$は$\\overset{わるぐち}{悪口}$や$\\overset{もんく}{文句}$ばかり$\\overset{い}{言}$う。/他总是说坏话和发牢骚。"
},
{
  word: "呼び付ける",
  kana: "よびつける",
  type: "一段他动词",
  meaning: "叫来，唤来（带有上对下的强硬语气）。",
  example: "$\\overset{しゃちょう}{社長}$が$\\overset{ぶか}{部下}$を$\\overset{へや}{部屋}$に$\\overset{よ}{呼}$び$\\overset{つ}{付}$ける。/总经理把部下叫到房间里来。"
},
{
  word: "呼び方",
  kana: "よびかた",
  type: "名词",
  meaning: "称呼方式。",
  example: "$\\overset{めうえ}{目上}$の$\\overset{ひと}{人}$の$\\overset{ただ}{正}$しい$\\overset{よ}{呼}$び$\\overset{かた}{方}$を$\\overset{おぼ}{覚}$える。/记住长辈正确的称呼方式。"
},
{
  word: "呼び出す",
  kana: "よびだす",
  type: "五段他动词",
  meaning: "叫出来，传唤。",
  example: "$\\overset{ほうかご}{放課後}$、$\\overset{せんせい}{先生}$に$\\overset{よ}{呼}$び$\\overset{だ}{出}$された。/放学后，被老师叫出去了。"
},
{
  word: "悪口",
  kana: "わるぐち",
  type: "名词",
  meaning: "坏话。",
  example: "$\\overset{たにん}{他人}$の$\\overset{わるぐち}{悪口}$を$\\overset{い}{言}$うのはやめなさい。/不要再说别人的坏话了。"
},
{
  word: "赤い",
  kana: "あかい",
  type: "形容词",
  meaning: "红色的。",
  example: "$\\overset{あか}{赤}$い$\\overset{ふく}{服}$を$\\overset{き}{着}$た$\\overset{あか}{赤}$ちゃんがにこにこ$\\overset{わら}{笑}$う。/穿着红衣服的婴儿笑眯眯的。"
},
{
  word: "赤ちゃん",
  kana: "あかちゃん",
  type: "名词",
  meaning: "婴儿。",
  example: "$\\overset{あか}{赤}$ちゃんが$\\overset{は}{這}$ってベッドから$\\overset{お}{降}$りる。/婴儿爬着下床。"
},
{
  word: "明るい",
  kana: "あかるい",
  type: "形容词",
  meaning: "明亮的；开朗的。",
  example: "$\\overset{かのじょ}{彼女}$の$\\overset{あか}{明}$るい$\\overset{せいかく}{性格}$は$\\overset{だれ}{誰}$の$\\overset{め}{目}$にも$\\overset{あき}{明}$らかだ。/她开朗的性格在谁看来都很明显。"
},
{
  word: "明らか",
  kana: "あきらか",
  type: "形动",
  meaning: "明显，显然。",
  example: "$\\overset{じこ}{事故}$の$\\overset{げんいん}{原因}$が$\\overset{あき}{明}$らかになった。/事故的原因变得清楚了。"
},
{
  word: "生かす",
  kana: "いかす",
  type: "五段他动词",
  meaning: "充分利用，发挥；使活下去。",
  example: "$\\overset{じぶん}{自分}$の$\\overset{さいのう}{才能}$を$\\overset{い}{生}$かして$\\overset{い}{生}$きる。/发挥自己的才能生活下去。"
},
{
  word: "生きる",
  kana: "いきる",
  type: "一段自动词",
  meaning: "活着，生活。",
  example: "$\\overset{かれ}{彼}$は$\\overset{え}{絵}$を$\\overset{か}{描}$くために$\\overset{い}{生}$きている。/他是为了画画而活着的。"
},
{
  word: "絵",
  kana: "え",
  type: "名词",
  meaning: "画，图画。",
  example: "$\\overset{おお}{大}$きい$\\overset{え}{絵}$を$\\overset{か}{描}$いて、$\\overset{なかま}{仲間}$に$\\overset{み}{見}$せる。/画了一幅很大的画，给伙伴们看。"
},
{
  word: "大きい",
  kana: "おおきい",
  type: "形容词",
  meaning: "大的。",
  example: "$\\overset{おお}{大}$きな$\\overset{こえ}{声}$で$\\overset{おお}{大}$きい$\\overset{いぬ}{犬}$を$\\overset{よ}{呼}$ぶ。/大声呼唤大狗。"
},
{
  word: "大晦日",
  kana: "おおみそか",
  type: "名词",
  meaning: "大年三十，除夕。",
  example: "$\\overset{おおみそか}{大晦日}$の$\\overset{よる}{夜}$に$\\overset{じぶん}{自分}$の$\\overset{たちば}{立場}$を$\\overset{かんが}{考}$え$\\overset{なお}{直}$す。/在大年三十的夜晚重新思考自己的立场。"
},
{
  word: "立場",
  kana: "たちば",
  type: "名词",
  meaning: "立场，处境。",
  example: "$\\overset{あいて}{相手}$の$\\overset{たちば}{立場}$に$\\overset{た}{立}$って$\\overset{ものごと}{物事}$を$\\overset{かんが}{考}$える。/站在对方的立场上考虑事情。"
},
{
  word: "立つ",
  kana: "たつ",
  type: "五段自动词",
  meaning: "站，立。",
  example: "ちょうどその$\\overset{とき}{時}$、$\\overset{かれ}{彼}$が$\\overset{せき}{席}$から$\\overset{た}{立}$ち$\\overset{あ}{上}$がった。/正好在那时，他从座位上站了起来。"
},
{
  word: "ちょうど",
  kana: "ちょうど",
  type: "副词",
  meaning: "正好，恰好。",
  example: "$\\overset{えき}{駅}$に$\\overset{つ}{着}$いた$\\overset{とき}{時}$、ちょうど$\\overset{でんしゃ}{電車}$が$\\overset{しゅっぱつ}{出発}$した。/到达车站时，电车正好出发了。"
},
{
  word: "仲間",
  kana: "なかま",
  type: "名词",
  meaning: "伙伴，同伙。",
  example: "$\\overset{なかま}{仲間}$と$\\overset{いっしょ}{一緒}$ににこにこ$\\overset{わら}{笑}$う。/和伙伴们一起笑眯眯的。"
},
{
  word: "にこにこ",
  kana: "にこにこ",
  type: "副词・サ变动词する自",
  meaning: "笑眯眯地。",
  example: "$\\overset{かのじょ}{彼女}$はいつもにこにこしている。/她总是笑眯眯的。 || $\\overset{あか}{赤}$ちゃんがにこにこ$\\overset{わら}{笑}$う。/婴儿笑眯眯地笑着。"
},
{
  word: "乗る",
  kana: "のる",
  type: "五段自动词",
  meaning: "乘坐，搭乘。",
  example: "$\\overset{の}{乗}$る$\\overset{でんしゃ}{電車}$を$\\overset{まちが}{間違}$えて、$\\overset{ちこく}{遅刻}$した。/坐错了电车，迟到了。"
},
{
  word: "間違える",
  kana: "まちがえる",
  type: "一段他动词",
  meaning: "弄错，搞错。",
  example: "$\\overset{けいさん}{計算}$を$\\overset{まちが}{間違}$えて、$\\overset{あかじ}{赤字}$になった。/算错了账，出现了亏损。"
},
{
  word: "間に合う",
  kana: "まにあう",
  type: "五段自动词",
  meaning: "来得及，赶得上；够用。",
  example: "$\\overset{ま}{間}$も$\\overset{な}{無}$く$\\overset{しゅっぱつ}{出発}$するが、まだ$\\overset{ま}{間}$に$\\overset{あ}{合}$う。/马上就要出发了，但还来得及。"
},
{
  word: "間も無く",
  kana: "まもなく",
  type: "副词",
  meaning: "不久，马上。",
  example: "$\\overset{ま}{間}$も$\\overset{な}{無}$く$\\overset{えいが}{映画}$の$\\overset{じょうえい}{上映}$が$\\overset{はじ}{始}$まります。/电影马上就要开始放映了。"
},
{
  word: "持ち帰り",
  kana: "もちかえり",
  type: "名词",
  meaning: "打包带走。",
  example: "$\\overset{も}{持}$ち$\\overset{かえ}{帰}$りの$\\overset{べんとう}{弁当}$を$\\overset{も}{持}$って$\\overset{いえ}{家}$に$\\overset{かえ}{帰}$る。/拿着打包的便当回家。"
},
{
  word: "持つ",
  kana: "もつ",
  type: "五段他动词",
  meaning: "拿，持；拥有。",
  example: "$\\overset{ゆめ}{夢}$を$\\overset{も}{持}$って$\\overset{よ}{世}$の$\\overset{なか}{中}$を$\\overset{い}{生}$きていく。/怀揣着梦想在世上生活下去。"
},
{
  word: "世の中",
  kana: "よのなか",
  type: "名词",
  meaning: "世间，社会。",
  example: "$\\overset{よ}{世}$の$\\overset{なか}{中}$には$\\overset{い}{生}$け$\\overset{ばな}{花}$を$\\overset{あい}{愛}$する$\\overset{ひと}{人}$が$\\overset{おおぜい}{大勢}$いる。/世上有很多热爱插花的人。"
},
{
  word: "生け花",
  kana: "いけばな",
  type: "名词",
  meaning: "插花（日本传统艺术）。",
  example: "$\\overset{とこ}{床}$の$\\overset{ま}{間}$に$\\overset{きれい}{綺麗}$な$\\overset{い}{生}$け$\\overset{ばな}{花}$を$\\overset{かざ}{飾}$る。/在壁龛里装饰着漂亮的插花。"
},
{
  word: "大いに",
  kana: "おおいに",
  type: "副词",
  meaning: "非常，大大地。",
  example: "$\\overset{おおぜい}{大勢}$の$\\overset{ひと}{人}$が$\\overset{あつ}{集}$まり、$\\overset{おお}{大}$いに$\\overset{も}{盛}$り$\\overset{あ}{上}$がった。/聚集了很多人，气氛非常热烈。"
},
{
  word: "大勢",
  kana: "おおぜい",
  type: "名词・副词",
  meaning: "许多人，众人。",
  example: "$\\overset{おおぜい}{大勢}$の$\\overset{かんきゃく}{観客}$が$\\overset{おおごえ}{大声}$で$\\overset{おうえん}{応援}$する。/众多观众大声地声援。"
},
{
  word: "立てる",
  kana: "たてる",
  type: "一段他动词",
  meaning: "立起，竖起；制定，建立。",
  example: "$\\overset{つか}{使}$い$\\overset{す}{捨}$ての$\\overset{どうぐ}{道具}$を$\\overset{へ}{減}$らす$\\overset{けいかく}{計画}$を$\\overset{た}{立}$てる。/制定减少使用一次性工具的计划。"
},
{
  word: "使い捨て",
  kana: "つかいすて",
  type: "名词",
  meaning: "一次性使用，用完即弃。",
  example: "$\\overset{かんきょう}{環境}$$\\overset{ほご}{保護}$のため、$\\overset{つか}{使}$い$\\overset{す}{捨}$ての$\\overset{わ}{割}$り$\\overset{ばし}{箸}$を$\\overset{つか}{使}$わない。/为了保护环境，不使用一次性筷子。"
},
{
  word: "床の間",
  kana: "とこのま",
  type: "名词",
  meaning: "壁龛（日式房间里挂书画、摆花瓶的凹进去的地方）。",
  example: "$\\overset{とこ}{床}$の$\\overset{ま}{間}$に$\\overset{りっぱ}{立派}$な$\\overset{え}{絵}$と$\\overset{い}{生}$け$\\overset{ばな}{花}$がある。/壁龛里有精美的画和插花。"
},
{
  word: "乗り換える",
  kana: "のりかえる",
  type: "一段自动词",
  meaning: "换乘。",
  example: "$\\overset{つぎ}{次}$の$\\overset{えき}{駅}$で$\\overset{しんかんせん}{新幹線}$に$\\overset{の}{乗}$り$\\overset{か}{換}$える。/在下一站换乘新干线。"
},
{
  word: "乗り越える",
  kana: "のりこえる",
  type: "一段他动词",
  meaning: "越过；克服。",
  example: "$\\overset{こんなん}{困難}$を$\\overset{の}{乗}$り$\\overset{こ}{越}$えた$\\overset{ひと}{人}$の$\\overset{わりあい}{割合}$が$\\overset{じょうしょう}{上昇}$した。/克服了困难的人的比例上升了。"
},
{
  word: "割合",
  kana: "わりあい",
  type: "名・副词",
  meaning: "比例；比较地。",
  example: "$\\overset{だんじょ}{男女}$の$\\overset{わりあい}{割合}$を$\\overset{けいさん}{計算}$する。/计算男女的比例。 || このレストランの$\\overset{りょうり}{料理}$は$\\overset{わりあい}{割合}$$\\overset{おい}{美味}$しい。/这家餐厅的菜出乎意料地好吃。"
},
{
  word: "割り勘",
  kana: "わりかん",
  type: "名词",
  meaning: "AA制，平摊费用。",
  example: "$\\overset{わりびき}{割引}$された$\\overset{しょくじ}{食事}$$\\overset{だい}{代}$を$\\overset{わ}{割}$り$\\overset{かん}{勘}$にする。/将打折后的餐费AA制平摊。"
},
{
  word: "割引",
  kana: "わりびき",
  type: "名・サ变动词する他",
  meaning: "折扣，打折。",
  example: "$\\overset{がくせい}{学生}$$\\overset{わりびき}{割引}$を$\\overset{りよう}{利用}$して$\\overset{えいが}{映画}$を$\\overset{み}{見}$る。/利用学生折扣看电影。 || $\\overset{しょうひん}{商品}$の$\\overset{ねだん}{値段}$を$\\overset{いち}{一}$$\\overset{わり}{割}$$\\overset{わりびき}{割引}$する。/将商品价格打九折（减去一成）。"
},
{
  word: "割る",
  kana: "わる",
  type: "五段他动词",
  meaning: "打碎，打破；分开，除以。",
  example: "コップを$\\overset{お}{落}$として$\\overset{わ}{割}$ると、ガラスが$\\overset{こなごな}{粉々}$に$\\overset{わ}{割}$れた。/把杯子掉在地上打破后，玻璃碎成了渣。"
},
{
  word: "割れる",
  kana: "われる",
  type: "一段自动词",
  meaning: "碎，破裂。",
  example: "$\\overset{まど}{窓}$ガラスが$\\overset{おおゆき}{大雪}$のせいで$\\overset{わ}{割}$れてしまった。/窗玻璃因为大雪的缘故碎了。"
},
{
  word: "明かり",
  kana: "あかり",
  type: "名词",
  meaning: "光线，照明，灯光。",
  example: "$\\overset{へや}{部屋}$の$\\overset{あか}{明}$かりの$\\overset{した}{下}$で$\\overset{あか}{赤}$ちゃんに$\\overset{えほん}{絵本}$を$\\overset{よ}{読}$む。/在房间的灯光下给婴儿读绘本。"
},
{
  word: "絵本",
  kana: "えほん",
  type: "名词",
  meaning: "绘本，画册。",
  example: "$\\overset{ことり}{小鳥}$が$\\overset{か}{描}$かれた$\\overset{えほん}{絵本}$を$\\overset{こども}{子供}$に$\\overset{か}{買}$う。/给孩子买画着小鸟的绘本。"
},
{
  word: "大雨",
  kana: "おおあめ",
  type: "名词",
  meaning: "大雨。",
  example: "$\\overset{おおあめ}{大雨}$の$\\overset{なか}{中}$、$\\overset{おお}{大}$きな$\\overset{かさ}{傘}$を$\\overset{さ}{差}$して$\\overset{おおどお}{大通}$りを$\\overset{ある}{歩}$く。/在大雨中，撑着一把大伞走在大马路上。"
},
{
  word: "大きな",
  kana: "おおきな",
  type: "连体词",
  meaning: "大的（只能接在名词前）。",
  example: "$\\overset{おおどお}{大通}$りに$\\overset{おお}{大}$きな$\\overset{たてもの}{建物}$が$\\overset{た}{立}$ち$\\overset{なら}{並}$ぶ。/大马路上矗立着许多高大的建筑物。"
},
{
  word: "大通り",
  kana: "おおどおり",
  type: "名词",
  meaning: "大马路，主干道。",
  example: "$\\overset{くるま}{車}$で$\\overset{おおどお}{大通}$りを$\\overset{よこぎ}{横切}$る。/开车横穿大马路。"
},
{
  word: "金持ち",
  kana: "かねもち",
  type: "名词",
  meaning: "有钱人，富翁。",
  example: "$\\overset{かねも}{金持}$ちの$\\overset{かれ}{彼}$は$\\overset{やちん}{家賃}$の$\\overset{たか}{高}$い$\\overset{じゅうたく}{住宅}$に$\\overset{す}{住}$む。/有钱的他住在房租很高的住宅里。"
},
{
  word: "語",
  kana: "ご",
  type: "名・接尾词",
  meaning: "语言，词语。",
  example: "$\\overset{がいこく}{外国}$$\\overset{ご}{語}$の$\\overset{がくしゅう}{学習}$に$\\overset{せいいっぱい}{精一杯}$$\\overset{どりょく}{努力}$する。/竭尽全力努力学习外语。"
},
{
  word: "号",
  kana: "ごう",
  type: "名・接尾词",
  meaning: "号，号码；期刊的期数。",
  example: "あの$\\overset{ざっし}{雑誌}$の$\\overset{さいしん}{最新}$$\\overset{ごう}{号}$を$\\overset{か}{買}$う。/买那本杂志的最新一期。"
},
{
  word: "小遣い",
  kana: "こづかい",
  type: "名词",
  meaning: "零花钱。",
  example: "$\\overset{た}{貯}$めた$\\overset{こづかい}{小遣い}$で$\\overset{ことり}{小鳥}$の$\\overset{えさ}{餌}$を$\\overset{か}{買}$う。/用攒下的零花钱买小鸟的饵料。"
},
{
  word: "小鳥",
  kana: "ことり",
  type: "名词",
  meaning: "小鸟。",
  example: "$\\overset{き}{木}$の$\\overset{うえ}{上}$で$\\overset{ことり}{小鳥}$が$\\overset{な}{鳴}$いている。/小鸟在树上鸣叫。"
},
{
  word: "さん",
  kana: "さん",
  type: "接尾词",
  meaning: "先生，女士，同学（接在人名或职务等之后表敬意）。",
  example: "$\\overset{たなか}{田中}$さんが$\\overset{きゅう}{急}$に$\\overset{せき}{席}$から$\\overset{た}{立}$ち$\\overset{あ}{上}$がった。/田中先生突然从座位上站了起来。"
},
{
  word: "立ち上がる",
  kana: "たちあがる",
  type: "五段自动词",
  meaning: "站起来，起立；振作起来。",
  example: "$\\overset{しっぱい}{失敗}$から$\\overset{た}{立}$ち$\\overset{あ}{上}$がり、また$\\overset{まえ}{前}$に$\\overset{すす}{進}$む。/从失败中振作起来，再次向前迈进。"
},
{
  word: "だらけ",
  kana: "だらけ",
  type: "接尾词",
  meaning: "满是，全是（多指灰尘、泥土、错误等消极事物）。",
  example: "$\\overset{あめ}{雨}$のせいで$\\overset{くつ}{靴}$が$\\overset{どろ}{泥}$だらけになった。/因为下雨，鞋子沾满了泥。"
},
{
  word: "ちゃん",
  kana: "ちゃん",
  type: "接尾词",
  meaning: "（接在小孩或亲近的人名后表亲昵的称呼）。",
  example: "$\\overset{どろ}{泥}$だらけになった$\\overset{ねこ}{猫}$ちゃんを$\\overset{あら}{洗}$う。/给沾满泥巴的小猫洗澡。"
},
{
  word: "ところどころ",
  kana: "ところどころ",
  type: "名・副词",
  meaning: "到处，处处。",
  example: "$\\overset{かべ}{壁}$のところどころに$\\overset{あぶらえ}{油絵}$が$\\overset{かざ}{飾}$ってある。/墙上到处都装饰着油画。"
},
{
  word: "乗せる",
  kana: "のせる",
  type: "一段他动词",
  meaning: "使乘坐，装载；放上。",
  example: "$\\overset{おも}{重}$い$\\overset{こづつみ}{小包}$を$\\overset{の}{乗}$り$\\overset{もの}{物}$に$\\overset{の}{乗}$せる。/把重包裹装到交通工具上。"
},
{
  word: "乗り物",
  kana: "のりもの",
  type: "名词",
  meaning: "交通工具。",
  example: "$\\overset{の}{乗}$り$\\overset{もの}{物}$が$\\overset{べんり}{便利}$な$\\overset{ばしょ}{場所}$は$\\overset{やちん}{家賃}$が$\\overset{たか}{高}$い。/交通工具便利的地方房租很高。"
},
{
  word: "家賃",
  kana: "やちん",
  type: "名词",
  meaning: "房租。",
  example: "$\\overset{おおや}{大家}$さんに$\\overset{こんげつ}{今月}$の$\\overset{やちん}{家賃}$を$\\overset{はら}{払}$う。/给房东付这个月的房租。"
},
{
  word: "あいにく",
  kana: "あいにく",
  type: "副词・形动",
  meaning: "不巧，偏巧。",
  example: "あいにく、$\\overset{あか}{赤}$のペンが$\\overset{う}{売}$り$\\overset{き}{切}$れた。/真不巧，红色的笔卖光了。 || あいにく$\\overset{な}{な}$$\\overset{てんき}{天気}$で、$\\overset{がいしゅつ}{外出}$をあきらめた。/天气很不巧，放弃了出门。"
},
{
  word: "赤",
  kana: "あか",
  type: "名词",
  meaning: "红色。",
  example: "$\\overset{しんごう}{信号}$が$\\overset{あか}{赤}$に$\\overset{か}{変}$わったので$\\overset{と}{止}$まる。/红绿灯变红了，所以停下来。"
},
{
  word: "赤字",
  kana: "あかじ",
  type: "名词",
  meaning: "赤字，亏损；红字。",
  example: "$\\overset{かいしゃ}{会社}$が$\\overset{あかじ}{赤字}$で、$\\overset{けいえい}{経営}$に$\\overset{あかしんごう}{赤信号}$が$\\overset{とも}{点}$った。/公司出现亏损，经营亮起了红灯。"
},
{
  word: "赤信号",
  kana: "あかしんごう",
  type: "名词",
  meaning: "红灯；危险信号。",
  example: "$\\overset{あかしんごう}{赤信号}$を$\\overset{むし}{無視}$して$\\overset{よこぎ}{横切}$るのは$\\overset{きけん}{危険}$だ。/无视红灯横穿马路很危险。"
},
{
  word: "赤ん坊",
  kana: "あかんぼう",
  type: "名词",
  meaning: "婴儿。",
  example: "$\\overset{あか}{赤}$ん$\\overset{ぼう}{坊}$が$\\overset{あぶらえ}{油絵}$の$\\overset{ぐ}{具}$に$\\overset{ふ}{触}$れて$\\overset{て}{手}$が$\\overset{よご}{汚}$れた。/婴儿摸了油画颜料，手弄脏了。"
},
{
  word: "油絵",
  kana: "あぶらえ",
  type: "名词",
  meaning: "油画。",
  example: "$\\overset{しゅみ}{趣味}$で$\\overset{ふうけい}{風景}$の$\\overset{あぶらえ}{油絵}$を$\\overset{か}{描}$く。/作为爱好画风景油画。"
},
{
  word: "生き生き",
  kana: "いきいき",
  type: "副词・サ变动词する自",
  meaning: "生机勃勃地，栩栩如生地。",
  example: "$\\overset{い}{生}$き$\\overset{い}{生}$きと$\\overset{か}{描}$かれた$\\overset{にがおえ}{似顔絵}$。/栩栩如生地画出的肖像画。 || $\\overset{かれ}{彼}$は$\\overset{しごと}{仕事}$で$\\overset{い}{生}$き$\\overset{い}{生}$きしている。/他在工作中显得生机勃勃。"
},
{
  word: "生き甲斐",
  kana: "いきがい",
  type: "名词",
  meaning: "生存的意义，生活的价值。",
  example: "$\\overset{い}{生}$き$\\overset{い}{生}$きと$\\overset{はたら}{働}$くことが$\\overset{かれ}{彼}$の$\\overset{い}{生}$き$\\overset{がい}{甲斐}$だ。/充满活力地工作是他生存的意义。"
},
{
  word: "生き方",
  kana: "いきかた",
  type: "名词",
  meaning: "生活方式。",
  example: "$\\overset{きび}{厳}$しい$\\overset{よ}{世}$の$\\overset{なか}{中}$で$\\overset{い}{生}$き$\\overset{のこ}{残}$るための$\\overset{い}{生}$き$\\overset{かた}{方}$を$\\overset{さが}{探}$す。/寻找在严峻的世道中生存下去的生活方式。"
},
{
  word: "生き残る",
  kana: "いきのこる",
  type: "五段自动词",
  meaning: "幸存，存活。",
  example: "$\\overset{はげ}{激}$しい$\\overset{きょうそう}{競争}$の$\\overset{なか}{中}$で$\\overset{い}{生}$き$\\overset{のこ}{残}$る。/在激烈的竞争中幸存下来。"
},
{
  word: "生き延びる",
  kana: "いきのびる",
  type: "一段自动词",
  meaning: "幸存，活下来。",
  example: "$\\overset{だいじしん}{大地震}$から$\\overset{きせき}{奇跡}$的$\\overset{てき}{的}$に$\\overset{い}{生}$き$\\overset{のび}{延}$びた$\\overset{い}{生}$き$\\overset{もの}{物}$。/在大地震中奇迹般活下来的生物。"
},
{
  word: "生き物",
  kana: "いきもの",
  type: "名词",
  meaning: "生物，动物。",
  example: "$\\overset{しぜん}{自然}$の$\\overset{なか}{中}$で$\\overset{おお}{多}$くの$\\overset{い}{生}$き$\\overset{もの}{物}$を$\\overset{かんさつ}{観察}$する。/在自然中观察许多生物。"
},
{
  word: "上回る",
  kana: "うわまわる",
  type: "五段自动词",
  meaning: "超过，超出。",
  example: "$\\overset{え}{絵}$の$\\overset{ぐ}{具}$の$\\overset{ひよう}{費用}$が$\\overset{よさん}{予算}$を$\\overset{うわまわ}{上回}$った。/颜料的费用超出了预算。"
},
{
  word: "絵の具",
  kana: "えのぐ",
  type: "名词",
  meaning: "颜料。",
  example: "$\\overset{え}{絵}$の$\\overset{ぐ}{具}$を$\\overset{つか}{使}$って$\\overset{おおがた}{大型}$の$\\overset{えはがき}{絵葉書}$を$\\overset{か}{描}$く。/用颜料画大型的风景明信片。"
},
{
  word: "絵葉書",
  kana: "えはがき",
  type: "名词",
  meaning: "风景明信片。",
  example: "$\\overset{りょこう}{旅行}$$\\overset{さき}{先}$から$\\overset{ともだち}{友達}$に$\\overset{えはがき}{絵葉書}$を$\\overset{おく}{送}$る。/从旅行地给朋友寄风景明信片。"
},
{
  word: "大型",
  kana: "おおがた",
  type: "名・形动",
  meaning: "大型。",
  example: "$\\overset{おおがた}{大型}$の$\\overset{たいふう}{台風}$が$\\overset{せま}{迫}$っている。/大型台风正在逼近。 || この$\\overset{みせ}{店}$には$\\overset{おおがた}{大型}$な$\\overset{かぐ}{家具}$が$\\overset{おお}{多}$い。/这家店里大型家具很多。"
},
{
  word: "大きさ",
  kana: "おおきさ",
  type: "名词",
  meaning: "大小。",
  example: "その$\\overset{たてもの}{建物}$の$\\overset{おお}{大}$きさに$\\overset{おどろ}{驚}$いて$\\overset{おおごえ}{大声}$を$\\overset{だ}{出}$す。/对那栋建筑物的大小感到惊讶而大叫出声。"
},
{
  word: "大声",
  kana: "おおごえ",
  type: "名词",
  meaning: "大声。",
  example: "$\\overset{おおごえ}{大声}$を$\\overset{だ}{出}$して$\\overset{なかま}{仲間}$を$\\overset{よ}{呼}$ぶ。/大声喊叫呼唤伙伴。"
},
{
  word: "大手",
  kana: "おおて",
  type: "名词",
  meaning: "大企业，大公司。",
  example: "$\\overset{おおて}{大手}$の$\\overset{かいしゃ}{会社}$が$\\overset{おおはば}{大幅}$な$\\overset{あかじ}{赤字}$を$\\overset{だ}{出}$した。/大公司出现了大幅的亏损。"
},
{
  word: "大幅",
  kana: "おおはば",
  type: "名・形动",
  meaning: "大幅，大幅度。",
  example: "$\\overset{おおはば}{大幅}$な$\\overset{きゅうりょう}{給料}$の$\\overset{ひ}{引}$き$\\overset{あ}{上}$げを$\\overset{ようきゅう}{要求}$する。/要求大幅度提高工资。 || $\\overset{けいかく}{計画}$が$\\overset{おおはば}{大幅}$に$\\overset{へんこう}{変更}$された。/计划被大幅度地更改了。"
},
{
  word: "大昔",
  kana: "おおむかし",
  type: "名词",
  meaning: "很久以前，远古。",
  example: "$\\overset{おおむかし}{大昔}$の$\\overset{いせき}{遺跡}$の$\\overset{ちか}{近}$くで$\\overset{おおもり}{大盛}$りのうどんを$\\overset{た}{食}$べる。/在远古遗迹的附近吃大份的乌冬面。"
},
{
  word: "大盛り",
  kana: "おおもり",
  type: "名词",
  meaning: "大份（食物），盛得很多。",
  example: "$\\overset{しょくどう}{食堂}$でご$\\overset{はん}{飯}$を$\\overset{おおもり}{大盛}$りにしてもらう。/在食堂请人把米饭盛大份。"
},
{
  word: "大家",
  kana: "おおや",
  type: "名词",
  meaning: "房东。",
  example: "$\\overset{おおや}{大家}$さんと$\\overset{いっしょ}{一緒}$に$\\overset{おおゆき}{大雪}$を$\\overset{かたづ}{片付}$ける。/和房东一起清理大雪。"
},
{
  word: "大雪",
  kana: "おおゆき",
  type: "名词",
  meaning: "大雪。",
  example: "$\\overset{おおゆき}{大雪}$の$\\overset{えいきょう}{影響}$で$\\overset{びん}{便}$が$\\overset{けっこう}{欠航}$になった。/受大雪影响航班取消了。"
},
{
  word: "大揺れ",
  kana: "おおゆれ",
  type: "名・サ变动词する自",
  meaning: "大摇晃，剧烈摇晃。",
  example: "$\\overset{じしん}{地震}$で$\\overset{おおゆれ}{大揺}$れがあった。/因为地震有了剧烈的摇晃。 || $\\overset{ふね}{船}$が$\\overset{なみ}{波}$で$\\overset{おおゆれ}{大揺}$れする。/船因波浪而剧烈摇晃。"
},
{
  word: "大凡",
  kana: "おおよそ",
  type: "副词・名词",
  meaning: "大约，大概。",
  example: "$\\overset{じしん}{地震}$で$\\overset{おおゆれ}{大揺}$れしたが、$\\overset{おおよそ}{大凡}$の$\\overset{ひがい}{被害}$は$\\overset{すく}{少}$ない。/虽然地震引发了剧烈摇晃，但大概的受灾情况很少。 || $\\overset{おおよそ}{大凡}$の$\\overset{じじょう}{事情}$は$\\overset{りかい}{理解}$した。/大概的情况已经了解了。"
},
{
  word: "臆病",
  kana: "おくびょう",
  type: "名・形动",
  meaning: "胆小，怯懦。",
  example: "$\\overset{おくびょう}{臆病}$$\\overset{かぜ}{風}$に$\\overset{ふ}{吹}$かれる。/感到胆怯（被怯懦之风吹拂）。 || $\\overset{かれ}{彼}$は$\\overset{おくびょう}{臆病}$な$\\overset{せいかく}{性格}$だが、$\\overset{いっしょうけんめい}{一生懸命}$お$\\overset{かね}{金}$を$\\overset{かせ}{稼}$ぐ。/他虽然性格胆小，但拼命赚钱。"
},
{
  word: "稼ぐ",
  kana: "かせぐ",
  type: "五段他动词",
  meaning: "赚钱，挣钱；争取（时间、分数等）。",
  example: "$\\overset{じかん}{時間}$を$\\overset{かせ}{稼}$いで、かろうじて$\\overset{し}{締}$め$\\overset{き}{切}$りに$\\overset{ま}{間}$に$\\overset{あ}{合}$う。/争取时间，好不容易才赶上截止日期。"
},
{
  word: "かろうじて",
  kana: "かろうじて",
  type: "副词",
  meaning: "勉强，好不容易才。",
  example: "$\\overset{はし}{走}$って、かろうじて$\\overset{でんしゃ}{電車}$に$\\overset{ま}{間}$に$\\overset{あ}{合}$った。/跑着好不容易才赶上了电车。"
},
{
  word: "鑑賞",
  kana: "かんしょう",
  type: "名・サ变动词する他",
  meaning: "鉴赏，欣赏。",
  example: "$\\overset{げいじゅつ}{芸術}$の$\\overset{かんしょう}{鑑賞}$$\\overset{りょく}{力}$を$\\overset{たか}{高}$める。/提高对艺术的鉴赏力。 || $\\overset{くるまいす}{車椅子}$に$\\overset{の}{乗}$って$\\overset{びじゅつかん}{美術館}$で$\\overset{え}{絵}$を$\\overset{かんしょう}{鑑賞}$する。/坐在轮椅上在美术馆欣赏画作。"
},
{
  word: "車椅子",
  kana: "くるまいす",
  type: "名词",
  meaning: "轮椅。",
  example: "$\\overset{こさめ}{小雨}$の$\\overset{なか}{中}$、$\\overset{くるまいす}{車椅子}$を$\\overset{お}{押}$して$\\overset{ある}{歩}$く。/在小雨中推着轮椅行走。"
},
{
  word: "小雨",
  kana: "こさめ",
  type: "名词",
  meaning: "小雨。",
  example: "$\\overset{こさめ}{小雨}$がしとしとと$\\overset{ふ}{降}$っている。/小雨淅淅沥沥地下着。"
},
{
  word: "こっそり",
  kana: "こっそり",
  type: "副词",
  meaning: "悄悄地，偷偷地。",
  example: "$\\overset{おや}{親}$に$\\overset{かく}{隠}$れてこっそりと$\\overset{こづつみ}{小包}$を$\\overset{あ}{開}$ける。/瞒着父母偷偷地打开包裹。"
},
{
  word: "小包",
  kana: "こづつみ",
  type: "名词",
  meaning: "包裹。",
  example: "$\\overset{ゆうびんきょく}{郵便局}$から$\\overset{こづつみ}{小包}$が$\\overset{とど}{届}$いた。/从邮局寄来了包裹。"
},
{
  word: "小麦",
  kana: "こむぎ",
  type: "名词",
  meaning: "小麦。",
  example: "$\\overset{こむぎ}{小麦}$をひいて$\\overset{こむぎこ}{小麦粉}$を$\\overset{つく}{作}$る。/磨小麦做成面粉。"
},
{
  word: "小麦粉",
  kana: "こむぎこ",
  type: "名词",
  meaning: "面粉。",
  example: "$\\overset{こむぎこ}{小麦粉}$でおいしいうどんを$\\overset{つく}{作}$る。/用面粉做美味的乌冬面。"
},
{
  word: "頼りに",
  kana: "たよりに",
  type: "词组",
  meaning: "依靠，依赖。",
  example: "$\\overset{かれ}{彼}$を$\\overset{たよ}{頼}$りにして、$\\overset{せいいっぱい}{精一杯}$$\\overset{たいさく}{対策}$を$\\overset{た}{立}$てる。/依靠他，竭尽全力制定对策。"
},
{
  word: "しとしと",
  kana: "しとしと",
  type: "副词",
  meaning: "淅淅沥沥地（多指下雨）。",
  example: "しとしとと$\\overset{あめ}{雨}$が$\\overset{ふ}{降}$る$\\overset{なか}{中}$、$\\overset{かさ}{傘}$を$\\overset{たよ}{頼}$りに$\\overset{ある}{歩}$く。/在淅淅沥沥下着雨的时候，依靠着伞行走。"
},
{
  word: "締め切り",
  kana: "しめきり",
  type: "名词",
  meaning: "截止日期。",
  example: "レポートの$\\overset{し}{締}$め$\\overset{き}{切}$りが$\\overset{せま}{迫}$っている。/报告的截止日期迫在眉睫。"
},
{
  word: "精一杯",
  kana: "せいいっぱい",
  type: "副词・名词",
  meaning: "竭尽全力。",
  example: "$\\overset{しけん}{試験}$に$\\overset{む}{向}$けて$\\overset{せいいっぱい}{精一杯}$$\\overset{どりょく}{努力}$する。/为了考试竭尽全力努力。 || これが$\\overset{わたし}{私}$の$\\overset{せいいっぱい}{精一杯}$だ。/这就是我的极限（竭尽全力）了。"
},
{
  word: "対策",
  kana: "たいさく",
  type: "名词",
  meaning: "对策。",
  example: "$\\overset{みせ}{店}$が$\\overset{た}{立}$ち$\\overset{なら}{並}$ぶ$\\overset{おおどお}{大通}$りで、$\\overset{じゅうたい}{渋滞}$の$\\overset{たいさく}{対策}$を$\\overset{ね}{練}$る。/在店铺林立的大马路上，构思堵车的对策。"
},
{
  word: "立ち並ぶ",
  kana: "たちならぶ",
  type: "五段自动词",
  meaning: "排列，并排；匹敌。",
  example: "$\\overset{どうろ}{道路}$の$\\overset{りょうがわ}{両側}$にビルが$\\overset{た}{立}$ち$\\overset{なら}{並}$ぶ。/道路两侧大楼林立。"
},
{
  word: "立ち話",
  kana: "たちばなし",
  type: "名・サ变动词する自",
  meaning: "站着说话，站着聊天。",
  example: "$\\overset{た}{立}$ち$\\overset{ばなし}{話}$もなんだから、$\\overset{なか}{中}$に$\\overset{はい}{入}$ろう。/站着说话也不太好，进去吧。 || $\\overset{た}{立}$て$\\overset{ふだ}{札}$の$\\overset{まえ}{前}$で$\\overset{ゆうじん}{友人}$と$\\overset{た}{立}$ち$\\overset{ばなし}{話}$する。/在告示牌前面和朋友站着聊天。"
},
{
  word: "立て札",
  kana: "たてふだ",
  type: "名词",
  meaning: "告示牌，木牌。",
  example: "$\\overset{こうえん}{公園}$の$\\overset{い}{入}$り$\\overset{ぐち}{口}$に$\\overset{た}{立}$て$\\overset{ふだ}{札}$が$\\overset{た}{立}$っている。/公园入口处竖着一块告示牌。"
},
{
  word: "似顔絵",
  kana: "にがおえ",
  type: "名词",
  meaning: "肖像画，画像。",
  example: "$\\overset{にがおえ}{似顔絵}$を$\\overset{か}{描}$くのに$\\overset{むちゅう}{夢中}$になって、$\\overset{でんしゃ}{電車}$に$\\overset{の}{乗}$り$\\overset{おく}{遅}$れる。/沉迷于画肖像画，结果没赶上电车。"
},
{
  word: "乗り遅れる",
  kana: "のりおくれる",
  type: "一段自动词",
  meaning: "没赶上（车，船等）；落后于。",
  example: "$\\overset{じだい}{時代}$の$\\overset{りゅうこう}{流行}$に$\\overset{の}{乗}$り$\\overset{おく}{遅}$れる。/落后于时代的流行。"
},
{
  word: "乗り換え",
  kana: "のりかえ",
  type: "名词",
  meaning: "换乘。",
  example: "$\\overset{の}{乗}$り$\\overset{か}{換}$えの$\\overset{えき}{駅}$で$\\overset{いそ}{急}$いで$\\overset{でんしゃ}{電車}$に$\\overset{の}{乗}$り$\\overset{こ}{込}$む。/在换乘的车站急急忙忙地坐进电车。"
},
{
  word: "乗り込む",
  kana: "のりこむ",
  type: "五段自动词",
  meaning: "乘上，坐进；进入，开进。",
  example: "$\\overset{の}{乗}$り$\\overset{ば}{場}$からバスに$\\overset{の}{乗}$り$\\overset{こ}{込}$む。/从乘车点坐进公交车。"
},
{
  word: "乗り場",
  kana: "のりば",
  type: "名词",
  meaning: "乘车点，上车处。",
  example: "$\\overset{きっぷ}{切符}$を$\\overset{か}{買}$って、タクシーの$\\overset{の}{乗}$り$\\overset{ば}{場}$へ$\\overset{む}{向}$かう。/买了票，走向出租车乘车点。"
},
{
  word: "這う",
  kana: "はう",
  type: "五段自动词",
  meaning: "爬，爬行；攀缘。",
  example: "$\\overset{あか}{赤}$ちゃんが$\\overset{ゆか}{床}$を$\\overset{は}{這}$って$\\overset{すす}{進}$む。/婴儿在地板上爬行前进。"
},
{
  word: "二十歳",
  kana: "はたち",
  type: "名词",
  meaning: "二十岁。",
  example: "$\\overset{はたち}{二十歳}$になって、$\\overset{ひょうじょう}{表情}$がぱっと$\\overset{あか}{明}$るくなった。/到了二十岁，表情一下子变得开朗了。"
},
{
  word: "ぱっと",
  kana: "ぱっと",
  type: "副词",
  meaning: "突然；一下子；（后接否定）出众，显眼。",
  example: "ぱっと$\\overset{み}{見}$たところ、$\\overset{まちが}{間違}$いはないようだ。/乍一看，似乎没有错误。"
},
{
  word: "便",
  kana: "びん",
  type: "名词",
  meaning: "航班，班机；邮件。",
  example: "$\\overset{つぎ}{次}$の$\\overset{びん}{便}$で$\\overset{とうきょう}{東京}$へ$\\overset{しゅっぱつ}{出発}$する。/乘坐下个航班出发去东京。"
},
{
  word: "貧乏人",
  kana: "びんぼうにん",
  type: "名词",
  meaning: "穷人。",
  example: "$\\overset{むかし}{昔}$は$\\overset{びんぼうにん}{貧乏人}$だったが、$\\overset{いま}{今}$は$\\overset{かねも}{金持}$ちだ。/过去是穷人，但现在是有钱人了。"
},
{
  word: "間",
  kana: "ま",
  type: "名词",
  meaning: "期间，空闲；（空间/时间的）间隔。",
  example: "$\\overset{すこ}{少}$し$\\overset{ま}{間}$を$\\overset{お}{置}$いてから、$\\overset{じぶん}{自分}$の$\\overset{まちが}{間違}$いを$\\overset{みと}{認}$める。/稍微停顿（隔）了一下，承认了自己的错误。"
},
{
  word: "間違い",
  kana: "まちがい",
  type: "名词",
  meaning: "错误，错处。",
  example: "テストの$\\overset{こた}{答}$えに$\\overset{まちが}{間違}$いがないか$\\overset{かくにん}{確認}$する。/确认考试答案有没有错误。"
},
{
  word: "持ち上げる",
  kana: "もちあげる",
  type: "一段他动词",
  meaning: "举起，拿起；捧，奉承。",
  example: "$\\overset{おも}{重}$い$\\overset{にもつ}{荷物}$を$\\overset{も}{持}$ち$\\overset{あ}{上}$げて$\\overset{も}{持}$ち$\\overset{ある}{歩}$く。/举起重行李随身携带。"
},
{
  word: "持ち歩く",
  kana: "もちあるく",
  type: "五段他动词",
  meaning: "随身携带。",
  example: "いつも$\\overset{みず}{水}$の$\\overset{はい}{入}$った$\\overset{びん}{瓶}$を$\\overset{も}{持}$ち$\\overset{ある}{歩}$いている。/总是随身带着装了水的瓶子。"
},
{
  word: "持ち合わせ",
  kana: "もちあわせ",
  type: "名词",
  meaning: "随身携带的钱物（多指钱）。",
  example: "あいにく、$\\overset{いま}{今}$はお$\\overset{かね}{金}$の$\\overset{も}{持}$ち$\\overset{あ}{合}$わせがない。/真不巧，现在身上没带钱。"
},
{
  word: "持ち去る",
  kana: "もちさる",
  type: "五段他动词",
  meaning: "拿走，带走。",
  example: "$\\overset{どろぼう}{泥棒}$が$\\overset{も}{持}$ち$\\overset{あ}{合}$わせのお$\\overset{かね}{金}$を$\\overset{も}{持}$ち$\\overset{さ}{去}$る。/小偷把随身带的钱拿走了。"
},
{
  word: "持ち物",
  kana: "もちもの",
  type: "名词",
  meaning: "随身物品。",
  example: "$\\overset{も}{持}$ち$\\overset{もの}{物}$を$\\overset{かくにん}{確認}$してから、$\\overset{どうろ}{道路}$を$\\overset{よこぎ}{横切}$る。/确认了随身物品后，横穿道路。"
},
{
  word: "横切る",
  kana: "よこぎる",
  type: "五段自动词",
  meaning: "横穿，横过。",
  example: "$\\overset{くるま}{車}$の$\\overset{まえ}{前}$を$\\overset{いぬ}{犬}$が$\\overset{よこぎ}{横切}$った。/狗从车前横穿了过去。"
},
{
  word: "割り",
  kana: "わり",
  type: "名・接尾词",
  meaning: "成，比例（一成即10%）；利润，合算。",
  example: "この$\\overset{しごと}{仕事}$は$\\overset{わり}{割}$りに$\\overset{あ}{合}$わない。/这份工作不合算。 || $\\overset{に}{二}$$\\overset{わり}{割}$の$\\overset{わりびき}{割引}$で$\\overset{か}{買}$い$\\overset{もの}{物}$をする。/打八折（减去两成）买东西。"
},
{
  word: "割り込む",
  kana: "わりこむ",
  type: "五段自动词",
  meaning: "插队，挤进去；插嘴。",
  example: "$\\overset{わりびき}{割引}$の$\\overset{れつ}{列}$にこっそり$\\overset{わ}{割}$り$\\overset{こ}{込}$むのはルール$\\overset{いはん}{違反}$だ。/偷偷插进打折的队伍里是违反规则的。"
},
{
  word: "割と",
  kana: "わりと",
  type: "副词",
  meaning: "比较地，意外地。",
  example: "この$\\overset{もんだい}{問題}$は$\\overset{わり}{割}$と$\\overset{かんたん}{簡単}$に$\\overset{と}{解}$けた。/这个问题意外地很容易就解开了。"
},
{
  word: "割り箸",
  kana: "わりばし",
  type: "名词",
  meaning: "一次性筷子，卫生筷。",
  example: "$\\overset{べんとう}{弁当}$を$\\overset{た}{食}$べるために$\\overset{わ}{割}$り$\\overset{ばし}{箸}$を$\\overset{わ}{割}$る。/为了吃便当掰开一次性筷子。"
},
{
  word: "朝",
  kana: "あさ",
  type: "名词",
  meaning: "早晨。",
  example: "いつもの$\\overset{あさ}{朝}$、いつの$\\overset{ま}{間}$にか$\\overset{とり}{鳥}$が$\\overset{な}{鳴}$いている。/在平常的早晨，不知不觉间鸟儿在鸣叫。"
},
{
  word: "いつ",
  kana: "いつ",
  type: "代词・副词",
  meaning: "什么时候，何时。",
  example: "いつ$\\overset{かれ}{彼}$にお$\\overset{みま}{見舞}$いに行くか、じっと$\\overset{かんが}{考}$える。/静静地思考什么时候去探望他。"
},
{
  word: "いつの間にか",
  kana: "いつのまにか",
  type: "副词",
  meaning: "不知不觉中。",
  example: "いつの$\\overset{ま}{間}$にか、$\\overset{ことし}{今年}$ももう$\\overset{はんぶん}{半分}$ $\\overset{お}{終}$わった。/不知不觉中，今年也已经过去一半了。"
},
{
  word: "いつも",
  kana: "いつも",
  type: "副词",
  meaning: "总是，经常。",
  example: "$\\overset{かれ}{彼}$はいつも$\\overset{あさねぼう}{朝寝坊}$して、$\\overset{あわ}{慌}$てて$\\overset{いえ}{家}$を$\\overset{で}{出}$る。/他总是睡懒觉，然后慌慌张张地出门。"
},
{
  word: "一昨年",
  kana: "おととし",
  type: "名词",
  meaning: "前年。",
  example: "$\\overset{おととし}{一昨年}$の$\\overset{しちごさん}{七五三}$の$\\overset{おも}{思}$い$\\overset{で}{出}$を$\\overset{おも}{思}$い$\\overset{だ}{出}$す。/回想起前年七五三节的回忆。"
},
{
  word: "お見舞い",
  kana: "おみまい",
  type: "名词",
  meaning: "探望，慰问。",
  example: "$\\overset{びょういん}{病院}$へお$\\overset{みま}{見舞}$いに行き、お$\\overset{たが}{互}$いに$\\overset{おも}{思}$いやる。/去医院探望，彼此相互体谅。"
},
{
  word: "思う",
  kana: "おもう",
  type: "五段他动词",
  meaning: "想，认为。",
  example: "$\\overset{ことし}{今年}$の$\\overset{けしき}{景色}$は$\\overset{ほんとう}{本当}$に$\\overset{みごと}{見事}$だと$\\overset{おも}{思}$う。/我觉得今年的景色真是太美了。"
},
{
  word: "思わず",
  kana: "おもわず",
  type: "副词",
  meaning: "不由得，情不自禁地。",
  example: "$\\overset{かがや}{輝}$く$\\overset{ほしぞら}{星空}$を$\\overset{みあ}{見上}$げて、$\\overset{おも}{思}$わず$\\overset{こえ}{声}$を$\\overset{だ}{出}$した。/仰望着闪耀的星空，不由得发出了声音。"
},
{
  word: "輝く",
  kana: "かがやく",
  type: "五段自动词",
  meaning: "闪耀，发光。",
  example: "$\\overset{あさひ}{朝日}$が$\\overset{かがや}{輝}$く$\\overset{けしき}{景色}$を$\\overset{しゃしん}{写真}$に$\\overset{と}{撮}$る。/把朝阳闪耀的景色拍成照片。"
},
{
  word: "景色",
  kana: "けしき",
  type: "名词",
  meaning: "景色，风景。",
  example: "ここから$\\overset{み}{見}$える$\\overset{けしき}{景色}$は、$\\overset{ことば}{言葉}$では$\\overset{い}{言}$い$\\overset{あらわ}{表}$せない。/从这里看到的景色，无法用语言表达。"
},
{
  word: "ここ",
  kana: "ここ",
  type: "代词",
  meaning: "这里。",
  example: "ここから$\\overset{あたら}{新}$しい$\\overset{ばんぐみ}{番組}$が$\\overset{はじ}{始}$まることを$\\overset{し}{知}$らせる。/通知大家新节目将从这里开始。"
},
{
  word: "今年",
  kana: "ことし",
  type: "名词",
  meaning: "今年。",
  example: "$\\overset{ことし}{今年}$の$\\overset{としこ}{年越}$しは$\\overset{かぞく}{家族}$と$\\overset{す}{過}$ごすつもりだ。/今年的跨年打算和家人一起过。"
},
{
  word: "七五三",
  kana: "しちごさん",
  type: "名词",
  meaning: "七五三节（日本儿童节日）。",
  example: "$\\overset{めい}{姪}$の$\\overset{しちごさん}{七五三}$のお$\\overset{いわ}{祝}$いに$\\overset{じんじゃ}{神社}$へ$\\overset{い}{行}$く。/为了庆祝侄女的七五三节去了神社。"
},
{
  word: "じっと",
  kana: "じっと",
  type: "副词・サ变动词する自",
  meaning: "一动不动地；目不转睛地。",
  example: "じっと$\\overset{み}{見}$つめて、$\\overset{あいて}{相手}$の$\\overset{はんのう}{反応}$を$\\overset{ま}{待}$つ。/目不转睛地盯着，等待对方的反应。 || $\\overset{いた}{痛}$みをじっとする。/强忍着疼痛一动不动。"
},
{
  word: "知らせる",
  kana: "しらせる",
  type: "一段他动词",
  meaning: "通知，告知。",
  example: "$\\overset{はじ}{初}$めて$\\overset{し}{知}$り$\\overset{あ}{合}$った$\\overset{ひと}{人}$に$\\overset{れんらくさき}{連絡先}$を$\\overset{し}{知}$らせる。/把联系方式告诉初次相识的人。"
},
{
  word: "知る",
  kana: "しる",
  type: "五段他动词",
  meaning: "知道，了解。",
  example: "$\\overset{かれ}{彼}$の$\\overset{かこ}{過去}$を$\\overset{し}{知}$って、$\\overset{みかた}{見方}$が$\\overset{みなお}{見直}$された。/了解了他的过去，改变了对他的看法。"
},
{
  word: "年",
  kana: "とし",
  type: "名词",
  meaning: "年，年龄。",
  example: "$\\overset{とし}{年}$の$\\overset{はじ}{初}$めに$\\overset{はつもうで}{初詣}$に$\\overset{い}{行}$く。/在年初去新年首次参拜。"
},
{
  word: "撮る",
  kana: "とる",
  type: "五段他动词",
  meaning: "拍照，摄影。",
  example: "$\\overset{まんかい}{満開}$の$\\overset{さくら}{桜}$の$\\overset{き}{木}$の$\\overset{した}{下}$で$\\overset{はなみ}{花見}$の$\\overset{ようす}{様子}$を$\\overset{と}{撮}$る。/在盛开的樱花树下拍赏花的情景。"
},
{
  word: "始まる",
  kana: "はじまる",
  type: "五段自动词",
  meaning: "开始。",
  example: "$\\overset{ま}{間}$も$\\overset{な}{無}$く、$\\overset{たの}{楽}$しい$\\overset{ばんぐみ}{番組}$が$\\overset{はじ}{始}$まる。/马上，有趣的节目就要开始了。"
},
{
  word: "初め",
  kana: "はじめ",
  type: "名词",
  meaning: "开始，初期。",
  example: "$\\overset{つき}{月}$の$\\overset{はじ}{初}$めに$\\overset{かいぎ}{会議}$の$\\overset{もうしこみしょ}{申込書}$を$\\overset{ていしゅつ}{提出}$する。/在月初提交会议的申请书。"
},
{
  word: "始め",
  kana: "はじめ",
  type: "名词",
  meaning: "开始，起头。",
  example: "$\\overset{しごと}{仕事}$の$\\overset{はじ}{始}$めに、$\\overset{みな}{皆}$で$\\overset{もう}{申}$し$\\overset{あ}{合}$わせをする。/在工作开始时，大家进行商议安排。"
},
{
  word: "初めて",
  kana: "はじめて",
  type: "副词",
  meaning: "第一次，初次。",
  example: "$\\overset{はじ}{初}$めて$\\overset{みし}{見知}$らぬ$\\overset{とち}{土地}$を$\\overset{おとず}{訪}$れる。/第一次访问陌生的地方。"
},
{
  word: "始める",
  kana: "はじめる",
  type: "一段他动词",
  meaning: "开始（做某事）。",
  example: "$\\overset{あさ}{朝}$$\\overset{はや}{早}$くから$\\overset{べんきょう}{勉強}$を$\\overset{はじ}{始}$める。/从一大早就开始学习。"
},
{
  word: "番組",
  kana: "ばんぐみ",
  type: "名词",
  meaning: "节目。",
  example: "テレビの$\\overset{ばんぐみ}{番組}$を$\\overset{み}{見}$て、$\\overset{おも}{思}$わず$\\overset{わら}{笑}$った。/看电视节目，不由得笑了。"
},
{
  word: "見える",
  kana: "みえる",
  type: "一段自动词",
  meaning: "看得见；看来，显得。",
  example: "$\\overset{まど}{窓}$から$\\overset{みごと}{見事}$な$\\overset{けしき}{景色}$が$\\overset{み}{見}$える。/从窗户能看到美丽的景色。"
},
{
  word: "見事",
  kana: "みごと",
  type: "名・形动",
  meaning: "出色，漂亮，完美。",
  example: "$\\overset{みごと}{見事}$な$\\overset{えんそう}{演奏}$を$\\overset{ひろう}{披露}$する。/展示出色的演奏。 || $\\overset{かれ}{彼}$の$\\overset{ぎじゅつ}{技術}$は$\\overset{じつ}{実}$に$\\overset{みごと}{見事}$だ。/他的技术真的是很出色。"
},
{
  word: "見る",
  kana: "みる",
  type: "一段他动词",
  meaning: "看。",
  example: "$\\overset{そら}{空}$を$\\overset{と}{飛}$ぶ$\\overset{とり}{鳥}$をぼんやりと$\\overset{み}{見}$る。/发呆地看着在天空飞翔的鸟。"
},
{
  word: "申し込む",
  kana: "もうしこむ",
  type: "五段他动词",
  meaning: "申请，报名。",
  example: "$\\overset{しょうがくきん}{奨学金}$を$\\overset{もうしこみしょ}{申込書}$で$\\overset{もう}{申}$し$\\overset{こ}{込}$む。/用申请书申请奖学金。"
},
{
  word: "朝寝坊",
  kana: "あさねぼう",
  type: "名・サ变动词する自",
  meaning: "早上睡懒觉。",
  example: "$\\overset{あさねぼう}{朝寝坊}$は$\\overset{かれ}{彼}$の$\\overset{わる}{悪}$い$\\overset{くせ}{癖}$だ。/早上睡懒觉是他的坏习惯。 || $\\overset{きのう}{昨日}$$\\overset{おそ}{遅}$くまで$\\overset{お}{起}$きていて、$\\overset{あさねぼう}{朝寝坊}$した。/昨天熬夜到很晚，结果早上睡懒觉了。"
},
{
  word: "追い掛ける",
  kana: "おいかける",
  type: "一段他动词",
  meaning: "追赶，追逐。",
  example: "$\\overset{どろぼう}{泥棒}$を$\\overset{ひっし}{必死}$に$\\overset{お}{追}$い$\\overset{か}{掛}$ける。/拼命追赶小偷。"
},
{
  word: "追う",
  kana: "おう",
  type: "五段他动词",
  meaning: "追赶；追求。",
  example: "$\\overset{じぶん}{自分}$の$\\overset{ゆめ}{夢}$を$\\overset{お}{追}$い$\\overset{もと}{求}$めて$\\overset{い}{生}$きる。/追求着自己的梦想生活。"
},
{
  word: "お互いに",
  kana: "おたがいに",
  type: "副词",
  meaning: "互相，彼此。",
  example: "お$\\overset{たが}{互}$いに$\\overset{おも}{思}$いやりの$\\overset{こころ}{心}$を$\\overset{も}{持}$つことが$\\overset{だいじ}{大事}$だ。/彼此拥有体谅之心很重要。"
},
{
  word: "思い出す",
  kana: "おもいだす",
  type: "五段他动词",
  meaning: "想起来，回想起。",
  example: "$\\overset{たの}{楽}$しい$\\overset{おも}{思}$い$\\overset{で}{出}$をふと$\\overset{おも}{思}$い$\\overset{だ}{出}$す。/偶然回想起快乐的回忆。"
},
{
  word: "思い出",
  kana: "おもいで",
  type: "名词",
  meaning: "回忆。",
  example: "$\\overset{そつぎょう}{卒業}$$\\overset{しき}{式}$で$\\overset{なかま}{仲間}$との$\\overset{おも}{思}$い$\\overset{で}{出}$を$\\overset{かた}{語}$る。/在毕业典礼上讲述和伙伴们的回忆。"
},
{
  word: "泥棒",
  kana: "どろぼう",
  type: "名词",
  meaning: "小偷，强盗。",
  example: "$\\overset{どろぼう}{泥棒}$を$\\overset{み}{見}$かけて、$\\overset{けいさつ}{警察}$に$\\overset{し}{知}$らせる。/看到了小偷，通知了警察。"
},
{
  word: "初詣",
  kana: "はつもうで",
  type: "名・サ变动词する自",
  meaning: "新年首次参拜神社或寺院。",
  example: "$\\overset{かぞく}{家族}$と$\\overset{はつもうで}{初詣}$に$\\overset{い}{行}$く。/和家人去新年首次参拜。 || $\\overset{じんじゃ}{神社}$で$\\overset{はつもうで}{初詣}$して、$\\overset{いちねん}{一年}$の$\\overset{けんこう}{健康}$を$\\overset{いの}{祈}$る。/在神社进行新年首拜，祈求一年的健康。"
},
{
  word: "羽根",
  kana: "はね",
  type: "名词",
  meaning: "羽毛；（羽毛球等）带有羽毛的东西。",
  example: "$\\overset{うつく}{美}$しい$\\overset{はね}{羽根}$を$\\overset{も}{持}$つ$\\overset{ことり}{小鳥}$を$\\overset{み}{見}$つける。/找到了一只长着美丽羽毛的小鸟。"
},
{
  word: "見かける",
  kana: "みかける",
  type: "一段他动词",
  meaning: "偶然看到，看见。",
  example: "$\\overset{とお}{通}$りで$\\overset{むかし}{昔}$の$\\overset{し}{知}$り$\\overset{あ}{合}$いを$\\overset{み}{見}$かける。/在街上偶然看到了以前的熟人。"
},
{
  word: "見せる",
  kana: "みせる",
  type: "一段他动词",
  meaning: "给……看，展示。",
  example: "$\\overset{か}{買}$ったばかりの$\\overset{ふく}{服}$を$\\overset{ゆうじん}{友人}$に$\\overset{み}{見}$せる。/把刚买的衣服给朋友看。"
},
{
  word: "見つかる",
  kana: "みつかる",
  type: "五段自动词",
  meaning: "被发现，找到。",
  example: "$\\overset{さが}{探}$していた$\\overset{かぎ}{鍵}$がやっと$\\overset{み}{見}$つかった。/一直在找的钥匙终于找到了。"
},
{
  word: "見つける",
  kana: "みつける",
  type: "一段他动词",
  meaning: "发现，找到。",
  example: "$\\overset{かれ}{彼}$の$\\overset{つよ}{強}$みを$\\overset{み}{見}$つけて、そこを$\\overset{ほ}{褒}$める。/发现他的强项，并夸奖那里。"
},
{
  word: "申し訳ない",
  kana: "もうしわけない",
  type: "形容词",
  meaning: "实在抱歉，对不起。",
  example: "$\\overset{ちこく}{遅刻}$してしまい、$\\overset{ほんとう}{本当}$に$\\overset{もう}{申}$し$\\overset{わけ}{訳}$ない。/我迟到了，真的非常抱歉。"
},
{
  word: "いつまでも",
  kana: "いつまでも",
  type: "副词",
  meaning: "永远，始终。",
  example: "この$\\overset{うつく}{美}$しい$\\overset{けしき}{景色}$をいつまでも$\\overset{わす}{忘}$れない。/永远不会忘记这美丽的景色。"
},
{
  word: "思い浮かべる",
  kana: "おもいうかべる",
  type: "一段他动词",
  meaning: "回想，想起，浮现在脑海。",
  example: "$\\overset{こきょう}{故郷}$の$\\overset{ふうけい}{風景}$を$\\overset{あたま}{頭}$に$\\overset{おも}{思}$い$\\overset{う}{浮}$かべる。/故乡的风景浮现在脑海中。"
},
{
  word: "思い切る",
  kana: "おもいきる",
  type: "五段他动词",
  meaning: "死心，断念；下决心。",
  example: "$\\overset{しっぱい}{失敗}$を$\\overset{おも}{思}$い$\\overset{き}{切}$って、$\\overset{あたら}{新}$しいことに$\\overset{ちょうせん}{挑戦}$する。/对失败彻底死心（放下包袱），挑战新事物。"
},
{
  word: "思いやる",
  kana: "おもいやる",
  type: "五段他动词",
  meaning: "体谅，同情。",
  example: "$\\overset{としよ}{年寄}$りを$\\overset{おも}{思}$いやって$\\overset{せき}{席}$を$\\overset{ゆず}{譲}$る。/体谅老人，给他们让座。"
},
{
  word: "今朝",
  kana: "けさ",
  type: "名词",
  meaning: "今天早晨。",
  example: "$\\overset{けさ}{今朝}$、$\\overset{とつぜん}{突然}$の$\\overset{し}{知}$らせを$\\overset{う}{受}$け$\\overset{と}{取}$った。/今天早晨，收到了突然的通知。"
},
{
  word: "知らせ",
  kana: "しらせ",
  type: "名词",
  meaning: "通知，消息。",
  example: "$\\overset{ごうかく}{合格}$の$\\overset{し}{知}$らせを$\\overset{き}{聞}$いて$\\overset{おおよろこ}{大喜}$びする。/听到及格的消息非常高兴。"
},
{
  word: "知り合う",
  kana: "しりあう",
  type: "五段自动词",
  meaning: "结识，相识。",
  example: "$\\overset{だいがく}{大学}$で$\\overset{おお}{多}$くの$\\overset{ゆうじん}{友人}$と$\\overset{し}{知}$り$\\overset{あ}{合}$う。/在大学里结识了很多朋友。"
},
{
  word: "月見",
  kana: "つきみ",
  type: "名・サ变动词する自",
  meaning: "赏月。",
  example: "$\\overset{こんや}{今夜}$は$\\overset{つきみ}{月見}$に$\\overset{ぜっこう}{絶好}$な$\\overset{てんき}{天気}$だ。/今晚是赏月的绝佳天气。 || $\\overset{あき}{秋}$の$\\overset{よる}{夜}$に$\\overset{えんがわ}{縁側}$で$\\overset{つきみ}{月見}$する。/秋天的夜晚在走廊上赏月。"
},
{
  word: "通り",
  kana: "とおり",
  type: "名・接尾词",
  meaning: "马路，街道；和……一样，照……那样。",
  example: "この$\\overset{とお}{通}$りをまっすぐ行くと$\\overset{えき}{駅}$がある。/沿着这条马路直走就是车站。 || $\\overset{い}{言}$われた$\\overset{とお}{通}$りに$\\overset{さぎょう}{作業}$を$\\overset{すす}{進}$める。/按照吩咐的那样推进工作。"
},
{
  word: "年寄り",
  kana: "としより",
  type: "名词",
  meaning: "老人，年长者。",
  example: "$\\overset{としよ}{年寄}$りを$\\overset{うやま}{敬}$って、$\\overset{ていねい}{丁寧}$に$\\overset{せっ}{接}$する。/尊敬老人，礼貌地对待他们。"
},
{
  word: "花見",
  kana: "はなみ",
  type: "名・サ变动词する自",
  meaning: "赏花。",
  example: "$\\overset{はる}{春}$になると、みんなで$\\overset{はなみ}{花見}$に$\\overset{い}{行}$く。/一到春天，大家就去赏花。 || $\\overset{こうえん}{公園}$の$\\overset{さくら}{桜}$の$\\overset{した}{下}$で$\\overset{はなみ}{花見}$する。/在公园的樱花树下赏花。"
},
{
  word: "見送る",
  kana: "みおくる",
  type: "五段他动词",
  meaning: "目送，送行；搁置，推迟。",
  example: "$\\overset{くうこう}{空港}$で$\\overset{かいがい}{海外}$へ行く$\\overset{ゆうじん}{友人}$を$\\overset{みおく}{見送}$る。/在机场目送去国外的友人。"
},
{
  word: "見下ろす",
  kana: "みおろす",
  type: "五段他动词",
  meaning: "俯视，往下看。",
  example: "$\\overset{やま}{山}$の$\\overset{ちょうじょう}{頂上}$から$\\overset{まち}{町}$$\\overset{ぜんたい}{全体}$を$\\overset{みお}{見下}$ろす。/从山顶俯视整个城镇。"
},
{
  word: "見込み",
  kana: "みこみ",
  type: "名词",
  meaning: "预料，预计；希望，可能性。",
  example: "$\\overset{あした}{明日}$の$\\overset{てんき}{天気}$は$\\overset{かいふく}{回復}$する$\\overset{みこ}{見込}$みだ。/预计明天的天气会好转。"
},
{
  word: "見舞い",
  kana: "みまい",
  type: "名词",
  meaning: "探望，慰问。",
  example: "$\\overset{びょうき}{病気}$の$\\overset{ともだち}{友達}$へ$\\overset{みま}{見舞}$いの$\\overset{しな}{品}$を$\\overset{じさん}{持参}$する。/带上慰问品去探望生病的朋友。"
},
{
  word: "申す",
  kana: "もうす",
  type: "五段他动词",
  meaning: "说，讲，叫（「言う」的谦让语）。",
  example: "$\\overset{わたし}{私}$は$\\overset{たなか}{田中}$と$\\overset{もう}{申}$します。/我叫田中（谦称）。"
},
{
  word: "朝起き",
  kana: "あさおき",
  type: "名词",
  meaning: "早起。",
  example: "$\\overset{あさおき}{朝起き}$は$\\overset{けんこう}{健康}$に$\\overset{よ}{良}$いと$\\overset{い}{言}$われている。/据说早起对健康有益。"
},
{
  word: "朝顔",
  kana: "あさがお",
  type: "名词",
  meaning: "牵牛花。",
  example: "$\\overset{なつ}{夏}$の$\\overset{あさ}{朝}$、$\\overset{にわ}{庭}$に$\\overset{きれい}{綺麗}$な$\\overset{あさがお}{朝顔}$が$\\overset{さ}{咲}$く。/夏天的早晨，院子里开出了漂亮的牵牛花。"
},
{
  word: "朝ご飯",
  kana: "あさごはん",
  type: "名词",
  meaning: "早饭。",
  example: "$\\overset{あさ}{朝}$$\\overset{お}{起}$きて、$\\overset{かぞく}{家族}$と$\\overset{あさ}{朝}$ご$\\overset{はん}{飯}$を$\\overset{た}{食}$べる。/早晨起床和家人吃早饭。"
},
{
  word: "朝晩",
  kana: "あさばん",
  type: "名词",
  meaning: "早晚。",
  example: "$\\overset{あき}{秋}$になると、$\\overset{あさばん}{朝晩}$はめっきり$\\overset{さむ}{寒}$くなる。/一到秋天，早晚就明显变冷了。"
},
{
  word: "朝日",
  kana: "あさひ",
  type: "名词",
  meaning: "朝阳。",
  example: "$\\overset{あさひ}{朝日}$を$\\overset{あ}{浴}$びて、$\\overset{いちにち}{一日}$を$\\overset{はじ}{始}$める。/沐浴着朝阳开始新的一天。"
},
{
  word: "朝飯前",
  kana: "あさめしまえ",
  type: "名・形动",
  meaning: "极其容易，小菜一碟（像吃早饭前做的事一样简单）。",
  example: "こんな$\\overset{かんたん}{簡単}$な$\\overset{しごと}{仕事}$は$\\overset{あさめしまえ}{朝飯前}$だ。/这么简单的工作简直是小菜一碟。 || $\\overset{あさめしまえ}{朝飯前}$な$\\overset{たいど}{態度}$で$\\overset{もんだい}{問題}$を$\\overset{と}{解}$く。/以轻松（小菜一碟）的态度解题。"
},
{
  word: "朝焼け",
  kana: "あさやけ",
  type: "名词",
  meaning: "朝霞。",
  example: "$\\overset{そら}{空}$に$\\overset{うつく}{美}$しい$\\overset{あさやけ}{朝焼け}$が$\\overset{ひろ}{広}$がっている。/天空漫天都是美丽的朝霞。"
},
{
  word: "いつか",
  kana: "いつか",
  type: "副词",
  meaning: "迟早，总有一天；曾经。",
  example: "いつか$\\overset{せかい}{世界}$を$\\overset{いっしゅう}{一周}$したいと$\\overset{おも}{思}$う。/我想总有一天要环游世界一周。"
},
{
  word: "一周",
  kana: "いっしゅう",
  type: "名・サ变动词する自他",
  meaning: "一圈，一周。",
  example: "グラウンドを$\\overset{いっしゅう}{一周}$して$\\overset{はし}{走}$る。/绕着操场跑一圈。 || $\\overset{ふね}{船}$で$\\overset{せかい}{世界}$を$\\overset{いっしゅう}{一周}$する。/乘船环游世界一周。"
},
{
  word: "いつでも",
  kana: "いつでも",
  type: "副词",
  meaning: "无论何时，随时。",
  example: "$\\overset{こま}{困}$ったことがあったら、いつでも$\\overset{でんわ}{電話}$してください。/如果遇到困难，随时给我打电话。"
},
{
  word: "今更",
  kana: "いまさら",
  type: "副词",
  meaning: "事到如今，现在才……。",
  example: "$\\overset{いまさら}{今更}$$\\overset{こうかい}{後悔}$しても$\\overset{はじ}{始}$まらない。/事到如今再后悔也无济于事了。"
},
{
  word: "甥",
  kana: "おい",
  type: "名词",
  meaning: "侄子，外甥。",
  example: "$\\overset{おい}{甥}$が$\\overset{ことし}{今年}$$\\overset{はたち}{二十歳}$になった。/侄子今年二十岁了。"
},
{
  word: "追い越す",
  kana: "おいこす",
  type: "五段他动词",
  meaning: "赶超，超过。",
  example: "$\\overset{まえ}{前}$を$\\overset{はし}{走}$る$\\overset{くるま}{車}$を$\\overset{お}{追}$い$\\overset{こ}{越}$す。/超过在前面行驶的车。"
},
{
  word: "追い出す",
  kana: "おいだす",
  type: "五段他动词",
  meaning: "赶出，逐出。",
  example: "$\\overset{へや}{部屋}$から$\\overset{むし}{虫}$を$\\overset{お}{追}$い$\\overset{だ}{出}$す。/把虫子从房间里赶出去。"
},
{
  word: "追い付く",
  kana: "おいつく",
  type: "五段自动词",
  meaning: "赶上，追上。",
  example: "$\\overset{はし}{走}$って$\\overset{さき}{先}$に$\\overset{い}{行}$く$\\overset{ゆうじん}{友人}$に$\\overset{お}{追}$い$\\overset{つ}{付}$く。/跑着赶上走在前面的朋友。"
},
{
  word: "追い求める",
  kana: "おいもとめる",
  type: "一段他动词",
  meaning: "追求，探求。",
  example: "$\\overset{じぶん}{自分}$の$\\overset{りそう}{理想}$を$\\overset{お}{追}$い$\\overset{もと}{求}$める。/追求自己的理想。"
},
{
  word: "怒りっぽい",
  kana: "おこりっぽい",
  type: "形容词",
  meaning: "易怒的，爱生气的。",
  example: "$\\overset{かれ}{彼}$は$\\overset{おこ}{怒}$りっぽいが、$\\overset{じつ}{実}$は$\\overset{おも}{思}$いやりがある。/他虽然易怒，但其实很有同情心。"
},
{
  word: "思い",
  kana: "おもい",
  type: "名词",
  meaning: "想法，感情。",
  example: "$\\overset{むね}{胸}$に$\\overset{ひ}{秘}$めた$\\overset{おも}{思}$いを$\\overset{つた}{伝}$える。/传达隐藏在心中的想法。"
},
{
  word: "思い浮かぶ",
  kana: "おもいうかぶ",
  type: "五段自动词",
  meaning: "浮现出，想出。",
  example: "$\\overset{よ}{良}$いアイデアが$\\overset{きゅう}{急}$に$\\overset{おも}{思}$い$\\overset{う}{浮}$かぶ。/突然想出了一个好主意。"
},
{
  word: "思い込む",
  kana: "おもいこむ",
  type: "五段自动词",
  meaning: "深信不疑，认定。",
  example: "$\\overset{かれ}{彼}$が$\\overset{はんにん}{犯人}$だと$\\overset{おも}{思}$い$\\overset{こ}{込}$んでいたが、$\\overset{まちが}{間違}$いだった。/一直深信他是犯人，但其实搞错了。"
},
{
  word: "思いやり",
  kana: "おもいやり",
  type: "名词",
  meaning: "体谅，同情心。",
  example: "$\\overset{たにん}{他人}$に$\\overset{たい}{対}$する$\\overset{おも}{思}$いやりを$\\overset{も}{持}$つ。/对他人抱有体谅之心。"
},
{
  word: "鳥",
  kana: "とり",
  type: "名词",
  meaning: "鸟。",
  example: "$\\overset{き}{木}$の$\\overset{えだ}{枝}$で$\\overset{とり}{鳥}$が$\\overset{やす}{休}$んでいる。/鸟儿在树枝上休息。"
},
{
  word: "絡む",
  kana: "からむ",
  type: "五段自动词",
  meaning: "缠绕；纠缠。",
  example: "$\\overset{あし}{足}$に$\\overset{いと}{糸}$が$\\overset{から}{絡}$んで$\\overset{ころ}{転}$びそうになった。/脚被线缠住差点摔倒。"
},
{
  word: "霜",
  kana: "しも",
  type: "名词",
  meaning: "霜。",
  example: "$\\overset{ふゆ}{冬}$の$\\overset{あさ}{朝}$、$\\overset{くさ}{草}$に$\\overset{しも}{霜}$が$\\overset{お}{降}$りている。/冬天的早晨，草上结了霜。"
},
{
  word: "知らず知らず",
  kana: "しらずしらず",
  type: "副词",
  meaning: "不知不觉地。",
  example: "$\\overset{し}{知}$らず$\\overset{し}{知}$らずのうちに$\\overset{としお}{年老}$いていく。/在不知不觉中渐渐老去。"
},
{
  word: "知り合い",
  kana: "しりあい",
  type: "名词",
  meaning: "熟人。",
  example: "パーティーで$\\overset{し}{知}$り$\\overset{あ}{合}$いに$\\overset{せっ}{接}$する。/在聚会上接待熟人。"
},
{
  word: "接する",
  kana: "せっする",
  type: "サ变动词する自他",
  meaning: "接触，接待，对待；挨着，与……接壤；收到。",
  example: "お$\\overset{きゃく}{客}$さんに$\\overset{ていねい}{丁寧}$に$\\overset{せっ}{接}$する。/礼貌地接待客人。 || $\\overset{かな}{悲}$しい$\\overset{し}{知}$らせに$\\overset{せっ}{接}$する。/收到了悲伤的通知。"
},
{
  word: "たっぷり",
  kana: "たっぷり",
  type: "副词",
  meaning: "充分，足够，大量。",
  example: "$\\overset{じかん}{時間}$はたっぷりあるから、$\\overset{あせ}{焦}$らないで。/时间很充足，别着急。"
},
{
  word: "強み",
  kana: "つよみ",
  type: "名词",
  meaning: "强项，优点。",
  example: "$\\overset{ごがく}{語学}$$\\overset{りょく}{力}$が$\\overset{かれ}{彼}$の$\\overset{いちばん}{一番}$の$\\overset{つよ}{強}$みだ。/外语能力是他最大的优点。"
},
{
  word: "提出",
  kana: "ていしゅつ",
  type: "名・サ变动词する他",
  meaning: "提出，提交。",
  example: "$\\overset{あした}{明日}$がレポートの$\\overset{ていしゅつ}{提出}$$\\overset{び}{日}$だ。/明天是报告的提交日。 || $\\overset{せんせい}{先生}$に$\\overset{しゅくだい}{宿題}$を$\\overset{ていしゅつ}{提出}$する。/向老师提交作业。"
},
{
  word: "年上",
  kana: "としうえ",
  type: "名词",
  meaning: "年长。",
  example: "$\\overset{としうえ}{年上}$の$\\overset{せんぱい}{先輩}$に$\\overset{けいご}{敬語}$を$\\overset{つか}{使}$う。/对年长的前辈使用敬语。"
},
{
  word: "年老いる",
  kana: "としおいる",
  type: "一段自动词",
  meaning: "年老，衰老。",
  example: "$\\overset{としお}{年老}$いた$\\overset{りょうしん}{両親}$の$\\overset{せわ}{世話}$をする。/照顾年迈的父母。"
},
{
  word: "年越し",
  kana: "としこし",
  type: "名词",
  meaning: "跨年，辞旧迎新。",
  example: "$\\overset{としこ}{年越}$しそばを$\\overset{た}{食}$べて$\\overset{しんねん}{新年}$を$\\overset{むか}{迎}$える。/吃跨年荞麦面迎接新年。"
},
{
  word: "年下",
  kana: "としした",
  type: "名词",
  meaning: "年幼，年龄小。",
  example: "$\\overset{かれ}{彼}$は$\\overset{わたし}{私}$より$\\overset{さん}{三}$つ$\\overset{としした}{年下}$だ。/他比我小三岁。"
},
{
  word: "年取る",
  kana: "としとる",
  type: "五段自动词",
  meaning: "上年纪，老。",
  example: "$\\overset{としと}{年取}$って、めっきり$\\overset{たいりょく}{体力}$が$\\overset{お}{落}$ちた。/上了年纪，体力明显下降了。"
},
{
  word: "始まらない",
  kana: "はじまらない",
  type: "连语/形容词",
  meaning: "无济于事，没用（源自「始まる」的否定）。",
  example: "ここで$\\overset{もんく}{文句}$を$\\overset{い}{言}$っても$\\overset{はじ}{始}$まらない。/在这里发牢骚也无济于事。"
},
{
  word: "ふと",
  kana: "ふと",
  type: "副词",
  meaning: "突然，偶然。",
  example: "ふと$\\overset{みあ}{見上}$げると、$\\overset{うつく}{美}$しい$\\overset{ほしぞら}{星空}$が$\\overset{ひろ}{広}$がっていた。/偶然抬头一看，美丽的星空展现在眼前。"
},
{
  word: "星空",
  kana: "ほしぞら",
  type: "名词",
  meaning: "星空。",
  example: "ぼんやりと$\\overset{ほしぞら}{星空}$を$\\overset{なが}{眺}$める。/发呆地望着星空。"
},
{
  word: "ぼんやり",
  kana: "ぼんやり",
  type: "副词・サ变动词する自",
  meaning: "模糊不清；发呆。",
  example: "$\\overset{きり}{霧}$で$\\overset{やま}{山}$がぼんやりと$\\overset{み}{見}$える。/因为起雾，山看起来模糊不清。 || $\\overset{じゅぎょう}{授業}$$\\overset{ちゅう}{中}$にぼんやりして$\\overset{せんせい}{先生}$に$\\overset{ちゅうい}{注意}$された。/上课发呆被老师提醒了。"
},
{
  word: "見合い",
  kana: "みあい",
  type: "名・サ变动词する自",
  meaning: "相亲（「お見合い」的略称）。",
  example: "$\\overset{らいしゅう}{来週}$、$\\overset{みあい}{見合}$いをする$\\overset{よてい}{予定}$だ。/打算下周相亲。 || $\\overset{おや}{親}$の$\\overset{すす}{勧}$めで$\\overset{みあい}{見合}$いする。/在父母的劝说下相亲。"
},
{
  word: "見上げる",
  kana: "みあげる",
  type: "一段他动词",
  meaning: "仰望，抬头看；令人敬佩。",
  example: "$\\overset{たか}{高}$いビルを$\\overset{みあ}{見上}$げて、その$\\overset{み}{見}$かけに$\\overset{おどろ}{驚}$く。/仰望高楼，对其外观感到惊讶。"
},
{
  word: "見落とす",
  kana: "みおとす",
  type: "五段他动词",
  meaning: "看漏，忽略。",
  example: "$\\overset{ちゅうい}{注意}$して$\\overset{よ}{読}$まないと、$\\overset{じゅうよう}{重要}$な$\\overset{ぶぶん}{部分}$を$\\overset{みお}{見落}$とす。/不仔细读的话，会看漏重要的部分。"
},
{
  word: "見かけ",
  kana: "みかけ",
  type: "名词",
  meaning: "外表，外观。",
  example: "$\\overset{み}{見}$かけと$\\overset{ちが}{違}$って、$\\overset{かれ}{彼}$はとても$\\overset{やさ}{優}$しい。/和外表不同，他非常温柔。"
},
{
  word: "見方",
  kana: "みかた",
  type: "名词",
  meaning: "看法，见解。",
  example: "$\\overset{ふた}{二}$つの$\\overset{いけん}{意見}$を$\\overset{みくら}{見比}$べて、$\\overset{みかた}{見方}$を$\\overset{か}{変}$える。/对比两个意见，改变了看法。"
},
{
  word: "見比べる",
  kana: "みくらべる",
  type: "一段他动词",
  meaning: "对比，比较着看。",
  example: "$\\overset{しんきゅう}{新旧}$のモデルを$\\overset{みくら}{見比}$べて$\\overset{か}{買}$う。/对比新旧款再买。"
},
{
  word: "見込む",
  kana: "みこむ",
  type: "五段他动词",
  meaning: "预料，估计；期待。",
  example: "$\\overset{う}{売}$り$\\overset{あ}{上}$げの$\\overset{ぞうか}{増加}$を$\\overset{みこ}{見込}$んで$\\overset{せいさん}{生産}$する。/预计销售额会增加而进行生产。"
},
{
  word: "見知らぬ",
  kana: "みしらぬ",
  type: "连体词",
  meaning: "陌生的，不认识的。",
  example: "$\\overset{みし}{見知}$らぬ$\\overset{ひと}{人}$から$\\overset{とつぜん}{突然}$$\\overset{はな}{話}$しかけられた。/突然被陌生人搭话。"
},
{
  word: "見た目",
  kana: "みため",
  type: "名词",
  meaning: "外观，外表。",
  example: "この$\\overset{りょうり}{料理}$は$\\overset{み}{見}$た$\\overset{め}{目}$も$\\overset{あじ}{味}$も$\\overset{よ}{良}$い。/这道菜外表和味道都很好。"
},
{
  word: "見直す",
  kana: "みなおす",
  type: "五段他动词",
  meaning: "重看，重新检查；对……另眼相看。",
  example: "テストの$\\overset{こた}{答}$えをもう$\\overset{いちど}{一度}$$\\overset{みなお}{見直}$す。/把考试答案再重新检查一遍。"
},
{
  word: "見慣れる",
  kana: "みなれる",
  type: "一段自动词",
  meaning: "看惯，看熟。",
  example: "$\\overset{みな}{見慣}$れた$\\overset{けしき}{景色}$が$\\overset{こころ}{心}$を$\\overset{お}{落}$ち$\\overset{つ}{着}$かせる。/看惯了的风景让心平静下来。"
},
{
  word: "見本",
  kana: "みほん",
  type: "名词",
  meaning: "样本，样品。",
  example: "$\\overset{みほん}{見本}$を$\\overset{み}{見}$ながら、$\\overset{おな}{同}$じものを作る。/看着样本，做同样的东西。"
},
{
  word: "見守る",
  kana: "みまもる",
  type: "五段他动词",
  meaning: "注视，守护。",
  example: "$\\overset{こ}{子}$どもの$\\overset{せいちょう}{成長}$を$\\overset{あたた}{温}$かく$\\overset{みまも}{見守}$る。/温暖地守护着孩子的成长。"
},
{
  word: "見回す",
  kana: "みまわす",
  type: "五段他动词",
  meaning: "环视，环顾四周。",
  example: "$\\overset{へや}{部屋}$を$\\overset{みまわ}{見回}$して、$\\overset{だれ}{誰}$もいないことを$\\overset{かくにん}{確認}$した。/环视房间，确认了谁都不在。"
},
{
  word: "見渡す",
  kana: "みわたす",
  type: "五段他动词",
  meaning: "眺望，远望。",
  example: "$\\overset{やま}{山}$の$\\overset{うえ}{上}$から$\\overset{ひろ}{広}$い$\\overset{うみ}{海}$を$\\overset{みわた}{見渡}$す。/从山上远望宽广的大海。"
},
{
  word: "姪",
  kana: "めい",
  type: "名词",
  meaning: "侄女，外甥女。",
  example: "$\\overset{めい}{姪}$が$\\overset{ことし}{今年}$$\\overset{しょうがっこう}{小学校}$に$\\overset{にゅうがく}{入学}$する。/侄女今年上小学。"
},
{
  word: "めっきり",
  kana: "めっきり",
  type: "副词",
  meaning: "明显地，显著地。",
  example: "$\\overset{あき}{秋}$になって、めっきり$\\overset{すず}{涼}$しくなった。/到了秋天，明显变凉快了。"
},
{
  word: "申し上げる",
  kana: "もうしあげる",
  type: "一段他动词",
  meaning: "说，讲；致以（「言う」的谦让语）。",
  example: "$\\overset{こころ}{心}$からお$\\overset{わび}{詫}$び$\\overset{もう}{申}$し$\\overset{あ}{上}$げます。/由衷地向您致以歉意。"
},
{
  word: "申し合わせ",
  kana: "もうしあわせ",
  type: "名词",
  meaning: "商定，协议。",
  example: "$\\overset{じぜん}{事前}$の$\\overset{もう}{申}$し$\\overset{あ}{合}$わせに$\\overset{したが}{従}$って$\\overset{こうどう}{行動}$する。/按照事前的商定行动。"
},
{
  word: "申込書",
  kana: "もうしこみしょ",
  type: "名词",
  meaning: "申请书，报名表。",
  example: "$\\overset{もうしこみしょ}{申込書}$に$\\overset{ひつよう}{必要}$$\\overset{じこう}{事項}$を$\\overset{きにゅう}{記入}$する。/在申请书上填写必要事项。"
},
{
  word: "申し出",
  kana: "もうしで",
  type: "名词",
  meaning: "提议，申述。",
  example: "$\\overset{かれ}{彼}$の$\\overset{もう}{申}$し$\\overset{で}{出}$を$\\overset{よろこ}{喜}$んで$\\overset{う}{受}$け$\\overset{い}{入}$れる。/高兴地接受他的提议。"
},
{
  word: "申し訳",
  kana: "もうしわけ",
  type: "名词",
  meaning: "辩解，申辩。",
  example: "$\\overset{いまさら}{今更}$どんな$\\overset{もう}{申}$し$\\overset{わけ}{訳}$をしても$\\overset{むだ}{無駄}$だ。/事到如今做任何辩解都徒劳了。"
},
{
  word: "相手",
  kana: "あいて",
  type: "名词",
  meaning: "对方，对手。",
  example: "$\\overset{いつか}{五日}$の$\\overset{しあい}{試合}$で$\\overset{あいて}{相手}$の$\\overset{あし}{足}$の$\\overset{うご}{動}$きに$\\overset{ちゅうい}{注意}$する。/在五号的比赛中注意对手脚的动作。"
},
{
  word: "足",
  kana: "あし",
  type: "名词",
  meaning: "脚，腿。",
  example: "$\\overset{あし}{足}$が$\\overset{いた}{痛}$いので、$\\overset{あいて}{相手}$に$\\overset{てつだ}{手伝}$ってもらう。/因为脚痛，所以请对方帮忙。"
},
{
  word: "五日",
  kana: "いつか",
  type: "名词",
  meaning: "五日，五号；五天。",
  example: "$\\overset{いつか}{五日}$$\\overset{かん}{間}$休んで、やっと$\\overset{きも}{気持}$ちが$\\overset{おちつ}{落ち着}$いた。/休息了五天，心情终于平静下来了。"
},
{
  word: "受ける",
  kana: "うける",
  type: "一段他动词",
  meaning: "接受，遭受；参加（考试）。",
  example: "テストを$\\overset{う}{受}$けた$\\overset{あと}{後}$、$\\overset{きも}{気持}$ちが$\\overset{おちつ}{落ち着}$く。/考完试后，心情平静了下来。"
},
{
  word: "落ち着く",
  kana: "おちつく",
  type: "五段自动词",
  meaning: "平静，稳定下来；定居。",
  example: "お$\\overset{てあら}{手洗}$いに行って、$\\overset{すこ}{少}$し$\\overset{きも}{気持}$ちが$\\overset{おちつ}{落ち着}$いた。/去了一趟洗手间，心情稍微平静了一些。"
},
{
  word: "お握り",
  kana: "おにぎり",
  type: "名词",
  meaning: "饭团。",
  example: "$\\overset{か}{買}$い$\\overset{もの}{物}$の$\\overset{とちゅう}{途中}$でお$\\overset{にぎ}{握}$りを$\\overset{た}{食}$べる。/在购物途中吃饭团。"
},
{
  word: "お手洗い",
  kana: "おてあらい",
  type: "名词",
  meaning: "洗手间，厕所。",
  example: "$\\overset{か}{買}$い$\\overset{もの}{物}$の$\\overset{まえ}{前}$にお$\\overset{てあら}{手洗}$いに$\\overset{い}{行}$く。/购物前去洗手间。"
},
{
  word: "買い物",
  kana: "かいもの",
  type: "名・サ变动词する自",
  meaning: "购物，买东西。",
  example: "$\\overset{きのう}{昨日}$の$\\overset{か}{買}$い$\\overset{もの}{物}$で$\\overset{くだもの}{果物}$を$\\overset{か}{買}$った。/昨天的购物买了水果。 || デパートで$\\overset{ふく}{服}$を$\\overset{か}{買}$い$\\overset{もの}{物}$する。/在百货商场买衣服。"
},
{
  word: "片仮名",
  kana: "かたかな",
  type: "名词",
  meaning: "片假名。",
  example: "$\\overset{じょうず}{上手}$に$\\overset{かたかな}{片仮名}$と$\\overset{ひらがな}{平仮名}$を$\\overset{か}{書}$く。/熟练地写片假名和平假名。"
},
{
  word: "勝手",
  kana: "かって",
  type: "名・形动",
  meaning: "随便，任性；厨房（名）。",
  example: "$\\overset{かって}{勝手}$に$\\overset{あいて}{相手}$の$\\overset{もの}{物}$を$\\overset{つか}{使}$う。/随便使用对方的东西。 || $\\overset{かれ}{彼}$は$\\overset{かって}{勝手}$な$\\overset{こうどう}{行動}$が$\\overset{おお}{多}$い。/他任性的行为很多。"
},
{
  word: "昨日",
  kana: "きのう",
  type: "名词",
  meaning: "昨天。",
  example: "$\\overset{きのう}{昨日}$、きゅうりと$\\overset{くだもの}{果物}$を$\\overset{か}{買}$った。/昨天买了黄瓜和水果。"
},
{
  word: "きゅうり",
  kana: "きゅうり",
  type: "名词",
  meaning: "黄瓜。",
  example: "$\\overset{きょう}{今日}$の$\\overset{た}{食}$べ$\\overset{もの}{物}$はきゅうりと$\\overset{くだもの}{果物}$だ。/今天的食物是黄瓜和水果。"
},
{
  word: "今日",
  kana: "きょう",
  type: "名词",
  meaning: "今天。",
  example: "$\\overset{きょう}{今日}$の$\\overset{ここのか}{九日}$に、$\\overset{たてもの}{建物}$の$\\overset{ばしょ}{場所}$を$\\overset{たし}{確}$かめる。/在今天九号，确认建筑物的位置。"
},
{
  word: "果物",
  kana: "くだもの",
  type: "名词",
  meaning: "水果。",
  example: "$\\overset{きのう}{昨日}$$\\overset{か}{買}$った$\\overset{くだもの}{果物}$を$\\overset{きょう}{今日}$$\\overset{た}{食}$べる。/今天吃昨天买的水果。"
},
{
  word: "九日",
  kana: "ここのか",
  type: "名词",
  meaning: "九日，九号；九天。",
  example: "$\\overset{ここのか}{九日}$のうちに、$\\overset{てがみ}{手紙}$の$\\overset{へんじ}{返事}$を$\\overset{か}{書}$く。/在九天之内写回信。"
},
{
  word: "上手",
  kana: "じょうず",
  type: "名・形动",
  meaning: "擅长，高明。",
  example: "$\\overset{うた}{歌}$の$\\overset{じょうず}{上手}$な$\\overset{ひと}{人}$。/唱歌好的人。 || $\\overset{かれ}{彼}$は$\\overset{かたかな}{片仮名}$を$\\overset{か}{書}$くのが$\\overset{じょうず}{上手}$だ。/他很擅长写片假名。"
},
{
  word: "そのうち",
  kana: "そのうち",
  type: "副词",
  meaning: "不久，过几天。",
  example: "そのうち、$\\overset{なん}{何}$とか$\\overset{かいけつ}{解決}$できるだろう。/过几天，总能想办法解决的吧。"
},
{
  word: "確かめる",
  kana: "たしかめる",
  type: "一段他动词",
  meaning: "确认，弄清。",
  example: "$\\overset{たてもの}{建物}$の$\\overset{まえ}{前}$で$\\overset{あいて}{相手}$の$\\overset{かお}{顔}$を$\\overset{たし}{確}$かめる。/在建筑物前面确认对方的脸。"
},
{
  word: "建物",
  kana: "たてもの",
  type: "名词",
  meaning: "建筑物。",
  example: "あの$\\overset{たてもの}{建物}$の$\\overset{なか}{中}$で$\\overset{た}{食}$べ$\\overset{もの}{物}$を$\\overset{う}{売}$っている。/那栋建筑物里在卖食物。"
},
{
  word: "食べ物",
  kana: "たべもの",
  type: "名词",
  meaning: "食物。",
  example: "$\\overset{の}{飲}$み$\\overset{もの}{物}$と$\\overset{た}{食}$べ$\\overset{もの}{物}$を$\\overset{も}{持}$って$\\overset{で}{出}$かける。/带上饮料和食物出门。"
},
{
  word: "一日",
  kana: "ついたち",
  type: "名词",
  meaning: "一日，一号。",
  example: "$\\overset{じゅうがつ}{十月}$$\\overset{ついたち}{一日}$に$\\overset{てがみ}{手紙}$を$\\overset{だ}{出}$す。/在十月一号寄信。"
},
{
  word: "手",
  kana: "て",
  type: "名词",
  meaning: "手；手段。",
  example: "$\\overset{て}{手}$を$\\overset{あら}{洗}$ってから、$\\overset{てつだ}{手伝}$いをする。/洗完手之后去帮忙。"
},
{
  word: "手紙",
  kana: "てがみ",
  type: "名词",
  meaning: "信。",
  example: "$\\overset{てがみ}{手紙}$を$\\overset{てもと}{手元}$に$\\overset{お}{置}$いて$\\overset{たし}{確}$かめる。/把信放在手边确认。"
},
{
  word: "手伝う",
  kana: "てつだう",
  type: "五段他动词",
  meaning: "帮忙，帮助。",
  example: "$\\overset{ともだち}{友達}$の$\\overset{しごと}{仕事}$を$\\overset{てつだ}{手伝}$う。/给朋友的工作帮忙。"
},
{
  word: "手前",
  kana: "てまえ",
  type: "名词",
  meaning: "眼前，跟前；面子。",
  example: "$\\overset{たてもの}{建物}$の$\\overset{てまえ}{手前}$で$\\overset{まっす}{真っ直}$ぐ$\\overset{すす}{進}$む。/在建筑物跟前直走。"
},
{
  word: "手元",
  kana: "てもと",
  type: "名词",
  meaning: "手边，手头。",
  example: "$\\overset{てもと}{手元}$にある$\\overset{とお}{十}$の$\\overset{の}{飲}$み$\\overset{もの}{物}$を$\\overset{くば}{配}$る。/把手头的十瓶饮料分发下去。"
},
{
  word: "十",
  kana: "とお",
  type: "名词",
  meaning: "十。",
  example: "$\\overset{とおか}{十日}$までに$\\overset{とお}{十}$の$\\overset{かだい}{課題}$を$\\overset{お}{終}$わらせる。/在十号之前完成十个课题。"
},
{
  word: "十日",
  kana: "とおか",
  type: "名词",
  meaning: "十日，十号；十天。",
  example: "$\\overset{とおか}{十日}$と$\\overset{なのか}{七日}$の$\\overset{よてい}{予定}$を$\\overset{たし}{確}$かめる。/确认十号和七号的计划。"
},
{
  word: "七日",
  kana: "なのか",
  type: "名词",
  meaning: "七日，七号；七天。",
  example: "$\\overset{なのか}{七日}$$\\overset{かん}{間}$も$\\overset{あめ}{雨}$が$\\overset{ふ}{降}$り$\\overset{つづ}{続}$いている。/雨连续下了七天之久。"
},
{
  word: "何",
  kana: "なに",
  type: "代词",
  meaning: "什么。",
  example: "$\\overset{なに}{何}$か$\\overset{の}{飲}$み$\\overset{もの}{物}$はいかがですか。/要喝点什么饮料吗？"
},
{
  word: "何とか",
  kana: "なんとか",
  type: "副词",
  meaning: "想办法，勉强。",
  example: "$\\overset{にがて}{苦手}$な$\\overset{かもく}{科目}$を$\\overset{なん}{何}$とか$\\overset{ごうかく}{合格}$した。/想办法勉强及格了不擅长的科目。"
},
{
  word: "何となく",
  kana: "なんとなく",
  type: "副词",
  meaning: "不知不觉地，总觉得。",
  example: "$\\overset{なん}{何}$となく$\\overset{きょう}{今日}$はいい$\\overset{ひ}{日}$になりそうだ。/总觉得今天会是美好的一天。"
},
{
  word: "苦手",
  kana: "にがて",
  type: "名・形动",
  meaning: "不擅长，不善于对付。",
  example: "$\\overset{かれ}{彼}$は$\\overset{わたし}{私}$の$\\overset{にがて}{苦手}$だ。/我不太擅长应付他。 || $\\overset{かたかな}{片仮名}$が$\\overset{にがて}{苦手}$なので、$\\overset{れんしゅう}{練習}$する。/因为不擅长片假名，所以练习。"
},
{
  word: "飲み物",
  kana: "のみもの",
  type: "名词",
  meaning: "饮料。",
  example: "$\\overset{ひる}{昼}$$\\overset{やす}{休}$みに$\\overset{の}{飲}$み$\\overset{もの}{物}$を$\\overset{か}{買}$う。/午休时买饮料。"
},
{
  word: "日",
  kana: "ひ",
  type: "名词",
  meaning: "日，天，太阳。",
  example: "$\\overset{ひ}{日}$にちを$\\overset{き}{決}$めて、$\\overset{いっしょ}{一緒}$に$\\overset{で}{出}$かける。/定好日子，一起出门。"
},
{
  word: "日にち",
  kana: "ひにち",
  type: "名词",
  meaning: "日子，日期。",
  example: "$\\overset{りょこう}{旅行}$の$\\overset{ひ}{日}$にちを$\\overset{ふつか}{二日}$と$\\overset{みっか}{三日}$に$\\overset{き}{決}$める。/把旅行的日期定在二号和三号。"
},
{
  word: "平仮名",
  kana: "ひらがな",
  type: "名词",
  meaning: "平假名。",
  example: "$\\overset{ひらがな}{平仮名}$と$\\overset{かたかな}{片仮名}$を$\\overset{なん}{何}$とか$\\overset{おぼ}{覚}$える。/想办法记住了平假名和片假名。"
},
{
  word: "昼",
  kana: "ひる",
  type: "名词",
  meaning: "白天，中午。",
  example: "$\\overset{ひる}{昼}$に$\\overset{しょくどう}{食堂}$でご$\\overset{はん}{飯}$を$\\overset{た}{食}$べる。/中午在食堂吃饭。"
},
{
  word: "二日",
  kana: "ふつか",
  type: "名词",
  meaning: "二日，二号；两天。",
  example: "$\\overset{ふつか}{二日}$$\\overset{かん}{間}$、$\\overset{ひるね}{昼寝}$ばかりしていた。/连续两天光是睡午觉了。"
},
{
  word: "昼寝",
  kana: "ひるね",
  type: "名・サ变动词する自",
  meaning: "午睡。",
  example: "$\\overset{ひるね}{昼寝}$をして$\\overset{あたま}{頭}$がすっきりした。/睡了午觉头脑清醒了。 || $\\overset{ごご}{午後}$は$\\overset{つか}{疲}$れたので$\\overset{ひるね}{昼寝}$する。/下午累了所以睡午觉。"
},
{
  word: "下手",
  kana: "へた",
  type: "名・形动",
  meaning: "笨拙，不擅长。",
  example: "$\\overset{へた}{下手}$の$\\overset{よこず}{横好}$き。/虽然笨拙却很喜欢（常用于自谦）。 || $\\overset{わたし}{私}$は$\\overset{じ}{字}$を$\\overset{か}{書}$くのが$\\overset{へた}{下手}$だ。/我写字很笨拙。"
},
{
  word: "真っ直ぐ",
  kana: "まっすぐ",
  type: "名・形动・副词",
  meaning: "笔直，径直。",
  example: "$\\overset{まっす}{真っ直}$ぐな$\\overset{みち}{道}$を$\\overset{すす}{進}$む。/沿着笔直的道路前进。 || $\\overset{こうさてん}{交差点}$を$\\overset{まっす}{真っ直}$ぐ行ってください。/请在十字路口直走。"
},
{
  word: "真ん中",
  kana: "まんなか",
  type: "名词",
  meaning: "正中间。",
  example: "$\\overset{へや}{部屋}$の$\\overset{ま}{真}$ん$\\overset{なか}{中}$に$\\overset{かざ}{飾}$り$\\overset{もの}{物}$を$\\overset{お}{置}$く。/在房间的正中间放置装饰品。"
},
{
  word: "三日",
  kana: "みっか",
  type: "名词",
  meaning: "三日，三号；三天。",
  example: "$\\overset{みっか}{三日}$と$\\overset{むいか}{六日}$の$\\overset{よてい}{予定}$を$\\overset{たし}{確}$かめる。/确认三号和六号的计划。"
},
{
  word: "六日",
  kana: "むいか",
  type: "名词",
  meaning: "六日，六号；六天。",
  example: "$\\overset{むいか}{六日}$までに$\\overset{もの}{物}$を$\\overset{かたづ}{片付}$ける。/在六号之前把东西收拾好。"
},
{
  word: "物",
  kana: "もの",
  type: "名词",
  meaning: "物品，东西。",
  example: "$\\overset{お}{落}$とし$\\overset{もの}{物}$や$\\overset{わす}{忘}$れ$\\overset{もの}{物}$に$\\overset{ちゅうい}{注意}$する。/注意掉落的物品和遗忘的物品。"
},
{
  word: "八日",
  kana: "ようか",
  type: "名词",
  meaning: "八日，八号；八天。",
  example: "$\\overset{ようか}{八日}$と$\\overset{よっか}{四日}$に$\\overset{しけん}{試験}$を$\\overset{う}{受}$ける。/在八号和四号参加考试。"
},
{
  word: "四日",
  kana: "よっか",
  type: "名词",
  meaning: "四日，四号；四天。",
  example: "$\\overset{よっか}{四日}$$\\overset{かん}{間}$$\\overset{やす}{休}$んで、$\\overset{ひがえ}{日帰}$り$\\overset{りょこう}{旅行}$に$\\overset{い}{行}$く。/休息四天，去单日往返的旅行。"
},
{
  word: "忘れ物",
  kana: "わすれもの",
  type: "名词",
  meaning: "遗忘的物品。",
  example: "$\\overset{でんしゃ}{電車}$に$\\overset{わす}{忘}$れ$\\overset{もの}{物}$をして、$\\overset{おち}{落ち}$ち$\\overset{こ}{込}$む。/把东西忘在电车上了，感到很失落。"
},
{
  word: "粗筋",
  kana: "あらすじ",
  type: "名词",
  meaning: "梗概，大纲。",
  example: "$\\overset{ものがたり}{物語}$の$\\overset{あらすじ}{粗筋}$を$\\overset{だいたい}{大体}$$\\overset{りかい}{理解}$した。/大体理解了故事的梗概。"
},
{
  word: "受け入れる",
  kana: "うけいれる",
  type: "一段他动词",
  meaning: "接受，采纳。",
  example: "$\\overset{かれ}{彼}$の$\\overset{いけん}{意見}$を$\\overset{う}{受}$け$\\overset{い}{入}$れて$\\overset{てつづ}{手続}$きをする。/采纳他的意见进行手续办理。"
},
{
  word: "受け継ぐ",
  kana: "うけつぐ",
  type: "五段他动词",
  meaning: "继承，承继。",
  example: "$\\overset{でんとう}{伝統}$を$\\overset{う}{受}$け$\\overset{つ}{継}$いで、$\\overset{あたら}{新}$しい$\\overset{ものごと}{物事}$に$\\overset{と}{取}$り$\\overset{く}{組}$む。/继承传统，致力于新的事物。"
},
{
  word: "受付",
  kana: "うけつけ",
  type: "名词",
  meaning: "接待处，问询处。",
  example: "$\\overset{うけつけ}{受付}$で$\\overset{てつづ}{手続}$きをして$\\overset{にもつ}{荷物}$を$\\overset{う}{受}$け$\\overset{と}{取}$る。/在接待处办理手续并领取行李。"
},
{
  word: "受け取る",
  kana: "うけとる",
  type: "五段他动词",
  meaning: "接收，领取。",
  example: "$\\overset{まどぐち}{窓口}$で$\\overset{しなもの}{品物}$を$\\overset{う}{受}$け$\\overset{と}{取}$る。/在窗口领取物品。"
},
{
  word: "落ちる",
  kana: "おちる",
  type: "一段自动词",
  meaning: "掉落，落下；落榜。",
  example: "$\\overset{き}{木}$から$\\overset{くだもの}{果物}$が$\\overset{お}{落}$ちる。/水果从树上掉落。"
},
{
  word: "落とす",
  kana: "おとす",
  type: "五段他动词",
  meaning: "使落下，弄丢。",
  example: "$\\overset{さいふ}{財布}$を$\\overset{お}{落}$としてしまい、$\\overset{うけつけ}{受付}$で$\\overset{き}{聞}$く。/把钱包弄丢了，在接待处询问。"
},
{
  word: "飾り物",
  kana: "かざりもの",
  type: "名词",
  meaning: "装饰品。",
  example: "$\\overset{へや}{部屋}$の$\\overset{かざ}{飾}$り$\\overset{もの}{物}$を$\\overset{きれい}{綺麗}$に$\\overset{かたづ}{片付}$ける。/把房间的装饰品收拾干净。"
},
{
  word: "片付ける",
  kana: "かたづける",
  type: "一段他动词",
  meaning: "收拾，整理；解决。",
  example: "$\\overset{きもの}{着物}$と$\\overset{てぶくろ}{手袋}$を$\\overset{ひ}{引}$き$\\overset{だ}{出}$しに$\\overset{かたづ}{片付}$ける。/把和服与手套收拾进抽屉里。"
},
{
  word: "着物",
  kana: "きもの",
  type: "名词",
  meaning: "和服，衣服。",
  example: "$\\overset{うつく}{美}$しい$\\overset{きもの}{着物}$を$\\overset{き}{着}$て$\\overset{で}{出}$かける。/穿上美丽的和服出门。"
},
{
  word: "手続き",
  kana: "てつづき",
  type: "名・サ变动词する自他",
  meaning: "手续，办理手续。",
  example: "$\\overset{にゅうがく}{入学}$の$\\overset{てつづ}{手続}$きを$\\overset{お}{終}$える。/完成了入学手续。 || $\\overset{やくしょ}{役所}$で$\\overset{ひっこ}{引越}$しを$\\overset{てつづ}{手続}$きする。/在政府机关办理搬家手续。"
},
{
  word: "手袋",
  kana: "てぶくろ",
  type: "名词",
  meaning: "手套。",
  example: "$\\overset{ふゆ}{冬}$は$\\overset{さむ}{寒}$いので$\\overset{てぶくろ}{手袋}$をする。/冬天很冷，所以戴手套。"
},
{
  word: "日帰り",
  kana: "ひがえり",
  type: "名・サ变动词する自",
  meaning: "单日往返，当天来回。",
  example: "$\\overset{ひがえ}{日帰}$りの$\\overset{おんせん}{温泉}$$\\overset{りょこう}{旅行}$に$\\overset{い}{行}$く。/去当天来回的温泉旅行。 || $\\overset{しゅっちょう}{出張}$$\\overset{さき}{先}$から$\\overset{ひがえ}{日帰}$りする。/从出差地当天返回。"
},
{
  word: "物語",
  kana: "ものがたり",
  type: "名词",
  meaning: "故事。",
  example: "この$\\overset{ものがたり}{物語}$の$\\overset{あらすじ}{粗筋}$は$\\overset{たいへん}{大変}$$\\overset{おもしろ}{面白}$い。/这个故事的大纲非常有趣。"
},
{
  word: "おかず",
  kana: "おかず",
  type: "名词",
  meaning: "菜肴，下饭菜。",
  example: "$\\overset{きょう}{今日}$の$\\overset{べんとう}{弁当}$のおかずは$\\overset{あ}{揚}$げ$\\overset{もの}{物}$だ。/今天便当的菜是油炸食品。"
},
{
  word: "階",
  kana: "かい",
  type: "名词・量词",
  meaning: "楼层。",
  example: "$\\overset{わたし}{私}$の$\\overset{へや}{部屋}$は$\\overset{たてもの}{建物}$の$\\overset{さん}{三}$$\\overset{かい}{階}$にあります。/我的房间在建筑物的三楼。"
},
{
  word: "仮名",
  kana: "かな",
  type: "名词",
  meaning: "假名。",
  example: "$\\overset{かんじ}{漢字}$に$\\overset{ふ}{振}$り$\\overset{がな}{仮名}$をつける。/给汉字标上假名注音。"
},
{
  word: "腰掛ける",
  kana: "こしかける",
  type: "一段自动词",
  meaning: "坐下，落座。",
  example: "$\\overset{こうえん}{公園}$のベンチに$\\overset{こしか}{腰掛}$けて$\\overset{やす}{休}$む。/坐在公园的长椅上休息。"
},
{
  word: "転げる",
  kana: "ころげる",
  type: "一段自动词",
  meaning: "滚动，滚落。",
  example: "$\\overset{かいだん}{階段}$から$\\overset{ころ}{転}$げ$\\overset{お}{落}$ちて$\\overset{けが}{怪我}$をした。/从楼梯上滚落下来受了伤。"
},
{
  word: "字",
  kana: "じ",
  type: "名词",
  meaning: "字，文字。",
  example: "$\\overset{ていねい}{丁寧}$に$\\overset{じ}{字}$を$\\overset{か}{書}$いて、$\\overset{てがみ}{手紙}$を$\\overset{だ}{出}$す。/认真地写字，然后寄信。"
},
{
  word: "品物",
  kana: "しなもの",
  type: "名词",
  meaning: "物品，商品。",
  example: "$\\overset{みせ}{店}$の$\\overset{しなもの}{品物}$を$\\overset{て}{手}$に$\\overset{と}{取}$って$\\overset{み}{見}$る。/拿起店里的商品看。"
},
{
  word: "その上",
  kana: "そのうえ",
  type: "接续词",
  meaning: "而且，加上。",
  example: "この$\\overset{しなもの}{品物}$は$\\overset{やす}{安}$い。$\\overset{そのうえ}{その上}$、$\\overset{ひんしつ}{品質}$も$\\overset{よ}{良}$い。/这件商品很便宜。而且，质量也很好。"
},
{
  word: "そのかわり",
  kana: "そのかわり",
  type: "接续词",
  meaning: "作为代替，作为交换。",
  example: "$\\overset{てつだ}{手伝}$うよ。そのかわり、ご$\\overset{はん}{飯}$をご$\\overset{ちそう}{馳走}$して。/我帮你吧。作为交换，请我吃饭。"
},
{
  word: "その後",
  kana: "そのご",
  type: "名・副词",
  meaning: "那以后，之后。",
  example: "$\\overset{そのご}{その後}$、$\\overset{かれ}{彼}$からの$\\overset{れんらく}{連絡}$はない。/那之后，就没有他的联系了。"
},
{
  word: "その他",
  kana: "そのほか",
  type: "名词",
  meaning: "其他。",
  example: "$\\overset{がくひ}{学費}$や$\\overset{そのほか}{その他}$の$\\overset{ひよう}{費用}$がかかる。/需要花费学费和其他费用。"
},
{
  word: "月日",
  kana: "つきひ",
  type: "名词",
  meaning: "岁月，光阴。",
  example: "$\\overset{つきひ}{月日}$が$\\overset{す}{過}$ぎ$\\overset{さ}{去}$るのは$\\overset{ひじょう}{非常}$に$\\overset{はや}{早}$い。/岁月的流逝非常快。"
},
{
  word: "手足",
  kana: "てあし",
  type: "名词",
  meaning: "手脚。",
  example: "$\\overset{さむ}{寒}$さで$\\overset{てあし}{手足}$が$\\overset{つめ}{冷}$たくなった。/因为寒冷，手脚变得冰凉。"
},
{
  word: "手洗い",
  kana: "てあらい",
  type: "名词",
  meaning: "洗手；洗手间。",
  example: "$\\overset{しょくじ}{食事}$の$\\overset{まえ}{前}$にしっかり$\\overset{てあら}{手洗}$いをする。/饭前好好洗手。"
},
{
  word: "手本",
  kana: "てほん",
  type: "名词",
  meaning: "字帖，字样；模范，榜样。",
  example: "$\\overset{せんせい}{先生}$の$\\overset{か}{書}$いた$\\overset{じ}{字}$を$\\overset{てほん}{手本}$にして$\\overset{れんしゅう}{練習}$する。/以老师写的字为字帖进行练习。"
},
{
  word: "何だか",
  kana: "なんだか",
  type: "副词",
  meaning: "总觉得，不知为什么。",
  example: "$\\overset{なん}{何}$だか$\\overset{きょう}{今日}$は$\\overset{あわただ}{慌ただ}$しい$\\overset{いちにち}{一日}$だった。/总觉得今天是个慌乱的一天。"
},
{
  word: "何と",
  kana: "なんと",
  type: "副词",
  meaning: "多么（表惊讶、感叹）。",
  example: "$\\overset{なん}{何}$と$\\overset{すば}{素晴}$らしい$\\overset{けしき}{景色}$だろう。/这是多么美丽的景色啊！"
},
{
  word: "昼間",
  kana: "ひるま",
  type: "名词",
  meaning: "白天。",
  example: "$\\overset{ひるま}{昼間}$は$\\overset{あたた}{暖}$かいが、$\\overset{よる}{夜}$は$\\overset{さむ}{寒}$い。/白天很暖和，但晚上很冷。"
},
{
  word: "物事",
  kana: "ものごと",
  type: "名词",
  meaning: "事物，事情。",
  example: "$\\overset{ものごと}{物事}$の$\\overset{てじゅん}{手順}$をしっかり$\\overset{たし}{確}$かめる。/好好确认事物的步骤。"
},
{
  word: "物凄い",
  kana: "ものすごい",
  type: "形容词",
  meaning: "惊人的，可怕的。",
  example: "$\\overset{ものすご}{物凄}$い$\\overset{あしおと}{足音}$が$\\overset{ちか}{近}$づいてきた。/可怕的脚步声靠近了。"
},
{
  word: "揚げ物",
  kana: "あげもの",
  type: "名词",
  meaning: "油炸食品。",
  example: "$\\overset{ゆうしょく}{夕食}$におかずとして$\\overset{あ}{揚}$げ$\\overset{もの}{物}$を$\\overset{つく}{作}$る。/晚饭做油炸食品作为下饭菜。"
},
{
  word: "足跡",
  kana: "あしあと",
  type: "名词",
  meaning: "脚印，足迹。",
  example: "$\\overset{ゆき}{雪}$の$\\overset{うえ}{上}$に$\\overset{のこ}{残}$った$\\overset{どうぶつ}{動物}$の$\\overset{あしあと}{足跡}$。/留在雪地上的动物脚印。"
},
{
  word: "足音",
  kana: "あしおと",
  type: "名词",
  meaning: "脚步声。",
  example: "$\\overset{よる}{夜}$の$\\overset{ろうか}{廊下}$で$\\overset{だれ}{誰}$かの$\\overset{あしおと}{足音}$が$\\overset{き}{聞}$こえる。/在夜晚的走廊听到某人的脚步声。"
},
{
  word: "足元",
  kana: "あしもと",
  type: "名词",
  meaning: "脚下，立足点。",
  example: "$\\overset{くら}{暗}$いので、$\\overset{あしもと}{足元}$に$\\overset{ちゅうい}{注意}$して$\\overset{ある}{歩}$く。/因为很暗，所以注意脚下走。"
},
{
  word: "編み物",
  kana: "あみもの",
  type: "名词",
  meaning: "编织物，毛衣等。",
  example: "$\\overset{ふゆ}{冬}$に向けて$\\overset{あ}{編}$み$\\overset{もの}{物}$の$\\overset{じゅんび}{準備}$をする。/为冬天做编织的准备。"
},
{
  word: "編む",
  kana: "あむ",
  type: "五段他动词",
  meaning: "编织。",
  example: "$\\overset{けいと}{毛糸}$でセーターを$\\overset{あ}{編}$む。/用毛线编织毛衣。"
},
{
  word: "慌ただしい",
  kana: "あわただしい",
  type: "形容词",
  meaning: "匆忙的，慌乱的。",
  example: "$\\overset{ひっこ}{引越}$しの$\\overset{じゅんび}{準備}$で$\\overset{あわただ}{慌ただ}$しい$\\overset{ひび}{日々}$を$\\overset{おく}{送}$る。/因为准备搬家，过着慌乱的日子。"
},
{
  word: "意向",
  kana: "いこう",
  type: "名词",
  meaning: "意向，意图。",
  example: "$\\overset{あいて}{相手}$の$\\overset{いこう}{意向}$を$\\overset{たし}{確}$かめてから$\\overset{けってい}{決定}$する。/确认了对方的意向后再做决定。"
},
{
  word: "居間",
  kana: "いま",
  type: "名词",
  meaning: "起居室，客厅。",
  example: "$\\overset{いま}{居間}$で$\\overset{かぞく}{家族}$と$\\overset{いっしょ}{一緒}$にテレビを$\\overset{み}{見}$る。/在客厅和家人一起看电视。"
},
{
  word: "受け取り",
  kana: "うけとり",
  type: "名词",
  meaning: "领取，收据。",
  example: "$\\overset{にもつ}{荷物}$の$\\overset{う}{受}$け$\\overset{と}{取}$りに$\\overset{いんかん}{印鑑}$が$\\overset{ひつよう}{必要}$だ。/领取包裹需要印章。"
},
{
  word: "落ち込む",
  kana: "おちこむ",
  type: "五段自动词",
  meaning: "低落，消沉；陷落。",
  example: "$\\overset{しけん}{試験}$に$\\overset{しっぱい}{失敗}$して$\\overset{はげ}{激}$しく$\\overset{おちこ}{落ち込}$む。/考试失败了，感到极度消沉。"
},
{
  word: "落とし物",
  kana: "おとしもの",
  type: "名词",
  meaning: "失物，遗失物品。",
  example: "$\\overset{えき}{駅}$に$\\overset{お}{落}$とし$\\overset{もの}{物}$を$\\overset{とど}{届}$ける。/把失物送到车站（失物招领处）。"
},
{
  word: "及ぶ",
  kana: "およぶ",
  type: "五段自动词",
  meaning: "达到，涉及；比得上（后接否定）。",
  example: "$\\overset{かれ}{彼}$の$\\overset{のうりょく}{能力}$には$\\overset{とうてい}{到底}$$\\overset{およ}{及}$ばない。/到底还是比不上他的能力。"
},
{
  word: "片思い",
  kana: "かたおもい",
  type: "名・サ变动词する自",
  meaning: "单相思。",
  example: "$\\overset{なが}{長}$い$\\overset{あいだ}{間}$、$\\overset{かたおも}{片思い}$をしている。/长时间处于单相思中。 || $\\overset{どうきゅうせい}{同級生}$に$\\overset{かたおも}{片思い}$する。/单相思同班同学。"
},
{
  word: "片言",
  kana: "かたこと",
  type: "名词",
  meaning: "只言片语，（外语等）说得结结巴巴。",
  example: "$\\overset{かたこと}{片言}$の$\\overset{えいご}{英語}$で$\\overset{がいこくじん}{外国人}$と$\\overset{こうさい}{交際}$する。/用结结巴巴的英语和外国人交往。"
},
{
  word: "片手",
  kana: "かたて",
  type: "名词",
  meaning: "单手，一只手。",
  example: "$\\overset{かたて}{片手}$に$\\overset{ほん}{本}$を$\\overset{も}{持}$ちながら$\\overset{ある}{歩}$く。/单手拿着书走路。"
},
{
  word: "片方",
  kana: "かたほう",
  type: "名词",
  meaning: "单方，一方，一只。",
  example: "$\\overset{くつ}{靴}$の$\\overset{かたほう}{片方}$が$\\overset{み}{見}$つからない。/找不到另一只鞋了。"
},
{
  word: "片道",
  kana: "かたみち",
  type: "名词",
  meaning: "单程。",
  example: "$\\overset{かたみち}{片道}$の$\\overset{きっぷ}{切符}$だけを$\\overset{か}{買}$って$\\overset{しゅっぱつ}{出発}$する。/只买单程票出发。"
},
{
  word: "缶詰",
  kana: "かんづめ",
  type: "名词",
  meaning: "罐头。",
  example: "$\\overset{ひじょう}{非常}$$\\overset{しょく}{食}$として$\\overset{かんづめ}{缶詰}$を$\\overset{てもと}{手元}$に$\\overset{お}{置}$く。/把罐头作为储备粮放在手边。"
},
{
  word: "帰国",
  kana: "きこく",
  type: "名・サ变动词する自",
  meaning: "回国。",
  example: "$\\overset{あした}{明日}$が$\\overset{かれ}{彼}$の$\\overset{きこく}{帰国}$の$\\overset{ひ}{日}$だ。/明天是他回国的日子。 || $\\overset{さんねん}{三年}$ぶりに$\\overset{にほん}{日本}$に$\\overset{きこく}{帰国}$する。/时隔三年回国（回到日本）。"
},
{
  word: "きらきら",
  kana: "きらきら",
  type: "副词・サ变动词する自",
  meaning: "闪耀，闪烁。",
  example: "$\\overset{ほし}{星}$がきらきらと$\\overset{かがや}{輝}$いている。/星星闪闪发光。 || $\\overset{かのじょ}{彼女}$の$\\overset{め}{目}$がきらきらしている。/她的眼睛闪闪发亮。"
},
{
  word: "交際",
  kana: "こうさい",
  type: "名・サ变动词する自",
  meaning: "交往，交际。",
  example: "$\\overset{かれ}{彼}$との$\\overset{こうさい}{交際}$が$\\overset{じゅんちょう}{順調}$に$\\overset{すす}{進}$む。/和他的交往进展顺利。 || $\\overset{あたら}{新}$しい$\\overset{ゆうじん}{友人}$と$\\overset{こうさい}{交際}$する。/结交新的朋友。"
},
{
  word: "国歌",
  kana: "こっか",
  type: "名词",
  meaning: "国歌。",
  example: "$\\overset{しき}{式}$の$\\overset{はじ}{始}$めに$\\overset{こっか}{国歌}$を$\\overset{うた}{歌}$う。/在仪式开始时唱国歌。"
},
{
  word: "国旗",
  kana: "こっき",
  type: "名词",
  meaning: "国旗。",
  example: "$\\overset{たてもの}{建物}$の$\\overset{うえ}{上}$に$\\overset{こっき}{国旗}$が$\\overset{かか}{掲}$げられている。/建筑物上方悬挂着国旗。"
},
{
  word: "さっさと",
  kana: "さっさと",
  type: "副词",
  meaning: "赶紧，迅速地。",
  example: "$\\overset{じかん}{時間}$がないから、さっさと$\\overset{かたづ}{片付}$けなさい。/没时间了，赶紧收拾吧。"
},
{
  word: "ざっと",
  kana: "ざっと",
  type: "副词",
  meaning: "粗略地，大致。",
  example: "$\\overset{しょるい}{書類}$にざっと$\\overset{め}{目}$を$\\overset{とお}{通}$す。/粗略地看一遍文件。"
},
{
  word: "過ぎ去る",
  kana: "すぎさる",
  type: "五段自动词",
  meaning: "过去，消逝。",
  example: "$\\overset{つら}{辛}$い$\\overset{ひび}{日々}$が$\\overset{す}{過}$ぎ$\\overset{さ}{去}$り、$\\overset{へいわ}{平和}$が$\\overset{おとず}{訪}$れた。/痛苦的日子过去了，迎来了和平。"
},
{
  word: "精",
  kana: "せい",
  type: "名词",
  meaning: "精力，精神。",
  example: "$\\overset{せい}{精}$を$\\overset{だ}{出}$して$\\overset{しごと}{仕事}$に$\\overset{と}{取}$り$\\overset{く}{組}$む。/打起精神致力于工作。"
},
{
  word: "その",
  kana: "その",
  type: "连体词",
  meaning: "那个。",
  example: "$\\overset{その}{その}$$\\overset{てちょう}{手帳}$を$\\overset{わたし}{私}$に$\\overset{み}{見}$せてください。/请把那本手册给我看看。"
},
{
  word: "代行",
  kana: "だいこう",
  type: "名・サ变动词する他",
  meaning: "代办，代理。",
  example: "$\\overset{ぎょうむ}{業務}$の$\\overset{だいこう}{代行}$を$\\overset{いらい}{依頼}$する。/委托业务代办。 || $\\overset{しゃちょう}{社長}$の$\\overset{しごと}{仕事}$を$\\overset{だいこう}{代行}$する。/代理总经理的工作。"
},
{
  word: "手入れ",
  kana: "ていれ",
  type: "名・サ变动词する他",
  meaning: "保养，修整。",
  example: "$\\overset{にわ}{庭}$の$\\overset{てい}{手}$れに$\\overset{じかん}{時間}$をかける。/花时间修整庭院。 || $\\overset{きかい}{機械}$を$\\overset{ていきてき}{定期的}$に$\\overset{てい}{手}$れする。/定期保养机械。"
},
{
  word: "手軽",
  kana: "てがる",
  type: "形动",
  meaning: "简便，轻易。",
  example: "$\\overset{てがる}{手軽}$な$\\overset{てづく}{手作}$り$\\overset{りょうり}{料理}$で$\\overset{ひる}{昼}$ご$\\overset{はん}{飯}$を$\\overset{す}{済}$ませる。/用简便的手工料理解决午饭。"
},
{
  word: "手順",
  kana: "てじゅん",
  type: "名词",
  meaning: "步骤，程序。",
  example: "$\\overset{さぎょう}{作業}$の$\\overset{てじゅん}{手順}$を$\\overset{たし}{確}$かめる。/确认作业的步骤。"
},
{
  word: "手数料",
  kana: "てすうりょう",
  type: "名词",
  meaning: "手续费。",
  example: "$\\overset{ぎんこう}{銀行}$で$\\overset{たか}{高}$い$\\overset{てすうりょう}{手数料}$を$\\overset{ひ}{引}$かれる。/在银行被扣了很高的手续费。"
},
{
  word: "手帳",
  kana: "てちょう",
  type: "名词",
  meaning: "记事本，手册。",
  example: "$\\overset{てちょう}{手帳}$に$\\overset{ひづけ}{日付}$と$\\overset{よてい}{予定}$をメモする。/在手册上记下日期和计划。"
},
{
  word: "手作り",
  kana: "てづくり",
  type: "名・サ变动词する他",
  meaning: "手工制作。",
  example: "これは$\\overset{はは}{母}$の$\\overset{てづく}{手作}$りのケーキだ。/这是妈妈手工制作的蛋糕。 || $\\overset{しゅうまつ}{週末}$に$\\overset{べんとう}{弁当}$を$\\overset{てづく}{手作}$りする。/周末手工制作便当。"
},
{
  word: "何て",
  kana: "なんて",
  type: "副词・助词",
  meaning: "多么；……什么的（表轻视或意外）。",
  example: "$\\overset{なん}{何}$て$\\overset{きれい}{綺麗}$な$\\overset{ひ}{日}$の$\\overset{で}{出}$だろう。/多么美丽的日出啊。 || $\\overset{しっぱい}{失敗}$するなんて$\\overset{おも}{思}$わなかった。/竟然会失败，真是没想到。"
},
{
  word: "何でも",
  kana: "なんでも",
  type: "代词・副词",
  meaning: "什么都，无论什么；据说。",
  example: "$\\overset{かれ}{彼}$は$\\overset{なん}{何}$でも$\\overset{し}{知}$っている。/他什么都知道。"
},
{
  word: "日の出",
  kana: "ひので",
  type: "名词",
  meaning: "日出。",
  example: "$\\overset{やま}{山}$の$\\overset{ちょうじょう}{頂上}$で$\\overset{うつく}{美}$しい$\\overset{ひ}{日}$の$\\overset{で}{出}$を$\\overset{み}{見}$る。/在山顶看美丽的日出。"
},
{
  word: "二十日",
  kana: "はつか",
  type: "名词",
  meaning: "二十日，二十号；二十天。",
  example: "$\\overset{こんげつ}{今月}$の$\\overset{はつか}{二十日}$に$\\overset{しけん}{試験}$がある。/这个月二十号有考试。"
},
{
  word: "控える",
  kana: "ひかえる",
  type: "一段自他动词",
  meaning: "控制，节制；等候，面临。",
  example: "$\\overset{けんこう}{健康}$のために$\\overset{えんぶん}{塩分}$を$\\overset{ひか}{控}$える。/为了健康节制盐分。 || $\\overset{そつぎょう}{卒業}$を$\\overset{ひか}{控}$えた$\\overset{がくせい}{学生}$。/面临毕业的学生。"
},
{
  word: "日差し",
  kana: "ひざし",
  type: "名词",
  meaning: "阳光，日照。",
  example: "$\\overset{なつ}{夏}$の$\\overset{つよ}{強}$い$\\overset{ひざし}{日差し}$を$\\overset{さ}{避}$ける。/避开夏天强烈的阳光。"
},
{
  word: "日付",
  kana: "ひづけ",
  type: "名词",
  meaning: "日期。",
  example: "$\\overset{しょるい}{書類}$に$\\overset{きょう}{今日}$の$\\overset{ひづけ}{日付}$を$\\overset{か}{書}$く。/在文件上写上今天的日期。"
},
{
  word: "日の丸",
  kana: "ひのまる",
  type: "名词",
  meaning: "太阳旗（日本国旗）。",
  example: "$\\overset{ひ}{日}$の$\\overset{まる}{丸}$の$\\overset{こっき}{国旗}$が$\\overset{かぜ}{風}$に$\\overset{ゆ}{揺}$れる。/太阳旗在风中飘扬。"
},
{
  word: "日々",
  kana: "ひび",
  type: "名词",
  meaning: "每天，日子。",
  example: "$\\overset{あわただ}{慌ただ}$しい$\\overset{ひび}{日々}$の$\\overset{なか}{中}$で$\\overset{やす}{休}$みを$\\overset{と}{取}$る。/在慌乱的日子中休息一下。"
},
{
  word: "昼ご飯",
  kana: "ひるごはん",
  type: "名词",
  meaning: "午饭。",
  example: "$\\overset{ひる}{昼}$$\\overset{やす}{休}$みに$\\overset{ともだち}{友達}$と$\\overset{ひる}{昼}$ご$\\overset{はん}{飯}$を$\\overset{た}{食}$べる。/午休时和朋友吃午饭。"
},
{
  word: "昼休み",
  kana: "ひるやすみ",
  type: "名词",
  meaning: "午休。",
  example: "$\\overset{ひる}{昼}$$\\overset{やす}{休}$みに$\\overset{よ}{読}$み$\\overset{もの}{物}$を$\\overset{よ}{読}$んで$\\overset{す}{過}$ごす。/午休时看读物度过。"
},
{
  word: "本物",
  kana: "ほんもの",
  type: "名词",
  meaning: "真货，真东西。",
  example: "この$\\overset{え}{絵}$は$\\overset{ほんもの}{本物}$の$\\overset{げいじゅつ}{芸術}$$\\overset{さくひん}{作品}$だ。/这幅画是真正的艺术作品。"
},
{
  word: "真っ赤",
  kana: "まっか",
  type: "名・形动",
  meaning: "通红，鲜红；完全（撒谎）。",
  example: "$\\overset{はず}{恥}$かしくて$\\overset{かお}{顔}$が$\\overset{まっか}{真っ赤}$になる。/因为害羞脸变得通红。 || $\\overset{まっか}{真っ赤}$な$\\overset{うそ}{嘘}$をつく。/撒弥天大谎。"
},
{
  word: "真っ暗",
  kana: "まっくら",
  type: "名・形动",
  meaning: "漆黑。",
  example: "$\\overset{ていでん}{停電}$で$\\overset{へや}{部屋}$が$\\overset{まっくら}{真っ暗}$になった。/因为停电房间变得漆黑了。"
},
{
  word: "真っ黒",
  kana: "まっくろ",
  type: "名・形动",
  meaning: "乌黑。",
  example: "$\\overset{どろ}{泥}$で$\\overset{くつ}{靴}$が$\\overset{まっくろ}{真っ黒}$に$\\overset{よご}{汚}$れた。/鞋子被泥弄得乌黑。"
},
{
  word: "真っ青",
  kana: "まっさお",
  type: "名・形动",
  meaning: "蔚蓝；苍白。",
  example: "$\\overset{まっさお}{真っ青}$な$\\overset{そら}{空}$が$\\overset{ひろ}{広}$がる。/蔚蓝的天空展现开来。 || $\\overset{きょうふ}{恐怖}$で$\\overset{かお}{顔}$が$\\overset{まっさお}{真っ青}$になる。/因为恐惧脸变得苍白。"
},
{
  word: "真っ先",
  kana: "まっさき",
  type: "名词",
  meaning: "最先，最前面。",
  example: "$\\overset{かれ}{彼}$は$\\overset{だれ}{誰}$よりも$\\overset{まっさき}{真っ先}$に$\\overset{こうどう}{行動}$した。/他比谁都最先采取了行动。"
},
{
  word: "真っ白",
  kana: "まっしろ",
  type: "名・形动",
  meaning: "雪白，纯白。",
  example: "$\\overset{ゆき}{雪}$で$\\overset{みち}{道}$が$\\overset{まっしろ}{真っ白}$になる。/因为下雪路变得雪白。"
},
{
  word: "巡る",
  kana: "めぐる",
  type: "五段自他动词",
  meaning: "巡游，环绕；循环；围绕（某问题）。",
  example: "$\\overset{めいしょきゅうせき}{名所旧跡}$を$\\overset{めぐ}{巡}$る$\\overset{りょこう}{旅行}$。/巡游名胜古迹的旅行。 || $\\overset{きせつ}{季節}$が$\\overset{めぐ}{巡}$る。/季节循环。"
},
{
  word: "物足りない",
  kana: "ものたりない",
  type: "形容词",
  meaning: "不够满足的，欠缺的。",
  example: "この$\\overset{りょうり}{料理}$は$\\overset{あじ}{味}$が$\\overset{すこ}{少}$し$\\overset{ものた}{物足}$りない。/这道菜味道稍微有些欠缺。"
},
{
  word: "ゆったり",
  kana: "ゆったり",
  type: "副词・サ变动词する自",
  meaning: "宽敞，舒适；放松。",
  example: "$\\overset{きゅうじつ}{休日}$は$\\overset{いえ}{家}$でゆったりと$\\overset{す}{過}$ごす。/休息日在家里舒适放松地度过。 || $\\overset{おんせん}{温泉}$に$\\overset{はい}{入}$ってゆったりする。/泡温泉放松。"
},
{
  word: "読み物",
  kana: "よみもの",
  type: "名词",
  meaning: "读物。",
  example: "$\\overset{でんしゃ}{電車}$の$\\overset{なか}{中}$で$\\overset{たの}{楽}$しい$\\overset{よ}{読}$み$\\overset{もの}{物}$を$\\overset{よ}{読}$む。/在电车里看有趣的读物。"
},
{
  word: "色",
  kana: "いろ",
  type: "名词",
  meaning: "颜色。",
  example: "$\\overset{いろいろ}{色々}$な$\\overset{いろ}{色}$の$\\overset{ふく}{服}$を$\\overset{ため}{試}$す。/尝试各种颜色的衣服。"
},
{
  word: "色々",
  kana: "いろいろ",
  type: "名・形动・副词",
  meaning: "各种各样。",
  example: "$\\overset{いろいろ}{色々}$と$\\overset{せわ}{世話}$になった。/承蒙各方面的照顾。 || $\\overset{いろいろ}{色々}$な$\\overset{しゅるい}{種類}$の$\\overset{おかね}{お金}$がある。/有各种各样的钱（货币）。 || お$\\overset{かあ}{母}$さんが$\\overset{いろいろ}{色々}$$\\overset{おし}{教}$えてくれた。/妈妈教了我很多。"
},
{
  word: "お母さん",
  kana: "おかあさん",
  type: "名词",
  meaning: "母亲，妈妈。",
  example: "お$\\overset{かあ}{母}$さんのおかげで、$\\overset{びょうき}{病気}$が$\\overset{なお}{治}$った。/多亏了妈妈，病才治好。"
},
{
  word: "お金",
  kana: "おかね",
  type: "名词",
  meaning: "钱。",
  example: "お$\\overset{とう}{父}$さんからお$\\overset{かね}{金}$をもらって、$\\overset{か}{買}$い$\\overset{もの}{物}$をする。/从爸爸那里拿了钱去购物。"
},
{
  word: "おかげ",
  kana: "おかげ",
  type: "名词",
  meaning: "多亏，托福。",
  example: "おじいさんのおかげで、この$\\overset{しごと}{仕事}$が$\\overset{せいこう}{成功}$した。/多亏了爷爷，这项工作才成功。"
},
{
  word: "おじいさん",
  kana: "おじいさん",
  type: "名词",
  meaning: "爷爷，老大爷。",
  example: "おじいさんが$\\overset{みせ}{店}$でおつりを$\\overset{う}{受}$け$\\overset{と}{取}$る。/爷爷在店里接过找零。"
},
{
  word: "おつり",
  kana: "おつり",
  type: "名词",
  meaning: "找零。",
  example: "お$\\overset{かね}{金}$を$\\overset{はら}{払}$って、おつりを$\\overset{たし}{確}$かめる。/付了钱，确认找零。"
},
{
  word: "お父さん",
  kana: "おとうさん",
  type: "名词",
  meaning: "父亲，爸爸。",
  example: "お$\\overset{とう}{父}$さんがお$\\overset{みやげ}{土産}$を$\\overset{か}{買}$って$\\overset{かえ}{帰}$ってきた。/爸爸买了礼物回来。"
},
{
  word: "お腹",
  kana: "おなか",
  type: "名词",
  meaning: "肚子。",
  example: "$\\overset{おとな}{大人}$になっても、お$\\overset{なか}{腹}$が$\\overset{す}{空}$くと$\\overset{ふきげん}{不機嫌}$になる。/即使成了大人，肚子一饿也会心情不好。"
},
{
  word: "大人",
  kana: "おとな",
  type: "名词",
  meaning: "大人，成年人。",
  example: "お$\\overset{にい}{兄}$さんはもう$\\overset{りっぱ}{立派}$な$\\overset{おとな}{大人}$だ。/哥哥已经是一个出色的大人了。"
},
{
  word: "お兄さん",
  kana: "おにいさん",
  type: "名词",
  meaning: "哥哥。",
  example: "お$\\overset{にい}{兄}$さんとお$\\overset{ねえ}{姉}$さんが$\\overset{いっしょ}{一緒}$に$\\overset{で}{出}$かける。/哥哥和姐姐一起出门。"
},
{
  word: "お姉さん",
  kana: "おねえさん",
  type: "名词",
  meaning: "姐姐。",
  example: "お$\\overset{ねえ}{姉}$さんがおばあさんの$\\overset{せわ}{世話}$をする。/姐姐照顾奶奶。"
},
{
  word: "おばあさん",
  kana: "おばあさん",
  type: "名词",
  meaning: "奶奶，老奶奶。",
  example: "おばあさんに$\\overset{きいろ}{黄色}$いお$\\overset{みやげ}{土産}$を$\\overset{わた}{渡}$す。/把黄色的礼物交给奶奶。"
},
{
  word: "お土産",
  kana: "おみやげ",
  type: "名词",
  meaning: "特产，礼物。",
  example: "$\\overset{りょこう}{旅行}$のお$\\overset{みやげ}{土産}$を$\\overset{こども}{子供}$にあげる。/把旅行的特产送给孩子。"
},
{
  word: "黄色い",
  kana: "きいろい",
  type: "形容词",
  meaning: "黄色的。",
  example: "$\\overset{きいろ}{黄色}$い$\\overset{はな}{花}$がどこに$\\overset{さ}{�}$いているか$\\overset{さが}{探}$す。/寻找黄色的花开在哪里。"
},
{
  word: "子",
  kana: "こ",
  type: "名词",
  meaning: "孩子。",
  example: "この$\\overset{こ}{子}$は$\\overset{だれ}{誰}$の$\\overset{むすこ}{息子}$ですか。/这个孩子是谁的儿子？"
},
{
  word: "子供",
  kana: "こども",
  type: "名词",
  meaning: "小孩，儿童。",
  example: "$\\overset{こども}{子供}$の$\\overset{ころ}{頃}$の$\\overset{おも}{思}$い$\\overset{で}{出}$が$\\overset{よみがえ}{蘇}$る。/小时候的回忆复苏了。"
},
{
  word: "頃",
  kana: "ころ",
  type: "名词",
  meaning: "时候，时期。",
  example: "$\\overset{わたし}{私}$が$\\overset{わか}{若}$い$\\overset{ころ}{頃}$は、そこに$\\overset{なに}{何}$もなかった。/我年轻的时候，那里什么都没有。"
},
{
  word: "そこ",
  kana: "そこ",
  type: "代词",
  meaning: "那里。",
  example: "そこから$\\overset{ちか}{近}$い$\\overset{ばしょ}{場所}$で$\\overset{だれ}{誰}$かが$\\overset{ま}{待}$っている。/在离那里很近的地方有人在等候。"
},
{
  word: "誰",
  kana: "だれ",
  type: "代词",
  meaning: "谁。",
  example: "$\\overset{だれ}{誰}$がその$\\overset{もんだい}{問題}$に$\\overset{と}{取}$り$\\overset{く}{組}$むのか$\\overset{き}{決}$める。/决定谁来着手处理那个问题。"
},
{
  word: "近い",
  kana: "ちかい",
  type: "形容词",
  meaning: "近的。",
  example: "$\\overset{いえ}{家}$から$\\overset{ちか}{近}$い$\\overset{がっこう}{学校}$に$\\overset{にゅうがく}{入学}$する。/考入离家近的学校。"
},
{
  word: "近く",
  kana: "ちかく",
  type: "名・副词",
  meaning: "附近；将近。",
  example: "$\\overset{えき}{駅}$の$\\overset{ちか}{近}$くで$\\overset{ひとり}{一人}$の$\\overset{おとこ}{男}$を$\\overset{み}{見}$た。/在车站附近看到一个男人。 || $\\overset{かんせい}{完成}$まで$\\overset{いちねん}{一年}$$\\overset{ちか}{近}$くかかる。/到完成将近需要一年。"
},
{
  word: "どこ",
  kana: "どこ",
  type: "代词",
  meaning: "哪里。",
  example: "$\\overset{ばあい}{場合}$によっては、どこへでも$\\overset{い}{行}$く。/根据情况，去哪里都可以。"
},
{
  word: "取り組む",
  kana: "とりくむ",
  type: "五段自动词",
  meaning: "致力于，着手解决。",
  example: "$\\overset{ひとり}{一人}$で$\\overset{むずか}{難}$しい$\\overset{かだい}{課題}$に$\\overset{と}{取}$り$\\overset{く}{組}$む。/一个人致力于解决难题。"
},
{
  word: "取る",
  kana: "とる",
  type: "五段他动词",
  meaning: "拿，取；取得。",
  example: "$\\overset{ほん}{本}$を$\\overset{と}{取}$る$\\overset{ばあい}{場合}$は、$\\overset{こえ}{声}$をかけてください。/拿书的情况下，请说一声。"
},
{
  word: "場合",
  kana: "ばあい",
  type: "名词",
  meaning: "情况，场合。",
  example: "$\\overset{きんきゅう}{緊急}$の$\\overset{ばあい}{場合}$は、$\\overset{むこう}{向こう}$へ$\\overset{に}{逃}$げてください。/紧急情况下，请向那边逃。"
},
{
  word: "人",
  kana: "ひと",
  type: "名词",
  meaning: "人。",
  example: "あの$\\overset{ひと}{人}$は$\\overset{わたし}{私}$の$\\overset{むすこ}{息子}$です。/那个人是我儿子。"
},
{
  word: "一人",
  kana: "ひとり",
  type: "名词・副词",
  meaning: "一个人。",
  example: "$\\overset{ひとり}{一人}$で$\\overset{むこう}{向こう}$の$\\overset{せき}{席}$に$\\overset{すわ}{座}$る。/一个人坐在那边的座位上。"
},
{
  word: "二人",
  kana: "ふたり",
  type: "名词",
  meaning: "两个人。",
  example: "$\\overset{わたし}{私}$と$\\overset{むすこ}{息子}$の$\\overset{ふたり}{二人}$で$\\overset{しばい}{芝居}$を$\\overset{み}{見}$る。/我和儿子两个人去看戏。"
},
{
  word: "向こう",
  kana: "むこう",
  type: "名词",
  meaning: "对面，那边；对方。",
  example: "$\\overset{むこう}{向こう}$から$\\overset{あいず}{合図}$が$\\overset{おく}{送}$られてきた。/从对面发来了信号。"
},
{
  word: "息子",
  kana: "むすこ",
  type: "名词",
  meaning: "儿子。",
  example: "$\\overset{わたし}{私}$の$\\overset{むすこ}{息子}$は$\\overset{ことし}{今年}$$\\overset{だいがく}{大学}$を$\\overset{じゅけん}{受験}$する。/我儿子今年考大学。"
},
{
  word: "私",
  kana: "わたし",
  type: "代词",
  meaning: "我。",
  example: "$\\overset{わたし}{私}$は$\\overset{しろうと}{素人}$だが、この$\\overset{しごと}{仕事}$に$\\overset{と}{取}$り$\\overset{く}{組}$む。/我虽然是外行，但也要致力于这项工作。"
},
{
  word: "合図",
  kana: "あいず",
  type: "名・サ变动词する他",
  meaning: "信号，暗号。",
  example: "$\\overset{て}{手}$で$\\overset{あいず}{合図}$を$\\overset{おく}{送}$る。/用手发信号。 || $\\overset{め}{目}$で$\\overset{あいず}{合図}$して、$\\overset{じかん}{時間}$を$\\overset{あ}{合}$わせる。/用眼神示意，对准时间。"
},
{
  word: "合う",
  kana: "あう",
  type: "五段自动词",
  meaning: "合适，相合；一致。",
  example: "この$\\overset{ふく}{服}$は$\\overset{かれ}{彼}$の$\\overset{ふんいき}{雰囲気}$によく$\\overset{あ}{合}$う。/这件衣服很符合他的气质。"
},
{
  word: "合わせる",
  kana: "あわせる",
  type: "一段他动词",
  meaning: "对准，配合；合并。",
  example: "みんなの$\\overset{いけん}{意見}$を$\\overset{あ}{合}$わせて$\\overset{けつろん}{結論}$を$\\overset{だ}{出}$す。/综合大家的意见得出结论。"
},
{
  word: "いらっしゃる",
  kana: "いらっしゃる",
  type: "五段自动词",
  meaning: "来，去，在（「行く、来る、いる」的尊敬语）。",
  example: "$\\overset{せんせい}{先生}$がこちらへいらっしゃる。/老师朝这边来了。"
},
{
  word: "お年玉",
  kana: "おとしだま",
  type: "名词",
  meaning: "压岁钱。",
  example: "$\\overset{おとな}{大人}$しい$\\overset{こども}{子供}$にお$\\overset{としだま}{年玉}$をあげる。/给听话的孩子压岁钱。"
},
{
  word: "大人しい",
  kana: "おとなしい",
  type: "形容词",
  meaning: "老实，温顺。",
  example: "$\\overset{かれ}{彼}$は$\\overset{おとな}{大人}$しい$\\overset{ひとがら}{人柄}$で、$\\overset{だれ}{誰}$とも$\\overset{つ}{付}$き$\\overset{あ}{合}$う。/他为人温顺老实，和谁都合得来。"
},
{
  word: "子育て",
  kana: "こそだて",
  type: "名・サ变动词する自",
  meaning: "育儿，带孩子。",
  example: "$\\overset{こそだて}{子育て}$は$\\overset{たいへん}{大変}$だが、$\\overset{たの}{楽}$しい。/带孩子虽然辛苦，但是很快乐。 || $\\overset{このごろ}{この頃}$、$\\overset{ふうふ}{夫婦}$で$\\overset{きょうりょく}{協力}$して$\\overset{こそだて}{子育て}$する。/最近，夫妻俩合作带孩子。"
},
{
  word: "この頃",
  kana: "このごろ",
  type: "名・副词",
  meaning: "最近，近来。",
  example: "$\\overset{このごろ}{この頃}$、$\\overset{しばい}{芝居}$を$\\overset{み}{見}$に$\\overset{い}{行}$く$\\overset{きかい}{機会}$が$\\overset{ふ}{増}$えた。/最近，去看戏的机会增加了。"
},
{
  word: "芝居",
  kana: "しばい",
  type: "名词",
  meaning: "戏剧，话剧；演技。",
  example: "$\\overset{しろうと}{素人}$が$\\overset{あつ}{集}$まって$\\overset{しばい}{芝居}$を$\\overset{おこな}{行}$う。/外行们聚在一起演戏。"
},
{
  word: "素人",
  kana: "しろうと",
  type: "名词",
  meaning: "外行，业余爱好者。",
  example: "$\\overset{しろうと}{素人}$の$\\overset{いけん}{意見}$も$\\overset{せっきょくてき}{積極的}$に$\\overset{と}{取}$り$\\overset{い}{入}$れる。/也积极听取外行的意见。"
},
{
  word: "近づく",
  kana: "ちかづく",
  type: "五段自动词",
  meaning: "靠近，临近。",
  example: "$\\overset{しけん}{試験}$が$\\overset{ちか}{近}$づくにつれて、$\\overset{きんちょう}{緊張}$する。/随着考试临近，变得紧张起来。"
},
{
  word: "付き合う",
  kana: "つきあう",
  type: "五段自动词",
  meaning: "交往；陪伴。",
  example: "$\\overset{ひとがら}{人柄}$の$\\overset{よ}{良}$い$\\overset{ひと}{人}$と$\\overset{なが}{長}$く$\\overset{つ}{付}$き$\\overset{あ}{合}$う。/和人品好的人长久交往。"
},
{
  word: "取り入れる",
  kana: "とりいれる",
  type: "一段他动词",
  meaning: "采纳，引进；收获。",
  example: "$\\overset{ひとびと}{人々}$の$\\overset{いけん}{意見}$を$\\overset{と}{取}$り$\\overset{い}{入}$れて、$\\overset{けいかく}{計画}$を$\\overset{かいぜん}{改善}$する。/采纳人们的意见，改善计划。"
},
{
  word: "似合う",
  kana: "にあう",
  type: "五段自动词",
  meaning: "适合，相称。",
  example: "その$\\overset{きいろ}{黄色}$いドレスはお$\\overset{じょう}{嬢}$さんにとても$\\overset{にあ}{似合}$う。/那件黄色的连衣裙非常适合小姐。"
},
{
  word: "人柄",
  kana: "ひとがら",
  type: "名词",
  meaning: "人品，性格。",
  example: "$\\overset{かれ}{彼}$の$\\overset{ひとがら}{人柄}$に$\\overset{ひとびと}{人々}$が$\\overset{ひ}{惹}$きつけられる。/他的人品吸引了人们。"
},
{
  word: "人々",
  kana: "ひとびと",
  type: "名词",
  meaning: "人们。",
  example: "$\\overset{ひとびと}{人々}$との$\\overset{ふ}{触}$れ$\\overset{あ}{合}$いを$\\overset{たいせつ}{大切}$にする。/珍惜与人们的接触交流。"
},
{
  word: "触れ合い",
  kana: "ふれあい",
  type: "名词",
  meaning: "接触，交流。",
  example: "$\\overset{どうぶつ}{動物}$との$\\overset{ふ}{触}$れ$\\overset{あ}{合}$いを$\\overset{とお}{通}$じて$\\overset{こころ}{心}$が$\\overset{あたた}{温}$まる。/通过与动物的接触，心变得温暖。"
},
{
  word: "向かう",
  kana: "むかう",
  type: "五段自动词",
  meaning: "朝，向，前往。",
  example: "$\\overset{いまごろ}{今頃}$、$\\overset{かれ}{彼}$は$\\overset{もくてきち}{目的地}$へ$\\overset{むか}{向}$かっているだろう。/现在这个时候，他大概正前往目的地吧。"
},
{
  word: "向く",
  kana: "むく",
  type: "五段自动词",
  meaning: "朝向；适合。",
  example: "この$\\overset{しごと}{仕事}$は$\\overset{かれ}{彼}$の$\\overset{せいかく}{性格}$に$\\overset{む}{向}$いている。/这份工作适合他的性格。"
},
{
  word: "向ける",
  kana: "むける",
  type: "一段他动词",
  meaning: "使朝向，对准。",
  example: "$\\overset{いろ}{色}$んな$\\overset{ひと}{人}$に$\\overset{えがお}{笑顔}$を$\\overset{む}{向}$ける。/对各种各样的人露出笑容。"
},
{
  word: "今頃",
  kana: "いまごろ",
  type: "名・副词",
  meaning: "现在这个时候；事到如今。",
  example: "$\\overset{いまごろ}{今頃}$になって$\\overset{こうかい}{後悔}$しても$\\overset{おそ}{遅}$い。/事到如今再后悔也晚了。"
},
{
  word: "色んな",
  kana: "いろんな",
  type: "连体词",
  meaning: "各种各样的。",
  example: "$\\overset{いろ}{色}$んな$\\overset{いろ}{色}$を$\\overset{く}{組}$み$\\overset{あ}{合}$わせて$\\overset{え}{絵}$を$\\overset{か}{描}$く。/组合各种各样的颜色画画。"
},
{
  word: "お嬢さん",
  kana: "おじょうさん",
  type: "名词",
  meaning: "令爱，小姐。",
  example: "$\\overset{かれ}{彼}$のお$\\overset{じょう}{嬢}$さんは$\\overset{ことし}{今年}$$\\overset{だいがく}{大学}$を$\\overset{そつぎょう}{卒業}$する。/他的令爱今年大学毕业。"
},
{
  word: "黄色",
  kana: "きいろ",
  type: "名词",
  meaning: "黄色。",
  example: "$\\overset{きいろ}{黄色}$のペンを$\\overset{と}{取}$り$\\overset{だ}{出}$して$\\overset{せん}{線}$を$\\overset{ひ}{引}$く。/拿出黄色的笔画线。"
},
{
  word: "組み合わせる",
  kana: "くみあわせる",
  type: "一段他动词",
  meaning: "组合，搭配。",
  example: "$\\overset{さまざま}{様々}$な$\\overset{ぶひん}{部品}$を$\\overset{く}{組}$み$\\overset{あ}{合}$わせて$\\overset{きかい}{機械}$を$\\overset{つく}{作}$る。/将各种零件组合起来制造机器。"
},
{
  word: "達",
  kana: "たち",
  type: "接尾词",
  meaning: "们（表示复数）。",
  example: "$\\overset{ちかごろ}{近頃}$、$\\overset{こども}{子供}$$\\overset{たち}{達}$は$\\overset{そと}{外}$でよく$\\overset{あそ}{遊}$ぶ。/最近，孩子们经常在外面玩。"
},
{
  word: "近頃",
  kana: "ちかごろ",
  type: "名・副词",
  meaning: "最近，近来。",
  example: "$\\overset{ちかごろ}{近頃}$、$\\overset{かれ}{彼}$と$\\overset{ひさ}{久}$しぶりに$\\overset{はな}{話}$し$\\overset{あ}{合}$った。/最近，和他久违地交谈了。"
},
{
  word: "取り替える",
  kana: "とりかえる",
  type: "一段他动词",
  meaning: "更换，交换。",
  example: "$\\overset{ふる}{古}$い$\\overset{でんち}{電池}$を$\\overset{あたら}{新}$しいものと$\\overset{と}{取}$り$\\overset{か}{替}$える。/把旧电池换成新的。"
},
{
  word: "取り出す",
  kana: "とりだす",
  type: "五段他动词",
  meaning: "拿出，取出。",
  example: "$\\overset{ひ}{引}$き$\\overset{だ}{出}$しから$\\overset{ほん}{本}$を$\\overset{と}{取}$り$\\overset{だ}{出}$す。/从抽屉里拿出书。"
},
{
  word: "取れる",
  kana: "とれる",
  type: "一段自动词",
  meaning: "脱落；能取得，能理解。",
  example: "シャツのボタンが$\\overset{と}{取}$れてしまった。/衬衫的扣子掉了。"
},
{
  word: "話し合う",
  kana: "はなしあう",
  type: "五段自他动词",
  meaning: "交谈，商量。",
  example: "$\\overset{もんだい}{問題}$の$\\overset{かいけつ}{解決}$$\\overset{さく}{策}$についてみんなで$\\overset{はな}{話}$し$\\overset{あ}{合}$う。/大家一起商量问题的解决对策。"
},
{
  word: "久しぶり",
  kana: "ひさしぶり",
  type: "名・形动",
  meaning: "好久不见，隔了很久。",
  example: "$\\overset{ひさ}{久}$しぶりに$\\overset{ゆうじん}{友人}$と$\\overset{さいかい}{再会}$した。/久违地和朋友重逢了。 || $\\overset{ひさ}{久}$しぶりな$\\overset{やす}{休}$みをゆったり$\\overset{す}{過}$ごす。/悠闲地度过久违的假期。"
},
{
  word: "向き",
  kana: "むき",
  type: "名・接尾词",
  meaning: "方向；适合……的。",
  example: "この$\\overset{へや}{部屋}$は$\\overset{みなみ}{南}$$\\overset{む}{向}$きで$\\overset{ひあ}{日当}$たりが$\\overset{よ}{良}$い。/这个房间朝南，采光很好。"
},
{
  word: "欠伸",
  kana: "あくび",
  type: "名・サ变动词する自",
  meaning: "哈欠。",
  example: "$\\overset{あくび}{欠伸}$を$\\overset{か}{噛}$み$\\overset{ころ}{殺}$す。/强忍住哈欠。 || $\\overset{う}{打}$ち$\\overset{あ}{合}$わせの$\\overset{なか}{中}$でつい$\\overset{あくび}{欠伸}$してしまう。/在碰头会中不小心打了个哈欠。"
},
{
  word: "打ち合わせ",
  kana: "うちあわせ",
  type: "名词",
  meaning: "事先商量，碰头会。",
  example: "$\\overset{かいぎ}{会議}$の$\\overset{まえ}{前}$に$\\overset{う}{打}$ち$\\overset{あ}{合}$わせを$\\overset{おこな}{行}$う。/在会议之前进行碰头商议。"
},
{
  word: "お祝い",
  kana: "おいわい",
  type: "名・サ变动词する他",
  meaning: "祝贺，贺礼。",
  example: "$\\overset{ともだち}{友達}$の$\\overset{けっこん}{結婚}$のお$\\overset{いわ}{祝}$いを$\\overset{か}{買}$う。/买朋友结婚的贺礼。 || $\\overset{おとこ}{男}$の$\\overset{こ}{子}$の$\\overset{たんじょうび}{誕生日}$をお$\\overset{いわ}{祝}$いする。/庆祝男孩的生日。"
},
{
  word: "お粥",
  kana: "おかゆ",
  type: "名词",
  meaning: "粥。",
  example: "$\\overset{かおいろ}{顔色}$が$\\overset{わる}{悪}$いので、お$\\overset{かゆ}{粥}$を$\\overset{た}{食}$べる。/因为脸色不好，所以吃粥。"
},
{
  word: "お節",
  kana: "おせち",
  type: "名词",
  meaning: "御节料理（日本新年吃的饭菜）。",
  example: "お$\\overset{しょうがつ}{正月}$に$\\overset{かぞく}{家族}$でお$\\overset{せち}{節}$料理を$\\overset{かこ}{囲}$む。/过年一家人围着吃御节料理。"
},
{
  word: "男の子",
  kana: "おとこのこ",
  type: "名词",
  meaning: "男孩。",
  example: "$\\overset{おとこ}{男}$の$\\overset{こ}{子}$と$\\overset{おんな}{女}$の$\\overset{こ}{子}$が$\\overset{いっしょ}{一緒}$に$\\overset{こいぬ}{子犬}$と$\\overset{あそ}{遊}$ぶ。/男孩和女孩一起和小狗玩耍。"
},
{
  word: "女の子",
  kana: "おんなのこ",
  type: "名词",
  meaning: "女孩。",
  example: "$\\overset{おんな}{女}$の$\\overset{こ}{子}$が$\\overset{き}{木}$の$\\overset{は}{葉}$を$\\overset{ひろ}{拾}$って$\\overset{あつ}{集}$める。/女孩捡落叶收集起来。"
},
{
  word: "回収",
  kana: "かいしゅう",
  type: "名・サ变动词する他",
  meaning: "回收。",
  example: "ゴミの$\\overset{かいしゅう}{回収}$$\\overset{び}{日}$を$\\overset{まも}{守}$る。/遵守垃圾回收日。 || アンケートの$\\overset{ようし}{用紙}$を$\\overset{かんぺき}{完璧}$に$\\overset{かいしゅう}{回収}$する。/完美地回收问卷调查表。"
},
{
  word: "顔色",
  kana: "かおいろ",
  type: "名词",
  meaning: "脸色，神色。",
  example: "$\\overset{かのじょ}{彼女}$の$\\overset{かおいろ}{顔色}$を$\\overset{み}{見}$て、$\\overset{たいちょう}{体調}$を$\\overset{しんぱい}{心配}$する。/看着她的脸色，担心她的身体状况。"
},
{
  word: "完璧",
  kana: "かんぺき",
  type: "名・形动",
  meaning: "完美，十全十美。",
  example: "$\\overset{かんぺき}{完璧}$を$\\overset{もと}{求}$めて$\\overset{ぜんりょく}{全力}$を$\\overset{つ}{尽}$くす。/追求完美而竭尽全力。 || $\\overset{かれ}{彼}$の$\\overset{しごと}{仕事}$はいつも$\\overset{かんぺき}{完璧}$だ。/他的工作总是很完美。"
},
{
  word: "子犬",
  kana: "こいぬ",
  type: "名词",
  meaning: "小狗。",
  example: "$\\overset{しゅうい}{周囲}$の$\\overset{め}{目}$を$\\overset{き}{気}$にせず、$\\overset{こいぬ}{子犬}$と$\\overset{あそ}{遊}$ぶ。/不在意周围的目光，和小狗玩耍。"
},
{
  word: "木の葉",
  kana: "このは",
  type: "名词",
  meaning: "树叶。",
  example: "$\\overset{かぜ}{風}$で$\\overset{き}{木}$の$\\overset{は}{葉}$が$\\overset{ち}{散}$っていく。/树叶被风吹落。"
},
{
  word: "周囲",
  kana: "しゅうい",
  type: "名词",
  meaning: "周围。",
  example: "$\\overset{しょしんしゃ}{初心者}$は$\\overset{しゅうい}{周囲}$の$\\overset{ひと}{人}$と$\\overset{たす}{助}$け$\\overset{あ}{合}$うべきだ。/初学者应该和周围的人互相帮助。"
},
{
  word: "初心者",
  kana: "しょしんしゃ",
  type: "名词",
  meaning: "初学者。",
  example: "このコースは$\\overset{しょしんしゃ}{初心者}$にも$\\overset{てごろ}{手頃}$でわかりやすい。/这门课程对初学者也很适中（合适）易懂。"
},
{
  word: "洗濯物",
  kana: "せんたくもの",
  type: "名词",
  meaning: "洗换的衣物。",
  example: "$\\overset{は}{晴}$れた$\\overset{ひ}{日}$に$\\overset{せんたくもの}{洗濯物}$を$\\overset{そと}{外}$に$\\overset{ほ}{干}$す。/在晴天把洗好的衣服晾在外面。"
},
{
  word: "全力",
  kana: "ぜんりょく",
  type: "名词",
  meaning: "全力。",
  example: "$\\overset{もくひょう}{目標}$に$\\overset{むか}{向}$かって$\\overset{ぜんりょく}{全力}$で$\\overset{はし}{走}$る。/朝着目标全力奔跑。"
},
{
  word: "助け合う",
  kana: "たすけあう",
  type: "五段他动词",
  meaning: "互相帮助。",
  example: "$\\overset{どうりょう}{同僚}$と$\\overset{たす}{助}$け$\\overset{あ}{合}$って$\\overset{しごと}{仕事}$を$\\overset{かんせい}{完成}$させる。/和同事互相帮助完成工作。"
},
{
  word: "立て替える",
  kana: "たてかえる",
  type: "一段他动词",
  meaning: "垫付。",
  example: "$\\overset{か}{買}$い$\\overset{もの}{物}$のお$\\overset{かね}{金}$を$\\overset{いったん}{一旦}$$\\overset{た}{立}$て$\\overset{か}{替}$える。/买东西的钱暂时先垫付。"
},
{
  word: "近づける",
  kana: "ちかづける",
  type: "一段他动词",
  meaning: "使靠近，接近。",
  example: "$\\overset{かお}{顔}$を$\\overset{がめん}{画面}$に$\\overset{ちか}{近}$づけてよく$\\overset{み}{見}$る。/把脸凑近屏幕仔细看。"
},
{
  word: "近道",
  kana: "ちかみち",
  type: "名・サ变动词する自",
  meaning: "近路，抄近道。",
  example: "$\\overset{えき}{駅}$までの$\\overset{ちかみち}{近道}$を$\\overset{とお}{通}$る。/走去车站的近路。 || $\\overset{とほ}{徒歩}$で$\\overset{ちかみち}{近道}$して$\\overset{かいしゃ}{会社}$に$\\overset{い}{行}$く。/徒步抄近路去公司。"
},
{
  word: "近寄る",
  kana: "ちかよる",
  type: "五段自动词",
  meaning: "靠近，挨近。",
  example: "$\\overset{きけん}{危険}$な$\\overset{ばしょ}{場所}$には$\\overset{ちかよ}{近寄}$らないでください。/请不要靠近危险的地方。"
},
{
  word: "手頃",
  kana: "てごろ",
  type: "形动",
  meaning: "合适，适中（常指价格或大小）。",
  example: "このレストランは$\\overset{ねだん}{値段}$が$\\overset{てごろ}{手頃}$だ。/这家餐厅价格适中。"
},
{
  word: "同僚",
  kana: "どうりょう",
  type: "名词",
  meaning: "同事。",
  example: "$\\overset{どうりょう}{同僚}$と$\\overset{う}{打}$ち$\\overset{あ}{合}$わせをしてから$\\overset{かえ}{帰}$る。/和同事碰头商议后再回去。"
},
{
  word: "独身者",
  kana: "どくしんしゃ",
  type: "名词",
  meaning: "单身者。",
  example: "$\\overset{どくしんしゃ}{独身者}$$\\overset{む}{向}$けの$\\overset{てごろ}{手頃}$なマンションを$\\overset{さが}{探}$す。/寻找适合单身者的价格适中的公寓。"
},
{
  word: "年頃",
  kana: "としごろ",
  type: "名词",
  meaning: "年岁；适婚年龄。",
  example: "$\\overset{かのじょ}{彼女}$はもう$\\overset{けっこん}{結婚}$する$\\overset{としごろ}{年頃}$だ。/她已经是到了结婚的年纪了。"
},
{
  word: "徒歩",
  kana: "とほ",
  type: "名词",
  meaning: "徒步，步行。",
  example: "$\\overset{えき}{駅}$から$\\overset{いえ}{家}$まで$\\overset{とほ}{徒歩}$で$\\overset{じゅっぷん}{十分}$かかる。/从车站到家徒步需要十分钟。"
},
{
  word: "取り敢えず",
  kana: "とりあえず",
  type: "副词",
  meaning: "首先，暂且。",
  example: "$\\overset{と}{取}$り$\\overset{あ}{敢}$えず、$\\overset{かれ}{彼}$に$\\overset{れんらく}{連絡}$してみよう。/总之，先联系他试试吧。"
},
{
  word: "取り扱う",
  kana: "とりあつかう",
  type: "五段他动词",
  meaning: "对待，处理；经营。",
  example: "この$\\overset{みせ}{店}$では$\\overset{さまざま}{様々}$な$\\overset{しょうひん}{商品}$を$\\overset{と}{取}$り$\\overset{あつか}{扱}$っている。/这家店经营各种商品。"
},
{
  word: "取り返す",
  kana: "とりかえす",
  type: "五段他动词",
  meaning: "夺回，挽回。",
  example: "$\\overset{おく}{遅}$れた$\\overset{じかん}{時間}$を$\\overset{ぜんりょく}{全力}$で$\\overset{と}{取}$り$\\overset{かえ}{返}$す。/用全力挽回耽误的时间。"
},
{
  word: "取り残す",
  kana: "とりのこす",
  type: "五段他动词",
  meaning: "留下，剩下。",
  example: "$\\overset{ひとり}{一人}$だけ$\\overset{へや}{部屋}$に$\\overset{と}{取}$り$\\overset{のこ}{残}$される。/只有一个人被留在了房间里。"
},
{
  word: "取り除く",
  kana: "とりのぞく",
  type: "五段他动词",
  meaning: "拆除，排除，去掉。",
  example: "$\\overset{ふく}{服}$の$\\overset{よご}{汚}$れを$\\overset{きれい}{綺麗}$に$\\overset{と}{取}$り$\\overset{のぞ}{除}$く。/把衣服上的污渍去干净。"
},
{
  word: "取引",
  kana: "とりひき",
  type: "名・サ变动词する自他",
  meaning: "交易，买卖。",
  example: "$\\overset{おお}{大}$きな$\\overset{かいしゃ}{会社}$と$\\overset{とりひき}{取引}$がある。/和一家大公司有交易。 || $\\overset{こきゃく}{顧客}$と$\\overset{しょうひん}{商品}$を$\\overset{とりひき}{取引}$する。/和顾客交易商品。"
},
{
  word: "取り巻く",
  kana: "とりまく",
  type: "五段他动词",
  meaning: "包围，围绕。",
  example: "$\\overset{かれ}{彼}$を$\\overset{と}{取}$り$\\overset{ま}{巻}$く$\\overset{しゅうい}{周囲}$の$\\overset{かんきょう}{環境}$が$\\overset{か}{変}$わった。/围绕着他的周围环境发生了改变。"
},
{
  word: "取り戻す",
  kana: "とりもどす",
  type: "五段他动词",
  meaning: "收回，恢复。",
  example: "$\\overset{うしな}{失}$った$\\overset{しんよう}{信頼}$を$\\overset{と}{取}$り$\\overset{もど}{戻}$すために$\\overset{どりょく}{努力}$する。/为了恢复失去的信任而努力。"
},
{
  word: "なさる",
  kana: "なさる",
  type: "五段他动词",
  meaning: "做，干（「する」的尊敬语）。",
  example: "$\\overset{せんせい}{先生}$は$\\overset{なに}{何}$を$\\overset{けんきゅう}{研究}$なさっていますか。/老师在研究什么呢？"
},
{
  word: "抜き",
  kana: "ぬき",
  type: "名・接尾词",
  meaning: "去掉，省去。",
  example: "$\\overset{じょうだん}{冗談}$$\\overset{ぬ}{抜}$きで、$\\overset{しんけん}{真剣}$に$\\overset{はな}{話}$し$\\overset{あ}{合}$う。/不开玩笑，认真地商量。"
},
{
  word: "人込み",
  kana: "ひとごみ",
  type: "名词",
  meaning: "人群，拥挤的地方。",
  example: "$\\overset{ひとごみ}{人込み}$の$\\overset{なか}{中}$で$\\overset{まいご}{迷子}$にならないように$\\overset{き}{気}$をつける。/注意不要在人群中迷路。"
},
{
  word: "人手",
  kana: "ひとで",
  type: "名词",
  meaning: "人手，劳动力；别人的手。",
  example: "$\\overset{しごと}{仕事}$が$\\overset{いそが}{忙}$しくて$\\overset{ひとで}{人手}$が$\\overset{ふそく}{不足}$している。/工作很忙，人手不足。"
},
{
  word: "人出",
  kana: "ひとで",
  type: "名词",
  meaning: "外出的人群。",
  example: "$\\overset{きゅうじつ}{休日}$の$\\overset{こうえん}{公園}$は$\\overset{おお}{多}$くの$\\overset{ひとで}{人出}$で$\\overset{にぎ}{賑}$わっている。/休息日的公园因为外出的人多而十分热闹。"
},
{
  word: "人前",
  kana: "ひとまえ",
  type: "名词",
  meaning: "人前，众人面前。",
  example: "$\\overset{ひとまえ}{人前}$で$\\overset{はな}{話}$すのは$\\overset{きんちょう}{緊張}$する。/在众人面前说话会紧张。"
},
{
  word: "人目",
  kana: "ひとめ",
  type: "名词",
  meaning: "别人的视线，众目。",
  example: "$\\overset{ひとめ}{人目}$を$\\overset{き}{気}$にせず、$\\overset{おおごえ}{大声}$で$\\overset{わら}{笑}$う。/不在意别人的目光，大声地笑。"
},
{
  word: "一人っ子",
  kana: "ひとりっこ",
  type: "名词",
  meaning: "独生子。",
  example: "$\\overset{かれ}{彼}$は$\\overset{ひとり}{一人}$っ$\\overset{こ}{子}$で、$\\overset{おや}{親}$に$\\overset{だいじ}{大事}$に$\\overset{そだ}{育}$てられた。/他是独生子，被父母娇生惯养。"
},
{
  word: "相応しい",
  kana: "ふさわしい",
  type: "形容词",
  meaning: "适合，相称。",
  example: "この$\\overset{ふく}{服}$はパーティーに$\\overset{ふさわ}{相応}$しい。/这件衣服很适合参加聚会。"
},
{
  word: "双子",
  kana: "ふたご",
  type: "名词",
  meaning: "双胞胎。",
  example: "あの$\\overset{ふたご}{双子}$の$\\overset{おとこ}{男}$の$\\overset{こ}{子}$は$\\overset{みわ}{見分}$けるのが$\\overset{むずか}{難}$しい。/那对双胞胎男孩很难分辨。"
},
{
  word: "迷子",
  kana: "まいご",
  type: "名词",
  meaning: "迷路的孩子。",
  example: "$\\overset{ひとごみ}{人込み}$で$\\overset{まいご}{迷子}$になった$\\overset{こども}{子供}$を$\\overset{ほご}{保護}$する。/保护在人群中迷路的孩子。"
},
{
  word: "待ち合わせ",
  kana: "まちあわせ",
  type: "名・サ变动词する自",
  meaning: "碰头，约会碰面。",
  example: "$\\overset{えきまえ}{駅前}$で$\\overset{ともだち}{友達}$と$\\overset{ま}{待}$ち$\\overset{あ}{合}$わせをする。/在站前和朋友碰面。 || $\\overset{いちじ}{一時}$に$\\overset{こうえん}{公園}$で$\\overset{ま}{待}$ち$\\overset{あ}{合}$わせする。/一点钟在公园碰面。"
},
{
  word: "身近",
  kana: "みぢか",
  type: "名・形动",
  meaning: "切身，身边。",
  example: "$\\overset{みぢか}{身近}$な$\\overset{ひと}{人}$の$\\overset{いけん}{意見}$を$\\overset{さんこう}{参考}$にする。/参考身边人的意见。 || $\\overset{かんきょう}{環境}$$\\overset{もんだい}{問題}$を$\\overset{みぢか}{身近}$な$\\overset{もんだい}{問題}$として$\\overset{とら}{捉}$える。/把环境问题当作切身的问题来对待。"
},
{
  word: "見分ける",
  kana: "みわける",
  type: "一段他动词",
  meaning: "分辨，辨别。",
  example: "$\\overset{ほんもの}{本物}$と$\\overset{にせもの}{偽物}$を$\\overset{みわ}{見分}$けるのは$\\overset{むずか}{難}$しい。/分辨真假很难。"
},
{
  word: "向かい",
  kana: "むかい",
  type: "名词",
  meaning: "对面。",
  example: "$\\overset{いえ}{家}$の$\\overset{むかい}{向かい}$に$\\overset{あたら}{新}$しい$\\overset{みせ}{店}$ができた。/家的对面开了一家新店。"
},
{
  word: "向かい合う",
  kana: "むかいあう",
  type: "五段自动词",
  meaning: "面对面，相对。",
  example: "$\\overset{ふたり}{二人}$は$\\overset{つくえ}{机}$を$\\overset{はさ}{挟}$んで$\\overset{むか}{向}$かい$\\overset{あ}{合}$って$\\overset{すわ}{座}$った。/两人隔着桌子面对面坐下。"
},
{
  word: "向き合う",
  kana: "むきあう",
  type: "五段自动词",
  meaning: "相对，面对。",
  example: "$\\overset{じぶん}{自分}$の$\\overset{もんだい}{問題}$と$\\overset{しんけん}{真剣}$に$\\overset{む}{向}$き$\\overset{あ}{合}$う。/认真面对自己的问题。"
},
{
  word: "向け",
  kana: "むけ",
  type: "接尾词",
  meaning: "面向……，以……为对象。",
  example: "これは$\\overset{しょしんしゃ}{初心者}$$\\overset{む}{向}$けのテキストです。/这是面向初学者的教材。"
},
{
  word: "汚れ",
  kana: "よごれ",
  type: "名词",
  meaning: "污垢，脏污。",
  example: "$\\overset{ふく}{服}$の$\\overset{よご}{汚}$れを$\\overset{せんたく}{洗濯}$して$\\overset{お}{落}$とす。/洗掉衣服上的污渍。"
},
{
  word: "良好",
  kana: "りょうこう",
  type: "名・形动",
  meaning: "良好。",
  example: "$\\overset{けんこう}{健康}$$\\overset{じょうたい}{状態}$の$\\overset{りょうこう}{良好}$を$\\overset{たも}{保}$つ。/保持健康状态的良好。 || $\\overset{かれ}{彼}$との$\\overset{かんけい}{関係}$は$\\overset{ひじょう}{非常}$に$\\overset{りょうこう}{良好}$だ。/和他关系非常良好。"
},
{
  word: "冷静",
  kana: "れいせい",
  type: "名・形动",
  meaning: "冷静。",
  example: "$\\overset{どんな}{どんな}$ときも$\\overset{れいせい}{冷静}$を$\\overset{うしな}{失}$わない。/无论何时都不失去冷静。 || トラブルが$\\overset{お}{起}$きても$\\overset{れいせい}{冷静}$に$\\overset{たいおう}{対応}$する。/即使发生麻烦也要冷静应对。"
},
{
  word: "開く",
  kana: "ひらく",
  type: "五段自他动词",
  meaning: "打开，张开；举办。",
  example: "$\\overset{はる}{春}$になって、$\\overset{きれい}{綺麗}$な$\\overset{はな}{花}$が$\\overset{ひら}{開}$く。/到了春天，美丽的花朵绽放了。 || $\\overset{ほん}{本}$を$\\overset{ひら}{開}$いて、$\\overset{あたら}{新}$しいページを$\\overset{よ}{読}$む。/打开书，阅读新的一页。"
},
{
  word: "空く",
  kana: "あく",
  type: "五段自动词",
  meaning: "空出，腾出；有空。",
  example: "$\\overset{でんしゃ}{電車}$の$\\overset{せき}{席}$が$\\overset{あ}{空}$いたので、$\\overset{すわ}{座}$る。/电车的座位空出来了，所以坐下。"
},
{
  word: "開ける",
  kana: "あける",
  type: "一段他动词",
  meaning: "打开。",
  example: "$\\overset{へや}{部屋}$の$\\overset{まど}{窓}$を$\\overset{あ}{開}$けて、$\\overset{くうき}{空気}$を$\\overset{い}{入}$れ$\\overset{か}{替}$える。/打开房间的窗户，让空气流通。"
},
{
  word: "上げる",
  kana: "あげる",
  type: "一段他动词",
  meaning: "提高，举起。",
  example: "$\\overset{て}{手}$を$\\overset{あ}{上}$げて、$\\overset{せんせい}{先生}$の$\\overset{しつもん}{質問}$に$\\overset{こた}{答}$える。/举手回答老师的问题。"
},
{
  word: "当たる",
  kana: "あたる",
  type: "五段自动词",
  meaning: "碰上，撞上；中奖。",
  example: "$\\overset{と}{飛}$んできたボールが$\\overset{あたま}{頭}$に$\\overset{あ}{当}$たる。/飞过来的球砸中了头。"
},
{
  word: "集まる",
  kana: "あつまる",
  type: "五段自动词",
  meaning: "集合，聚集。",
  example: "$\\overset{ひろば}{広場}$に$\\overset{おおぜい}{大勢}$の$\\overset{ひと}{人}$が$\\overset{あつ}{集}$まる。/广场上聚集了很多人。"
},
{
  word: "集める",
  kana: "あつめる",
  type: "一段他动词",
  meaning: "收集，集中。",
  example: "$\\overset{せんせい}{先生}$がクラスの$\\overset{せいと}{生徒}$を$\\overset{あつ}{集}$める。/老师把班里的学生集中起来。"
},
{
  word: "入れる",
  kana: "いれる",
  type: "一段他动词",
  meaning: "放入，放进。",
  example: "$\\overset{あつ}{集}$めた$\\overset{ほん}{本}$をカバンに$\\overset{い}{入}$れる。/把收集起来的书放进书包里。"
},
{
  word: "植える",
  kana: "うえる",
  type: "一段他动词",
  meaning: "种植。",
  example: "$\\overset{にわ}{庭}$に$\\overset{きれい}{綺麗}$な$\\overset{はな}{花}$を$\\overset{う}{植}$える。/在院子里种上漂亮的花。"
},
{
  word: "受ける",
  kana: "うける",
  type: "一段他动词",
  meaning: "接受，遭受；参加（考试）。",
  example: "$\\overset{あした}{明日}$、$\\overset{だいがく}{大学}$の$\\overset{しけん}{試験}$を$\\overset{う}{受}$ける。/明天参加大学的考试。"
},
{
  word: "生まれる",
  kana: "うまれる",
  type: "一段自动词",
  meaning: "出生，产生。",
  example: "$\\overset{あたら}{新}$しい$\\overset{いのち}{命}$がここで$\\overset{う}{生}$まれる。/新的生命在这里诞生。"
},
{
  word: "埋める",
  kana: "うめる",
  type: "一段他动词",
  meaning: "埋，填埋。",
  example: "$\\overset{あな}{穴}$を$\\overset{ほ}{掘}$って、ゴミを$\\overset{つち}{土}$に$\\overset{う}{埋}$める。/挖个坑，把垃圾埋在土里。"
},
{
  word: "終わる",
  kana: "おわる",
  type: "五段自他动词",
  meaning: "结束，完结。",
  example: "$\\overset{なが}{長}$い$\\overset{じゅぎょう}{授業}$がやっと$\\overset{お}{終}$わった。/漫长的课终于结束了。 || $\\overset{きょう}{今日}$の$\\overset{しごと}{仕事}$を$\\overset{すべ}{全}$て$\\overset{お}{終}$わる。/把今天的工作全部结束掉。"
},
{
  word: "変える",
  kana: "かえる",
  type: "一段他动词",
  meaning: "改变，更改。",
  example: "$\\overset{よてい}{予定}$を$\\overset{か}{変}$えて、$\\overset{さき}{先}$に$\\overset{しゅっぱつ}{出発}$する。/改变计划，先出发。"
},
{
  word: "掛かる",
  kana: "かかる",
  type: "五段自动词",
  meaning: "花费（时间、金钱）；悬挂；患（病）。",
  example: "$\\overset{かべ}{壁}$に$\\overset{うつく}{美}$しい$\\overset{え}{絵}$が$\\overset{か}{掛}$かっている。/墙上挂着美丽的画。"
},
{
  word: "掛ける",
  kana: "かける",
  type: "一段他动词",
  meaning: "挂上；花费；打电话；盖上。",
  example: "$\\overset{かべ}{壁}$に$\\overset{あたら}{新}$しいカレンダーを$\\overset{か}{掛}$ける。/在墙上挂上新日历。"
},
{
  word: "替わる",
  kana: "かわる",
  type: "五段自动词",
  meaning: "替换，交替。",
  example: "$\\overset{とうばん}{当番}$が$\\overset{べつ}{別}$の$\\overset{ひと}{人}$に$\\overset{か}{替}$わる。/值日生换成了别人。"
},
{
  word: "変わる",
  kana: "かわる",
  type: "五段自动词",
  meaning: "变化，改变。",
  example: "$\\overset{きせつ}{季節}$が$\\overset{か}{変}$わって、$\\overset{さむ}{寒}$くなった。/季节变了，变冷了。"
},
{
  word: "決まる",
  kana: "きまる",
  type: "五段自动词",
  meaning: "决定，定下来。",
  example: "$\\overset{つぎ}{次}$の$\\overset{りょこう}{旅行}$の$\\overset{もくてきち}{目的地}$が$\\overset{き}{決}$まった。/下次旅行的目的地定下来了。"
},
{
  word: "決める",
  kana: "きめる",
  type: "一段他动词",
  meaning: "决定。",
  example: "$\\overset{じぶん}{自分}$で$\\overset{しょうらい}{将来}$の$\\overset{みち}{道}$を$\\overset{き}{決}$める。/自己决定将来的道路。"
},
{
  word: "込む",
  kana: "こむ",
  type: "五段自动词",
  meaning: "拥挤。",
  example: "$\\overset{あさ}{朝}$の$\\overset{でんしゃ}{電車}$はいつも$\\overset{こ}{込}$んでいる。/早上的电车总是很拥挤。"
},
{
  word: "閉める",
  kana: "しめる",
  type: "一段他动词",
  meaning: "关，关闭。",
  example: "$\\overset{かぜ}{風}$が$\\overset{つめ}{冷}$たいので、$\\overset{まど}{窓}$を$\\overset{し}{閉}$める。/因为风很冷，所以把窗户关上。"
},
{
  word: "高める",
  kana: "たかめる",
  type: "一段他动词",
  meaning: "提高。",
  example: "$\\overset{じぶん}{自分}$の$\\overset{のうりょく}{能力}$を$\\overset{たか}{高}$めるために$\\overset{べんきょう}{勉強}$する。/为了提高自己的能力而学习。"
},
{
  word: "助かる",
  kana: "たすかる",
  type: "五段自动词",
  meaning: "得救；省事，有帮助。",
  example: "$\\overset{かれ}{彼}$が$\\overset{てつだ}{手伝}$ってくれて、$\\overset{ほんとう}{本当}$に$\\overset{たす}{助}$かった。/他帮了我的忙，真是帮了大忙了。"
},
{
  word: "助ける",
  kana: "たすける",
  type: "一段他动词",
  meaning: "帮助，救助。",
  example: "$\\overset{こま}{困}$っている$\\overset{ゆうじん}{友人}$を$\\overset{たす}{助}$ける。/帮助有困难的友人。"
},
{
  word: "立つ",
  kana: "たつ",
  type: "五段自动词",
  meaning: "站立。",
  example: "$\\overset{せき}{席}$から$\\overset{た}{立}$って$\\overset{あいさつ}{挨拶}$をする。/从座位上站起来打招呼。"
},
{
  word: "建つ",
  kana: "たつ",
  type: "五段自动词",
  meaning: "建起，盖起。",
  example: "$\\overset{えきまえ}{駅前}$に$\\overset{たか}{高}$いビルが$\\overset{た}{建}$つ。/站前建起了高楼。"
},
{
  word: "建てる",
  kana: "たてる",
  type: "一段他动词",
  meaning: "建造，盖。",
  example: "$\\overset{こうがい}{郊外}$に$\\overset{あたら}{新}$しい$\\overset{いえ}{家}$を$\\overset{た}{建}$てる。/在郊外建新房子。"
},
{
  word: "付く",
  kana: "つく",
  type: "五段自动词",
  meaning: "附上，沾上；跟着。",
  example: "$\\overset{ふく}{服}$に$\\overset{よご}{汚}$れが$\\overset{つ}{付}$いてしまった。/衣服上沾上了污渍。"
},
{
  word: "付ける",
  kana: "つける",
  type: "一段他动词",
  meaning: "附上，涂抹；加上。",
  example: "パンにジャムを$\\overset{つ}{付}$けて$\\overset{た}{食}$べる。/在面包上涂上果酱吃。"
},
{
  word: "伝える",
  kana: "つたえる",
  type: "一段他动词",
  meaning: "传达，转告。",
  example: "$\\overset{せんせい}{先生}$の$\\overset{ことば}{言葉}$をみんなに$\\overset{つた}{伝}$える。/把老师的话传达给大家。"
},
{
  word: "続く",
  kana: "つづく",
  type: "五段自动词",
  meaning: "继续，持续。",
  example: "$\\overset{あめ}{雨}$の$\\overset{ひ}{日}$が$\\overset{みっか}{三日}$も$\\overset{つづ}{続}$いている。/雨天已经持续了三天。"
},
{
  word: "続ける",
  kana: "つづける",
  type: "一段他动词",
  meaning: "继续，连续。",
  example: "$\\overset{あきら}{諦}$めずに$\\overset{べんきょう}{勉強}$を$\\overset{つづ}{続}$ける。/不放弃，继续学习。"
},
{
  word: "止まる",
  kana: "とまる",
  type: "五段自动词",
  meaning: "停，停止。",
  example: "$\\overset{あかしんごう}{赤信号}$で$\\overset{くるま}{車}$が$\\overset{とま}{止}$まる。/车在红灯处停下。"
},
{
  word: "繋がる",
  kana: "つながる",
  type: "五段自动词",
  meaning: "连接，牵涉。",
  example: "この$\\overset{みち}{道}$は$\\overset{となり}{隣}$の$\\overset{まち}{町}$へ$\\overset{つな}{繋}$がっている。/这条路连接着隔壁的城镇。"
},
{
  word: "積もる",
  kana: "つもる",
  type: "五段自动词",
  meaning: "堆积，积攒。",
  example: "$\\overset{やね}{屋根}$に$\\overset{しろ}{白}$い$\\overset{ゆき}{雪}$が$\\overset{つも}{積}$る。/屋顶上积了白雪。"
},
{
  word: "泊まる",
  kana: "とまる",
  type: "五段自动词",
  meaning: "住宿，投宿。",
  example: "$\\overset{りょこう}{旅行}$$\\overset{さき}{先}$のホテルに$\\overset{ひとばん}{一晩}$$\\overset{とま}{泊}$る。/在旅行地的酒店住一晚。"
},
{
  word: "並ぶ",
  kana: "ならぶ",
  type: "五段自动词",
  meaning: "排队，并排。",
  example: "$\\overset{みせ}{店}$の$\\overset{まえ}{前}$に$\\overset{なが}{長}$い$\\overset{れつ}{列}$が$\\overset{なら}{並}$ぶ。/店门前排起了长队。"
},
{
  word: "並べる",
  kana: "ならべる",
  type: "一段他动词",
  meaning: "摆列，排列。",
  example: "$\\overset{つくえ}{机}$の$\\overset{うえ}{上}$に$\\overset{ほん}{本}$を$\\overset{きれい}{綺麗}$に$\\overset{なら}{並}$べる。/把书整齐地排列在桌子上。"
},
{
  word: "乗る",
  kana: "のる",
  type: "五段自动词",
  meaning: "乘坐，搭乘。",
  example: "$\\overset{まいあさ}{毎朝}$、$\\overset{でんしゃ}{電車}$に$\\overset{の}{乗}$って$\\overset{つうがく}{通学}$する。/每天早晨乘坐电车上学。"
},
{
  word: "入る",
  kana: "はいる",
  type: "五段自动词",
  meaning: "进入，装入。",
  example: "$\\overset{きょうしつ}{教室}$に$\\overset{せんせい}{先生}$が$\\overset{はい}{入}$ってきた。/老师走进了教室。"
},
{
  word: "始まる",
  kana: "はじまる",
  type: "五段自动词",
  meaning: "开始。",
  example: "いよいよ$\\overset{えいが}{映画}$が$\\overset{はじ}{始}$まる。/电影终于要开始了。"
},
{
  word: "始める",
  kana: "はじめる",
  type: "一段他动词",
  meaning: "开始（做）。",
  example: "$\\overset{いま}{今}$から$\\overset{かいぎ}{会議}$を$\\overset{はじ}{始}$める。/现在开始开会。"
},
{
  word: "深める",
  kana: "ふかめる",
  type: "一段他动词",
  meaning: "加深。",
  example: "$\\overset{こうりゅう}{交流}$を$\\overset{とお}{通}$じて$\\overset{りかい}{理解}$を$\\overset{ふか}{深}$める。/通过交流加深理解。"
},
{
  word: "見える",
  kana: "みえる",
  type: "一段自动词",
  meaning: "看得见；看来。",
  example: "$\\overset{とお}{遠}$くに$\\overset{たか}{高}$い$\\overset{やま}{山}$が$\\overset{み}{見}$える。/远处能看见高山。"
},
{
  word: "見る",
  kana: "みる",
  type: "一段他动词",
  meaning: "看。",
  example: "$\\overset{ぼうえんきょう}{望遠鏡}$で$\\overset{とお}{遠}$くの$\\overset{ほし}{星}$を$\\overset{み}{見}$る。/用望远镜看远处的星星。"
},
{
  word: "止める（其一）",
  kana: "とめる",
  type: "一段他动词",
  meaning: "使停止，停下。",
  example: "$\\overset{ちゅうしゃじょう}{駐車場}$に$\\overset{くるま}{車}$を$\\overset{と}{止}$める。/把车停在停车场。"
},
{
  word: "上がる",
  kana: "あがる",
  type: "五段自动词",
  meaning: "上升，升高；进入（室内）。",
  example: "$\\overset{きおん}{気温}$が$\\overset{きゅう}{急}$に$\\overset{あ}{上}$がる。/气温突然升高。"
},
{
  word: "温める",
  kana: "あたためる",
  type: "一段他动词",
  meaning: "加热，使温暖。",
  example: "$\\overset{つめ}{冷}$たいスープを$\\overset{でんし}{電子}$レンジで$\\overset{あたた}{温}$める。/用微波炉把冷汤加热。"
},
{
  word: "当てる",
  kana: "あてる",
  type: "一段他动词",
  meaning: "贴上；猜中；命中。",
  example: "$\\overset{ひたい}{額}$に$\\overset{つめ}{冷}$たいタオルを$\\overset{あ}{当}$てる。/把冷毛巾贴在额头上。"
},
{
  word: "改める",
  kana: "あらためる",
  type: "一段他动词",
  meaning: "修改，改正。",
  example: "$\\overset{わる}{悪}$い$\\overset{しゅうかん}{習慣}$を$\\overset{あらた}{改}$める。/改正坏习惯。"
},
{
  word: "浮かぶ",
  kana: "うかぶ",
  type: "五段自动词",
  meaning: "漂浮；浮现。",
  example: "$\\overset{そら}{空}$に$\\overset{しろ}{白}$い$\\overset{くも}{雲}$が$\\overset{う}{浮}$かんでいる。/天空中漂浮着白云。"
},
{
  word: "生む",
  kana: "うむ",
  type: "五段他动词",
  meaning: "生产，生；产生。",
  example: "$\\overset{あたら}{新}$しい$\\overset{かち}{価値}$を$\\overset{う}{生}$む$\\overset{しごと}{仕事}$。/产生新价值的工作。"
},
{
  word: "重ねる",
  kana: "かさねる",
  type: "一段他动词",
  meaning: "叠放，积累。",
  example: "$\\overset{どりょく}{努力}$を$\\overset{かさ}{重}$ねて$\\overset{せいこう}{成功}$を$\\overset{つか}{掴}$む。/积累努力抓住成功。"
},
{
  word: "傾く",
  kana: "かたむく",
  type: "五段自动词",
  meaning: "倾斜；衰退。",
  example: "$\\overset{ひ}{日}$が$\\overset{にし}{西}$に$\\overset{かたむ}{傾}$く。/太阳向西边倾斜。"
},
{
  word: "加える",
  kana: "くわえる",
  type: "一段他动词",
  meaning: "加上，添加。",
  example: "スープに$\\overset{すこ}{少}$し$\\overset{しお}{塩}$を$\\overset{くわ}{加}$える。/在汤里加一点盐。"
},
{
  word: "込める",
  kana: "こめる",
  type: "一段他动词",
  meaning: "倾注，包含。",
  example: "$\\overset{こころ}{心}$を$\\overset{こ}{込}$めて$\\overset{てがみ}{手紙}$を$\\overset{か}{書}$く。/倾注真心写信。"
},
{
  word: "下がる",
  kana: "さがる",
  type: "五段自动词",
  meaning: "下降，降低。",
  example: "$\\overset{ねつ}{熱}$が$\\overset{さ}{下}$がって$\\overset{らく}{楽}$になった。/烧退了，轻松了。"
},
{
  word: "下げる",
  kana: "さげる",
  type: "一段他动词",
  meaning: "降低，撤下。",
  example: "$\\overset{へや}{部屋}$の$\\overset{おんど}{温度}$を$\\overset{さ}{下}$げる。/降低房间的温度。"
},
{
  word: "仕上げる",
  kana: "しあげる",
  type: "一段他动词",
  meaning: "完成，做完。",
  example: "$\\overset{し}{締}$め$\\overset{き}{切}$りまでにレポートを$\\overset{しあ}{仕上}$げる。/在截止日期前完成报告。"
},
{
  word: "進む",
  kana: "すすむ",
  type: "五段自动词",
  meaning: "前进，进展。",
  example: "$\\overset{こうじ}{工事}$が$\\overset{じゅんちょう}{順調}$に$\\overset{すす}{進}$む。/工程顺利进展。"
},
{
  word: "進める",
  kana: "すすめる",
  type: "一段他动词",
  meaning: "推进，使前进。",
  example: "$\\overset{かいぎ}{会議}$の$\\overset{じゅんび}{準備}$を$\\overset{いそ}{急}$いで$\\overset{すす}{進}$める。/急忙推进会议的准备工作。"
},
{
  word: "育つ",
  kana: "そだつ",
  type: "五段自动词",
  meaning: "成长，发育。",
  example: "$\\overset{こ}{子}$どもが$\\overset{けんこう}{健康}$に$\\overset{そだ}{育}$つ。/孩子健康地成长。"
},
{
  word: "育てる",
  kana: "そだてる",
  type: "一段他动词",
  meaning: "培养，抚养。",
  example: "$\\overset{おや}{親}$が$\\overset{あいじょう}{愛情}$を$\\overset{こ}{込}$めて$\\overset{こ}{子}$どもを$\\overset{そだ}{育}$てる。/父母倾注爱意抚养孩子。"
},
{
  word: "揃う",
  kana: "そろう",
  type: "五段自动词",
  meaning: "齐全，聚齐。",
  example: "$\\overset{ぜんいん}{全員}$が$\\overset{そろ}{揃}$ってから$\\overset{しゅっぱつ}{出発}$する。/全员聚齐之后再出发。"
},
{
  word: "揃える",
  kana: "そろえる",
  type: "一段他动词",
  meaning: "凑齐，使一致。",
  example: "$\\overset{げんかん}{玄関}$で$\\overset{くつ}{靴}$を$\\overset{そろ}{揃}$える。/在玄关把鞋子摆整齐。"
},
{
  word: "立てる",
  kana: "たてる",
  type: "一段他动词",
  meaning: "立起，制定。",
  example: "$\\overset{あたら}{新}$しい$\\overset{けいかく}{計画}$を$\\overset{た}{立}$てる。/制定新计划。"
},
{
  word: "貯まる",
  kana: "たまる",
  type: "五段自动词",
  meaning: "积攒，积存。",
  example: "お$\\overset{こづかい}{小遣い}$が$\\overset{た}{貯}$まった。/零花钱攒下来了。"
},
{
  word: "貯める",
  kana: "ためる",
  type: "一段他动词",
  meaning: "攒，储蓄。",
  example: "$\\overset{りょこう}{旅行}$のためにお$\\overset{かね}{金}$を$\\overset{た}{貯}$める。/为了旅行攒钱。"
},
{
  word: "近づく",
  kana: "ちかづく",
  type: "五段自动词",
  meaning: "靠近，临近。",
  example: "$\\overset{しけん}{試験}$の$\\overset{ひ}{日}$が$\\overset{ちか}{近}$づく。/考试的日子临近了。"
},
{
  word: "捕まえる",
  kana: "つかまえる",
  type: "一段他动词",
  meaning: "抓住，逮住。",
  example: "$\\overset{に}{逃}$げる$\\overset{どろぼう}{泥棒}$を$\\overset{つかま}{捕ま}$える。/抓住逃跑的小偷。"
},
{
  word: "掴む",
  kana: "つかむ",
  type: "五段他动词",
  meaning: "抓住，掌握。",
  example: "チャンスをしっかり$\\overset{つか}{掴}$む。/紧紧抓住机会。"
},
{
  word: "伝わる",
  kana: "つたわる",
  type: "五段自动词",
  meaning: "传，传递。",
  example: "$\\overset{かれ}{彼}$の$\\overset{ねつい}{熱意}$がみんなに$\\overset{つた}{伝}$わる。/他的热情传达给了大家。"
},
{
  word: "繋ぐ",
  kana: "つなぐ",
  type: "五段他动词",
  meaning: "连接，系。",
  example: "$\\overset{こども}{子供}$と$\\overset{て}{手}$を$\\overset{つな}{繋}$いで$\\overset{ある}{歩}$く。/和孩子牵着手走。"
},
{
  word: "積む",
  kana: "つむ",
  type: "五段他动词",
  meaning: "堆积，积累。",
  example: "トラックに$\\overset{にもつ}{荷物}$を$\\overset{つ}{積}$む。/把行李装载到卡车上。"
},
{
  word: "届く",
  kana: "とどく",
  type: "五段自动词",
  meaning: "到达，寄到。",
  example: "$\\overset{とお}{遠}$くの$\\overset{ゆうじん}{友人}$から$\\overset{てがみ}{手紙}$が$\\overset{とど}{届}$く。/从远方的友人那里寄来了信。"
},
{
  word: "届ける",
  kana: "とどける",
  type: "一段他动词",
  meaning: "送到，送达。",
  example: "お$\\overset{いわ}{祝}$いの$\\overset{しな}{品}$を$\\overset{いえ}{家}$まで$\\overset{とど}{届}$ける。/把贺礼送到家里。"
},
{
  word: "止める（其二）",
  kana: "やめる",
  type: "一段他动词",
  meaning: "停止，放弃，戒除。",
  example: "$\\overset{けんこう}{健康}$のためにタバコを$\\overset{や}{止}$める。/为了健康戒烟。"
},
{
  word: "載せる",
  kana: "のせる",
  type: "一段他动词",
  meaning: "放上，刊登。",
  example: "$\\overset{ざっし}{雑誌}$に$\\overset{きじ}{記事}$を$\\overset{の}{載}$せる。/在杂志上刊登报道。"
},
{
  word: "嵌める",
  kana: "はめる",
  type: "一段他动词",
  meaning: "戴上，套上。",
  example: "$\\overset{さむ}{寒}$いので$\\overset{てぶくろ}{手袋}$を$\\overset{は}{嵌}$める。/因为冷，所以戴上手套。"
},
{
  word: "広がる",
  kana: "ひろがる",
  type: "五段自动词",
  meaning: "扩展，蔓延。",
  example: "$\\overset{め}{目}$の$\\overset{まえ}{前}$に$\\overset{うみ}{海}$が$\\overset{ひろ}{広}$がる。/大海在眼前展现开来。"
},
{
  word: "ぶつかる",
  kana: "ぶつかる",
  type: "五段自动词",
  meaning: "相撞，冲突。",
  example: "$\\overset{こうさてん}{交差点}$で$\\overset{くるま}{車}$がぶつかる。/汽车在十字路口相撞。"
},
{
  word: "曲がる",
  kana: "まがる",
  type: "五段自动词",
  meaning: "拐弯，弯曲。",
  example: "$\\overset{つぎ}{次}$の$\\overset{かど}{角}$を$\\overset{みぎ}{右}$に$\\overset{ま}{曲}$がる。/在下一个拐角向右转。"
},
{
  word: "混ぜる",
  kana: "まぜる",
  type: "一段他动词",
  meaning: "掺混，混合。",
  example: "$\\overset{こむぎこ}{小麦粉}$に$\\overset{たまご}{卵}$を$\\overset{ま}{混}$ぜる。/把鸡蛋混入面粉中。"
},
{
  word: "纏める",
  kana: "まとめる",
  type: "一段他动词",
  meaning: "汇总，总结。",
  example: "みんなの$\\overset{いけん}{意見}$を$\\overset{まと}{纏}$める。/汇总大家的意见。"
},
{
  word: "止む",
  kana: "やむ",
  type: "五段自动词",
  meaning: "停止（多指自然现象）。",
  example: "$\\overset{ごご}{午後}$になって$\\overset{あめ}{雨}$が$\\overset{や}{止}$む。/到了下午雨停了。"
},
{
  word: "寄る",
  kana: "よる",
  type: "五段自动词",
  meaning: "顺便去，靠近。",
  example: "$\\overset{かえ}{帰}$る$\\overset{とちゅう}{途中}$、スーパーに$\\overset{よ}{寄}$る。/在回家的途中顺便去超市。"
},
{
  word: "分かれる",
  kana: "わかれる",
  type: "一段自动词",
  meaning: "分开，分支。",
  example: "$\\overset{みち}{道}$が$\\overset{ふた}{二}$つに$\\overset{わ}{分}$かれている。/道路分成了两条。"
},
{
  word: "分ける",
  kana: "わける",
  type: "一段他动词",
  meaning: "分配，划分。",
  example: "ケーキを$\\overset{みっ}{三}$つに$\\overset{わ}{分}$ける。/把蛋糕分成三块。"
},
{
  word: "浮かべる",
  kana: "うかべる",
  type: "一段他动词",
  meaning: "使漂浮，浮现。",
  example: "$\\overset{かお}{顔}$に$\\overset{えみ}{笑}$みを$\\overset{う}{浮}$かべる。/脸上浮现出笑容。"
},
{
  word: "収める",
  kana: "おさめる",
  type: "一段他动词",
  meaning: "收纳，取得（好成绩）。",
  example: "$\\overset{せいこう}{成功}$を$\\overset{おさ}{収}$めて、$\\overset{りえき}{利益}$を$\\overset{はこ}{箱}$に$\\overset{おさ}{収}$める。/取得了成功，把利润收进箱子里。"
},
{
  word: "替える",
  kana: "かえる",
  type: "一段他动词",
  meaning: "替换。",
  example: "$\\overset{でんち}{電池}$を$\\overset{あたら}{新}$しいものに$\\overset{か}{替}$える。/把电池换成新的。"
},
{
  word: "重なる",
  kana: "かさなる",
  type: "五段自动词",
  meaning: "重叠，碰巧同时发生。",
  example: "$\\overset{ふうん}{不運}$が$\\overset{かさ}{重}$なって$\\overset{しっぱい}{失敗}$した。/厄运重叠导致了失败。"
},
{
  word: "加わる",
  kana: "くわわる",
  type: "五段自动词",
  meaning: "加入，增加。",
  example: "$\\overset{あたら}{新}$しいメンバーがチームに$\\overset{くわ}{加}$わる。/新成员加入了队伍。"
},
{
  word: "閉まる",
  kana: "しまる",
  type: "五段自动词",
  meaning: "关闭，锁上。",
  example: "$\\overset{よる}{夜}$になると、$\\overset{みせ}{店}$のドアが$\\overset{し}{閉}$まる。/一到晚上，店门就关了。"
},
{
  word: "詰める",
  kana: "つめる",
  type: "一段他动词",
  meaning: "塞满，填塞。",
  example: "$\\overset{はこ}{箱}$に$\\overset{にもつ}{荷物}$を$\\overset{つ}{詰}$める。/把行李塞进箱子里。"
},
{
  word: "泊める",
  kana: "とめる",
  type: "一段他动词",
  meaning: "留宿。",
  example: "$\\overset{ともだち}{友達}$を$\\overset{いえ}{家}$に$\\overset{と}{泊}$める。/留朋友在家里住。"
},
{
  word: "乗せる",
  kana: "のせる",
  type: "一段他动词",
  meaning: "让人搭乘，装载。",
  example: "$\\overset{こども}{子供}$を$\\overset{くるま}{車}$に$\\overset{の}{乗}$せて$\\overset{で}{出}$かける。/让孩子坐上车出门。"
},
{
  word: "広げる",
  kana: "ひろげる",
  type: "一段他动词",
  meaning: "展开，扩大。",
  example: "$\\overset{つくえ}{机}$の$\\overset{うえ}{上}$に$\\overset{ちず}{地図}$を$\\overset{ひろ}{広}$げる。/在桌子上展开地图。"
},
{
  word: "曲げる",
  kana: "まげる",
  type: "一段他动词",
  meaning: "弄弯；歪曲。",
  example: "$\\overset{てつ}{鉄}$の$\\overset{ぼう}{棒}$を$\\overset{ちから}{力}$で$\\overset{ま}{曲}$げる。/用力把铁棍弄弯。"
},
{
  word: "混じる",
  kana: "まじる",
  type: "五段自动词",
  meaning: "混入，夹杂。",
  example: "$\\overset{しらが}{白髪}$が$\\overset{ま}{混}$じっている。/夹杂着白发。"
},
{
  word: "纏まる",
  kana: "まとまる",
  type: "五段自动词",
  meaning: "集中，解决，成形。",
  example: "みんなの$\\overset{いけん}{意見}$が$\\overset{まと}{纏}$まる。/大家的意见达成了一致。"
},
{
  word: "空ける",
  kana: "あける",
  type: "一段他动词",
  meaning: "腾出，空出。",
  example: "スケジュールを$\\overset{あ}{空}$けて$\\overset{ま}{待}$つ。/腾出日程等待。"
},
{
  word: "温まる",
  kana: "あたたまる",
  type: "五段自动词",
  meaning: "变暖。",
  example: "ストーブの$\\overset{まえ}{前}$で$\\overset{からだ}{体}$が$\\overset{あたた}{温}$まる。/在火炉前身体变暖和了。"
},
{
  word: "改まる",
  kana: "あらたまる",
  type: "五段自动词",
  meaning: "改变，革新；郑重。",
  example: "$\\overset{とし}{年}$が$\\overset{あらた}{改}$まる。/新年新气象（年份变更了）。"
},
{
  word: "受かる",
  kana: "うかる",
  type: "五段自动词",
  meaning: "考上，及格。",
  example: "$\\overset{いっしょうけんめい}{一生懸命}$$\\overset{べんきょう}{勉強}$して、$\\overset{だいがく}{大学}$に$\\overset{う}{受}$かる。/拼命学习，考上了大学。"
},
{
  word: "埋まる",
  kana: "うまる",
  type: "五段自动词",
  meaning: "埋着，填满。",
  example: "$\\overset{せき}{席}$が$\\overset{かんきゃく}{観客}$で$\\overset{う}{埋}$まる。/座位被观众填满了。"
},
{
  word: "植わる",
  kana: "うわる",
  type: "五段自动词",
  meaning: "栽种着。",
  example: "$\\overset{にわ}{庭}$に$\\overset{きれい}{綺麗}$な$\\overset{はな}{花}$が$\\overset{う}{植}$わっている。/院子里种着漂亮的花。"
},
{
  word: "終える",
  kana: "おえる",
  type: "一段他动词",
  meaning: "完成，结束。",
  example: "$\\overset{きょう}{今日}$の$\\overset{しゅくだい}{宿題}$を$\\overset{すべ}{全}$て$\\overset{お}{終}$える。/把今天的作业全部做完。"
},
{
  word: "収まる",
  kana: "おさまる",
  type: "五段自动词",
  meaning: "收纳，平息，解决。",
  example: "$\\overset{かぜ}{風}$が$\\overset{おさ}{収}$まる。/风停息了。"
},
{
  word: "固まる",
  kana: "かたまる",
  type: "五段自动词",
  meaning: "凝固，巩固。",
  example: "ゼリーが$\\overset{ひ}{冷}$えて$\\overset{かた}{固}$まる。/果冻冷却凝固了。"
},
{
  word: "傾ける",
  kana: "かたむける",
  type: "一段他动词",
  meaning: "使倾斜；倾注。",
  example: "$\\overset{かれ}{彼}$の$\\overset{はな}{話}$に$\\overset{みみ}{耳}$を$\\overset{かたむ}{傾}$ける。/倾听他说话。"
},
{
  word: "固める",
  kana: "かためる",
  type: "一段他动词",
  meaning: "使凝固，巩固。",
  example: "$\\overset{じぶん}{自分}$の$\\overset{けっしん}{決心}$を$\\overset{かた}{固}$める。/巩固（坚定）自己的决心。"
},
{
  word: "仕上がる",
  kana: "しあがる",
  type: "五段自动词",
  meaning: "做成，完工。",
  example: "$\\overset{りっぱ}{立派}$な$\\overset{さくひん}{作品}$が$\\overset{しあ}{仕上}$がる。/出色的作品完成了。"
},
{
  word: "締まる",
  kana: "しまる",
  type: "五段自动词",
  meaning: "系紧，勒紧；紧张。",
  example: "$\\overset{き}{気}$が$\\overset{し}{締}$まる$\\overset{おも}{思}$いだ。/感到心情紧张（绷紧了弦）。"
},
{
  word: "締める",
  kana: "しめる",
  type: "一段他动词",
  meaning: "系紧，勒紧。",
  example: "ネクタイをしっかり$\\overset{し}{締}$める。/把领带系紧。"
},
{
  word: "高まる",
  kana: "たかまる",
  type: "五段自动词",
  meaning: "高涨，提高。",
  example: "$\\overset{こくみん}{国民}$の$\\overset{かんしん}{関心}$が$\\overset{たか}{高}$まる。/国民的关注度高涨。"
},
{
  word: "近づける",
  kana: "ちかづける",
  type: "一段他动词",
  meaning: "使靠近。",
  example: "$\\overset{いす}{椅子}$を$\\overset{つくえ}{机}$に$\\overset{ちか}{近}$づける。/把椅子靠近桌子。"
},
{
  word: "捕まる",
  kana: "つかまる",
  type: "五段自动词",
  meaning: "被捕，被抓住。",
  example: "$\\overset{に}{逃}$げていた$\\overset{どろぼう}{泥棒}$が$\\overset{けいさつ}{警察}$に$\\overset{つか}{捕}$まる。/逃跑的小偷被警察抓住了。"
},
{
  word: "掴まる",
  kana: "つかまる",
  type: "五段自动词",
  meaning: "抓住，握住。",
  example: "$\\overset{でんしゃ}{電車}$の$\\overset{なか}{中}$で$\\overset{て}{手}$すりに$\\overset{つか}{掴}$まる。/在电车里抓住扶手。"
},
{
  word: "詰まる",
  kana: "つまる",
  type: "五段自动词",
  meaning: "塞满，堵塞。",
  example: "$\\overset{よてい}{予定}$がぎっしり$\\overset{つ}{詰}$まっている。/计划安排得满满当当的。"
},
{
  word: "載る",
  kana: "のる",
  type: "五段自动词",
  meaning: "登载，刊登。",
  example: "$\\overset{しんぶん}{新聞}$に$\\overset{かれ}{彼}$の$\\overset{きじ}{記事}$が$\\overset{の}{載}$る。/报纸上刊登了他的报道。"
},
{
  word: "嵌まる",
  kana: "はまる",
  type: "五段自动词",
  meaning: "套上，吻合；陷入。",
  example: "ボタンが$\\overset{あな}{穴}$にぴったり$\\overset{は}{嵌}$まる。/扣子严丝合缝地扣进洞里。"
},
{
  word: "深まる",
  kana: "ふかまる",
  type: "五段自动词",
  meaning: "加深。",
  example: "$\\overset{あき}{秋}$が$\\overset{ふか}{深}$まり、$\\overset{こうよう}{紅葉}$が$\\overset{うつく}{美}$しい。/秋意渐浓，红叶很美。"
},
{
  word: "ぶつける",
  kana: "ぶつける",
  type: "一段他动词",
  meaning: "撞上，碰上。",
  example: "$\\overset{ふちゅうい}{不注意}$で$\\overset{くるま}{車}$を$\\overset{かべ}{壁}$にぶつける。/不小心把车撞到了墙上。"
},
{
  word: "寄せる",
  kana: "よせる",
  type: "一段他动词",
  meaning: "使靠近，集中。",
  example: "$\\overset{いす}{椅子}$を$\\overset{まど}{窓}$のそばに$\\overset{よ}{寄}$せる。/把椅子拉到窗边。"
},
{
  word: "生かす",
  kana: "いかす",
  type: "五段他动词",
  meaning: "发挥，充分利用；使活下去。",
  example: "$\\overset{い}{生}$きている$\\overset{あいだ}{間}$に$\\overset{じぶん}{自分}$の$\\overset{さいのう}{才能}$を$\\overset{い}{生}$かす。/在活着的时候充分发挥自己的才能。"
},
{
  word: "生きる",
  kana: "いきる",
  type: "一段自动词",
  meaning: "活着，生活。",
  example: "$\\overset{きぼう}{希望}$を$\\overset{も}{持}$って$\\overset{まえ}{前}$を$\\overset{む}{向}$いて$\\overset{い}{生}$きる。/怀揣希望向前看，好好生活。"
},
{
  word: "売る",
  kana: "うる",
  type: "五段他动词",
  meaning: "卖。",
  example: "$\\overset{あさ}{朝}$$\\overset{はや}{早}$く$\\overset{お}{起}$きて、$\\overset{いちば}{市場}$で$\\overset{やさい}{野菜}$を$\\overset{う}{売}$る。/早上早起，在市场上卖蔬菜。"
},
{
  word: "起きる",
  kana: "おきる",
  type: "一段自动词",
  meaning: "起床；发生。",
  example: "$\\overset{じけん}{事件}$が$\\overset{お}{起}$きたので、すぐ$\\overset{いえ}{家}$に$\\overset{かえ}{帰}$る。/因为发生了案件，所以马上回家。"
},
{
  word: "帰す",
  kana: "かえす",
  type: "五段他动词",
  meaning: "让回去，打发回去。",
  example: "$\\overset{おそ}{遅}$くなったので、お$\\overset{きゃく}{客}$さんを$\\overset{いえ}{家}$に$\\overset{かえ}{帰}$す。/因为很晚了，让客人回家。"
},
{
  word: "返す",
  kana: "かえす",
  type: "五段他动词",
  meaning: "归还。",
  example: "$\\overset{か}{借}$りた$\\overset{ほん}{本}$を$\\overset{としょかん}{図書館}$に$\\overset{かえ}{返}$す。/把借来的书还给图书馆。"
},
{
  word: "帰る",
  kana: "かえる",
  type: "五段自动词",
  meaning: "回去，回家。",
  example: "$\\overset{しごと}{仕事}$が$\\overset{お}{終}$わって、$\\overset{いえ}{家}$に$\\overset{かえ}{帰}$る。/工作结束后回家。"
},
{
  word: "返る",
  kana: "かえる",
  type: "五段自动词",
  meaning: "复原，恢复。",
  example: "$\\overset{お}{落}$とし$\\overset{もの}{物}$が$\\overset{ぶじ}{無事}$に$\\overset{てもと}{手元}$に$\\overset{かえ}{返}$る。/遗失物品平安地回到了手边。"
},
{
  word: "欠ける",
  kana: "かける",
  type: "一段自动词",
  meaning: "缺，缺少；缺损。",
  example: "あの$\\overset{ちゃわん}{茶碗}$は$\\overset{すこ}{少}$し$\\overset{か}{欠}$けている。/那个茶碗稍微缺了一角。"
},
{
  word: "聞く",
  kana: "きく",
  type: "五段他动词",
  meaning: "听；询问。",
  example: "$\\overset{せんせい}{先生}$に$\\overset{わ}{分}$からない$\\overset{もんだい}{問題}$を$\\overset{き}{聞}$く。/向老师询问不懂的问题。"
},
{
  word: "聞こえる",
  kana: "きこえる",
  type: "一段自动词",
  meaning: "听得见；听起来觉得。",
  example: "$\\overset{そと}{外}$から$\\overset{おお}{大}$きな$\\overset{おと}{音}$が$\\overset{き}{聞}$こえる。/从外面能听到很大的声音。"
},
{
  word: "消す",
  kana: "けす",
  type: "五段他动词",
  meaning: "擦去，消除；关（灯、电器）。",
  example: "$\\overset{へや}{部屋}$の$\\overset{でんき}{電気}$を$\\overset{け}{消}$して$\\overset{ね}{寝}$る。/关掉房间的灯睡觉。"
},
{
  word: "壊れる",
  kana: "こわれる",
  type: "一段自动词",
  meaning: "坏，出故障。",
  example: "$\\overset{ふる}{古}$い$\\overset{とけい}{時計}$がとうとう$\\overset{こわ}{壊}$れた。/旧钟表终于坏了。"
},
{
  word: "覚める",
  kana: "さめる",
  type: "一段自动词",
  meaning: "醒，觉醒。",
  example: "$\\overset{おお}{大}$きな$\\overset{おと}{音}$で$\\overset{め}{目}$が$\\overset{さ}{覚}$める。/被巨大的声音惊醒了。"
},
{
  word: "冷める",
  kana: "さめる",
  type: "一段自动词",
  meaning: "冷却；热情减退。",
  example: "$\\overset{ねつ}{熱}$が$\\overset{さ}{冷}$めるまで$\\overset{じかん}{時間}$が$\\overset{す}{過}$ぎる。/直到热情减退，时间流逝。"
},
{
  word: "過ぎる",
  kana: "すぎる",
  type: "一段自动词",
  meaning: "经过，通过；过度。",
  example: "$\\overset{やくそく}{約束}$の$\\overset{じかん}{時間}$が$\\overset{す}{過}$ぎてしまった。/约定的时间已经过了。"
},
{
  word: "過ごす",
  kana: "すごす",
  type: "五段他动词",
  meaning: "度过（时间）。",
  example: "$\\overset{きゅうじつ}{休日}$を$\\overset{いえ}{家}$でゆったり$\\overset{す}{過}$ごす。/在家里悠闲地度过休息日。"
},
{
  word: "済む",
  kana: "すむ",
  type: "五段自动词",
  meaning: "结束，解决。",
  example: "$\\overset{しごと}{仕事}$が$\\overset{す}{済}$んだら、$\\overset{けっか}{結果}$を$\\overset{ていしゅつ}{提出}$する。/工作结束后，提交结果。"
},
{
  word: "出す",
  kana: "だす",
  type: "五段他动词",
  meaning: "拿出，取出；提交；寄（信）。",
  example: "$\\overset{すべ}{全}$ての$\\overset{ちから}{力}$を$\\overset{つ}{尽}$くして$\\overset{よ}{良}$い$\\overset{けっか}{結果}$を$\\overset{だ}{出}$す。/倾尽全力拿出好结果。"
},
{
  word: "尽くす",
  kana: "つくす",
  type: "五段他动词",
  meaning: "尽，竭尽。",
  example: "$\\overset{しゃかい}{社会}$のために$\\overset{ぜんりょく}{全力}$を$\\overset{つ}{尽}$くす。/为了社会竭尽全力。"
},
{
  word: "出る",
  kana: "でる",
  type: "一段自动词",
  meaning: "出来，出去；参加。",
  example: "$\\overset{へや}{部屋}$を$\\overset{で}{出}$て、$\\overset{ろうか}{廊下}$を$\\overset{とお}{通}$る。/走出房间，通过走廊。"
},
{
  word: "通す",
  kana: "とおす",
  type: "五段他动词",
  meaning: "让通过；透过；坚持。",
  example: "お$\\overset{きゃく}{客}$さんを$\\overset{おく}{奥}$の$\\overset{へや}{部屋}$に$\\overset{とお}{通}$す。/把客人让进里面的房间。"
},
{
  word: "通る",
  kana: "とおる",
  type: "五段自动词",
  meaning: "通过，经过。",
  example: "$\\overset{くるま}{車}$が$\\overset{とお}{通}$る$\\overset{みち}{道}$に$\\overset{ゆき}{雪}$が$\\overset{と}{溶}$ける。/车通过的路上雪融化了。"
},
{
  word: "溶ける",
  kana: "とける",
  type: "一段自动词",
  meaning: "融化，溶解。",
  example: "$\\overset{こおり}{氷}$が$\\overset{と}{溶}$けて$\\overset{みず}{水}$になる。/冰融化变成水。"
},
{
  word: "飛ぶ",
  kana: "とぶ",
  type: "五段自动词",
  meaning: "飞，飞翔。",
  example: "$\\overset{そら}{空}$を$\\overset{と}{飛}$ぶ$\\overset{とり}{鳥}$を$\\overset{しゃしん}{写真}$に$\\overset{と}{撮}$る。/把在天空飞翔的鸟拍下来。"
},
{
  word: "取る",
  kana: "とる",
  type: "五段他动词",
  meaning: "拿，取得。",
  example: "$\\overset{つくえ}{机}$の$\\overset{うえ}{上}$にある$\\overset{じしょ}{辞書}$を$\\overset{と}{取}$る。/拿桌子上的字典。"
},
{
  word: "直す",
  kana: "なおす",
  type: "五段他动词",
  meaning: "修理，修改。",
  example: "$\\overset{こわ}{壊}$れた$\\overset{きかい}{機械}$を$\\overset{なお}{直}$す。/修理坏掉的机械。"
},
{
  word: "無くなる",
  kana: "なくなる",
  type: "五段自动词",
  meaning: "消失，丢失；用尽。",
  example: "$\\overset{さいふ}{財布}$が$\\overset{な}{無}$くなって$\\overset{おどろ}{驚}$く。/钱包不见了感到惊讶。"
},
{
  word: "鳴る",
  kana: "なる",
  type: "五段自动词",
  meaning: "鸣，响。",
  example: "$\\overset{でんわ}{電話}$が$\\overset{な}{鳴}$ったので、$\\overset{くつ}{靴}$を$\\overset{ぬ}{脱}$いで$\\overset{あ}{上}$がる。/电话响了，所以脱了鞋上去。"
},
{
  word: "脱ぐ",
  kana: "ぬぐ",
  type: "五段他动词",
  meaning: "脱（衣服、鞋等）。",
  example: "$\\overset{あつ}{暑}$いのでコートを$\\overset{ぬ}{脱}$ぐ。/因为热所以脱下大衣。"
},
{
  word: "流れる",
  kana: "ながれる",
  type: "一段自动词",
  meaning: "流，流动。",
  example: "$\\overset{かわ}{川}$の$\\overset{みず}{水}$が$\\overset{なが}{流}$れていく。/河水流淌而去。"
},
{
  word: "残る",
  kana: "のこる",
  type: "五段自动词",
  meaning: "留下，剩下。",
  example: "$\\overset{りょうり}{料理}$が$\\overset{すこ}{少}$し$\\overset{のこ}{残}$る。/饭菜剩下了一点。"
},
{
  word: "伸びる",
  kana: "のびる",
  type: "一段自动词",
  meaning: "伸长，增长，提高。",
  example: "$\\overset{えいご}{英語}$の$\\overset{せいせき}{成績}$がぐんと$\\overset{の}{伸}$びる。/英语成绩大幅提高。"
},
{
  word: "負ける",
  kana: "まける",
  type: "一段自动词",
  meaning: "输，败；让价。",
  example: "$\\overset{しあい}{試合}$に$\\overset{ま}{負}$けて$\\overset{くや}{悔}$しい$\\overset{おも}{思}$いをする。/输了比赛感到很不甘心。"
},
{
  word: "戻す",
  kana: "もどす",
  type: "五段他动词",
  meaning: "放回，归还；恢复。",
  example: "$\\overset{ほん}{本}$を$\\overset{もと}{元}$の$\\overset{ばしょ}{場所}$に$\\overset{もど}{戻}$して、$\\overset{いえ}{家}$に$\\overset{もど}{戻}$る。/把书放回原处，然后回家。"
},
{
  word: "戻る",
  kana: "もどる",
  type: "五段自动词",
  meaning: "返回，回到。",
  example: "$\\overset{かいしゃ}{会社}$から$\\overset{いえ}{家}$に$\\overset{もど}{戻}$る。/从公司回到家。"
},
{
  word: "焼く",
  kana: "やく",
  type: "五段他动词",
  meaning: "烤，烧。",
  example: "$\\overset{にく}{肉}$を$\\overset{や}{焼}$いてから、$\\overset{はし}{橋}$を$\\overset{わた}{渡}$る。/烤完肉之后，过桥。"
},
{
  word: "渡る",
  kana: "わたる",
  type: "五段自动词",
  meaning: "渡，过。",
  example: "$\\overset{あんぜん}{安全}$に$\\overset{おうだん}{横断}$$\\overset{ほどう}{歩道}$を$\\overset{わた}{渡}$る。/安全地走过斑马线。"
},
{
  word: "表す",
  kana: "あらわす",
  type: "五段他动词",
  meaning: "表达，表现。",
  example: "$\\overset{かんしゃ}{感謝}$の$\\overset{きも}{気持}$ちを$\\overset{あらわ}{表}$すと、$\\overset{えがお}{笑顔}$が$\\overset{あらわ}{表}$れる。/表达感谢的心情后，露出了笑容。"
},
{
  word: "表れる",
  kana: "あらわれる",
  type: "一段自动词",
  meaning: "表现出，显露。",
  example: "$\\overset{かれ}{彼}$の$\\overset{かお}{顔}$に$\\overset{つか}{疲}$れが$\\overset{あらわ}{表}$れている。/他的脸上显露出疲惫。"
},
{
  word: "動かす",
  kana: "うごかす",
  type: "五段他动词",
  meaning: "移动，开动。",
  example: "$\\overset{おも}{重}$い$\\overset{きかい}{機械}$を$\\overset{うご}{動}$かすと、$\\overset{はり}{針}$が$\\overset{うご}{動}$く。/开动沉重的机械后，指针动了。"
},
{
  word: "動く",
  kana: "うごく",
  type: "五段自动词",
  meaning: "动，运转。",
  example: "$\\overset{とけい}{時計}$が$\\overset{と}{止}$まらずに$\\overset{うご}{動}$いている。/钟表没有停，正在走动。"
},
{
  word: "移す",
  kana: "うつす",
  type: "五段他动词",
  meaning: "移，挪动；传染。",
  example: "$\\overset{つくえ}{机}$を$\\overset{となり}{隣}$の$\\overset{へや}{部屋}$に$\\overset{うつ}{移}$す。/把桌子移到隔壁房间。"
},
{
  word: "移る",
  kana: "うつる",
  type: "五段自动词",
  meaning: "移动，转移；传染上。",
  example: "$\\overset{あたら}{新}$しい$\\overset{ぶしょ}{部署}$に$\\overset{うつ}{移}$る。/转移到新的部门。"
},
{
  word: "起こす",
  kana: "おこす",
  type: "五段他动词",
  meaning: "叫醒；引起，引发。",
  example: "$\\overset{じこ}{事故}$を$\\overset{お}{起}$こして、$\\overset{いけ}{池}$に$\\overset{おち}{落}$ちる。/引发了事故，掉进了池塘里。"
},
{
  word: "落ちる",
  kana: "おちる",
  type: "一段自动词",
  meaning: "掉落，落下。",
  example: "$\\overset{き}{木}$の$\\overset{は}{葉}$が$\\overset{じめん}{地面}$に$\\overset{おち}{落}$ちる。/树叶落到地面上。"
},
{
  word: "落とす",
  kana: "おとす",
  type: "五段他动词",
  meaning: "弄丢，使落下。",
  example: "$\\overset{さいふ}{財布}$を$\\overset{お}{落}$としたことに$\\overset{きづ}{気付}$いて$\\overset{おどろ}{驚}$く。/意识到弄丢了钱包感到惊讶。"
},
{
  word: "驚く",
  kana: "おどろく",
  type: "五段自动词",
  meaning: "吃惊，惊讶。",
  example: "$\\overset{かれ}{彼}$の$\\overset{とつぜん}{突然}$の$\\overset{ほうもん}{訪問}$に$\\overset{おどろ}{驚}$く。/对他的突然来访感到惊讶。"
},
{
  word: "降りる",
  kana: "おりる",
  type: "一段自动词",
  meaning: "下（车、山等）；降霜等。",
  example: "$\\overset{かいだん}{階段}$を$\\overset{お}{降}$りる$\\overset{とき}{時}$に、$\\overset{き}{木}$の$\\overset{えだ}{枝}$を$\\overset{お}{折}$る。/下楼梯的时候，折断了树枝。"
},
{
  word: "折る",
  kana: "おる",
  type: "五段他动词",
  meaning: "折，折断。",
  example: "$\\overset{かみ}{紙}$を$\\overset{お}{折}$って$\\overset{つる}{鶴}$を$\\overset{つく}{作}$る。/折纸做纸鹤。"
},
{
  word: "折れる",
  kana: "おれる",
  type: "一段自动词",
  meaning: "折断；让步。",
  example: "$\\overset{つよ}{強}$い$\\overset{かぜ}{風}$で$\\overset{えだ}{枝}$が$\\overset{お}{折}$れる$\\overset{まえ}{前}$に、$\\overset{にもつ}{荷物}$を$\\overset{お}{下}$ろす。/在强风把树枝折断之前，放下行李。"
},
{
  word: "下ろす",
  kana: "おろす",
  type: "五段他动词",
  meaning: "放下，卸下；提取（存款）。",
  example: "$\\overset{ぎんこう}{銀行}$からお$\\overset{かね}{金}$を$\\overset{お}{下}$ろす。/从银行取钱。"
},
{
  word: "隠す",
  kana: "かくす",
  type: "五段他动词",
  meaning: "隐藏，掩盖。",
  example: "$\\overset{たからもの}{宝物}$を$\\overset{かく}{隠}$して、$\\overset{じぶん}{自分}$も$\\overset{かく}{隠}$れる。/把宝物藏起来，自己也躲起来。"
},
{
  word: "隠れる",
  kana: "かくれる",
  type: "一段自动词",
  meaning: "躲藏，隐蔽。",
  example: "$\\overset{き}{木}$の$\\overset{うし}{後}$ろに$\\overset{かく}{隠}$れる。/躲在树后面。"
},
{
  word: "乾かす",
  kana: "かわかす",
  type: "五段他动词",
  meaning: "晾干，烤干。",
  example: "$\\overset{ぬ}{濡}$れた$\\overset{かみ}{髪}$を$\\overset{かわ}{乾}$かすと、すぐ$\\overset{かわ}{乾}$く。/弄干湿头发，马上就干了。"
},
{
  word: "乾く",
  kana: "かわく",
  type: "五段自动词",
  meaning: "干，干燥。",
  example: "$\\overset{せんたくもの}{洗濯物}$が$\\overset{たいよう}{太陽}$の$\\overset{した}{下}$で$\\overset{かわ}{乾}$く。/洗好的衣物在太阳下变干了。"
},
{
  word: "消える",
  kana: "きえる",
  type: "一段自动词",
  meaning: "消失，熄灭。",
  example: "$\\overset{でんげん}{電源}$を$\\overset{き}{切}$ると、$\\overset{がめん}{画面}$が$\\overset{き}{消}$える。/切断电源后，画面就消失了。"
},
{
  word: "切る",
  kana: "きる",
  type: "五段他动词",
  meaning: "切，割，剪；切断。",
  example: "ナイフで$\\overset{やさい}{野菜}$を$\\overset{き}{切}$る。/用刀切蔬菜。"
},
{
  word: "切れる",
  kana: "きれる",
  type: "一段自动词",
  meaning: "断开；用尽。",
  example: "$\\overset{いと}{糸}$が$\\overset{き}{切}$れて、$\\overset{かざ}{飾}$りが$\\overset{くず}{崩}$れる。/线断了，装饰倒塌了。"
},
{
  word: "崩れる",
  kana: "くずれる",
  type: "一段自动词",
  meaning: "崩溃，坍塌；天气变坏。",
  example: "$\\overset{あめ}{雨}$のせいで$\\overset{やま}{山}$が$\\overset{くず}{崩}$れる。/因为下雨山体滑坡了。"
},
{
  word: "暮らす",
  kana: "くらす",
  type: "五段自他动词",
  meaning: "生活，度日。",
  example: "$\\overset{まいにち}{毎日}$を$\\overset{へいわ}{平和}$に$\\overset{くら}{暮}$らすうちに、$\\overset{ひ}{日}$が$\\overset{く}{暮}$れる。/在和平度日中，天渐渐黑了。"
},
{
  word: "暮れる",
  kana: "くれる",
  type: "一段自动词",
  meaning: "天黑；年末。",
  example: "$\\overset{あき}{秋}$は$\\overset{ひ}{日}$が$\\overset{く}{暮}$れるのが$\\overset{はや}{早}$い。/秋天天黑得很早。"
},
{
  word: "壊す",
  kana: "こわす",
  type: "五段他动词",
  meaning: "弄坏，破坏。",
  example: "$\\overset{ふる}{古}$い$\\overset{いえ}{家}$を$\\overset{こわ}{壊}$して、$\\overset{き}{木}$を$\\overset{たお}{倒}$す。/拆毁旧房子，推倒树木。"
},
{
  word: "倒す",
  kana: "たおす",
  type: "五段他动词",
  meaning: "弄倒，推倒；打败。",
  example: "$\\overset{しあい}{試合}$で$\\overset{あいて}{相手}$を$\\overset{たお}{倒}$す。/在比赛中打败对手。"
},
{
  word: "倒れる",
  kana: "たおれる",
  type: "一段自动词",
  meaning: "倒下，跌倒。",
  example: "$\\overset{つよ}{強}$い$\\overset{かぜ}{風}$で$\\overset{き}{木}$が$\\overset{たお}{倒}$れ、$\\overset{はな}{花}$が$\\overset{ち}{散}$る。/狂风把树吹倒了，花也散落了。"
},
{
  word: "散る",
  kana: "ちる",
  type: "五段自动词",
  meaning: "散落，凋谢。",
  example: "$\\overset{さくら}{桜}$の$\\overset{はな}{花}$が$\\overset{かぜ}{風}$で$\\overset{ち}{散}$る。/樱花随风飘落。"
},
{
  word: "解く",
  kana: "とく",
  type: "五段他动词",
  meaning: "解开；解答。",
  example: "$\\overset{むずか}{難}$しい$\\overset{もんだい}{問題}$を$\\overset{と}{解}$くと、$\\overset{なぞ}{謎}$が$\\overset{と}{解}$ける。/解开难题后，谜团也解开了。"
},
{
  word: "解ける",
  kana: "とける",
  type: "一段自动词",
  meaning: "解开，解明。",
  example: "$\\overset{くつ}{靴}$のひもが$\\overset{と}{解}$ける。/鞋带松开了。"
},
{
  word: "治す",
  kana: "なおす",
  type: "五段他动词",
  meaning: "治好，医治。",
  example: "$\\overset{いしゃ}{医者}$が$\\overset{びょうき}{病気}$を$\\overset{なお}{治}$し、$\\overset{かんじゃ}{患者}$が$\\overset{なお}{治}$る。/医生治病，患者痊愈。"
},
{
  word: "治る",
  kana: "なおる",
  type: "五段自动词",
  meaning: "痊愈，治好。",
  example: "$\\overset{かぜ}{風邪}$がすっかり$\\overset{なお}{治}$る。/感冒完全好了。"
},
{
  word: "無くす",
  kana: "なくす",
  type: "五段他动词",
  meaning: "丢失，丧失；消除。",
  example: "$\\overset{じしん}{自信}$を$\\overset{な}{無}$くして$\\overset{に}{逃}$げる。/失去了自信而逃跑。"
},
{
  word: "逃げる",
  kana: "にげる",
  type: "一段自动词",
  meaning: "逃跑。",
  example: "$\\overset{どろぼう}{泥棒}$が$\\overset{けいさつ}{警察}$から$\\overset{に}{逃}$げる。/小偷从警察那里逃跑。"
},
{
  word: "抜く",
  kana: "ぬく",
  type: "五段他动词",
  meaning: "拔出，抽出；超过。",
  example: "$\\overset{せん}{栓}$を$\\overset{ぬ}{抜}$いて、$\\overset{みず}{水}$を$\\overset{なが}{流}$す。/拔掉塞子，把水放走。"
},
{
  word: "流す",
  kana: "ながす",
  type: "五段他动词",
  meaning: "使流动，冲走；流（泪）。",
  example: "$\\overset{かな}{悲}$しくて$\\overset{なみだ}{涙}$を$\\overset{なが}{流}$す。/因为悲伤而流泪。"
},
{
  word: "伸ばす",
  kana: "のばす",
  type: "五段他动词",
  meaning: "伸直，伸长；发展。",
  example: "$\\overset{て}{手}$を$\\overset{の}{伸}$ばして、$\\overset{さいご}{最後}$の$\\overset{いっ}{一}$$\\overset{こ}{個}$を$\\overset{のこ}{残}$す。/伸出手，留下最后一个。"
},
{
  word: "残す",
  kana: "のこす",
  type: "五段他动词",
  meaning: "留下，剩下。",
  example: "ご$\\overset{はん}{飯}$を$\\overset{のこ}{残}$さないで$\\overset{た}{食}$べてください。/请不要剩饭全部吃完。"
},
{
  word: "励ます",
  kana: "はげます",
  type: "五段他动词",
  meaning: "鼓励，激励。",
  example: "$\\overset{ともだち}{友達}$を$\\overset{はげ}{励}$まし、$\\overset{いっしょ}{一緒}$に$\\overset{べんきょう}{勉強}$に$\\overset{はげ}{励}$む。/鼓励朋友，一起努力学习。"
},
{
  word: "励む",
  kana: "はげむ",
  type: "五段自动词",
  meaning: "努力，勤奋。",
  example: "$\\overset{しけん}{試験}$に$\\overset{む}{向}$けて$\\overset{べんきょう}{勉強}$に$\\overset{はげ}{励}$む。/为了考试努力学习。"
},
{
  word: "外す",
  kana: "はずす",
  type: "五段他动词",
  meaning: "取下，摘下；避开。",
  example: "ボタンを$\\overset{はず}{外}$すと、カバーが$\\overset{はず}{外}$れる。/解开扣子，罩子就脱落了。"
},
{
  word: "外れる",
  kana: "はずれる",
  type: "一段自动词",
  meaning: "脱落；偏离，未中。",
  example: "$\\overset{てんき}{天気}$$\\overset{よほう}{予報}$が$\\overset{はず}{外}$れる。/天气预报不准（没中）。"
},
{
  word: "離れる",
  kana: "はなれる",
  type: "一段自动词",
  meaning: "离开，距离。",
  example: "$\\overset{かぞく}{家族}$と$\\overset{はな}{離}$れると、$\\overset{こころ}{心}$が$\\overset{ひ}{冷}$える。/和家人离开后，心变冷了。"
},
{
  word: "冷える",
  kana: "ひえる",
  type: "一段自动词",
  meaning: "变冷，变凉。",
  example: "$\\overset{ふゆ}{冬}$の$\\overset{よる}{夜}$は$\\overset{からだ}{体}$が$\\overset{ひ}{冷}$える。/冬天的夜晚身体变冷。"
},
{
  word: "冷やす",
  kana: "ひやす",
  type: "五段他动词",
  meaning: "冰镇，使变冷。",
  example: "ビールを$\\overset{ひ}{冷}$やすと、お$\\overset{きゃく}{客}$さんが$\\overset{ふ}{増}$える。/把啤酒冰镇后，客人增加了。"
},
{
  word: "増える",
  kana: "ふえる",
  type: "一段自动词",
  meaning: "增加。",
  example: "$\\overset{じんこう}{人口}$がだんだん$\\overset{ふ}{増}$える。/人口渐渐增加。"
},
{
  word: "増やす",
  kana: "ふやす",
  type: "五段他动词",
  meaning: "增加（数量等）。",
  example: "$\\overset{しゅうにゅう}{収入}$を$\\overset{ふ}{増}$やし、$\\overset{ししゅつ}{支出}$を$\\overset{へ}{減}$らす。/增加收入，减少支出。"
},
{
  word: "減らす",
  kana: "へらす",
  type: "五段他动词",
  meaning: "减少（事物）。",
  example: "$\\overset{むだ}{無駄}$な$\\overset{しゅっぴ}{出費}$を$\\overset{へ}{減}$らす。/减少不必要的开销。"
},
{
  word: "減る",
  kana: "へる",
  type: "五段自动词",
  meaning: "减少。",
  example: "お$\\overset{かね}{金}$が$\\overset{へ}{減}$るので、$\\overset{ちえ}{知恵}$を$\\overset{まわ}{回}$す。/因为钱在减少，所以开动脑筋想办法。"
},
{
  word: "回す",
  kana: "まわす",
  type: "五段他动词",
  meaning: "转动，传递。",
  example: "$\\overset{とけい}{時計}$の$\\overset{はり}{針}$を$\\overset{まわ}{回}$す。/转动钟表的指针。"
},
{
  word: "回る",
  kana: "まわる",
  type: "五段自动词",
  meaning: "旋转，环绕。",
  example: "$\\overset{きかい}{機械}$が$\\overset{まわ}{回}$り、$\\overset{ほのお}{炎}$が$\\overset{も}{燃}$える。/机器旋转，火焰燃烧。"
},
{
  word: "燃える",
  kana: "もえる",
  type: "一段自动词",
  meaning: "燃烧；热情高涨。",
  example: "$\\overset{ひ}{火}$が$\\overset{はげ}{激}$しく$\\overset{も}{燃}$える。/火烧得很猛烈。"
},
{
  word: "燃やす",
  kana: "もやす",
  type: "五段他动词",
  meaning: "燃烧，焚烧。",
  example: "$\\overset{てがみ}{手紙}$を$\\overset{やぶ}{破}$って、$\\overset{ひ}{火}$に$\\overset{な}{投}$げ$\\overset{こ}{込}$んで$\\overset{も}{燃}$やす。/把信撕破，扔进火里烧掉。"
},
{
  word: "破る",
  kana: "やぶる",
  type: "五段他动词",
  meaning: "打破，撕破；违背（诺言）。",
  example: "$\\overset{やくそく}{約束}$を$\\overset{やぶ}{破}$ってはいけない。/不能违背诺言。"
},
{
  word: "破れる",
  kana: "やぶれる",
  type: "一段自动词",
  meaning: "破裂，破损。",
  example: "$\\overset{やぶ}{破}$れた$\\overset{ふく}{服}$が$\\overset{かぜ}{風}$で$\\overset{ゆ}{揺}$れる。/破了的衣服在风中摇晃。"
},
{
  word: "揺れる",
  kana: "ゆれる",
  type: "一段自动词",
  meaning: "摇晃，震动。",
  example: "$\\overset{じしん}{地震}$で$\\overset{いえ}{家}$が$\\overset{ゆ}{揺}$れる。/因为地震房子摇晃。"
},
{
  word: "汚れる",
  kana: "よごれる",
  type: "一段自动词",
  meaning: "弄脏，变脏。",
  example: "$\\overset{よご}{汚}$れた$\\overset{ふく}{服}$を$\\overset{あら}{洗}$うためにお$\\overset{ゆ}{湯}$を$\\overset{わ}{沸}$かす。/为了洗弄脏的衣服烧热水。"
},
{
  word: "沸かす",
  kana: "わかす",
  type: "五段他动词",
  meaning: "烧开，使沸腾；使狂热。",
  example: "お$\\overset{ちゃ}{茶}$を$\\overset{の}{飲}$むためにお$\\overset{ゆ}{湯}$を$\\overset{わ}{沸}$かす。/为了喝茶而烧水。"
},
{
  word: "割る",
  kana: "わる",
  type: "五段他动词",
  meaning: "打破，打碎；除以。",
  example: "コップを$\\overset{わ}{割}$ると、ガラスが$\\overset{わ}{割}$れる。/打碎杯子，玻璃就碎了。"
},
{
  word: "割れる",
  kana: "われる",
  type: "一段自动词",
  meaning: "破裂，碎掉。",
  example: "$\\overset{かぜ}{風}$で$\\overset{まど}{窓}$ガラスが$\\overset{わ}{割}$れる。/风把窗玻璃吹破了。"
},
{
  word: "現す",
  kana: "あらわす",
  type: "五段他动词",
  meaning: "表现，显露。",
  example: "$\\overset{すがた}{姿}$を$\\overset{あらわ}{現}$すと、$\\overset{かれ}{彼}$の$\\overset{さいのう}{才能}$が$\\overset{あらわ}{現}$れる。/一现身，他的才能就显露出来了。"
},
{
  word: "現れる",
  kana: "あらわれる",
  type: "一段自动词",
  meaning: "出现，显现。",
  example: "$\\overset{くも}{雲}$の$\\overset{あいだ}{間}$から$\\overset{つき}{月}$が$\\overset{あらわ}{現}$れる。/月亮从云层中出现了。"
},
{
  word: "写す",
  kana: "うつす",
  type: "五段他动词",
  meaning: "抄写，拍照。",
  example: "$\\overset{こくばん}{黒板}$の$\\overset{じ}{字}$をノートに$\\overset{うつ}{写}$し、$\\overset{かがみ}{鏡}$に$\\overset{すがた}{姿}$を$\\overset{うつ}{映}$す。/把黑板上的字抄在笔记本上，在镜子里照出身影。"
},
{
  word: "映す",
  kana: "うつす",
  type: "五段他动词",
  meaning: "放映，照，映。",
  example: "$\\overset{えいが}{映画}$をスクリーンに$\\overset{うつ}{映}$す。/把电影放映在银幕上。"
},
{
  word: "写る",
  kana: "うつる",
  type: "五段自动词",
  meaning: "照相，上相。",
  example: "$\\overset{しゃしん}{写真}$に$\\overset{うつ}{写}$った$\\overset{やま}{山}$を$\\overset{お}{下}$りる。/从照片上拍到的那座山上走下来。"
},
{
  word: "下りる",
  kana: "おりる",
  type: "一段自动词",
  meaning: "走下，降下；发给（许可等）。",
  example: "$\\overset{かいだん}{階段}$を$\\overset{お}{下}$りる。/下楼梯。"
},
{
  word: "降ろす",
  kana: "おろす",
  type: "五段他动词",
  meaning: "拿下，降下；让人下车。",
  example: "$\\overset{にもつ}{荷物}$を$\\overset{お}{降}$ろして、$\\overset{やま}{山}$を$\\overset{くず}{崩}$す。/卸下行李，把山弄塌（夷平）。"
},
{
  word: "崩す",
  kana: "くずす",
  type: "五段他动词",
  meaning: "拆毁，毁坏；换零钱。",
  example: "$\\overset{せんえん}{千円}$$\\overset{さつ}{札}$を$\\overset{ひゃくえん}{百円}$$\\overset{だま}{玉}$に$\\overset{くず}{崩}$す。/把一千日元纸币换成一百日元硬币。"
},
{
  word: "下る",
  kana: "くだる",
  type: "五段自动词",
  meaning: "下去，顺流而下；下达。",
  example: "$\\overset{さか}{坂}$を$\\overset{くだ}{下}$ると、$\\overset{つぶ}{潰}$れた$\\overset{いえ}{家}$があった。/走下坡道，看到了一栋塌了的房子。"
},
{
  word: "潰れる",
  kana: "つぶれる",
  type: "一段自动词",
  meaning: "压坏，破产，垮台。",
  example: "あの$\\overset{かいしゃ}{会社}$は$\\overset{けいえい}{経営}$が$\\overset{わる}{悪}$かして$\\overset{つぶ}{潰}$れた。/那家公司因为经营恶化破产了。"
},
{
  word: "釣る",
  kana: "つる",
  type: "五段他动词",
  meaning: "钓（鱼）；引诱。",
  example: "$\\overset{よる}{夜}$の$\\overset{うみ}{海}$をライトで$\\overset{て}{照}$らし、$\\overset{さかな}{魚}$を$\\overset{つ}{釣}$る。/用灯光照亮夜晚的大海去钓鱼。"
},
{
  word: "照らす",
  kana: "てらす",
  type: "五段他动词",
  meaning: "照耀，照射；参照。",
  example: "$\\overset{たいよう}{太陽}$が$\\overset{ちじょう}{地上}$を$\\overset{あか}{明}$るく$\\overset{て}{照}$らす。/太阳把地面照得很明亮。"
},
{
  word: "取れる",
  kana: "とれる",
  type: "一段自动词",
  meaning: "脱落；能取得。",
  example: "$\\overset{と}{取}$れたボタンが$\\overset{きれい}{綺麗}$に$\\overset{なお}{直}$る。/掉下来的扣子被修补得很完美。"
},
{
  word: "直る",
  kana: "なおる",
  type: "五段自动词",
  meaning: "修好，复原。",
  example: "$\\overset{こわ}{壊}$れていたパソコンが$\\overset{なお}{直}$った。/坏了的电脑修好了。"
},
{
  word: "逃がす",
  kana: "にがす",
  type: "五段他动词",
  meaning: "放跑，错过。",
  example: "$\\overset{とり}{鳥}$を$\\overset{にが}{逃}$して、$\\overset{はやし}{林}$を$\\overset{ぬ}{抜}$ける。/放走了鸟，穿过树林。"
},
{
  word: "抜ける",
  kana: "ぬける",
  type: "一段自动词",
  meaning: "脱落，漏掉；穿过。",
  example: "$\\overset{なが}{長}$いトンネルを$\\overset{ぬ}{抜}$ける。/穿过长长的隧道。"
},
{
  word: "延ばす",
  kana: "のばす",
  type: "五段他动词",
  meaning: "推迟，延长（时间）。",
  example: "$\\overset{しゅっぱつ}{出発}$を$\\overset{の}{延}$ばして、$\\overset{にわ}{庭}$に$\\overset{は}{生}$えた$\\overset{くさ}{草}$を$\\overset{ぬ}{抜}$く。/推迟出发时间，拔掉院子里长出来的草。"
},
{
  word: "生える",
  kana: "はえる",
  type: "一段自动词",
  meaning: "生，长（植物、毛发等）。",
  example: "$\\overset{はる}{春}$になって、$\\overset{あたら}{新}$しい$\\overset{くさ}{草}$が$\\overset{は}{生}$える。/到了春天，长出了新草。"
},
{
  word: "放す",
  kana: "はなす",
  type: "五段他动词",
  meaning: "放开，撒开。",
  example: "$\\overset{いぬ}{犬}$を$\\overset{はな}{放}$して、$\\overset{て}{手}$を$\\overset{はな}{離}$す。/放开狗，松开手。"
},
{
  word: "離す",
  kana: "はなす",
  type: "五段他动词",
  meaning: "分开，隔开。",
  example: "$\\overset{つくえ}{机}$と$\\overset{つくえ}{机}$の$\\overset{あいだ}{間}$を$\\overset{はな}{離}$す。/把桌子和桌子拉开距离。"
},
{
  word: "焼ける",
  kana: "やける",
  type: "一段自动词",
  meaning: "烧着，烤熟；晒黑。",
  example: "$\\overset{にく}{肉}$が$\\overset{や}{焼}$けて、お$\\overset{ゆ}{湯}$が$\\overset{わ}{沸}$く。/肉烤熟了，水也烧开了。"
},
{
  word: "沸く",
  kana: "わく",
  type: "五段自动词",
  meaning: "沸腾；激动。",
  example: "お$\\overset{ゆ}{湯}$が$\\overset{わ}{沸}$いたので、お$\\overset{ちゃ}{茶}$を$\\overset{い}{入}$れる。/水烧开了，所以泡茶。"
},
{
  word: "渡す",
  kana: "わたす",
  type: "五段他动词",
  meaning: "交，递给。",
  example: "$\\overset{かがみ}{鏡}$に$\\overset{うつ}{映}$る$\\overset{じぶん}{自分}$を$\\overset{み}{見}$て、プレゼントを$\\overset{わた}{渡}$す。/看着镜子里映出的自己，递出礼物。"
},
{
  word: "映る",
  kana: "うつる",
  type: "五段自动词",
  meaning: "映出，倒映。",
  example: "$\\overset{みず}{水}$の$\\overset{ひょうめん}{表面}$に$\\overset{けしき}{景色}$が$\\overset{うつ}{映}$る。/水面上倒映着景色。"
},
{
  word: "売れる",
  kana: "うれる",
  type: "一段自动词",
  meaning: "畅销，卖得出去。",
  example: "$\\overset{しょうひん}{商品}$が$\\overset{う}{売}$れて、$\\overset{かれ}{彼}$を$\\overset{おどろ}{驚}$かす。/商品大卖，让他吃了一惊。"
},
{
  word: "驚かす",
  kana: "おどろかす",
  type: "五段他动词",
  meaning: "使惊吓，使惊讶。",
  example: "$\\overset{おお}{大}$きな$\\overset{こえ}{声}$を$\\overset{だ}{出}$して$\\overset{ともだち}{友達}$を$\\overset{おどろ}{驚}$かす。/大声喊叫来吓朋友。"
},
{
  word: "欠かす",
  kana: "かかす",
  type: "五段他动词",
  meaning: "缺，漏掉。",
  example: "$\\overset{どりょく}{努力}$を$\\overset{か}{欠}$かさず、$\\overset{けつだん}{決断}$を$\\overset{くだ}{下}$す。/不懈努力，并下定决心。"
},
{
  word: "下す",
  kana: "くだす",
  type: "五段他动词",
  meaning: "下达，做出（判断、决定）。",
  example: "$\\overset{じゅうよう}{重要}$な$\\overset{はんだん}{判断}$を$\\overset{くだ}{下}$す。/做出重要的判断。"
},
{
  word: "覚ます",
  kana: "さます",
  type: "五段他动词",
  meaning: "弄醒；使清醒。",
  example: "$\\overset{め}{目}$を$\\overset{さ}{覚}$まして、お$\\overset{ちゃ}{茶}$を$\\overset{さ}{冷}$ます。/弄醒自己（睁开眼睛），然后把茶放凉。"
},
{
  word: "冷ます",
  kana: "さます",
  type: "五段他动词",
  meaning: "冷却，弄凉。",
  example: "$\\overset{あつ}{熱}$いスープを$\\overset{さ}{冷}$ましてから$\\overset{た}{食}$べる。/把热汤放凉了再喝。"
},
{
  word: "済ます",
  kana: "すます",
  type: "五段他动词",
  meaning: "搞完，办完。",
  example: "$\\overset{ようじ}{用事}$を$\\overset{す}{済}$まして、$\\overset{き}{気}$を$\\overset{ち}{散}$らす。/办完事情，换换心情。"
},
{
  word: "散らす",
  kana: "ちらす",
  type: "五段他动词",
  meaning: "散布，使分散。",
  example: "$\\overset{かぜ}{風}$が$\\overset{さくら}{桜}$の$\\overset{はな}{花}$を$\\overset{ち}{散}$らす。/风把樱花吹落了。"
},
{
  word: "尽きる",
  kana: "つきる",
  type: "一段自动词",
  meaning: "尽，完，用尽。",
  example: "$\\overset{たいりょく}{体力}$が$\\overset{つ}{尽}$きるまで$\\overset{じかん}{時間}$を$\\overset{つぶ}{潰}$す。/一直打发时间直到体力耗尽。"
},
{
  word: "潰す",
  kana: "つぶす",
  type: "五段他动词",
  meaning: "压碎，毁坏；打发（时间）。",
  example: "$\\overset{やす}{休}$みの$\\overset{ひ}{日}$にゲームをして$\\overset{じかん}{時間}$を$\\overset{つぶ}{潰}$す。/休息日打游戏打发时间。"
},
{
  word: "釣れる",
  kana: "つれる",
  type: "一段自动词",
  meaning: "能钓到，钓上来。",
  example: "$\\overset{たいよう}{太陽}$が$\\overset{て}{照}$る$\\overset{なか}{中}$、$\\overset{さかな}{魚}$が$\\overset{つ}{釣}$れる。/在太阳照耀下，鱼被钓上来了。"
},
{
  word: "照る",
  kana: "てる",
  type: "五段自动词",
  meaning: "照耀。",
  example: "$\\overset{たいよう}{太陽}$が$\\overset{あか}{明}$るく$\\overset{て}{照}$っている。/太阳明亮地照耀着。"
},
{
  word: "溶く",
  kana: "とく",
  type: "五段他动词",
  meaning: "调和，溶解。",
  example: "$\\overset{たまご}{卵}$を$\\overset{と}{溶}$いて、$\\overset{じょうだん}{冗談}$を$\\overset{と}{飛}$ばす。/把鸡蛋打散（调和），然后开个玩笑。"
},
{
  word: "飛ばす",
  kana: "とばす",
  type: "五段他动词",
  meaning: "使飞，放飞；跳过。",
  example: "$\\overset{ふうせん}{風船}$を$\\overset{そら}{空}$に$\\overset{と}{飛}$ばす。/把气球放飞到天空。"
},
{
  word: "鳴らす",
  kana: "ならす",
  type: "五段他动词",
  meaning: "按响，鸣响。",
  example: "ベルを$\\overset{な}{鳴}$らして$\\overset{はし}{走}$ると$\\overset{くつ}{靴}$が$\\overset{ぬ}{脱}$げる。/按响铃铛跑起来，结果鞋子掉了。"
},
{
  word: "脱げる",
  kana: "ぬげる",
  type: "一段自动词",
  meaning: "脱落。",
  example: "$\\overset{くつ}{靴}$が$\\overset{しぜん}{自然}$に$\\overset{ぬ}{脱}$げる。/鞋子自然地脱落了。"
},
{
  word: "延びる",
  kana: "のびる",
  type: "一段自动词",
  meaning: "延长，推迟（时间或距离）。",
  example: "$\\overset{かいぎ}{会議}$が$\\overset{の}{延}$びて、$\\overset{しごと}{仕事}$から$\\overset{はな}{放}$れる。/会议延长了，然后下班脱离了工作。"
},
{
  word: "放れる",
  kana: "はなれる",
  type: "一段自动词",
  meaning: "解脱，脱离。",
  example: "$\\overset{じゆう}{自由}$になって$\\overset{そくばく}{束縛}$から$\\overset{はな}{放}$れる。/获得了自由，从束缚中解脱出来。"
},
{
  word: "生やす",
  kana: "はやす",
  type: "五段他动词",
  meaning: "使生长，留（胡须等）。",
  example: "$\\overset{ひげ}{髭}$を$\\overset{は}{生}$やした$\\overset{かれ}{彼}$が、$\\overset{あいて}{相手}$を$\\overset{まか}{負}$かす。/留着胡子的他打败了对手。"
},
{
  word: "負かす",
  kana: "まかす",
  type: "五段他动词",
  meaning: "打败，击败。",
  example: "$\\overset{しあい}{試合}$で$\\overset{つよ}{強}$い$\\overset{あいて}{相手}$を$\\overset{まか}{負}$かす。/在比赛中打败了强劲的对手。"
},
{
  word: "揺らす",
  kana: "ゆらす",
  type: "五段他动词",
  meaning: "摇晃，摇动。",
  example: "$\\overset{からだ}{体}$を$\\overset{ゆ}{揺}$らして、$\\overset{ふく}{服}$を$\\overset{よご}{汚}$す。/晃动身体，弄脏了衣服。"
},
{
  word: "汚す",
  kana: "よごす",
  type: "五段他动词",
  meaning: "弄脏。",
  example: "$\\overset{どろ}{泥}$で$\\overset{あたら}{新}$しい$\\overset{くつ}{靴}$を$\\overset{よご}{汚}$してしまった。/用泥把新鞋弄脏了。"
},
{
  word: "ああ",
  kana: "ああ",
  type: "感叹词",
  meaning: "啊，哎呀。",
  example: "ああ、$\\overset{きょう}{今日}$はとても$\\overset{あつ}{暑}$いから、$\\overset{ねっちゅうしょう}{熱中症}$が$\\overset{あぶ}{危}$ない。/啊，今天太热了，要小心中暑（很危险）。"
},
{
  word: "会う",
  kana: "あう",
  type: "五段自动词",
  meaning: "遇见，碰见。",
  example: "$\\overset{えき}{駅}$で$\\overset{ゆうじん}{友人}$に$\\overset{あ}{会}$うために、あれを$\\overset{も}{持}$って$\\overset{い}{行}$く。/为了在车站见朋友，带着那个去。"
},
{
  word: "暑い",
  kana: "あつい",
  type: "形容词",
  meaning: "热（指天气）。",
  example: "$\\overset{あつ}{暑}$い$\\overset{ひ}{日}$に$\\overset{うみ}{海}$へ$\\overset{い}{行}$くのは$\\overset{きも}{気持}$ちがいい。/大热天去海边感觉很舒服。"
},
{
  word: "危ない",
  kana: "あぶない",
  type: "形容词",
  meaning: "危险。",
  example: "$\\overset{うえ}{上}$から$\\overset{おも}{重}$い$\\overset{もの}{物}$が$\\overset{おち}{落}$ちてくるので$\\overset{あぶ}{危}$ない。/上面有重物掉下来，很危险。"
},
{
  word: "あれ",
  kana: "あれ",
  type: "代词",
  meaning: "那个（指代离说话人和听话人都远的事物）。",
  example: "あれはおととい$\\overset{かれ}{彼}$が$\\overset{か}{借}$りた$\\overset{かみ}{紙}$だ。/那是他前天借的纸。"
},
{
  word: "行く",
  kana: "いく",
  type: "五段自动词",
  meaning: "去，前往。",
  example: "$\\overset{うみ}{海}$の$\\overset{ちか}{近}$くの$\\overset{えき}{駅}$まで$\\overset{い}{行}$く。/去海边附近的车站。"
},
{
  word: "痛い",
  kana: "いたい",
  type: "形容词",
  meaning: "疼，痛。",
  example: "$\\overset{おも}{重}$い$\\overset{にもつ}{荷物}$を$\\overset{も}{持}$って、$\\overset{くび}{首}$と$\\overset{せなか}{背中}$が$\\overset{いた}{痛}$い。/拿着重重的行李，脖子和后背很痛。"
},
{
  word: "上",
  kana: "うえ",
  type: "名词",
  meaning: "上面。",
  example: "$\\overset{つくえ}{机}$の$\\overset{うえ}{上}$に$\\overset{かみ}{紙}$と$\\overset{かず}{数}$の$\\overset{ひょう}{表}$がある。/桌子上面有纸和数字表。"
},
{
  word: "海",
  kana: "うみ",
  type: "名词",
  meaning: "海，大海。",
  example: "おととい、$\\overset{おんな}{女}$の$\\overset{こ}{子}$が$\\overset{うみ}{海}$で$\\overset{あそ}{遊}$んでいた。/前天，一个女孩在海边玩耍。"
},
{
  word: "駅",
  kana: "えき",
  type: "名词",
  meaning: "车站。",
  example: "$\\overset{えき}{駅}$に$\\overset{つ}{着}$いてから、どうしていいか$\\overset{かんが}{考}$える。/到了车站之后，思考该怎么办。"
},
{
  word: "おととい",
  kana: "おととい",
  type: "名词・副词",
  meaning: "前天。",
  example: "おととい、$\\overset{きわ}{極}$めて$\\overset{じゅうよう}{重要}$な$\\overset{ほん}{本}$を$\\overset{か}{借}$りた。/前天，借了一本极其重要的书。"
},
{
  word: "重い",
  kana: "おもい",
  type: "形容词",
  meaning: "重的。",
  example: "この$\\overset{おんな}{女}$の$\\overset{ひと}{人}$には、その$\\overset{にもつ}{荷物}$は$\\overset{おも}{重}$すぎる。/对于这个女人来说，那个行李太重了。"
},
{
  word: "女",
  kana: "おんな",
  type: "名词",
  meaning: "女子，女人。",
  example: "その$\\overset{おんな}{女}$の$\\overset{ひと}{人}$は$\\overset{きわ}{極}$めて$\\overset{うつく}{美}$しい$\\overset{じ}{字}$を$\\overset{か}{書}$く。/那个女人写着极其漂亮的字。"
},
{
  word: "書く",
  kana: "かく",
  type: "五段他动词",
  meaning: "写。",
  example: "$\\overset{かみ}{紙}$に$\\overset{かず}{数}$をたくさん$\\overset{か}{書}$く。/在纸上写很多数字。"
},
{
  word: "数",
  kana: "かず",
  type: "名词",
  meaning: "数，数量。",
  example: "$\\overset{たまご}{卵}$の$\\overset{かず}{数}$をちゃんと$\\overset{かぞ}{数}$える。/好好地数鸡蛋的数量。"
},
{
  word: "紙",
  kana: "かみ",
  type: "名词",
  meaning: "纸。",
  example: "$\\overset{か}{借}$りた$\\overset{かみ}{紙}$に$\\overset{じぶん}{自分}$の$\\overset{かんが}{考}$えを$\\overset{か}{書}$く。/在借来的纸上写下自己的想法。"
},
{
  word: "借りる",
  kana: "かりる",
  type: "一段他动词",
  meaning: "借（进）。",
  example: "$\\overset{ほん}{本}$を$\\overset{か}{借}$りて、その$\\overset{ないよう}{内容}$について$\\overset{かんが}{考}$える。/借书，并思考其中的内容。"
},
{
  word: "考える",
  kana: "かんがえる",
  type: "一段他动词",
  meaning: "思考，考虑。",
  example: "$\\overset{きわ}{極}$めて$\\overset{しんこく}{深刻}$な$\\overset{もんだい}{問題}$として$\\overset{かんが}{考}$える。/作为一个极其严重的问题来考虑。"
},
{
  word: "極めて",
  kana: "きわめて",
  type: "副词",
  meaning: "极其，非常。",
  example: "$\\overset{かれ}{彼}$の$\\overset{くび}{首}$の$\\overset{けが}{怪我}$は$\\overset{きわ}{極}$めて$\\overset{あぶ}{危}$ない。/他脖子上的伤极其危险。"
},
{
  word: "首",
  kana: "くび",
  type: "名词",
  meaning: "脖子，头。",
  example: "さっきから$\\overset{くび}{首}$が$\\overset{いた}{痛}$くて$\\overset{くる}{苦}$しむ。/从刚才开始脖子就痛得难受。"
},
{
  word: "幸い",
  kana: "さいわい",
  type: "名・形动・副词",
  meaning: "幸运，幸好。",
  example: "$\\overset{かれ}{彼}$の$\\overset{ぶじ}{無事}$を$\\overset{き}{聞}$いて$\\overset{さいわ}{幸}$いだ。/听到他平安无事真是太好了。 || $\\overset{さいわ}{幸}$い、さっきの$\\overset{でんしゃ}{電車}$に$\\overset{ま}{間}$に$\\overset{あ}{合}$った。/幸好赶上了刚才的电车。"
},
{
  word: "さっき",
  kana: "さっき",
  type: "副词",
  meaning: "刚才。",
  example: "さっき、タオルを$\\overset{かた}{固}$く$\\overset{しぼ}{絞}$ってから$\\overset{すわ}{座}$った。/刚才把毛巾用力拧干后坐下了。"
},
{
  word: "絞る",
  kana: "しぼる",
  type: "五段他动词",
  meaning: "拧，绞；集中。",
  example: "$\\overset{ぞうきん}{雑巾}$を$\\overset{しぼ}{絞}$って、ちゃんと$\\overset{そうじ}{掃除}$する。/拧干抹布，好好打扫。"
},
{
  word: "座る",
  kana: "すわる",
  type: "五段自动词",
  meaning: "坐下。",
  example: "$\\overset{いす}{椅子}$に$\\overset{すわ}{座}$って$\\overset{たまご}{卵}$を$\\overset{た}{食}$べる。/坐在椅子上吃鸡蛋。"
},
{
  word: "卵",
  kana: "たまご",
  type: "名词",
  meaning: "鸡蛋。",
  example: "$\\overset{たまご}{卵}$と$\\overset{にく}{肉}$を$\\overset{つか}{使}$って$\\overset{りょうり}{料理}$を$\\overset{なら}{習}$う。/学习用鸡蛋和肉做菜。"
},
{
  word: "ちゃんと",
  kana: "ちゃんと",
  type: "副词・サ变动词する自",
  meaning: "好好地，端正地。",
  example: "$\\overset{えき}{駅}$に$\\overset{つ}{着}$いたら、ちゃんと$\\overset{でんわ}{電話}$してください。/到了车站之后，请好好打个电话。 || $\\overset{ふくそう}{服装}$をちゃんとする。/把衣服穿端正。"
},
{
  word: "着く",
  kana: "つく",
  type: "五段自动词",
  meaning: "到达。",
  example: "どうしてこんなに$\\overset{おそ}{遅}$く$\\overset{えき}{駅}$に$\\overset{つ}{着}$いたのか。/为什么这么晚才到车站？"
},
{
  word: "どうして",
  kana: "どうして",
  type: "副词",
  meaning: "为什么。",
  example: "どうして$\\overset{かれ}{彼}$は$\\overset{な}{泣}$いているのだろうか。/为什么他在哭呢？"
},
{
  word: "泣く",
  kana: "なく",
  type: "五段自动词",
  meaning: "哭泣。",
  example: "びっくりして、$\\overset{おも}{思}$わず$\\overset{な}{泣}$き$\\overset{だ}{出}$した。/大吃一惊，不由得哭了起来。"
},
{
  word: "習う",
  kana: "ならう",
  type: "五段他动词",
  meaning: "学习，练习。",
  example: "$\\overset{にく}{肉}$や$\\overset{は}{葉}$を$\\overset{つか}{使}$った$\\overset{りょうり}{料理}$を$\\overset{はは}{母}$から$\\overset{なら}{習}$う。/向妈妈学习用肉和叶子做的菜。"
},
{
  word: "肉",
  kana: "にく",
  type: "名词",
  meaning: "肉。",
  example: "$\\overset{やわ}{柔}$らかい$\\overset{にく}{肉}$を$\\overset{め}{召}$し$\\overset{あ}{上}$がる。/享用柔软的肉。"
},
{
  word: "葉",
  kana: "は",
  type: "名词",
  meaning: "叶子。",
  example: "$\\overset{はる}{春}$になって、$\\overset{あたら}{新}$しい$\\overset{は}{葉}$が$\\overset{で}{出}$てきた。/到了春天，长出了新叶。"
},
{
  word: "春",
  kana: "はる",
  type: "名词",
  meaning: "春天。",
  example: "$\\overset{はる}{春}$$\\overset{かぜ}{風}$が$\\overset{ふ}{吹}$く$\\overset{なか}{中}$、$\\overset{ひだり}{左}$へ$\\overset{ま}{曲}$がる。/在吹着春风的时候，向左转。"
},
{
  word: "左",
  kana: "ひだり",
  type: "名词",
  meaning: "左边。",
  example: "$\\overset{ひだり}{左}$と$\\overset{みぎ}{右}$に$\\overset{ふた}{二}$つの$\\overset{みせ}{店}$がある。/左边和右边各有一家店。"
},
{
  word: "びっくり",
  kana: "びっくり",
  type: "副词・サ变动词する自",
  meaning: "吃惊，吓一跳。",
  example: "$\\overset{とつぜん}{突然}$の$\\overset{こと}{事}$にびっくりした。/对突然发生的事大吃一惊。 || $\\overset{ひゃく}{百}$$\\overset{てん}{点}$を$\\overset{と}{取}$って$\\overset{おや}{親}$をびっくりさせる。/考了一百分，让父母大吃一惊。"
},
{
  word: "百",
  kana: "ひゃく",
  type: "名词",
  meaning: "百。",
  example: "$\\overset{ひゃく}{百}$$\\overset{まい}{枚}$の$\\overset{かみ}{紙}$が$\\overset{かぜ}{風}$で$\\overset{ふ}{吹}$き$\\overset{と}{飛}$ぶ。/一百张纸被风吹飞了。"
},
{
  word: "吹く",
  kana: "ふく",
  type: "五段自他动词",
  meaning: "吹（风）；吹（笛子）。",
  example: "$\\overset{みなみ}{南}$から$\\overset{あたた}{暖}$かい$\\overset{かぜ}{風}$が$\\overset{ふ}{吹}$く。/从南边吹来温暖的风。 || $\\overset{ふえ}{笛}$を$\\overset{ふ}{吹}$く。/吹笛子。"
},
{
  word: "二つ",
  kana: "ふたつ",
  type: "名词",
  meaning: "两个。",
  example: "まだ$\\overset{ふた}{二}$つの$\\overset{もんだい}{問題}$が$\\overset{のこ}{残}$っている。/还有两个问题留着。"
},
{
  word: "まだ",
  kana: "まだ",
  type: "副词",
  meaning: "还，仍然。",
  example: "まだ$\\overset{じゅんび}{準備}$が$\\overset{た}{足}$りない。/准备得还不充足。"
},
{
  word: "右",
  kana: "みぎ",
  type: "名词",
  meaning: "右边。",
  example: "$\\overset{みぎ}{右}$の$\\overset{て}{手}$で$\\overset{にく}{肉}$を$\\overset{き}{切}$る。/用右手切肉。"
},
{
  word: "南",
  kana: "みなみ",
  type: "名词",
  meaning: "南方。",
  example: "$\\overset{みなみ}{南}$の$\\overset{まど}{窓}$から$\\overset{やわ}{柔}$らかい$\\overset{ひざし}{日差し}$が$\\overset{はい}{入}$る。/从南边的窗户照进柔和的阳光。"
},
{
  word: "召し上がる",
  kana: "めしあがる",
  type: "五段他动词",
  meaning: "吃，喝（「食べる・飲む」的尊敬语）。",
  example: "どうぞ、この$\\overset{やわ}{柔}$らかい$\\overset{にく}{肉}$を$\\overset{め}{召}$し$\\overset{あ}{上}$がってください。/请用这柔软的肉。"
},
{
  word: "柔らかい",
  kana: "やわらかい",
  type: "形容词",
  meaning: "柔软的。",
  example: "$\\overset{やわ}{柔}$らかい$\\overset{ゆび}{指}$で$\\overset{まくら}{枕}$を$\\overset{さわ}{触}$る。/用柔软的手指触摸枕头。"
},
{
  word: "指",
  kana: "ゆび",
  type: "名词",
  meaning: "手指。",
  example: "$\\overset{ゆび}{指}$を$\\overset{けが}{怪我}$して$\\overset{いた}{痛}$い。/手指受伤了很痛。"
},
{
  word: "喜ぶ",
  kana: "よろこぶ",
  type: "五段自动词",
  meaning: "高兴，欢喜。",
  example: "$\\overset{おっと}{夫}$の$\\overset{ぶじ}{無事}$を$\\overset{いの}{祈}$り、$\\overset{かえ}{帰}$ってきたら$\\overset{よろこ}{喜}$ぶ。/祈求丈夫平安，他回来后非常高兴。"
},
{
  word: "祈る",
  kana: "いのる",
  type: "五段他动词",
  meaning: "祈祷，祈求。",
  example: "$\\overset{かぞく}{家族}$の$\\overset{けんこう}{健康}$を$\\overset{いの}{祈}$る。/祈求家人的健康。"
},
{
  word: "疑う",
  kana: "うたがう",
  type: "五段他动词",
  meaning: "怀疑。",
  example: "$\\overset{かれ}{彼}$の$\\overset{ことば}{言葉}$を$\\overset{うたが}{疑}$ってがっかりした。/怀疑他的话，感到很失望。"
},
{
  word: "夫",
  kana: "おっと",
  type: "名词",
  meaning: "丈夫。",
  example: "$\\overset{おっと}{夫}$は$\\overset{さけ}{酒}$を$\\overset{この}{好}$む$\\overset{ひと}{人}$だ。/丈夫是个喜欢喝酒的人。"
},
{
  word: "がっかり",
  kana: "がっかり",
  type: "副词・サ变动词する自",
  meaning: "失望，颓丧。",
  example: "$\\overset{しけん}{試験}$に$\\overset{お}{落}$ちてがっかりした。/考试没过，感到很失望。 || きちんと$\\overset{じゅんび}{準備}$しなくてがっかりする$\\overset{けっか}{結果}$になった。/没有好好准备，导致了令人失望的结果。"
},
{
  word: "きちんと",
  kana: "きちんと",
  type: "副词",
  meaning: "整洁地，好好地。",
  example: "$\\overset{ふく}{服}$をきちんと$\\overset{たた}{畳}$んで$\\overset{そな}{備}$える。/把衣服好好地叠起来准备好。"
},
{
  word: "苦しむ",
  kana: "くるしむ",
  type: "五段自动词",
  meaning: "痛苦，苦恼。",
  example: "この$\\overset{あいだ}{間}$、$\\overset{びょうき}{病気}$で$\\overset{くる}{苦}$しんだ。/前阵子，因为生病受了苦。"
},
{
  word: "この間",
  kana: "このあいだ",
  type: "名词・副词",
  meaning: "前几天，最近。",
  example: "この$\\overset{あいだ}{間}$の$\\overset{あめ}{雨}$で$\\overset{つゆ}{梅雨}$に$\\overset{はい}{入}$った。/因为前几天的雨，进入了梅雨季节。"
},
{
  word: "好む",
  kana: "このむ",
  type: "五段他动词",
  meaning: "喜欢，爱好。",
  example: "$\\overset{かれ}{彼}$は$\\overset{ひとり}{一人}$で$\\overset{さけ}{酒}$を$\\overset{の}{飲}$むのを$\\overset{この}{好}$む。/他喜欢一个人喝酒。"
},
{
  word: "酒",
  kana: "さけ",
  type: "名词",
  meaning: "酒。",
  example: "$\\overset{さけ}{酒}$を$\\overset{の}{飲}$んで、$\\overset{たいよう}{太陽}$が$\\overset{しず}{沈}$むのを$\\overset{み}{見}$る。/喝着酒，看太阳落山。"
},
{
  word: "沈む",
  kana: "しずむ",
  type: "五段自动词",
  meaning: "下沉，落（日）；消沉。",
  example: "$\\overset{たいよう}{太陽}$が$\\overset{しず}{沈}$む$\\overset{けしき}{景色}$は$\\overset{すご}{凄}$い。/太阳下山的景色非常壮观。"
},
{
  word: "凄い",
  kana: "すごい",
  type: "形容词",
  meaning: "惊人的，极好的；可怕的。",
  example: "$\\overset{せなか}{背中}$に$\\overset{すご}{凄}$い$\\overset{いた}{痛}$みを$\\overset{かん}{感}$じる。/背部感到剧烈的疼痛。"
},
{
  word: "背中",
  kana: "せなか",
  type: "名词",
  meaning: "后背，背部。",
  example: "$\\overset{せなか}{背中}$に$\\overset{にもつ}{荷物}$を$\\overset{せお}{背負}$って$\\overset{そな}{備}$える。/把行李背在后背上做好准备。"
},
{
  word: "備える",
  kana: "そなえる",
  type: "一段他动词",
  meaning: "准备，防备；配备。",
  example: "$\\overset{つゆ}{梅雨}$の$\\overset{じき}{時期}$に$\\overset{そな}{備}$えて$\\overset{かさ}{傘}$を$\\overset{ようい}{用意}$する。/准备好伞以防备梅雨季节。"
},
{
  word: "畳む",
  kana: "たたむ",
  type: "五段他动词",
  meaning: "折叠；关闭。",
  example: "$\\overset{せんたくもの}{洗濯物}$をきちんと$\\overset{たた}{畳}$む。/把洗好的衣物好好叠起来。"
},
{
  word: "種",
  kana: "たね",
  type: "名词",
  meaning: "种子；种类；原因。",
  example: "$\\overset{はる}{春}$に$\\overset{はな}{花}$の$\\overset{たね}{種}$を$\\overset{ま}{蒔}$く。/在春天播下花的种子。"
},
{
  word: "足りる",
  kana: "たりる",
  type: "一段自动词",
  meaning: "足够，值得。",
  example: "$\\overset{つね}{常}$にお$\\overset{かね}{金}$が$\\overset{た}{足}$りない$\\overset{じょうたい}{状態}$だ。/经常处于钱不够的状态。"
},
{
  word: "常に",
  kana: "つねに",
  type: "副词",
  meaning: "经常，总是。",
  example: "$\\overset{つね}{常}$に$\\overset{さいあく}{最悪}$の$\\overset{じたい}{事態}$を$\\overset{かんが}{考}$える。/总是考虑到最坏的情况。"
},
{
  word: "梅雨",
  kana: "つゆ",
  type: "名词",
  meaning: "梅雨。",
  example: "$\\overset{つゆ}{梅雨}$の$\\overset{じき}{時期}$は$\\overset{あめ}{雨}$ががちだ。/梅雨时期往往多雨。"
},
{
  word: "とんでもない",
  kana: "とんでもない",
  type: "形容词",
  meaning: "出乎意料的，荒谬的。",
  example: "とんでもない$\\overset{しっぱい}{失敗}$をしてしまった。/犯了一个荒谬的错误。"
},
{
  word: "斜め",
  kana: "ななめ",
  type: "名・形动",
  meaning: "倾斜，歪斜。",
  example: "$\\overset{ななめ}{斜}$めの$\\overset{せん}{線}$を$\\overset{ひ}{引}$いて、$\\overset{はし}{端}$まで$\\overset{むす}{結}$ぶ。/画一条斜线，连接到边缘。"
},
{
  word: "温い",
  kana: "ぬるい",
  type: "形容词",
  meaning: "微温的，不冷不热的。",
  example: "$\\overset{ぬる}{温}$いお$\\overset{ちゃ}{茶}$を$\\overset{の}{飲}$んでほっとする。/喝了温茶松了一口气。"
},
{
  word: "望む",
  kana: "のぞむ",
  type: "五段他动词",
  meaning: "希望，期望；眺望。",
  example: "$\\overset{へいわ}{平和}$な$\\overset{せかい}{世界}$を$\\overset{こころ}{心}$から$\\overset{のぞ}{望}$む。/由衷地期望一个和平的世界。"
},
{
  word: "端",
  kana: "はし",
  type: "名词",
  meaning: "边缘，端。",
  example: "$\\overset{みち}{道}$の$\\overset{はし}{端}$を$\\overset{ある}{歩}$いて、$\\overset{はば}{幅}$を$\\overset{ひろ}{広}$く$\\overset{あ}{空}$ける。/走在路的边缘，空出宽阔的宽度。"
},
{
  word: "裸",
  kana: "はだか",
  type: "名词",
  meaning: "裸体，赤裸。",
  example: "$\\overset{はだかあし}{裸足}$で$\\overset{くさ}{草}$の$\\overset{うえ}{上}$を$\\overset{ふ}{踏}$む。/光着脚踩在草地上。"
},
{
  word: "幅",
  kana: "はば",
  type: "名词",
  meaning: "宽度，幅度。",
  example: "この$\\overset{みち}{道}$は$\\overset{はば}{幅}$が$\\overset{ひろ}{広}$い。/这条路宽度很宽。"
},
{
  word: "踏む",
  kana: "ふむ",
  type: "五段他动词",
  meaning: "踩，踏；经历。",
  example: "$\\overset{まちが}{間違}$って$\\overset{ひと}{人}$の$\\overset{あし}{足}$を$\\overset{ふ}{踏}$んでしまった。/不小心踩到了别人的脚。"
},
{
  word: "ほっと",
  kana: "ほっと",
  type: "副词・サ变动词する自",
  meaning: "放心，松一口气。",
  example: "$\\overset{しけん}{試験}$が$\\overset{お}{終}$わって、ほっと$\\overset{いき}{息}$をつく。/考完试，松了一口气。 || $\\overset{あんぜん}{安全}$な$\\overset{ばしょ}{場所}$に$\\overset{つ}{着}$いてほっとした。/到了安全的地方，终于放心了。"
},
{
  word: "枕",
  kana: "まくら",
  type: "名词",
  meaning: "枕头。",
  example: "$\\overset{まくら}{枕}$に$\\overset{あたま}{頭}$を$\\overset{の}{乗}$せて、$\\overset{ふとん}{布団}$に$\\overset{もぐ}{潜}$る。/把头放在枕头上，钻进被窝里。"
},
{
  word: "胸",
  kana: "むね",
  type: "名词",
  meaning: "胸部，内心。",
  example: "$\\overset{むね}{胸}$に$\\overset{こころざし}{志}$を$\\overset{だ}{抱}$いて$\\overset{あゆ}{歩}$む。/胸怀大志迈步前行。"
},
{
  word: "潜る",
  kana: "もぐる",
  type: "五段自动词",
  meaning: "潜入，钻入。",
  example: "$\\overset{うみ}{海}$の$\\overset{ふか}{深}$くへ$\\overset{もぐ}{潜}$る。/潜入深深的海底。"
},
{
  word: "歩む",
  kana: "あゆむ",
  type: "五段自动词",
  meaning: "走，步行；前进。",
  example: "$\\overset{えんだい}{遠大}$な$\\overset{もくひょう}{目標}$に$\\overset{むか}{向}$かって$\\overset{あゆ}{歩}$む。/朝着远大的目标迈进。"
},
{
  word: "多く",
  kana: "おおく",
  type: "名词・副词",
  meaning: "多数，许多。",
  example: "$\\overset{おお}{多}$くの$\\overset{ひと}{人}$が$\\overset{いざかや}{居酒屋}$に$\\overset{あつ}{集}$まる。/许多人聚集在居酒屋。"
},
{
  word: "幼い",
  kana: "おさない",
  type: "形容词",
  meaning: "幼小的，年幼的。",
  example: "$\\overset{おさな}{幼}$い$\\overset{ころ}{頃}$から、$\\overset{きみ}{君}$は$\\overset{やす}{休}$みの$\\overset{ひ}{日}$も$\\overset{あそ}{遊}$ばなかった。/从幼年起，你在休息日也不玩耍。"
},
{
  word: "がち",
  kana: "がち",
  type: "接尾词",
  meaning: "容易……，往往（多用于消极）。",
  example: "$\\overset{かれ}{彼}$は$\\overset{びょうき}{病気}$がちだ。だから$\\overset{やす}{休}$む。/他容易生病。所以请假了。"
},
{
  word: "君",
  kana: "きみ",
  type: "代词",
  meaning: "你。",
  example: "$\\overset{きみ}{君}$の$\\overset{こころざし}{志}$は$\\overset{すば}{素晴}$らしいけれども、$\\overset{みじゅく}{未熟}$だ。/你的志向很棒，但是还不够成熟。"
},
{
  word: "けれども",
  kana: "けれども",
  type: "接续词",
  meaning: "虽然，但是。",
  example: "$\\overset{あめ}{雨}$が$\\overset{ふ}{降}$っているけれども、$\\overset{さわ}{爽}$やかだ。/虽然在下雨，但感觉很清爽。"
},
{
  word: "志",
  kana: "こころざし",
  type: "名词",
  meaning: "志向，志愿。",
  example: "$\\overset{こころざし}{志}$を$\\overset{も}{持}$って、$\\overset{えんだい}{遠大}$な$\\overset{けいかく}{計画}$を$\\overset{た}{立}$てる。/带着志向，制定远大的计划。"
},
{
  word: "爽やか",
  kana: "さわやか",
  type: "形动",
  meaning: "清爽的，爽快的。",
  example: "$\\overset{さわ}{爽}$やかな$\\overset{かぜ}{風}$の$\\overset{なか}{中}$で、$\\overset{とり}{鳥}$が$\\overset{す}{巣}$を$\\overset{つく}{作}$る。/在清爽的风中，鸟儿在筑巢。"
},
{
  word: "巣",
  kana: "す",
  type: "名词",
  meaning: "巢，窝。",
  example: "$\\overset{き}{木}$の$\\overset{うえ}{上}$に$\\overset{ことり}{小鳥}$の$\\overset{す}{巣}$がある。/树上有小鸟的窝。"
},
{
  word: "すなわち",
  kana: "すなわち",
  type: "接续词",
  meaning: "也就是说，即。",
  example: "これこそ、すなわち$\\overset{わたし}{私}$の$\\overset{もと}{求}$めていたものだ。/这正是，也就是我一直追求的东西。"
},
{
  word: "だから",
  kana: "だから",
  type: "接续词",
  meaning: "所以，因此。",
  example: "$\\overset{はる}{春}$になった。だから$\\overset{たねま}{種蒔}$きを$\\overset{はじ}{始}$めよう。/春天到了。所以开始播种吧。"
},
{
  word: "種蒔き",
  kana: "たねまき",
  type: "名・サ变动词する自他",
  meaning: "播种。",
  example: "$\\overset{はる}{春}$の$\\overset{たねま}{種蒔}$きの$\\overset{じき}{時期}$。/春天播种的时期。 || $\\overset{はたけ}{畑}$で$\\overset{たねま}{種蒔}$きする。/在田里播种。"
},
{
  word: "ところで",
  kana: "ところで",
  type: "接续词",
  meaning: "不过，话说回来（用于转换话题）。",
  example: "ところで、$\\overset{あした}{明日}$の$\\overset{やす}{休}$みはどうする？/话说回来，明天休息你打算干嘛？"
},
{
  word: "放る",
  kana: "ほうる",
  type: "五段他动词",
  meaning: "抛，扔；放任不管。",
  example: "ボールを$\\overset{ほう}{放}$って、そのままにする。/把球扔出去，就不管了。"
},
{
  word: "まま",
  kana: "まま",
  type: "名词",
  meaning: "保持原样，照旧。",
  example: "$\\overset{もも}{桃}$を$\\overset{かわ}{皮}$を$\\overset{む}{剥}$かずにそのまま$\\overset{た}{食}$べる。/桃子不削皮，就那么直接吃。"
},
{
  word: "桃",
  kana: "もも",
  type: "名词",
  meaning: "桃子。",
  example: "$\\overset{しゅん}{旬}$の$\\overset{もも}{桃}$はとても$\\overset{あま}{甘}$い。/应季的桃子非常甜。"
},
{
  word: "休み",
  kana: "やすみ",
  type: "名词",
  meaning: "休息，休假。",
  example: "$\\overset{やす}{休}$みの$\\overset{ひ}{日}$に、わざと$\\overset{いざかや}{居酒屋}$へ$\\overset{い}{行}$く。/休息日，特意去居酒屋。"
},
{
  word: "わざと",
  kana: "わざと",
  type: "副词",
  meaning: "故意地。",
  example: "わざと$\\overset{かみくず}{紙屑}$を$\\overset{ゆか}{床}$に$\\overset{す}{捨}$てた$\\overset{あげく}{挙句}$、$\\overset{おこ}{怒}$られた。/故意把碎纸屑扔在地上，结果被骂了。"
},
{
  word: "挙句",
  kana: "あげく",
  type: "名词",
  meaning: "结果，到头来（多接在动词た形后，表消极结果）。",
  example: "$\\overset{さんざん}{散々}$$\\overset{まよ}{迷}$った$\\overset{あげく}{挙句}$、$\\overset{か}{買}$わないことにした。/犹豫了半天，结果还是决定不买了。"
},
{
  word: "居酒屋",
  kana: "いざかや",
  type: "名词",
  meaning: "居酒屋，小酒馆。",
  example: "$\\overset{えきまえ}{駅前}$の$\\overset{いざかや}{居酒屋}$で$\\overset{さけ}{酒}$を$\\overset{の}{飲}$む。/在站前的居酒屋喝酒。"
},
{
  word: "遠大",
  kana: "えんだい",
  type: "形动",
  meaning: "远大，宏大。",
  example: "$\\overset{みじゅく}{未熟}$だが、$\\overset{えんだい}{遠大}$な$\\overset{ゆめ}{夢}$を$\\overset{も}{持}$っている。/虽然还很不成熟，但拥有远大的梦想。"
},
{
  word: "駅前",
  kana: "えきまえ",
  type: "名词",
  meaning: "车站前面。",
  example: "$\\overset{えきまえ}{駅前}$のバス$\\overset{てい}{停}$でバスを$\\overset{ま}{待}$つ。/在站前的公交车站等公交。"
},
{
  word: "海峡",
  kana: "かいきょう",
  type: "名词",
  meaning: "海峡。",
  example: "$\\overset{ふね}{船}$で$\\overset{ひろ}{広}$い$\\overset{かいきょう}{海峡}$を$\\overset{わた}{渡}$る。/坐船横渡宽广的海峡。"
},
{
  word: "書き方",
  kana: "かきかた",
  type: "名词",
  meaning: "写法，书写方式。",
  example: "$\\overset{てがみ}{手紙}$の$\\overset{ただ}{正}$しい$\\overset{か}{書}$き$\\overset{かた}{方}$を$\\overset{こころが}{心掛}$ける。/留意信件的正确写法。"
},
{
  word: "紙屑",
  kana: "かみくず",
  type: "名词",
  meaning: "废纸，纸屑。",
  example: "$\\overset{かみくず}{紙屑}$や$\\overset{から}{殻}$をゴミ$\\overset{ばこ}{箱}$に$\\overset{す}{捨}$てる。/把废纸和果壳扔进垃圾桶。"
},
{
  word: "殻",
  kana: "から",
  type: "名词",
  meaning: "壳，外壳。",
  example: "$\\overset{たまご}{卵}$の$\\overset{から}{殻}$を$\\overset{きれい}{綺麗}$に$\\overset{む}{剥}$く。/把鸡蛋壳剥得干干净净。"
},
{
  word: "心掛ける",
  kana: "こころがける",
  type: "一段他动词",
  meaning: "留心，记住，用心。",
  example: "$\\overset{つね}{常}$に$\\overset{あんぜん}{安全}$を$\\overset{こころが}{心掛}$けて$\\overset{うんてん}{運転}$する。/时刻留意安全进行驾驶。"
},
{
  word: "旬",
  kana: "しゅん",
  type: "名词",
  meaning: "应季，时令。",
  example: "$\\overset{いま}{今}$が$\\overset{しゅん}{旬}$の$\\overset{さかな}{魚}$を$\\overset{りょうり}{料理}$する。/烹饪现在正当季的鱼。"
},
{
  word: "バス停",
  kana: "ばすてい",
  type: "名词",
  meaning: "公交车站（「バス停留所」的略称）。",
  example: "バス$\\overset{てい}{停}$で$\\overset{ふた}{二}$つ$\\overset{め}{目}$のバスを$\\overset{ま}{待}$つ。/在公交车站等第二趟公交车。"
},
{
  word: "発生",
  kana: "はっせい",
  type: "名・サ变动词する自",
  meaning: "发生，产生。",
  example: "$\\overset{じこ}{事故}$の$\\overset{はっせい}{発生}$を$\\overset{ふせ}{防}$ぐ。/防止事故的发生。 || $\\overset{ひさん}{悲惨}$な$\\overset{じけん}{事件}$が$\\overset{はっせい}{発生}$した。/发生了悲惨的案件。"
},
{
  word: "悲惨",
  kana: "ひさん",
  type: "形动",
  meaning: "悲惨的。",
  example: "$\\overset{せんそう}{戦争}$の$\\overset{ひさん}{悲惨}$な$\\overset{けっか}{結果}$にめそめそ$\\overset{な}{泣}$く。/面对战争的悲惨结果低声哭泣。"
},
{
  word: "笛",
  kana: "ふえ",
  type: "名词",
  meaning: "笛子，口哨。",
  example: "$\\overset{おお}{大}$きな$\\overset{おと}{音}$で$\\overset{ふえ}{笛}$を$\\overset{ふ}{吹}$く。/很大声地吹笛子（吹哨）。"
},
{
  word: "不幸",
  kana: "ふこう",
  type: "名・形动",
  meaning: "不幸。",
  example: "$\\overset{かれ}{彼}$の$\\overset{ふこう}{不幸}$に$\\overset{どうじょう}{同情}$する。/同情他的不幸。 || $\\overset{ふこう}{不幸}$な$\\overset{できごと}{出来事}$が$\\overset{つづ}{続}$く。/不幸的事情接连不断。"
},
{
  word: "二つ目",
  kana: "ふたつめ",
  type: "名词",
  meaning: "第二个。",
  example: "$\\overset{ふた}{二}$つ$\\overset{め}{目}$の$\\overset{かど}{角}$を$\\overset{みぎ}{右}$に$\\overset{ま}{曲}$がる。/在第二个拐角向右转。"
},
{
  word: "不動産屋",
  kana: "ふどうさんや",
  type: "名词",
  meaning: "房地产中介，房产公司。",
  example: "$\\overset{ふどうさんや}{不動産屋}$で$\\overset{あたら}{新}$しい$\\overset{いえ}{家}$を$\\overset{さが}{探}$す。/在房地产中介寻找新家。"
},
{
  word: "不満",
  kana: "ふまん",
  type: "名・形动",
  meaning: "不满。",
  example: "$\\overset{きゅうりょう}{給料}$に$\\overset{ふまん}{不満}$を$\\overset{も}{持}$つ。/对工资抱有不满。 || $\\overset{ふまん}{不満}$な$\\overset{かお}{顔}$をして$\\overset{だま}{黙}$る。/带着不满的表情沉默着。"
},
{
  word: "枚",
  kana: "まい",
  type: "量词",
  meaning: "张，枚（用于薄平的物品）。",
  example: "$\\overset{かみ}{紙}$を$\\overset{じゅう}{十}$$\\overset{まい}{枚}$ください。/请给我十张纸。"
},
{
  word: "満開",
  kana: "まんかい",
  type: "名・サ变动词する自",
  meaning: "盛开，满开。",
  example: "$\\overset{さくら}{桜}$が$\\overset{まんかい}{満開}$の$\\overset{きせつ}{季節}$になった。/到了樱花盛开的季节。 || $\\overset{こうえん}{公園}$の$\\overset{はな}{花}$が$\\overset{まんかい}{満開}$する。/公园的花盛开了。"
},
{
  word: "未熟",
  kana: "みじゅく",
  type: "名・形动",
  meaning: "未成熟，不熟练。",
  example: "$\\overset{ぎじゅつ}{技術}$の$\\overset{みじゅく}{未熟}$さを$\\overset{はんせい}{反省}$する。/反省技术的未成熟。 || $\\overset{わたし}{私}$はまだ$\\overset{みじゅく}{未熟}$な$\\overset{がくせい}{学生}$だ。/我还是个不成熟的学生。"
},
{
  word: "剥く",
  kana: "むく",
  type: "五段他动词",
  meaning: "剥，削。",
  example: "$\\overset{くだもの}{果物}$の$\\overset{かわ}{皮}$を$\\overset{きれい}{綺麗}$に$\\overset{む}{剥}$く。/把水果皮剥得干干净净。"
},
{
  word: "めそめそ",
  kana: "めそめそ",
  type: "副词・サ变动词する自",
  meaning: "低声哭泣，软弱地哭。",
  example: "めそめそ$\\overset{な}{泣}$くのはやめなさい。/不要再低声哭泣了。 || $\\overset{しっぱい}{失敗}$してめそめそする。/失败了就哭哭啼啼的。"
},
{
  word: "余地",
  kana: "よち",
  type: "名词",
  meaning: "余地。",
  example: "この$\\overset{けいかく}{計画}$にはまだ$\\overset{かいぜん}{改善}$の$\\overset{よち}{余地}$がある。/这个计划还有改善的余地。"
},
{
  word: "間",
  kana: "あいだ",
  type: "名词",
  meaning: "期间，之间；空间，间隔。",
  example: "$\\overset{わたし}{私}$と$\\overset{かれ}{彼}$の$\\overset{あいだ}{間}$には、$\\overset{あさ}{浅}$い$\\overset{かわ}{川}$が$\\overset{なが}{流}$れている。/我和他之间，流淌着一条浅浅的河。"
},
{
  word: "浅い",
  kana: "あさい",
  type: "形容词",
  meaning: "浅的。",
  example: "あそこの$\\overset{あさ}{浅}$い$\\overset{うみ}{海}$で$\\overset{こども}{子供}$たちが$\\overset{あそ}{遊}$ぶ。/孩子们在那边那片浅海里玩耍。"
},
{
  word: "あそこ",
  kana: "あそこ",
  type: "代词",
  meaning: "那里，那儿。",
  example: "あそこで$\\overset{あつ}{熱}$いお$\\overset{ちゃ}{茶}$を$\\overset{の}{飲}$んで$\\overset{やす}{休}$む。/在那里喝杯热茶休息一下。"
},
{
  word: "遊ぶ",
  kana: "あそぶ",
  type: "五段自动词",
  meaning: "玩，玩耍。",
  example: "いくつになっても、$\\overset{ともだち}{友達}$と$\\overset{あそ}{遊}$ぶのは$\\overset{たの}{楽}$しい。/无论多大年纪，和朋友玩耍总是很快乐。"
},
{
  word: "熱い",
  kana: "あつい",
  type: "形容词",
  meaning: "热的（指温度、液体等）；热情的。",
  example: "$\\overset{あつ}{熱}$いお$\\overset{ゆ}{湯}$で$\\overset{て}{手}$を$\\overset{あら}{洗}$う。/用热水洗手。"
},
{
  word: "洗う",
  kana: "あらう",
  type: "五段他动词",
  meaning: "洗，洗涤。",
  example: "$\\overset{いま}{今}$、おじさんが$\\overset{くるま}{車}$を$\\overset{きれい}{綺麗}$に$\\overset{あら}{洗}$っている。/现在，叔叔正在把车洗干净。"
},
{
  word: "いくつ",
  kana: "いくつ",
  type: "名词・副词",
  meaning: "几个；几岁。",
  example: "リンゴをいくつ$\\overset{か}{買}$うか、$\\overset{おと}{音}$を$\\overset{だ}{出}$さずに$\\overset{かぞ}{数}$える。/不出声地数要买几个苹果。"
},
{
  word: "今",
  kana: "いま",
  type: "名词・副词",
  meaning: "现在。",
  example: "$\\overset{いま}{今}$、$\\overset{おもしろ}{面白}$い$\\overset{ほん}{本}$を$\\overset{か}{買}$って$\\overset{よ}{読}$んでいる。/现在，买了一本有趣的书正在看。"
},
{
  word: "おじさん",
  kana: "おじさん",
  type: "名词",
  meaning: "叔叔，伯伯，中年男子。",
  example: "おじさんが$\\overset{おもしろ}{面白}$い$\\overset{はな}{話}$しをしてくれた。/大叔给我讲了有趣的故事。"
},
{
  word: "音",
  kana: "おと",
  type: "名词",
  meaning: "声音。",
  example: "$\\overset{かぜ}{風}$の$\\overset{おと}{音}$がして、$\\overset{きゅう}{急}$に$\\overset{さむ}{寒}$くなった。/听到了风声，突然变冷了。"
},
{
  word: "面白い",
  kana: "おもしろい",
  type: "形容词",
  meaning: "有趣的，有意思的。",
  example: "この$\\overset{えいが}{映画}$は$\\overset{おもしろ}{面白}$いので、ＤＶＤを$\\overset{か}{買}$う。/这部电影很有趣，所以去买DVD。"
},
{
  word: "買う",
  kana: "かう",
  type: "五段他动词",
  meaning: "买，购买。",
  example: "$\\overset{かぜ}{風邪}$を$\\overset{ひ}{引}$いたので、$\\overset{くすり}{薬}$を$\\overset{か}{買}$う。/因为感冒了，所以去买药。"
},
{
  word: "風邪",
  kana: "かぜ",
  type: "名词",
  meaning: "感冒。",
  example: "$\\overset{かぜ}{風邪}$で$\\overset{あたま}{頭}$が$\\overset{おも}{重}$く、$\\overset{かみ}{髪}$を$\\overset{あら}{洗}$うのも$\\overset{だる}{怠}$い。/因为感冒头很沉，连洗头发都觉得浑身乏力。"
},
{
  word: "髪",
  kana: "かみ",
  type: "名词",
  meaning: "头发。",
  example: "$\\overset{かみ}{髪}$を$\\overset{き}{切}$って、$\\overset{きぶん}{気分}$が$\\overset{かる}{軽}$くなった。/剪了头发，心情变得轻松了。"
},
{
  word: "軽い",
  kana: "かるい",
  type: "形容词",
  meaning: "轻的；轻松的。",
  example: "$\\overset{かる}{軽}$い$\\overset{うんどう}{運動}$をしてから、$\\overset{しけん}{試験}$を$\\overset{がんば}{頑張}$る。/做做轻微的运动，然后努力考试。"
},
{
  word: "頑張る",
  kana: "がんばる",
  type: "五段自动词",
  meaning: "努力，拼命，坚持。",
  example: "これをきっかけに、もっと$\\overset{べんきょう}{勉強}$を$\\overset{がんば}{頑張}$る。/以此为契机，更加努力地学习。"
},
{
  word: "きっかけ",
  kana: "きっかけ",
  type: "名词",
  meaning: "契机，开端，借口。",
  example: "$\\overset{くさ}{草}$を$\\overset{み}{見}$たのがきっかけで、$\\overset{しぜん}{自然}$に$\\overset{きょうみ}{興味}$を$\\overset{も}{持}$った。/看到草成了契机，让我对自然产生了兴趣。"
},
{
  word: "草",
  kana: "くさ",
  type: "名词",
  meaning: "草。",
  example: "$\\overset{くさ}{草}$の$\\overset{おお}{多}$い$\\overset{みち}{道}$を$\\overset{くるま}{車}$で$\\overset{はし}{走}$る。/开车行驶在杂草丛生的路上。"
},
{
  word: "車",
  kana: "くるま",
  type: "名词",
  meaning: "汽车，车。",
  example: "$\\overset{くるま}{車}$で$\\overset{こ}{濃}$い$\\overset{きり}{霧}$の$\\overset{なか}{中}$を$\\overset{すす}{進}$む。/开车在浓雾中前进。"
},
{
  word: "濃い",
  kana: "こい",
  type: "形容词",
  meaning: "浓的，稠的。",
  example: "$\\overset{こ}{濃}$いお$\\overset{ちゃ}{茶}$を$\\overset{の}{飲}$んで、$\\overset{ここの}{九}$つの$\\overset{もんだい}{問題}$を$\\overset{と}{解}$く。/喝了浓茶，解答了九个问题。"
},
{
  word: "九つ",
  kana: "ここのつ",
  type: "名词",
  meaning: "九个；九岁。",
  example: "$\\overset{しま}{島}$に$\\overset{ここの}{九}$つの$\\overset{ちい}{小}$さな$\\overset{むら}{村}$がある。/岛上有九个小村庄。"
},
{
  word: "島",
  kana: "しま",
  type: "名词",
  meaning: "岛，岛屿。",
  example: "その$\\overset{しま}{島}$は$\\overset{すこ}{少}$し$\\overset{はな}{離}$れたところにある。/那个岛在稍微远一点的地方。"
},
{
  word: "少し",
  kana: "すこし",
  type: "名・副词",
  meaning: "一点儿，稍微。",
  example: "$\\overset{きょう}{今日}$は$\\overset{すこ}{少}$し$\\overset{つか}{疲}$れたが、$\\overset{すば}{素晴}$らしい$\\overset{いちにち}{一日}$だった。/今天虽然稍微有点累，但是极好的一天。"
},
{
  word: "素晴らしい",
  kana: "すばらしい",
  type: "形容词",
  meaning: "极好的，出色的。",
  example: "$\\overset{すば}{素晴}$らしい$\\overset{けしき}{景色}$が$\\overset{たちまち}{忽ち}$$\\overset{め}{目}$の$\\overset{まえ}{前}$に$\\overset{ひろ}{広}$がる。/极好的景色瞬间在眼前展现开来。"
},
{
  word: "忽ち",
  kana: "たちまち",
  type: "副词",
  meaning: "转瞬间，忽然。",
  example: "$\\overset{たの}{楽}$しい$\\overset{じかん}{時間}$は$\\overset{たちまち}{忽ち}$$\\overset{す}{過}$ぎ$\\overset{さ}{去}$る。/快乐的时光转瞬即逝。"
},
{
  word: "楽しい",
  kana: "たのしい",
  type: "形容词",
  meaning: "快乐的，愉快的。",
  example: "$\\overset{たの}{楽}$しい$\\overset{りょこう}{旅行}$のあとで、$\\overset{からだ}{体}$が$\\overset{だる}{怠}$い。/快乐的旅行之后，身体很乏力。"
},
{
  word: "怠い",
  kana: "だるい",
  type: "形容词",
  meaning: "乏力的，倦怠的。",
  example: "$\\overset{からだ}{体}$が$\\overset{だる}{怠}$いので、ちょっと$\\overset{やす}{休}$みたい。/因为身体乏力，所以想稍微休息一下。"
},
{
  word: "ちょっと",
  kana: "ちょっと",
  type: "副词",
  meaning: "稍微，一点儿。",
  example: "ちょっと$\\overset{つよ}{強}$い$\\overset{かぜ}{風}$が$\\overset{ふ}{吹}$いている。/吹着稍微有点强的风。"
},
{
  word: "強い",
  kana: "つよい",
  type: "形容词",
  meaning: "强的，强烈的。",
  example: "どちらが$\\overset{つよ}{強}$いか、$\\overset{しあい}{試合}$で$\\overset{き}{決}$める。/哪边更强，在比赛中决定。"
},
{
  word: "どちら",
  kana: "どちら",
  type: "代词",
  meaning: "哪边，哪一个。",
  example: "どちらの$\\overset{とり}{鳥}$が$\\overset{な}{鳴}$いているのかわからない。/不知道是哪只鸟在叫。"
},
{
  word: "鳴く",
  kana: "なく",
  type: "五段自动词",
  meaning: "鸣叫（动物、昆虫等）。",
  example: "$\\overset{はる}{春}$になるころ、$\\overset{とり}{鳥}$が$\\overset{うつく}{美}$しく$\\overset{な}{鳴}$く。/快到春天的时候，鸟儿鸣叫得很动听。"
},
{
  word: "なる",
  kana: "なる",
  type: "五段自动词",
  meaning: "变成，成为。",
  example: "$\\overset{にし}{西}$の$\\overset{そら}{空}$が$\\overset{くら}{暗}$くなる。/西边的天空变暗了。"
},
{
  word: "西",
  kana: "にし",
  type: "名词",
  meaning: "西边，西方。",
  example: "$\\overset{にし}{西}$から$\\overset{あめ}{雨}$が$\\overset{ふ}{降}$り、$\\overset{ふく}{服}$が$\\overset{ぬれ}{濡}$れる。/从西边下起雨来，衣服淋湿了。"
},
{
  word: "濡れる",
  kana: "ぬれる",
  type: "一段自动词",
  meaning: "淋湿，弄湿。",
  example: "$\\overset{ぬれ}{濡}$れたまま、$\\overset{はし}{橋}$を$\\overset{わた}{渡}$って$\\overset{はたけ}{畑}$に$\\overset{い}{行}$く。/就那么淋湿着，过了桥去田里。"
},
{
  word: "橋",
  kana: "はし",
  type: "名词",
  meaning: "桥。",
  example: "$\\overset{はや}{早}$い$\\overset{なが}{流}$れの$\\overset{かわ}{川}$に$\\overset{はし}{橋}$がかかっている。/水流湍急的河上架着桥。"
},
{
  word: "畑",
  kana: "はたけ",
  type: "名词",
  meaning: "旱田，田地。",
  example: "$\\overset{はれ}{晴}$れると、$\\overset{はたけ}{畑}$で$\\overset{ひと}{一}$つ$\\overset{ひと}{一}$つ$\\overset{やさい}{野菜}$を$\\overset{しゅうかく}{収穫}$する。/天气一放晴，就在田里一个一个地收获蔬菜。"
},
{
  word: "早い",
  kana: "はやい",
  type: "形容词",
  meaning: "早的；快的。",
  example: "$\\overset{あさ}{朝}$$\\overset{はや}{早}$い$\\overset{じかん}{時間}$から$\\overset{そら}{空}$が$\\overset{はれ}{晴}$れる。/从清晨很早开始，天空就放晴了。"
},
{
  word: "晴れる",
  kana: "はれる",
  type: "一段自动词",
  meaning: "晴朗，放晴。",
  example: "$\\overset{はれ}{晴}$れた$\\overset{ひ}{日}$に、$\\overset{まど}{窓}$を$\\overset{ふ}{拭}$く。/在晴天擦窗户。"
},
{
  word: "一つ",
  kana: "ひとつ",
  type: "名词",
  meaning: "一个。",
  example: "$\\overset{ひと}{一}$つ$\\overset{ぬの}{布}$を$\\overset{と}{取}$って、$\\overset{つくえ}{机}$を$\\overset{ふ}{拭}$く。/拿一块布擦桌子。"
},
{
  word: "拭く",
  kana: "ふく",
  type: "五段他动词",
  meaning: "擦，揩。",
  example: "$\\overset{ふゆ}{冬}$になると、$\\overset{まど}{窓}$の$\\overset{けつろ}{結露}$をほとんど$\\overset{まいにち}{毎日}$$\\overset{ふ}{拭}$く。/一到冬天，几乎每天都要擦窗户上的结露。"
},
{
  word: "冬",
  kana: "ふゆ",
  type: "名词",
  meaning: "冬天。",
  example: "$\\overset{ふゆ}{冬}$の$\\overset{ひるま}{昼間}$は$\\overset{みじか}{短}$い。/冬天的白天很短。"
},
{
  word: "ほとんど",
  kana: "ほとんど",
  type: "名・副词",
  meaning: "大部分，几乎。",
  example: "$\\overset{しごと}{仕事}$のほとんどが$\\overset{お}{終}$わった。/工作的大部分都结束了。 || $\\overset{かれ}{彼}$の$\\overset{かみ}{髪}$はほとんど$\\overset{みじか}{短}$い。/他的头发几乎都很短。"
},
{
  word: "短い",
  kana: "みじかい",
  type: "形容词",
  meaning: "短的。",
  example: "$\\overset{みじか}{短}$い$\\overset{みみ}{耳}$を$\\overset{も}{持}$つ$\\overset{いぬ}{犬}$が$\\overset{むっ}{六}$ついる。/有六只长着短耳朵的狗。"
},
{
  word: "耳",
  kana: "みみ",
  type: "名词",
  meaning: "耳朵。",
  example: "$\\overset{むら}{村}$の$\\overset{うわさ}{噂}$が$\\overset{みみ}{耳}$に$\\overset{はい}{入}$る。/村里的传闻传到了耳朵里。"
},
{
  word: "六つ",
  kana: "むっつ",
  type: "名词",
  meaning: "六个；六岁。",
  example: "$\\overset{むら}{村}$の$\\overset{ひと}{人}$からリンゴを$\\overset{むっ}{六}$つもらう。/从村里人那里拿了（得到）六个苹果。"
},
{
  word: "村",
  kana: "むら",
  type: "名词",
  meaning: "村子，村庄。",
  example: "$\\overset{むら}{村}$の$\\overset{しごと}{仕事}$を$\\overset{やす}{休}$んで、$\\overset{やっ}{八}$つの$\\overset{ゆ}{湯}$を$\\overset{めぐ}{巡}$る。/向村里的工作请假，去巡游八个温泉。"
},
{
  word: "もらう",
  kana: "もらう",
  type: "五段他动词",
  meaning: "得到，领取。",
  example: "お$\\overset{こづかい}{小遣い}$をもらって、ちょっと$\\overset{やす}{休}$む。/拿了零花钱，稍微休息一下。"
},
{
  word: "休む",
  kana: "やすむ",
  type: "五段自他动词",
  meaning: "休息，请假。",
  example: "$\\overset{つか}{疲}$れたので、$\\overset{き}{木}$の$\\overset{した}{下}$で$\\overset{やす}{休}$む。/因为累了，在树下休息。 || $\\overset{かぜ}{風邪}$で$\\overset{がっこう}{学校}$を$\\overset{やす}{休}$む。/因为感冒向学校请假。"
},
{
  word: "八つ",
  kana: "やっつ",
  type: "名词",
  meaning: "八个；八岁。",
  example: "$\\overset{やっ}{八}$つの$\\overset{ゆめ}{夢}$を$\\overset{も}{持}$って$\\overset{おとな}{大人}$になる。/怀揣着八个梦想长大成人。"
},
{
  word: "湯",
  kana: "ゆ",
  type: "名词",
  meaning: "热水，开水；洗澡水，温泉。",
  example: "$\\overset{よなか}{夜中}$に$\\overset{あつ}{熱}$い$\\overset{ゆ}{湯}$を$\\overset{わ}{沸}$かす。/在半夜烧开水。"
},
{
  word: "夢",
  kana: "ゆめ",
  type: "名词",
  meaning: "梦，梦想。",
  example: "$\\overset{よなか}{夜中}$に$\\overset{ふしぎ}{不思議}$な$\\overset{ゆめ}{夢}$を$\\overset{み}{見}$た。/在半夜做了一个不可思议的梦。"
},
{
  word: "夜中",
  kana: "よなか",
  type: "名词",
  meaning: "半夜，深夜。",
  example: "$\\overset{よなか}{夜中}$にわずかな$\\overset{おと}{音}$が$\\overset{き}{聞}$こえた。/半夜听到了一丝微弱的声音。"
},
{
  word: "わずか",
  kana: "わずか",
  type: "名・形动・副词",
  meaning: "一点点，仅仅。",
  example: "$\\overset{のこ}{残}$りはわずかだ。/剩下的只有一点点了。 || わずかな$\\overset{あぶら}{油}$で$\\overset{りょうり}{料理}$する。/用很少的油做菜。 || $\\overset{いえ}{家}$までわずか$\\overset{ご}{五}$$\\overset{ふん}{分}$の$\\overset{きょり}{距離}$だ。/到家仅仅只有五分钟的距离。"
},
{
  word: "油",
  kana: "あぶら",
  type: "名词",
  meaning: "油。",
  example: "$\\overset{いえ}{家}$で$\\overset{あぶら}{油}$を$\\overset{つか}{使}$って$\\overset{にく}{肉}$を$\\overset{や}{焼}$く。/在家里用油烤肉。"
},
{
  word: "家",
  kana: "いえ",
  type: "名词",
  meaning: "家，房子。",
  example: "$\\overset{いえ}{家}$の$\\overset{まわ}{周}$りの$\\overset{けしき}{景色}$が$\\overset{きせつ}{季節}$とともに$\\overset{うつ}{移}$り$\\overset{か}{変}$わる。/房子周围的景色随着季节变迁。"
},
{
  word: "移り変わる",
  kana: "うつりかわる",
  type: "五段自动词",
  meaning: "变迁，演变。",
  example: "$\\overset{じだい}{時代}$が$\\overset{うつ}{移}$り$\\overset{か}{変}$わっても、$\\overset{き}{木}$の$\\overset{えだ}{枝}$は$\\overset{おな}{同}$じように$\\overset{の}{伸}$びる。/即使时代变迁，树枝依然同样地伸长。"
},
{
  word: "枝",
  kana: "えだ",
  type: "名词",
  meaning: "树枝。",
  example: "$\\overset{おか}{可笑}$しい$\\overset{かたち}{形}$の$\\overset{えだ}{枝}$を$\\overset{み}{見}$つける。/发现了一根形状滑稽（可笑）的树枝。"
},
{
  word: "可笑しい",
  kana: "おかしい",
  type: "形容词",
  meaning: "可笑的，滑稽的；不正常的。",
  example: "$\\overset{かれ}{彼}$は$\\overset{おか}{可笑}$しい$\\overset{かお}{顔}$をして$\\overset{にお}{匂}$いを$\\overset{か}{嗅}$ぐ。/他做着滑稽的表情闻味道。"
},
{
  word: "嗅ぐ",
  kana: "かぐ",
  type: "五段他动词",
  meaning: "闻，嗅。",
  example: "$\\overset{かど}{角}$を$\\overset{ま}{曲}$がると、いい$\\overset{にお}{匂}$いを$\\overset{か}{嗅}$いだ。/拐过街角，闻到了好闻的味道。"
},
{
  word: "角（其一）",
  kana: "かど",
  type: "名词",
  meaning: "拐角，角落。",
  example: "$\\overset{つぎ}{次}$の$\\overset{かど}{角}$を$\\overset{ま}{曲}$がって$\\overset{さか}{坂}$を$\\overset{のぼ}{上}$る。/在下一个拐角转弯上坡。"
},
{
  word: "腰",
  kana: "こし",
  type: "名词",
  meaning: "腰。",
  example: "$\\overset{こし}{腰}$が$\\overset{いた}{痛}$いので、$\\overset{こま}{細}$かい$\\overset{さぎょう}{作業}$は$\\overset{さ}{避}$ける。/因为腰痛，所以避开细致的工作。"
},
{
  word: "細かい",
  kana: "こまかい",
  type: "形容词",
  meaning: "细小的，细致的，零碎的（钱）。",
  example: "$\\overset{こま}{細}$かいお$\\overset{かね}{金}$を$\\overset{も}{持}$って$\\overset{さか}{坂}$を$\\overset{くだ}{下}$る。/带着零钱下坡。"
},
{
  word: "坂",
  kana: "さか",
  type: "名词",
  meaning: "坡，坡道。",
  example: "$\\overset{さか}{坂}$を$\\overset{のぼ}{上}$って$\\overset{あせ}{汗}$をかいたので、さっぱりしたい。/爬了坡出了汗，所以想清爽一下（洗个澡等）。"
},
{
  word: "さっぱり",
  kana: "さっぱり",
  type: "副词・サ变动词する自",
  meaning: "清爽，痛快；（后接否定）完全不。",
  example: "$\\overset{かれ}{彼}$の$\\overset{い}{言}$うことはさっぱりわからない。/他说的东西我完全不懂。 || シャワーを$\\overset{あ}{浴}$びてさっぱりする。/洗个淋浴清爽一下。"
},
{
  word: "触る",
  kana: "さわる",
  type: "五段自动词",
  meaning: "触摸，触碰。",
  example: "$\\overset{あつ}{熱}$い$\\overset{した}{舌}$で$\\overset{こおり}{氷}$に$\\overset{さわ}{触}$る。/用热舌头触碰冰块。"
},
{
  word: "舌",
  kana: "した",
  type: "名词",
  meaning: "舌头。",
  example: "$\\overset{しにせ}{老舗}$の$\\overset{りょうり}{料理}$を$\\overset{した}{舌}$で$\\overset{あじ}{味}$わう。/用舌头品尝老字号的料理。"
},
{
  word: "老舗",
  kana: "しにせ",
  type: "名词",
  meaning: "老字号，老店。",
  example: "$\\overset{しにせ}{老舗}$の$\\overset{てんいん}{店員}$は$\\overset{せ}{背}$が$\\overset{たか}{高}$い。/老字号的店员个子很高。"
},
{
  word: "背",
  kana: "せ",
  type: "名词",
  meaning: "身高，后背。",
  example: "$\\overset{かれ}{彼}$の$\\overset{せ}{背}$の$\\overset{そば}{傍}$に$\\overset{た}{立}$って$\\overset{ほん}{本}$を$\\overset{と}{閉}$じる。/站在他的后背旁边合上书。"
},
{
  word: "傍・側",
  kana: "そば",
  type: "名词",
  meaning: "旁边，附近。",
  example: "$\\overset{はは}{母}$の$\\overset{そば}{傍}$で$\\overset{ほん}{本}$を$\\overset{と}{閉}$じて$\\overset{ねむ}{眠}$る。/在妈妈旁边合上书睡觉。"
},
{
  word: "閉じる",
  kana: "とじる",
  type: "一段自他动词",
  meaning: "闭，合。",
  example: "$\\overset{じどう}{自動}$ドアが$\\overset{と}{閉}$じる。/自动门关上了。 || $\\overset{め}{目}$を$\\overset{と}{閉}$じて、どんどん$\\overset{そうぞう}{想像}$する。/闭上眼睛，不断地想象。"
},
{
  word: "どんどん",
  kana: "どんどん",
  type: "副词",
  meaning: "连续不断地，顺利地。",
  example: "$\\overset{なべ}{鍋}$の$\\overset{りょうり}{料理}$をどんどん$\\overset{た}{食}$べて$\\overset{ふと}{太}$る。/不停地吃锅里的菜，然后变胖了。"
},
{
  word: "鍋",
  kana: "なべ",
  type: "名词",
  meaning: "锅，火锅。",
  example: "$\\overset{まご}{孫}$と$\\overset{いっしょ}{一緒}$に$\\overset{なべ}{鍋}$を$\\overset{かこ}{囲}$む。/和孙子一起围着吃火锅。"
},
{
  word: "太る",
  kana: "ふとる",
  type: "五段自动词",
  meaning: "变胖，发福。",
  example: "$\\overset{ふと}{太}$った$\\overset{まご}{孫}$が$\\overset{まめ}{豆}$を$\\overset{た}{食}$べる。/胖胖的孙子吃着豆子。"
},
{
  word: "孫",
  kana: "まご",
  type: "名词",
  meaning: "孙子，孙女。",
  example: "もし$\\overset{まご}{孫}$がわがままを$\\overset{い}{言}$ったら、$\\overset{ちゅうい}{注意}$する。/如果孙子任性的话，我会提醒他的。"
},
{
  word: "豆",
  kana: "まめ",
  type: "名词",
  meaning: "豆，豆子。",
  example: "もし$\\overset{まめ}{豆}$が$\\overset{す}{好}$きなら、どうぞ$\\overset{た}{食}$べてください。/如果喜欢豆子的话，请吃吧。"
},
{
  word: "もし",
  kana: "もし",
  type: "副词",
  meaning: "如果，假如。",
  example: "もし$\\overset{いたずら}{悪戯}$をしたら、$\\overset{ゆる}{許}$さない。/如果恶作剧的话，我可不原谅。"
},
{
  word: "わがまま",
  kana: "わがまま",
  type: "名・形动",
  meaning: "任性，肆意妄为。",
  example: "$\\overset{こども}{子供}$のわがままを$\\overset{き}{聞}$く。/听孩子的任性要求。 || わがままな$\\overset{いたずら}{悪戯}$に$\\overset{こま}{困}$る。/对任性的恶作剧感到头疼。"
},
{
  word: "悪戯",
  kana: "いたずら",
  type: "名・形动・サ变动词する自",
  meaning: "恶作剧，淘气。",
  example: "$\\overset{うみべ}{海辺}$で$\\overset{こども}{子供}$の$\\overset{いたずら}{悪戯}$を$\\overset{しか}{叱}$る。/在海边训斥恶作剧的孩子。 || $\\overset{おじ}{叔父}$の$\\overset{くつ}{靴}$を$\\overset{かく}{隠}$して$\\overset{いたずら}{悪戯}$する。/把叔叔的鞋藏起来恶作剧。"
},
{
  word: "海辺",
  kana: "うみべ",
  type: "名词",
  meaning: "海边。",
  example: "$\\overset{おじ}{叔父}$と$\\overset{いっしょ}{一緒}$に$\\overset{うみべ}{海辺}$を$\\overset{さんぽ}{散歩}$する。/和叔叔一起在海边散步。"
},
{
  word: "叔父・伯父",
  kana: "おじ",
  type: "名词",
  meaning: "叔叔，伯伯。",
  example: "$\\overset{おじ}{叔父}$が$\\overset{ふた}{二}$つの$\\overset{くみ}{組}$を$\\overset{つく}{作}$って$\\overset{さけ}{叫}$ぶ。/叔叔分成了两组并大声呼喊。"
},
{
  word: "組み",
  kana: "くみ",
  type: "名词",
  meaning: "班，组。",
  example: "$\\overset{あたら}{新}$しい$\\overset{くみ}{組}$で$\\overset{しまぐに}{島国}$について$\\overset{まな}{学}$ぶ。/在新的班组里学习关于岛国的事情。"
},
{
  word: "叫ぶ",
  kana: "さけぶ",
  type: "五段自动词",
  meaning: "叫喊，呼叫。",
  example: "$\\overset{おおごえ}{大声}$で$\\overset{さけ}{叫}$んでも、$\\overset{すこ}{少}$しも$\\overset{き}{気}$にしない。/即使大声叫喊，也一点都不在意。"
},
{
  word: "島国",
  kana: "しまぐに",
  type: "名词",
  meaning: "岛国。",
  example: "$\\overset{にほん}{日本}$は$\\overset{しまぐに}{島国}$だから、$\\overset{すこ}{少}$しも$\\overset{うみ}{海}$から$\\overset{はな}{離}$れられない。/因为日本是岛国，所以一点也离不开海。"
},
{
  word: "少しも",
  kana: "すこしも",
  type: "副词",
  meaning: "（后接否定）一点也不，丝毫没……。",
  example: "$\\overset{まいにち}{毎日}$$\\overset{すこ}{少}$しずつ$\\overset{べんきょう}{勉強}$しても、$\\overset{すこ}{少}$しも$\\overset{つか}{疲}$れない。/即使每天一点一点地学习，也一点都不觉得累。"
},
{
  word: "ずつ",
  kana: "ずつ",
  type: "副助词",
  meaning: "每……，各……（表示均等分配）。",
  example: "$\\overset{こども}{子供}$を$\\overset{だ}{抱}$きながら、お$\\overset{かし}{菓子}$を$\\overset{ひと}{一}$つずつ$\\overset{わ}{分}$ける。/一边抱着孩子，一边把点心一个一个地分发。"
},
{
  word: "抱く",
  kana: "だく",
  type: "五段他动词",
  meaning: "抱，搂抱。",
  example: "$\\overset{あか}{赤}$ちゃんを$\\overset{だ}{抱}$いて、$\\overset{だま}{騙}$すように$\\overset{ね}{寝}$かしつける。/抱着婴儿，像哄骗一样哄他入睡。"
},
{
  word: "騙す",
  kana: "だます",
  type: "五段他动词",
  meaning: "骗，欺骗。",
  example: "$\\overset{ひと}{人}$を$\\overset{だま}{騙}$すのはよくない。/骗人是不好的。"
},
{
  word: "力強い",
  kana: "ちからづよい",
  type: "形容词",
  meaning: "强有力的，有底气的。",
  example: "$\\overset{ちからづよ}{力強}$い$\\overset{あしど}{足取}$りで$\\overset{かぎょう}{家業}$を$\\overset{つ}{継}$ぐ。/迈着强有力的步伐继承家业。"
},
{
  word: "継ぐ",
  kana: "つぐ",
  type: "五段他动词",
  meaning: "继承，接替。",
  example: "$\\overset{こめ}{米}$の$\\overset{つぶ}{粒}$を$\\overset{のこ}{残}$さず$\\overset{た}{食}$べる$\\overset{でんとう}{伝統}$を$\\overset{つ}{継}$ぐ。/继承不剩一粒米吃饭的传统。"
},
{
  word: "粒",
  kana: "つぶ",
  type: "名词",
  meaning: "粒，颗粒。",
  example: "どうぞ、この$\\overset{ひと}{一}$$\\overset{つぶ}{粒}$の$\\overset{あめ}{飴}$を$\\overset{た}{食}$べてください。/请吃这一粒糖。"
},
{
  word: "どうぞ",
  kana: "どうぞ",
  type: "副词",
  meaning: "请（表请求、恳求）。",
  example: "$\\overset{とき}{時}$には$\\overset{つか}{疲}$れるでしょうから、どうぞ$\\overset{やす}{休}$んでください。/有时候会累的吧，所以请休息一下。"
},
{
  word: "時に",
  kana: "ときに",
  type: "副词",
  meaning: "偶尔，有时。",
  example: "$\\overset{とき}{時}$には「はい」と$\\overset{すなお}{素直}$に$\\overset{い}{言}$うことも$\\overset{たいせつ}{大切}$だ。/有时候坦率地说一句“是的”也很重要。"
},
{
  word: "はい",
  kana: "はい",
  type: "感叹词",
  meaning: "是的，对。",
  example: "「はい」と$\\overset{こた}{答}$えて、$\\overset{ほお}{頬}$を$\\overset{あか}{赤}$くする。/回答了一句“是的”，然后脸颊红了。"
},
{
  word: "頬",
  kana: "ほお",
  type: "名词",
  meaning: "脸颊。",
  example: "$\\overset{ほお}{頬}$を$\\overset{たた}{叩}$く、または$\\overset{かお}{顔}$を$\\overset{あら}{洗}$って$\\overset{め}{目}$を$\\overset{さ}{覚}$ます。/拍拍脸颊，或者洗把脸来清醒一下。"
},
{
  word: "または",
  kana: "または",
  type: "接续词",
  meaning: "或者。",
  example: "バス、または$\\overset{でんしゃ}{電車}$で$\\overset{き}{来}$てください。/请坐公交车或者电车来。"
},
{
  word: "まだまだ",
  kana: "まだまだ",
  type: "副词",
  meaning: "还，仍然（表示程度不够）。",
  example: "$\\overset{まわ}{回}$りの$\\overset{ひと}{人}$に$\\overset{くら}{比}$べて、$\\overset{わたし}{私}$の$\\overset{せいせき}{成績}$はまだまだだ。/和周围的人相比，我的成绩还差得远。"
},
{
  word: "回り",
  kana: "まわり",
  type: "名词",
  meaning: "周围，转圈。",
  example: "$\\overset{いけ}{池}$の$\\overset{まわ}{回}$りを$\\overset{さんぽ}{散歩}$しても$\\overset{よろ}{宜}$しいですか。/可以在池塘周围散步吗？"
},
{
  word: "宜しい",
  kana: "よろしい",
  type: "形容词",
  meaning: "好，可以（「よい」的郑重说法）。",
  example: "お$\\overset{ちゃ}{茶}$の$\\overset{かお}{香}$りが$\\overset{よろ}{宜}$しいですね。/茶的香气真不错啊。"
},
{
  word: "香り",
  kana: "かおり",
  type: "名词",
  meaning: "香气，香味。",
  example: "$\\overset{かぜぐすり}{風邪薬}$と$\\overset{よ}{良}$い$\\overset{かお}{香}$りのするお$\\overset{ちゃ}{茶}$を$\\overset{の}{飲}$む。/喝了感冒药和散发着好闻香气的茶。"
},
{
  word: "風邪薬",
  kana: "かぜぐすり",
  type: "名词",
  meaning: "感冒药。",
  example: "$\\overset{かぜぐすり}{風邪薬}$を$\\overset{の}{飲}$んで、$\\overset{ゆめ}{夢}$を$\\overset{かな}{叶}$えるために$\\overset{がんば}{頑張}$る。/吃了感冒药，为了实现梦想而努力。"
},
{
  word: "叶える",
  kana: "かなえる",
  type: "一段他动词",
  meaning: "实现，使如愿以偿。",
  example: "$\\overset{ねが}{願}$いを$\\overset{かな}{叶}$えるために、$\\overset{あたら}{新}$しい$\\overset{かみがた}{髪型}$にする。/为了实现愿望，换了个新发型。"
},
{
  word: "髪型",
  kana: "かみがた",
  type: "名词",
  meaning: "发型。",
  example: "$\\overset{あたら}{新}$しい$\\overset{かみがた}{髪型}$にしたら、$\\overset{すこ}{少}$し$\\overset{はず}{恥}$ずかしい$\\overset{きみ}{気味}$だ。/换了新发型后，觉得有点害羞。"
},
{
  word: "気味",
  kana: "ぎみ",
  type: "接尾词・名词",
  meaning: "有点……的感觉，倾向；心情，感觉。",
  example: "$\\overset{きょう}{今日}$は$\\overset{すこ}{少}$し$\\overset{かぜ}{風邪}$$\\overset{ぎみ}{気味}$だ。/今天感觉有点感冒。 || $\\overset{こしかけ}{腰掛け}$が$\\overset{こわ}{壊}$れて$\\overset{わる}{悪}$い$\\overset{きみ}{気味}$がする。/凳子坏了，感觉心情很糟糕（恶心）。"
},
{
  word: "腰掛け",
  kana: "こしかけ",
  type: "名词",
  meaning: "凳子，座位。",
  example: "$\\overset{しお}{潮}$の$\\overset{かお}{香}$りがする$\\overset{うみべ}{海辺}$の$\\overset{こしかけ}{腰掛け}$に$\\overset{すわ}{座}$る。/坐在散发着海潮气味的海边凳子上。"
},
{
  word: "潮",
  kana: "しお",
  type: "名词",
  meaning: "潮水，海潮。",
  example: "$\\overset{しお}{潮}$の$\\overset{おと}{音}$を$\\overset{き}{聞}$きながら$\\overset{しょうぎ}{将棋}$を$\\overset{さ}{指}$す。/一边听着潮水声一边下象棋。"
},
{
  word: "将棋",
  kana: "しょうぎ",
  type: "名词",
  meaning: "日本象棋。",
  example: "$\\overset{しょうぎ}{将棋}$を$\\overset{さ}{指}$した$\\overset{あと}{後}$で$\\overset{はたけ}{畑}$を$\\overset{たがや}{耕}$す。/下完象棋之后去耕田。"
},
{
  word: "耕す",
  kana: "たがやす",
  type: "五段他动词",
  meaning: "耕（田）。",
  example: "$\\overset{うし}{牛}$の$\\overset{つの}{角}$に$\\overset{ふれ}{触}$れながら$\\overset{はたけ}{畑}$を$\\overset{たがや}{耕}$す。/一边摸着牛角一边耕田。"
},
{
  word: "角（其二）",
  kana: "つの",
  type: "名词",
  meaning: "角（动物的角）。",
  example: "$\\overset{つの}{角}$のある$\\overset{どうぶつ}{動物}$が$\\overset{へいわ}{平和}$を$\\overset{とな}{唱}$えるわけがない。/长着角的动物不可能倡导和平。"
},
{
  word: "唱える",
  kana: "となえる",
  type: "一段他动词",
  meaning: "念，诵；提倡，高呼。",
  example: "$\\overset{はちうえ}{鉢植え}$の$\\overset{まえ}{前}$で$\\overset{じゅもん}{呪文}$を$\\overset{とな}{唱}$える。/在盆栽前面念咒语。"
},
{
  word: "鉢植え",
  kana: "はちうえ",
  type: "名词",
  meaning: "盆栽。",
  example: "$\\overset{はちうえ}{鉢植え}$に$\\overset{みず}{水}$をやって、$\\overset{あせ}{汗}$でびっしょりになる。/给盆栽浇水，弄得浑身大汗淋漓。"
},
{
  word: "びっしょり",
  kana: "びっしょり",
  type: "副词・サ变动词する自",
  meaning: "湿透。",
  example: "$\\overset{あめ}{雨}$に$\\overset{ふ}{降}$られて、$\\overset{ふく}{服}$がびっしょりと$\\overset{ぬれ}{濡}$れた。/被雨淋了，衣服完全湿透了。 || $\\overset{べんごし}{弁護士}$が$\\overset{あせ}{汗}$でびっしょりする。/律师满头大汗（汗水湿透）。"
},
{
  word: "弁護士",
  kana: "べんごし",
  type: "名词",
  meaning: "律师。",
  example: "$\\overset{べんごし}{弁護士}$が$\\overset{まどべ}{窓辺}$で$\\overset{かんが}{考}$え$\\overset{こと}{事}$をしている。/律师在窗边思考事情。"
},
{
  word: "窓辺",
  kana: "まどべ",
  type: "名词",
  meaning: "窗边。",
  example: "$\\overset{まどべ}{窓辺}$に$\\overset{た}{立}$って、$\\overset{そと}{外}$の$\\overset{けしき}{景色}$を$\\overset{なが}{眺}$める。/站在窗边，眺望外面的景色。"
}


];

const Gojuon = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ".split('');
