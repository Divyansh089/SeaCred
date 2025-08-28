"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { WalletIcon } from "@heroicons/react/24/outline";

interface MetaMaskConnectProps {
  className?: string;
  variant?: "button" | "badge";
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      selectedAddress?: string;
      chainId?: string;
    };
  }
}

export default function MetaMaskConnect({
  className = "",
  variant = "button",
  onConnect,
  onDisconnect,
}: MetaMaskConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<string>("");
  const { addNotification } = useNotifications();

  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("disconnect", handleDisconnect);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener("disconnect", handleDisconnect);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          onConnect?.(accounts[0]);
        }

        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        setChainId(chainId);
      } catch (error) {
        console.error("Error checking MetaMask connection:", error);
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAddress("");
      onDisconnect?.();
      addNotification({
        type: "info",
        title: "Wallet disconnected",
        message: "MetaMask wallet has been disconnected.",
      });
    } else {
      setAddress(accounts[0]);
      setIsConnected(true);
      onConnect?.(accounts[0]);
      addNotification({
        type: "success",
        title: "Wallet connected",
        message: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });
    }
  };

  const handleChainChanged = (newChainId: string) => {
    setChainId(newChainId);
    addNotification({
      type: "info",
      title: "Network changed",
      message: `Switched to network: ${getNetworkName(newChainId)}`,
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAddress("");
    onDisconnect?.();
    addNotification({
      type: "info",
      title: "Wallet disconnected",
      message: "MetaMask wallet has been disconnected.",
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

  const connectWallet = async () => {
    if (!window.ethereum) {
      addNotification({
        type: "error",
        title: "MetaMask not found",
        message: "Please install MetaMask to connect your wallet.",
      });
      return;
    }

    if (!window.ethereum.isMetaMask) {
      addNotification({
        type: "error",
        title: "MetaMask required",
        message: "Please use MetaMask wallet to connect.",
      });
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        onConnect?.(accounts[0]);

        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        setChainId(chainId);

        addNotification({
          type: "success",
          title: "Wallet connected",
          message: `Successfully connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      }
    } catch (error: any) {
      if (error.code === 4001) {
        addNotification({
          type: "info",
          title: "Connection cancelled",
          message: "MetaMask connection was cancelled by user.",
        });
      } else {
        addNotification({
          type: "error",
          title: "Connection failed",
          message: "Failed to connect to MetaMask. Please try again.",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress("");
    onDisconnect?.();
    addNotification({
      type: "info",
      title: "Wallet disconnected",
      message: "MetaMask wallet has been disconnected.",
    });
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (variant === "badge") {
    if (!isConnected) {
      return (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 ${className}`}
        >
          <WalletIcon className="h-3 w-3 mr-1" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      );
    }

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}>
        <WalletIcon className="h-3 w-3 mr-1" />
        {formatAddress(address)}
      </div>
    );
  }

  // Default button variant
  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <WalletIcon className="h-4 w-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect MetaMask"}
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <WalletIcon className="h-4 w-4 mr-2 text-green-600" />
        <span>{formatAddress(address)}</span>
        <span className="ml-2 text-xs text-gray-500">
          {getNetworkName(chainId)}
        </span>
      </div>
      <button
        onClick={disconnectWallet}
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Disconnect
      </button>
    </div>
  );
}
