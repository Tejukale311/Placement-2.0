import { useState } from 'react';
import { Save, Globe } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Placement Portal',
    allowRegistration: true,
    leaderboardEnabled: true
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage platform settings</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">General</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Site Name</label>
              <input type="text" value={settings.siteName} onChange={(e) => handleChange('siteName', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" />
            </div>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.allowRegistration} onChange={(e) => handleChange('allowRegistration', e.target.checked)} className="w-5 h-5 rounded" />
              <span>Allow Registration</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={settings.leaderboardEnabled} onChange={(e) => handleChange('leaderboardEnabled', e.target.checked)} className="w-5 h-5 rounded" />
              <span>Enable Leaderboard</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <Save size={18} />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
