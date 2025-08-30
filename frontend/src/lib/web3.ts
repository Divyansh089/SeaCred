import { BrowserProvider, Contract, ethers } from "ethers";
import { CONTRACT_ABI } from "../abi/contractAbi";

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

const ABI = CONTRACT_ABI;

// Use the newly deployed contract address with officer management features
export const CONTRACT_ADDRESS = "0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01" as `0x${string}`;
const CHAIN_ID = 17000; // Holesky testnet
const RPC_URL = "https://rpc.ankr.com/eth_holesky";

export async function getProvider(): Promise<BrowserProvider> {
  if (typeof window === "undefined") throw new Error("SSR");
  if (!window.ethereum) throw new Error("No wallet found");
  return new BrowserProvider(window.ethereum);
}

export async function connectWallet(): Promise<{ address: string; provider: BrowserProvider }> {
  const provider = await getProvider();
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return { address: await signer.getAddress(), provider };
}

export async function ensureHolesky() {
  const provider = await getProvider();
  const net = await provider.getNetwork();
  if (Number(net.chainId) === CHAIN_ID) return;
  try {
    // Switch first
    await window.ethereum!.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x" + CHAIN_ID.toString(16) }],
    });
  } catch (e: unknown) {
    // If chain not added, add it
    const error = e as { code?: number };
    if (error?.code === 4902 && RPC_URL) {
      await window.ethereum!.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x" + CHAIN_ID.toString(16),
          chainName: "Holesky",
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
          },
          rpcUrls: [RPC_URL],
          blockExplorerUrls: ["https://holesky.etherscan.io/"],
        }],
      });
    } else {
      throw e;
    }
  }
}

export async function getReadContract() {
  const provider = await getProvider();
  return new Contract(CONTRACT_ADDRESS, ABI, provider);
}

export async function getWriteContract() {
  const provider = await getProvider();
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, ABI, signer);
}

export const toUnits   = (x: string | number, d: number) => ethers.parseUnits(String(x), d);
export const fromUnits = (x: bigint, d: number) => ethers.formatUnits(x, d);

// Verification Management Functions

export interface VerificationReportData {
  area: string;
  plots: string;
  uavFlights: string;
  biomass: string;
  uncertainty: string;
  creditsRecommended: string;
  siteInspection: boolean;
  documentationVerified: boolean;
  measurementsValidated: boolean;
  qualityAssurance: boolean;
  additionalNotes?: string;
}

export interface VerificationReport {
  projectId: bigint;
  officerAddress: string;
  area: bigint;
  plots: bigint;
  uavFlights: bigint;
  biomass: bigint;
  uncertainty: bigint;
  creditsRecommended: bigint;
  siteInspection: boolean;
  documentationVerified: boolean;
  measurementsValidated: boolean;
  qualityAssurance: boolean;
  additionalNotes: string;
  submittedAt: bigint;
  isApproved: boolean;
  approvedBy: string;
  approvedAt: bigint;
}

export enum VerificationStatus {
  PENDING = 0,
  IN_PROGRESS = 1,
  APPROVED = 2,
  REJECTED = 3
}

/**
 * Start verification process for a project
 */
export async function startVerification(projectId: number): Promise<void> {
  const contract = await getWriteContract();
  const tx = await contract.startVerification(projectId);
  await tx.wait();
}

/**
 * Submit verification report for a project
 */
export async function submitVerificationReport(
  projectId: number,
  reportData: VerificationReportData
): Promise<void> {
  const contract = await getWriteContract();
  
  const tx = await contract.submitVerificationReport(
    projectId,
    ethers.parseUnits(reportData.area, 2), // Convert to wei (2 decimals for hectares)
    parseInt(reportData.plots),
    parseInt(reportData.uavFlights),
    ethers.parseUnits(reportData.biomass, 2), // Convert to wei (2 decimals for tonnes)
    parseInt(reportData.uncertainty), // Uncertainty is a simple percentage (0-100)
    ethers.parseUnits(reportData.creditsRecommended, 2), // Convert to wei (2 decimals for tCO2e)
    reportData.siteInspection,
    reportData.documentationVerified,
    reportData.measurementsValidated,
    reportData.qualityAssurance,
    reportData.additionalNotes || ""
  );
  
  await tx.wait();
}

/**
 * Get verification report for a project
 */
export async function getVerificationReport(projectId: number): Promise<VerificationReport | null> {
  try {
    const contract = await getReadContract();
    const report = await contract.getVerificationReport(projectId);
    return report;
  } catch (error) {
    // If no report found, return null
    return null;
  }
}

/**
 * Get verification report by report ID
 */
export async function getVerificationReportById(reportId: number): Promise<VerificationReport> {
  const contract = await getReadContract();
  return await contract.getVerificationReportById(reportId);
}

/**
 * Get total number of verification reports
 */
export async function getVerificationReportCount(): Promise<number> {
  const contract = await getReadContract();
  const count = await contract.getVerificationReportCount();
  return Number(count);
}

/**
 * Approve verification report (admin only)
 */
export async function approveVerificationReport(projectId: number): Promise<void> {
  const contract = await getWriteContract();
  const tx = await contract.approveVerificationReport(projectId);
  await tx.wait();
}

/**
 * Reject verification report (admin only)
 */
export async function rejectVerificationReport(projectId: number): Promise<void> {
  const contract = await getWriteContract();
  const tx = await contract.rejectVerificationReport(projectId);
  await tx.wait();
}

/**
 * Get project with verification status
 */
export async function getProject(projectId: number): Promise<{
  name: string;
  description: string;
  projectType: string;
  startDate: bigint;
  endDate: bigint;
  projectAddress: string;
  city: string;
  state: string;
  landArea: bigint;
  estimatedCredits: bigint;
  ipfsUrl: string;
  owner: string;
  assignedOfficer: string;
  isActive: boolean;
  createdAt: bigint;
  verificationStatus: string;
  verificationStartedAt: bigint;
  verificationCompletedAt: bigint;
}> {
  const contract = await getReadContract();
  const project = await contract.getProject(projectId);
  
  // Convert verification status enum to readable string
  const statusMap = {
    0: "PENDING",
    1: "IN_PROGRESS", 
    2: "APPROVED",
    3: "REJECTED"
  };
  
  return {
    ...project,
    verificationStatus: statusMap[project.verificationStatus as keyof typeof statusMap] || "UNKNOWN"
  };
}
