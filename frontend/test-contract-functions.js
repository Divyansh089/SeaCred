const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Testing contract functions...");

  // Get the provider
  const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth_holesky");
  
  // Contract address
  const contractAddress = "0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01";
  
  // Get the contract factory to access the ABI
  const BlueCarbonAdminTokenRestricted = await ethers.getContractFactory("BlueCarbonAdminTokenRestricted");
  const contract = BlueCarbonAdminTokenRestricted.attach(contractAddress).connect(provider);

  console.log("📋 Contract Address:", contractAddress);
  console.log("🔗 Network: Holesky Testnet");

  try {
    // Test basic functions
    console.log("\n🧪 Testing basic functions...");
    
    const name = await contract.name();
    console.log("✅ Contract name:", name);
    
    const symbol = await contract.symbol();
    console.log("✅ Contract symbol:", symbol);
    
    const decimals = await contract.decimals();
    console.log("✅ Contract decimals:", decimals);

    // Test if getOfficerAssignedProjects exists
    console.log("\n🧪 Testing getOfficerAssignedProjects function...");
    try {
      const testAddress = "0xEa8315C53CC5C324e3F516d51bF91153aD94E40A";
      const projects = await contract.getOfficerAssignedProjects(testAddress);
      console.log("✅ getOfficerAssignedProjects function exists!");
      console.log("📊 Projects for admin:", projects);
    } catch (error) {
      console.log("❌ getOfficerAssignedProjects function NOT found!");
      console.log("🔍 Error:", error.message);
    }

    // Test if officerAssignedProjects mapping exists
    console.log("\n🧪 Testing officerAssignedProjects mapping...");
    try {
      const testAddress = "0xEa8315C53CC5C324e3F516d51bF91153aD94E40A";
      const projects = await contract.officerAssignedProjects(testAddress);
      console.log("✅ officerAssignedProjects mapping exists!");
      console.log("📊 Projects for admin:", projects);
    } catch (error) {
      console.log("❌ officerAssignedProjects mapping NOT found!");
      console.log("🔍 Error:", error.message);
    }

    // List some available functions
    console.log("\n📋 Available functions (first 10):");
    const abi = BlueCarbonAdminTokenRestricted.interface.fragments;
    abi.slice(0, 10).forEach((fragment, index) => {
      if (fragment.type === 'function') {
        console.log(`${index + 1}. ${fragment.name}`);
      }
    });

  } catch (error) {
    console.error("❌ Error testing contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
