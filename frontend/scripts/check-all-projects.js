import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Checking all projects...");
  
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, signer);

    console.log("Using account:", signer.address);
    console.log("Contract address:", await contract.getAddress());

    // Get total project count
    const projectCount = await contract.getProjectCount();
    console.log(`Total projects: ${projectCount}`);

    console.log("\n=== All Projects ===");
    for (let i = 1; i <= Number(projectCount); i++) {
      try {
        const project = await contract.getProject(i);
        console.log(`Project ${i}:`);
        console.log(`  Name: ${project.name}`);
        console.log(`  Owner: ${project.owner}`);
        console.log(`  Assigned Officer: ${project.assignedOfficer}`);
        console.log(`  Status: ${project.verificationStatus}`);
        console.log(`  City: ${project.city}, State: ${project.state}`);
        console.log(`  Is Active: ${project.isActive}`);
        console.log(`  Created At: ${new Date(Number(project.createdAt) * 1000).toLocaleDateString()}`);
        console.log("---");
      } catch (error) {
        console.log(`Error fetching project ${i}:`, error.message);
      }
    }

    // Check for unassigned projects
    console.log("\n=== Unassigned Projects ===");
    let unassignedCount = 0;
    for (let i = 1; i <= Number(projectCount); i++) {
      try {
        const project = await contract.getProject(i);
        if (project.assignedOfficer === "0x0000000000000000000000000000000000000000") {
          console.log(`Project ${i}: ${project.name} (Owner: ${project.owner})`);
          unassignedCount++;
        }
      } catch (error) {
        console.log(`Error checking project ${i}:`, error.message);
      }
    }
    console.log(`Total unassigned projects: ${unassignedCount}`);

    // Check for officer "Divyansh" - we need to find their address
    console.log("\n=== Looking for Officer 'Divyansh' ===");
    // We need to find the officer address for Divyansh
    // Let me check if there are any other officers

  } catch (error) {
    console.error("❌ Check failed:", error);
    throw error;
  }
}

main().then(() => { 
  console.log("✅ Project check completed successfully"); 
  process.exit(0); 
}).catch((error) => { 
  console.error("❌ Check failed:", error); 
  process.exit(1); 
});
