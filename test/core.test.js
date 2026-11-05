import test from 'node:test';
import assert from 'node:assert/strict';

import { wrapBase64 } from '../src/core.js';
import { wrapBase64 as wrapBase64FromIndex } from '../src/index.js';

test('short input is returned unchanged (no trailing CRLF)', () => {
  const input = 'QUJD';
  assert.equal(wrapBase64(input), input);
});

test('input of exactly one line length is returned unchanged', () => {
  const input = 'A'.repeat(76);
  assert.equal(wrapBase64(input), input);
});

test('input of one line length plus one wraps after 76 characters', () => {
  const input = 'A'.repeat(77);
  assert.equal(wrapBase64(input), 'A'.repeat(76) + '\r\n' + 'A');
});

test('input of exactly two line lengths wraps once', () => {
  const input = 'A'.repeat(152);
  assert.equal(wrapBase64(input), 'A'.repeat(76) + '\r\n' + 'A'.repeat(76));
});

test('input of two line lengths plus one wraps twice', () => {
  const input = 'A'.repeat(153);
  assert.equal(
    wrapBase64(input),
    'A'.repeat(76) + '\r\n' + 'A'.repeat(76) + '\r\n' + 'A',
  );
});

test('custom line length is honoured', () => {
  const input = 'ABCDEFGHIJ';
  assert.equal(wrapBase64(input, 4), 'ABCD\r\nEFGH\r\nIJ');
});

test('line length of 1 inserts a CRLF between every character', () => {
  const input = 'ABC';
  assert.equal(wrapBase64(input, 1), 'A\r\nB\r\nC');
});

test('empty string is returned unchanged', () => {
  assert.equal(wrapBase64(''), '');
});

test('output uses CRLF, not bare LF', () => {
  const wrapped = wrapBase64('A'.repeat(77));
  assert.ok(wrapped.includes('\r\n'));
  assert.ok(!wrapped.includes('\n\n'));
  assert.ok(!/[^\r]\n/.test(wrapped));
});

test('rejects non-string input', () => {
  assert.throws(() => wrapBase64(null), TypeError);
  assert.throws(() => wrapBase64(undefined), TypeError);
  assert.throws(() => wrapBase64(123), TypeError);
});

test('rejects non-positive or non-integer line lengths', () => {
  assert.throws(() => wrapBase64('QUJD', 0), RangeError);
  assert.throws(() => wrapBase64('QUJD', -1), RangeError);
  assert.throws(() => wrapBase64('QUJD', 1.5), RangeError);
  assert.throws(() => wrapBase64('QUJD', NaN), RangeError);
});

test('rejects input that already contains CR or LF', () => {
  assert.throws(() => wrapBase64('QUJD\r\n'), Error);
  assert.throws(() => wrapBase64('QUJD\n'), Error);
  assert.throws(() => wrapBase64('\rQUJD'), Error);
});

test('index re-exports the same function', () => {
  assert.equal(wrapBase64FromIndex, wrapBase64);
});
