import { getReadContract, getWriteContract, toUnits, fromUnits } from "./web3";
import { keccak256, toUtf8Bytes } from "ethers";

export async function decimals(): Promise<number> {
  const c = await getReadContract();
  return Number(await c.decimals());
}

// Test function to verify contract connection
export async function testContractConnection() {
  try {
    console.log("Testing contract connection...");
    const c = await getReadContract();
    console.log("Contract instance created successfully");
    
    const name = await c.name();
    const decimals = await c.decimals();
    console.log("Contract info:", { name, decimals });
    
    return true;
  } catch (error) {
    console.error("Contract connection test failed:", error);
    return false;
  }
}

export async function getRoles(addr: string) {
  try {
    console.log("getRoles called with address:", addr);
    const c = await getReadContract();
    const ADMIN_ROLE = await c.DEFAULT_ADMIN_ROLE();
    const OFFICER_ROLE = await c.OFFICER_ROLE();
    console.log("Role hashes:", { ADMIN_ROLE, OFFICER_ROLE });
    
    const [isAdmin, isOfficer] = await Promise.all([
      c.hasRole(ADMIN_ROLE, addr),
      c.hasRole(OFFICER_ROLE, addr),
    ]);
    
    console.log("Role check results:", { isAdmin, isOfficer, address: addr });
    return { isAdmin, isOfficer };
  } catch (error) {
    console.error("Error in getRoles:", error);
    throw error;
  }
}

// Admin
export async function setOfficer(address: string, enabled: boolean) {
  const c = await getWriteContract();
  const tx = await c.setOfficer(address, enabled);
  await tx.wait();
}

// Officer Management Functions
export async function addOfficer(
  walletAddress: string,
  name: string,
  designation: string,
  area: string,
  contracts: string,
  jurisdiction: string
) {
  try {
    console.log("Starting addOfficer transaction...");
    console.log("Parameters:", { walletAddress, name, designation, area, contracts, jurisdiction });
    
    const c = await getWriteContract();
    console.log("Write contract obtained");
    
    // Use default gas settings instead of estimation
    const tx = await c.addOfficer(walletAddress, name, designation, area, contracts, jurisdiction);
    console.log("Transaction sent:", tx.hash);
    
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
    
    return receipt;
  } catch (error) {
    console.error("Error in addOfficer:", error);
    throw error;
  }
}

export async function updateOfficer(
  walletAddress: string,
  name: string,
  designation: string,
  area: string,
  contracts: string,
  jurisdiction: string
) {
  const c = await getWriteContract();
  const tx = await c.updateOfficer(walletAddress, name, designation, area, contracts, jurisdiction);
  await tx.wait();
}

export async function deactivateOfficer(walletAddress: string) {
  const c = await getWriteContract();
  const tx = await c.deactivateOfficer(walletAddress);
  await tx.wait();
}

export async function getOfficer(walletAddress: string) {
  const c = await getReadContract();
  const officer = await c.getOfficer(walletAddress);
  return {
    name: officer.name,
    designation: officer.designation,
    area: officer.area,
    contracts: officer.contracts,
    jurisdiction: officer.jurisdiction,
    walletAddress: officer.walletAddress,
    isActive: officer.isActive,
    assignedAt: Number(officer.assignedAt),
  };
}

// User Management Functions
export async function registerUser(
  firstName: string,
  lastName: string,
  phone: string,
  email: string,
  district: string
) {
  try {
    console.log("Starting registerUser transaction...");
    console.log("Parameters:", { firstName, lastName, phone, email, district });
    
    const c = await getWriteContract();
    console.log("Write contract obtained");
    
    const tx = await c.registerUser(firstName, lastName, phone, email, district);
    console.log("Transaction sent:", tx.hash);
    
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
    
    return receipt;
  } catch (error) {
    console.error("Error in registerUser:", error);
    throw error;
  }
}

