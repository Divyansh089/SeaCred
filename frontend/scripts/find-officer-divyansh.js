import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Finding officer Divyansh and assigning project...");
  
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, signer);

    console.log("Using account:", signer.address);
    console.log("Contract address:", await contract.getAddress());

    // Check if current signer is admin
    const ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const isAdmin = await contract.hasRole(ADMIN_ROLE, signer.address);
    console.log(`Is current signer admin: ${isAdmin}`);

    if (!isAdmin) {
      console.log("❌ Current signer is not admin. Cannot assign officers.");
      return;
    }

    // From the image, Divyansh's wallet address appears to be 0x48b7...6c68
    // Let me check if this address is an officer
    const divyanshAddress = "0x48b76ee4ba5bdbd61ed43a78df5c023f5fe86c68";
    
    const OFFICER_ROLE = await contract.OFFICER_ROLE();
    const isOfficer = await contract.hasRole(OFFICER_ROLE, divyanshAddress);
    console.log(`Is ${divyanshAddress} an officer: ${isOfficer}`);

    if (!isOfficer) {
      console.log("❌ Address is not an officer. Let me check if they exist as an officer in the contract...");
      
      // Try to get officer details
      try {
        const officer = await contract.getOfficer(divyanshAddress);
        console.log("Officer details:", officer);
      } catch (error) {
        console.log("Officer not found in contract. Let me check all officers...");
        
        // Get all officer addresses
        const officerAddresses = await contract.getAllOfficers();
        console.log("All officer addresses:", officerAddresses);
        
        // Check each officer
        for (const addr of officerAddresses) {
          try {
            const officer = await contract.getOfficer(addr);
            console.log(`Officer ${addr}: ${officer.name} - ${officer.area}`);
          } catch (error) {
            console.log(`Error getting officer ${addr}:`, error.message);
          }
        }
      }
      return;
    }

    // Assign project 6 (test2) to Divyansh
    const projectId = 6; // test2 project
    
    console.log(`\n=== Assigning Project to Officer ===");
    console.log(`Project ID: ${projectId} (test2)`);
    console.log(`Officer: ${divyanshAddress} (Divyansh)`);

    // Get project details before assignment
    const projectBefore = await contract.getProject(projectId);
    console.log(`Project ${projectId}: ${projectBefore.name}`);
    console.log(`Current assigned officer: ${projectBefore.assignedOfficer}`);

    // Assign officer to project
    const tx = await contract.assignOfficerToProject(projectId, divyanshAddress);
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Officer assigned successfully!");
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    // Get project details after assignment
    const projectAfter = await contract.getProject(projectId);
    console.log(`\nProject ${projectId} after assignment:`);
    console.log(`Name: ${projectAfter.name}`);
    console.log(`Assigned Officer: ${projectAfter.assignedOfficer}`);
    console.log(`Status: ${projectAfter.verificationStatus}`);

    console.log("\n✅ Project assignment completed successfully!");
    console.log("Divyansh should now see the test2 project in their dashboard.");

  } catch (error) {
    console.error("❌ Assignment failed:", error);
    throw error;
  }
}

main().then(() => { 
  console.log("✅ Officer assignment completed successfully"); 
  process.exit(0); 
}).catch((error) => { 
  console.error("❌ Assignment failed:", error); 
  process.exit(1); 
});
