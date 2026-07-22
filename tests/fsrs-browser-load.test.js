const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const context = vm.createContext({ console, Date, setTimeout, clearTimeout });
context.globalThis = context;
context.self = context;

vm.runInContext(fs.readFileSync('vendor/ts-fsrs.umd.js', 'utf8'), context, { filename: 'ts-fsrs.umd.js' });
assert.ok(context.FSRS, '浏览器 UMD 应暴露 window.FSRS');

vm.runInContext(fs.readFileSync('fsrs-scheduler.js', 'utf8'), context, { filename: 'fsrs-scheduler.js' });
assert.ok(context.ZhongriFsrsScheduler, '浏览器环境应成功初始化调度适配层');
assert.strictEqual(context.ZhongriFsrsScheduler.rating('good'), context.FSRS.Rating.Good);
console.log('FSRS 浏览器加载测试通过');
