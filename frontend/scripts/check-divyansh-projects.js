import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Checking projects assigned to Divyansh...");
  
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, signer);

    console.log("Using account:", signer.address);
    console.log("Contract address:", await contract.getAddress());

    const divyanshAddress = "0x48b76ee4ba5bdbd61ed43a78df5c023f5fe86c68";
    
    // Check if Divyansh is an officer
    const OFFICER_ROLE = await contract.OFFICER_ROLE();
    const isOfficer = await contract.hasRole(OFFICER_ROLE, divyanshAddress);
    console.log(`Is ${divyanshAddress} (Divyansh) an officer: ${isOfficer}`);

    if (!isOfficer) {
      console.log("❌ Divyansh is not an officer.");
      return;
    }

    // Get all projects and filter for those assigned to Divyansh
    const projectCount = await contract.getProjectCount();
    console.log(`\n=== Projects Assigned to Divyansh ===`);
    
    let assignedProjects = [];
    for (let i = 1; i <= Number(projectCount); i++) {
      try {
        const project = await contract.getProject(i);
        if (project.assignedOfficer.toLowerCase() === divyanshAddress.toLowerCase()) {
          assignedProjects.push({
            id: i,
            name: project.name,
            owner: project.owner,
            status: project.verificationStatus,
            city: project.city,
            state: project.state
          });
        }
      } catch (error) {
        console.log(`Error fetching project ${i}:`, error.message);
      }
    }

    if (assignedProjects.length === 0) {
      console.log("❌ No projects assigned to Divyansh");
    } else {
      console.log(`✅ Found ${assignedProjects.length} project(s) assigned to Divyansh:`);
      assignedProjects.forEach(project => {
        console.log(`  Project ${project.id}: ${project.name}`);
        console.log(`    Owner: ${project.owner}`);
        console.log(`    Status: ${project.status}`);
        console.log(`    Location: ${project.city}, ${project.state}`);
        console.log("---");
      });
    }

    console.log("\n✅ Divyansh should now see these projects in their dashboard!");

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
