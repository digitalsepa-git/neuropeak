import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScoreResult } from '@neuropeak/core';

const STORAGE_KEY = 'neuropeak.testResults.v1';

/** En son bu kadar sonuç cihazda tutulur; gerisi buluttan okunur. */
const MAX_STORED_RESULTS = 50;

export type StoredTestResult = {
  id: string;
  testId: string;
  completedAt: string;
  score: ScoreResult;
};

export async function loadTestResults(): Promise<StoredTestResult[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw === null ? [] : (JSON.parse(raw) as StoredTestResult[]);
  } catch {
    return [];
  }
}

export async function saveTestResult(result: StoredTestResult): Promise<void> {
  try {
    const existing = await loadTestResults();
    const next = [result, ...existing].slice(0, MAX_STORED_RESULTS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Sonuç yazılamazsa ekranda gösterilmeye devam eder; yalnızca geçmişe
    // girmez. Buluta gönderim ayrı kuyrukta.
  }
}

export async function latestResultFor(testId: string): Promise<StoredTestResult | undefined> {
  const results = await loadTestResults();
  return results.find((result) => result.testId === testId);
}
