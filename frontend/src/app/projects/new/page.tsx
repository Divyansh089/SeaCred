"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/contexts/NotificationContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  MapPinIcon,
  PhotoIcon,
  DocumentTextIcon,
  UserIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

interface ProjectFormData {
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  projectType: string;
  estimatedCredits: number;
  startDate: string;
  endDate: string;
  landArea: number;
  landAreaUnit: string;
  documents: File[];
  landImages: File[];
  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };
  technicalDetails: {
    methodology: string;
    baselineScenario: string;
    projectScenario: string;
    monitoringPlan: string;
  };
}

interface Officer {
  id: string;
  name: string;
  email: string;
  jurisdiction: string;
  specialization: string[];
}

const mockOfficers: Officer[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@seacred.gov.in",
    jurisdiction: "Maharashtra",
    specialization: ["renewable_energy", "forestry"],
  },
  {
    id: "2",
    name: "Priya Sharma",
    email: "priya.sharma@seacred.gov.in",
    jurisdiction: "Kerala",
    specialization: ["forestry", "methane_capture"],
  },
  {
    id: "3",
    name: "Amit Patel",
    email: "amit.patel@seacred.gov.in",
    jurisdiction: "Gujarat",
    specialization: ["renewable_energy", "energy_efficiency"],
  },
  {
    id: "4",
    name: "Sneha Reddy",
    email: "sneha.reddy@seacred.gov.in",
    jurisdiction: "Punjab",
    specialization: ["methane_capture", "other"],
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedOfficer, setAssignedOfficer] = useState<Officer | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    location: {
      address: "",
      city: "",
      state: "",
      country: "India",
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    },
    projectType: "",
    estimatedCredits: 0,
    startDate: "",
    endDate: "",
    landArea: 0,
    landAreaUnit: "hectares",
    documents: [],
    landImages: [],
    contactPerson: {
      name: "",
      email: "",
      phone: "",
    },
    technicalDetails: {
      methodology: "",
      baselineScenario: "",
      projectScenario: "",
      monitoringPlan: "",
    },
  });

  // Credit calculation based on project type and land area
  const calculateCredits = (
    projectType: string,
    landArea: number,
    landAreaUnit: string
  ): number => {
    // Convert land area to hectares for calculation
    let areaInHectares = landArea;
    if (landAreaUnit === "acres") {
      areaInHectares = landArea * 0.404686;
    } else if (landAreaUnit === "sq_km") {
      areaInHectares = landArea * 100;
    }

    // Credit calculation factors (tons of CO2 per hectare per year)
    const creditFactors = {
      forestry: 5.5, // Afforestation/reforestation
      renewable_energy: 8.2, // Solar/wind energy
      energy_efficiency: 3.8, // Energy efficiency projects
      methane_capture: 12.5, // Methane capture from waste
      other: 4.0, // Default factor
    };

    const factor =
      creditFactors[projectType as keyof typeof creditFactors] ||
      creditFactors.other;
    return Math.round(areaInHectares * factor * 1000); // Convert to credits (1 credit = 1 ton CO2)
  };

  // Auto-calculate credits when land area or project type changes
  useEffect(() => {
    if (formData.landArea > 0 && formData.projectType) {
      const calculatedCredits = calculateCredits(
        formData.projectType,
        formData.landArea,
        formData.landAreaUnit
      );
      setFormData((prev) => ({
        ...prev,
        estimatedCredits: calculatedCredits,
      }));
    }
  }, [formData.landArea, formData.landAreaUnit, formData.projectType]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contactPerson: {
        ...prev.contactPerson,
        [field]: value,
      },
    }));
  };

  const handleTechnicalChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      technicalDetails: {
        ...prev.technicalDetails,
        [field]: value,
      },
    }));
  };

  const handleFileUpload = (
    files: FileList | null,
    type: "documents" | "landImages"
  ) => {
    if (files) {
      const fileArray = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        [type]: [...prev[type], ...fileArray],
      }));
    }
  };

  const removeFile = (index: number, type: "documents" | "landImages") => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const assignOfficer = () => {
    // Simple logic to assign officer based on state
    const availableOfficers = mockOfficers.filter(
      (officer) => officer.jurisdiction === formData.location.state
    );

    if (availableOfficers.length > 0) {
      // Assign based on project type specialization
      const specializedOfficer = availableOfficers.find((officer) =>
        officer.specialization.includes(formData.projectType)
      );
      setAssignedOfficer(specializedOfficer || availableOfficers[0]);
    } else {
      // Fallback to any officer
      setAssignedOfficer(mockOfficers[0]);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.name &&
          formData.description &&
          formData.projectType
        );
      case 2:
        return !!(
          formData.location.address &&
          formData.location.city &&
          formData.location.state &&
          formData.estimatedCredits > 0
        );
      case 3:
        return !!(
          formData.contactPerson.name &&
          formData.contactPerson.email &&
          formData.contactPerson.phone
        );
      case 4:
        return formData.landImages.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        assignOfficer();
      }
      setCurrentStep(currentStep + 1);
    } else {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please fill in all required fields before proceeding.",
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      addNotification({
        type: "success",
        title: "Project Created",
        message:
          "Your project has been successfully created and assigned to an officer for verification.",
      });

      router.push("/projects");
    } catch {
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to create project. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: "Basic Information", icon: DocumentTextIcon },
    { id: 2, name: "Location & Details", icon: MapPinIcon },
    { id: 3, name: "Contact Information", icon: UserIcon },
    { id: 4, name: "Land Images", icon: PhotoIcon },
    { id: 5, name: "Review & Submit", icon: BuildingOfficeIcon },
  ];

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Project
              </h1>
              <p className="text-sm text-gray-600">
                Fill in the project details to create a new carbon credit
                project
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li
                  key={step.name}
                  className={`${
                    stepIdx !== steps.length - 1 ? "pr-8 sm:pr-10" : ""
                  } relative`}
                >
                  <div className="flex items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        step.id <= currentStep
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      <step.icon className="h-4 w-4" />
                    </div>
                    {stepIdx !== steps.length - 1 && (
                      <div
                        className={`absolute top-4 left-8 -ml-px h-0.5 w-full ${
                          step.id < currentStep ? "bg-green-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                  <span className="absolute -bottom-6 left-0 text-xs font-medium text-gray-500">
                    {step.name}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Form Content */}
        <Card className="max-w-4xl mx-auto">
          <div className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Basic Project Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Project Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    placeholder="Describe your project in detail"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Project Type *
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) =>
                      handleInputChange("projectType", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  >
                    <option value="">Select project type</option>
                    <option value="forestry">Forestry</option>
                    <option value="renewable_energy">Renewable Energy</option>
                    <option value="energy_efficiency">Energy Efficiency</option>
                    <option value="methane_capture">Methane Capture</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Location & Project Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={formData.location.address}
                      onChange={(e) =>
                        handleLocationChange("address", e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.location.city}
                      onChange={(e) =>
                        handleLocationChange("city", e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="City"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      State *
                    </label>
                    <select
                      value={formData.location.state}
                      onChange={(e) =>
                        handleLocationChange("state", e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    >
                      <option value="">Select state</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Land Area
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        value={formData.landArea}
                        onChange={(e) =>
                          handleInputChange(
                            "landArea",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="flex-1 rounded-l-md border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        placeholder="0"
                      />
                      <select
                        value={formData.landAreaUnit}
                        onChange={(e) =>
                          handleInputChange("landAreaUnit", e.target.value)
                        }
                        className="rounded-r-md border-l-0 border-gray-300 bg-gray-50 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      >
                        <option value="hectares">Hectares</option>
                        <option value="acres">Acres</option>
                        <option value="sq_km">Square Kilometers</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Estimated Credits (Auto-calculated)
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="number"
                        value={formData.estimatedCredits}
                        readOnly
                        className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                        placeholder="0"
                      />
                      <span className="ml-2 text-sm text-gray-500">
                        credits
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Based on {formData.landArea} {formData.landAreaUnit} and{" "}
                      {formData.projectType.replace("_", " ")} project type
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mini Map Preview
                    </label>
                    <div className="mt-1 h-32 bg-gray-100 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <MapPinIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          {formData.location.city && formData.location.state
                            ? `${formData.location.city}, ${formData.location.state}`
                            : "Location will appear here"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Contact Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson.name}
                    onChange={(e) =>
                      handleContactChange("name", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    placeholder="Full name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.contactPerson.email}
                      onChange={(e) =>
                        handleContactChange("email", e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPerson.phone}
                      onChange={(e) =>
                        handleContactChange("phone", e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="+91 1234567890"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900">
                    Technical Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Methodology
                    </label>
                    <textarea
                      value={formData.technicalDetails.methodology}
                      onChange={(e) =>
                        handleTechnicalChange("methodology", e.target.value)
                      }
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="Describe the methodology used for carbon reduction"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Baseline Scenario
                    </label>
                    <textarea
                      value={formData.technicalDetails.baselineScenario}
                      onChange={(e) =>
                        handleTechnicalChange(
                          "baselineScenario",
                          e.target.value
                        )
                      }
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="Describe the baseline scenario"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Project Scenario
                    </label>
                    <textarea
                      value={formData.technicalDetails.projectScenario}
                      onChange={(e) =>
                        handleTechnicalChange("projectScenario", e.target.value)
                      }
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="Describe the project scenario"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Monitoring Plan
                    </label>
                    <textarea
                      value={formData.technicalDetails.monitoringPlan}
                      onChange={(e) =>
                        handleTechnicalChange("monitoringPlan", e.target.value)
                      }
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="Describe the monitoring plan"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Land Images & Documents
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Land Images *
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="land-images"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                        >
                          <span>Upload images</span>
                          <input
                            id="land-images"
                            name="land-images"
                            type="file"
                            className="sr-only"
                            multiple
                            accept="image/*"
                            ref={imageInputRef}
                            onChange={(e) =>
                              handleFileUpload(e.target.files, "landImages")
                            }
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </div>
                  </div>
                </div>

                {formData.landImages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Uploaded Images ({formData.landImages.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.landImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Land image ${index + 1}`}
                            className="h-24 w-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index, "landImages")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Supporting Documents
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="documents"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                        >
                          <span>Upload documents</span>
                          <input
                            id="documents"
                            name="documents"
                            type="file"
                            className="sr-only"
                            multiple
                            accept=".pdf,.doc,.docx"
                            ref={fileInputRef}
                            onChange={(e) =>
                              handleFileUpload(e.target.files, "documents")
                            }
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX up to 10MB each
                      </p>
                    </div>
                  </div>
                </div>

                {formData.documents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Uploaded Documents ({formData.documents.length})
                    </h3>
                    <div className="space-y-2">
                      {formData.documents.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-700">
                              {file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index, "documents")}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Review & Submit
                </h2>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    Project Summary
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700">
                        Basic Information
                      </h4>
                      <dl className="mt-2 space-y-1">
                        <div>
                          <dt className="text-sm text-gray-500">Name:</dt>
                          <dd className="text-sm text-gray-900">
                            {formData.name}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">Type:</dt>
                          <dd className="text-sm text-gray-900">
                            {formData.projectType.replace("_", " ")}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">
                            Description:
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {formData.description}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700">Location</h4>
                      <dl className="mt-2 space-y-1">
                        <div>
                          <dt className="text-sm text-gray-500">Address:</dt>
                          <dd className="text-sm text-gray-900">
                            {formData.location.address}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">City:</dt>
                          <dd className="text-sm text-gray-900">
                            {formData.location.city}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">State:</dt>
                          <dd className="text-sm text-gray-900">
                            {formData.location.state}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700">
                        Project Details
                      </h4>
                      <dl className="mt-2 space-y-1">
                        <div>
                          <dt className="text-sm text-gray-500">
                            Estimated Credits:
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {formData.estimatedCredits.toLocaleString()}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm text-gray-500">Land Area:</dt>
                          <dd className="text-sm text-gray-900">
                            {formData.landArea} {formData.landAreaUnit}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700">
                        Contact Person
                      </h4>
                      <dl className="mt-2 space-y-1">
                        <div>
                          <dt className="text-sm text-gray-500">Name:</dt>
                          <dd className="text-sm text-gray-900">
                            {formData.contactPerson.name}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">Email:</dt>
                          <dd className="text-sm text-gray-900">
                            {formData.contactPerson.email}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">Phone:</dt>
                          <dd className="text-sm text-gray-900">
                            {formData.contactPerson.phone}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700">Files</h4>
                      <dl className="mt-2 space-y-1">
                        <div>
                          <dt className="text-sm text-gray-500">
                            Land Images:
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {formData.landImages.length} files
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">Documents:</dt>
                          <dd className="text-sm text-gray-900">
                            {formData.documents.length} files
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>

                {assignedOfficer && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-md font-medium text-green-900 mb-4">
                      Assigned Officer
                    </h3>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-green-900">
                          {assignedOfficer.name}
                        </h4>
                        <p className="text-sm text-green-700">
                          {assignedOfficer.email}
                        </p>
                        <p className="text-sm text-green-600">
                          Jurisdiction: {assignedOfficer.jurisdiction}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              <div className="flex gap-3">
                {currentStep < 5 ? (
                  <Button onClick={handleNext}>Next</Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? "Creating..." : "Create Project"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
