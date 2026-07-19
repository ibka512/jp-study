/** 钟日词库统一收尾。 */
if (typeof DefaultWords !== 'undefined') {
  DefaultWords.forEach((word, index) => {
    word._id = word._id || `ja-built-in-${String(index + 1).padStart(6, '0')}`;
    word.level = word.level || '';
    word.difficulty = Number.isInteger(word.difficulty) ? word.difficulty : 0;
    word.tags = Array.isArray(word.tags) ? word.tags : [];
    word.builtIn = true;
  });
}

if (typeof DefaultEnglishWords !== 'undefined') {
  DefaultEnglishWords.forEach((word, index) => {
    word._id = word._id || `en-built-in-${String(index + 1).padStart(6, '0')}`;
    word.level = word.level || '';
    word.difficulty = Number.isInteger(word.difficulty) ? word.difficulty : 0;
    word.tags = Array.isArray(word.tags) ? word.tags : [];
    word.builtIn = true;
  });
}
