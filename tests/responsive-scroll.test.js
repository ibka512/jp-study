'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { loadApp } = require('./helpers/app-runtime');

// Run the real scroll/resize controller; only browser geometry and frame timing
// are supplied here. The real grid renderer is also exercised in browser QA.
function setup() {
    const { Controller, View, Model, context } = loadApp();
    const listeners = {};
    const frames = [];
    let width = 358;
    let resize;
    let renders = 0;
    const container = { getBoundingClientRect: () => ({ width }) };
    const tab = { classList: { contains: name => name === 'active' } };
    context.document.getElementById = () => tab;
    View.getEl = () => container;
    context.addEventListener = (name, callback) => { listeners[name] = callback; };
    context.setTimeout = callback => { resize = callback; return 1; };
    context.clearTimeout = () => {};
    context.requestAnimationFrame = callback => frames.push(callback);
    context.scrollY = 20000;
    context.innerWidth = 390;
    context.scrollTo = ({ top }) => { context.scrollY = top; };
    View.wordbankLayout = { cols: 2, rowHeight: 220, gridTop: 522, width };
    View.renderVirtualGrid = () => {
        renders++;
        View.wordbankLayout = width === 358
            ? { cols: 2, rowHeight: 220, gridTop: 522, width }
            : { cols: 3, rowHeight: 210, gridTop: 494, width };
    };
    Controller.setupVirtualScroll();
    return {
        context, View, Model, listeners,
        setWidth: value => { width = value; },
        resize: () => { listeners.resize(); resize(); },
        flush: () => { while (frames.length) frames.shift()(); },
        renders: () => renders
    };
}

test('旋转后保持原词条所在行，而非旧滚动像素位置', () => {
    const page = setup();
    page.setWidth(708);
    page.resize();
    page.flush();
    assert.equal(page.context.scrollY, 12792);
    assert.equal(page.View.wordbankLayout.cols, 3);
    assert.equal(page.Model.state.renderedStartIndex, -1);
    assert.equal(page.renders(), 2);
});

test('旋转同时触发 scroll 时保留旧布局，供 resize 恢复阅读位置', () => {
    const page = setup();
    page.setWidth(708);
    page.listeners.scroll();
    page.flush();
    assert.equal(page.renders(), 0);
    assert.equal(page.View.wordbankLayout.cols, 2);
    page.resize();
    page.flush();
    assert.equal(page.context.scrollY, 12792);
});

test('地址栏高度变化不重置词库；在词库顶部旋转也不会跳入列表', () => {
    const page = setup();
    page.resize();
    page.flush();
    assert.equal(page.renders(), 0);
    assert.equal(page.context.scrollY, 20000);
    page.context.scrollY = 100;
    page.setWidth(708);
    page.resize();
    page.flush();
    assert.equal(page.context.scrollY, 100);
});

test('桌面窗口逐像素调整后仍会恢复虚拟列表渲染', () => {
    const page = setup();
    page.setWidth(359);
    page.resize();
    page.flush();
    assert.equal(page.renders(), 2);
    assert.equal(page.View.wordbankLayout.width, 359);
});
