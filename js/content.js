// Ждем пока Chrome APIs станут доступны
function waitForChromeAPI() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      resolve();
    } else {
      setTimeout(() => waitForChromeAPI().then(resolve), 100);
    }
  });
}

let startTime = Date.now();
let isActive = true;

// Инициализация после загрузки API
waitForChromeAPI().then(() => {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (isActive) {
        saveTimeSpent();
        isActive = false;
      }
    } else {
      startTime = Date.now();
      isActive = true;
    }
  });

  window.addEventListener('beforeunload', () => {
    if (isActive) {
      saveTimeSpent();
    }
  });

  setInterval(() => {
    if (isActive) {
      saveTimeSpent();
      startTime = Date.now();
    }
  }, 30000);
});

function saveTimeSpent() {
  if (!chrome.storage || !chrome.storage.local) {
    console.warn('Chrome storage API not available');
    return;
  }

  const timeSpent = Date.now() - startTime;

  chrome.storage.local.get(['totalTime', 'sessions'], (result) => {
    const totalTime = (result.totalTime || 0) + timeSpent;
    const sessions = result.sessions || [];

    sessions.push({
      date: new Date().toISOString().split('T')[0],
      duration: timeSpent,
      timestamp: Date.now()
    });

    const recentSessions = sessions.slice(-30);

    chrome.storage.local.set({
      totalTime: totalTime,
      sessions: recentSessions
    });
  });
}
