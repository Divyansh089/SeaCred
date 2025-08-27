"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  PhotoIcon,
  DocumentTextIcon,
  MapPinIcon,
  CalculatorIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { VerificationReport, CarbonProject } from "@/types";

interface VerificationReportFormProps {
  projectId: string;
  onReportSubmit?: (report: VerificationReport) => void;
  initialData?: Partial<VerificationReport>;
}

export default function VerificationReportForm({
  projectId,
  onReportSubmit,
  initialData,
}: VerificationReportFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("land-details");

  const [report, setReport] = useState<Partial<VerificationReport>>({
    projectId,
    officerId: user?.id || "",
    verificationType: "manual",
    status: "draft",
    landDetails: {
      area: 0,
      areaUnit: "hectares",
      coordinates: { latitude: 0, longitude: 0 },
      landType: "forest",
      ownershipStatus: "private",
      landUseHistory: "",
      biodiversityAssessment: "",
    },
    images: [],
    officerAssessment: {
      complianceVerified: false,
      environmentalImpact: "",
      socialBenefits: "",
      technicalFeasibility: "",
      monitoringPlan: "",
      riskAssessment: "",
      recommendations: [],
    },
    creditCalculation: {
      baselineEmissions: 0,
      projectEmissions: 0,
      netReduction: 0,
      methodology: "",
      vintage: new Date().getFullYear(),
      totalCredits: 0,
      pricePerCredit: 0,
    },
    ...initialData,
  });

  const handleInputChange = (section: string, field: string, value: any) => {
    setReport((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof VerificationReport],
        [field]: value,
      },
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages = Array.from(files).map((file, index) => ({
      id: `img-${Date.now()}-${index}`,
      type: "ground_photo" as const,
      url: URL.createObjectURL(file),
      description: file.name,
      uploadedAt: new Date(),
    }));

    setReport((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...newImages],
    }));
  };

  const calculateCredits = () => {
    const { baselineEmissions, projectEmissions } =
      report.creditCalculation || {};
    const netReduction = (baselineEmissions || 0) - (projectEmissions || 0);

    setReport((prev) => ({
      ...prev,
      creditCalculation: {
        ...prev.creditCalculation!,
        netReduction,
        totalCredits: Math.max(0, netReduction),
      },
    }));
  };

  const handleSubmit = async () => {
    if (
      !report.landDetails ||
      !report.officerAssessment ||
      !report.creditCalculation
    ) {
      alert("Please complete all required sections");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const finalReport: VerificationReport = {
        id: `report-${Date.now()}`,
        projectId,
        officerId: user?.id || "",
        verificationType: report.verificationType || "manual",
        status: "submitted",
        landDetails: report.landDetails!,
        images: report.images || [],
        officerAssessment: report.officerAssessment!,
        creditCalculation: report.creditCalculation!,
        createdAt: new Date(),
        updatedAt: new Date(),
        submittedAt: new Date(),
      };

      onReportSubmit?.(finalReport);
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "land-details", name: "Land Details", icon: MapPinIcon },
    { id: "images", name: "Images & Documents", icon: PhotoIcon },
    { id: "assessment", name: "Officer Assessment", icon: DocumentTextIcon },
    { id: "credits", name: "Credit Calculation", icon: CalculatorIcon },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Verification Report
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Generate comprehensive verification report for project {projectId}
        </p>
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
                    ? "border-green-500 text-green-600"
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
        {/* Land Details Tab */}
        {activeTab === "land-details" && (
          <div className="space-y-6">
            <h4 className="text-md font-medium text-gray-900">
              Land and Environmental Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Land Area
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={report.landDetails?.area || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "landDetails",
                        "area",
                        parseFloat(e.target.value)
                      )
                    }
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="0"
                  />
                  <select
                    value={report.landDetails?.areaUnit || "hectares"}
                    onChange={(e) =>
                      handleInputChange(
                        "landDetails",
                        "areaUnit",
                        e.target.value
                      )
                    }
                    className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="hectares">Hectares</option>
                    <option value="acres">Acres</option>
                    <option value="square_meters">Square Meters</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Land Type
                </label>
                <select
                  value={report.landDetails?.landType || "forest"}
                  onChange={(e) =>
                    handleInputChange("landDetails", "landType", e.target.value)
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="forest">Forest</option>
                  <option value="wetland">Wetland</option>
                  <option value="agricultural">Agricultural</option>
                  <option value="urban">Urban</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={report.landDetails?.coordinates?.latitude || ""}
                  onChange={(e) =>
                    handleInputChange("landDetails", "coordinates", {
                      ...report.landDetails?.coordinates,
                      latitude: parseFloat(e.target.value),
                    })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="0.000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={report.landDetails?.coordinates?.longitude || ""}
                  onChange={(e) =>
                    handleInputChange("landDetails", "coordinates", {
                      ...report.landDetails?.coordinates,
                      longitude: parseFloat(e.target.value),
                    })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="0.000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ownership Status
                </label>
                <select
                  value={report.landDetails?.ownershipStatus || "private"}
                  onChange={(e) =>
                    handleInputChange(
                      "landDetails",
                      "ownershipStatus",
                      e.target.value
                    )
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                  <option value="community">Community</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Land Use History
              </label>
              <textarea
                value={report.landDetails?.landUseHistory || ""}
                onChange={(e) =>
                  handleInputChange(
                    "landDetails",
                    "landUseHistory",
                    e.target.value
                  )
                }
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Describe the historical land use patterns..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biodiversity Assessment
              </label>
              <textarea
                value={report.landDetails?.biodiversityAssessment || ""}
                onChange={(e) =>
                  handleInputChange(
                    "landDetails",
                    "biodiversityAssessment",
                    e.target.value
                  )
                }
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Describe biodiversity findings and impacts..."
              />
            </div>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <div className="space-y-6">
            <h4 className="text-md font-medium text-gray-900">
              Images and Documentation
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500">
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

            {/* Image Gallery */}
            {report.images && report.images.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">
                  Uploaded Images
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {report.images.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.url}
                        alt={image.description}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {image.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assessment Tab */}
        {activeTab === "assessment" && (
          <div className="space-y-6">
            <h4 className="text-md font-medium text-gray-900">
              Officer Assessment
            </h4>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={report.officerAssessment?.complianceVerified || false}
                onChange={(e) =>
                  handleInputChange(
                    "officerAssessment",
                    "complianceVerified",
                    e.target.checked
                  )
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Compliance with standards verified
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Environmental Impact Assessment
              </label>
              <textarea
                value={report.officerAssessment?.environmentalImpact || ""}
                onChange={(e) =>
                  handleInputChange(
                    "officerAssessment",
                    "environmentalImpact",
                    e.target.value
                  )
                }
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Describe the environmental impact of the project..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Benefits
              </label>
              <textarea
                value={report.officerAssessment?.socialBenefits || ""}
                onChange={(e) =>
                  handleInputChange(
                    "officerAssessment",
                    "socialBenefits",
                    e.target.value
                  )
                }
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Describe social benefits and community impact..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technical Feasibility
              </label>
              <textarea
                value={report.officerAssessment?.technicalFeasibility || ""}
                onChange={(e) =>
                  handleInputChange(
                    "officerAssessment",
                    "technicalFeasibility",
                    e.target.value
                  )
                }
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Assess technical feasibility and implementation..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monitoring Plan
              </label>
              <textarea
                value={report.officerAssessment?.monitoringPlan || ""}
                onChange={(e) =>
                  handleInputChange(
                    "officerAssessment",
                    "monitoringPlan",
                    e.target.value
                  )
                }
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Describe monitoring and verification plan..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Assessment
              </label>
              <textarea
                value={report.officerAssessment?.riskAssessment || ""}
                onChange={(e) =>
                  handleInputChange(
                    "officerAssessment",
                    "riskAssessment",
                    e.target.value
                  )
                }
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Identify and assess project risks..."
              />
            </div>
          </div>
        )}

        {/* Credits Tab */}
        {activeTab === "credits" && (
          <div className="space-y-6">
            <h4 className="text-md font-medium text-gray-900">
              Credit Calculation
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Baseline Emissions (tCO2e/year)
                </label>
                <input
                  type="number"
                  value={report.creditCalculation?.baselineEmissions || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "creditCalculation",
                      "baselineEmissions",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Emissions (tCO2e/year)
                </label>
                <input
                  type="number"
                  value={report.creditCalculation?.projectEmissions || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "creditCalculation",
                      "projectEmissions",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Net Reduction (tCO2e/year)
                </label>
                <input
                  type="number"
                  value={report.creditCalculation?.netReduction || 0}
                  readOnly
                  className="w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vintage Year
                </label>
                <input
                  type="number"
                  value={
                    report.creditCalculation?.vintage ||
                    new Date().getFullYear()
                  }
                  onChange={(e) =>
                    handleInputChange(
                      "creditCalculation",
                      "vintage",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Credits (tCO2e)
                </label>
                <input
                  type="number"
                  value={report.creditCalculation?.totalCredits || 0}
                  readOnly
                  className="w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Credit ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={report.creditCalculation?.pricePerCredit || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "creditCalculation",
                      "pricePerCredit",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Methodology
              </label>
              <textarea
                value={report.creditCalculation?.methodology || ""}
                onChange={(e) =>
                  handleInputChange(
                    "creditCalculation",
                    "methodology",
                    e.target.value
                  )
                }
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Describe the methodology used for credit calculation..."
              />
            </div>

            <button
              onClick={calculateCredits}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <CalculatorIcon className="h-4 w-4 mr-2" />
              Calculate Credits
            </button>
          </div>
        )}

        {/* Navigation and Submit */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <div className="flex space-x-3">
            {tabs.map((tab, index) => {
              const currentIndex = tabs.findIndex((t) => t.id === activeTab);
              if (index < currentIndex) {
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {tab.name}
                  </button>
                );
              }
              return null;
            })}
          </div>

          <div className="flex space-x-3">
            {activeTab !== tabs[tabs.length - 1].id && (
              <button
                onClick={() => {
                  const currentIndex = tabs.findIndex(
                    (t) => t.id === activeTab
                  );
                  setActiveTab(tabs[currentIndex + 1].id);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Next
              </button>
            )}

            {activeTab === tabs[tabs.length - 1].id && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
