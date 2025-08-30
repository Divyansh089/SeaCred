import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  try {
    console.log("Starting deployment...");
    
    // Connect to the network
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://ethereum-holesky.publicnode.com");
    
    // Create wallet from private key (ensure it has 0x prefix)
    const privateKey = process.env.PRIVATE_KEY.startsWith('0x') ? process.env.PRIVATE_KEY : `0x${process.env.PRIVATE_KEY}`;
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log("Deployer address:", wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
    
    // Contract parameters
    const name = "Blue Carbon Credit Token";
    const symbol = "BCC";
    const decimals = 18;
    const admin = wallet.address;
    
    console.log("Deploying contract with parameters:");
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Decimals:", decimals);
    console.log("- Admin:", admin);
    
    // Read the contract artifact
    const contractArtifact = JSON.parse(fs.readFileSync('./artifacts/contract/credit.sol/BlueCarbonAdminTokenRestricted.json', 'utf8'));
    
    // Create contract factory
    const factory = new ethers.ContractFactory(
      contractArtifact.abi,
      contractArtifact.bytecode,
      wallet
    );
    
    console.log("Contract factory created");
    
    // Deploy the contract
    const contract = await factory.deploy(name, symbol, decimals, admin);
    console.log("Deployment transaction sent:", contract.deploymentTransaction().hash);
    
    await contract.waitForDeployment();
    console.log("Deployment confirmed");
    
    const contractAddress = await contract.getAddress();
    console.log("Contract deployed to:", contractAddress);
    
    // Read existing .env.local content
    let existingEnvContent = "";
    try {
      existingEnvContent = fs.readFileSync('.env.local', 'utf8');
    } catch (error) {
      console.log("No existing .env.local file found, creating new one");
    }
    
    // Add deployment info to existing content
    const deploymentInfo = `# Contract deployment info
CONTRACT_ADDRESS=${contractAddress}
ADMIN_ADDRESS=${admin}
CONTRACT_NAME=${name}
CONTRACT_SYMBOL=${symbol}
CONTRACT_DECIMALS=${decimals}
DEPLOYMENT_NETWORK=holesky
DEPLOYMENT_TIMESTAMP=${Math.floor(Date.now() / 1000)}
DEPLOYMENT_TX_HASH=${contract.deploymentTransaction().hash}
`;
    
    // Combine existing content with deployment info
    const newEnvContent = existingEnvContent + "\n" + deploymentInfo;
    
    fs.writeFileSync('.env.local', newEnvContent);
    console.log("Deployment info added to .env.local");
    
    console.log("\n=== DEPLOYMENT COMPLETED SUCCESSFULLY ===");
    console.log("Contract Address:", contractAddress);
    console.log("Network: holesky");
    console.log("Transaction Hash:", contract.deploymentTransaction().hash);
    console.log("Admin Address:", admin);
    
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
