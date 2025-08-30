import hre from "hardhat";

async function main() {
  console.log("Testing contract functions...");

  // Get the contract instance
  const contractAddress = "0x9FE0F745f80eE2e28889d089bFCBD83B47d98751";
  const BlueCarbonAdminTokenRestricted = await hre.ethers.getContractFactory("BlueCarbonAdminTokenRestricted");
  const contract = BlueCarbonAdminTokenRestricted.attach(contractAddress);

  // Test address
  const testAddress = "0x90A942D10A27D9B70Da40EB13F19F0FD1503221D";

  try {
    console.log("Testing isUserRegistered...");
    const isRegistered = await contract.isUserRegistered(testAddress);
    console.log("isUserRegistered result:", isRegistered);
  } catch (error) {
    console.error("isUserRegistered error:", error.message);
  }

  try {
    console.log("Testing getUser...");
    const user = await contract.getUser(testAddress);
    console.log("getUser result:", user);
  } catch (error) {
    console.error("getUser error:", error.message);
  }

  try {
    console.log("Testing getOfficer...");
    const officer = await contract.getOfficer(testAddress);
    console.log("getOfficer result:", officer);
  } catch (error) {
    console.error("getOfficer error:", error.message);
  }

  try {
    console.log("Testing contract name...");
    const name = await contract.name();
    console.log("Contract name:", name);
  } catch (error) {
    console.error("Contract name error:", error.message);
  }

  try {
    console.log("Testing totalSupply...");
    const totalSupply = await contract.totalSupply();
    console.log("Total supply:", totalSupply.toString());
  } catch (error) {
    console.error("Total supply error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
