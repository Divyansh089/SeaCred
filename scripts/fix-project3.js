import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Fixing project 3 by assigning an officer...");
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, signer);

    const testOfficerAddress = "0x86364Aa26E4E936fA1134e08c351e796E82Eb199";
    const projectId = 3;

    console.log("Using account:", signer.address);
    console.log(`Assigning officer ${testOfficerAddress} to project ${projectId}...`);
    
    // Check if we have admin role
    const adminRole = await contract.ADMIN_ROLE();
    const hasAdminRole = await contract.hasRole(adminRole, signer.address);
    console.log("Has admin role:", hasAdminRole);
    
    if (!hasAdminRole) {
      console.log("❌ Current account doesn't have admin role");
      return;
    }
    
    const tx = await contract.assignOfficerToProject(projectId, testOfficerAddress);
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    
    console.log("✅ Officer assigned successfully!");
    
    // Verify the assignment
    const project = await contract.getProject(projectId);
    console.log(`Project ${projectId} assigned officer: ${project.assignedOfficer}`);

  } catch (error) {
    console.error("❌ Assignment failed:", error);
    throw error;
  }
}

main().then(() => { 
  console.log("✅ Script completed successfully"); 
  process.exit(0); 
}).catch((error) => { 
  console.error("❌ Script failed:", error); 
  process.exit(1); 
});
