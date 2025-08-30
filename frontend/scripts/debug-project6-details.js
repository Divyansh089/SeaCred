import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Debugging Project 6 (test2) details...");
  
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, signer);

    console.log("Using account:", signer.address);
    console.log("Contract address:", await contract.getAddress());

    const projectId = 6; // test2 project
    
    console.log(`\n=== Project ${projectId} (test2) Details ===`);
    
    // Get project details
    const project = await contract.getProject(projectId);
    
    console.log("Raw project data:");
    console.log(JSON.stringify(project, null, 2));
    
    console.log("\n=== Parsed Project Details ===");
    console.log(`Project ID: ${projectId}`);
    console.log(`Name: ${project.name}`);
    console.log(`Description: ${project.description}`);
    console.log(`Project Type: ${project.projectType}`);
    console.log(`Owner: ${project.owner}`);
    console.log(`Assigned Officer: ${project.assignedOfficer}`);
    console.log(`Status: ${project.verificationStatus}`);
    console.log(`Is Active: ${project.isActive}`);
    
    console.log("\n=== Location Details ===");
    console.log(`Project Address: ${project.projectAddress}`);
    console.log(`City: ${project.city}`);
    console.log(`State: ${project.state}`);
    console.log(`Land Area: ${project.landArea} acres`);
    console.log(`Estimated Credits: ${project.estimatedCredits} tCO2e`);
    
    console.log("\n=== Dates ===");
    console.log(`Start Date: ${new Date(Number(project.startDate) * 1000).toLocaleDateString()}`);
    console.log(`End Date: ${new Date(Number(project.endDate) * 1000).toLocaleDateString()}`);
    console.log(`Created At: ${new Date(Number(project.createdAt) * 1000).toLocaleDateString()}`);
    
    console.log("\n=== IPFS Data ===");
    console.log(`IPFS URL: ${project.ipfsUrl}`);
    
    // Check if the owner is registered
    console.log("\n=== Owner Details ===");
    try {
      const owner = await contract.getUser(project.owner);
      console.log(`Owner Name: ${owner.firstName} ${owner.lastName}`);
      console.log(`Owner District: ${owner.district}`);
      console.log(`Is Registered: ${owner.isRegistered}`);
    } catch (error) {
      console.log(`Error fetching owner details: ${error.message}`);
    }

  } catch (error) {
    console.error("❌ Debug failed:", error);
    throw error;
  }
}

main().then(() => { 
  console.log("✅ Project debug completed successfully"); 
  process.exit(0); 
}).catch((error) => { 
  console.error("❌ Debug failed:", error); 
  process.exit(1); 
});
