import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Removing test projects and users not created by current user...");
  
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, signer);

    console.log("Using account:", signer.address);
    console.log("Contract address:", await contract.getAddress());

    // Check if current signer is admin
    const isAdmin = await contract.hasRole(await contract.ADMIN_ROLE(), signer.address);
    console.log(`Is current signer admin: ${isAdmin}`);

    if (!isAdmin) {
      console.log("❌ Current signer is not admin. Cannot remove projects.");
      return;
    }

    // Get current project count
    const currentProjectCount = await contract.getProjectCount();
    console.log(`Current project count: ${currentProjectCount}`);

    // Get all projects and filter out those not created by current user
    const projectsToRemove = [];
    const projectsToKeep = [];

    for (let i = 1; i <= Number(currentProjectCount); i++) {
      try {
        const project = await contract.getProject(i);
        console.log(`\nProject ${i}:`);
        console.log(`  Name: ${project.name}`);
        console.log(`  Owner: ${project.owner}`);
        console.log(`  Current user: ${signer.address}`);
        
        // Check if project was created by current user
        if (project.owner.toLowerCase() === signer.address.toLowerCase()) {
          console.log(`  ✅ Keeping project ${i} (created by current user)`);
          projectsToKeep.push(i);
        } else {
          console.log(`  ❌ Marking project ${i} for removal (not created by current user)`);
          projectsToRemove.push(i);
        }
      } catch (error) {
        console.error(`Error fetching project ${i}:`, error);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  Projects to keep: ${projectsToKeep.length}`);
    console.log(`  Projects to remove: ${projectsToRemove.length}`);

    if (projectsToRemove.length === 0) {
      console.log("✅ No test projects to remove. All projects were created by the current user.");
      return;
    }

    console.log(`\n🗑️  Projects to be removed:`);
    projectsToRemove.forEach(id => {
      console.log(`  - Project ID: ${id}`);
    });

    // Note: Since the smart contract doesn't have a function to remove projects,
    // we can only mark them as inactive or provide a list for manual review
    console.log(`\n⚠️  Note: The smart contract doesn't have a function to remove projects.`);
    console.log(`   You can manually review the projects marked for removal above.`);
    console.log(`   To actually remove them, you would need to:`);
    console.log(`   1. Add a removeProject function to the smart contract`);
    console.log(`   2. Deploy the updated contract`);
    console.log(`   3. Call the removeProject function for each project ID`);

    // For now, we'll just provide the list of projects that should be removed
    console.log(`\n📋 Projects that should be removed (for manual review):`);
    for (const projectId of projectsToRemove) {
      try {
        const project = await contract.getProject(projectId);
        console.log(`  Project ID ${projectId}: ${project.name} (Owner: ${project.owner})`);
      } catch (error) {
        console.error(`Error fetching project ${projectId} for summary:`, error);
      }
    }

    console.log(`\n✅ Analysis completed successfully!`);
    console.log(`   Found ${projectsToRemove.length} projects that were not created by the current user.`);

  } catch (error) {
    console.error("❌ Script failed:", error);
    throw error;
  }
}

main().then(() => { 
  console.log("✅ Test data removal analysis completed");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
