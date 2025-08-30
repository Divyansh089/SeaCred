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
} from "@heroicons/react/24/outline";

interface OfficerVerificationFormProps {
  project: any;
  onClose: () => void;
  onSubmit: (verificationData: any) => void;
}

interface VerificationFormData {
  area: number;
  plots: number;
  uavFlights: number;
  biomass: number;
  uncertainty: number;
  creditsRecommended: number;
  basicChecks: {
    siteInspection: boolean;
    documentReview: boolean;
    methodologyValidation: boolean;
    stakeholderConsultation: boolean;
  };
  notes: string;
}

export default function OfficerVerificationForm({
  project,
  onClose,
  onSubmit,
}: OfficerVerificationFormProps) {
  const { user, walletAddress } = useAuth();
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<VerificationFormData>({
    area: 0,
    plots: 0,
    uavFlights: 0,
    biomass: 0,
    uncertainty: 0,
    creditsRecommended: 0,
    basicChecks: {
      siteInspection: false,
      documentReview: false,
      methodologyValidation: false,
      stakeholderConsultation: false,
    },
    notes: "",
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof VerificationFormData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const calculateCreditsRecommended = () => {
    // Simple calculation based on area and biomass
    const calculatedCredits = (formData.area * formData.biomass * 0.5) * (1 - formData.uncertainty / 100);
    setFormData(prev => ({
      ...prev,
      creditsRecommended: Math.round(calculatedCredits)
    }));
  };

  const handleSubmit = async () => {
    if (!walletAddress) {
      addNotification({
        type: "error",
        title: "Wallet not connected",
        message: "Please connect your wallet to submit verification.",
      });
      return;
    }

    // Validate required fields
    if (!formData.area || !formData.biomass || !formData.uncertainty) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    // Check if all basic checks are completed
    const allChecksCompleted = Object.values(formData.basicChecks).every(check => check);
    if (!allChecksCompleted) {
      addNotification({
        type: "error",
        title: "Basic Checks Required",
        message: "Please complete all basic verification checks.",
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
        verificationDate: new Date().toISOString(),
        ...formData,
      };

      await submitOfficerVerification(verificationData);
      await onSubmit(verificationData);

      addNotification({
        type: "success",
        title: "Verification Submitted",
        message: "Verification report has been submitted successfully.",
      });

      onClose();
    } catch (error) {
      console.error("Verification submission failed:", error);
      addNotification({
        type: "error",
        title: "Submission Failed",
        message: "Failed to submit verification report. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Officer Verification Form
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

        <div className="space-y-6">
          {/* Project Overview */}
          <Card>
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
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Project Owner</p>
                    <p className="text-sm text-gray-500 font-mono">{project.owner}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CalculatorIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Estimated Credits</p>
                    <p className="text-sm text-gray-500">{project.estimatedCredits.toLocaleString()} tCO₂e</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Basic Verification Checks */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Basic Verification Checks
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="siteInspection"
                    checked={formData.basicChecks.siteInspection}
                    onChange={(e) => handleInputChange("basicChecks.siteInspection", e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="siteInspection" className="text-sm font-medium text-gray-900">
                    Site Inspection Completed
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="documentReview"
                    checked={formData.basicChecks.documentReview}
                    onChange={(e) => handleInputChange("basicChecks.documentReview", e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="documentReview" className="text-sm font-medium text-gray-900">
                    Document Review Completed
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="methodologyValidation"
                    checked={formData.basicChecks.methodologyValidation}
                    onChange={(e) => handleInputChange("basicChecks.methodologyValidation", e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="methodologyValidation" className="text-sm font-medium text-gray-900">
                    Methodology Validation Completed
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="stakeholderConsultation"
                    checked={formData.basicChecks.stakeholderConsultation}
                    onChange={(e) => handleInputChange("basicChecks.stakeholderConsultation", e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="stakeholderConsultation" className="text-sm font-medium text-gray-900">
                    Stakeholder Consultation Completed
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Verification Measurements */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Verification Measurements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </Card>

          {/* Additional Notes */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Additional Notes
              </h3>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Add any additional observations, recommendations, or notes about the verification process..."
              />
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Submit Verification</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
