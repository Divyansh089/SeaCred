"use client";

import { useState, useCallback } from "react";
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import { CarbonProject } from "@/types";
import Badge from "@/components/ui/Badge";

interface VerificationReportGeneratorProps {
  project: CarbonProject;
  onClose: () => void;
}

interface VerificationReport {
  id: string;
  projectId: string;
  projectName: string;
  generatedBy: string;
  generatedAt: Date;
  verificationStatus: "approved" | "rejected" | "pending_review";
  summary: {
    totalSteps: number;
    completedSteps: number;
    passedValidations: number;
    totalValidations: number;
    aiConfidence: number;
  };
  verificationSteps: Array<{
    id: string;
    name: string;
    status: "completed" | "pending" | "failed";
    completedAt?: Date;
    notes?: string;
    documents?: string[];
  }>;
  validationResults: Array<{
    category: string;
    checks: Array<{
      name: string;
      status: "pass" | "fail" | "warning";
      details: string;
    }>;
  }>;
  aiAnalysis: {
    overallScore: number;
    confidence: number;
    recommendations: string[];
    risks: string[];
    strengths: string[];
  };
  carbonCalculations: {
    methodology: string;
    totalCredits: number;
    annualAverage: number;
    pricePerCredit: number;
    totalValue: number;
    uncertainty: string;
  };
  finalRecommendation: {
    decision: "approve" | "reject" | "request_changes";
    reasoning: string;
    conditions?: string[];
    nextSteps: string[];
  };
}

