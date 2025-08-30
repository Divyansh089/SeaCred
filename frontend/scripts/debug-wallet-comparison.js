import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Debugging wallet address comparison...");
  
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, signer);

    console.log("Using account:", signer.address);
    console.log("Contract address:", await contract.getAddress());

    // Known officer address
    const officerAddress = "0x86364Aa26E4E936fA1134e08c351e796E82Eb199";
    
    console.log("\n=== Wallet Address Comparison ===");
    console.log(`Officer address (contract): ${officerAddress}`);
    console.log(`Officer address (lowercase): ${officerAddress.toLowerCase()}`);
    console.log(`Officer address (checksum): ${ethers.getAddress(officerAddress)}`);
    
    // Check if they're equal
    console.log(`\n=== Equality Checks ===`);
    console.log(`contract === lowercase: ${officerAddress === officerAddress.toLowerCase()}`);
    console.log(`contract === checksum: ${officerAddress === ethers.getAddress(officerAddress)}`);
    console.log(`lowercase === checksum: ${officerAddress.toLowerCase() === ethers.getAddress(officerAddress)}`);

    // Get all projects and check their assigned officer addresses
    console.log("\n=== Project Assignment Addresses ===");
    const projectCount = await contract.getProjectCount();
    
    for (let i = 1; i <= Number(projectCount); i++) {
      try {
        const project = await contract.getProject(i);
        console.log(`Project ${i}:`);
        console.log(`  Name: ${project.name}`);
        console.log(`  Assigned Officer (contract): ${project.assignedOfficer}`);
        console.log(`  Assigned Officer (lowercase): ${project.assignedOfficer.toLowerCase()}`);
        console.log(`  Assigned Officer (checksum): ${ethers.getAddress(project.assignedOfficer)}`);
        console.log(`  Matches officer? ${project.assignedOfficer === officerAddress}`);
        console.log(`  Matches officer (case-insensitive)? ${project.assignedOfficer.toLowerCase() === officerAddress.toLowerCase()}`);
        console.log(`  Matches officer (checksum)? ${ethers.getAddress(project.assignedOfficer) === ethers.getAddress(officerAddress)}`);
      } catch (error) {
        console.log(`Error fetching project ${i}:`, error.message);
      }
    }

  } catch (error) {
    console.error("❌ Debug failed:", error);
    throw error;
  }
}

main().then(() => { 
  console.log("✅ Wallet comparison debug completed successfully"); 
  process.exit(0); 
}).catch((error) => { 
  console.error("❌ Debug failed:", error); 
  process.exit(1); 
});
