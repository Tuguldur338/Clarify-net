"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  profile_picture_url?: string;
  role?: string;
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
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const json = await res.json();
        if (json?.data) {
          setUser(json.data);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Failed to load session", e);
        setUser(null);
      }
    };

    fetchSession();
  }, []);

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
  };

  const logout = async () => {
    updateUser(null);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch (e) {
      console.error("Logout request failed", e);
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
