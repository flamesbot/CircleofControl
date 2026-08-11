const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const htmlPath = path.resolve(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const dom = new JSDOM(htmlContent, { runScripts: 'dangerously' });
const window = dom.window;

// We need to extract the logic to test it.
// Wait, the findHint function is on the window object because it's defined in the global scope?
// Let's verify if findHint is available.
const findHint = window.findHint;

test('findHint', async (t) => {
  await t.test('returns correct hint for valid word matches', () => {
    // "sleep" is a keyword for the first hint
    const hint = findHint("I can't sleep at night");
    assert.ok(hint.includes('Sleep is highly controllable'));
  });

  await t.test('returns correct hint for valid word matches (case insensitive)', () => {
    const hint = findHint("I CAN'T SLEEP AT NIGHT");
    assert.ok(hint.includes('Sleep is highly controllable'));
  });

  await t.test('returns correct hint for multiple keywords, matches first word', () => {
    const hint = findHint("rest is important");
    assert.ok(hint.includes('Sleep is highly controllable'));
  });

  await t.test('returns correct hint for another category', () => {
    const hint = findHint("need to go to the gym");
    assert.ok(hint.includes('Movement is one of the highest-leverage controllables'));
  });

  await t.test('returns correct hint for partial matches (includes)', () => {
    // findHint uses `w=>low.includes(w)`, so "sleeping" matches "sleep"
    const hint = findHint("sleeping is hard");
    assert.ok(hint.includes('Sleep is highly controllable'));
  });

  await t.test('returns null when there is no match', () => {
    const hint = findHint("completely random text with no keywords");
    assert.strictEqual(hint, null);
  });

  await t.test('handles empty string gracefully', () => {
    const hint = findHint("");
    assert.strictEqual(hint, null);
  });
});
