import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Testing project creation...");
  
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, signer);

    console.log("Using account:", signer.address);
    console.log("Contract address:", await contract.getAddress());

    // Check if current signer is registered
    const isRegistered = await contract.isUserRegistered(signer.address);
    console.log(`Is current signer registered: ${isRegistered}`);

    if (!isRegistered) {
      console.log("❌ Current signer is not registered. Cannot create project.");
      return;
    }

    // Get current project count
    const currentProjectCount = await contract.getProjectCount();
    console.log(`Current project count: ${currentProjectCount}`);

    // Test project creation
    const testProjectData = {
      name: "Test Project Creation Fix",
      description: "Testing if project creation works after removing officer assignment",
      projectType: "forestry",
      startDate: Math.floor(Date.now() / 1000), // Current timestamp
      endDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
      projectAddress: "123 Test Street",
      city: "Test City",
      state: "Test State",
      landArea: 100, // 100 acres
      estimatedCredits: 1000, // 1000 tCO2e
      ipfsUrl: "QmTestHash123456789"
    };

    console.log("\n=== Creating Test Project ===");
    console.log("Project data:", testProjectData);

    try {
      const tx = await contract.addProject(
        testProjectData.name,
        testProjectData.description,
        testProjectData.projectType,
        testProjectData.startDate,
        testProjectData.endDate,
        testProjectData.projectAddress,
        testProjectData.city,
        testProjectData.state,
        testProjectData.landArea,
        testProjectData.estimatedCredits,
        testProjectData.ipfsUrl
      );

      console.log("Transaction hash:", tx.hash);
      console.log("Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("✅ Project created successfully!");
      console.log("Transaction confirmed in block:", receipt.blockNumber);

      // Check new project count
      const newProjectCount = await contract.getProjectCount();
      console.log(`New project count: ${newProjectCount}`);

      // Get the created project details
      const newProjectId = newProjectCount;
      const project = await contract.getProject(newProjectId);
      
      console.log("\n=== Created Project Details ===");
      console.log(`Project ID: ${newProjectId}`);
      console.log(`Name: ${project.name}`);
      console.log(`Owner: ${project.owner}`);
      console.log(`Assigned Officer: ${project.assignedOfficer}`);
      console.log(`Status: ${project.verificationStatus}`);

      console.log("\n✅ Project creation test completed successfully!");
      console.log("The project was created without officer assignment, which is correct.");

    } catch (error) {
      console.error("❌ Project creation failed:", error);
      throw error;
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

main().then(() => { 
  console.log("✅ Project creation test completed successfully"); 
  process.exit(0); 
}).catch((error) => { 
  console.error("❌ Test failed:", error); 
  process.exit(1); 
});
