let sessionStartTime = Date.now();
let isActive = true;

// Сохраняем время начала текущей сессии
chrome.storage.local.set({
  currentSessionStart: sessionStartTime,
  isCurrentlyActive: true
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (isActive) {
      saveTimeSpent();
      isActive = false;
      chrome.storage.local.set({ isCurrentlyActive: false });
    }
  } else {
    sessionStartTime = Date.now();
    isActive = true;
    chrome.storage.local.set({
      currentSessionStart: sessionStartTime,
      isCurrentlyActive: true
    });
  }
});

window.addEventListener('beforeunload', () => {
  if (isActive) {
    saveTimeSpent();
    chrome.storage.local.set({ isCurrentlyActive: false });
  }
});

function saveTimeSpent() {
  const timeSpent = Date.now() - sessionStartTime;

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

// Сохраняем каждые 10 секунд
setInterval(() => {
  if (isActive) {
    saveTimeSpent();
    sessionStartTime = Date.now();
  }
}, 10000);
