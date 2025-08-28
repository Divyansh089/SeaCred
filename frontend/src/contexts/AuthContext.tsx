"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);

      try {
        // Mock authentication - replace with actual API call
        const mockUsers: User[] = [
          {
            id: "1",
            email: "admin@seacred.com",
            name: "John Admin",
            role: "admin",
            avatar: "/avatars/admin.jpg",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "2",
            email: "officer@seacred.com",
            name: "Jane Officer",
            role: "officer",
            avatar: "/avatars/officer.jpg",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "3",
            email: "project@seacred.com",
            name: "Mike Project",
            role: "project_authority",
            avatar: "/avatars/project.jpg",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const foundUser = mockUsers.find(
          (u) => u.email === email && password === "password123"
        );

        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem("user", JSON.stringify(foundUser));
          setIsLoading(false);
          return true;
        }

        setIsLoading(false);
        return false;
      } catch (error) {
        console.error("Login error:", error);
        setIsLoading(false);
        return false;
      }
    },
    []
  );

  const signup = useCallback(
    async (userData: {
      name: string;
      email: string;
      password: string;
      role: string;
    }): Promise<boolean> => {
      setIsLoading(true);

      try {
        // Only allow project authority signups
        if (userData.role !== "project_authority") {
          console.error("Only project authority signups are allowed");
          setIsLoading(false);
          return false;
        }

        // Mock signup - replace with actual API call
        const newUser: User = {
          id: Date.now().toString(),
          email: userData.email,
          name: userData.name,
          role: "project_authority",
          avatar: `/avatars/project_authority.jpg`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // In a real app, you would save this to your backend
        // For now, we'll just set the user directly
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        setIsLoading(false);
        return true;
      } catch (error) {
        console.error("Signup error:", error);
        setIsLoading(false);
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    // Use Next.js router instead of window.location.href
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
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
