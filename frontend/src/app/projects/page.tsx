"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ExportReportButton from "@/components/ui/ExportReportButton";
import Badge from "@/components/ui/Badge";
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
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || project.status === selectedStatus;
    const matchesType =
      selectedType === "all" || project.projectType === selectedType;

    // Project authorities only see their own projects
    if (user?.role === "project_authority") {
      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        project.projectAuthorityId === user.id
      );
    }

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Carbon Credit Projects
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all carbon credit projects including their status,
              location, and credit information.
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
            {user?.role === "project_authority" && (
              <a
                href="/projects/new"
                className="inline-flex items-center gap-x-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                New Project
              </a>
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

        {/* Projects Grid */}
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
                {project.location}
              </div>

              <div className="mt-2 flex items-center text-sm text-gray-500">
                <CalendarIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                Created{" "}
                {project.createdAt.toLocaleDateString("en-US", {
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
                      project.status === "active"
                        ? "success"
                        : project.status === "pending"
                        ? "warning"
                        : project.status === "rejected"
                        ? "error"
                        : "default"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-500">Available Credits:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {project.availableCredits.toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    <span className="ml-1 font-medium">
                      {project.pricePerCredit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
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
              Try adjusting your search criteria or create a new project.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
