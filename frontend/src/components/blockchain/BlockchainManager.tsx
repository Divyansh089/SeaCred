"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  CurrencyDollarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WalletIcon,
  CogIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  BlockchainTransaction,
  CreditDistribution,
  VerificationReport,
  CarbonProject,
} from "@/types";

interface BlockchainManagerProps {
  projectId: string;
  verificationReport: VerificationReport;
  onTransactionComplete?: (transaction: BlockchainTransaction) => void;
}

export default function BlockchainManager({
  projectId,
  verificationReport,
  onTransactionComplete,
}: BlockchainManagerProps) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("minting");
  const [walletAddress, setWalletAddress] = useState("");
  const [gasPrice, setGasPrice] = useState(20); // Gwei
  const [distribution, setDistribution] = useState({
    officerShare: 10, // 10%
    authorityShare: 80, // 80%
    platformFee: 10, // 10%
  });

  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [distributions, setDistributions] = useState<CreditDistribution[]>([]);

  useEffect(() => {
    // Load wallet address from user profile or settings
    setWalletAddress("0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6");
  }, []);

  const handleMintCredits = async () => {
    if (!verificationReport.creditCalculation) {
      alert("No credit calculation available");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate blockchain minting
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const transaction: BlockchainTransaction = {
        id: `tx-${Date.now()}`,
        type: "mint",
        projectId,
        officerId: verificationReport.officerId,
        adminId: user?.id || "",
        amount: verificationReport.creditCalculation.totalCredits,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: "confirmed",
        gasUsed: 150000,
        gasPrice: gasPrice,
        blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
        createdAt: new Date(),
        confirmedAt: new Date(),
      };

      setTransactions((prev) => [...prev, transaction]);
      onTransactionComplete?.(transaction);
    } catch (error) {
      console.error("Error minting credits:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDistributeCredits = async () => {
    if (!walletAddress) {
      alert("Please enter wallet address");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate credit distribution
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const totalCredits =
        verificationReport.creditCalculation?.totalCredits || 0;
      const officerCredits = (totalCredits * distribution.officerShare) / 100;
      const authorityCredits =
        (totalCredits * distribution.authorityShare) / 100;

      const distributionRecord: CreditDistribution = {
        id: `dist-${Date.now()}`,
        projectId,
        officerId: verificationReport.officerId,
        authorityId: "authority-1", // This would come from the project
        totalCredits,
        officerWallet: walletAddress,
        authorityWallet: "0x1234567890123456789012345678901234567890",
        distribution,
        status: "distributed",
        blockchainTransactionId: `tx-${Date.now()}`,
        createdAt: new Date(),
        distributedAt: new Date(),
      };

      setDistributions((prev) => [...prev, distributionRecord]);
    } catch (error) {
      console.error("Error distributing credits:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const tabs = [
    { id: "minting", name: "Mint Credits", icon: CurrencyDollarIcon },
    { id: "distribution", name: "Distribute Credits", icon: WalletIcon },
    { id: "transactions", name: "Transaction History", icon: DocumentTextIcon },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Blockchain Operations
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage carbon credit minting and distribution on blockchain
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
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

      <div className="p-6">
        {/* Minting Tab */}
        {activeTab === "minting" && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Credit Minting Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total Credits:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {verificationReport.creditCalculation?.totalCredits || 0}{" "}
                    tCO2e
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Vintage:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {verificationReport.creditCalculation?.vintage ||
                      new Date().getFullYear()}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Methodology:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    {verificationReport.creditCalculation?.methodology ||
                      "Standard"}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Price per Credit:</span>
                  <span className="ml-2 font-medium text-blue-900">
                    ${verificationReport.creditCalculation?.pricePerCredit || 0}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gas Price (Gwei)
              </label>
              <input
                type="number"
                value={gasPrice}
                onChange={(e) => setGasPrice(parseInt(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher gas price = faster transaction confirmation
              </p>
            </div>

            <button
              onClick={handleMintCredits}
              disabled={isProcessing}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Minting Credits...
                </>
              ) : (
                <>
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  Mint {verificationReport.creditCalculation?.totalCredits ||
                    0}{" "}
                  Credits
                </>
              )}
            </button>
          </div>
        )}

        {/* Distribution Tab */}
        {activeTab === "distribution" && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">
                Distribution Settings
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-green-700 mb-1">
                    Officer Share (%)
                  </label>
                  <input
                    type="number"
                    value={distribution.officerShare}
                    onChange={(e) =>
                      setDistribution((prev) => ({
                        ...prev,
                        officerShare: parseInt(e.target.value),
                        authorityShare:
                          100 - parseInt(e.target.value) - prev.platformFee,
                      }))
                    }
                    className="w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-green-700 mb-1">
                    Authority Share (%)
                  </label>
                  <input
                    type="number"
                    value={distribution.authorityShare}
                    onChange={(e) =>
                      setDistribution((prev) => ({
                        ...prev,
                        authorityShare: parseInt(e.target.value),
                        officerShare:
                          100 - parseInt(e.target.value) - prev.platformFee,
                      }))
                    }
                    className="w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-green-700 mb-1">
                    Platform Fee (%)
                  </label>
                  <input
                    type="number"
                    value={distribution.platformFee}
                    onChange={(e) =>
                      setDistribution((prev) => ({
                        ...prev,
                        platformFee: parseInt(e.target.value),
                        authorityShare:
                          100 - prev.officerShare - parseInt(e.target.value),
                      }))
                    }
                    className="w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Officer Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 font-mono text-sm"
                placeholder="0x..."
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-900 mb-3">
                Distribution Preview
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Credits:</span>
                  <span className="font-medium">
                    {verificationReport.creditCalculation?.totalCredits || 0}{" "}
                    tCO2e
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Officer Share ({distribution.officerShare}%):
                  </span>
                  <span className="font-medium">
                    {(
                      ((verificationReport.creditCalculation?.totalCredits ||
                        0) *
                        distribution.officerShare) /
                      100
                    ).toFixed(2)}{" "}
                    tCO2e
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Authority Share ({distribution.authorityShare}%):
                  </span>
                  <span className="font-medium">
                    {(
                      ((verificationReport.creditCalculation?.totalCredits ||
                        0) *
                        distribution.authorityShare) /
                      100
                    ).toFixed(2)}{" "}
                    tCO2e
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Platform Fee ({distribution.platformFee}%):
                  </span>
                  <span className="font-medium">
                    {(
                      ((verificationReport.creditCalculation?.totalCredits ||
                        0) *
                        distribution.platformFee) /
                      100
                    ).toFixed(2)}{" "}
                    tCO2e
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDistributeCredits}
              disabled={isProcessing}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Distributing Credits...
                </>
              ) : (
                <>
                  <WalletIcon className="h-4 w-4 mr-2" />
                  Distribute Credits
                </>
              )}
            </button>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="space-y-6">
            <h4 className="text-md font-medium text-gray-900">
              Transaction History
            </h4>

            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No transactions
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Mint credits to see transaction history.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">
                          {transaction.type.toUpperCase()} -{" "}
                          {transaction.amount} tCO2e
                        </h5>
                        <p className="text-sm text-gray-500">
                          Hash: {transaction.transactionHash.substring(0, 20)}
                          ...
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {transaction.status === "confirmed" && (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        )}
                        {transaction.status === "pending" && (
                          <ArrowPathIcon className="h-5 w-5 text-yellow-600 animate-spin" />
                        )}
                        {transaction.status === "failed" && (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                        )}
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            transaction.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Block: {transaction.blockNumber} | Gas:{" "}
                      {transaction.gasUsed} |
                      {transaction.createdAt.toLocaleString("en-US")}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {distributions.length > 0 && (
              <div className="mt-8">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Distribution History
                </h4>
                <div className="space-y-4">
                  {distributions.map((dist) => (
                    <div key={dist.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">
                            Distribution - {dist.totalCredits} tCO2e
                          </h5>
                          <p className="text-sm text-gray-500">
                            Officer: {dist.officerWallet.substring(0, 20)}...
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            dist.status === "distributed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {dist.status}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {dist.distributedAt?.toLocaleString("en-US")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
