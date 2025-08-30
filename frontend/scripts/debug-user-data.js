import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Debugging user data structure...");
  
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, signer);

    console.log("Using account:", signer.address);
    console.log("Contract address:", await contract.getAddress());

    // Check all three user addresses assigned to the officer
    const userAddresses = [
      "0x90A942D10A27D9B70Da40EB13F19F0FD1503221D",
      "0xEa8315C53CC5C324e3F516d51bF91153aD94E40A",
      "0xEea15A121395d0De595BeDf4613603c16C1C1929"
    ];

    for (const address of userAddresses) {
      console.log(`\n=== User Data for ${address} ===`);
      try {
        const user = await contract.getUser(address);
        console.log("Raw user data from contract:");
        console.log(`  firstName: "${user.firstName}"`);
        console.log(`  lastName: "${user.lastName}"`);
        console.log(`  phone: "${user.phone}"`);
        console.log(`  email: "${user.email}"`);
        console.log(`  district: "${user.district}"`);
        console.log(`  walletAddress: "${user.walletAddress}"`);
        console.log(`  isRegistered: ${user.isRegistered}`);
        console.log(`  registeredAt: ${user.registeredAt}`);
        
        // Check if firstName and lastName are empty strings
        const hasName = user.firstName && user.firstName.trim() !== "" && user.lastName && user.lastName.trim() !== "";
        console.log(`  Has proper name: ${hasName}`);
        
        // Check role
        const adminRole = await contract.ADMIN_ROLE();
        const officerRole = await contract.OFFICER_ROLE();
        const hasAdminRole = await contract.hasRole(adminRole, address);
        const hasOfficerRole = await contract.hasRole(officerRole, address);
        
        let role = "user";
        if (hasAdminRole) {
          role = "admin";
        } else if (hasOfficerRole) {
          role = "officer";
        }
        
        console.log(`  Role: ${role}`);
        
      } catch (error) {
        console.log(`Error fetching user ${address}:`, error.message);
      }
    }

  } catch (error) {
    console.error("❌ Debug failed:", error);
    throw error;
  }
}

main().then(() => { 
  console.log("✅ User data debug completed successfully"); 
  process.exit(0); 
}).catch((error) => { 
  console.error("❌ Debug failed:", error); 
  process.exit(1); 
});
