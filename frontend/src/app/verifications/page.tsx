"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ExportReportButton from "@/components/ui/ExportReportButton";
import { getAllProjects, assignOfficerToProject, getOfficerAssignedProjects } from "@/lib/credit";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { CarbonProject, VerificationReport, ProjectWorkflow, getVerificationStatusText, getVerificationStatusColor } from "@/types";
import WorkflowManager from "@/components/verification/WorkflowManager";
import VerificationReportForm from "@/components/verification/VerificationReportForm";
import AIVerificationPanel from "@/components/ai/AIVerificationPanel";
import VerificationDetails from "@/components/verification/VerificationDetails";

const mockProjects: CarbonProject[] = [
  {
    id: "1",
    name: "Amazon Rainforest Conservation",
    description: "Large-scale forest conservation project in the Amazon basin",
    location: "Brazil, Amazonas",
    projectType: "forestry",
    status: "pending",
    totalCredits: 50000,
    availableCredits: 50000,
    pricePerCredit: 15.0,
    projectAuthorityId: "authority-1",
    documents: [
      {
        id: "1",
        name: "Project Proposal.pdf",
        type: "pdf",
        url: "#",
        uploadedAt: new Date("2024-08-20"),
      },
      {
        id: "2",
        name: "Environmental Assessment.pdf",
        type: "pdf",
        url: "#",
        uploadedAt: new Date("2024-08-20"),
      },
    ],
    createdAt: new Date("2024-08-20"),
    updatedAt: new Date("2024-08-20"),
    verificationStatus: "pending",
    assignedOfficerId: "officer-1",
    landImages: [
      {
        id: "3",
        name: "Satellite Image 2024.jpg",
        type: "image",
        url: "#",
        uploadedAt: new Date("2024-08-20"),
      },
    ],
    landArea: 1000,
  },
  {
    id: "2",
    name: "Wind Farm Development",
    description: "Renewable energy project in coastal region",
    location: "Netherlands, North Sea",
    projectType: "renewable_energy",
    status: "active",
    totalCredits: 25000,
    availableCredits: 25000,
    pricePerCredit: 12.0,
    projectAuthorityId: "authority-2",
    documents: [
      {
        id: "4",
        name: "Technical Specifications.pdf",
        type: "pdf",
        url: "#",
        uploadedAt: new Date("2024-08-15"),
      },
    ],
    createdAt: new Date("2024-08-15"),
    updatedAt: new Date("2024-08-15"),
    verificationStatus: "verified",
    assignedOfficerId: "officer-1",
    landArea: 500,
  },
  {
    id: "3",
    name: "Methane Capture Facility",
    description: "Agricultural waste methane capture and utilization",
    location: "India, Punjab",
    projectType: "methane_capture",
    status: "pending",
    totalCredits: 15000,
    availableCredits: 15000,
    pricePerCredit: 18.0,
    projectAuthorityId: "authority-3",
    documents: [
      {
        id: "5",
        name: "Facility Design.pdf",
        type: "pdf",
        url: "#",
        uploadedAt: new Date("2024-08-10"),
      },
    ],
    createdAt: new Date("2024-08-10"),
    updatedAt: new Date("2024-08-10"),
    verificationStatus: "pending",
    assignedOfficerId: undefined,
    landArea: 200,
  },
];

const verificationStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  verified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function VerificationsPage() {
  const { user, walletAddress } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("projects");
  const [showVerificationDetails, setShowVerificationDetails] = useState(false);
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from contract
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        let allProjects = [];
        
        console.log("User role:", user?.role);
        console.log("Wallet address:", walletAddress);
        
        // Fetch projects based on user role
        if (user?.role === "officer" && walletAddress) {
          // Officers see projects assigned to them
          allProjects = await getOfficerAssignedProjects(walletAddress);
          console.log("Officer assigned projects:", allProjects);
        } else if (user?.role === "admin") {
          // Admins see all projects
          allProjects = await getAllProjects();
        } else {
          // Other roles see no projects
          allProjects = [];
        }
        
        setProjects(allProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [walletAddress, user?.role]);

  // Calculate dynamic status counts
  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      inProgress: 0,
      verified: 0,
      rejected: 0
    };

    projects.forEach(project => {
      // Convert BigInt to number if needed
      const statusNumber = Number(project.verificationStatus);
      
      // Map verification status from contract to our status categories
      if (statusNumber === 0) { // PENDING
        counts.pending++;
      } else if (statusNumber === 1) { // IN_PROGRESS
        counts.inProgress++;
      } else if (statusNumber === 2) { // APPROVED
        counts.verified++;
      } else if (statusNumber === 3) { // REJECTED
        counts.rejected++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  // Redirect if user doesn't have access
  if (user?.role === "project_authority") {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-gray-600">
              You don&apos;t have permission to access this page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredProjects = projects.filter((project) => {
    if (selectedStatus === "all") return true;
    
    // Convert BigInt to number if needed
    const statusNumber = Number(project.verificationStatus);
    
    // Map verification status to filter options
    const projectStatus = (() => {
      if (statusNumber === 0) return "pending";
      if (statusNumber === 1) return "inProgress";
      if (statusNumber === 2) return "verified";
      if (statusNumber === 3) return "rejected";
      return "pending";
    })();
    
    return projectStatus === selectedStatus;
  });

  const handleAssignToMe = (projectId: string) => {
    // In real app, this would be an API call
    console.log(`Assigning project ${projectId} to ${user?.name}`);
  };

  const handleWorkflowUpdate = (
    projectId: string,
    workflow: ProjectWorkflow
  ) => {
    console.log(`Workflow updated for project ${projectId}:`, workflow);
  };

  const handleReportSubmit = (report: VerificationReport) => {
    console.log("Verification report submitted:", report);
  };

  const handleAIAnalysisComplete = (results: any) => {
    console.log("AI analysis completed:", results);
  };

  const handleViewVerificationDetails = (project: CarbonProject) => {
    setSelectedProjectForDetails(project);
    setShowVerificationDetails(true);
  };

  const handleCloseVerificationDetails = () => {
    setShowVerificationDetails(false);
    setSelectedProjectForDetails(null);
  };

  const handleAssignOfficerToProject = async (projectId: number) => {
    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }
    
    try {
      const result = await assignOfficerToProject(projectId, walletAddress);
      if (result.success) {
        alert(`Successfully assigned officer ${walletAddress} to project ${projectId}`);
        // Refresh the projects list
        window.location.reload();
      } else {
        alert("Failed to assign officer to project");
      }
    } catch (error) {
      console.error("Error assigning officer:", error);
      alert("Error assigning officer to project");
    }
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:truncate sm:text-4xl sm:tracking-tight mb-3">
                Project Verifications
              </h1>
              <p className="text-lg text-gray-600">
                Review and verify carbon credit projects for compliance and accuracy.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4 flex space-x-3">
              <ExportReportButton
                data={{
                  projects: filteredProjects,
                  stats: {
                    pending: statusCounts.pending,
                    inProgress: statusCounts.inProgress,
                    completed: statusCounts.verified,
                    rejected: statusCounts.rejected,
                  },
                  userRole: user?.role,
                }}
                reportType="Verification Report"
                variant="dropdown"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.inProgress}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.verified}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("projects")}
                className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                  activeTab === "projects"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Projects
              </button>
              {selectedProject && (
                <>
                  <button
                    onClick={() => setActiveTab("workflow")}
                    className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                      activeTab === "workflow"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    Workflow
                  </button>
                  <button
                    onClick={() => setActiveTab("report")}
                    className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                      activeTab === "report"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    Report
                  </button>
                  <button
                    onClick={() => setActiveTab("ai")}
                    className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                      activeTab === "ai"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    AI Analysis
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>



        {/* Loading State */}
        {loading && (
          <div className="mt-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        )}

        {/* Projects Tab */}
        {!loading && activeTab === "projects" && (
          <>
            {/* Enhanced Filters */}
            <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="rounded-lg border border-gray-300 py-2 px-4 text-gray-900 focus:ring-2 focus:ring-green-600 focus:border-green-600 sm:text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="inProgress">In Progress</option>
                    <option value="verified">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="text-sm text-gray-500">
                  Showing {filteredProjects.length} of {projects.length} projects
                </div>
              </div>
            </div>

            {/* Enhanced Projects List */}
            <div className="mt-8 space-y-4">
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                        <DocumentTextIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {project.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <UserIcon className="h-4 w-4" />
                            <span>{project.city}, {project.state}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{project.projectType.replace("_", " ")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getVerificationStatusColor(project.verificationStatus)}`}
                      >
                        {getVerificationStatusText(project.verificationStatus)}
                      </span>
                      <button
                             onClick={() =>
                               handleViewVerificationDetails(project)
                             }
                             className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                           >
                             <EyeIcon className="h-4 w-4 mr-1" />
                             View
                           </button>
                         </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <UserIcon className="h-4 w-4 text-gray-400" />
                              <span>
                                {project.assignedOfficer && project.assignedOfficer !== "0x0000000000000000000000000000000000000000"
                                  ? `Assigned to ${project.assignedOfficer.slice(0, 6)}...${project.assignedOfficer.slice(-4)}`
                                  : "Unassigned"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CalendarIcon className="h-4 w-4 text-gray-400" />
                              <span>Created {new Date(project.createdAt * 1000).toLocaleDateString("en-US")}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                            <span>{project.ipfsUrl ? "Documents uploaded" : "No documents"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
            </div>

            {!loading && filteredProjects.length === 0 && (
              <div className="mt-12 text-center">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No projects found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No projects match your current filters.
                </p>
              </div>
            )}
          </>
        )}

        {/* Workflow Tab */}
        {activeTab === "workflow" && selectedProject && (
          <div className="mt-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Verification Workflow - {selectedProject.name}
              </h3>
              <WorkflowManager
                projectId={selectedProject.id}
                onWorkflowUpdate={(workflow) =>
                  handleWorkflowUpdate(selectedProject.id, workflow)
                }
              />
            </div>
          </div>
        )}

        {/* Report Tab */}
        {activeTab === "report" && selectedProject && (
          <div className="mt-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Verification Report - {selectedProject.name}
              </h3>
              <VerificationReportForm
                projectId={selectedProject.id}
                onReportSubmit={handleReportSubmit}
              />
            </div>
          </div>
        )}

        {/* AI Analysis Tab */}
        {activeTab === "ai" && selectedProject && (
          <div className="mt-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                AI Verification Analysis - {selectedProject.name}
              </h3>
              <AIVerificationPanel
                projectId={selectedProject.id}
                projectData={selectedProject}
                onAnalysisComplete={handleAIAnalysisComplete}
              />
            </div>
          </div>
        )}

        {/* Verification Details Modal */}
        {showVerificationDetails && selectedProjectForDetails && (
          <VerificationDetails
            project={selectedProjectForDetails}
            onClose={handleCloseVerificationDetails}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
