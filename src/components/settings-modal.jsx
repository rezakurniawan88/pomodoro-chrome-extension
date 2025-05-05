const SettingsModal = ({ isOpen, onClose, settings, setSettings }) => {
    if (!isOpen) return null;

    const handleSave = () => {
        setSettings({
          focusTime: parseInt(settings.focusTime),
          shortBreak: parseInt(settings.shortBreak),
          longBreak: parseInt(settings.longBreak),
          intervals: parseInt(settings.intervals)
        });
        onClose();
    };
  
    const handleChange = (e) => {
      setSettings({
        ...settings,
        [e.target.name]: parseInt(e.target.value) || 0
      });
    };
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30">
        <div className="bg-gray-950 px-8 py-4 rounded-lg w-80 h-96 overflow-y-auto">
        <div className="flex items-center w-full mb-4 -ml-3">
        <button onClick={onClose} className="rounded-xl p-3 hover:bg-gray-800/20 hover:cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m15 18-6-6 6-6"/></svg>
        </button>
          <h2 className="font-bold text-white text-lg ml-4">Pomodoro Settings</h2>
        </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-white/80 text-sm">Focus Time (minutes)</label>
              <input
                type="number"
                name="focusTime"
                value={settings.focusTime}
                onChange={handleChange}
                className="w-full bg-gray-800/60 text-white p-2 pl-3 mt-2 rounded"
              />
            </div>
            
            <div>
              <label className="text-white/80 text-sm">Short Break (minutes)</label>
              <input
                type="number"
                name="shortBreak"
                value={settings.shortBreak}
                onChange={handleChange}
                className="w-full bg-gray-800/60 text-white p-2 pl-3 mt-2 rounded"
              />
            </div>
            
            <div>
              <label className="text-white/80 text-sm">Long Break (minutes)</label>
              <input
                type="number"
                name="longBreak"
                value={settings.longBreak}
                onChange={handleChange}
                className="w-full bg-gray-800/60 text-white p-2 pl-3 mt-2 rounded"
              />
            </div>
            
            <div>
              <label className="text-white/80 text-sm">Intervals</label>
              <input
                type="number"
                name="intervals"
                value={settings.intervals}
                onChange={handleChange}
                className="w-full bg-gray-800/60 text-white p-2 pl-3 mt-2 rounded"
              />
            </div>
          </div>
  
          <button onClick={handleSave} className="mt-6 bg-gradient-to-br from-sky-400 via-sky-600 to-sky-700 rounded-lg font-bold text-white py-3 w-full hover:cursor-pointer hover:from-sky-500 hover:via-sky-700 hover:to-sky-800 transition duration-200"
          >Save</button>
        </div>
      </div>
    );
};

export default SettingsModal