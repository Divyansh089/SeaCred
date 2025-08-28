import hre from "hardhat";

async function main() {
  console.log("Deploying BlueCarbonAdminTokenRestricted contract...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Contract parameters
  const name = "Blue Carbon Credit Token";
  const symbol = "BCC";
  const decimals = 18;
  const admin = deployer.address; // The deployer will be the admin

  // Deploy the contract
  const BlueCarbonAdminTokenRestricted = await hre.ethers.getContractFactory("BlueCarbonAdminTokenRestricted");
  const contract = await BlueCarbonAdminTokenRestricted.deploy(name, symbol, decimals, admin);

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("BlueCarbonAdminTokenRestricted deployed to:", contractAddress);
  console.log("Contract name:", name);
  console.log("Contract symbol:", symbol);
  console.log("Contract decimals:", decimals);
  console.log("Admin address:", admin);

  // Verify the deployment
  console.log("\nVerifying deployment...");
  console.log("Contract paused:", await contract.paused());
  console.log("Admin role granted to deployer:", await contract.hasRole(await contract.ADMIN_ROLE(), deployer.address));

  console.log("\nDeployment completed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("Network:", (await hre.ethers.provider.getNetwork()).name);

  // Save deployment info to env.local
  const envContent = `# Contract deployment info
CONTRACT_ADDRESS=${contractAddress}
ADMIN_ADDRESS=${admin}
CONTRACT_NAME=${name}
CONTRACT_SYMBOL=${symbol}
CONTRACT_DECIMALS=${decimals}
DEPLOYMENT_NETWORK=${(await hre.ethers.provider.getNetwork()).name}
DEPLOYMENT_TIMESTAMP=${Math.floor(Date.now() / 1000)}
`;

  // Write to env.local file
  const fs = await import('fs');
  fs.writeFileSync('.env.local', envContent);
  console.log("\nDeployment info saved to .env.local");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
