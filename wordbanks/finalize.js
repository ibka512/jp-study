/** 钟日词库统一收尾。支持按语言分批加载后重复执行。 */
(function (root) {
  /*
   * 词库文件只存"每条都不一样"的字段：语言、内置标记、默认难度这些能在收尾阶段
   * 补出来的内容不再逐词写入，词库体积因此小一截。
   */
  const applyDefaults = (words, language, idPrefix) => {
    words.forEach((word, index) => {
      word._id = word._id || `${idPrefix}-${String(index + 1).padStart(6, '0')}`;
      word.lang = language;
      word.level = word.level || '';
      word.difficulty = Number.isInteger(word.difficulty) ? word.difficulty : 0;
      word.tags = Array.isArray(word.tags) ? word.tags : [];
      word.builtIn = true;
    });
  };

  const finalize = () => {
    if (typeof DefaultWords !== 'undefined') {
      applyDefaults(DefaultWords, 'ja', 'ja-built-in');
    }

    if (typeof DefaultEnglishWords !== 'undefined') {
      applyDefaults(DefaultEnglishWords, 'en', 'en-built-in');
    }
  };

  root.ZhongriFinalizeWordbanks = finalize;
  finalize();
})(typeof globalThis !== 'undefined' ? globalThis : this);
