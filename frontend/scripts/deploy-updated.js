import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Deploying updated BlueCarbonAdminTokenRestricted contract...");

  // Get the deployer account from private key
  const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://ethereum-holesky.publicnode.com");
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("Deploying contracts with the account:", signer.address);
  console.log("Account balance:", ethers.formatEther(await provider.getBalance(signer.address)), "ETH");

  // Contract parameters
  const name = "Blue Carbon Credit Token";
  const symbol = "BCC";
  const decimals = 18;
  const admin = signer.address; // The deployer will be the admin

  // Deploy the contract
  const BlueCarbonAdminTokenRestricted = await hre.ethers.getContractFactory("BlueCarbonAdminTokenRestricted");
  const contract = await BlueCarbonAdminTokenRestricted.connect(signer).deploy(name, symbol, decimals, admin);

  console.log("Contract deployment transaction sent:", contract.deploymentTransaction().hash);
  console.log("Waiting for deployment confirmation...");
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ Contract deployed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("Contract name:", name);
  console.log("Contract symbol:", symbol);
  console.log("Contract decimals:", decimals);
  console.log("Admin address:", admin);
  console.log("Network:", hre.network.name);

  // Verify the deployment
  console.log("\nVerifying contract deployment...");
  console.log("Contract paused:", await contract.paused());
  console.log("Admin role granted to deployer:", await contract.hasRole(await contract.ADMIN_ROLE(), signer.address));

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: hre.network.name,
    deployer: signer.address,
    deploymentTime: new Date().toISOString(),
    contractName: name,
    contractSymbol: symbol,
    contractDecimals: decimals,
    adminAddress: admin,
    features: [
      "removeProject function added",
      "Project removal capability for admins",
      "Only allows removal of projects not created by the admin"
    ]
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Save to file
  const fs = await import('fs');
  fs.writeFileSync(
    'deployment-updated.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n✅ Deployment info saved to deployment-updated.json");
  
  console.log("\n🔧 Next steps:");
  console.log("1. Update the contract address in your frontend code");
  console.log("2. Run the remove-test-projects.js script to remove test projects");
  console.log("3. Test the removeProject functionality");
  
  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
