"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { officerDistribute, getAllProjects, getUser, getDashboard } from "@/lib/credit";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Send, User, Wallet, AlertCircle } from "lucide-react";

interface SendTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface UserInfo {
  walletAddress: string;
  firstName: string;
  lastName: string;
  district: string;
  projectCount: number;
}

export default function SendTokenModal({ isOpen, onClose, onSuccess }: SendTokenModalProps) {
  const { user, walletAddress } = useAuth();
  const { addNotification } = useNotifications();
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [availableUsers, setAvailableUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [availableCredits, setAvailableCredits] = useState<string>("0");

  // Fetch available users (users with projects assigned to this officer)
  useEffect(() => {
    const fetchAvailableUsers = async () => {
      if (!isOpen || user?.role !== "officer" || !walletAddress) return;

      setIsLoadingUsers(true);
      try {
        const allProjects = await getAllProjects();
        
        // Get projects assigned to this officer (case-insensitive comparison)
        const officerProjects = allProjects.filter(project => 
          project.assignedOfficer.toLowerCase() === walletAddress.toLowerCase()
        );

        // Get unique user addresses from officer's projects
        const userAddresses = [...new Set(officerProjects.map(project => project.owner))];
        
        // Fetch user details for each address
        const usersWithDetails: UserInfo[] = [];
        
        for (const address of userAddresses) {
          try {
            const userDetails = await getUser(address);
            if (userDetails.isRegistered) {
              const userProjectCount = officerProjects.filter(project => project.owner === address).length;
              usersWithDetails.push({
                walletAddress: address,
                firstName: userDetails.firstName,
                lastName: userDetails.lastName,
                district: userDetails.district,
                projectCount: userProjectCount
              });
            }
          } catch (error) {
            console.error(`Error fetching user details for ${address}:`, error);
          }
        }
        
        setAvailableUsers(usersWithDetails);
      } catch (error) {
        console.error("Error fetching available users:", error);
        addNotification({
          type: "error",
          title: "Error",
          message: "Failed to fetch available users"
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchAvailableUsers();
  }, [isOpen, user?.role, walletAddress, addNotification]);

  // Fetch available credits for the officer
  useEffect(() => {
    const fetchAvailableCredits = async () => {
      if (!isOpen || user?.role !== "officer" || !walletAddress) return;

      try {
        const dashboardData = await getDashboard(walletAddress);
        const received = parseFloat(dashboardData.officerReceived || "0");
        const distributed = parseFloat(dashboardData.officerDistributed || "0");
        const available = (received - distributed).toFixed(2);
        setAvailableCredits(available);
      } catch (error) {
        console.error("Error fetching available credits:", error);
        setAvailableCredits("0");
      }
    };

    fetchAvailableCredits();
  }, [isOpen, user?.role, walletAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !amount || parseFloat(amount) <= 0) {
      addNotification({
        type: "error",
        title: "Invalid Input",
        message: "Please select a user and enter a valid amount"
      });
      return;
    }

    if (parseFloat(amount) > parseFloat(availableCredits)) {
      addNotification({
        type: "error",
        title: "Insufficient Credits",
        message: `You only have ${availableCredits} credits available`
      });
      return;
    }

    setIsLoading(true);

    try {
      await officerDistribute(selectedUser, parseFloat(amount));

      addNotification({
        type: "success",
        title: "Tokens Sent Successfully",
        message: `${amount} tCO2e tokens have been sent to the selected user`
      });

      // Reset form
      setSelectedUser("");
      setAmount("");
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error sending tokens:", error);
      addNotification({
        type: "error",
        title: "Transaction Failed",
        message: "Failed to send tokens. Please check your inputs and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Tokens to User">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Available Credits Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Available Credits:</span>
            <span className="text-lg font-bold text-blue-900">{availableCredits} tCO2e</span>
          </div>
        </div>

        {/* User Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select User to Send Tokens
          </label>
          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading users...</span>
            </div>
          ) : availableUsers.length === 0 ? (
            <div className="text-center py-4">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No users found with projects assigned to you</p>
            </div>
          ) : (
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            >
              <option value="">Select a user...</option>
              {availableUsers.map((user) => (
                <option key={user.walletAddress} value={user.walletAddress}>
                  {user.firstName} {user.lastName} ({user.district}) - {user.projectCount} project(s) - {formatAddress(user.walletAddress)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (tCO2e)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            placeholder="Enter amount to send"
            required
          />
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Important:</p>
              <ul className="mt-1 space-y-1">
                <li>• This transaction cannot be undone</li>
                <li>• Tokens will be sent directly to the user's wallet</li>
                <li>• Make sure you have sufficient credits available</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !selectedUser || !amount || parseFloat(amount) <= 0}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send Tokens</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