export default function VerificationReportGenerator({
  project,
  onClose,
}: VerificationReportGeneratorProps) {
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState("preview");

  const generateReport = useCallback(async () => {
    setIsGenerating(true);

    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const generatedReport: VerificationReport = {
      id: `VR-${Date.now()}`,
      projectId: project.id,
      projectName: project.name,
      generatedBy: "Jane Officer",
      generatedAt: new Date(),
      verificationStatus: "pending_review",
      summary: {
        totalSteps: 6,
        completedSteps: 2,
        passedValidations: 6,
        totalValidations: 8,
        aiConfidence: 87,
      },
      verificationSteps: [
        {
          id: "1",
          name: "Document Review",
          status: "completed",
          completedAt: new Date("2024-08-18"),
          notes:
            "All required documents submitted and verified. Legal compliance confirmed.",
          documents: ["Document Review Report.pdf"],
        },
        {
          id: "2",
          name: "Site Inspection",
          status: "completed",
          completedAt: new Date("2024-08-20"),
          notes:
            "Physical site inspection completed. Site conditions match project documentation.",
          documents: ["Site Inspection Report.pdf", "Site Photos.zip"],
        },
        {
          id: "3",
          name: "Technical Assessment",
          status: "pending",
          notes: "Technical feasibility assessment in progress.",
        },
        {
          id: "4",
          name: "Environmental Impact",
          status: "pending",
          notes: "Environmental impact assessment pending.",
        },
        {
          id: "5",
          name: "Carbon Calculation",
          status: "pending",
          notes: "Carbon calculation methodology validation required.",
        },
        {
          id: "6",
          name: "Final Verification",
          status: "pending",
          notes: "Final verification and approval process.",
        },
      ],
      validationResults: [
        {
          category: "Documentation",
          checks: [
            {
              name: "Project Proposal",
              status: "pass",
              details: "Complete and properly formatted",
            },
            {
              name: "Environmental Assessment",
              status: "pass",
              details: "Comprehensive environmental impact study provided",
            },
          ],
        },
        {
          category: "Technical",
          checks: [
            {
              name: "Methodology Validation",
              status: "warning",
              details: "Methodology approved with minor modifications required",
            },
            {
              name: "Technology Assessment",
              status: "pass",
              details: "Proven technology with good track record",
            },
          ],
        },
        {
          category: "Financial",
          checks: [
            {
              name: "Financial Viability",
              status: "pass",
              details: "Strong financial projections and funding secured",
            },
          ],
        },
        {
          category: "Environmental",
          checks: [
            {
              name: "Carbon Calculation",
              status: "pending",
              details: "Awaiting detailed carbon calculation methodology",
            },
          ],
        },
        {
          category: "Legal",
          checks: [
            {
              name: "Regulatory Compliance",
              status: "pass",
              details: "All regulatory requirements met",
            },
          ],
        },
      ],
      aiAnalysis: {
        overallScore: 87,
        confidence: 87,
        recommendations: [
          "Complete stakeholder engagement process",
          "Refine carbon calculation parameters",
          "Conduct additional site assessment",
        ],
        risks: [
          "Medium risk in carbon calculation methodology",
          "Potential stakeholder concerns",
        ],
        strengths: [
          "Strong environmental impact assessment",
          "Comprehensive baseline scenario",
          "Clear monitoring methodology",
        ],
      },
      carbonCalculations: {
        methodology:
          "AR-ACM0003 - Afforestation and reforestation of degraded land",
        totalCredits: project.totalCredits,
        annualAverage: project.totalCredits / 10,
        pricePerCredit: project.pricePerCredit,
        totalValue: project.totalCredits * project.pricePerCredit,
        uncertainty: "±15% margin of error applied to calculations",
      },
      finalRecommendation: {
        decision: "request_changes",
        reasoning:
          "Project demonstrates strong potential but requires completion of remaining verification steps and refinement of carbon calculation methodology.",
        conditions: [
          "Complete remaining verification steps",
          "Address AI-identified improvements",
          "Refine carbon calculation methodology",
        ],
        nextSteps: [
          "Submit revised carbon calculation methodology",
          "Complete stakeholder consultation process",
          "Conduct final site assessment",
          "Submit for final admin review",
        ],
      },
    };

    setReport(generatedReport);
    setIsGenerating(false);
  }, [project]);

  const downloadReport = useCallback(
    (format: "pdf" | "docx" | "json") => {
      if (!report) return;

      const reportData = {
        ...report,
        downloadFormat: format,
        downloadTimestamp: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `verification-report-${project.name}-${format}.${
        format === "json" ? "json" : format
      }`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [report, project.name]
  );

  const sections = [
    { id: "preview", name: "Report Preview", icon: EyeIcon },
    { id: "steps", name: "Verification Steps", icon: DocumentTextIcon },
    { id: "validation", name: "Validation Results", icon: CheckCircleIcon },
    { id: "ai-analysis", name: "AI Analysis", icon: ClockIcon },
    { id: "calculations", name: "Carbon Calculations", icon: DocumentTextIcon },
    {
      id: "recommendation",
      name: "Final Recommendation",
      icon: ExclamationTriangleIcon,
    },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-7xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Verification Report Generator - {project.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Generate comprehensive verification report for admin approval
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        {!report ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Generate Verification Report
            </h3>
            <p className="text-gray-600 mb-6">
              Create a comprehensive verification report that includes all
              validation checks, AI analysis results, and recommendations for
              admin review and credit issuance.
            </p>
            <button
              onClick={generateReport}
              disabled={isGenerating}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Report Header */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Verification Report: {report.projectName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Generated by {report.generatedBy} on{" "}
                    {report.generatedAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Badge
                    variant={
                      report.verificationStatus === "approved"
                        ? "success"
                        : report.verificationStatus === "rejected"
                        ? "error"
                        : "warning"
                    }
                  >
                    {report.verificationStatus.replace("_", " ")}
                  </Badge>
                  <button
                    onClick={() => downloadReport("json")}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeSection === section.id
                          ? "border-green-500 text-green-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{section.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Report Preview Section */}
            {activeSection === "preview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-8 w-8 text-green-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">
                          Steps Completed
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {report.summary.completedSteps}/
                          {report.summary.totalSteps}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-8 w-8 text-blue-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">
                          Validations Passed
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {report.summary.passedValidations}/
                          {report.summary.totalValidations}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <ClockIcon className="h-8 w-8 text-purple-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">
                          AI Confidence
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {report.summary.aiConfidence}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">
                          Recommendation
                        </p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">
                          {report.finalRecommendation.decision.replace(
                            "_",
                            " "
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Executive Summary
                  </h4>
                  <div className="space-y-4 text-sm text-gray-700">
                    <p>
                      <strong>Project Overview:</strong> {project.name} is a{" "}
                      {project.projectType.replace("_", " ")} project located in{" "}
                      {project.location} with a total potential of{" "}
                      {project.totalCredits.toLocaleString()} carbon credits.
                    </p>
                    <p>
                      <strong>Verification Progress:</strong>{" "}
                      {report.summary.completedSteps} out of{" "}
                      {report.summary.totalSteps}
                      verification steps have been completed, with{" "}
                      {report.summary.passedValidations} out of{" "}
                      {report.summary.totalValidations}
                      validation checks passed.
                    </p>
                    <p>
                      <strong>AI Assessment:</strong> The AI analysis indicates{" "}
                      {report.summary.aiConfidence}% confidence in the project's
                      viability, with {report.aiAnalysis.recommendations.length}{" "}
                      key recommendations for improvement.
                    </p>
                    <p>
                      <strong>Final Recommendation:</strong>{" "}
                      {report.finalRecommendation.reasoning}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Steps Section */}
            {activeSection === "steps" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Verification Steps
                </h3>
                {report.verificationSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className="border border-gray-200 rounded-lg p-4"
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
                            {step.status === "completed" ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : step.status === "failed" ? (
                              <XCircleIcon className="h-5 w-5 text-red-500" />
                            ) : (
                              <ClockIcon className="h-5 w-5 text-gray-400" />
                            )}
                            <h4 className="text-lg font-medium text-gray-900">
                              {step.name}
                            </h4>
                            <Badge
                              variant={
                                step.status === "completed"
                                  ? "success"
                                  : step.status === "failed"
                                  ? "error"
                                  : "warning"
                              }
                            >
                              {step.status}
                            </Badge>
                          </div>
                          {step.completedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Completed: {step.completedAt.toLocaleDateString()}
                            </p>
                          )}
                          {step.notes && (
                            <p className="text-sm text-gray-600 mt-2">
                              {step.notes}
                            </p>
                          )}
                          {step.documents && step.documents.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">
                                Documents:
                              </p>
                              <div className="flex space-x-2">
                                {step.documents.map((doc, docIndex) => (
                                  <span
                                    key={docIndex}
                                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                                  >
                                    <DocumentTextIcon className="h-3 w-3 mr-1" />
                                    {doc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Validation Results Section */}
            {activeSection === "validation" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Validation Results
                </h3>
                {report.validationResults.map((category, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      {category.category} Validation
                    </h4>
                    <div className="space-y-3">
                      {category.checks.map((check, checkIndex) => (
                        <div
                          key={checkIndex}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {check.status === "pass" ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : check.status === "fail" ? (
                              <XCircleIcon className="h-5 w-5 text-red-500" />
                            ) : (
                              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                            )}
                            <div>
                              <span className="font-medium text-gray-900">
                                {check.name}
                              </span>
                              <p className="text-sm text-gray-600">
                                {check.details}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              check.status === "pass"
                                ? "success"
                                : check.status === "fail"
                                ? "error"
                                : "warning"
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
            )}

            {/* AI Analysis Section */}
            {activeSection === "ai-analysis" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  AI Analysis Results
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="text-md font-medium text-purple-900 mb-3">
                      AI Assessment
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Overall Score
                        </span>
                        <span className="text-lg font-bold text-purple-900">
                          {report.aiAnalysis.overallScore}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Confidence Level
                        </span>
                        <span className="text-lg font-bold text-purple-900">
                          {report.aiAnalysis.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-md font-medium text-blue-900 mb-3">
                      Key Findings
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium text-blue-900">
                          ✅ Strengths ({report.aiAnalysis.strengths.length})
                        </p>
                        <ul className="text-blue-800 mt-1 space-y-1">
                          {report.aiAnalysis.strengths.map(
                            (strength, index) => (
                              <li key={index}>• {strength}</li>
                            )
                          )}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-orange-900">
                          ⚠️ Risks ({report.aiAnalysis.risks.length})
                        </p>
                        <ul className="text-orange-800 mt-1 space-y-1">
                          {report.aiAnalysis.risks.map((risk, index) => (
                            <li key={index}>• {risk}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-green-900 mb-3">
                    AI Recommendations
                  </h4>
                  <div className="space-y-2">
                    {report.aiAnalysis.recommendations.map(
                      (recommendation, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span className="text-sm text-green-800">
                            {recommendation}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Carbon Calculations Section */}
            {activeSection === "calculations" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Carbon Credit Calculations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      Calculation Parameters
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Methodology:</span>
                        <span className="font-medium">
                          {report.carbonCalculations.methodology}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Credits:</span>
                        <span className="font-medium">
                          {report.carbonCalculations.totalCredits.toLocaleString()}{" "}
                          tCO2e
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual Average:</span>
                        <span className="font-medium">
                          {report.carbonCalculations.annualAverage.toLocaleString()}{" "}
                          tCO2e/year
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price per Credit:</span>
                        <span className="font-medium">
                          ${report.carbonCalculations.pricePerCredit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Value:</span>
                        <span className="font-medium">
                          $
                          {report.carbonCalculations.totalValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Uncertainty:</span>
                        <span className="font-medium">
                          {report.carbonCalculations.uncertainty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-md font-medium text-blue-900 mb-3">
                      Calculation Summary
                    </h4>
                    <div className="text-sm text-blue-800 space-y-2">
                      <p>
                        <strong>Methodology:</strong>{" "}
                        {report.carbonCalculations.methodology}
                      </p>
                      <p>
                        <strong>Formula:</strong> Carbon Credits = (Baseline
                        Emissions - Project Emissions) × Leakage Factor
                      </p>
                      <p>
                        <strong>Verification:</strong> Annual monitoring and
                        verification required
                      </p>
                      <p>
                        <strong>Uncertainty:</strong>{" "}
                        {report.carbonCalculations.uncertainty}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Final Recommendation Section */}
            {activeSection === "recommendation" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Final Recommendation
                </h3>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    {report.finalRecommendation.decision === "approve" ? (
                      <CheckCircleIcon className="h-8 w-8 text-green-500" />
                    ) : report.finalRecommendation.decision === "reject" ? (
                      <XCircleIcon className="h-8 w-8 text-red-500" />
                    ) : (
                      <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
                    )}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 capitalize">
                        {report.finalRecommendation.decision.replace("_", " ")}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Final verification decision
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        Reasoning
                      </h5>
                      <p className="text-sm text-gray-700">
                        {report.finalRecommendation.reasoning}
                      </p>
                    </div>

                    {report.finalRecommendation.conditions && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">
                          Conditions for Approval
                        </h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {report.finalRecommendation.conditions.map(
                            (condition, index) => (
                              <li key={index}>• {condition}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        Next Steps
                      </h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {report.finalRecommendation.nextSteps.map(
                          (step, index) => (
                            <li key={index}>• {step}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => downloadReport("json")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download Report
                  </button>
                  <button
                    onClick={() => downloadReport("pdf")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Export PDF
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