export async function getUser(walletAddress: string) {
  const c = await getReadContract();
  const user = await c.getUser(walletAddress);
  
  // Check if user has admin role
  const adminRole = await c.ADMIN_ROLE();
  const officerRole = await c.OFFICER_ROLE();
  const hasAdminRole = await c.hasRole(adminRole, walletAddress);
  const hasOfficerRole = await c.hasRole(officerRole, walletAddress);
  
  let role = "user";
  if (hasAdminRole) {
    role = "admin";
  } else if (hasOfficerRole) {
    role = "officer";
  }
  
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    email: user.email,
    district: user.district,
    walletAddress: user.walletAddress,
    isRegistered: user.isRegistered,
    registeredAt: Number(user.registeredAt),
    role: role
  };
}

export async function isUserRegistered(walletAddress: string) {
  const c = await getReadContract();
  return await c.isUserRegistered(walletAddress);
}

// Project Management Functions
export async function addProject(
  name: string,
  description: string,
  projectType: string,
  startDate: number,
  endDate: number,
  projectAddress: string,
  city: string,
  state: string,
  landArea: number,
  estimatedCredits: number,
  ipfsUrl: string
) {
  try {
    console.log("Starting addProject transaction...");
    console.log("Parameters:", { 
      name, 
      description, 
      projectType, 
      startDate, 
      endDate, 
      projectAddress, 
      city, 
      state, 
      landArea, 
      estimatedCredits, 
      ipfsUrl 
    });
    
    const c = await getWriteContract();
    console.log("Write contract obtained");
    
    const tx = await c.addProject(
      name, 
      description, 
      projectType, 
      startDate, 
      endDate, 
      projectAddress, 
      city, 
      state, 
      landArea, 
      estimatedCredits, 
      ipfsUrl
    );
    console.log("Transaction sent:", tx.hash);
    
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
    
    return receipt;
  } catch (error) {
    console.error("Error in addProject:", error);
    throw error;
  }
}

export async function assignOfficerToProject(projectId: number, officer: string) {
  try {
    console.log("Starting assignOfficerToProject transaction...");
    console.log("Parameters:", { projectId, officer });
    
    const c = await getWriteContract();
    console.log("Write contract obtained");
    
    const tx = await c.assignOfficerToProject(projectId, officer);
    console.log("Transaction sent:", tx.hash);
    
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
    
    return receipt;
  } catch (error) {
    console.error("Error in assignOfficerToProject:", error);
    throw error;
  }
}

export async function getProject(projectId: number) {
  const c = await getReadContract();
  const project = await c.getProject(projectId);
  return {
    name: project.name,
    description: project.description,
    projectType: project.projectType,
    startDate: Number(project.startDate),
    endDate: Number(project.endDate),
    projectAddress: project.projectAddress,
    city: project.city,
    state: project.state,
    landArea: Number(project.landArea),
    estimatedCredits: Number(project.estimatedCredits),
    ipfsUrl: project.ipfsUrl,
    owner: project.owner,
    assignedOfficer: project.assignedOfficer,
    isActive: project.isActive,
    createdAt: Number(project.createdAt),
  };
}

export async function getUserProjects(walletAddress: string) {
  const c = await getReadContract();
  const projectIds = await c.getUserProjects(walletAddress);
  return projectIds.map((id: bigint) => Number(id));
}

export async function getProjectCount() {
  const c = await getReadContract();
  return Number(await c.getProjectCount());
}

export async function getAllProjects() {
  const c = await getReadContract();
  const projectCount = await c.getProjectCount();
  const projects = [];
  
  for (let i = 1; i <= Number(projectCount); i++) {
    try {
      const project = await c.getProject(i);
      projects.push({
        id: i,
        name: project.name,
        description: project.description,
        projectType: project.projectType,
        startDate: Number(project.startDate),
        endDate: Number(project.endDate),
        projectAddress: project.projectAddress,
        city: project.city,
        state: project.state,
        landArea: Number(project.landArea),
        estimatedCredits: Number(project.estimatedCredits),
        ipfsUrl: project.ipfsUrl,
        owner: project.owner,
        assignedOfficer: project.assignedOfficer,
        isActive: project.isActive,
        createdAt: Number(project.createdAt),
        verificationStatus: Number(project.verificationStatus),
      });
    } catch (error) {
      console.error(`Error fetching project ${i}:`, error);
    }
  }
  
  return projects;
}

