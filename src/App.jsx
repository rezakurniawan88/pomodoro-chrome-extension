import { useEffect, useState } from "react"
import SettingsModal from "./components/settings-modal";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';
import Logo from "./assets/logo.png";

function App() {
  const [state, setState] = useState({
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
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const handleStateUpdate = (msg) => {
      if (msg.type === 'STATE_UPDATE') {
        setState(msg.state);
      }
    };

    if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
      chrome.runtime.sendMessage({ type: 'GET_STATE' }, (res) => {
        if (res) setState(res);
      });
      chrome.runtime.onMessage.addListener(handleStateUpdate);
    }

    return () => {
      if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
        chrome.runtime.onMessage.removeListener(handleStateUpdate);
      }
    };
  }, []);

  const sendMessage = (msg) => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
      new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
    }
  }

  const startTimer = async () => {
    await sendMessage({ type: 'START_TIMER', timerType: 'focus' });
  };
  const stopTimer = async () => {
    await sendMessage({ type: 'STOP_TIMER' });
  };
  const togglePause = async () => {
    if (state.isPaused) {
      await sendMessage({ type: 'RESUME_TIMER' });
    } else {
      await sendMessage({ type: 'PAUSE_TIMER' });
    }
  };
  const updateSettings = async (settings) => {
    await sendMessage({ type: 'UPDATE_SETTINGS', settings });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const getMaxDuration = () => {
    const { timerType, settings } = state;
    return (timerType === 'focus'
      ? settings.focusTime
      : timerType === 'shortBreak'
      ? settings.shortBreak
      : settings.longBreak) * 60;
  };
  const progress = ((getMaxDuration() - state.timeLeft) / getMaxDuration()) * 100;

  return (
    <main className="flex flex-col justify-center items-center gap-8 w-80 h-[25rem] bg-gray-950 p-4 pt-0">
      <div className="flex justify-between items-center w-full px-1">
        <div className="flex items-center">
          <img src={Logo} alt="Pomodoro Logo" className="w-10 h-10" />
          <h1 className="text-lg text-white font-semibold">Pomodoro</h1>
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="rounded-xl p-3 hover:bg-gray-800/20 hover:cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>

      <div className="flex items-center justify-center">
      <div className="w-48 h-48">
        <CircularProgressbarWithChildren value={progress} strokeWidth={6}>
          <div className="text-center">
            <h1 className="font-bold text-4xl text-white">{formatTime(state.timeLeft)}</h1>
            <h1 className="font-semibold text-sm text-white/80">{state.timerType === 'focus' ? 'Focus Time' : 
              state.timerType === 'shortBreak' ? 'Short Break' : state.timerType === 'longBreak' ? 'Long Break' : null}</h1>
          </div>
        </CircularProgressbarWithChildren>
      </div>
      </div>

      <div className="flex gap-4">
        {state.isStarted ? (
          <>
            <button onClick={togglePause} className="bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-700 rounded-lg px-6 py-2.5 cursor-pointer">
              <h1 className="text-white font-semibold">{state.isPaused ? 'Resume' : 'Pause'}</h1>
            </button>
    
            <button onClick={stopTimer} className="bg-gradient-to-br from-rose-400 via-rose-600 to-rose-700 rounded-lg px-6 py-2.5 cursor-pointer">
              <h1 className="text-white font-semibold">Stop</h1>
            </button>
          </>
        ) : (
          <button onClick={startTimer} className="bg-gradient-to-br from-sky-400 via-sky-600 to-sky-700 rounded-lg px-6 py-3 cursor-pointer">
            <h1 className="text-white font-semibold">Start Session</h1>
          </button>
        )}
      </div>

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={state.settings}
          setSettings={updateSettings}
        />
      )}
    </main>
  )
}

export default App