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
              Connect to SeaCred
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Connect your MetaMask wallet to access the platform
            </p>
          </div>

          <div className="mt-8">
            {/* Wallet Connection */}
            <div className="space-y-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="flex w-full justify-center items-center rounded-md border border-transparent bg-green-600 py-4 px-6 text-base font-semibold text-white shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                <Wallet className="h-6 w-6 mr-3" />
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
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2304D361;stop-opacity:0.8" /><stop offset="100%" style="stop-color:%2306B6D4;stop-opacity:0.8" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23grad)"/><g fill="white" opacity="0.1"><circle cx="200" cy="150" r="80"/><circle cx="1000" cy="200" r="60"/><circle cx="300" cy="600" r="100"/><circle cx="900" cy="650" r="70"/><circle cx="600" cy="300" r="90"/><circle cx="150" cy="500" r="50"/><circle cx="1050" cy="500" r="40"/></g><g fill="white" opacity="0.05"><path d="M0,400 Q300,200 600,400 T1200,400 L1200,800 L0,800 Z"/><path d="M0,600 Q400,400 800,600 T1200,600 L1200,800 L0,800 Z"/></g><g fill="white" opacity="0.08"><ellipse cx="100" cy="100" rx="30" ry="20"/><ellipse cx="1100" cy="150" rx="25" ry="15"/><ellipse cx="150" cy="700" rx="35" ry="25"/><ellipse cx="1050" cy="750" rx="20" ry="30"/></g></svg>')`
          }}
        >
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Welcome to SeaCred</h2>
              <p className="text-xl mb-8">
                Blockchain-Powered Carbon Credit Management
              </p>
              <div className="grid grid-cols-1 gap-6 max-w-md">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold">Smart Contract Integration</h3>
                  </div>
                  <p className="text-sm">
                    Secure, transparent, and automated credit management
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold">Role-Based Access</h3>
                  </div>
                  <p className="text-sm">Automatic role detection from blockchain</p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20">
                  <div className="flex items-center mb-2">
                    <Leaf className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold">Real-Time Updates</h3>
                  </div>
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
