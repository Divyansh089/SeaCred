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
import { getRoles, isUserRegistered, getUser } from "@/lib/credit";

interface AuthContextType {
  user: User | null;
  walletAddress: string | null;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  isLoading: boolean;
  isConnecting: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for existing wallet connection
    const savedWallet = localStorage.getItem("walletAddress");
    if (savedWallet) {
      setWalletAddress(savedWallet);
      checkUserRole(savedWallet);
    }
    setIsLoading(false);
  }, []);

  const checkUserRole = useCallback(async (address: string) => {
    try {
      console.log("Checking role for address:", address);
      const { isAdmin, isOfficer } = await getRoles(address);
      console.log("Role check result:", { isAdmin, isOfficer });
      
      let role: string;
      let name: string;
      
      if (isAdmin) {
        role = "admin";
        name = "Admin User";
        console.log("User is ADMIN");
      } else if (isOfficer) {
        role = "officer";
        name = "Verification Officer";
        console.log("User is OFFICER");
      } else {
        role = "user";
        // Check if user is registered
        try {
          const isRegistered = await isUserRegistered(address);
          if (isRegistered) {
            const userDetails = await getUser(address);
            name = `${userDetails.firstName} ${userDetails.lastName}`;
            console.log("User is REGISTERED USER:", name);
          } else {
            name = "Unregistered User";
            console.log("User is UNREGISTERED USER");
          }
        } catch (error) {
          console.log("User is UNREGISTERED USER (error checking registration)");
          name = "Unregistered User";
        }
      }

             const userData: User = {
         id: address,
         email: `${address.slice(0, 6)}...${address.slice(-4)}@wallet.com`,
         name,
         role,
         avatar: `/avatars/${role}.jpg`,
         createdAt: new Date(),
         updatedAt: new Date(),
         isRegistered: role === "user" ? (name !== "Unregistered User") : true,
       };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error checking user role:", error);
      // If there's an error, treat as regular user
      const userData: User = {
        id: address,
        email: `${address.slice(0, 6)}...${address.slice(-4)}@wallet.com`,
        name: "Unregistered User",
        role: "user",
        avatar: "/avatars/user.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        isRegistered: false,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  }, []);

  const connectWallet = useCallback(async (): Promise<boolean> => {
    if (!window.ethereum) {
      console.error("MetaMask not found");
      return false;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        localStorage.setItem("walletAddress", address);
        
        // Check user role based on smart contract
        await checkUserRole(address);
        
        setIsConnecting(false);
        return true;
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }

    setIsConnecting(false);
    return false;
  }, [checkUserRole]);

  const disconnectWallet = useCallback(() => {
    setUser(null);
    setWalletAddress(null);
    localStorage.removeItem("user");
    localStorage.removeItem("walletAddress");
    router.push("/login");
  }, [router]);

  // Listen for wallet changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          disconnectWallet();
        } else {
          // User switched accounts
          const address = accounts[0];
          setWalletAddress(address);
          localStorage.setItem("walletAddress", address);
          await checkUserRole(address);
        }
      };

      const handleChainChanged = () => {
        // Reload page when chain changes
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [disconnectWallet, checkUserRole]);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        walletAddress, 
        connectWallet, 
        disconnectWallet, 
        isLoading, 
        isConnecting 
      }}
    >
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
