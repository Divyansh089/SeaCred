"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { CarbonProject, VerificationReport, ProjectWorkflow } from "@/types";
import WorkflowManager from "@/components/verification/WorkflowManager";
import VerificationReportForm from "@/components/verification/VerificationReportForm";
import AIVerificationPanel from "@/components/ai/AIVerificationPanel";

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
    assignedOfficerId: null,
    landArea: 200,
  },
];

const verificationStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  verified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function VerificationsPage() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedProject, setSelectedProject] = useState<CarbonProject | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("projects");

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

  const filteredProjects = mockProjects.filter((project) => {
    const matchesStatus =
      selectedStatus === "all" || project.verificationStatus === selectedStatus;

    // Officers only see projects assigned to them or unassigned
    if (user?.role === "officer") {
      return (
        matchesStatus &&
        (project.assignedOfficerId === user.id || !project.assignedOfficerId)
      );
    }

    return matchesStatus;
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

  const handleAIAnalysisComplete = (results: {
    success: boolean;
    data: unknown;
  }) => {
    console.log("AI analysis completed:", results);
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Project Verifications
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Review and verify carbon credit projects for compliance and
              accuracy.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {
                        mockProjects.filter(
                          (p) => p.verificationStatus === "pending"
                        ).length
                      }
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
                  <DocumentTextIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      In Progress
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {
                        mockProjects.filter(
                          (p) =>
                            p.assignedOfficerId &&
                            p.verificationStatus === "pending"
                        ).length
                      }
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
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Verified
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {
                        mockProjects.filter(
                          (p) => p.verificationStatus === "verified"
                        ).length
                      }
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
                  <XCircleIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Rejected
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {
                        mockProjects.filter(
                          (p) => p.verificationStatus === "rejected"
                        ).length
                      }
                    </dd>
                  </dl>
                </div>
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

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <>
            {/* Filters */}
            <div className="mt-6">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm sm:leading-6"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Projects List */}
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <li key={project.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {project.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {project.location} •{" "}
                              {project.projectType.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              verificationStatusColors[
                                project.verificationStatus
                              ]
                            }`}
                          >
                            {project.verificationStatus}
                          </span>
                          <button
                            onClick={() => setSelectedProject(project)}
                            className="inline-flex items-center text-sm text-green-600 hover:text-green-500"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <UserIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {project.assignedOfficerId
                              ? "Assigned"
                              : "Unassigned"}
                          </p>
                                                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                    <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                    Created {project.createdAt.toLocaleDateString('en-US')}
                                  </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <DocumentTextIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {project.documents.length} documents
                        </div>
                      </div>

                      {/* Action buttons for officers */}
                      {user?.role === "officer" && (
                        <div className="mt-3 flex space-x-3">
                          {project.verificationStatus === "pending" &&
                            !project.assignedOfficerId && (
                              <button
                                onClick={() => handleAssignToMe(project.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                              >
                                Assign to Me
                              </button>
                            )}
                          {project.assignedOfficerId === user.id && (
                            <button
                              onClick={() => {
                                setSelectedProject(project);
                                setActiveTab("workflow");
                              }}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                              Start Verification
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {filteredProjects.length === 0 && (
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
      </div>
    </DashboardLayout>
  );
}
