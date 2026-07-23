'use strict';

const assert = require('node:assert/strict');
const utils = require('../core-utils.js');

assert.equal(Object.isFrozen(utils), true);
assert.equal(utils.escapeHTML('<钟日 & "AI"\'>'), '&lt;钟日 &amp; &quot;AI&quot;&#39;&gt;');
assert.equal(utils.escapeHTML(0), '');
assert.equal(utils.escapeRegExp('a+b?.[c]'), 'a\\+b\\?\\.\\[c\\]');

const source = {
    nested: { value: 1 },
    list: ['ja', 'en']
};
const cloned = utils.cloneDataValue(source);
cloned.nested.value = 2;
cloned.list.push('zh');
assert.deepEqual(source, {
    nested: { value: 1 },
    list: ['ja', 'en']
});

assert.equal(utils.hashStableText('钟日'), utils.hashStableText('钟日'));
assert.notEqual(utils.hashStableText('钟日'), utils.hashStableText('钟月'));
assert.equal(
    utils.normalizeEntryText('  Ａ\u00A0B\u200B  '),
    'A B'
);
assert.equal(utils.normalizeEntryText('Ａ', false), 'Ａ');

const sseEvents = [];
const sseParser = utils.createSSEDataParser(data => {
    sseEvents.push(data);
});

sseParser.push('data: {"choices":[{"delta":{"cont');
sseParser.push('ent":"钟"}}]}\n\ndata: {"choices":');
sseParser.push('[{"delta":{"content":"日"}}]}\r\n\r\n');
sseParser.push('data: first line\ndata: second');
sseParser.push(' line');
sseParser.finish();

assert.deepEqual(sseEvents, [
    '{"choices":[{"delta":{"content":"钟"}}]}',
    '{"choices":[{"delta":{"content":"日"}}]}',
    'first line\nsecond line'
]);

console.log('公共工具模块测试通过');
