import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Getting officer information for testing...");
  
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, provider);

    console.log("Contract address:", await contract.getAddress());

    // Known officer address
    const officerAddress = "0x86364Aa26E4E936fA1134e08c351e796E82Eb199";
    
    console.log("\n=== Officer Information ===");
    console.log(`Officer Address: ${officerAddress}`);
    
    try {
      const officer = await contract.getOfficer(officerAddress);
      console.log("Officer Details:");
      console.log(`  Name: ${officer.name}`);
      console.log(`  Designation: ${officer.designation}`);
      console.log(`  Area: ${officer.area}`);
      console.log(`  Contracts: ${officer.contracts}`);
      console.log(`  Jurisdiction: ${officer.jurisdiction}`);
      console.log(`  Is Active: ${officer.isActive}`);
      console.log(`  Assigned At: ${new Date(Number(officer.assignedAt) * 1000).toLocaleString()}`);
    } catch (error) {
      console.log("Error fetching officer details:", error.message);
    }

    // Check officer role
    const OFFICER_ROLE = await contract.OFFICER_ROLE();
    const isOfficer = await contract.hasRole(OFFICER_ROLE, officerAddress);
    console.log(`\nIs Officer: ${isOfficer}`);

    // Get assigned projects
    console.log("\n=== Assigned Projects ===");
    const projectCount = await contract.getProjectCount();
    const assignedProjects = [];
    
    for (let i = 1; i <= Number(projectCount); i++) {
      try {
        const project = await contract.getProject(i);
        if (project.assignedOfficer === officerAddress) {
          assignedProjects.push({
            id: i,
            name: project.name,
            owner: project.owner,
            verificationStatus: Number(project.verificationStatus)
          });
        }
      } catch (error) {
        console.log(`Error fetching project ${i}:`, error.message);
      }
    }

    console.log(`Total assigned projects: ${assignedProjects.length}`);
    assignedProjects.forEach(project => {
      console.log(`  Project ${project.id}: ${project.name} (Owner: ${project.owner}, Status: ${project.verificationStatus})`);
    });

    // Get unique user addresses
    const userAddresses = [...new Set(assignedProjects.map(project => project.owner))];
    console.log(`\nUnique user addresses: ${userAddresses.length}`);
    userAddresses.forEach(address => {
      console.log(`  ${address}`);
    });

    console.log("\n=== Testing Instructions ===");
    console.log("To see assigned users in the frontend:");
    console.log("1. Connect your wallet to the frontend");
    console.log("2. Make sure you're connected as the officer account:");
    console.log(`   ${officerAddress}`);
    console.log("3. Navigate to the Credits page");
    console.log("4. You should see the assigned users in the 'Assigned Users' section");

  } catch (error) {
    console.error("❌ Failed to get officer info:", error);
    throw error;
  }
}

main().then(() => { 
  console.log("✅ Officer info retrieved successfully"); 
  process.exit(0); 
}).catch((error) => { 
  console.error("❌ Failed:", error); 
  process.exit(1); 
});
