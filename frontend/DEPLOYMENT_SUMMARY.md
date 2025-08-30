# Contract Deployment Summary

## BlueCarbonAdminTokenRestricted Contract

### Latest Deployment (Most Recent)

- **Contract Address**: `0x553B0C98D730611d141E905016bF1E33bC247A1b`
- **Network**: Holesky Testnet
- **Deployer**: `0xEa8315C53CC5C324e3F516d51bF91153aD94E40A`
- **Transaction Hash**: `0x9b6392fb17cb5c988708c5fc117f3fc80a09278d506b2f29534aec5a8e44b5ff`
- **Deployment Timestamp**: 1756482712 (Unix timestamp)
- **Block Explorer**: https://holesky.etherscan.io/address/0x553B0C98D730611d141E905016bF1E33bC247A1b

### Contract Details

- **Name**: Blue Carbon Credit Token
- **Symbol**: BCC
- **Decimals**: 18
- **Admin**: `0xEa8315C53CC5C324e3F516d51bF91153aD94E40A`

### Previous Deployments

1. **Address**: `0x495A0FEcD36a0da74e0DEA4a88517bcEdfF26b01`
   - **Transaction Hash**: `0x2f412c23a708b06b98bd36803170b835f32649071219588f93b303e6b6ed80b2`
   - **Timestamp**: 1756470029

### Contract Features

- ERC-20 token with admin controls
- Officer role management
- User registration system
- Project management
- Verification workflow
- IPFS-based report approval
- Token distribution controls

### Usage

The contract is now ready for use in the SeaCred application. The frontend should be configured to use the latest contract address: `0x553B0C98D730611d141E905016bF1E33bC247A1b`

### Environment Configuration

Make sure your `.env.local` file contains:

```
CONTRACT_ADDRESS=0x553B0C98D730611d141E905016bF1E33bC247A1b
ADMIN_ADDRESS=0xEa8315C53CC5C324e3F516d51bF91153aD94E40A
```
