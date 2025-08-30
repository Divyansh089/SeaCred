import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Debugging user registration status...");
  
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, signer);

    console.log("Using account:", signer.address);
    console.log("Contract address:", await contract.getAddress());

    // Check if current signer is registered
    console.log("\n=== Current Signer Registration Status ===");
    const isRegistered = await contract.isUserRegistered(signer.address);
    console.log(`Is current signer registered: ${isRegistered}`);

    if (isRegistered) {
      const userDetails = await contract.getUser(signer.address);
      console.log("User details:", {
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        district: userDetails.district,
        isRegistered: userDetails.isRegistered
      });
    }

    // Check some known addresses
    const knownAddresses = [
      "0xEea15A121395d0De595BeDf4613603c16C1C1929", // From error message
      "0x90A942D10A27D9B70Da40EB13F19F0FD1503221D",
      "0xEa8315C53CC5C324e3F516d51bF91153aD94E40A",
      "0x86364Aa26E4E936fA1134e08c351e796E82Eb199"
    ];

    console.log("\n=== Known Addresses Registration Status ===");
    for (const address of knownAddresses) {
      try {
        const isReg = await contract.isUserRegistered(address);
        console.log(`${address}: ${isReg ? "REGISTERED" : "NOT REGISTERED"}`);
        
        if (isReg) {
          const user = await contract.getUser(address);
          console.log(`  Name: ${user.firstName} ${user.lastName}`);
          console.log(`  District: ${user.district}`);
        }
      } catch (error) {
        console.log(`${address}: Error checking - ${error.message}`);
      }
    }

    // Check project count
    console.log("\n=== Project Count ===");
    const projectCount = await contract.getProjectCount();
    console.log(`Total projects: ${projectCount}`);

    // Check if user has any projects
    if (isRegistered) {
      console.log("\n=== User's Projects ===");
      const userProjects = await contract.getUserProjects(signer.address);
      console.log(`User has ${userProjects.length} projects`);
      
      for (let i = 0; i < userProjects.length; i++) {
        const projectId = userProjects[i];
        const project = await contract.getProject(projectId);
        console.log(`Project ${projectId}: ${project.name}`);
      }
    }

  } catch (error) {
    console.error("❌ Debug failed:", error);
    throw error;
  }
}

main().then(() => { 
  console.log("✅ User registration debug completed successfully"); 
  process.exit(0); 
}).catch((error) => { 
  console.error("❌ Debug failed:", error); 
  process.exit(1); 
});
