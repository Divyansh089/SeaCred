import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying updated contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const BlueCarbonAdminTokenRestricted = await ethers.getContractFactory("BlueCarbonAdminTokenRestricted");
  
  const contract = await BlueCarbonAdminTokenRestricted.deploy(
    "Blue Carbon Credit Token",
    "BCC",
    18,
    "0xEa8315C53CC5C324e3F516d51bF91153aD94E40A"
  );

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("Contract deployed to:", address);
  
  // Test the new function
  try {
    const projects = await contract.getOfficerAssignedProjects("0xEa8315C53CC5C324e3F516d51bF91153aD94E40A");
    console.log("✅ getOfficerAssignedProjects function works!");
    console.log("Projects:", projects);
  } catch (error) {
    console.log("❌ getOfficerAssignedProjects function failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