export async function getOfficerAssignedProjects(officerAddress: string) {
  const c = await getReadContract();
  
  try {
    // First try to use the new getOfficerAssignedProjects function
    try {
      const projectIds = await c.getOfficerAssignedProjects(officerAddress);
      const projects = [];
      
      // Fetch project details for each assigned project
      for (const projectId of projectIds) {
        try {
          const project = await c.getProject(Number(projectId));
          projects.push({
            id: Number(projectId),
            name: project.name,
            description: project.description,
            projectType: project.projectType,
            startDate: Number(project.startDate),
            endDate: Number(project.endDate),
            projectAddress: project.projectAddress,
            city: project.city,
            state: project.state,
            landArea: Number(project.landArea),
            estimatedCredits: Number(project.estimatedCredits),
            ipfsUrl: project.ipfsUrl,
            owner: project.owner,
            assignedOfficer: project.assignedOfficer,
            isActive: project.isActive,
            createdAt: Number(project.createdAt),
            verificationStatus: Number(project.verificationStatus),
          });
        } catch (error) {
          console.error(`Error fetching project ${projectId}:`, error);
        }
      }
      
      return projects;
    } catch (error) {
      console.log("New getOfficerAssignedProjects function not available, using fallback method");
      
      // Fallback: Get all projects and filter by assigned officer
      const allProjects = await getAllProjects();
      const officerProjects = allProjects.filter(project => 
        project.assignedOfficer?.toLowerCase() === officerAddress.toLowerCase()
      );
      
      return officerProjects;
    }
  } catch (error) {
    console.error("Error fetching officer assigned projects:", error);
    return [];
  }
}

export async function getOfficerAssignedProjectIds(officerAddress: string) {
  const c = await getReadContract();
  
  try {
    // First try to use the new getOfficerAssignedProjects function
    try {
      const projectIds = await c.getOfficerAssignedProjects(officerAddress);
      return projectIds.map((id: bigint) => Number(id));
    } catch (error) {
      console.log("New getOfficerAssignedProjects function not available, using fallback method");
      
      // Fallback: Get all projects and filter by assigned officer
      const allProjects = await getAllProjects();
      const officerProjects = allProjects.filter(project => 
        project.assignedOfficer?.toLowerCase() === officerAddress.toLowerCase()
      );
      
      return officerProjects.map(project => project.id);
    }
  } catch (error) {
    console.error("Error fetching officer assigned project IDs:", error);
    return [];
  }
}

export async function submitOfficerVerification(verificationData: {
  projectId: number;
  projectName: string;
  projectOwner: string;
  assignedOfficer: string;
  officerAddress: string;
  officerName: string;
  verificationDate: string;
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
}) {
  // This function would typically send verification data to the admin
  // For now, we'll just log it and return success
  console.log("Officer verification data:", verificationData);
  
  // In a real implementation, you might:
  // 1. Upload verification data to IPFS
  // 2. Call a smart contract function to submit verification
  // 3. Send notification to admin
  
  return {
    success: true,
    verificationId: `verification_${Date.now()}`,
    message: "Verification submitted successfully"
  };
}



export async function getOfficersByArea(area: string) {
  const c = await getReadContract();
  const addresses = await c.getOfficersByArea(area);
  return addresses;
}

export async function getOfficersByJurisdiction(jurisdiction: string) {
  const c = await getReadContract();
  const addresses = await c.getOfficersByJurisdiction(jurisdiction);
  return addresses;
}

export async function getAllOfficers() {
  const c = await getReadContract();
  const addresses = await c.getAllOfficers();
  return addresses;
}

