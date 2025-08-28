export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'officer' | 'project_authority';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarbonProject {
  id: string;
  name: string;
  description: string;
  location: string;
  projectType: 'forestry' | 'renewable_energy' | 'energy_efficiency' | 'methane_capture' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'suspended';
  totalCredits: number;
  availableCredits: number;
  pricePerCredit: number;
  projectAuthorityId: string;
  documents: ProjectDocument[];
  createdAt: Date;
  updatedAt: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  assignedOfficerId?: string;
  landImages?: ProjectDocument[];
  contactPerson?: {
    name: string;
    email: string;
    phone: string;
  };
  technicalDetails?: {
    methodology: string;
    baselineScenario: string;
    projectScenario: string;
    monitoringPlan: string;
  };
  landArea?: number;
  landAreaUnit?: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
}

export interface CarbonCredit {
  id: string;
  projectId: string;
  serialNumber: string;
  vintage: number;
  amount: number;
  status: 'available' | 'distributed';
  issuedAt: Date;
  distributedAt?: Date;
}

export interface VerificationRequest {
  id: string;
  projectId: string;
  requestedBy: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  documents: ProjectDocument[];
  notes?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalCredits: number;
  availableCredits: number;
  totalDistributions: number;
  pendingVerifications: number;
}

export interface Activity {
  id: string;
  type: 'project_created' | 'project_approved' | 'credits_issued' | 'distribution_completed' | 'verification_completed';
  title: string;
  description: string;
  timestamp: Date;
  userId: string;
  projectId?: string;
}

export interface Officer {
  id: string;
  name: string;
  email: string;
  jurisdiction: string;
  specialization: string[];
  role: 'officer';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// New interfaces for enhanced workflow
export interface VerificationReport {
  id: string;
  projectId: string;
  officerId: string;
  verificationType: 'manual' | 'ai_assisted' | 'ai_only';
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  
  // Land and Environmental Details
  landDetails: {
    area: number;
    areaUnit: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    landType: 'forest' | 'wetland' | 'agricultural' | 'urban' | 'other';
    ownershipStatus: 'private' | 'public' | 'community' | 'mixed';
    landUseHistory: string;
    biodiversityAssessment: string;
  };
  
  // Images and Documentation
  images: {
    id: string;
    type: 'satellite' | 'ground_photo' | 'aerial' | 'document';
    url: string;
    description: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    uploadedAt: Date;
    verifiedBy?: string;
  }[];
  
  // AI Analysis Results
  aiAnalysis?: {
    imageAnalysis: {
      landCoverClassification: string;
      deforestationRisk: 'low' | 'medium' | 'high';
      biodiversityScore: number;
      confidence: number;
    };
    documentAnalysis: {
      complianceScore: number;
      riskFactors: string[];
      recommendations: string[];
    };
    overallAssessment: {
      score: number;
      status: 'approved' | 'rejected' | 'needs_review';
      reasoning: string;
    };
  };
  
  // Officer Assessment
  officerAssessment: {
    complianceVerified: boolean;
    environmentalImpact: string;
    socialBenefits: string;
    technicalFeasibility: string;
    monitoringPlan: string;
    riskAssessment: string;
    recommendations: string[];
  };
  
  // Credit Calculation
  creditCalculation: {
    baselineEmissions: number;
    projectEmissions: number;
    netReduction: number;
    methodology: string;
    vintage: number;
    totalCredits: number;
    pricePerCredit: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export interface BlockchainTransaction {
  id: string;
  type: 'mint' | 'transfer' | 'retire' | 'burn';
  projectId: string;
  officerId: string;
  adminId: string;
  amount: number;
  tokenId?: string;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed: number;
  gasPrice: number;
  blockNumber: number;
  createdAt: Date;
  confirmedAt?: Date;
}

export interface CreditDistribution {
  id: string;
  projectId: string;
  officerId: string;
  authorityId: string;
  totalCredits: number;
  officerWallet: string;
  authorityWallet: string;
  distribution: {
    officerShare: number; // Percentage
    authorityShare: number; // Percentage
    platformFee: number; // Percentage
  };
  status: 'pending' | 'distributed' | 'failed';
  blockchainTransactionId: string;
  createdAt: Date;
  distributedAt?: Date;
}

export interface AIVerificationRequest {
  id: string;
  projectId: string;
  requestType: 'image_analysis' | 'document_analysis' | 'full_assessment';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  inputData: {
    images: string[];
    documents: string[];
    projectDetails: Partial<CarbonProject>;
  };
  results?: {
    analysisType: string;
    confidence: number;
    findings: string[];
    recommendations: string[];
    processingTime: number;
  };
  createdAt: Date;
  completedAt?: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  requiredRole: string[];
  requiredDocuments: string[];
  estimatedTime: number; // in hours
  dependencies: string[]; // step IDs that must be completed first
  autoAssignable: boolean;
  aiSupported: boolean;
}

export interface ProjectWorkflow {
  id: string;
  projectId: string;
  currentStep: string;
  completedSteps: string[];
  assignedOfficerId?: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  estimatedCompletion: Date;
  actualCompletion?: Date;
  createdAt: Date;
  updatedAt: Date;
}
