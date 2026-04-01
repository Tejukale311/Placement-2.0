import { Menu, Sun, Moon, Bell, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between px-4 lg:px-6 relative z-[100]">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100/50 dark:bg-slate-700/50 rounded-xl px-4 py-2.5 border border-slate-200/50 dark:border-slate-600/50">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            className="bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 w-48 lg:w-64"
          />
          <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-slate-400 bg-slate-200/50 dark:bg-slate-600/50 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Notifications */}
        <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors relative">
          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white dark:ring-slate-800"></span>
        </button>

        {/* User Score */}
        <div className="hidden sm:flex items-center gap-2 ml-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl shadow-lg shadow-primary-500/25">
          <span className="text-xs text-white/80">Score</span>
          <span className="text-sm font-bold text-white">{user?.score || 0}</span>
        </div>

        {/* User Menu */}
        <div className="relative group ml-2">
          <button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden lg:inline text-sm font-medium text-slate-700 dark:text-slate-200">
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto transition-all duration-200 z-[999] origin-top-right">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="p-3 border-b border-slate-200/50 dark:border-slate-700/50">
                <p className="font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
              <div className="p-2">
                <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Profile</span>
                </Link>
                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

