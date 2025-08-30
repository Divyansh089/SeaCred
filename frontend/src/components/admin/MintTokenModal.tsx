"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { approveAndMint, getAllProjects } from "@/lib/credit";
import { X, Plus, User, FileText, FolderOpen, Send } from "lucide-react";

interface MintTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preSelectedProject?: Project | null;
}

interface Project {
  id: number;
  name: string;
  description: string;
  projectType: string;
  city: string;
  state: string;
  landArea: number;
  estimatedCredits: number;
  ipfsUrl: string;
  owner: string;
  assignedOfficer: string;
  verificationStatus: number;
  createdAt: number;
}

export default function MintTokenModal({ isOpen, onClose, onSuccess, preSelectedProject }: MintTokenModalProps) {
  const { user, walletAddress } = useAuth();
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [approvedProjects, setApprovedProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    cid: "",
    recipient: "",
    amount: "",
    submitter: "",
  });

  // Fetch approved projects when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchApprovedProjects();
    }
  }, [isOpen]);

  // Handle pre-selected project
  useEffect(() => {
    if (preSelectedProject && isOpen) {
      setSelectedProject(preSelectedProject);
      setFormData({
        cid: preSelectedProject.ipfsUrl || "",
        recipient: preSelectedProject.assignedOfficer || "",
        amount: preSelectedProject.estimatedCredits.toString(),
        submitter: preSelectedProject.owner || "",
      });
    }
  }, [preSelectedProject, isOpen]);

  const fetchApprovedProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const allProjects = await getAllProjects();
      const approved = allProjects.filter(project => 
        Number(project.verificationStatus) === 2 // 2 = APPROVED
      );
      setApprovedProjects(approved);
    } catch (error) {
      console.error("Error fetching approved projects:", error);
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to fetch approved projects.",
      });
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    const project = approvedProjects.find(p => p.id.toString() === projectId);
    if (project) {
      setSelectedProject(project);
      // Auto-fill form with project data
      setFormData({
        cid: project.ipfsUrl || "",
        recipient: project.assignedOfficer || "",
        amount: project.estimatedCredits.toString(),
        submitter: project.owner || "",
      });
    } else {
      setSelectedProject(null);
      setFormData({
        cid: "",
        recipient: "",
        amount: "",
        submitter: "",
      });
    }
  };

  const handleMintToOfficer = async () => {
    if (!selectedProject) {
      addNotification({
        type: "error",
        title: "No project selected",
        message: "Please select a project first.",
      });
      return;
    }

    if (!walletAddress) {
      addNotification({
        type: "error",
        title: "Wallet not connected",
        message: "Please connect your wallet to mint tokens.",
      });
      return;
    }

    setIsLoading(true);

    try {
      await approveAndMint(
        selectedProject.ipfsUrl || `project-${selectedProject.id}`,
        selectedProject.assignedOfficer,
        selectedProject.estimatedCredits,
        selectedProject.owner
      );

      addNotification({
        type: "success",
        title: "Tokens minted successfully",
        message: `${selectedProject.estimatedCredits} tCO2e tokens have been minted and sent to officer ${selectedProject.assignedOfficer.slice(0, 6)}...${selectedProject.assignedOfficer.slice(-4)}`,
      });

      // Reset form
      setSelectedProject(null);
      setFormData({
        cid: "",
        recipient: "",
        amount: "",
        submitter: "",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error minting tokens:", error);
      addNotification({
        type: "error",
        title: "Minting failed",
        message: "Failed to mint tokens. Please check your inputs and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress) {
      addNotification({
        type: "error",
        title: "Wallet not connected",
        message: "Please connect your wallet to mint tokens.",
      });
      return;
    }

    if (!formData.cid || !formData.recipient || !formData.amount || !formData.submitter) {
      addNotification({
        type: "error",
        title: "Missing information",
        message: "Please fill in all required fields.",
      });
      return;
    }

    setIsLoading(true);

    try {
      await approveAndMint(
        formData.cid,
        formData.recipient,
        parseFloat(formData.amount),
        formData.submitter
      );

      addNotification({
        type: "success",
        title: "Tokens minted successfully",
        message: `${formData.amount} tCO2e tokens have been minted and sent to ${formData.recipient}`,
      });

      // Reset form
      setSelectedProject(null);
      setFormData({
        cid: "",
        recipient: "",
        amount: "",
        submitter: "",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error minting tokens:", error);
      addNotification({
        type: "error",
        title: "Minting failed",
        message: "Failed to mint tokens. Please check your inputs and try again.",
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Plus className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Mint Carbon Credits</h2>
              <p className="text-sm text-gray-500">Create new carbon credits for verified projects</p>
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
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FolderOpen className="h-4 w-4 inline mr-1" />
              Select Approved Project
            </label>
            <select
              value={selectedProject?.id.toString() || ""}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Choose a project...</option>
              {approvedProjects.map((project) => (
                <option key={project.id} value={project.id.toString()}>
                  {project.name} - {project.city}, {project.state} ({project.estimatedCredits} tCO2e)
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select an approved project to auto-fill the form or use custom values below
            </p>
          </div>

          {/* Quick Mint to Officer Button */}
          {selectedProject && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Quick Mint to Officer</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Mint {selectedProject.estimatedCredits} tCO2e to {selectedProject.assignedOfficer.slice(0, 6)}...{selectedProject.assignedOfficer.slice(-4)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleMintToOfficer}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Minting...
                    </div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Mint to Officer
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Manual Form Fields */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Manual Mint Configuration</h3>
            
            {/* CID Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Project CID (Content Identifier)
              </label>
              <input
                type="text"
                value={formData.cid}
                onChange={(e) => handleInputChange("cid", e.target.value)}
                placeholder="QmHash..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Unique identifier for the verified project documentation
              </p>
            </div>

            {/* Recipient Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Recipient Address
              </label>
              <input
                type="text"
                value={formData.recipient}
                onChange={(e) => handleInputChange("recipient", e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Wallet address that will receive the minted credits
              </p>
            </div>

            {/* Amount Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (tCO2e)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="1000.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Amount of carbon credits to mint in tonnes of CO2 equivalent
              </p>
            </div>

            {/* Submitter Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submitter Address
              </label>
              <input
                type="text"
                value={formData.submitter}
                onChange={(e) => handleInputChange("submitter", e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Address of the person who submitted the project for verification
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
              <p><strong>Approved Projects:</strong> {approvedProjects.length}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Minting...
                </div>
              ) : (
                "Mint Tokens"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
