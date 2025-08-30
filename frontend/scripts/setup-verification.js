import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Setting up verification system...");
  
  try {
    // Get the contract artifact
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    console.log("Contract artifact obtained successfully");

    // Get the provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("Using account:", signer.address);

    // Create contract instance
    const contract = new ethers.Contract(
      "0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", // New contract address
      contractArtifact.abi,
      signer
    );

    // Step 1: Register a test user as an officer
    console.log("\n1. Registering test user as officer...");
    const testOfficerAddress = "0x86364Aa26E4E936fA1134e08c351e796E82Eb199"; // Replace with actual officer address
    
    try {
      const addOfficerTx = await contract.addOfficer(
        testOfficerAddress,
        "Test Officer",
        "Senior Verifier",
        "North Region",
        "Carbon Credits",
        "Environmental Authority"
      );
      await addOfficerTx.wait();
      console.log("✅ Officer registered successfully");
    } catch (error) {
      if (error.message.includes("OFFICER_ALREADY_EXISTS")) {
        console.log("ℹ️ Officer already exists");
      } else {
        console.error("❌ Error registering officer:", error.message);
      }
    }

    // Step 2: Add a test project
    console.log("\n2. Adding test project...");
    try {
      const addProjectTx = await contract.addProject(
        "Test Mangrove Project",
        "A test mangrove restoration project for verification testing",
        "forestry",
        Math.floor(Date.now() / 1000), // startDate
        Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // endDate (1 year from now)
        "Test Address, Test City",
        "Test City",
        "Test State",
        100, // landArea in hectares
        5000, // estimatedCredits
        "ipfs://test-hash" // ipfsUrl
      );
      await addProjectTx.wait();
      console.log("✅ Test project added successfully");
    } catch (error) {
      console.error("❌ Error adding project:", error.message);
    }

    // Step 3: Get project count and assign officer to the latest project
    console.log("\n3. Assigning officer to project...");
    try {
      const projectCount = await contract.getProjectCount();
      console.log(`Total projects: ${projectCount}`);
      
      if (projectCount > 0) {
        const latestProjectId = Number(projectCount);
        console.log(`Assigning officer to project ID: ${latestProjectId}`);
        
        const assignTx = await contract.assignOfficerToProject(
          latestProjectId,
          testOfficerAddress
        );
        await assignTx.wait();
        console.log("✅ Officer assigned to project successfully");
        
        // Step 4: Verify the assignment
        const project = await contract.getProject(latestProjectId);
        console.log(`Project assigned officer: ${project.assignedOfficer}`);
        console.log(`Project verification status: ${project.verificationStatus}`);
      }
    } catch (error) {
      console.error("❌ Error assigning officer:", error.message);
    }

    console.log("\n✅ Setup completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Connect with the officer wallet address:", testOfficerAddress);
    console.log("2. Navigate to the project and click 'Start Verification'");
    console.log("3. Fill out the verification report");
    console.log("4. Submit the report");
    
  } catch (error) {
    console.error("❌ Setup failed:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
