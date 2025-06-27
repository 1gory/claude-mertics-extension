function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    if (minutes === 0 && seconds === 0) {
      return `${hours}h`;
    } else if (seconds === 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    if (seconds === 0) {
      return `${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function updateStats() {
  chrome.storage.local.get(['totalTime', 'sessions'], (result) => {
    const totalTime = result.totalTime || 0;
    const sessions = result.sessions || [];

    document.getElementById('totalTime').textContent = formatTime(totalTime);
    document.getElementById('sessionsCount').textContent = sessions.length;

    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(session => session.date === today);
    const todayTime = todaySessions.reduce((sum, session) => sum + session.duration, 0);
    document.getElementById('todayTime').textContent = formatTime(todayTime);

    createChart(sessions);
  });
}

function createChart(sessions) {
  const chart = document.getElementById('chart');
  chart.innerHTML = '';

  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toISOString().split('T')[0],
      name: dayNames[date.getDay()]
    });
  }

  const dayTimes = days.map(day => {
    const daySessions = sessions.filter(session => session.date === day.date);
    return daySessions.reduce((sum, session) => sum + session.duration, 0);
  });

  const maxTime = Math.max(...dayTimes, 1);

  dayTimes.forEach((time, index) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    const height = Math.max((time / maxTime) * 100, 3);
    bar.style.height = `${height}%`;
    bar.title = `${days[index].name}: ${formatTime(time)}`;
    chart.appendChild(bar);
  });
}

document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all statistics? This action cannot be undone.')) {
    chrome.storage.local.clear(() => {
      updateStats();
    });
  }
});

updateStats();

// Обновляем статистику каждые 5 секунд для live обновления
setInterval(updateStats, 5000);
