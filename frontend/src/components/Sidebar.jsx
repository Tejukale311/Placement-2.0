import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Brain,
  Code,
  Building2,
  FileText,
  Trophy,
  Star,
  Bookmark,
  FileText as FileUser,
  User,
  Menu,
  X,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const userMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/aptitude', icon: Brain, label: 'Aptitude' },
    { path: '/programming', icon: Code, label: 'Programming' },
    { path: '/companies', icon: Building2, label: 'Companies' },
    { path: '/mock-tests', icon: FileText, label: 'Mock Tests' },
    { path: '/daily-challenge', icon: Trophy, label: 'Daily Challenge' },
    { path: '/leaderboard', icon: Star, label: 'Leaderboard' },
    { path: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { path: '/resume-builder', icon: FileUser, label: 'Resume Builder' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  const adminMenuItems = [
    { path: '/admin', icon: BarChart3, label: 'Dashboard' },
    { path: '/admin/users', icon: User, label: 'Users' },
    { path: '/admin/questions', icon: Brain, label: 'Questions' },
    { path: '/admin/coding-questions', icon: Code, label: 'Coding Questions' },
    { path: '/admin/company-questions', icon: Building2, label: 'Company Questions' },
    { path: '/admin/mock-tests', icon: FileText, label: 'Mock Tests' },
    { path: '/admin/leaderboard', icon: Star, label: 'Leaderboard' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' }
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Prep2Place
            </span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {userMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive(item.path) && <ChevronRight className="w-4 h-4 ml-auto" />}
              </NavLink>
            ))}
          </div>

          {/* Admin Section */}
          {user?.isAdmin && (
            <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
              <h3 className="px-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Admin Panel
              </h3>
              <div className="space-y-1">
                {adminMenuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive(item.path)
                        ? 'bg-gradient-to-r from-accent-500 to-purple-600 text-white shadow-lg shadow-accent-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="p-3 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Score: {user?.score || 0}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

