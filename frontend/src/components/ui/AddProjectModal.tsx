"use client";

import { useState, useEffect } from "react";
import { X, Upload, FileText, MapPin, Calendar, Users } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import { addProject, getOfficersByArea } from "@/lib/credit";
import { uploadMultipleFilesToIPFS } from "@/utils/ipfs";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  projectType: string;
  startDate: string;
  endDate: string;
  address: string;
  city: string;
  state: string;
  landArea: string;
  estimatedCredits: string;
  landImages: File[];
  supportingDocuments: File[];
}

interface Officer {
  address: string;
  name: string;
  designation: string;
  area: string;
}

export default function AddProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: AddProjectModalProps) {
  const [step, setStep] = useState<"form" | "review">("form");
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    projectType: "",
    startDate: "",
    endDate: "",
    address: "",
    city: "",
    state: "",
    landArea: "",
    estimatedCredits: "",
    landImages: [],
    supportingDocuments: [],
  });
  const [assignedOfficer, setAssignedOfficer] = useState<Officer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const projectTypes = [
    "Afforestation",
    "Reforestation",
    "Forest Conservation",
    "Mangrove Restoration",
    "Wetland Conservation",
    "Grassland Restoration",
    "Agricultural Practices",
    "Renewable Energy",
    "Waste Management",
    "Other"
  ];

  const states = [
    // States
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    // Union Territories
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'landImages' | 'supportingDocuments') => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      [field]: files
    }));
  };

  const findAssignedOfficer = async () => {
    try {
      const officers = await getOfficersByArea(formData.city);
      if (officers.length > 0) {
        // For now, assign the first officer found for the city
        // In a real implementation, you might want to implement load balancing
        setAssignedOfficer({
          address: officers[0],
          name: "Officer", // You would need to fetch officer details
          designation: "Area Officer",
          area: formData.city
        });
      }
    } catch (error) {
      console.error("Error finding assigned officer:", error);
    }
  };

  const handleReview = async () => {
    setError("");
    
    // Validate required fields
    if (!formData.name || !formData.description || !formData.projectType || 
        !formData.startDate || !formData.endDate || !formData.address || 
        !formData.city || !formData.state || !formData.landArea || 
        !formData.estimatedCredits) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.landImages.length === 0 && formData.supportingDocuments.length === 0) {
      setError("Please upload at least one land image or supporting document");
      return;
    }

    // Find assigned officer
    await findAssignedOfficer();
    setStep("review");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Upload files to IPFS
      setUploadProgress(10);
      const allFiles = [...formData.landImages, ...formData.supportingDocuments];
      const ipfsHashes = await uploadMultipleFilesToIPFS(allFiles);
      setUploadProgress(50);

      // Create metadata JSON and upload to IPFS
      const metadata = {
        landImages: formData.landImages.map((_, index) => ({
          name: formData.landImages[index].name,
          ipfsHash: ipfsHashes[index]
        })),
        supportingDocuments: formData.supportingDocuments.map((_, index) => ({
          name: formData.supportingDocuments[index].name,
          ipfsHash: ipfsHashes[formData.landImages.length + index]
        })),
        uploadedAt: new Date().toISOString()
      };

      const metadataHash = await uploadToIPFS(metadata);
      setUploadProgress(80);

      // Convert dates to timestamps
      const startTimestamp = Math.floor(new Date(formData.startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(formData.endDate).getTime() / 1000);

      // Add project to blockchain
      await addProject(
        formData.name,
        formData.description,
        formData.projectType,
        startTimestamp,
        endTimestamp,
        formData.address,
        formData.city,
        formData.state,
        parseFloat(formData.landArea),
        parseInt(formData.estimatedCredits),
        metadataHash
      );

      setUploadProgress(100);
      
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: "",
        description: "",
        projectType: "",
        startDate: "",
        endDate: "",
        address: "",
        city: "",
        state: "",
        landArea: "",
        estimatedCredits: "",
        landImages: [],
        supportingDocuments: [],
      });
      setStep("form");
      setAssignedOfficer(null);
    } catch (error) {
      console.error("Project creation failed:", error);
      setError(error instanceof Error ? error.message : "Project creation failed. Please try again.");
    } finally {
      setIsLoading(false);
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

  const handleBack = () => {
    setStep("form");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {step === "form" ? "Add New Project" : "Review Project Details"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {step === "form" ? (
          <form onSubmit={(e) => { e.preventDefault(); handleReview(); }} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Type *
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select project type</option>
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Project Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe your project in detail..."
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter project address"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select state</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="landArea" className="block text-sm font-medium text-gray-700 mb-1">
                  Land Area (acres) *
                </label>
                <input
                  type="number"
                  id="landArea"
                  name="landArea"
                  value={formData.landArea}
                  onChange={handleInputChange}
                  required
                  min="0.1"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter land area in acres"
                />
              </div>

              <div>
                <label htmlFor="estimatedCredits" className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Carbon Credits *
                </label>
                <input
                  type="number"
                  id="estimatedCredits"
                  name="estimatedCredits"
                  value={formData.estimatedCredits}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter estimated carbon credits"
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Land Images *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'landImages')}
                    className="hidden"
                    id="landImages"
                  />
                  <label htmlFor="landImages" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload land images
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB each
                    </span>
                  </label>
                </div>
                {formData.landImages.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      {formData.landImages.length} file(s) selected
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supporting Documents
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'supportingDocuments')}
                    className="hidden"
                    id="supportingDocuments"
                  />
                  <label htmlFor="supportingDocuments" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload documents
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      PDF, DOC, DOCX up to 10MB each
                    </span>
                  </label>
                </div>
                {formData.supportingDocuments.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      {formData.supportingDocuments.length} file(s) selected
                    </p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                Review Project
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Review Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Project Name</p>
                  <p className="text-sm text-gray-900">{formData.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Project Type</p>
                  <p className="text-sm text-gray-900">{formData.projectType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Start Date</p>
                  <p className="text-sm text-gray-900">{formData.startDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">End Date</p>
                  <p className="text-sm text-gray-900">{formData.endDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Land Area</p>
                  <p className="text-sm text-gray-900">{formData.landArea} acres</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Estimated Credits</p>
                  <p className="text-sm text-gray-900">{formData.estimatedCredits}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-600">Address</p>
                  <p className="text-sm text-gray-900">{formData.address}, {formData.city}, {formData.state}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-600">Description</p>
                  <p className="text-sm text-gray-900">{formData.description}</p>
                </div>
              </div>
            </div>

            {/* Assigned Officer */}
            {assignedOfficer && (
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center mb-3">
                  <Users className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-green-800">Assigned Officer</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-green-700">Name</p>
                    <p className="text-sm text-green-900">{assignedOfficer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Designation</p>
                    <p className="text-sm text-green-900">{assignedOfficer.designation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Area</p>
                    <p className="text-sm text-green-900">{assignedOfficer.area}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Wallet Address</p>
                    <p className="text-sm text-green-900 font-mono text-xs">{assignedOfficer.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* File Summary */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">Files to Upload</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-700">Land Images</p>
                  <p className="text-sm text-blue-900">{formData.landImages.length} file(s)</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Supporting Documents</p>
                  <p className="text-sm text-blue-900">{formData.supportingDocuments.length} file(s)</p>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {isLoading && uploadProgress > 0 && (
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold mb-4 text-yellow-800">Uploading to IPFS</h3>
                <div className="w-full bg-yellow-200 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-yellow-700 mt-2">{uploadProgress}% complete</p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Back to Form
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Creating Project..." : "Create Project"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
