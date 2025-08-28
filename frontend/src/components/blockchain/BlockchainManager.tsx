"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import MetaMaskConnect from "@/components/ui/MetaMaskConnect";
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

interface BlockchainManagerProps {
  projectId?: string;
  creditAmount?: number;
  onTransactionComplete?: (txHash: string) => void;
}

interface Transaction {
  id: string;
  type: "mint" | "transfer" | "retire" | "burn";
  status: "pending" | "confirmed" | "failed";
  hash: string;
  amount: number;
  timestamp: Date;
  gasUsed?: number;
  gasPrice?: number;
}

export default function BlockchainManager({
  projectId,
  creditAmount = 0,
  onTransactionComplete,
}: BlockchainManagerProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [chainId, setChainId] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setIsConnected(true);
          setWalletAddress(accounts[0]);
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          setChainId(chainId);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const handleWalletConnect = (address: string) => {
    setIsConnected(true);
    setWalletAddress(address);
    addNotification({
      type: "success",
      title: "Wallet connected",
      message:
        "MetaMask wallet connected successfully for blockchain operations.",
    });
  };

  const handleWalletDisconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
    addNotification({
      type: "info",
      title: "Wallet disconnected",
      message: "MetaMask wallet disconnected from blockchain operations.",
    });
  };

  const getNetworkName = (chainId: string) => {
    const networks: { [key: string]: string } = {
      "0x1": "Ethereum Mainnet",
      "0x3": "Ropsten Testnet",
      "0x4": "Rinkeby Testnet",
      "0x5": "Goerli Testnet",
      "0x2a": "Kovan Testnet",
      "0x89": "Polygon Mainnet",
      "0x13881": "Mumbai Testnet",
      "0xa": "Optimism",
      "0xa4b1": "Arbitrum One",
    };
    return networks[chainId] || `Chain ID: ${parseInt(chainId, 16)}`;
  };

  const simulateMintCredits = async () => {
    if (!isConnected) {
      addNotification({
        type: "error",
        title: "Wallet not connected",
        message: "Please connect your MetaMask wallet first.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        type: "mint",
        status: "confirmed",
        hash: txHash,
        amount: creditAmount,
        timestamp: new Date(),
        gasUsed: 150000,
        gasPrice: 20,
      };

      setTransactions((prev) => [newTransaction, ...prev]);
      onTransactionComplete?.(txHash);

      addNotification({
        type: "success",
        title: "Credits minted successfully",
        message: `Successfully minted ${creditAmount} carbon credits on the blockchain.`,
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Transaction failed",
        message: "Failed to mint credits. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateTransferCredits = async () => {
    if (!isConnected) {
      addNotification({
        type: "error",
        title: "Wallet not connected",
        message: "Please connect your MetaMask wallet first.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        type: "transfer",
        status: "confirmed",
        hash: txHash,
        amount: creditAmount * 0.8, // 80% to authority
        timestamp: new Date(),
        gasUsed: 120000,
        gasPrice: 20,
      };

      setTransactions((prev) => [newTransaction, ...prev]);
      onTransactionComplete?.(txHash);

      addNotification({
        type: "success",
        title: "Credits transferred successfully",
        message: `Successfully transferred ${
          creditAmount * 0.8
        } carbon credits to project authority.`,
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Transaction failed",
        message: "Failed to transfer credits. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getTransactionStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case "pending":
        return (
          <ArrowPathIcon className="h-4 w-4 text-yellow-600 animate-spin" />
        );
      case "failed":
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <CogIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "mint":
        return "Mint Credits";
      case "transfer":
        return "Transfer Credits";
      case "retire":
        return "Retire Credits";
      case "burn":
        return "Burn Credits";
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Blockchain Operations
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage carbon credits on the blockchain
            </p>
          </div>
          <CogIcon className="h-6 w-6 text-green-600" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Wallet Connection */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Wallet Connection
          </h4>
          <MetaMaskConnect
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
          />
          {isConnected && (
            <div className="mt-3 text-sm text-gray-600">
              <p>
                Connected: {walletAddress.slice(0, 6)}...
                {walletAddress.slice(-4)}
              </p>
              <p>Network: {getNetworkName(chainId)}</p>
            </div>
          )}
        </div>

        {/* Blockchain Operations */}
        {isConnected && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Credit Operations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={simulateMintCredits}
                disabled={isProcessing || creditAmount <= 0}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Minting...
                  </>
                ) : (
                  <>
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    Mint {creditAmount} Credits
                  </>
                )}
              </button>

              <button
                onClick={simulateTransferCredits}
                disabled={isProcessing || creditAmount <= 0}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Transfer Credits
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Transaction History */}
        {transactions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Recent Transactions
            </h4>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionStatusIcon(tx.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getTransactionTypeLabel(tx.type)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tx.amount} credits • {tx.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-mono">
                      {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                    </p>
                    {tx.gasUsed && (
                      <p className="text-xs text-gray-400">
                        Gas: {tx.gasUsed.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Smart Contract Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Smart Contract Information
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Contract Address: 0x1234...5678 (SeaCred Carbon Credits)</p>
            <p>Network: {getNetworkName(chainId) || "Not connected"}</p>
            <p>Total Credits Minted: 1,234,567 tCO2e</p>
            <p>Total Credits Retired: 456,789 tCO2e</p>
          </div>
        </div>
      </div>
    </div>
  );
}
