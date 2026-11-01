import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeQuestion, NAME_MAX, QUESTION_MAX } from '../lib/questions.js';

test('trims name and question', () => {
  const { value, error } = normalizeQuestion({ name: '  민수 ', question: ' 시험 범위가 어디까지인가요? ' });
  assert.equal(error, undefined);
  assert.deepEqual(value, { name: '민수', question: '시험 범위가 어디까지인가요?' });
});

test('rejects empty name', () => {
  assert.ok(normalizeQuestion({ name: ' ', question: 'q' }).error);
});

test('rejects empty question', () => {
  assert.ok(normalizeQuestion({ name: 'a', question: '' }).error);
});

test('rejects too long values', () => {
  assert.ok(normalizeQuestion({ name: 'a'.repeat(NAME_MAX + 1), question: 'q' }).error);
  assert.ok(normalizeQuestion({ name: 'a', question: 'q'.repeat(QUESTION_MAX + 1) }).error);
});

test('rejects missing body', () => {
  assert.ok(normalizeQuestion(undefined).error);
});
