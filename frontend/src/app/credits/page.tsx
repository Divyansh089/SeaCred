"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ExportReportButton from "@/components/ui/ExportReportButton";
import SendTokenModal from "@/components/ui/SendTokenModal";
import CreditDistributionWorkflow from "@/components/ui/CreditDistributionWorkflow";
import { getDashboard, getAllProjects, getUser } from "@/lib/credit";
import {
  CurrencyDollarIcon,
  WalletIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { TrendingUp as TrendingUpIcon, Users, Send } from "lucide-react";

interface UserInfo {
  walletAddress: string;
  firstName: string;
  lastName: string;
  district: string;
  projectCount: number;
  totalCreditsReceived: number;
}

export default function CreditsPage() {
  const { user, walletAddress } = useAuth();
  const [contractData, setContractData] = useState<{
    mintedCumulative: string;
    burnedCumulative: string;
    officerReceived: string;
    officerDistributed: string;
    userReceived: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSendTokenModalOpen, setIsSendTokenModalOpen] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState<UserInfo[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch contract data
  useEffect(() => {
    const fetchContractData = async () => {
      try {
        setLoading(true);
        const data = await getDashboard(walletAddress || undefined);
        setContractData(data);
      } catch (error) {
        console.error("Error fetching contract data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchContractData();
    } else {
      setLoading(false);
    }
  }, [walletAddress]);

  // Fetch users assigned to this officer
  useEffect(() => {
    const fetchAssignedUsers = async () => {
      if (user?.role !== "officer" || !walletAddress) {
        console.log("Not fetching assigned users - user role:", user?.role, "wallet:", walletAddress);
        return;
      }

      setLoadingUsers(true);
      try {
        const allProjects = await getAllProjects();
        console.log("All projects:", allProjects);
        
        // Filter to show only projects created by the current user
        const userProjects = allProjects.filter(project => 
          project.owner.toLowerCase() === walletAddress.toLowerCase()
        );
        
        // Get projects assigned to this officer (case-insensitive comparison)
        const officerProjects = userProjects.filter(project => 
          project.assignedOfficer.toLowerCase() === walletAddress.toLowerCase()
        );
        console.log("Officer projects:", officerProjects);
        console.log("Officer wallet address:", walletAddress);

        // Get unique user addresses from officer's projects
        const userAddresses = [...new Set(officerProjects.map(project => project.owner))];
        console.log("Unique user addresses:", userAddresses);
        
        // Fetch user details for each address
        const usersWithDetails: UserInfo[] = [];
        
        for (const address of userAddresses) {
          try {
            const userDetails = await getUser(address);
            console.log(`User details for ${address}:`, userDetails);
            
            const userProjectCount = officerProjects.filter(project => project.owner === address).length;
            // Calculate total credits for this user (this would come from contract in real implementation)
            // For now, we'll use a mock calculation based on project count
            const totalCreditsReceived = userProjectCount * 100; // Mock calculation - in real implementation this would come from userReceived mapping
            
            if (userDetails.isRegistered) {
              usersWithDetails.push({
                walletAddress: address,
                firstName: userDetails.firstName,
                lastName: userDetails.lastName,
                district: userDetails.district,
                projectCount: userProjectCount,
                totalCreditsReceived
              });
            } else {
              usersWithDetails.push({
                walletAddress: address,
                firstName: "Unregistered",
                lastName: "User",
                district: "Unknown",
                projectCount: userProjectCount,
                totalCreditsReceived
              });
            }
          } catch (error) {
            console.error(`Error fetching user details for ${address}:`, error);
            // Include unregistered users with basic info
            const userProjectCount = officerProjects.filter(project => project.owner === address).length;
            const totalCreditsReceived = userProjectCount * 100;
            
            usersWithDetails.push({
              walletAddress: address,
              firstName: "Unregistered",
              lastName: "User",
              district: "Unknown",
              projectCount: userProjectCount,
              totalCreditsReceived
            });
          }
        }
        
        console.log("Final users with details:", usersWithDetails);
        setAssignedUsers(usersWithDetails);
      } catch (error) {
        console.error("Error fetching assigned users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchAssignedUsers();
  }, [user?.role, walletAddress]);

  // Calculate totals based on user role and contract data
  const getTotalCredits = () => {
    if (loading) return "Loading...";
    
    if (user?.role === "admin") {
      return contractData?.mintedCumulative || "0";
    } else if (user?.role === "officer") {
      return contractData?.officerReceived || "0";
    } else if (user?.role === "user") {
      return contractData?.userReceived || "0";
    }
    
    return "0";
  };

  const getAvailableCredits = () => {
    if (loading) return "Loading...";
    
    if (user?.role === "admin") {
      const minted = parseFloat(contractData?.mintedCumulative || "0");
      const burned = parseFloat(contractData?.burnedCumulative || "0");
      return (minted - burned).toFixed(2);
    } else if (user?.role === "officer") {
      const received = parseFloat(contractData?.officerReceived || "0");
      const distributed = parseFloat(contractData?.officerDistributed || "0");
      return (received - distributed).toFixed(2);
    } else if (user?.role === "user") {
      return contractData?.userReceived || "0";
    }
    
    return "0";
  };

  const getWalletAddress = () => {
    return walletAddress || "0x0000000000000000000000000000000000000000";
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Carbon Credits Management
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              {user?.role === "officer" &&
                "Manage your verification credits and distribute tokens to users"}
              {user?.role === "admin" &&
                "Monitor credit distributions and blockchain operations"}
              {user?.role === "user" &&
                "View your carbon credit balance and transaction history"}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4 flex space-x-3">
            {user?.role === "officer" && (
              <button
                type="button"
                onClick={() => setIsSendTokenModalOpen(true)}
                className="inline-flex items-center gap-x-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                                 <Send className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                Send Tokens
              </button>
            )}
            <ExportReportButton
              data={{
                totalCredits: getTotalCredits(),
                availableCredits: getAvailableCredits(),
                walletAddress: getWalletAddress(),
                assignedUsers: assignedUsers,
              }}
              reportType="Carbon Credits Report"
              variant="dropdown"
            />
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
                      {loading ? "Loading..." : `${parseFloat(getTotalCredits()).toLocaleString("en-US")} tCO2e`}
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
                      {loading ? "Loading..." : `${parseFloat(getAvailableCredits()).toLocaleString("en-US")} tCO2e`}
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
                      {user?.role === "admin" ? "Burned Credits" : 
                       user?.role === "officer" ? "Officer Share" : "Authority Share"}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user?.role === "admin" ? 
                        (loading ? "Loading..." : `${parseFloat(contractData?.burnedCumulative || "0").toLocaleString("en-US")} tCO2e`) :
                        user?.role === "officer" ? "10%" : "80%"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Distribution Content */}
        <div className="mt-8">
          {user?.role === "officer" ? (
            // Officer view - show workflow and users
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Credit Distribution Workflow */}
              <CreditDistributionWorkflow />
              
              {/* Assigned Users */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Assigned Users
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Users assigned to you for token distribution
                  </p>
                </div>

                <div className="border-t border-gray-200">
                  {loadingUsers ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading assigned users...</p>
                    </div>
                  ) : assignedUsers.length > 0 ? (
                    <ul role="list" className="divide-y divide-gray-200">
                      {assignedUsers.map((userInfo) => (
                        <li key={userInfo.walletAddress}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <UserIcon className="h-5 w-5 text-green-600 mr-3" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {userInfo.firstName} {userInfo.lastName}
                                    {userInfo.firstName === "Unregistered" && (
                                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Unregistered
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {userInfo.district} • {userInfo.projectCount} project(s)
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">
                                    {userInfo.totalCreditsReceived.toLocaleString("en-US")} tCO2e
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Total received
                                  </p>
                                </div>
                                <button
                                  onClick={() => setIsSendTokenModalOpen(true)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                  disabled={userInfo.firstName === "Unregistered"}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  {userInfo.firstName === "Unregistered" ? "User Not Registered" : "Send Tokens"}
                                </button>
                              </div>
                            </div>

                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <WalletIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                  {formatAddress(userInfo.walletAddress)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No users assigned to you</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {user?.role === "officer" 
                          ? "Users will appear here once they have projects assigned to you" 
                          : "Only verification officers can see assigned users. Please log in as an officer account to view assigned users."
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Admin/User view - show distribution history
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Credit Distribution
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Credit distribution history and statistics
                </p>
              </div>
              <div className="border-t border-gray-200">
                <div className="text-center py-8">
                  <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Credit distribution history</p>
                  <p className="text-sm text-gray-500 mt-1">Distribution records will appear here</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Send Token Modal */}
        <SendTokenModal
          isOpen={isSendTokenModalOpen}
          onClose={() => setIsSendTokenModalOpen(false)}
          onSuccess={() => {
            // Refresh the page or update data
            window.location.reload();
          }}
        />
      </div>
    </DashboardLayout>
  );
}