export async function getAllUsers() {
  const c = await getReadContract();
  const addresses = await c.getAllUsers();
  return addresses;
}

export async function grantAdminRole(newAdminAddress: string) {
  const c = await getWriteContract();
  const tx = await c.grantRole(await c.DEFAULT_ADMIN_ROLE(), newAdminAddress);
  await tx.wait();
  return tx;
}

export async function approveAndMint(
  cid: string,
  recipient: string,
  amountHuman: string | number,
  submitter: string
) {
  const c = await getWriteContract();
  const d = await decimals(); // should be 18 for your deploy
  const amount = toUnits(amountHuman, d);
  const tx = await c.approveAndMint(cid, recipient, amount, submitter);
  await tx.wait();
}

export async function adminBurn(amountHuman: string | number) {
  const c = await getWriteContract();
  const d = await decimals();
  const tx = await c.adminBurn(toUnits(amountHuman, d));
  await tx.wait();
}

export async function adminTransferToOfficer(officer: string, amountHuman: string | number) {
  const c = await getWriteContract();
  const d = await decimals();
  const tx = await c.adminTransferToOfficer(officer, toUnits(amountHuman, d));
  await tx.wait();
}

// Officer
export async function officerDistribute(user: string, amountHuman: string | number) {
  const c = await getWriteContract(); // must be connected as the officer signer
  const d = await decimals();
  const tx = await c.transfer(user, toUnits(amountHuman, d)); // contract enforces officer→user only
  await tx.wait();
}

// Dashboard
export async function getDashboard(me?: string) {
  const c = await getReadContract();
  const d = await decimals();
  const [mintedCum, burnedCum] = await Promise.all([
    c.mintedCumulative(),
    c.burnedCumulative()
  ]);
  const officerReceived = me ? await c.officerReceived(me) : BigInt(0);
  const officerDistributed = me ? await c.officerDistributed(me) : BigInt(0);
  const userReceived = me ? await c.userReceived(me) : BigInt(0);

  return {
    decimals: d,
    mintedCumulative: fromUnits(mintedCum, d),
    burnedCumulative: fromUnits(burnedCum, d),
    officerReceived: fromUnits(officerReceived, d),
    officerDistributed: fromUnits(officerDistributed, d),
    userReceived: fromUnits(userReceived, d),
  };
}

export async function getApprovalByCid(cid: string) {
  const c = await getReadContract();
  const key = keccak256(toUtf8Bytes(cid));
  const a = await c.approvals(key);
  return {
    submitter: a[0] as string,
    cid: a[1] as string,
    amount: a[2] as bigint,
    recipient: a[3] as string,
    approvedAt: Number(a[4]),
    minted: a[5] as boolean,
  };
}

// Project Management Functions
export async function removeProject(projectId: number) {
  const c = await getWriteContract();
  const tx = await c.removeProject(projectId);
  await tx.wait();
  return tx;
}

export async function startVerification(projectId: number) {
  const c = await getWriteContract();
  const tx = await c.startVerification(projectId);
  await tx.wait();
  return tx;
}

export async function rejectUserApplication(userAddress: string, reason: string) {
  try {
    console.log("Starting rejectUserApplication...");
    console.log("Parameters:", { userAddress, reason });
    
    // Get all projects for this user
    const allProjects = await getAllProjects();
    const userProjects = allProjects.filter(project => 
      project.owner.toLowerCase() === userAddress.toLowerCase()
    );
    
    console.log("User projects found:", userProjects.length);
    
    // Remove all projects for this user
    for (const project of userProjects) {
      try {
        await removeProject(project.id);
        console.log(`Removed project ${project.id}: ${project.name}`);
      } catch (error) {
        console.error(`Error removing project ${project.id}:`, error);
      }
    }
    
    // TODO: Store rejection reason in IPFS or database
    console.log("Rejection reason:", reason);
    
    return { success: true, projectsRemoved: userProjects.length };
  } catch (error) {
    console.error("Error in rejectUserApplication:", error);
    throw error;
  }
}

