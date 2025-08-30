import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Testing verification dashboard with different project statuses...");
  
  try {
    const contractArtifact = await hre.artifacts.readArtifact("BlueCarbonAdminTokenRestricted");
    const provider = new ethers.JsonRpcProvider(process.env.HOLESKY_RPC_URL || "https://rpc.ankr.com/eth_holesky");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract("0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01", contractArtifact.abi, signer);

    const testOfficerAddress = "0x86364Aa26E4E936fA1134e08c351e796E82Eb199";

    console.log("Using account:", signer.address);
    console.log("Contract address:", await contract.getAddress());

    // Get current project count
    const projectCount = await contract.getProjectCount();
    console.log(`Current project count: ${projectCount}`);

    // Initialize status counts
    const statusCounts = {
      pending: 0,
      inProgress: 0,
      approved: 0,
      rejected: 0
    };

    // Check each project's verification status
    for (let i = 1; i <= projectCount; i++) {
      try {
        const project = await contract.getProject(i);
        console.log(`\nProject ID: ${i}`);
        console.log(`Name: ${project.name}`);
        console.log(`Verification Status: ${project.verificationStatus}`);
        console.log(`Assigned Officer: ${project.assignedOfficer}`);
        console.log(`Is Active: ${project.isActive}`);
        
        // Convert to number if it's a BigInt
        const statusNumber = Number(project.verificationStatus);
        
        // Map status to text
        const statusText = (() => {
          if (statusNumber === 0) return "PENDING";
          if (statusNumber === 1) return "IN_PROGRESS";
          if (statusNumber === 2) return "APPROVED";
          if (statusNumber === 3) return "REJECTED";
          return "UNKNOWN";
        })();
        
        console.log(`Status Number: ${statusNumber}`);
        console.log(`Status Text: ${statusText}`);
        
        // Update status counts
        if (statusNumber === 0) statusCounts.pending++;
        else if (statusNumber === 1) statusCounts.inProgress++;
        else if (statusNumber === 2) statusCounts.approved++;
        else if (statusNumber === 3) statusCounts.rejected++;
      } catch (error) {
        console.log(`Error fetching project ${i}:`, error.message);
      }
    }

    console.log("\n=== Status Counts ===");
    console.log(`Pending: ${statusCounts.pending}`);
    console.log(`In Progress: ${statusCounts.inProgress}`);
    console.log(`Approved: ${statusCounts.approved}`);
    console.log(`Rejected: ${statusCounts.rejected}`);
    console.log(`Total: ${projectCount}`);

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

main().then(() => { 
  console.log("✅ Test completed successfully"); 
  process.exit(0); 
}).catch((error) => { 
  console.error("❌ Test failed:", error); 
  process.exit(1); 
});
