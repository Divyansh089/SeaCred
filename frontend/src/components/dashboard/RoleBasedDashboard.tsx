"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Shield, Users, User, Wallet, TrendingUp, Activity, FolderOpen, Plus, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useState, useEffect } from "react";
import { getOfficer, getUser, isUserRegistered, getAllProjects } from "@/lib/credit";
import UserRegistrationModal from "@/components/ui/UserRegistrationModal";
import AddOfficerModal from "@/components/admin/AddOfficerModal";
import MintTokenModal from "@/components/admin/MintTokenModal";

export default function RoleBasedDashboard() {
  const { user, walletAddress } = useAuth();
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [isAddOfficerModalOpen, setIsAddOfficerModalOpen] = useState(false);
  const [isUserRegistrationModalOpen, setIsUserRegistrationModalOpen] = useState(false);
  const [officerDetails, setOfficerDetails] = useState<{
    name: string;
    designation: string;
    area: string;
    contracts: string;
    jurisdiction: string;
    walletAddress: string;
    isActive: boolean;
    assignedAt: number;
  } | null>(null);
  const [userDetails, setUserDetails] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    district: string;
    walletAddress: string;
    isRegistered: boolean;
    registeredAt: number;
    role: string;
  } | null>(null);
  const [isLoadingOfficer, setIsLoadingOfficer] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [totalProjects, setTotalProjects] = useState(0);
  const [assignedProjects, setAssignedProjects] = useState(0);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingApprovedProjects, setIsLoadingApprovedProjects] = useState(false);
  const [approvedProjects, setApprovedProjects] = useState<{
    id: number;
    name: string;
    description: string;
    projectType: string;
    startDate: number;
    endDate: number;
    projectAddress: string;
    city: string;
    state: string;
    landArea: number;
    estimatedCredits: number;
    ipfsUrl: string;
    owner: string;
    assignedOfficer: string;
    isActive: boolean;
    createdAt: number;
    verificationStatus: number;
  }[]>([]);
  const [selectedProject, setSelectedProject] = useState<{
    id: number;
    name: string;
    description: string;
    projectType: string;
    startDate: number;
    endDate: number;
    projectAddress: string;
    city: string;
    state: string;
    landArea: number;
    estimatedCredits: number;
    ipfsUrl: string;
    owner: string;
    assignedOfficer: string;
    isActive: boolean;
    createdAt: number;
    verificationStatus: number;
  } | null>(null);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getDisplayName = () => {
    console.log("=== getDisplayName Debug ===");
    console.log("user?.role:", user?.role);
    console.log("officerDetails:", officerDetails);
    console.log("walletAddress:", walletAddress);
    console.log("isLoadingOfficer:", isLoadingOfficer);
    
    if (user?.role === "officer") {
      if (officerDetails && officerDetails.name) {
        console.log("✅ Using officer name from contract:", officerDetails.name);
        return officerDetails.name;
      } else {
        console.log("❌ No officer details found, using wallet address");
        return walletAddress ? `Officer ${formatAddress(walletAddress)}` : "Officer";
      }
    }
    if (user?.role === "admin") {
      return "Administrator";
    }
    if (user?.role === "user") {
      if (userDetails && userDetails.firstName) {
        return `${userDetails.firstName} ${userDetails.lastName}`;
      } else if (user?.isRegistered) {
        return "Registered User";
      } else {
        return "Unregistered User";
      }
    }
    return "User";
  };

  // Fetch officer details if user is an officer
  useEffect(() => {
    const fetchOfficerDetails = async () => {
      if (user?.role === "officer" && walletAddress) {
        setIsLoadingOfficer(true);
        try {
          console.log("🔄 Fetching officer details for wallet:", walletAddress);
          const details = await getOfficer(walletAddress);
          console.log("✅ Officer details received:", details);
          setOfficerDetails(details);
        } catch (error) {
          console.error("❌ Failed to fetch officer details:", error);
        } finally {
          setIsLoadingOfficer(false);
        }
      }
    };

    fetchOfficerDetails();
  }, [user?.role, walletAddress]);

  // Fetch user details if user is registered
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user?.role === "user" && walletAddress && user?.isRegistered) {
        setIsLoadingUser(true);
        try {
          console.log("🔄 Fetching user details for wallet:", walletAddress);
          const details = await getUser(walletAddress);
          console.log("✅ User details received:", details);
          setUserDetails(details);
        } catch (error) {
          console.error("❌ Failed to fetch user details:", error);
        } finally {
          setIsLoadingUser(false);
        }
      }
    };

    fetchUserDetails();
  }, [user?.role, walletAddress, user?.isRegistered]);

  // Fetch projects for officers
  useEffect(() => {
    const fetchProjects = async () => {
      if (user?.role === "officer" && walletAddress) {
        setIsLoadingProjects(true);
        try {
          const allProjects = await getAllProjects();
          const assignedToOfficer = allProjects.filter(project => 
            project.assignedOfficer === walletAddress
          );
          setTotalProjects(allProjects.length);
          setAssignedProjects(assignedToOfficer.length);
        } catch (error) {
          console.error("Failed to fetch projects:", error);
        } finally {
          setIsLoadingProjects(false);
        }
      }
    };

    fetchProjects();
  }, [user?.role, walletAddress]);

  // Fetch approved projects for admins
  useEffect(() => {
    const fetchApprovedProjects = async () => {
      console.log("Dashboard - User role:", user?.role);
      console.log("Dashboard - Wallet address:", walletAddress);
      // Only fetch for admin users
      if (user?.role === "admin") {
        setIsLoadingApprovedProjects(true);
        try {
          const allProjects = await getAllProjects();
          console.log("Dashboard - All projects:", allProjects);
          
          // Filter to show only projects created by the current user
          const userProjects = allProjects.filter(project => 
            project.owner.toLowerCase() === walletAddress?.toLowerCase()
          );
          
          const approved = userProjects.filter(project => 
            Number(project.verificationStatus) === 2 // 2 = APPROVED
          );
          console.log("Dashboard - User's approved projects:", approved);
          setApprovedProjects(approved);
        } catch (error) {
          console.error("Failed to fetch approved projects:", error);
        } finally {
          setIsLoadingApprovedProjects(false);
        }
      }
    };

    fetchApprovedProjects();
  }, [user?.role, walletAddress]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-8 w-8 text-red-600" />;
      case "officer":
        return <Users className="h-8 w-8 text-blue-600" />;
      case "user":
        return <User className="h-8 w-8 text-green-600" />;
      default:
        return <User className="h-8 w-8 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "officer":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "You have full administrative access to manage the carbon credit system, including setting officer roles, minting tokens, and overseeing all operations.";
      case "officer":
        const area = officerDetails?.area ? ` for ${officerDetails.area}` : "";
        const designation = officerDetails?.designation ? ` (${officerDetails.designation})` : "";
        return `You can distribute tokens to users, verify reports, and manage the verification process${area}.${designation}`;
      case "user":
        if (user?.isRegistered) {
          const district = userDetails?.district ? ` in ${userDetails.district}` : "";
          return `You can view your carbon credits, track transactions, and manage your projects${district}.`;
        } else {
          return "Please complete your registration to access project management features and view your carbon credits.";
        }
      default:
        return "You have basic access to view your carbon credit information.";
    }
  };

  const getQuickActions = (role: string) => {
    switch (role) {
      case "admin":
        return [
          { name: "Set Officer Role", action: "addOfficer", icon: Users, type: "action" },
          { name: "Mint Tokens", action: "mintTokens", icon: TrendingUp, type: "action" },
          { name: "View All Users", href: "/users", icon: Activity, type: "link" },
          { name: "System Settings", href: "/settings", icon: Shield, type: "link" },
        ];
      case "officer":
        return [
          { name: "Total Projects", value: totalProjects, icon: FolderOpen, type: "stat" },
          { name: "Assigned to Me", value: assignedProjects, icon: Activity, type: "stat" },
          { name: "Verify Reports", href: "/verifications", icon: Activity, type: "link" },
          { name: "Credit Distribution", href: "/credits", icon: TrendingUp, type: "link" },
        ];
      case "user":
        if (user?.isRegistered) {
          return [
            { name: "View Credits", href: "/credits", icon: TrendingUp, type: "link" },
            { name: "My Projects", href: "/projects", icon: Activity, type: "link" },
            { name: "Add Project", href: "/projects/new", icon: Activity, type: "link" },
            { name: "Profile Settings", href: "/settings", icon: User, type: "link" },
          ];
        } else {
          return [
            { name: "Complete Registration", action: "register", icon: User, type: "action" },
            { name: "Learn More", href: "/about", icon: Activity, type: "link" },
          ];
        }
      default:
        return [
          { name: "View Credits", href: "/credits", icon: TrendingUp, type: "link" },
          { name: "Dashboard", href: "/dashboard", icon: Activity, type: "link" },
        ];
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          {getRoleIcon(user.role)}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {getDisplayName()}!
            </h1>
            <p className="text-gray-600 mt-1">{getRoleDescription(user.role)}</p>
          </div>
          <Badge className={getRoleColor(user.role)}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        </div>
        
        {/* Wallet Information */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Connected Wallet:</span>
            <span className="text-sm text-gray-600 font-mono">
              {walletAddress ? formatAddress(walletAddress) : "Not connected"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getQuickActions(user.role).map((action, index) => (
          <div 
            key={index} 
            className={`p-6 transition-shadow bg-white rounded-lg shadow border border-gray-200 ${
              action.type === "stat" ? "" : "hover:shadow-lg cursor-pointer"
            }`}
            onClick={() => {
              if (action.type === "stat") {
                // Stats cards are not clickable
                return;
              }
              if ("action" in action && action.action === "register") {
                setIsUserRegistrationModalOpen(true);
              } else if ("action" in action && action.action === "addOfficer") {
                setIsAddOfficerModalOpen(true);
              } else if ("action" in action && action.action === "mintTokens") {
                setIsMintModalOpen(true);
              } else if ("href" in action && action.href) {
                window.location.href = action.href;
              }
            }}
          >
            <div className="flex items-center space-x-3">
              <action.icon className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-medium text-gray-900">{action.name}</h3>
                {action.type === "stat" ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600">
                      {isLoadingProjects ? "..." : ("value" in action ? action.value : 0)}
                    </span>
                    <span className="text-sm text-gray-500">projects</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Quick access</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role-Specific Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Wallet Connected</p>
                <p className="text-xs text-gray-500">Just now</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Role Detected</p>
                <p className="text-xs text-gray-500">Role: {user.role}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* System Status */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Smart Contract</span>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Network</span>
              <Badge className="bg-blue-100 text-blue-800">Holesky Testnet</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Wallet Status</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Role-Specific Content */}
      {user.role === "admin" && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Approved Projects</h3>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-100 text-green-800">
                {approvedProjects.length} {approvedProjects.length === 1 ? 'Project' : 'Projects'}
              </Badge>
              <button
                onClick={() => setIsMintModalOpen(true)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Mint Tokens
              </button>
            </div>
          </div>
          {isLoadingApprovedProjects ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading approved projects...</p>
            </div>
          ) : approvedProjects.length > 0 ? (
            <div className="space-y-4">
                             {approvedProjects.map((project) => (
                                    <div 
                     key={project.id} 
                     className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                   >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {project.city}, {project.state} • {project.projectType.replace("_", " ")}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Land Area: {project.landArea} hectares</span>
                        <span>Estimated Credits: {project.estimatedCredits}</span>
                        <span>Created: {new Date(project.createdAt * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>
                                         <div className="flex items-center space-x-2">
                       <Badge className="bg-green-100 text-green-800">Approved</Badge>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           // Set the selected project and open mint modal
                           setSelectedProject(project);
                           setIsMintModalOpen(true);
                         }}
                         className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                       >
                         <Send className="h-3 w-3 mr-1" />
                         Mint to Officer
                       </button>
                     </div>
                   </div>
                   {project.assignedOfficer && project.assignedOfficer !== "0x0000000000000000000000000000000000000000" && (
                     <div className="mt-2 text-xs text-gray-500">
                       Verified by: {formatAddress(project.assignedOfficer)}
                     </div>
                   )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No approved projects found</p>
              <p className="text-sm text-gray-500 mt-1">Projects will appear here once they are verified and approved</p>
            </div>
          )}
        </Card>
      )}

      {/* Officer-specific content */}
      {user.role === "officer" && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Officer Dashboard</h3>
          <div className="prose prose-sm max-w-none">
            <div className="space-y-3">
              <p className="text-gray-600">
                As a verification officer, you can:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>View total projects in the system</li>
                <li>See projects assigned to you for verification</li>
                <li>Verify carbon credit reports and projects</li>
                <li>Distribute tokens to regular users</li>
                <li>Track your verification and distribution history</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* User-specific content */}
      {user.role === "user" && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Dashboard</h3>
          <div className="prose prose-sm max-w-none">
            <div className="space-y-3">
              <p className="text-gray-600">
                As a regular user, you can:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>View your carbon credit balance</li>
                <li>Track your transaction history</li>
                <li>Access project reports and documentation</li>
                <li>Monitor your credit accumulation</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Modals */}
      <UserRegistrationModal
        isOpen={isUserRegistrationModalOpen}
        onClose={() => setIsUserRegistrationModalOpen(false)}
        onSuccess={() => {
          // Refresh the page to update user status
          window.location.reload();
        }}
        walletAddress={walletAddress || ""}
      />

      {/* Admin Modals */}
      <AddOfficerModal
        isOpen={isAddOfficerModalOpen}
        onClose={() => setIsAddOfficerModalOpen(false)}
        onSuccess={() => {
          // Optionally refresh or show success message
          console.log("Officer added successfully");
        }}
      />

      <MintTokenModal
        isOpen={isMintModalOpen}
        onClose={() => {
          setIsMintModalOpen(false);
          setSelectedProject(null);
        }}
        onSuccess={() => {
          // Optionally refresh or show success message
          console.log("Tokens minted successfully");
        }}
        preSelectedProject={selectedProject}
      />

    </div>
  );
}
