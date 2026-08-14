import { WalkRecord } from '../types';

const STORAGE_KEY = 'spatial_walk_archive_records_v3';

export function getStoredRecords(): WalkRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load records from localStorage', e);
    return [];
  }
}

export function saveStoredRecords(records: WalkRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records to localStorage', e);
  }
}

export function initializeRecordsWithSamples(sampleRecords: WalkRecord[]): WalkRecord[] {
  const existing = getStoredRecords();
  if (existing.length === 0) {
    saveStoredRecords(sampleRecords);
    return sampleRecords;
  }
  return existing;
}

export function resetToSampleRecords(sampleRecords: WalkRecord[]): WalkRecord[] {
  saveStoredRecords(sampleRecords);
  return sampleRecords;
}

