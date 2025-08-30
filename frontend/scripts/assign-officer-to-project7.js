import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Assigning officer to project 7...");
  
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

    const projectId = 7; // The newly created project
    const officerAddress = "0x86364Aa26E4E936fA1134e08c351e796E82Eb199"; // Known officer

    // Check if officer exists
    const OFFICER_ROLE = await contract.OFFICER_ROLE();
    const isOfficer = await contract.hasRole(OFFICER_ROLE, officerAddress);
    console.log(`Is ${officerAddress} an officer: ${isOfficer}`);

    if (!isOfficer) {
      console.log("❌ Target address is not an officer.");
      return;
    }

    // Get project details before assignment
    console.log("\n=== Project Details Before Assignment ===");
    const projectBefore = await contract.getProject(projectId);
    console.log(`Project ${projectId}: ${projectBefore.name}`);
    console.log(`Current assigned officer: ${projectBefore.assignedOfficer}`);
    console.log(`Status: ${projectBefore.verificationStatus}`);

  // Assign officer to project
  console.log(`\n=== Assigning Officer to Project ===`);
  console.log(`Project ID: ${projectId}`);
  console.log(`Officer: ${officerAddress}`);

    const tx = await contract.assignOfficerToProject(projectId, officerAddress);
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Officer assigned successfully!");
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    // Get project details after assignment
    console.log("\n=== Project Details After Assignment ===");
    const projectAfter = await contract.getProject(projectId);
    console.log(`Project ${projectId}: ${projectAfter.name}`);
    console.log(`New assigned officer: ${projectAfter.assignedOfficer}`);
    console.log(`Status: ${projectAfter.verificationStatus}`);

    console.log("\n✅ Officer assignment completed successfully!");
    console.log("The project is now ready for verification by the assigned officer.");

  } catch (error) {
    console.error("❌ Officer assignment failed:", error);
    throw error;
  }
}

main().then(() => { 
  console.log("✅ Officer assignment completed successfully"); 
  process.exit(0); 
}).catch((error) => { 
  console.error("❌ Officer assignment failed:", error); 
  process.exit(1); 
});
