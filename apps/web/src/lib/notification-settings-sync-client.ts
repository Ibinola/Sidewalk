import type { PersistentUserSettingsInput } from '@sidewalk/shared';

const STORAGE_KEY = 'sidewalk_notification_settings_v1';
const SYNC_STATUS_KEY = 'sidewalk_sync_status_v1';
const DEVICE_LIST_KEY = 'sidewalk_device_list_v1';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export interface DeviceEntry {
  deviceId: string;
  deviceName: string;
  lastSyncedAtIso: string;
  isCurrentDevice: boolean;
}

interface SyncState {
  status: SyncStatus;
  lastSyncedAtIso: string | null;
  error: string | null;
}

export function saveLocalNotificationSettings(settings: PersistentUserSettingsInput): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
}

export function getLocalNotificationSettings(): PersistentUserSettingsInput | null {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  }
  return null;
}

export function getSyncState(): SyncState {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(SYNC_STATUS_KEY);
    if (raw) return JSON.parse(raw);
  }
  return { status: 'idle', lastSyncedAtIso: null, error: null };
}

export function setSyncState(state: SyncState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(state));
  }
}

export function resolveConflict(
  local: PersistentUserSettingsInput,
  remote: PersistentUserSettingsInput,
): PersistentUserSettingsInput {
  const localTime = new Date(local.lastSyncedAtIso).getTime();
  const remoteTime = new Date(remote.lastSyncedAtIso).getTime();
  return remoteTime >= localTime ? remote : local;
}

export async function syncSettings(
  settings: PersistentUserSettingsInput,
  syncFn: (s: PersistentUserSettingsInput) => Promise<PersistentUserSettingsInput>,
): Promise<PersistentUserSettingsInput> {
  const previousLocal = getLocalNotificationSettings();
  setSyncState({ status: 'syncing', lastSyncedAtIso: null, error: null });

  try {
    const remoteSettings = await syncFn(settings);
    const localSettings = getLocalNotificationSettings();
    const resolved = localSettings ? resolveConflict(localSettings, remoteSettings) : remoteSettings;

    saveLocalNotificationSettings(resolved);
    setSyncState({ status: 'synced', lastSyncedAtIso: new Date().toISOString(), error: null });

    return resolved;
  } catch (err) {
    if (previousLocal) {
      saveLocalNotificationSettings(previousLocal);
    }
    const message = err instanceof Error ? err.message : 'Sync failed';
    setSyncState({ status: 'error', lastSyncedAtIso: null, error: message });
    throw err;
  }
}

export function getDeviceList(): DeviceEntry[] {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(DEVICE_LIST_KEY);
    if (raw) return JSON.parse(raw);
  }
  return [];
}

export function addDevice(entry: DeviceEntry): void {
  const devices = getDeviceList();
  const existing = devices.findIndex((d) => d.deviceId === entry.deviceId);
  if (existing >= 0) {
    devices[existing] = entry;
  } else {
    devices.push(entry);
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(DEVICE_LIST_KEY, JSON.stringify(devices));
  }
}

export function removeDevice(deviceId: string): void {
  const devices = getDeviceList().filter((d) => d.deviceId !== deviceId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(DEVICE_LIST_KEY, JSON.stringify(devices));
  }
}
