"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllProjects, getUser, getDashboard } from "@/lib/credit";
import { CheckCircle, Clock, User, TrendingUp, AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";

interface ProjectInfo {
  id: number;
  name: string;
  owner: string;
  estimatedCredits: number;
  verificationStatus: number;
  ownerName: string;
  ownerDistrict: string;
}

export default function CreditDistributionWorkflow() {
  const { user, walletAddress } = useAuth();
  const [assignedProjects, setAssignedProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCredits, setAvailableCredits] = useState("0");

  useEffect(() => {
    const fetchData = async () => {
      if (user?.role !== "officer" || !walletAddress) return;

      setLoading(true);
      try {
        // Fetch available credits
        const dashboardData = await getDashboard(walletAddress);
        const received = parseFloat(dashboardData.officerReceived || "0");
        const distributed = parseFloat(dashboardData.officerDistributed || "0");
        const available = (received - distributed).toFixed(2);
        setAvailableCredits(available);

        // Fetch assigned projects (case-insensitive comparison)
        const allProjects = await getAllProjects();
        
        // Filter to show only projects created by the current user
        const userProjects = allProjects.filter(project => 
          project.owner.toLowerCase() === walletAddress.toLowerCase()
        );
        
        const officerProjects = userProjects.filter(project => 
          project.assignedOfficer.toLowerCase() === walletAddress.toLowerCase()
        );

        // Get project details with user information
        const projectsWithDetails: ProjectInfo[] = [];
        for (const project of officerProjects) {
          try {
            const userDetails = await getUser(project.owner);
            projectsWithDetails.push({
              id: project.id,
              name: project.name,
              owner: project.owner,
              estimatedCredits: project.estimatedCredits,
              verificationStatus: project.verificationStatus,
              ownerName: userDetails.firstName && userDetails.lastName ? 
                `${userDetails.firstName} ${userDetails.lastName}` : 
                "Unregistered User",
              ownerDistrict: userDetails.district || "Unknown"
            });
          } catch (error) {
            console.error(`Error fetching user details for project ${project.id}:`, error);
            // Include project even if user details can't be fetched
            projectsWithDetails.push({
              id: project.id,
              name: project.name,
              owner: project.owner,
              estimatedCredits: project.estimatedCredits,
              verificationStatus: project.verificationStatus,
              ownerName: "Unregistered User",
              ownerDistrict: "Unknown"
            });
          }
        }

        setAssignedProjects(projectsWithDetails);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.role, walletAddress]);

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0: // PENDING
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 1: // IN_PROGRESS
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 2: // APPROVED
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 3: // REJECTED
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "In Progress";
      case 2:
        return "Approved";
      case 3:
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-yellow-100 text-yellow-800";
      case 1:
        return "bg-blue-100 text-blue-800";
      case 2:
        return "bg-green-100 text-green-800";
      case 3:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading workflow data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Credit Distribution Workflow</h3>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-gray-700">
            Available: {availableCredits} tCO2e
          </span>
        </div>
      </div>

      {assignedProjects.length === 0 ? (
        <div className="text-center py-8">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No projects assigned to you</p>
          <p className="text-sm text-gray-500 mt-1">
            Projects will appear here once they are assigned to you for verification
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignedProjects.map((project) => (
            <div
              key={project.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(project.verificationStatus)}
                  <div>
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-500">
                      Owner: {project.ownerName} 
                      {project.ownerName === "Unregistered User" && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Unregistered
                        </span>
                      )}
                      {project.ownerDistrict !== "Unknown" && ` (${project.ownerDistrict})`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {project.estimatedCredits.toLocaleString("en-US")} tCO2e
                    </p>
                    <p className="text-xs text-gray-500">Estimated credits</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.verificationStatus)}`}>
                    {getStatusText(project.verificationStatus)}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Project ID: {project.id}</span>
                  <span>Owner: {project.owner.slice(0, 6)}...{project.owner.slice(-4)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Workflow Steps:</h4>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. <strong>Project Assignment:</strong> Projects are assigned to you by the admin</li>
          <li>2. <strong>Verification:</strong> Review and verify the project documentation</li>
          <li>3. <strong>Approval:</strong> Submit verification report for approval</li>
          <li>4. <strong>Token Distribution:</strong> Distribute tokens to project owners</li>
        </ol>
      </div>
    </Card>
  );
}
