import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Debugging officer assignments and user data...");
  
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, signer);

    console.log("Using account:", signer.address);
    console.log("Contract address:", await contract.getAddress());

    // Check officer role
    const OFFICER_ROLE = await contract.OFFICER_ROLE();
    const isOfficer = await contract.hasRole(OFFICER_ROLE, signer.address);
    console.log(`\nIs current account an officer: ${isOfficer}`);

    // Get all projects assigned to the current signer
    console.log("\n=== Projects assigned to current signer ===");
    const projectCount = await contract.getProjectCount();
    const assignedProjects = [];
    
    for (let i = 1; i <= Number(projectCount); i++) {
      try {
        const project = await contract.getProject(i);
        if (project.assignedOfficer === signer.address) {
          assignedProjects.push({
            id: i,
            name: project.name,
            owner: project.owner,
            verificationStatus: Number(project.verificationStatus)
          });
        }
      } catch (error) {
        console.log(`Error fetching project ${i}:`, error.message);
      }
    }

    console.log(`Found ${assignedProjects.length} projects assigned to current signer`);
    assignedProjects.forEach(project => {
      console.log(`Project ${project.id}: ${project.name} (Owner: ${project.owner}, Status: ${project.verificationStatus})`);
    });

    // Get unique user addresses from assigned projects
    const userAddresses = [...new Set(assignedProjects.map(project => project.owner))];
    console.log(`\nUnique user addresses: ${userAddresses}`);

    // Check user registration status
    console.log("\n=== User Registration Status ===");
    for (const address of userAddresses) {
      try {
        const user = await contract.getUser(address);
        console.log(`User ${address}:`);
        console.log(`  Name: ${user.name}`);
        console.log(`  District: ${user.district}`);
        console.log(`  Is Registered: ${user.isRegistered}`);
      } catch (error) {
        console.log(`Error fetching user ${address}:`, error.message);
      }
    }

    // Also check the known officer address
    console.log("\n=== Checking known officer address ===");
    const knownOfficerAddress = "0x86364Aa26E4E936fA1134e08c351e796E82Eb199";
    const isKnownOfficer = await contract.hasRole(OFFICER_ROLE, knownOfficerAddress);
    console.log(`Is ${knownOfficerAddress} an officer: ${isKnownOfficer}`);

    if (isKnownOfficer) {
      const officerProjects = [];
      for (let i = 1; i <= Number(projectCount); i++) {
        try {
          const project = await contract.getProject(i);
          if (project.assignedOfficer === knownOfficerAddress) {
            officerProjects.push({
              id: i,
              name: project.name,
              owner: project.owner,
              verificationStatus: Number(project.verificationStatus)
            });
          }
        } catch (error) {
          console.log(`Error fetching project ${i}:`, error.message);
        }
      }

      console.log(`\nProjects assigned to known officer: ${officerProjects.length}`);
      officerProjects.forEach(project => {
        console.log(`Project ${project.id}: ${project.name} (Owner: ${project.owner}, Status: ${project.verificationStatus})`);
      });

      const officerUserAddresses = [...new Set(officerProjects.map(project => project.owner))];
      console.log(`\nUnique user addresses for known officer: ${officerUserAddresses}`);

      for (const address of officerUserAddresses) {
        try {
          const user = await contract.getUser(address);
          console.log(`User ${address}:`);
          console.log(`  Name: ${user.name}`);
          console.log(`  District: ${user.district}`);
          console.log(`  Is Registered: ${user.isRegistered}`);
        } catch (error) {
          console.log(`Error fetching user ${address}:`, error.message);
        }
      }
    }

  } catch (error) {
    console.error("❌ Debug failed:", error);
    throw error;
  }
}

main().then(() => { 
  console.log("✅ Debug completed successfully"); 
  process.exit(0); 
}).catch((error) => { 
  console.error("❌ Debug failed:", error); 
  process.exit(1); 
});
