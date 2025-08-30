import hre from "hardhat";

async function main() {
  console.log("Deploying BlueCarbonAdminTokenRestricted with verification features...");

  // Get the contract factory
  const BlueCarbonAdminTokenRestricted = await hre.ethers.getContractFactory("BlueCarbonAdminTokenRestricted");

  // Deploy the contract
  const contract = await BlueCarbonAdminTokenRestricted.deploy(
    "Blue Carbon Credit", // name
    "BCC",               // symbol
    18,                  // decimals
    "0x90A942D1C5d2367506144F0d07858C3E6c4990A1" // admin address (replace with your admin address)
  );

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("BlueCarbonAdminTokenRestricted deployed to:", address);

  // Verify the deployment
  console.log("Verifying deployment...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [
        "Blue Carbon Credit",
        "BCC",
        18,
        "0x90A942D1C5d2367506144F0d07858C3E6c4990A1"
      ],
    });
    console.log("Contract verified on Etherscan");
  } catch (error) {
    console.log("Verification failed:", error.message);
  }

  console.log("Deployment completed!");
  console.log("Contract Address:", address);
  console.log("Network:", hre.network.name);
  console.log("Block Explorer:", `https://holesky.etherscan.io/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
