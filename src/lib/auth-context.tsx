import React, { createContext, useContext, useEffect, useState } from "react";
import {
  type BusinessProfileData,
  getBusinessProfile,
  loginBusiness,
  registerBusiness,
  logoutBusiness,
} from "./business-api";

interface AuthContextType {
  business: BusinessProfileData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [business, setBusiness] = useState<BusinessProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await getBusinessProfile();
      setBusiness(data);
    } catch {
      setBusiness(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("business_access_token") : null;
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      await loginBusiness(email, pass);
      await fetchProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      await registerBusiness(payload);
      await fetchProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setBusiness(null);
    logoutBusiness();
  };

  return (
    <AuthContext.Provider
      value={{
        business,
        isAuthenticated: !!business,
        isLoading,
        login,
        register,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

