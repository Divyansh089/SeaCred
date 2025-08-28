"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PhotoIcon,
  CogIcon,
  UserIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import {
  WorkflowStep,
  ProjectWorkflow,
  VerificationReport,
  AIVerificationRequest,
  CarbonProject,
} from "@/types";

interface WorkflowManagerProps {
  projectId: string;
  onWorkflowUpdate?: (workflow: ProjectWorkflow) => void;
}

const defaultWorkflowSteps: WorkflowStep[] = [
  {
    id: "project_submission",
    name: "Project Submission",
    description:
      "Project authority submits initial project details and documents",
    requiredRole: ["project_authority"],
    requiredDocuments: [
      "project_proposal",
      "land_documents",
      "environmental_assessment",
    ],
    estimatedTime: 2,
    dependencies: [],
    autoAssignable: false,
    aiSupported: false,
  },
  {
    id: "initial_review",
    name: "Initial Review",
    description:
      "Admin reviews project submission and assigns verification officer",
    requiredRole: ["admin"],
    requiredDocuments: [],
    estimatedTime: 4,
    dependencies: ["project_submission"],
    autoAssignable: true,
    aiSupported: true,
  },
  {
    id: "ai_analysis",
    name: "AI Analysis",
    description: "AI system analyzes project images, documents, and compliance",
    requiredRole: ["ai_verifier"],
    requiredDocuments: [
      "satellite_images",
      "ground_photos",
      "project_documents",
    ],
    estimatedTime: 6,
    dependencies: ["initial_review"],
    autoAssignable: true,
    aiSupported: true,
  },
  {
    id: "officer_verification",
    name: "Officer Verification",
    description:
      "Verification officer conducts manual review and site assessment",
    requiredRole: ["officer"],
    requiredDocuments: ["site_visit_report", "compliance_checklist"],
    estimatedTime: 24,
    dependencies: ["ai_analysis"],
    autoAssignable: false,
    aiSupported: false,
  },
  {
    id: "report_generation",
    name: "Report Generation",
    description: "Officer generates comprehensive verification report",
    requiredRole: ["officer"],
    requiredDocuments: ["verification_report", "credit_calculation"],
    estimatedTime: 8,
    dependencies: ["officer_verification"],
    autoAssignable: false,
    aiSupported: true,
  },
  {
    id: "admin_approval",
    name: "Admin Approval",
    description:
      "Admin reviews verification report and approves credit issuance",
    requiredRole: ["admin"],
    requiredDocuments: ["verification_report"],
    estimatedTime: 4,
    dependencies: ["report_generation"],
    autoAssignable: false,
    aiSupported: false,
  },
  {
    id: "blockchain_minting",
    name: "Blockchain Minting",
    description: "Admin mints carbon credits on blockchain",
    requiredRole: ["admin"],
    requiredDocuments: ["approved_report"],
    estimatedTime: 2,
    dependencies: ["admin_approval"],
    autoAssignable: true,
    aiSupported: false,
  },
  {
    id: "credit_distribution",
    name: "Credit Distribution",
    description: "Credits distributed to officer and project authority wallets",
    requiredRole: ["admin"],
    requiredDocuments: ["minting_confirmation"],
    estimatedTime: 1,
    dependencies: ["blockchain_minting"],
    autoAssignable: true,
    aiSupported: false,
  },
];

