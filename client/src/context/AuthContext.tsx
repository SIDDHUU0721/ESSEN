import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  restaurantId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User, restaurantId?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('essen_token'));
  const [restaurantId, setRestaurantId] = useState<string | null>(() => localStorage.getItem('essen_restaurant_id'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and check authenticated user profile
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('essen_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/profile');
          if (res.data?.success) {
            setUser(res.data.data.user);
            if (res.data.data.restaurant?._id) {
              setRestaurantId(res.data.data.restaurant._id);
            }
          } else {
            clearStoredAuth();
          }
        } catch {
          // If token is invalid or server is unreachable, clear invalid token
          clearStoredAuth();
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const clearStoredAuth = () => {
    setToken(null);
    setUser(null);
    setRestaurantId(null);
    localStorage.removeItem('essen_token');
    localStorage.removeItem('essen_restaurant_id');
  };

  const login = (newToken: string, newUser: User, newRestaurantId?: string) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('essen_token', newToken);
    if (newRestaurantId) {
      setRestaurantId(newRestaurantId);
      localStorage.setItem('essen_restaurant_id', newRestaurantId);
    }
  };

  const logout = () => {
    clearStoredAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'customer',
        restaurantId,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
