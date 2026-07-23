'use strict';

const assert = require('node:assert/strict');
const release = require('../release-info.js');

assert.equal(Object.isFrozen(release), true);
assert.match(release.version, /^V\d+(?:\.\d+)?$/);
assert.match(release.build, /^\d{4}\.\d{2}\.\d{2}\.\d+$/);
assert.equal(Number.isNaN(new Date(release.publishedAt).getTime()), false);

console.log('发布信息模块测试通过');
