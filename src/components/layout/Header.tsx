import { Menu, Sun, Moon, Compass, Github, LogOut, Chrome } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAppStore } from '../../stores/appStore';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { isDemoMode, authType } = useAppStore();
  const { user, isAuthenticated, isGuestMode, logout, login } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-16 w-full flex items-center justify-between px-6 bg-white dark:bg-slate-800 border-b border-slate-205 dark:border-teal-900 transition-colors duration-300 shadow-xs">
      
      {/* Brand logo & mobile toggle controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 md:hidden border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
          aria-label="Toggle Side Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Header Branding Title */}
        <div onClick={() => navigate('/')} className="flex items-center space-x-2 cursor-pointer group">
          <div className="hidden max-md:flex p-1.5 rounded-md bg-teal-500 text-white group-hover:bg-teal-600 transition-colors">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="text-base md:text-lg font-bold font-sans tracking-tight text-teal-950 dark:text-teal-50 group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
            The Student Genomics Suite <span className="hidden sm:inline font-normal text-xs text-slate-550 dark:text-slate-400 ml-1.5 group-hover:text-teal-600/85">| Sequence Bioinformatics</span>
          </h2>
        </div>
      </div>

      {/* Global Controls and Shortcuts */}
      <div className="flex items-center space-x-3">
        {/* Auth Status & Controls */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl">
            <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" className="w-6 h-6 rounded-full border border-teal-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 hidden md:inline max-w-[120px] truncate">{user.name}</span>
            <button 
              onClick={logout} 
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-500 hover:text-red-500"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (authType === 'demo') ? (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
            DEMO MODE
          </span>
        ) : isGuestMode ? (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-650 text-xs font-semibold border border-slate-200 dark:bg-slate-900/60 dark:border-slate-850 dark:text-slate-350">
              GUEST MODE
            </span>
            <button 
              onClick={login} 
              className="px-3 py-1 bg-teal-500 hover:bg-teal-605 hover:bg-teal-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center shrink-0">
                <svg className="w-2 h-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.991-6.015c1.533 0 2.93.576 3.996 1.514l3.124-3.124C19.23 3.097 16.784 2 13.991 2 8.163 2 3.4 6.702 3.4 12.5s4.763 10.5 10.591 10.5c5.362 0 9.875-3.834 9.875-10.5 0-.671-.06-1.285-.16-1.785H12.24Z"
                  />
                </svg>
              </div>
              Sign In
            </button>
          </div>
        ) : null}

        {/* GitHub redirect shortcut */}
        <button
          onClick={() => window.open('https://github.com/mohamadkhoirul28', '_blank')}
          className="p-2 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors duration-200 cursor-pointer"
          title="Open Developer's GitHub"
        >
          <Github className="w-4 h-4" />
        </button>

        {/* Main Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full border border-slate-200 dark:border-teal-900 text-teal-900 dark:text-teal-50 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-slate-350 dark:hover:border-teal-700 transition-all duration-300 overflow-hidden cursor-pointer flex items-center justify-center"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>
      </div>
    </header>
  );
}
