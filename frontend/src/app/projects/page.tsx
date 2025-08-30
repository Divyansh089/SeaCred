"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ExportReportButton from "@/components/ui/ExportReportButton";
import Badge from "@/components/ui/Badge";
import { getAllProjects, getUserProjects, getOfficerAssignedProjects } from "@/lib/credit";
import {
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { CarbonProject } from "@/types";

const mockProjects: CarbonProject[] = [
  {
    id: "1",
    name: "Solar Farm Maharashtra",
    description: "Large scale solar installation reducing grid dependency",
    location: "Maharashtra, India",
    projectType: "renewable_energy",
    status: "active",
    totalCredits: 250000,
    availableCredits: 180000,
    pricePerCredit: 12.5,
    projectAuthorityId: "3",
    documents: [],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-08-20"),
    verificationStatus: "verified",
  },
  {
    id: "2",
    name: "Forest Conservation Kerala",
    description: "Preventing deforestation and promoting biodiversity",
    location: "Kerala, India",
    projectType: "forestry",
    status: "pending",
    totalCredits: 500000,
    availableCredits: 500000,
    pricePerCredit: 15.75,
    projectAuthorityId: "3",
    documents: [],
    createdAt: new Date("2024-07-10"),
    updatedAt: new Date("2024-08-15"),
    verificationStatus: "pending",
  },
  {
    id: "3",
    name: "Wind Energy Gujarat",
    description: "Offshore wind turbines generating clean energy",
    location: "Gujarat, India",
    projectType: "renewable_energy",
    status: "approved",
    totalCredits: 300000,
    availableCredits: 300000,
    pricePerCredit: 11.25,
    projectAuthorityId: "3",
    documents: [],
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-08-10"),
    verificationStatus: "verified",
  },
  {
    id: "4",
    name: "Biogas Plant Punjab",
    description: "Converting agricultural waste to clean energy",
    location: "Punjab, India",
    projectType: "methane_capture",
    status: "rejected",
    totalCredits: 150000,
    availableCredits: 0,
    pricePerCredit: 14.0,
    projectAuthorityId: "3",
    documents: [],
    createdAt: new Date("2024-05-20"),
    updatedAt: new Date("2024-07-30"),
    verificationStatus: "rejected",
  },
];

export default function ProjectsPage() {
  const { user, walletAddress } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from contract
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        let allProjects = [];
        
        // Fetch projects based on user role
        if (user?.role === "admin") {
          // Admin sees all projects
          allProjects = await getAllProjects();
        } else if (user?.role === "officer" && walletAddress) {
          // Officer sees only projects assigned to them
          allProjects = await getOfficerAssignedProjects(walletAddress);
        } else if (user?.role === "project_authority" && walletAddress) {
          // Project authority sees their own projects
          const userProjectIds = await getUserProjects(walletAddress);
          const allProjectsData = await getAllProjects();
          allProjects = allProjectsData.filter(project => 
            userProjectIds.includes(project.id)
          );
        } else if (walletAddress) {
          // Regular users see projects they created
          const allProjectsData = await getAllProjects();
          allProjects = allProjectsData.filter(project => 
            project.owner.toLowerCase() === walletAddress.toLowerCase()
          );
        }
        
        console.log(`Fetched ${allProjects.length} projects for ${user?.role} user`);
        setProjects(allProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        // Fallback to mock data if contract fails
        setProjects(mockProjects);
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

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${project.city}, ${project.state}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || (project.isActive ? "active" : "pending") === selectedStatus;
    const matchesType =
      selectedType === "all" || project.projectType === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              {user?.role === "officer" ? "My Assigned Projects" : 
               user?.role === "admin" ? "All Carbon Credit Projects" :
               "Carbon Credit Projects"}
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              {user?.role === "officer" ? "Projects assigned to you for verification and monitoring." :
               user?.role === "admin" ? "A list of all carbon credit projects including their status, location, and credit information." :
               "A list of carbon credit projects including their status, location, and credit information."}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:flex space-x-3">
            <ExportReportButton
              data={{
                projects: filteredProjects,
                stats: {
                  total: filteredProjects.length,
                  pending: filteredProjects.filter(
                    (p) => p.status === "pending"
                  ).length,
                  approved: filteredProjects.filter(
                    (p) => p.status === "approved"
                  ).length,
                  active: filteredProjects.filter((p) => p.status === "active")
                    .length,
                  completed: filteredProjects.filter(
                    (p) => p.status === "completed"
                  ).length,
                  rejected: filteredProjects.filter(
                    (p) => p.status === "rejected"
                  ).length,
                },
                userRole: user?.role,
              }}
              reportType="Projects Report"
              variant="dropdown"
            />
            {(user?.role === "project_authority" || user?.role === "user") && (
              <a
                href="/projects/new"
                className="inline-flex items-center gap-x-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                New Project
              </a>
            )}
            {user?.role === "officer" && (
              <>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  disabled={loading}
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <a
                  href="/verifications"
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <svg className="-ml-0.5 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verification Dashboard
                </a>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm sm:leading-6"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm sm:leading-6"
            >
              <option value="all">All Types</option>
              <option value="forestry">Forestry</option>
              <option value="renewable_energy">Renewable Energy</option>
              <option value="energy_efficiency">Energy Efficiency</option>
              <option value="methane_capture">Methane Capture</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {user?.role === "officer" ? "Loading your assigned projects..." : "Loading projects..."}
            </p>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600">
                    <a
                      href={`/projects/${project.id}`}
                      className="focus:outline-none"
                    >
                      <span className="absolute inset-0" aria-hidden="true" />
                      {project.name}
                    </a>
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {project.description}
                  </p>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
              </div>

              <div className="mt-4 flex items-center text-sm text-gray-500">
                <MapPinIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                {project.city}, {project.state}
              </div>

              <div className="mt-2 flex items-center text-sm text-gray-500">
                <CalendarIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                Created{" "}
                {new Date(project.createdAt * 1000).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant="info">
                    {project.projectType.replace("_", " ")}
                  </Badge>
                  <Badge
                    variant={
                      project.isActive
                        ? "success"
                        : "warning"
                    }
                  >
                    {project.isActive ? "active" : "pending"}
                  </Badge>
                  {user?.role === "officer" && (
                    <Badge
                      variant={
                        project.verificationStatus === 0 ? "warning" :
                        project.verificationStatus === 1 ? "info" :
                        project.verificationStatus === 2 ? "success" :
                        "error"
                      }
                    >
                      {project.verificationStatus === 0 ? "pending" :
                       project.verificationStatus === 1 ? "in progress" :
                       project.verificationStatus === 2 ? "approved" :
                       "rejected"}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-500">Estimated Credits:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {project.estimatedCredits.toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    <span className="ml-1 font-medium">
                      {project.landArea} acres
                    </span>
                  </div>
                </div>
                {user?.role === "officer" && project.verificationStatus === 0 && (
                  <div className="mt-3">
                    <a
                      href={`/verifications/new?projectId=${project.id}`}
                      className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Verification
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        )}

        {!loading && filteredProjects.length === 0 && (
          <div className="mt-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No projects found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === "officer" 
                ? "No projects have been assigned to you yet. Contact an administrator to get assigned to projects."
                : "Try adjusting your search criteria or create a new project."
              }
            </p>
            {(user?.role === "project_authority" || user?.role === "user") && (
              <div className="mt-6">
                <a
                  href="/projects/new"
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                >
                  <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                  Create New Project
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
