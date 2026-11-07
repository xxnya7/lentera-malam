import { test } from 'node:test';
import assert from 'node:assert/strict';
import { currentStreak, addDays } from './streak.js';

const T = '2026-11-10';
test('belum pernah membaca', () => assert.equal(currentStreak(new Set(), T), 0));
test('berlanjut dari kemarin, hari ini belum', () => assert.equal(currentStreak(new Set(['2026-11-08', '2026-11-09']), T), 2));
test('hari ini sudah, ikut dihitung', () => assert.equal(currentStreak(new Set(['2026-11-09', T]), T), 2));
test('putus dua hari lalu', () => assert.equal(currentStreak(new Set(['2026-11-07', '2026-11-08']), T), 0));
test('melewati akhir bulan', () => assert.equal(addDays('2026-12-01', -1), '2026-11-30'));
