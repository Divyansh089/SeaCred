# Deployment Guide for BlueCarbonAdminTokenRestricted Contract

## Prerequisites

1. **MetaMask Wallet**: Install MetaMask and create a wallet
2. **Holesky Testnet ETH**: Get some test ETH from a faucet
3. **Private Key**: Export your private key from MetaMask (be careful with this!)

## Step 1: Get Holesky Testnet ETH

Visit one of these faucets to get test ETH:

- https://holesky-faucet.pk910.de/
- https://faucet.holesky.ethpandaops.io/
- https://holesky-faucet.chain.link/

## Step 2: Set Up Environment Variables

1. Copy the environment template:

   ```bash
   cp env.example .env
   ```

2. Edit `.env` file and add your values:

   ```env
   # Your private key (without 0x prefix)
   PRIVATE_KEY=your_private_key_here

   # Optional: Custom RPC URL
   HOLESKY_RPC_URL=https://ethereum-holesky.publicnode.com

   # Optional: Etherscan API key for verification
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

## Step 3: Deploy the Contract

Run the deployment script:

```bash
npx hardhat run scripts/deploy.js --network holesky
```

The script will:

- Deploy the contract with name "Blue Carbon Credit Token"
- Symbol "BCC"
- 18 decimals
- Set the deployer as the admin

## Step 4: Verify the Contract (Optional)

After deployment, you can verify the contract on Etherscan:

1. Set the contract address in your `.env` file:

   ```env
   CONTRACT_ADDRESS=deployed_contract_address_here
   ADMIN_ADDRESS=your_wallet_address_here
   ```

2. Run the verification script:
   ```bash
   npx hardhat run scripts/verify.js --network holesky
   ```

## Step 5: Test the Contract

You can interact with the contract using:

```bash
# Check contract state
npx hardhat console --network holesky

# In the console:
const contract = await ethers.getContractAt("BlueCarbonAdminTokenRestricted", "CONTRACT_ADDRESS");
await contract.name();
await contract.symbol();
await contract.paused();
```

## Contract Functions

### Admin Functions (only admin can call):

- `pause()` - Pause the contract
- `unpause()` - Unpause the contract
- `setOfficer(address officer, bool enabled)` - Grant/revoke officer role
- `approveAndMint(string cid, address recipient, uint256 amount, address submitter)` - Mint tokens for a report
- `adminBurn(uint256 amount)` - Burn admin's tokens
- `adminBurnFrom(address from, uint256 amount)` - Burn tokens from any address
- `adminTransferToOfficer(address officer, uint256 amount)` - Transfer tokens to officer

### View Functions:

- `name()` - Get token name
- `symbol()` - Get token symbol
- `decimals()` - Get token decimals
- `paused()` - Check if contract is paused
- `mintedCumulative()` - Total tokens minted
- `burnedCumulative()` - Total tokens burned

## Security Notes

- Keep your private key secure and never share it
- The deployer automatically becomes the admin
- Only admins can mint tokens and manage officers
- Officers can only transfer tokens to regular users (not to other admins/officers)
- The contract prevents double-minting for the same IPFS CID

## Troubleshooting

1. **Insufficient funds**: Make sure you have enough Holesky ETH
2. **Network issues**: Try a different RPC URL
3. **Verification fails**: Check that constructor arguments match deployment
4. **Permission denied**: Make sure you're calling admin functions with the admin account
