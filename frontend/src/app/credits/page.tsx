"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  CurrencyDollarIcon,
  WalletIcon,
  UserIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { CarbonCredit, CreditDistribution } from "@/types";

const mockCredits: CarbonCredit[] = [
  {
    id: "1",
    projectId: "1",
    serialNumber: "CC-2024-001-0001",
    vintage: 2024,
    amount: 1000,
    status: "available",
    issuedAt: new Date("2024-08-20"),
  },
  {
    id: "2",
    projectId: "1",
    serialNumber: "CC-2024-001-0002",
    vintage: 2024,
    amount: 500,
    status: "distributed",
    issuedAt: new Date("2024-08-18"),
    distributedAt: new Date("2024-08-22"),
  },
  {
    id: "3",
    projectId: "2",
    serialNumber: "CC-2024-002-0001",
    vintage: 2024,
    amount: 2000,
    status: "available",
    issuedAt: new Date("2024-08-15"),
  },
];

const mockDistributions: CreditDistribution[] = [
  {
    id: "dist-1",
    projectId: "1",
    officerId: "officer-1",
    authorityId: "authority-1",
    totalCredits: 1000,
    officerWallet: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    authorityWallet: "0x1234567890123456789012345678901234567890",
    distribution: {
      officerShare: 10,
      authorityShare: 80,
      platformFee: 10,
    },
    status: "distributed",
    blockchainTransactionId: "tx-1",
    createdAt: new Date("2024-08-20"),
    distributedAt: new Date("2024-08-20"),
  },
  {
    id: "dist-2",
    projectId: "2",
    officerId: "officer-2",
    authorityId: "authority-2",
    totalCredits: 2000,
    officerWallet: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    authorityWallet: "0x9876543210987654321098765432109876543210",
    distribution: {
      officerShare: 15,
      authorityShare: 75,
      platformFee: 10,
    },
    status: "distributed",
    blockchainTransactionId: "tx-2",
    createdAt: new Date("2024-08-15"),
    distributedAt: new Date("2024-08-15"),
  },
];

