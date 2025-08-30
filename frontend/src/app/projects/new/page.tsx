"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { addProject, getOfficersByArea, getOfficersByJurisdiction, getAllOfficers, assignOfficerToProject, getProjectCount } from "@/lib/credit";
import { uploadMultipleFilesToIPFS } from "@/utils/ipfs";
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
}

interface Officer {
  address: string;
  name: string;
  designation: string;
  area: string;
  jurisdiction: string;
}

// This will be replaced with real officer data from the contract
const mockOfficers: Officer[] = [
  {
    address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    name: "Rajesh Kumar",
    designation: "Area Officer",
    area: "Maharashtra",
    jurisdiction: "Maharashtra",
  },
  {
    address: "0x1234567890123456789012345678901234567890",
    name: "Priya Sharma",
    designation: "Area Officer",
    area: "Kerala",
    jurisdiction: "Kerala",
  },
  {
    address: "0x9876543210987654321098765432109876543210",
    name: "Amit Patel",
    designation: "Area Officer",
    area: "Gujarat",
    jurisdiction: "Gujarat",
  },
  {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    name: "Sneha Reddy",
    designation: "Area Officer",
    area: "Punjab",
    jurisdiction: "Punjab",
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { user, walletAddress } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedOfficer, setAssignedOfficer] = useState<Officer | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const assignOfficer = async () => {
    try {
      // Try multiple approaches to find an officer
      let officerAddresses = [];
      
      // 1. Try to get officers by city
      try {
        officerAddresses = await getOfficersByArea(formData.location.city);
      } catch (error) {
        console.log("No officers found for city:", formData.location.city);
      }
      
      // 2. If no officers found by city, try by state
      if (officerAddresses.length === 0) {
        try {
          officerAddresses = await getOfficersByJurisdiction(formData.location.state);
        } catch (error) {
          console.log("No officers found for state:", formData.location.state);
        }
      }
      
      // 3. If still no officers, try to get all officers
      if (officerAddresses.length === 0) {
        try {
          officerAddresses = await getAllOfficers();
        } catch (error) {
          console.log("No officers found at all");
        }
      }
      
      if (officerAddresses.length > 0) {
        // Use the first available officer
        const officerAddress = officerAddresses[0];
        
        // Create officer object with available data
        const officer: Officer = {
          address: officerAddress,
          name: "Area Officer", // You would need to fetch officer details
          designation: "Area Officer",
          area: formData.location.city,
          jurisdiction: formData.location.state,
        };
        
        setAssignedOfficer(officer);
        console.log("Officer assigned:", officer);
      } else {
        // Fallback to mock officers
        const availableOfficers = mockOfficers.filter(
          (officer) => officer.jurisdiction === formData.location.state
        );
        
        if (availableOfficers.length > 0) {
          setAssignedOfficer(availableOfficers[0]);
        } else {
          // Final fallback to any officer
          setAssignedOfficer(mockOfficers[0]);
        }
        console.log("Using mock officer as fallback");
      }
    } catch (error) {
      console.error("Error assigning officer:", error);
      // Fallback to mock officers
      const availableOfficers = mockOfficers.filter(
        (officer) => officer.jurisdiction === formData.location.state
      );
      setAssignedOfficer(availableOfficers[0] || mockOfficers[0]);
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
        return formData.landImages.length > 0;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        await assignOfficer();
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
    if (!walletAddress) {
      addNotification({
        type: "error",
        title: "Wallet not connected",
        message: "Please connect your wallet to create a project.",
      });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Upload files to IPFS
      setUploadProgress(10);
      const allFiles = [...formData.landImages, ...formData.documents];
      
      if (allFiles.length === 0) {
        throw new Error("Please upload at least one land image");
      }
      
      const ipfsHashes = await uploadMultipleFilesToIPFS(allFiles);
      setUploadProgress(50);

      // Create metadata JSON and upload to IPFS
      const metadata = {
        landImages: formData.landImages.map((_, index) => ({
          name: formData.landImages[index].name,
          ipfsHash: ipfsHashes[index]
        })),
        supportingDocuments: formData.documents.map((_, index) => ({
          name: formData.documents[index].name,
          ipfsHash: ipfsHashes[formData.landImages.length + index]
        })),
        uploadedAt: new Date().toISOString()
      };

      // Upload metadata to IPFS
      const metadataHash = await uploadToIPFS(metadata);
      setUploadProgress(80);

      // Convert dates to timestamps
      const startTimestamp = Math.floor(new Date(formData.startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(formData.endDate).getTime() / 1000);

      // Convert land area to acres if needed
      let landAreaInAcres = formData.landArea;
      if (formData.landAreaUnit === "hectares") {
        landAreaInAcres = Math.round(formData.landArea * 2.47105);
      } else if (formData.landAreaUnit === "sq_km") {
        landAreaInAcres = Math.round(formData.landArea * 247.105);
      }

      // Add project to blockchain
      await addProject(
        formData.name,
        formData.description,
        formData.projectType,
        startTimestamp,
        endTimestamp,
        formData.location.address,
        formData.location.city,
        formData.location.state,
        landAreaInAcres,
        formData.estimatedCredits,
        metadataHash
      );

      // Automatically assign an officer to the project
      if (assignedOfficer) {
        try {
          // Get the project count to know the new project ID
          const projectCount = await getProjectCount();
          const newProjectId = projectCount;
          
          // Assign the officer to the project
          await assignOfficerToProject(newProjectId, assignedOfficer.address);
          console.log(`Officer ${assignedOfficer.address} assigned to project ${newProjectId}`);
        } catch (error) {
          console.error("Failed to assign officer to project:", error);
          // Don't fail the entire process if officer assignment fails
        }
      }

      setUploadProgress(100);

      addNotification({
        type: "success",
        title: "Project Created",
        message:
          "Your project has been successfully created and assigned to an officer for verification.",
      });

      router.push("/projects");
    } catch (error) {
      console.error("Project creation failed:", error);
      addNotification({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to create project. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const uploadToIPFS = async (data: any) => {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
        'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload metadata to IPFS: ${response.statusText}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  };

  const steps = [
    { id: 1, name: "Project Details", icon: DocumentTextIcon },
    { id: 2, name: "Location & Area", icon: MapPinIcon },
    { id: 3, name: "Upload Files", icon: PhotoIcon },
    { id: 4, name: "Review & Submit", icon: BuildingOfficeIcon },
  ];

  // Check if user is authenticated
  if (!user || !walletAddress) {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Authentication Required</h2>
            <p className="mt-2 text-gray-600">
              Please connect your wallet to create a new project.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
                           : "bg-gray-300 text-gray-600"
                       }`}
                     >
                      <step.icon className="h-4 w-4" />
                    </div>
                    {stepIdx !== steps.length - 1 && (
                                           <div
                       className={`absolute top-4 left-8 -ml-px h-0.5 w-full ${
                         step.id < currentStep ? "bg-green-600" : "bg-gray-300"
                       }`}
                     />
                    )}
                  </div>
                                     <span className="absolute -bottom-6 left-0 text-xs font-semibold text-gray-600">
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
                      {/* States */}
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                      {/* Union Territories */}
                      <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                      <option value="Ladakh">Ladakh</option>
                      <option value="Lakshadweep">Lakshadweep</option>
                      <option value="Puducherry">Puducherry</option>
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

                         {currentStep === 4 && (
               <div className="space-y-8">
                 <h2 className="text-xl font-semibold text-gray-900 pb-2">
                   Review & Submit
                 </h2>

                                 <div className="bg-gray-50 rounded-lg p-8">
                   <h3 className="text-lg font-medium text-gray-900 mb-6">
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

                                     <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
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
                   <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                     <h3 className="text-lg font-medium text-green-900 mb-6">
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
                          {assignedOfficer.designation}
                        </p>
                        <p className="text-sm text-green-600">
                          Area: {assignedOfficer.area}
                        </p>
                        <p className="text-sm text-green-600">
                          Jurisdiction: {assignedOfficer.jurisdiction}
                        </p>
                        <p className="text-xs text-green-500 font-mono">
                          {assignedOfficer.address}
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
                {currentStep < 4 ? (
                  <Button onClick={handleNext}>Next</Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating... {uploadProgress}%</span>
                      </div>
                    ) : (
                      "Create Project"
                    )}
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
