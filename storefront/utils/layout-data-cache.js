const layoutDataCache = new Map();

export function resolveLayoutData(key, result, fallbackValue) {
  if (result.status === 'fulfilled' && result.value != null) {
    layoutDataCache.set(key, result.value);
    return result.value;
  }

  if (result.status === 'rejected') {
    console.error(`[Layout data unavailable: ${key}]`, result.reason);
  }

  return layoutDataCache.get(key) ?? fallbackValue;
}
