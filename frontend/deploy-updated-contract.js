const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env.local" });

async function main() {
  console.log("🚀 Deploying updated BlueCarbonAdminTokenRestricted contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Deploy the contract
  const BlueCarbonAdminTokenRestricted = await ethers.getContractFactory("BlueCarbonAdminTokenRestricted");
  
  const contract = await BlueCarbonAdminTokenRestricted.deploy(
    "Blue Carbon Credit Token", // name
    "BCC", // symbol
    18, // decimals
    "0xEa8315C53CC5C324e3F516d51bF91153aD94E40A" // admin address
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ Contract deployed successfully!");
  console.log("📋 Contract Address:", contractAddress);
  console.log("🔗 Network: Holesky Testnet");
  console.log("👤 Admin Address: 0xEa8315C53CC5C324e3F516d51bF91153aD94E40A");

  // Save deployment info
  const deploymentInfo = `CONTRACT_ADDRESS=${contractAddress}
DEPLOYMENT_NETWORK=holesky
ADMIN_ADDRESS=0xEa8315C53CC5C324e3F516d51bF91153aD94E40A
DEPLOYMENT_DATE=${new Date().toISOString()}
CONTRACT_NAME=BlueCarbonAdminTokenRestricted
CONTRACT_VERSION=2.0
FEATURES=officerAssignedProjects_mapping,getOfficerAssignedProjects_function
`;

  require('fs').writeFileSync('deployment-info.env', deploymentInfo);
  console.log("💾 Deployment info saved to deployment-info.env");

  // Update .env.local
  const envContent = `CONTRACT_ADDRESS=${contractAddress}
# Pinata API Key for IPFS functionality
NEXT_PUBLIC_PINATA_API_KEY=1da02af28f4b88bc5c08
NEXT_PUBLIC_PINATA_SECRET_KEY=05a78b4f74daae170cce4cd322b1c17c6a3f18d1bb560aa07eebced10e152ecf
ADMIN_ADDRESS=0xEa8315C53CC5C324e3F516d51bF91153aD94E40A
DEPLOYMENT_NETWORK=holesky
`;

  require('fs').writeFileSync('.env.local', envContent);
  console.log("💾 .env.local updated with new contract address");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📝 Next steps:");
  console.log("1. Update your frontend to use the new contract address");
  console.log("2. Test the getOfficerAssignedProjects function");
  console.log("3. Assign projects to officers and verify they appear correctly");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
