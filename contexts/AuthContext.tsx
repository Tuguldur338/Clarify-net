"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  profile_picture_url?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage on mount
    try {
      const stored = localStorage.getItem("clarifynet_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load user from localStorage", e);
    }
  }, []);

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    try {
      // global key for compatibility
      if (newUser) {
        localStorage.setItem("clarifynet_user", JSON.stringify(newUser));
        localStorage.setItem(
          `clarifynet_user_${newUser.id}`,
          JSON.stringify(newUser),
        );
      } else {
        localStorage.removeItem("clarifynet_user");
      }
    } catch (e) {
      console.error("Failed to save user to localStorage", e);
    }
  };

  const logout = () => {
    updateUser(null);
    try {
      localStorage.removeItem("clarifynet_user");
    } catch (e) {
      console.error("Failed to remove localStorage on logout", e);
    }

    if (typeof window !== "undefined" && "caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
