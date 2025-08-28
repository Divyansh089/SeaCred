"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  PhotoIcon,
  MapPinIcon,
  CalculatorIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon,
  DownloadIcon,
} from "@heroicons/react/24/outline";
import { CarbonProject, VerificationReport } from "@/types";
import Badge from "@/components/ui/Badge";

interface VerificationDetailsProps {
  project: CarbonProject;
  onClose: () => void;
}

interface VerificationStep {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  description: string;
  completedAt?: Date;
  assignedTo?: string;
  notes?: string;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
}

interface ValidationCheck {
  id: string;
  category: string;
  check: string;
  status: "pass" | "fail" | "warning" | "pending";
  details: string;
  required: boolean;
}

export default function VerificationDetails({
  project,
  onClose,
}: VerificationDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock verification steps
  const verificationSteps: VerificationStep[] = [
    {
      id: "1",
      name: "Document Review",
      status: "completed",
      description: "Review of project documentation and legal compliance",
      completedAt: new Date("2024-08-18"),
      assignedTo: "Jane Officer",
      notes: "All required documents submitted and verified. Legal compliance confirmed.",
      documents: [
        { id: "1", name: "Document Review Report.pdf", type: "pdf", url: "#" },
      ],
    },
    {
      id: "2",
      name: "Site Inspection",
      status: "in_progress",
      description: "Physical site inspection and verification",
      assignedTo: "Jane Officer",
      notes: "Site visit scheduled for next week. Preliminary assessment completed.",
    },
    {
      id: "3",
      name: "Technical Assessment",
      status: "pending",
      description: "Technical feasibility and methodology validation",
    },
    {
      id: "4",
      name: "Environmental Impact",
      status: "pending",
      description: "Environmental impact assessment and mitigation review",
    },
    {
      id: "5",
      name: "Carbon Calculation",
      status: "pending",
      description: "Carbon credit calculation methodology validation",
    },
    {
      id: "6",
      name: "Final Verification",
      status: "pending",
      description: "Final verification and approval process",
    },
  ];

  // Mock validation checks
  const validationChecks: ValidationCheck[] = [
    {
      id: "1",
      category: "Documentation",
      check: "Project Proposal",
      status: "pass",
      details: "Complete and properly formatted",
      required: true,
    },
    {
      id: "2",
      category: "Documentation",
      check: "Environmental Assessment",
      status: "pass",
      details: "Comprehensive environmental impact study provided",
      required: true,
    },
    {
      id: "3",
      category: "Technical",
      check: "Methodology Validation",
      status: "warning",
      details: "Methodology approved with minor modifications required",
      required: true,
    },
    {
      id: "4",
      category: "Technical",
      check: "Technology Assessment",
      status: "pass",
      details: "Proven technology with good track record",
      required: true,
    },
    {
      id: "5",
      category: "Financial",
      check: "Financial Viability",
      status: "pass",
      details: "Strong financial projections and funding secured",
      required: true,
    },
    {
      id: "6",
      category: "Environmental",
      check: "Carbon Calculation",
      status: "pending",
      details: "Awaiting detailed carbon calculation methodology",
      required: true,
    },
    {
      id: "7",
      category: "Legal",
      check: "Regulatory Compliance",
      status: "pass",
      details: "All regulatory requirements met",
      required: true,
    },
    {
      id: "8",
      category: "Social",
      check: "Community Impact",
      status: "pass",
      details: "Positive community impact assessment",
      required: false,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "pass":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case "failed":
      case "fail":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "pass":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "failed":
      case "fail":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: InformationCircleIcon },
    { id: "steps", name: "Verification Steps", icon: DocumentTextIcon },
    { id: "validation", name: "Validation Checks", icon: ShieldCheckIcon },
    { id: "documents", name: "Documents", icon: DocumentTextIcon },
    { id: "calculations", name: "Carbon Calculations", icon: CalculatorIcon },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Verification Details - {project.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive verification and validation information
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Project Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{project.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">
                      {project.projectType.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Land Area:</span>
                    <span className="font-medium">{project.landArea} hectares</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Credits:</span>
                    <span className="font-medium">
                      {project.totalCredits.toLocaleString()} tCO2e
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Verification Status
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Overall Status:</span>
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
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assigned Officer:</span>
                    <span className="font-medium">
                      {project.assignedOfficerId || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
                      {project.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">
                      {project.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Progress Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Steps Completed:</span>
                    <span className="font-medium">
                      {verificationSteps.filter((s) => s.status === "completed").length} / {verificationSteps.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Validation Passed:</span>
                    <span className="font-medium">
                      {validationChecks.filter((v) => v.status === "pass").length} / {validationChecks.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Documents:</span>
                    <span className="font-medium">{project.documents.length} files</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Images:</span>
                    <span className="font-medium">
                      {project.landImages?.length || 0} files
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Quick Actions
              </h3>
              <div className="flex space-x-4">
                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Start Verification
                </button>
                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View Documents
                </button>
                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verification Steps Tab */}
        {activeTab === "steps" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Verification Workflow Steps
              </h3>
              <Badge variant="info">
                {verificationSteps.filter((s) => s.status === "completed").length} / {verificationSteps.length} Completed
              </Badge>
            </div>
            
            <div className="space-y-4">
              {verificationSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(step.status)}
                          <h4 className="text-lg font-medium text-gray-900">
                            {step.name}
                          </h4>
                          <Badge
                            variant={
                              step.status === "completed"
                                ? "success"
                                : step.status === "in_progress"
                                ? "info"
                                : "warning"
                            }
                          >
                            {step.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {step.description}
                        </p>
                        {step.assignedTo && (
                          <p className="text-xs text-gray-500 mt-1">
                            Assigned to: {step.assignedTo}
                          </p>
                        )}
                        {step.completedAt && (
                          <p className="text-xs text-gray-500">
                            Completed: {step.completedAt.toLocaleDateString()}
                          </p>
                        )}
                        {step.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Notes:</strong> {step.notes}
                          </div>
                        )}
                        {step.documents && step.documents.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Documents:</p>
                            <div className="flex space-x-2">
                              {step.documents.map((doc) => (
                                <button
                                  key={doc.id}
                                  className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                  <DocumentTextIcon className="h-3 w-3 mr-1" />
                                  {doc.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {step.status === "pending" && (
                        <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                          Start
                        </button>
                      )}
                      {step.status === "in_progress" && (
                        <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                          Continue
                        </button>
                      )}
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <EyeIcon className="h-3 w-3 mr-1" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation Checks Tab */}
        {activeTab === "validation" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Validation Checks
              </h3>
              <div className="flex space-x-2">
                <Badge variant="success">
                  {validationChecks.filter((v) => v.status === "pass").length} Passed
                </Badge>
                <Badge variant="error">
                  {validationChecks.filter((v) => v.status === "fail").length} Failed
                </Badge>
                <Badge variant="warning">
                  {validationChecks.filter((v) => v.status === "warning").length} Warnings
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(
                validationChecks.reduce((acc, check) => {
                  if (!acc[check.category]) acc[check.category] = [];
                  acc[check.category].push(check);
                  return acc;
                }, {} as Record<string, ValidationCheck[]>)
              ).map(([category, checks]) => (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    {category} Validation
                  </h4>
                  <div className="space-y-3">
                    {checks.map((check) => (
                      <div
                        key={check.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(check.status)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {check.check}
                              </span>
                              {check.required && (
                                <Badge variant="error" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{check.details}</p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            check.status === "pass"
                              ? "success"
                              : check.status === "fail"
                              ? "error"
                              : check.status === "warning"
                              ? "warning"
                              : "default"
                          }
                        >
                          {check.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Project Documents
              </h3>
              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Upload Document
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Project Documents ({project.documents.length})
                </h4>
                <div className="space-y-2">
                  {project.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Uploaded {doc.uploadedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Land Images ({project.landImages?.length || 0})
                </h4>
                <div className="space-y-2">
                  {project.landImages?.map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <PhotoIcon className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {image.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Uploaded {image.uploadedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button className="text-green-600 hover:text-green-800">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Carbon Calculations Tab */}
        {activeTab === "calculations" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Carbon Credit Calculations
              </h3>
              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <CalculatorIcon className="h-4 w-4 mr-2" />
                Recalculate
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Calculation Parameters
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Land Area:</span>
                    <span className="font-medium">{project.landArea} hectares</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project Duration:</span>
                    <span className="font-medium">10 years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Baseline Scenario:</span>
                    <span className="font-medium">Business as usual</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Methodology:</span>
                    <span className="font-medium">AR-ACM0003</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verification Period:</span>
                    <span className="font-medium">Annual</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Carbon Credits Summary
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Credits:</span>
                    <span className="font-medium">
                      {project.totalCredits.toLocaleString()} tCO2e
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Average:</span>
                    <span className="font-medium">
                      {(project.totalCredits / 10).toLocaleString()} tCO2e/year
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per Credit:</span>
                    <span className="font-medium">${project.pricePerCredit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-medium">
                      ${(project.totalCredits * project.pricePerCredit).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-blue-900 mb-3">
                Calculation Methodology
              </h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  <strong>Methodology:</strong> AR-ACM0003 - Afforestation and reforestation of degraded land
                </p>
                <p>
                  <strong>Formula:</strong> Carbon Credits = (Baseline Emissions - Project Emissions) × Leakage Factor
                </p>
                <p>
                  <strong>Verification:</strong> Annual monitoring and verification required
                </p>
                <p>
                  <strong>Uncertainty:</strong> ±15% margin of error applied to calculations
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
