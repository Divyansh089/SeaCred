import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("=== BlueCarbonAdminTokenRestricted Contract Deployment ===");
  
  // Check if .env file exists
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.log("\n❌ No .env file found!");
    console.log("Please create a .env file with the following content:");
    console.log("PRIVATE_KEY=your_private_key_here");
    console.log("HOLESKY_RPC_URL=https://ethereum-holesky.publicnode.com");
    console.log("ETHERSCAN_API_KEY=your_etherscan_api_key_here");
    console.log("\nMake sure to replace 'your_private_key_here' with your actual private key (without 0x prefix)");
    console.log("You can get your private key from MetaMask or your wallet provider");
    return;
  }

  // Load environment variables
  const dotenv = await import('dotenv');
  dotenv.config();

  if (!process.env.PRIVATE_KEY) {
    console.log("\n❌ No PRIVATE_KEY found in .env file!");
    console.log("Please add your private key to the .env file:");
    console.log("PRIVATE_KEY=your_private_key_here");
    return;
  }

  console.log("✅ Environment configured successfully");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n📋 Deployment Details:");
  console.log("Deployer address:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "wei");

  // Check if account has enough balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  if (balance < hre.ethers.parseEther("0.01")) {
    console.log("\n⚠️  Warning: Low balance detected!");
    console.log("You need at least 0.01 ETH for deployment on Holesky testnet");
    console.log("Get testnet ETH from: https://holesky-faucet.pk910.de/");
    return;
  }

  // Contract parameters
  const name = "Blue Carbon Credit Token";
  const symbol = "BCC";
  const decimals = 18;
  const admin = deployer.address; // The deployer will be the admin

  console.log("\n🚀 Deploying contract...");
  console.log("Contract name:", name);
  console.log("Contract symbol:", symbol);
  console.log("Contract decimals:", decimals);
  console.log("Admin address:", admin);

  try {
    // Deploy the contract
    const BlueCarbonAdminTokenRestricted = await hre.ethers.getContractFactory("BlueCarbonAdminTokenRestricted");
    const contract = await BlueCarbonAdminTokenRestricted.deploy(name, symbol, decimals, admin);

    console.log("⏳ Waiting for deployment confirmation...");
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log("\n✅ Contract deployed successfully!");
    console.log("Contract address:", contractAddress);
    console.log("Network:", (await hre.ethers.provider.getNetwork()).name);

    // Verify the deployment
    console.log("\n🔍 Verifying deployment...");
    console.log("Contract paused:", await contract.paused());
    console.log("Admin role granted to deployer:", await contract.hasRole(await contract.ADMIN_ROLE(), deployer.address));

    // Save deployment info
    const envContent = `# Contract deployment info
CONTRACT_ADDRESS=${contractAddress}
ADMIN_ADDRESS=${admin}
CONTRACT_NAME=${name}
CONTRACT_SYMBOL=${symbol}
CONTRACT_DECIMALS=${decimals}
DEPLOYMENT_NETWORK=${(await hre.ethers.provider.getNetwork()).name}
DEPLOYMENT_TIMESTAMP=${Math.floor(Date.now() / 1000)}
`;

    fs.writeFileSync('deployment-info.env', envContent);
    console.log("\n📄 Deployment info saved to deployment-info.env");

    console.log("\n🎉 Deployment completed successfully!");
    console.log("You can now use this contract address in your frontend application");

  } catch (error) {
    console.log("\n❌ Deployment failed!");
    console.log("Error:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Solution: Get more testnet ETH from the faucet");
      console.log("Holesky faucet: https://holesky-faucet.pk910.de/");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
