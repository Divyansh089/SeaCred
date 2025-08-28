"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import {
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserIcon,
  ArrowLeftIcon,
  EyeIcon,
  PencilIcon,
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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<CarbonProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projectId = params.id as string;
    const foundProject = mockProjects.find(p => p.id === projectId);
    
    if (foundProject) {
      setProject(foundProject);
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Project Not Found</h2>
            <p className="mt-2 text-gray-600">
              The project you're looking for doesn't exist.
            </p>
            <button
              onClick={() => router.push("/projects")}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Projects
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/projects")}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Projects
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="mt-1 text-sm text-gray-600">{project.description}</p>
            </div>
            
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <EyeIcon className="h-4 w-4 mr-2" />
                View Details
              </button>
              {user?.role === "project_authority" && (
                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Project
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Project Information</h2>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Basic Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 flex items-center text-sm text-gray-900">
                      <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {project.location}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Project Type</dt>
                    <dd className="mt-1">
                      <Badge variant="info">
                        {project.projectType.replace("_", " ")}
                      </Badge>
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
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
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 flex items-center text-sm text-gray-900">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {project.createdAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Credits Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Carbon Credits</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Credits</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.totalCredits.toLocaleString('en-US')} tCO2e
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Available Credits</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.availableCredits.toLocaleString('en-US')} tCO2e
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Price per Credit</dt>
                    <dd className="mt-1 flex items-center text-sm text-gray-900">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {project.pricePerCredit}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Verification Status</dt>
                    <dd className="mt-1">
                      <Badge
                        variant={
                          project.verificationStatus === "verified"
                            ? "success"
                            : project.verificationStatus === "pending"
                            ? "warning"
                            : "error"
                        }
                      >
                        {project.verificationStatus}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Documents */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Documents</h3>
              {project.documents && project.documents.length > 0 ? (
                <div className="space-y-2">
                  {project.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center p-3 border border-gray-200 rounded-md">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded {doc.uploadedAt.toLocaleDateString('en-US')}
                        </p>
                      </div>
                      <button className="text-sm text-green-600 hover:text-green-500">
                        View
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No documents uploaded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
