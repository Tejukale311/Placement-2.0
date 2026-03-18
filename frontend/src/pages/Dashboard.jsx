import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, leaderboardAPI } from '../services/api';
import {
  Brain,
  Code,
  Building2,
  FileText,
  Trophy,
  Star,
  TrendingUp,
  Target,
  Clock,
  ArrowRight,
  Loader2,
  Zap,
  Award,
  Flame,
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, leaderboardRes] = await Promise.all([
        userAPI.getStats(),
        leaderboardAPI.getAll({ limit: 5 })
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (leaderboardRes.data.success) {
        setLeaderboard(leaderboardRes.data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Score',
      value: user?.score || 0,
      icon: Star,
      gradient: 'from-amber-400 to-orange-500',
      bgGradient: 'from-amber-500/20 to-orange-500/20',
      iconBg: 'from-amber-500 to-orange-600'
    },
    {
      label: 'Questions Solved',
      value: user?.totalQuestionsSolved || 0,
      icon: Brain,
      gradient: 'from-blue-400 to-indigo-500',
      bgGradient: 'from-blue-500/20 to-indigo-500/20',
      iconBg: 'from-blue-500 to-indigo-600'
    },
    {
      label: 'Coding Solved',
      value: user?.totalCodingSolved || 0,
      icon: Code,
      gradient: 'from-green-400 to-emerald-500',
      bgGradient: 'from-green-500/20 to-emerald-500/20',
      iconBg: 'from-green-500 to-emerald-600'
    },
    {
      label: 'Tests Completed',
      value: user?.testsCompleted || 0,
      icon: FileText,
      gradient: 'from-purple-400 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/20',
      iconBg: 'from-purple-500 to-pink-600'
    }
  ];

  const quickLinks = [
    { 
      title: 'Aptitude Practice', 
      desc: 'Quantitative, Logical & Verbal', 
      icon: Brain, 
      path: '/aptitude', 
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/25'
    },
    { 
      title: 'Coding Exercises', 
      desc: 'Practice programming problems', 
      icon: Code, 
      path: '/programming', 
      gradient: 'from-green-500 to-emerald-500',
      shadow: 'shadow-green-500/25'
    },
    { 
      title: 'Company Prep', 
      desc: 'Prepare for top companies', 
      icon: Building2, 
      path: '/companies', 
      gradient: 'from-purple-500 to-pink-500',
      shadow: 'shadow-purple-500/25'
    },
    { 
      title: 'Mock Tests', 
      desc: 'Test your knowledge', 
      icon: FileText, 
      path: '/mock-tests', 
      gradient: 'from-orange-500 to-red-500',
      shadow: 'shadow-orange-500/25'
    },
    { 
      title: 'Daily Challenge', 
      desc: 'Earn extra points', 
      icon: Trophy, 
      path: '/daily-challenge', 
      gradient: 'from-amber-500 to-yellow-500',
      shadow: 'shadow-amber-500/25'
    },
    { 
      title: 'Leaderboard', 
      desc: 'Compete with others', 
      icon: Flame, 
      path: '/leaderboard', 
      gradient: 'from-rose-500 to-pink-500',
      shadow: 'shadow-rose-500/25'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-slate-500 dark:text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 p-8 text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-white/80 text-lg max-w-xl">
                Ready to continue your placement preparation journey? Let's achieve your goals today!
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="font-semibold">{user?.score || 0} Points</span>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <Target className="w-4 h-4 text-green-300" />
              <span className="text-sm">{user?.totalQuestionsSolved || 0} Questions</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <Code className="w-4 h-4 text-blue-300" />
              <span className="text-sm">{user?.totalCodingSolved || 0} Solved</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <Award className="w-4 h-4 text-purple-300" />
              <span className="text-sm">{user?.testsCompleted || 0} Tests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="card card-hover p-5 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.iconBg} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-success-500">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">+12%</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Quick Actions
          </h2>
          <Link to="/profile" className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="group relative overflow-hidden card card-hover p-5"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${link.gradient} ${link.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <link.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-primary-500 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {link.desc}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Section - Leaderboard & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Top Performers
              </h3>
            </div>
            <Link to="/leaderboard" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {leaderboard.length > 0 ? leaderboard.map((entry, index) => (
              <div 
                key={entry._id} 
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:shadow-md ${
                  index < 3 ? 'bg-gradient-to-r ' : ''
                } ${
                  index === 0 ? 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' :
                  index === 1 ? 'from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50' :
                  index === 2 ? 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20' :
                  'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                  ${index === 0 ? 'rank-1' : ''}
                  ${index === 1 ? 'rank-2' : ''}
                  ${index === 2 ? 'rank-3' : ''}
                  ${index > 2 ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400' : ''}
                `}>
                  {entry.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-white truncate">
                    {entry.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {entry.testsCompleted} tests completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-500">{entry.score.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">points</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No leaderboard data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Your Progress */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Your Progress
              </h3>
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Aptitude Progress</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  {stats?.aptitude?.correct || 0} / {stats?.aptitude?.total || 100}
                </span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(((stats?.aptitude?.correct || 0) / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Coding Progress</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  {stats?.coding?.accepted || 0} / {stats?.coding?.total || 50}
                </span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(((stats?.coding?.accepted || 0) / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Mock Tests</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  {stats?.mockTests?.passed || 0} / {stats?.mockTests?.total || 10}
                </span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(((stats?.mockTests?.passed || 0) / 10) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Streak */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{user?.dailyStreak || 0} Day Streak</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Keep it going!</p>
                </div>
              </div>
              <Link to="/daily-challenge" className="btn btn-sm btn-primary">
                Daily Challenge
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

