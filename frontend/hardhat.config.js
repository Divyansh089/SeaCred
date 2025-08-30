import "dotenv/config";
import "@nomicfoundation/hardhat-verify";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.20",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contract",
    artifacts: "./artifacts",
    cache: "./cache"
  },
  networks: {
    holesky: {
      type: "http",
      url: process.env.HOLESKY_RPC_URL || "https://ethereum-holesky.publicnode.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545"
    }
  },
  etherscan: {
    apiKey: {
      holesky: process.env.ETHERSCAN_API_KEY || ""
    }
  }
};
