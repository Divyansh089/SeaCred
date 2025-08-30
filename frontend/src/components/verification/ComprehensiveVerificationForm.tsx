"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { submitOfficerVerification } from "@/lib/credit";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  CalculatorIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  UserIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface ComprehensiveVerificationFormProps {
  project: any;
  onClose: () => void;
  onSubmit: (verificationData: any) => void;
}

interface VerificationFormData {
  // Basic Information
  verificationDate: string;
  verificationOfficer: string;
  officerDesignation: string;
  
  // Site Assessment
  siteInspectionCompleted: boolean;
  siteInspectionDate: string;
  siteInspectionNotes: string;
  
  // Document Review
  documentReviewCompleted: boolean;
  documentReviewDate: string;
  documentReviewNotes: string;
  
  // Technical Assessment
  methodologyValidation: boolean;
  methodologyValidationNotes: string;
  stakeholderConsultation: boolean;
  stakeholderConsultationNotes: string;
  
  // Measurement Data
  area: number;
  plots: number;
  uavFlights: number;
  biomass: number;
  uncertainty: number;
  creditsRecommended: number;
  
  // Environmental Assessment
  environmentalImpact: string;
  biodiversityAssessment: string;
  waterQualityImpact: string;
  airQualityImpact: string;
  
  // Social Assessment
  communityEngagement: string;
  localBenefits: string;
  stakeholderFeedback: string;
  
  // Risk Assessment
  technicalRisks: string;
  environmentalRisks: string;
  socialRisks: string;
  mitigationMeasures: string;
  
  // Compliance Check
  regulatoryCompliance: boolean;
  regulatoryComplianceNotes: string;
  legalRequirements: boolean;
  legalRequirementsNotes: string;
  
  // Final Assessment
  overallAssessment: string;
  recommendations: string;
  approvalStatus: "pending" | "approved" | "rejected";
  approvalNotes: string;
}

