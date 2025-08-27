"use client";

import { useState, useEffect } from "react";
import {
  CogIcon,
  DocumentTextIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import { AIVerificationRequest, CarbonProject } from "@/types";

interface AIVerificationPanelProps {
  projectId: string;
  projectData: Partial<CarbonProject>;
  onAnalysisComplete?: (results: AIVerificationRequest) => void;
}

export default function AIVerificationPanel({
  projectId,
  projectData,
  onAnalysisComplete,
}: AIVerificationPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("image-analysis");
  const [analysisResults, setAnalysisResults] =
    useState<AIVerificationRequest | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newDocuments = Array.from(files).map((file) => file.name);
    setUploadedDocuments((prev) => [...prev, ...newDocuments]);
  };

  const runImageAnalysis = async () => {
    if (uploadedImages.length === 0) {
      alert("Please upload images for analysis");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Simulate AI image analysis
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const results: AIVerificationRequest = {
        id: `ai-${Date.now()}`,
        projectId,
        requestType: "image_analysis",
        status: "completed",
        inputData: {
          images: uploadedImages,
          documents: uploadedDocuments,
          projectDetails: projectData,
        },
        results: {
          analysisType: "Satellite and Ground Image Analysis",
          confidence: 0.87,
          findings: [
            "Land cover classification: 85% forest, 10% agricultural, 5% other",
            "No significant deforestation detected in the last 5 years",
            "Biodiversity indicators show healthy ecosystem",
            "Land boundaries match submitted documentation",
            "No evidence of illegal logging or land clearing",
          ],
          recommendations: [
            "Proceed with verification - land appears suitable for carbon project",
            "Conduct ground truthing for 15% uncertainty areas",
            "Monitor for seasonal changes in vegetation",
            "Consider additional biodiversity surveys",
          ],
          processingTime: 4.2,
        },
        createdAt: new Date(),
        completedAt: new Date(),
      };

      setAnalysisResults(results);
      onAnalysisComplete?.(results);
    } catch (error) {
      console.error("Error in image analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runDocumentAnalysis = async () => {
    if (uploadedDocuments.length === 0) {
      alert("Please upload documents for analysis");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Simulate AI document analysis
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const results: AIVerificationRequest = {
        id: `ai-doc-${Date.now()}`,
        projectId,
        requestType: "document_analysis",
        status: "completed",
        inputData: {
          images: uploadedImages,
          documents: uploadedDocuments,
          projectDetails: projectData,
        },
        results: {
          analysisType: "Document Compliance Analysis",
          confidence: 0.92,
          findings: [
            "All required documentation present and valid",
            "Land ownership documents verified",
            "Environmental impact assessment meets standards",
            "Methodology selection appropriate for project type",
            "Monitoring plan comprehensive and feasible",
          ],
          recommendations: [
            "Documentation compliance score: 92%",
            "Minor formatting improvements suggested",
            "Consider adding historical land use data",
            "Monitoring frequency meets minimum requirements",
          ],
          processingTime: 2.8,
        },
        createdAt: new Date(),
        completedAt: new Date(),
      };

      setAnalysisResults(results);
      onAnalysisComplete?.(results);
    } catch (error) {
      console.error("Error in document analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runFullAssessment = async () => {
    setIsAnalyzing(true);

    try {
      // Simulate comprehensive AI assessment
      await new Promise((resolve) => setTimeout(resolve, 8000));

      const results: AIVerificationRequest = {
        id: `ai-full-${Date.now()}`,
        projectId,
        requestType: "full_assessment",
        status: "completed",
        inputData: {
          images: uploadedImages,
          documents: uploadedDocuments,
          projectDetails: projectData,
        },
        results: {
          analysisType: "Comprehensive Project Assessment",
          confidence: 0.89,
          findings: [
            "Overall project feasibility: HIGH",
            "Environmental impact: POSITIVE",
            "Social benefits: SIGNIFICANT",
            "Technical implementation: FEASIBLE",
            "Risk assessment: LOW to MEDIUM",
            "Compliance score: 89%",
            "Recommended credit calculation: 1,250 tCO2e/year",
          ],
          recommendations: [
            "APPROVE project with minor conditions",
            "Implement enhanced monitoring for first 2 years",
            "Consider community engagement program",
            "Regular biodiversity assessments recommended",
            "Credit issuance: 1,000 tCO2e initially, 250 tCO2e after 6 months",
          ],
          processingTime: 7.5,
        },
        createdAt: new Date(),
        completedAt: new Date(),
      };

      setAnalysisResults(results);
      onAnalysisComplete?.(results);
    } catch (error) {
      console.error("Error in full assessment:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const tabs = [
    { id: "image-analysis", name: "Image Analysis", icon: PhotoIcon },
    {
      id: "document-analysis",
      name: "Document Analysis",
      icon: DocumentTextIcon,
    },
    { id: "full-assessment", name: "Full Assessment", icon: ChartBarIcon },
    { id: "results", name: "Results", icon: CheckCircleIcon },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              AI Verification Assistant
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Automated analysis and compliance checking
            </p>
          </div>
          <CogIcon className="h-6 w-6 text-blue-500" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        {/* Image Analysis Tab */}
        {activeTab === "image-analysis" && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Satellite & Ground Image Analysis
              </h4>
              <p className="text-sm text-blue-700">
                AI analyzes satellite imagery, aerial photos, and ground images
                to assess land cover, biodiversity, and project feasibility.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload files</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {uploadedImages.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">
                  Uploaded Images ({uploadedImages.length})
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Uploaded image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={runImageAnalysis}
              disabled={isAnalyzing || uploadedImages.length === 0}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Images...
                </>
              ) : (
                <>
                  <CogIcon className="h-4 w-4 mr-2" />
                  Run Image Analysis
                </>
              )}
            </button>
          </div>
        )}

        {/* Document Analysis Tab */}
        {activeTab === "document-analysis" && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">
                Document Compliance Analysis
              </h4>
              <p className="text-sm text-green-700">
                AI reviews project documents for compliance with standards,
                completeness, and accuracy.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Documents
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500">
                      <span>Upload files</span>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleDocumentUpload}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, TXT up to 50MB
                  </p>
                </div>
              </div>
            </div>

            {uploadedDocuments.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">
                  Uploaded Documents
                </h5>
                <ul className="space-y-2">
                  {uploadedDocuments.map((doc, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-2 text-sm text-gray-600"
                    >
                      <DocumentTextIcon className="h-4 w-4" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={runDocumentAnalysis}
              disabled={isAnalyzing || uploadedDocuments.length === 0}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Documents...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Run Document Analysis
                </>
              )}
            </button>
          </div>
        )}

        {/* Full Assessment Tab */}
        {activeTab === "full-assessment" && (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-900 mb-2">
                Comprehensive Project Assessment
              </h4>
              <p className="text-sm text-purple-700">
                Complete AI analysis combining image analysis, document review,
                and project feasibility assessment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  Project Information
                </h5>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Project ID: {projectId}</div>
                  <div>Type: {projectData.projectType || "Unknown"}</div>
                  <div>Location: {projectData.location || "Not specified"}</div>
                  <div>Status: {projectData.status || "Unknown"}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  Analysis Requirements
                </h5>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Land cover classification</li>
                  <li>• Compliance verification</li>
                  <li>• Risk assessment</li>
                  <li>• Credit calculation</li>
                  <li>• Feasibility analysis</li>
                </ul>
              </div>
            </div>

            <button
              onClick={runFullAssessment}
              disabled={isAnalyzing}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Running Full Assessment...
                </>
              ) : (
                <>
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Run Full Assessment
                </>
              )}
            </button>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && analysisResults && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-blue-900">
                  Analysis Results
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-700">Confidence:</span>
                  <span className="text-sm font-medium text-blue-900">
                    {(analysisResults.results?.confidence || 0) * 100}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                {analysisResults.results?.analysisType} - Completed in{" "}
                {analysisResults.results?.processingTime}s
              </p>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">
                Key Findings
              </h5>
              <ul className="space-y-2">
                {analysisResults.results?.findings.map((finding, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-2 text-sm"
                  >
                    <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">
                Recommendations
              </h5>
              <ul className="space-y-2">
                {analysisResults.results?.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-2 text-sm"
                  >
                    <LightBulbIcon className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-green-900 mb-2">
                AI Assessment Summary
              </h5>
              <div className="text-sm text-green-700">
                <p>
                  Based on the analysis, this project appears to be{" "}
                  <strong>suitable for carbon credit verification</strong>.
                </p>
                <p className="mt-1">
                  The AI system recommends proceeding with manual verification
                  by an officer.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "results" && !analysisResults && (
          <div className="text-center py-8">
            <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No analysis results
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Run an analysis to see results here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
