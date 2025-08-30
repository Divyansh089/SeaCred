import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Checking roles for wallet address...");
  
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, provider);

    const testAddress = "0xEa8315C53CC5C324e3F516d51bF91153aD94E40A";
    
    console.log("Testing address:", testAddress);
    console.log("Contract address:", await contract.getAddress());

    // Get role hashes
    const ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const OFFICER_ROLE = await contract.OFFICER_ROLE();
    
    console.log("Role hashes:", { ADMIN_ROLE, OFFICER_ROLE });

    // Check roles
    const [isAdmin, isOfficer] = await Promise.all([
      contract.hasRole(ADMIN_ROLE, testAddress),
      contract.hasRole(OFFICER_ROLE, testAddress),
    ]);
    
    console.log("Role check results:", { isAdmin, isOfficer, address: testAddress });

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

main().then(() => { 
  console.log("✅ Role check completed successfully");
}).catch(console.error);
