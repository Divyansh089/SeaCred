"use client";

import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleBasedDashboard from "@/components/dashboard/RoleBasedDashboard";
import { Wallet, AlertTriangle, Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, walletAddress } = useAuth();

  // If no wallet is connected, show a message
  if (!walletAddress) {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="mx-auto h-20 w-20 text-gray-400 mb-6">
              <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-full border border-red-200">
                <Wallet className="h-12 w-12 text-red-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No wallet connected</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Please connect your MetaMask wallet to access the SeaCred dashboard and manage your carbon credits.
            </p>
            <div className="space-y-4">
              <a
                href="/login"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 text-base font-semibold text-white shadow-lg hover:from-green-700 hover:to-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all duration-200 transform hover:scale-105"
              >
                <Wallet className="h-5 w-5 mr-2" />
                Connect MetaMask Wallet
              </a>
              <div className="text-sm text-gray-500">
                Secure blockchain-based carbon credit management
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If no user data, show loading
  if (!user) {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="mx-auto h-20 w-20 text-gray-400 mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-full border border-blue-200">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Loading your dashboard</h3>
            <p className="text-lg text-gray-600 mb-8">
              Fetching your user information and role permissions...
            </p>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <RoleBasedDashboard />
      </div>
    </DashboardLayout>
  );
}
