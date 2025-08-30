import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Registering admin user...");
  
  try {
    // Get the contract artifact
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    console.log("Contract artifact obtained successfully");

    // Get the provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("Using account:", signer.address);

    // Create contract instance
    const contract = new ethers.Contract(
      "0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", // New contract address
      contractArtifact.abi,
      signer
    );

    // Check if admin is already registered
    console.log("\n1. Checking if admin is registered...");
    try {
      const isRegistered = await contract.isUserRegistered(signer.address);
      console.log(`Admin registered: ${isRegistered}`);
      
      if (!isRegistered) {
        console.log("2. Registering admin user...");
        const registerTx = await contract.registerUser(
          "Admin User",
          "admin@example.com",
          "+1234567890",
          "Admin District",
          signer.address
        );
        await registerTx.wait();
        console.log("✅ Admin user registered successfully");
      } else {
        console.log("ℹ️ Admin user already registered");
      }
    } catch (error) {
      console.error("❌ Error checking/registering admin:", error.message);
    }

    console.log("\n✅ Admin setup completed!");
    
  } catch (error) {
    console.error("❌ Setup failed:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
