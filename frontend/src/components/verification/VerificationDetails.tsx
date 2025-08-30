"use client";

import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CalculatorIcon,
  DocumentTextIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Badge from "@/components/ui/Badge";
import { CarbonProject } from "@/types";
import ComprehensiveVerificationForm from "./ComprehensiveVerificationForm";
import { useAuth } from "@/contexts/AuthContext";
import { 
  startVerification, 
  submitVerificationReport, 
  getVerificationReport,
  getProject,
  VerificationReportData,
  VerificationStatus
} from "@/lib/web3";

interface VerificationDetailsProps {
  project: CarbonProject;
  onClose: () => void;
}

export default function VerificationDetails({
  project,
  onClose,
}: VerificationDetailsProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showComprehensiveVerificationForm, setShowComprehensiveVerificationForm] = useState(false);
  const [verificationReportData, setVerificationReportData] = useState({
    area: "",
    plots: "",
    uavFlights: "",
    biomass: "",
    uncertainty: "",
    creditsRecommended: "",
  });
  const [verificationChecks, setVerificationChecks] = useState({
    siteInspection: false,
    documentationVerified: false,
    measurementsValidated: false,
    qualityAssurance: false,
  });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isStartingVerification, setIsStartingVerification] = useState(false);
  const [projectVerificationStatus, setProjectVerificationStatus] = useState<string>("PENDING");
  const [existingVerificationReport, setExistingVerificationReport] = useState<any>(null);

  // Load project verification status and existing report
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        const projectData = await getProject(Number(project.id));
        setProjectVerificationStatus(projectData.verificationStatus);
        
        // Load existing verification report if any
        const report = await getVerificationReport(Number(project.id));
        if (report) {
          setExistingVerificationReport(report);
        }
      } catch (error) {
        console.error("Error loading project data:", error);
        // If project doesn't exist in new contract, set default status
        setProjectVerificationStatus("PENDING");
      }
    };

    if (project.id) {
      loadProjectData();
    }
  }, [project.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "pass":
      case "APPROVED":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "in_progress":
      case "IN_PROGRESS":
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case "failed":
      case "fail":
      case "REJECTED":
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
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "in_progress":
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "failed":
      case "fail":
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: InformationCircleIcon },
    { id: "ai-analysis", name: "AI Analysis", icon: CalculatorIcon },
    { id: "verification-report", name: "Verification Report", icon: DocumentTextIcon },
  ];

  const handleOfficerVerificationSubmit = async (verificationData: any) => {
    console.log("Officer verification submitted:", verificationData);
    // Here you would typically send this data to the admin
    // For now, we'll just log it and show a success message
    alert("Verification submitted successfully! This will be sent to admin for review.");
  };

  const handleStartVerification = async () => {
    if (!project.id) {
      alert("Project ID not found");
      return;
    }

    setIsStartingVerification(true);
    try {
      await startVerification(Number(project.id));
      setProjectVerificationStatus("IN_PROGRESS");
      alert("Verification started successfully!");
    } catch (error) {
      console.error("Error starting verification:", error);
      alert("Error starting verification. Please try again.");
    } finally {
      setIsStartingVerification(false);
    }
  };

  const handleVerificationReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    
    try {
      if (!project.id) {
        throw new Error("Project ID not found");
      }

      const reportData: VerificationReportData = {
        area: verificationReportData.area,
        plots: verificationReportData.plots,
        uavFlights: verificationReportData.uavFlights,
        biomass: verificationReportData.biomass,
        uncertainty: verificationReportData.uncertainty,
        creditsRecommended: verificationReportData.creditsRecommended,
        siteInspection: verificationChecks.siteInspection,
        documentationVerified: verificationChecks.documentationVerified,
        measurementsValidated: verificationChecks.measurementsValidated,
        qualityAssurance: verificationChecks.qualityAssurance,
      };

      await submitVerificationReport(Number(project.id), reportData);
      
      // Reload project data to get updated status
      const projectData = await getProject(Number(project.id));
      setProjectVerificationStatus(projectData.verificationStatus);
      
      // Load the submitted report
      const report = await getVerificationReport(Number(project.id));
      if (report) {
        setExistingVerificationReport(report);
      }
      
      alert("Verification report submitted successfully!");
      
      // Reset form
      setVerificationReportData({
        area: "",
        plots: "",
        uavFlights: "",
        biomass: "",
        uncertainty: "",
        creditsRecommended: "",
      });
      setVerificationChecks({
        siteInspection: false,
        documentationVerified: false,
        measurementsValidated: false,
        qualityAssurance: false,
      });
    } catch (error) {
      console.error("Error submitting verification report:", error);
      alert("Error submitting verification report. Please try again.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleVerificationReportChange = (field: string, value: string) => {
    setVerificationReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVerificationCheckChange = (check: string, checked: boolean) => {
    setVerificationChecks(prev => ({
      ...prev,
      [check]: checked
    }));
  };

  const canStartVerification = user?.role === "officer" && 
    projectVerificationStatus === "PENDING";

  const canSubmitReport = user?.role === "officer" && 
    projectVerificationStatus === "IN_PROGRESS" && 
    !existingVerificationReport;

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
                      {project.projectType?.replace("_", " ") || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Land Area:</span>
                    <span className="font-medium">
                      {project.landArea ? `${project.landArea} hectares` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Credits:</span>
                    <span className="font-medium">
                      {project.totalCredits ? `${project.totalCredits.toLocaleString()} tCO2e` : "N/A"}
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
                        projectVerificationStatus === "APPROVED"
                          ? "success"
                          : projectVerificationStatus === "IN_PROGRESS"
                          ? "info"
                          : projectVerificationStatus === "REJECTED"
                          ? "error"
                          : "warning"
                      }
                    >
                      {projectVerificationStatus.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assigned Officer:</span>
                    <span className="font-medium">
                      {project.assignedOfficer && project.assignedOfficer !== "0x0000000000000000000000000000000000000000" 
                        ? `${project.assignedOfficer.slice(0, 10)}...` 
                        : "Unassigned"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
                      {project.createdAt ? new Date(project.createdAt * 1000).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project Owner:</span>
                    <span className="font-medium">
                      {project.owner ? `${project.owner.slice(0, 10)}...` : "N/A"}
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
                    <span className="text-gray-600">Verification Status:</span>
                    <span className="font-medium">
                      {projectVerificationStatus.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">
                      {project.createdAt ? new Date(project.createdAt * 1000).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Documents:</span>
                    <span className="font-medium">
                      {project.ipfsUrl ? "Documents uploaded" : "No documents"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project Address:</span>
                    <span className="font-medium">
                      {project.projectAddress || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Verification Button */}
            <div className="flex justify-end pt-4">
              {canStartVerification && (
                <button 
                  onClick={handleStartVerification}
                  disabled={isStartingVerification}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStartingVerification ? (
                    <>
                      <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <UserIcon className="h-5 w-5 mr-2" />
                      Start Verification
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI Analysis Tab */}
        {activeTab === "ai-analysis" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                AI-Powered Verification Analysis
              </h3>
              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                <CalculatorIcon className="h-4 w-4 mr-2" />
                Run AI Analysis
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-purple-900 mb-3">
                  AI Analysis Results
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">
                        Document Compliance
                      </span>
                    </div>
                    <Badge variant="success">95% Match</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm font-medium">
                        Risk Assessment
                      </span>
                    </div>
                    <Badge variant="warning">Medium Risk</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">
                        Methodology Validation
                      </span>
                    </div>
                    <Badge variant="success">Approved</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">
                        Carbon Calculation
                      </span>
                    </div>
                    <Badge variant="info">Pending Review</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-blue-900 mb-3">
                  AI Recommendations
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-white rounded-lg">
                    <p className="font-medium text-blue-900 mb-1">
                      ✅ Strengths
                    </p>
                    <ul className="text-blue-800 space-y-1">
                      <li>• Strong environmental impact assessment</li>
                      <li>• Comprehensive baseline scenario</li>
                      <li>• Clear monitoring methodology</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="font-medium text-orange-900 mb-1">
                      ⚠️ Areas for Improvement
                    </p>
                    <ul className="text-orange-800 space-y-1">
                      <li>• Additional stakeholder consultation needed</li>
                      <li>• Consider alternative baseline scenarios</li>
                      <li>• Enhance monitoring frequency</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Report Tab */}
        {activeTab === "verification-report" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Verification Report
              </h3>
              <Badge variant="info">Basic Checks</Badge>
            </div>

            {/* Show existing report if available */}
            {existingVerificationReport && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-green-900 mb-3">
                  Submitted Verification Report
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Area:</span>
                    <span className="font-medium ml-2">{Number(existingVerificationReport.area) / 100} ha</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Plots:</span>
                    <span className="font-medium ml-2">{Number(existingVerificationReport.plots)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">UAV Flights:</span>
                    <span className="font-medium ml-2">{Number(existingVerificationReport.uavFlights)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Biomass:</span>
                    <span className="font-medium ml-2">{Number(existingVerificationReport.biomass) / 100} t</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Uncertainty:</span>
                    <span className="font-medium ml-2">{Number(existingVerificationReport.uncertainty) / 100}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Credits Recommended:</span>
                    <span className="font-medium ml-2">{Number(existingVerificationReport.creditsRecommended) / 100} tCO₂e</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-gray-600">Submitted by:</span>
                  <span className="font-medium ml-2">{existingVerificationReport.officerAddress.slice(0, 10)}...</span>
                  <span className="text-gray-600 ml-4">on</span>
                  <span className="font-medium ml-2">{new Date(Number(existingVerificationReport.submittedAt) * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            {/* Show form only if no report exists and verification is in progress */}
            {!existingVerificationReport && canSubmitReport && (
              <>
                {/* Basic Verification Checks */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    Basic Verification Checks
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="siteInspection"
                        checked={verificationChecks.siteInspection}
                        onChange={(e) => handleVerificationCheckChange("siteInspection", e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="siteInspection" className="text-sm text-gray-700">
                        Site inspection completed
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="documentationVerified"
                        checked={verificationChecks.documentationVerified}
                        onChange={(e) => handleVerificationCheckChange("documentationVerified", e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="documentationVerified" className="text-sm text-gray-700">
                        Documentation verified
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="measurementsValidated"
                        checked={verificationChecks.measurementsValidated}
                        onChange={(e) => handleVerificationCheckChange("measurementsValidated", e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="measurementsValidated" className="text-sm text-gray-700">
                        Measurements validated
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="qualityAssurance"
                        checked={verificationChecks.qualityAssurance}
                        onChange={(e) => handleVerificationCheckChange("qualityAssurance", e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="qualityAssurance" className="text-sm text-gray-700">
                        Quality assurance checks passed
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <form onSubmit={handleVerificationReportSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                          Area (ha)
                        </label>
                        <input
                          type="number"
                          id="area"
                          name="area"
                          value={verificationReportData.area}
                          onChange={(e) => handleVerificationReportChange("area", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter area in hectares"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="plots" className="block text-sm font-medium text-gray-700 mb-2">
                          Plots (#)
                        </label>
                        <input
                          type="number"
                          id="plots"
                          name="plots"
                          value={verificationReportData.plots}
                          onChange={(e) => handleVerificationReportChange("plots", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter number of plots"
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="uavFlights" className="block text-sm font-medium text-gray-700 mb-2">
                          UAV Flights (#)
                        </label>
                        <input
                          type="number"
                          id="uavFlights"
                          name="uavFlights"
                          value={verificationReportData.uavFlights}
                          onChange={(e) => handleVerificationReportChange("uavFlights", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter number of UAV flights"
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="biomass" className="block text-sm font-medium text-gray-700 mb-2">
                          Biomass (t)
                        </label>
                        <input
                          type="number"
                          id="biomass"
                          name="biomass"
                          value={verificationReportData.biomass}
                          onChange={(e) => handleVerificationReportChange("biomass", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter biomass in tonnes"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="uncertainty" className="block text-sm font-medium text-gray-700 mb-2">
                          Uncertainty (%)
                        </label>
                        <input
                          type="number"
                          id="uncertainty"
                          name="uncertainty"
                          value={verificationReportData.uncertainty}
                          onChange={(e) => handleVerificationReportChange("uncertainty", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter uncertainty percentage"
                          step="0.01"
                          min="0"
                          max="100"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="creditsRecommended" className="block text-sm font-medium text-gray-700 mb-2">
                          Credits Recommended (tCO₂e)
                        </label>
                        <input
                          type="number"
                          id="creditsRecommended"
                          name="creditsRecommended"
                          value={verificationReportData.creditsRecommended}
                          onChange={(e) => handleVerificationReportChange("creditsRecommended", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter recommended credits"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={isSubmittingReport}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingReport ? (
                          <>
                            <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <DocumentTextIcon className="h-5 w-5 mr-2" />
                            Submit Verification Report
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}

            {/* Show message if verification not started or already completed */}
            {!canSubmitReport && !existingVerificationReport && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  {projectVerificationStatus === "PENDING" 
                    ? "Please start verification first to submit a report."
                    : "Verification report has already been submitted or verification is not in progress."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Comprehensive Verification Form Modal */}
        {showComprehensiveVerificationForm && (
          <ComprehensiveVerificationForm
            project={project}
            onSubmit={handleOfficerVerificationSubmit}
            onClose={() => setShowComprehensiveVerificationForm(false)}
          />
        )}
      </div>
    </div>
  );
}
