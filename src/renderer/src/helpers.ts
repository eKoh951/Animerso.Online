// electronHelpers.ts
export function isElectron() {
  return navigator.userAgent.toLowerCase().includes(' electron/');
}

export async function registerServiceWorker(scriptUrl: string) {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register(scriptUrl, {
        scope: './'
      });
      return reg;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}
