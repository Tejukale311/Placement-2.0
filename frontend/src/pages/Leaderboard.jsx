import { useState, useEffect } from 'react';
import { leaderboardAPI } from '../services/api';
import { Trophy, Medal, User, Star, Loader2, Crown, Flame, TrendingUp } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter]);

  const fetchLeaderboard = async () => {
    try {
      const response = timeFilter === 'weekly'
        ? await leaderboardAPI.getWeekly()
        : await leaderboardAPI.getAll({ limit: 50 });

      if (response.data.success) {
        setLeaderboard(response.data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-slate-500 dark:text-slate-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Leaderboard
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Top performers in our placement preparation community
          </p>
        </div>

        {/* Filters */}
        <div className="tabs">
          <button
            onClick={() => setTimeFilter('all')}
            className={`tab ${timeFilter === 'all' ? 'active' : ''}`}
          >
            <Flame className="w-4 h-4 inline mr-2" />
            All Time
          </button>
          <button
            onClick={() => setTimeFilter('weekly')}
            className={`tab ${timeFilter === 'weekly' ? 'active' : ''}`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            This Week
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Second Place */}
          <div className="card p-6 text-center order-2 md:order-1 md:mt-8">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {leaderboard[1]?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-md">
                <Medal className="w-5 h-5 text-slate-100" />
              </div>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1">
              {leaderboard[1]?.name}
            </h3>
            <p className="text-2xl font-bold text-slate-400 mb-1">#2</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-primary-500">{leaderboard[1]?.score}</span>
              <span className="text-xs text-slate-500">pts</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">{leaderboard[1]?.testsCompleted} tests</p>
          </div>

          {/* First Place */}
          <div className="card card-elevated p-6 text-center order-1 md:order-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <Trophy className="w-10 h-10 text-amber-500 animate-float" />
            </div>
            <div className="relative inline-block mb-4 mt-6">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-amber-500/30 ring-4 ring-amber-100 dark:ring-amber-900/30">
                {leaderboard[0]?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                <span className="text-lg">👑</span>
              </div>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-xl mb-1">
              {leaderboard[0]?.name}
            </h3>
            <p className="text-3xl font-bold text-amber-500 mb-2">#1</p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-lg shadow-primary-500/25">
              <Star className="w-5 h-5 text-white" />
              <span className="font-bold text-white text-lg">{leaderboard[0]?.score}</span>
              <span className="text-xs text-white/80">points</span>
            </div>
            <p className="text-sm text-slate-500 mt-3">{leaderboard[0]?.testsCompleted} tests completed</p>
          </div>

          {/* Third Place */}
          <div className="card p-6 text-center order-3 md:mt-12">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-orange-300 to-orange-500 dark:from-orange-700 dark:to-orange-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {leaderboard[2]?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md">
                <Medal className="w-5 h-5 text-orange-100" />
              </div>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1">
              {leaderboard[2]?.name}
            </h3>
            <p className="text-2xl font-bold text-orange-500 mb-1">#3</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full">
              <Star className="w-4 h-4 text-orange-500" />
              <span className="font-bold text-primary-500">{leaderboard[2]?.score}</span>
              <span className="text-xs text-slate-500">pts</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">{leaderboard[2]?.testsCompleted} tests</p>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Tests Completed
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.slice(3).map((entry, index) => (
                <tr key={entry._id} className="group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8">
                      <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-500 transition-colors">
                        {index + 4}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md">
                        {entry.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {entry.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                      <Star className="w-4 h-4 text-primary-500" />
                      <span className="font-bold text-primary-600 dark:text-primary-400">
                        {entry.score}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-slate-600 dark:text-slate-300">
                      {entry.testsCompleted} tests
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {leaderboard.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            No users yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Be the first to top the leaderboard!
          </p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