export default function WorkflowManager({
  projectId,
  onWorkflowUpdate,
}: WorkflowManagerProps) {
  const { user } = useAuth();
  const [workflow, setWorkflow] = useState<ProjectWorkflow | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading workflow data
    setTimeout(() => {
      const mockWorkflow: ProjectWorkflow = {
        id: "workflow-1",
        projectId,
        currentStep: "officer_verification",
        completedSteps: ["project_submission", "initial_review", "ai_analysis"],
        assignedOfficerId: "officer-1",
        status: "active",
        estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setWorkflow(mockWorkflow);
      setCurrentStep(
        defaultWorkflowSteps.find(
          (step) => step.id === mockWorkflow.currentStep
        ) || null
      );
      setIsLoading(false);
    }, 1000);
  }, [projectId]);

  const getStepStatus = (stepId: string) => {
    if (!workflow) return "pending";
    if (workflow.completedSteps.includes(stepId)) return "completed";
    if (workflow.currentStep === stepId) return "active";
    return "pending";
  };

  const canExecuteStep = (step: WorkflowStep) => {
    if (!user) return false;

    // Check if user has required role
    if (!step.requiredRole.includes(user.role)) return false;

    // Check if dependencies are met
    const dependenciesMet = step.dependencies.every((dep) =>
      workflow?.completedSteps.includes(dep)
    );

    return dependenciesMet;
  };

  const handleStepAction = async (step: WorkflowStep) => {
    if (!canExecuteStep(step)) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update workflow
      const updatedWorkflow = {
        ...workflow!,
        currentStep: step.id,
        completedSteps: [...workflow!.completedSteps, step.id],
        updatedAt: new Date(),
      };

      setWorkflow(updatedWorkflow);
      onWorkflowUpdate?.(updatedWorkflow);
    } catch (error) {
      console.error("Error executing step:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <CogIcon className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading workflow...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Verification Workflow
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Track the progress of project verification and credit issuance
        </p>
      </div>

      <div className="p-6">
        {/* Workflow Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Progress</h4>
            <span className="text-sm text-gray-500">
              {workflow?.completedSteps.length} of {defaultWorkflowSteps.length}{" "}
              steps completed
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((workflow?.completedSteps.length || 0) /
                    defaultWorkflowSteps.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="space-y-4">
          {defaultWorkflowSteps.map((step, index) => {
            const status = getStepStatus(step.id);
            const canExecute = canExecuteStep(step);

            return (
              <div
                key={step.id}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  status === "active"
                    ? "border-green-500 bg-green-50"
                    : status === "completed"
                    ? "border-gray-300 bg-gray-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {/* Step Number */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        status === "completed"
                          ? "bg-green-600 text-white"
                          : status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h5 className="text-sm font-medium text-gray-900">
                          {step.name}
                        </h5>
                        {step.aiSupported && (
                          <CogIcon
                            className="h-4 w-4 text-blue-500"
                            title="AI Supported"
                          />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {step.description}
                      </p>

                      {/* Step Details */}
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {step.estimatedTime}h
                        </span>
                        <span className="flex items-center">
                          <UserIcon className="h-3 w-3 mr-1" />
                          {step.requiredRole.join(", ")}
                        </span>
                        {step.requiredDocuments.length > 0 && (
                          <span className="flex items-center">
                            <DocumentTextIcon className="h-3 w-3 mr-1" />
                            {step.requiredDocuments.length} docs
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center space-x-2">
                    {/* Status Icon */}
                    {status === "completed" && (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    )}
                    {status === "active" && (
                      <ClockIcon className="h-5 w-5 text-green-600" />
                    )}
                    {status === "pending" && (
                      <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />
                    )}

                    {/* Action Button */}
                    {status === "active" && canExecute && (
                      <button
                        onClick={() => handleStepAction(step)}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {isLoading ? "Processing..." : "Execute"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Dependencies */}
                {step.dependencies.length > 0 && (
                  <div className="mt-3 text-xs text-gray-500">
                    <span className="font-medium">Depends on:</span>{" "}
                    {step.dependencies.join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Workflow Summary */}
        {workflow && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Workflow Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Status:</span>
                <span
                  className={`ml-2 font-medium ${
                    workflow.status === "active"
                      ? "text-green-600"
                      : "text-gray-900"
                  }`}
                >
                  {workflow.status}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Assigned Officer:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {workflow.assignedOfficerId || "Unassigned"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Estimated Completion:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {workflow.estimatedCompletion.toLocaleDateString("en-US")}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {workflow.createdAt.toLocaleDateString("en-US")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
