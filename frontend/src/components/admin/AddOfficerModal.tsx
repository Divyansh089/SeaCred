"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { addOfficer } from "@/lib/credit";
import { X, UserPlus, MapPin, Building, FileText, Shield } from "lucide-react";

interface AddOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddOfficerModal({ isOpen, onClose, onSuccess }: AddOfficerModalProps) {
  const { user, walletAddress } = useAuth();
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    walletAddress: "",
    name: "",
    designation: "",
    area: "",
    contracts: "",
    jurisdiction: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress) {
      addNotification({
        type: "error",
        title: "Wallet not connected",
        message: "Please connect your wallet to add officers.",
      });
      return;
    }

    if (!formData.walletAddress || !formData.name || !formData.area || !formData.jurisdiction) {
      addNotification({
        type: "error",
        title: "Missing information",
        message: "Please fill in all required fields.",
      });
      return;
    }

    // Validate wallet address format
    if (!formData.walletAddress.startsWith("0x") || formData.walletAddress.length !== 42) {
      addNotification({
        type: "error",
        title: "Invalid wallet address",
        message: "Please enter a valid Ethereum wallet address.",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Adding officer with data:", formData);
      
      await addOfficer(
        formData.walletAddress,
        formData.name,
        formData.designation,
        formData.area,
        formData.contracts,
        formData.jurisdiction
      );

      addNotification({
        type: "success",
        title: "Officer added successfully",
        message: `${formData.name} has been registered as an officer for ${formData.area}`,
      });

      // Reset form
      setFormData({
        walletAddress: "",
        name: "",
        designation: "",
        area: "",
        contracts: "",
        jurisdiction: "",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error adding officer:", error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to register officer. Please check your inputs and try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("gas")) {
          errorMessage = "Transaction failed due to gas issues. Please try again with higher gas limit.";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was cancelled by user.";
        } else if (error.message.includes("OFFICER_ALREADY_EXISTS")) {
          errorMessage = "This wallet address is already registered as an officer.";
        } else if (error.message.includes("INVALID_WALLET_ADDRESS")) {
          errorMessage = "Invalid wallet address provided.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      addNotification({
        type: "error",
        title: "Failed to add officer",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Add New Officer</h2>
              <p className="text-sm text-gray-500">Register a new verification officer with area assignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wallet Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="h-4 w-4 inline mr-1" />
                Officer Wallet Address *
              </label>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) => handleInputChange("walletAddress", e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Ethereum wallet address of the officer
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserPlus className="h-4 w-4 inline mr-1" />
                Officer Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="h-4 w-4 inline mr-1" />
                Designation
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => handleInputChange("designation", e.target.value)}
                placeholder="Senior Verification Officer"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Assigned Area *
              </label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
                placeholder="North Region"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Geographic area or region assigned to this officer
              </p>
            </div>

            {/* Jurisdiction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="h-4 w-4 inline mr-1" />
                Jurisdiction Tag *
              </label>
              <input
                type="text"
                value={formData.jurisdiction}
                onChange={(e) => handleInputChange("jurisdiction", e.target.value)}
                placeholder="NORTH_001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Unique jurisdiction identifier for tracking
              </p>
            </div>

            {/* Contracts */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Contracts & Responsibilities
              </label>
              <textarea
                value={formData.contracts}
                onChange={(e) => handleInputChange("contracts", e.target.value)}
                placeholder="Describe the contracts, projects, or specific responsibilities assigned to this officer..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional: List specific contracts or responsibilities
              </p>
            </div>
          </div>

          {/* Admin Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Admin Information</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Connected Wallet:</strong> {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Not connected"}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Network:</strong> Holesky Testnet</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Officer...
                </div>
              ) : (
                "Add Officer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
