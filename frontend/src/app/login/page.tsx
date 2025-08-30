"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Leaf, Wallet, Shield, Users, User } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { connectWallet, isConnecting } = useAuth();
  const { addNotification } = useNotifications();
  const router = useRouter();
  
  const [loginForm, setLoginForm] = useState({
    userId: "",
    password: "",
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      // Mock login logic - replace with actual API call
      if (loginForm.userId && loginForm.password) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        addNotification({
          type: "success",
          title: "Login successful",
          message: "Welcome back!",
        });
        router.push("/dashboard");
      } else {
        addNotification({
          type: "error",
          title: "Login failed",
          message: "Please enter valid credentials.",
        });
      }
    } catch (error) {
      addNotification({
        type: "error",
        title: "Login error",
        message: "An error occurred during login.",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const success = await connectWallet();
      if (success) {
        addNotification({
          type: "success",
          title: "Wallet connected",
          message: "Successfully connected to your wallet!",
        });
        router.push("/dashboard");
      } else {
        addNotification({
          type: "error",
          title: "Connection failed",
          message: "Failed to connect wallet. Please try again.",
        });
      }
    } catch (error) {
      addNotification({
        type: "error",
        title: "Connection error",
        message: "An error occurred while connecting your wallet.",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center space-x-2">
              <Leaf className="h-10 w-10 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">SeaCred</h1>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Use your credentials or connect your wallet
            </p>
          </div>

          <div className="mt-8">
            {/* Traditional Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                  User ID
                </label>
                <div className="mt-1">
                  <input
                    id="userId"
                    name="userId"
                    type="text"
                    required
                    value={loginForm.userId}
                    onChange={(e) => setLoginForm({ ...loginForm, userId: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Enter your user ID"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="flex w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="mt-6">
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="flex w-full justify-center items-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet className="h-5 w-5 mr-2" />
                {isConnecting ? "Connecting..." : "Connect MetaMask Wallet"}
              </button>

              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600">
                  Don't have MetaMask?{" "}
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Download here
                  </a>
                </p>
              </div>
            </div>

            {/* Network Information */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Network Requirements
              </h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Connect to Holesky Testnet</li>
                <li>• Ensure you have test ETH for transactions</li>
                <li>• Your role is determined by your wallet's permissions in the smart contract</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Background Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Welcome to SeaCred</h2>
              <p className="text-xl mb-8">
                Blockchain-Powered Carbon Credit Management
              </p>
              <div className="grid grid-cols-1 gap-6 max-w-md">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Smart Contract Integration</h3>
                  <p className="text-sm">
                    Secure, transparent, and automated credit management
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Role-Based Access</h3>
                  <p className="text-sm">Automatic role detection from blockchain</p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Real-Time Updates</h3>
                  <p className="text-sm">
                    Live transaction monitoring and credit tracking
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
