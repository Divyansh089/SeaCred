import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Assigning officer to project 6 (test2)...");
  
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, signer);

      const testOfficerAddress = "0x48b76ee4ba5bdbd61ed43a78df5c023f5fe86c68";
  const projectId = 6;

    console.log("Using account:", signer.address);
    console.log("Contract address:", await contract.getAddress());
               console.log(`Assigning officer ${testOfficerAddress} (Divyansh) to project ${projectId} (test2)...`);
    
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