export default function ComprehensiveVerificationForm({
  project,
  onClose,
  onSubmit,
}: ComprehensiveVerificationFormProps) {
  const { user, walletAddress } = useAuth();
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");
  const [formData, setFormData] = useState<VerificationFormData>({
    verificationDate: new Date().toISOString().split('T')[0],
    verificationOfficer: user?.name || "Area Officer",
    officerDesignation: "Verification Officer",
    
    siteInspectionCompleted: false,
    siteInspectionDate: "",
    siteInspectionNotes: "",
    
    documentReviewCompleted: false,
    documentReviewDate: "",
    documentReviewNotes: "",
    
    methodologyValidation: false,
    methodologyValidationNotes: "",
    stakeholderConsultation: false,
    stakeholderConsultationNotes: "",
    
    area: 0,
    plots: 0,
    uavFlights: 0,
    biomass: 0,
    uncertainty: 0,
    creditsRecommended: 0,
    
    environmentalImpact: "",
    biodiversityAssessment: "",
    waterQualityImpact: "",
    airQualityImpact: "",
    
    communityEngagement: "",
    localBenefits: "",
    stakeholderFeedback: "",
    
    technicalRisks: "",
    environmentalRisks: "",
    socialRisks: "",
    mitigationMeasures: "",
    
    regulatoryCompliance: false,
    regulatoryComplianceNotes: "",
    legalRequirements: false,
    legalRequirementsNotes: "",
    
    overallAssessment: "",
    recommendations: "",
    approvalStatus: "pending",
    approvalNotes: "",
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateCreditsRecommended = () => {
    const calculatedCredits = (formData.area * formData.biomass * 0.5) * (1 - formData.uncertainty / 100);
    setFormData(prev => ({
      ...prev,
      creditsRecommended: Math.round(calculatedCredits)
    }));
  };

  const handleApprove = async () => {
    if (!walletAddress) {
      addNotification({
        type: "error",
        title: "Wallet not connected",
        message: "Please connect your wallet to approve verification.",
      });
      return;
    }

    // Validate required fields
    if (!formData.siteInspectionCompleted || !formData.documentReviewCompleted || 
        !formData.methodologyValidation || !formData.stakeholderConsultation) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please complete all required verification steps.",
      });
      return;
    }

    if (!formData.area || !formData.biomass || !formData.uncertainty) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please fill in all required measurement fields.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const verificationData = {
        projectId: project.id,
        projectName: project.name,
        projectOwner: project.owner,
        assignedOfficer: project.assignedOfficer,
        officerAddress: walletAddress,
        officerName: user?.name || "Area Officer",
        verificationDate: formData.verificationDate,
        approvalStatus: "approved",
        ...formData,
      };

      await submitOfficerVerification(verificationData);
      await onSubmit(verificationData);

      addNotification({
        type: "success",
        title: "Verification Approved",
        message: "Project verification has been approved successfully.",
      });

      onClose();
    } catch (error) {
      console.error("Verification approval failed:", error);
      addNotification({
        type: "error",
        title: "Approval Failed",
        message: "Failed to approve verification. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { id: "basic", name: "Basic Information", icon: UserIcon },
    { id: "assessment", name: "Site Assessment", icon: MapPinIcon },
    { id: "documents", name: "Document Review", icon: DocumentTextIcon },
    { id: "technical", name: "Technical Assessment", icon: ClipboardDocumentCheckIcon },
    { id: "measurements", name: "Measurements", icon: CalculatorIcon },
    { id: "environmental", name: "Environmental Impact", icon: ChartBarIcon },
    { id: "social", name: "Social Assessment", icon: UserIcon },
    { id: "risks", name: "Risk Assessment", icon: ExclamationTriangleIcon },
    { id: "compliance", name: "Compliance", icon: CheckCircleIcon },
    { id: "final", name: "Final Assessment", icon: CheckCircleIcon },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "basic":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Date *
                </label>
                <input
                  type="date"
                  value={formData.verificationDate}
                  onChange={(e) => handleInputChange("verificationDate", e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Officer *
                </label>
                <input
                  type="text"
                  value={formData.verificationOfficer}
                  onChange={(e) => handleInputChange("verificationOfficer", e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        );

      case "assessment":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="siteInspectionCompleted"
                checked={formData.siteInspectionCompleted}
                onChange={(e) => handleInputChange("siteInspectionCompleted", e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="siteInspectionCompleted" className="text-sm font-medium text-gray-900">
                Site Inspection Completed *
              </label>
            </div>
            {formData.siteInspectionCompleted && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inspection Date
                  </label>
                  <input
                    type="date"
                    value={formData.siteInspectionDate}
                    onChange={(e) => handleInputChange("siteInspectionDate", e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inspection Notes
                  </label>
                  <textarea
                    value={formData.siteInspectionNotes}
                    onChange={(e) => handleInputChange("siteInspectionNotes", e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    placeholder="Describe the site inspection findings..."
                  />
                </div>
              </div>
            )}
          </div>
        );

      case "documents":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="documentReviewCompleted"
                checked={formData.documentReviewCompleted}
                onChange={(e) => handleInputChange("documentReviewCompleted", e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="documentReviewCompleted" className="text-sm font-medium text-gray-900">
                Document Review Completed *
              </label>
            </div>
            {formData.documentReviewCompleted && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Date
                  </label>
                  <input
                    type="date"
                    value={formData.documentReviewDate}
                    onChange={(e) => handleInputChange("documentReviewDate", e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Notes
                  </label>
                  <textarea
                    value={formData.documentReviewNotes}
                    onChange={(e) => handleInputChange("documentReviewNotes", e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    placeholder="Document review findings..."
                  />
                </div>
              </div>
            )}
          </div>
        );

      case "technical":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="methodologyValidation"
                checked={formData.methodologyValidation}
                onChange={(e) => handleInputChange("methodologyValidation", e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="methodologyValidation" className="text-sm font-medium text-gray-900">
                Methodology Validation Completed *
              </label>
            </div>
            {formData.methodologyValidation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Methodology Validation Notes
                </label>
                <textarea
                  value={formData.methodologyValidationNotes}
                  onChange={(e) => handleInputChange("methodologyValidationNotes", e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="Methodology validation findings..."
                />
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="stakeholderConsultation"
                checked={formData.stakeholderConsultation}
                onChange={(e) => handleInputChange("stakeholderConsultation", e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="stakeholderConsultation" className="text-sm font-medium text-gray-900">
                Stakeholder Consultation Completed *
              </label>
            </div>
            {formData.stakeholderConsultation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stakeholder Consultation Notes
                </label>
                <textarea
                  value={formData.stakeholderConsultationNotes}
                  onChange={(e) => handleInputChange("stakeholderConsultationNotes", e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="Stakeholder consultation findings..."
                />
              </div>
            )}
          </div>
        );

      case "measurements":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (hectares) *
                </label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => handleInputChange("area", parseFloat(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Plots *
                </label>
                <input
                  type="number"
                  value={formData.plots}
                  onChange={(e) => handleInputChange("plots", parseInt(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UAV Flights Count *
                </label>
                <input
                  type="number"
                  value={formData.uavFlights}
                  onChange={(e) => handleInputChange("uavFlights", parseInt(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biomass (tons) *
                </label>
                <input
                  type="number"
                  value={formData.biomass}
                  onChange={(e) => handleInputChange("biomass", parseFloat(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uncertainty (%) *
                </label>
                <input
                  type="number"
                  value={formData.uncertainty}
                  onChange={(e) => handleInputChange("uncertainty", parseFloat(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="0"
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credits Recommended (tCO₂e)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={formData.creditsRecommended}
                    onChange={(e) => handleInputChange("creditsRecommended", parseFloat(e.target.value) || 0)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    placeholder="0"
                    step="0.01"
                  />
                  <Button
                    onClick={calculateCreditsRecommended}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    Calculate
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "environmental":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Environmental Impact Assessment
              </label>
              <textarea
                value={formData.environmentalImpact}
                onChange={(e) => handleInputChange("environmentalImpact", e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Describe the environmental impact..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biodiversity Assessment
              </label>
              <textarea
                value={formData.biodiversityAssessment}
                onChange={(e) => handleInputChange("biodiversityAssessment", e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Biodiversity impact assessment..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Water Quality Impact
                </label>
                <textarea
                  value={formData.waterQualityImpact}
                  onChange={(e) => handleInputChange("waterQualityImpact", e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="Water quality impact..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Air Quality Impact
                </label>
                <textarea
                  value={formData.airQualityImpact}
                  onChange={(e) => handleInputChange("airQualityImpact", e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="Air quality impact..."
                />
              </div>
            </div>
          </div>
        );

      case "social":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Community Engagement
              </label>
              <textarea
                value={formData.communityEngagement}
                onChange={(e) => handleInputChange("communityEngagement", e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Community engagement activities..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local Benefits
              </label>
              <textarea
                value={formData.localBenefits}
                onChange={(e) => handleInputChange("localBenefits", e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Benefits to local community..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stakeholder Feedback
              </label>
              <textarea
                value={formData.stakeholderFeedback}
                onChange={(e) => handleInputChange("stakeholderFeedback", e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Stakeholder feedback and concerns..."
              />
            </div>
          </div>
        );

      case "risks":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technical Risks
              </label>
              <textarea
                value={formData.technicalRisks}
                onChange={(e) => handleInputChange("technicalRisks", e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Technical risks identified..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environmental Risks
                </label>
                <textarea
                  value={formData.environmentalRisks}
                  onChange={(e) => handleInputChange("environmentalRisks", e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="Environmental risks..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Risks
                </label>
                <textarea
                  value={formData.socialRisks}
                  onChange={(e) => handleInputChange("socialRisks", e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="Social risks..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mitigation Measures
              </label>
              <textarea
                value={formData.mitigationMeasures}
                onChange={(e) => handleInputChange("mitigationMeasures", e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Risk mitigation measures..."
              />
            </div>
          </div>
        );

      case "compliance":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="regulatoryCompliance"
                checked={formData.regulatoryCompliance}
                onChange={(e) => handleInputChange("regulatoryCompliance", e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="regulatoryCompliance" className="text-sm font-medium text-gray-900">
                Regulatory Compliance Verified
              </label>
            </div>
            {formData.regulatoryCompliance && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compliance Notes
                </label>
                <textarea
                  value={formData.regulatoryComplianceNotes}
                  onChange={(e) => handleInputChange("regulatoryComplianceNotes", e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="Regulatory compliance details..."
                />
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="legalRequirements"
                checked={formData.legalRequirements}
                onChange={(e) => handleInputChange("legalRequirements", e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="legalRequirements" className="text-sm font-medium text-gray-900">
                Legal Requirements Met
              </label>
            </div>
            {formData.legalRequirements && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Requirements Notes
                </label>
                <textarea
                  value={formData.legalRequirementsNotes}
                  onChange={(e) => handleInputChange("legalRequirementsNotes", e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="Legal requirements details..."
                />
              </div>
            )}
          </div>
        );

      case "final":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Assessment *
              </label>
              <textarea
                value={formData.overallAssessment}
                onChange={(e) => handleInputChange("overallAssessment", e.target.value)}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Provide overall assessment of the project..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommendations
              </label>
              <textarea
                value={formData.recommendations}
                onChange={(e) => handleInputChange("recommendations", e.target.value)}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Provide recommendations for improvement..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Notes
              </label>
              <textarea
                value={formData.approvalNotes}
                onChange={(e) => handleInputChange("approvalNotes", e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Final approval notes..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Comprehensive Verification Form
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete verification for project: {project.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <ExclamationTriangleIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Project Overview */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Project Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{project.name}</p>
                  <p className="text-sm text-gray-500">{project.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{project.city}, {project.state}</p>
                  <p className="text-sm text-gray-500">{project.projectAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

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

        {/* Section Content */}
        <div className="mb-6">
          {renderSection()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            {sections.findIndex(s => s.id === activeSection) > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  setActiveSection(sections[currentIndex - 1].id);
                }}
              >
                Previous
              </Button>
            )}
            {sections.findIndex(s => s.id === activeSection) < sections.length - 1 && (
              <Button
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  setActiveSection(sections[currentIndex + 1].id);
                }}
              >
                Next
              </Button>
            )}
          </div>

          {/* Approve Button */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Approving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Approve</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
