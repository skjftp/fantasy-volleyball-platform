import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  sendOTP: (phoneNumber: string) => Promise<{ success: boolean; message?: string }>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface User {
  uid: string;
  phoneNumber: string;
  token?: string;
}

interface UserProfile {
  uid: string;
  phone: string;
  name?: string;
  email?: string;
  createdAt: Date;
  totalContestsJoined: number;
  totalWins: number;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser({ ...parsedUser, token });
          
          // Fetch latest user profile
          try {
            const profile = await apiClient.get(`/users/${parsedUser.uid}`);
            setUserProfile(profile);
          } catch (error) {
            console.error('Error fetching user profile:', error);
            // Clear invalid session
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // Format phone number to include +91 for India
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      await apiClient.post('/auth/send-otp', {
        phoneNumber: formattedPhone
      });
      
      return { success: true, message: 'OTP sent successfully' };
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to send OTP. Please try again.' 
      };
    }
  };

  const verifyOTP = async (phoneNumber: string, otp: string): Promise<void> => {
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      const response = await apiClient.post('/auth/verify-otp', {
        phoneNumber: formattedPhone,
        otp: otp
      });

      const { user: userData, token, profile } = response;
      
      // Store authentication data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      setUser({ ...userData, token });
      setUserProfile(profile);
      
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw new Error(error.message || 'Invalid OTP. Please try again.');
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      // Call backend logout if needed
      if (user?.token) {
        try {
          await apiClient.post('/auth/logout', {});
        } catch (error) {
          console.error('Error during logout:', error);
        }
      }
      
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      setUser(null);
      setUserProfile(null);
      
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Add token to all API requests when user is authenticated
  useEffect(() => {
    if (user?.token) {
      // Store the original request function
      if (!apiClient.originalRequest) {
        apiClient.originalRequest = apiClient.request;
      }
      
      // Override the request function to always include auth token
      apiClient.request = function(endpoint: string, options: RequestInit = {}) {
        const authOptions = {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${user.token}`
          }
        };
        return this.originalRequest(endpoint, authOptions);
      };
    }
  }, [user?.token]);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    sendOTP,
    verifyOTP,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};