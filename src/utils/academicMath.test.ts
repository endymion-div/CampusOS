import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAttendanceForecast,
  calculateAttendancePct,
  calculateCGPA,
  calculateSGPA,
  getAttendanceStatus,
  simulateAttendanceScenario,
} from './academicMath';
import type { SemesterRecord } from '../types/campus';

const DEFAULT_SCALE: Record<string, number> = {
  O: 10,
  'A+': 9,
  A: 8,
  'B+': 7,
  B: 6,
  C: 5,
  P: 4,
  F: 0,
};

test('calculateAttendancePct handles normal and zero conducted classes', () => {
  assert.equal(calculateAttendancePct(18, 25), 72);
  assert.equal(calculateAttendancePct(0, 0), 100);
  assert.equal(calculateAttendancePct(30, 25), 100);
});

test('calculateAttendanceForecast calculates exact classes needed to reach 75%', () => {
  // 18/25 = 72% -> (18 + 3) / (25 + 3) = 21/28 = 75%
  const forecast = calculateAttendanceForecast(18, 25, 75);
  assert.equal(forecast.currentPct, 72);
  assert.equal(forecast.classesNeededToReach, 3);
  assert.equal(forecast.canMissSafely, 0);
  assert.equal(forecast.status, 'critical');
});

test('calculateAttendanceForecast calculates classes that can be missed safely above 75%', () => {
  // 24/25 = 96% -> 24 / 0.75 = 32 -> can miss 32 - 25 = 7 classes
  const forecast = calculateAttendanceForecast(24, 25, 75);
  assert.equal(forecast.currentPct, 96);
  assert.equal(forecast.classesNeededToReach, 0);
  assert.equal(forecast.canMissSafely, 7);
  assert.equal(forecast.status, 'safe');
});

test('getAttendanceStatus classifies safe, warning, and critical thresholds', () => {
  assert.equal(getAttendanceStatus(82, 75), 'safe');
  assert.equal(getAttendanceStatus(76, 75), 'warning');
  assert.equal(getAttendanceStatus(72, 75), 'critical');
});

test('simulateAttendanceScenario calculates projected attendance percentage', () => {
  // 18/25 -> attend 5, miss 0 => 23/30 = 76.7%
  assert.equal(simulateAttendanceScenario(18, 25, 5, 0), 76.7);
  // 18/25 -> attend 0, miss 2 => 18/27 = 66.7%
  assert.equal(simulateAttendanceScenario(18, 25, 0, 2), 66.7);
});

test('calculateSGPA computes weighted average accurately', () => {
  const result = calculateSGPA(
    [
      { credits: 4, grade: 'O' },  // 40
      { credits: 4, grade: 'A+' }, // 36
      { credits: 3, grade: 'A' },  // 24
    ],
    DEFAULT_SCALE
  );
  // 100 / 11 = 9.09
  assert.equal(result.totalCredits, 11);
  assert.equal(result.totalPoints, 100);
  assert.equal(result.sgpa, 9.09);
});

test('calculateCGPA computes weighted cumulative GPA across semesters', () => {
  const semesters: SemesterRecord[] = [
    {
      id: 'sem-1',
      name: 'Semester 1',
      semesterNumber: 1,
      courses: [
        { id: 'c1', subject: 'Math', credits: 4, grade: 'O' }, // 40
        { id: 'c2', subject: 'Programming', credits: 4, grade: 'A+' }, // 36 -> SGPA = 9.50 (8 credits)
      ],
    },
    {
      id: 'sem-2',
      name: 'Semester 2',
      semesterNumber: 2,
      courses: [
        { id: 'c3', subject: 'DSA', credits: 4, grade: 'A' }, // 32 -> SGPA = 8.00 (4 credits)
      ],
    },
  ];
  const result = calculateCGPA(semesters, DEFAULT_SCALE);
  // (9.5 * 8 + 8.0 * 4) / 12 = 108 / 12 = 9.0
  assert.equal(result.totalCredits, 12);
  assert.equal(result.cgpa, 9);
});
