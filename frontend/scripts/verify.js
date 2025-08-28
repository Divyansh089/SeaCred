import hre from "hardhat";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const constructorArguments = [
    "Blue Carbon Credit Token", // name
    "BCC",                      // symbol
    18,                         // decimals
    process.env.ADMIN_ADDRESS   // admin address
  ];

  if (!contractAddress) {
    console.error("Please set CONTRACT_ADDRESS environment variable");
    process.exit(1);
  }

  if (!process.env.ADMIN_ADDRESS) {
    console.error("Please set ADMIN_ADDRESS environment variable");
    process.exit(1);
  }

  console.log("Verifying contract on Etherscan...");
  console.log("Contract address:", contractAddress);
  console.log("Constructor arguments:", constructorArguments);

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArguments,
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("Contract is already verified!");
    } else {
      console.error("Verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
