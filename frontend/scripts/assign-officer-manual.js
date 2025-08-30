import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Manually assigning officer to project 3...");
  
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, signer);

    const testOfficerAddress = "0x86364Aa26E4E936fA1134e08c351e796E82Eb199";
    const projectId = 3;

    console.log("Using account:", signer.address);
    console.log("Contract address:", await contract.getAddress());
    console.log(`Assigning officer ${testOfficerAddress} to project ${projectId}...`);
    
    const tx = await contract.assignOfficerToProject(projectId, testOfficerAddress);
    console.log("Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
    // Verify the assignment
    const project = await contract.getProject(projectId);
    console.log(`Project ${projectId} assigned officer: ${project.assignedOfficer}`);
    console.log("✅ Officer assigned successfully!");

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
