import { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { User, LogIn, Trash2, Mail, ShieldAlert, LogOut, Chrome } from 'lucide-react';
import AuthModal from '../auth/AuthModal';
import APISettings from './APISettings';
import { useAuth } from '../../context/AuthContext';

interface ProfilePageProps {
  onClearSession: () => void;
  hasData: boolean;
}

export default function ProfilePage({ onClearSession, hasData }: ProfilePageProps) {
  const { authType, user: storeUser, updateDisplayName, signOut, setAuth } = useAppStore();
  const { user, isAuthenticated, isGuestMode, logout, login } = useAuth();
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setDisplayNameInput(user.name);
    } else if (storeUser?.name) {
      setDisplayNameInput(storeUser.name);
    }
  }, [user, storeUser]);

  const handleSaveName = () => {
    if (displayNameInput.trim()) {
      updateDisplayName(displayNameInput.trim());
    }
  };

  const handleClearMyData = () => {
    onClearSession();
  };

  const handleUpgradeToGoogle = () => {
    login();
  };

  const handleSignOut = () => {
    logout();
    signOut();
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div>
        <h2 className="text-xl font-bold text-teal-950 dark:text-teal-50">
          User Profile
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your account settings and preference details
        </p>
      </div>

      {/* Google Authentication Context Banner */}
      {isAuthenticated && user ? (
        <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 rounded-xl p-4 transition-all duration-350">
          <div className="flex items-center gap-4">
            <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" className="w-16 h-16 rounded-full ring-4 ring-teal-200 dark:ring-teal-950" />
            <div>
              <h3 className="font-bold text-teal-950 dark:text-teal-50 text-base">{user.name}</h3>
              <p className="text-xs text-teal-700 dark:text-teal-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold px-2 py-0.5 rounded-full">✓ Google Account</span>
                <button 
                  onClick={handleSignOut}
                  className="text-xs text-red-650 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <LogOut size={12} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : isGuestMode ? (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-4 transition-all duration-350">
          <div className="flex items-start gap-3">
            <User className="text-amber-650 dark:text-amber-400 flex-shrink-0 w-6 h-6 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-955 dark:text-amber-300 text-sm">Guest Mode</h3>
              <p className="text-xs text-amber-800 dark:text-amber-400 mt-1">
                You are currently using the Suite as a guest. All analyzed Sanger reads & report inputs are stored locally in your browser.
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-400">
                Sign in with Google to persistent-save your sequences, alignments, and AI insights across sessions.
              </p>
              <button 
                onClick={login}
                className="mt-3 flex items-center gap-1.5 text-xs bg-teal-500 hover:bg-teal-600 text-white px-3.5 py-1.5 rounded-lg transition-colors font-bold cursor-pointer"
              >
                <Chrome size={13} /> Sign In with Google
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Profile Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-teal-900/60 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-teal-900/40">
            <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-lg select-none uppercase shadow-xs">
              {displayNameInput ? displayNameInput[0] : 'U'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-teal-950 dark:text-teal-50 flex items-center gap-2">
                <span>{user?.name || 'Anonymous User'}</span>
                {authType === 'demo' && (
                  <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded">
                    DEMO
                  </span>
                )}
                {authType === 'guest' && (
                  <span className="text-[9px] font-bold bg-slate-400 text-white px-1.5 py-0.5 rounded">
                    GUEST
                  </span>
                )}
                {authType === 'google' && (
                  <span className="text-[9px] font-bold bg-teal-500 text-white px-1.5 py-0.5 rounded">
                    GOOGLE
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{user?.email || 'No email attached'}</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Display Name Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wide">
                Display Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  disabled={authType === 'demo'}
                  className="flex-1 max-w-sm border border-slate-200 dark:border-teal-900 rounded-lg p-2 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:opacity-50"
                  placeholder="Enter display name"
                />
                {authType !== 'demo' && (
                  <button
                    onClick={handleSaveName}
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>

            {/* Guest Info & Upgrade */}
            {authType === 'guest' && (
              <div className="p-4 bg-teal-50/50 dark:bg-slate-900/40 border border-teal-100 dark:border-teal-900 rounded-xl space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-350">
                  You are currently logged in as a Guest User. To keep your sequences saved across devices and utilize cloud storage, please link your Google Account.
                </p>
                <button
                  onClick={handleUpgradeToGoogle}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Link Google Account</span>
                </button>
              </div>
            )}

            {/* Demo Mode Actions */}
            {authType === 'demo' && (
              <div className="p-4 bg-amber-50/45 dark:bg-slate-900/40 border border-amber-200/50 dark:border-amber-900 rounded-xl space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-350">
                  You are currently exploring this platform in Read-Only Demo Mode. Sign in to save your custom sequence files.
                </p>
                <button
                  onClick={handleUpgradeToGoogle}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In with Google</span>
                </button>
              </div>
            )}

            {/* General Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-teal-900/40 flex flex-wrap gap-3">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center space-x-1.5 px-4 py-2 border border-slate-300 dark:border-slate-755 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span>Sign Out</span>
              </button>

              {authType === 'google' && (
                <button
                  onClick={() => {
                    onClearSession();
                    handleSignOut();
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  <span>Delete Account</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right Columns: API Settings & Clear Data */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <APISettings />

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-teal-900/60 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-105 dark:border-teal-900/40 pb-3">
              <Trash2 className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-teal-950 dark:text-teal-50">
                Clear Session Data
              </h3>
            </div>
            
            <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
              Clicking below will clear the current sample list, active sequence models, and alignment databases.
            </p>

            <button
              onClick={handleClearMyData}
              disabled={!hasData}
              className="w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-xs rounded-lg transition-all border border-red-200/50 dark:border-red-900/30 cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear My Data</span>
            </button>
          </div>
        </div>

      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
