import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Removing test projects not created by current user...");
  
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

    // Projects to remove (identified from previous analysis)
    const projectsToRemove = [1, 3, 5, 6];

    console.log(`\n🗑️  Removing ${projectsToRemove.length} test projects...`);

    for (const projectId of projectsToRemove) {
      try {
        console.log(`\nRemoving project ${projectId}...`);
        
        // Get project details before removal
        const project = await contract.getProject(projectId);
        console.log(`  Project name: ${project.name}`);
        console.log(`  Project owner: ${project.owner}`);
        console.log(`  Is active: ${project.isActive}`);
        
        if (!project.isActive) {
          console.log(`  ⚠️  Project ${projectId} is already inactive, skipping...`);
          continue;
        }

        // Remove the project
        const tx = await contract.removeProject(projectId);
        console.log(`  Transaction sent: ${tx.hash}`);
        
        console.log("  Waiting for transaction confirmation...");
        const receipt = await tx.wait();
        console.log(`  ✅ Project ${projectId} removed successfully!`);
        console.log(`  Transaction confirmed in block: ${receipt.blockNumber}`);
        
      } catch (error) {
        console.error(`  ❌ Failed to remove project ${projectId}:`, error.message);
        
        // Check if it's because we can't remove our own projects
        if (error.message.includes("CANNOT_REMOVE_OWN_PROJECTS")) {
          console.log(`  ⚠️  Project ${projectId} was created by current user, skipping...`);
        } else {
          console.log(`  ⚠️  Error details: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ Project removal process completed!`);
    console.log(`   Attempted to remove ${projectsToRemove.length} projects.`);

  } catch (error) {
    console.error("❌ Script failed:", error);
    throw error;
  }
}

main().then(() => { 
  console.log("✅ Test project removal completed");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
