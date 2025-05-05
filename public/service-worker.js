let timerInterval = null;
let timerState = {
  isStarted: false,
  isPaused: false,
  timeLeft: 0,
  timerType: 'focus',
  intervalsCompleted: 0,
  settings: {
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    intervals: 4
  }
};

function getDuration(type, settings) {
  return (type === 'focus'
    ? settings.focusTime
    : type === 'shortBreak'
    ? settings.shortBreak
    : settings.longBreak) * 60;
}

function saveState() {
  chrome.storage.local.set({ pomodoroState: timerState }, () => {
    chrome.runtime.sendMessage({
      type: 'STATE_UPDATE',
      state: timerState
    });
  });
}

function clearTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startTimer(type = 'focus') {
  clearTimer();
  timerState.timerType = type;
  timerState.isStarted = true;
  timerState.isPaused = false;
  timerState.timeLeft = getDuration(type, timerState.settings);
  saveState();

  timerInterval = setInterval(() => {
    if (!timerState.isPaused && timerState.isStarted) {
      timerState.timeLeft -= 1;
      if (timerState.timeLeft <= 0) {
        clearTimer();
        handleTimerEnd();
      }
      saveState();
    }
  }, 1000);
}

function stopTimer() {
  clearTimer();
  timerState.isStarted = false;
  timerState.isPaused = false;
  timerState.timeLeft = getDuration(timerState.timerType, timerState.settings);
  if (timerState.timerType === 'focus') timerState.intervalsCompleted = 0;
  saveState();
}

function pauseTimer() {
  timerState.isPaused = true;
  clearTimer();
  saveState();
}

function resumeTimer() {
  timerState.isPaused = false;
  saveState();
  timerInterval = setInterval(() => {
    if (!timerState.isPaused && timerState.isStarted) {
      timerState.timeLeft -= 1;
      if (timerState.timeLeft <= 0) {
        clearTimer();
        handleTimerEnd();
      }
      saveState();
    }
  }, 1000);
}

function handleTimerEnd() {
  if (timerState.timerType === 'focus') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Pomodoro Timer',
      message: 'Focus session finished! Take a break.'
    });
    timerState.intervalsCompleted += 1;
    if (timerState.intervalsCompleted < timerState.settings.intervals) {
      startTimer('shortBreak');
    } else {
      startTimer('longBreak');
    }
  } else if (timerState.timerType === 'shortBreak') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Pomodoro Timer',
      message: 'Break finished! Stay focused!'
    });
    startTimer('focus');
  } else if (timerState.timerType === 'longBreak') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Pomodoro Timer',
      message: 'Long break finished! Pomodoro cycle complete.'
    });
    timerState.intervalsCompleted = 0;
    timerState.isStarted = false;
    timerState.timeLeft = getDuration('focus', timerState.settings);
    timerState.timerType = 'focus';
    saveState();
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_STATE') {
    chrome.storage.local.get(['pomodoroState'], (result) => {
      sendResponse(result.pomodoroState || timerState);
    });
    return true;
  }
  if (msg.type === 'START_TIMER') {
    startTimer(msg.timerType || 'focus');
    sendResponse({ success: true });
  }
  if (msg.type === 'STOP_TIMER') {
    stopTimer();
    sendResponse({ success: true });
  }
  if (msg.type === 'PAUSE_TIMER') {
    pauseTimer();
    sendResponse({ success: true });
  }
  if (msg.type === 'RESUME_TIMER') {
    resumeTimer();
    sendResponse({ success: true });
  }
  if (msg.type === 'UPDATE_SETTINGS') {
    timerState.settings = msg.settings;
    saveState();
    sendResponse({ success: true });
  }
  if (msg.type === 'RESET_INTERVALS') {
    timerState.intervalsCompleted = 0;
    saveState();
    sendResponse({ success: true });
  }
});