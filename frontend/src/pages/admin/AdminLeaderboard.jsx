import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { RefreshCw, Trophy, Medal, Award } from 'lucide-react';

export default function AdminLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => { fetchLeaderboard(); }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getLeaderboard({ limit: 100 });
      setLeaderboard(res.data.leaderboard);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset the leaderboard? All scores and progress will be lost!')) {
      setResetting(true);
      try {
        await adminAPI.resetLeaderboard();
        alert('Leaderboard reset successfully!');
        fetchLeaderboard();
      } catch (e) { alert('Error resetting leaderboard'); }
      finally { setResetting(false); }
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-slate-500">{rank}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Leaderboard Management</h1>
          <p className="text-slate-500 dark:text-slate-400">View and manage user rankings</p>
        </div>
        <button onClick={handleReset} disabled={resetting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50">
          <RefreshCw size={18} className={resetting ? 'animate-spin' : ''} /> Reset Leaderboard
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tests Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Questions Solved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mx-auto"></div></td></tr>
              ) : leaderboard.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">No users found</td></tr>
              ) : (
                leaderboard.map((user, index) => (
                  <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(user.rank || index + 1)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{user.name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {user.userType?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{user.score || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{user.testsCompleted || 0}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{(user.totalQuestionsSolved || 0) + (user.totalCodingSolved || 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

