import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';

interface User {
  email: string;
  name: string;
  picture: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isGuestMode: boolean;
  enableGuestMode: () => void;
  switchToRealMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Load saved session on mount and sync tabs
  useEffect(() => {
    const savedUser = localStorage.getItem('genomics_user');
    const savedGuestMode = localStorage.getItem('genomics_guest_mode');
    
    if (savedUser && savedGuestMode === 'false') {
      setUser(JSON.parse(savedUser));
      setIsGuestMode(false);
    } else if (savedGuestMode === 'true') {
      setIsGuestMode(true);
    } else {
      setIsGuestMode(false);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'genomics_user') {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
          setIsGuestMode(false);
        } else {
          setUser(null);
          setIsGuestMode(true);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      })
        .then(res => res.json())
        .then(userInfo => {
          const newUser = {
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            accessToken: tokenResponse.access_token
          };
          setUser(newUser);
          setIsGuestMode(false);
          localStorage.setItem('genomics_user', JSON.stringify(newUser));
          localStorage.setItem('genomics_guest_mode', 'false');
        })
        .catch(err => {
          console.error('Failed to fetch user info from Google:', err);
        });
    },
    onError: (error) => {
      console.error('Google login failed:', error);
    },
    onNonOAuthError: (error) => {
      console.error('Non-OAuth error:', error);
    }
  });

  const logout = () => {
    googleLogout();
    setUser(null);
    setIsGuestMode(true);
    localStorage.setItem('genomics_guest_mode', 'true');
    localStorage.removeItem('genomics_user');
  };

  const enableGuestMode = () => {
    setUser(null);
    setIsGuestMode(true);
    localStorage.setItem('genomics_guest_mode', 'true');
    localStorage.removeItem('genomics_user');
  };

  const switchToRealMode = () => {
    if (user) {
      setIsGuestMode(false);
    } else {
      login();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user && !isGuestMode,
      isGuestMode,
      enableGuestMode,
      switchToRealMode
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