export default function CreditsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("distribution");

  // Calculate totals based on user role
  const getTotalCredits = () => {
    if (user?.role === "officer") {
      return mockDistributions
        .filter((d) => d.officerId === user.id)
        .reduce(
          (sum, dist) =>
            sum + (dist.totalCredits * dist.distribution.officerShare) / 100,
          0
        );
    } else if (user?.role === "project_authority") {
      return mockDistributions
        .filter((d) => d.authorityId === user.id)
        .reduce(
          (sum, dist) =>
            sum + (dist.totalCredits * dist.distribution.authorityShare) / 100,
          0
        );
    }
    return mockCredits.reduce((sum, credit) => sum + credit.amount, 0);
  };

  const getAvailableCredits = () => {
    if (user?.role === "officer") {
      return mockDistributions
        .filter((d) => d.officerId === user.id)
        .reduce(
          (sum, dist) =>
            sum + (dist.totalCredits * dist.distribution.officerShare) / 100,
          0
        );
    } else if (user?.role === "project_authority") {
      return mockDistributions
        .filter((d) => d.authorityId === user.id)
        .reduce(
          (sum, dist) =>
            sum + (dist.totalCredits * dist.distribution.authorityShare) / 100,
          0
        );
    }
    return mockCredits
      .filter((c) => c.status === "available")
      .reduce((sum, credit) => sum + credit.amount, 0);
  };

  const getWalletAddress = () => {
    if (user?.role === "officer") {
      return "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
    } else if (user?.role === "project_authority") {
      return "0x1234567890123456789012345678901234567890";
    }
    return "0x0000000000000000000000000000000000000000";
  };

  const tabs = [
    { id: "distribution", name: "Credit Distribution", icon: WalletIcon },
    { id: "wallet", name: "Wallet Management", icon: UserIcon },
    { id: "authority", name: "Authority Credits", icon: BuildingOfficeIcon },
  ];

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Carbon Credits Management
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              {user?.role === "officer" &&
                "Manage your verification credits and wallet"}
              {user?.role === "project_authority" &&
                "Track your project credits and distributions"}
              {user?.role === "admin" &&
                "Monitor credit distributions and blockchain operations"}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Credits
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {getTotalCredits().toLocaleString('en-US')} tCO2e
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <WalletIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Available Credits
                    </dt>
                                         <dd className="text-lg font-medium text-gray-900">
                       {getAvailableCredits().toLocaleString('en-US')} tCO2e
                     </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {user?.role === "officer"
                        ? "Officer Share"
                        : "Authority Share"}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user?.role === "officer" ? "10%" : "80%"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Credit Distribution Tab */}
        {activeTab === "distribution" && (
          <div className="mt-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {mockDistributions
                  .filter((dist) => {
                    if (user?.role === "officer")
                      return dist.officerId === user.id;
                    if (user?.role === "project_authority")
                      return dist.authorityId === user.id;
                    return true; // Admin sees all
                  })
                  .map((distribution) => (
                    <li key={distribution.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Project {distribution.projectId}
                              </p>
                              <p className="text-sm text-gray-500">
                                {distribution.distributedAt?.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {distribution.totalCredits.toLocaleString('en-US')}{" "}
                                tCO2e
                              </p>
                              <p className="text-sm text-gray-500">
                                {user?.role === "officer" &&
                                  `${distribution.distribution.officerShare}% share`}
                                {user?.role === "project_authority" &&
                                  `${distribution.distribution.authorityShare}% share`}
                                {user?.role === "admin" && "Total distributed"}
                              </p>
                            </div>
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                              {distribution.status}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <WalletIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {distribution.officerWallet.substring(0, 20)}...
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              <DocumentTextIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              TX: {distribution.blockchainTransactionId}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        {/* Wallet Management Tab */}
        {activeTab === "wallet" && (
          <div className="mt-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Wallet Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Address
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={getWalletAddress()}
                      readOnly
                      className="flex-1 rounded-md border-gray-300 bg-gray-50 shadow-sm font-mono text-sm"
                    />
                    <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                      Copy
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Credit Balance
                    </h4>
                                         <p className="text-2xl font-bold text-green-600">
                       {getAvailableCredits().toLocaleString('en-US')} tCO2e
                     </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Share Percentage
                    </h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {user?.role === "officer" ? "10%" : "80%"}
                    </p>
                  </div>
                </div>

                {user?.role === "officer" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      Officer Benefits
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 10% share of verified project credits</li>
                      <li>• Direct distribution to your wallet</li>
                      <li>• Transparent blockchain transactions</li>
                      <li>• Immediate availability after verification</li>
                    </ul>
                  </div>
                )}

                {user?.role === "project_authority" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-900 mb-2">
                      Authority Benefits
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• 80% share of project credits</li>
                      <li>• Secure wallet storage</li>
                      <li>• Verified and audited credits</li>
                      <li>• Credits stored securely on blockchain</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Authority Credits Tab */}
        {activeTab === "authority" && (
          <div className="mt-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Authority Credit Management
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Total Authority Credits
                    </h4>
                    <p className="text-2xl font-bold text-green-600">
                      {mockDistributions
                        .filter((d) =>
                          user?.role === "project_authority"
                            ? d.authorityId === user.id
                            : true
                        )
                        .reduce(
                          (sum, dist) =>
                            sum +
                            (dist.totalCredits *
                              dist.distribution.authorityShare) /
                              100,
                          0
                        )
                                                 .toLocaleString('en-US')}{" "}
                      tCO2e
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Available Credits
                    </h4>
                                         <p className="text-2xl font-bold text-blue-600">
                       {getAvailableCredits().toLocaleString('en-US')} tCO2e
                     </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">
                    Authority Credit Information
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>
                      • Credits are distributed after successful verification
                    </li>
                    <li>• 80% of total project credits go to authority</li>
                    <li>• Credits are stored securely on blockchain</li>
                    <li>• All transactions are transparent and auditable</li>
                    <li>• Credits are verified and audited for quality</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
