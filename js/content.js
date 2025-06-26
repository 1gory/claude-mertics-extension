let startTime = Date.now();
let isActive = true;

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

function saveTimeSpent() {
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

setInterval(() => {
  if (isActive) {
    saveTimeSpent();
    startTime = Date.now();
  }
}, 30000);
