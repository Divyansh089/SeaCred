import hre from "hardhat";

async function main() {
  try {
    console.log("Starting deployment...");
    
    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    
    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");
    
    // Contract parameters
    const name = "Blue Carbon Credit Token";
    const symbol = "BCC";
    const decimals = 18;
    const admin = deployer.address;
    
    console.log("Deploying contract with parameters:");
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Decimals:", decimals);
    console.log("- Admin:", admin);
    
    // Deploy the contract
    const BlueCarbonAdminTokenRestricted = await hre.ethers.getContractFactory("BlueCarbonAdminTokenRestricted");
    console.log("Contract factory created");
    
    const contract = await BlueCarbonAdminTokenRestricted.deploy(name, symbol, decimals, admin);
    console.log("Deployment transaction sent");
    
    await contract.waitForDeployment();
    console.log("Deployment confirmed");
    
    const contractAddress = await contract.getAddress();
    console.log("Contract deployed to:", contractAddress);
    
    // Save to env.local
    const envContent = `# Contract deployment info
CONTRACT_ADDRESS=${contractAddress}
ADMIN_ADDRESS=${admin}
CONTRACT_NAME=${name}
CONTRACT_SYMBOL=${symbol}
CONTRACT_DECIMALS=${decimals}
DEPLOYMENT_NETWORK=holesky
DEPLOYMENT_TIMESTAMP=${Math.floor(Date.now() / 1000)}
`;
    
    const fs = await import('fs');
    fs.writeFileSync('.env.local', envContent);
    console.log("Deployment info saved to .env.local");
    
    console.log("Deployment completed successfully!");
    
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
