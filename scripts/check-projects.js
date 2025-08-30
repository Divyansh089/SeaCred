import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Checking all projects and officer assignments...");
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, signer);

    // Get total project count
    const projectCount = await contract.getProjectCount();
    console.log(`Total projects: ${projectCount}`);

    // Check each project
    for (let i = 1; i <= projectCount; i++) {
      try {
        const project = await contract.getProject(i);
        console.log(`\nProject ID: ${i}`);
        console.log(`Name: ${project.name}`);
        console.log(`City: ${project.city}`);
        console.log(`State: ${project.state}`);
        console.log(`Assigned Officer: ${project.assignedOfficer}`);
        console.log(`Verification Status: ${project.verificationStatus}`);
        console.log(`Owner: ${project.owner}`);
      } catch (error) {
        console.log(`Error fetching project ${i}:`, error.message);
      }
    }

    // Check registered officers
    console.log("\n=== Registered Officers ===");
    const testOfficerAddress = "0x86364Aa26E4E936fA1134e08c351e796E82Eb199";
    try {
      const officer = await contract.getUser(testOfficerAddress);
      console.log(`Officer ${testOfficerAddress}:`);
      console.log(`Name: ${officer.name}`);
      console.log(`District: ${officer.district}`);
      console.log(`Is Officer: ${await contract.hasRole(await contract.OFFICER_ROLE(), testOfficerAddress)}`);
    } catch (error) {
      console.log(`Error fetching officer:`, error.message);
    }

  } catch (error) {
    console.error("❌ Check failed:", error);
    throw error;
  }
}

main().then(() => { 
  console.log("✅ Check completed successfully"); 
  process.exit(0); 
}).catch((error) => { 
  console.error("❌ Check failed:", error); 
  process.exit(1); 
});
