# SeaCred Smart Contracts

## Overview

SeaCred is a comprehensive blockchain-based platform for tokenizing and managing blue carbon credits with Measurement, Reporting, and Verification (MRV) capabilities. The smart contracts provide a secure, transparent, and auditable system for carbon credit issuance, trading, and retirement.

## Contract Architecture

The SeaCred platform consists of two main smart contracts:

### 1. SeacredCredit (ERC-1155 Token Contract)

**Purpose**: Manages the tokenized carbon credits using the ERC-1155 standard for multi-token support.

**Key Features**:
- **Multi-Token Support**: Each project/vintage combination creates a unique token class
- **Non-Transferable Tokens**: Optional soulbound-like tokens that cannot be transferred between wallets
- **Cumulative Tracking**: Maintains audit trails of all minted and retired credits
- **Role-Based Access Control**: Secure minting and management through role-based permissions
- **IPFS Integration**: Supports metadata storage via IPFS CIDs

**Core Functions**:
- `createClass()`: Create new credit classes for projects
- `mint()`: Mint credits to specified addresses
- `retire()`: Burn credits with reason and evidence tracking
- `classInfo()`: Retrieve credit class information
- `uri()`: Get metadata URI for tokens

### 2. SeacredRegistry (MRV Registry)

**Purpose**: Manages the complete lifecycle of carbon credit projects from registration to issuance.

**Key Features**:
- **Project Management**: Register and manage carbon sequestration projects
- **Workflow Management**: Multi-stage approval process (Submit → Officer Review → Admin Approval)
- **Role-Based System**: Three-tier role system (Admin, Officer, Verifier)
- **Evidence Tracking**: IPFS-based storage for reports, evidence, and calculations
- **Issuance History**: Complete audit trail of all credit issuances

**Core Functions**:
- `registerProject()`: Register new carbon sequestration projects
- `submitReport()`: Submit project reports for verification
- `officerReviewReport()`: Officer-level review of submitted reports
- `adminApproveReport()`: Final admin approval and amount determination
- `mintApproved()`: Mint approved credits to recipients

## Roles and Permissions

### DEFAULT_ADMIN_ROLE
- Project registration and management
- Credit class creation and updates
- System configuration and pausing

### OFFICER_ROLE
- Review submitted reports
- Distribute credits to recipients
- Manage credit distribution workflows

### ISSUER_ROLE
- Final approval of reports
- Credit minting authorization
- Amount determination for approved projects

### VERIFIER_ROLE
- Optional assignment to projects
- Technical verification of project data

## Workflow Process

1. **Project Registration**: Admin registers a new carbon sequestration project
2. **Report Submission**: Project owner submits verification reports with evidence
3. **Officer Review**: Assigned officer reviews the submitted reports
4. **Admin Approval**: Admin makes final approval and determines credit amount
5. **Credit Minting**: Approved credits are minted to specified recipients
6. **Distribution**: Officers can distribute credits to final beneficiaries
7. **Retirement**: Credits can be retired (burned) with reason and evidence

## Technical Specifications

- **Solidity Version**: ^0.8.20
- **Token Standard**: ERC-1155 (Multi-token)
- **Access Control**: OpenZeppelin AccessControl
- **Pausability**: OpenZeppelin Pausable
- **Metadata**: IPFS-based JSON metadata
- **Gas Optimization**: Optimized for efficient deployment and operation

## Key Data Structures

### CreditClass
```solidity
struct CreditClass {
    bytes32 projectId;     // Project identifier
    uint16 vintage;        // Year of credit vintage
    address beneficiary;   // Default beneficiary address
    string dataURI;        // IPFS metadata URI
    bool transferable;     // Transferability flag
    uint8 unitDecimals;    // Decimal precision
    bool exists;          // Existence flag
}
```

### Project
```solidity
struct Project {
    bytes32 projectId;        // Unique project identifier
    address owner;            // Project owner address
    string fieldRef;          // Geographic reference
    uint256 areaSqM;          // Project area in square meters
    uint16 vintage;           // Credit vintage year
    string methodologyURI;    // Methodology documentation
    address verifier;         // Assigned verifier
    bool active;             // Project status
}
```

### Report
```solidity
struct Report {
    bytes32 projectId;        // Associated project
    address submitter;        // Report submitter
    string reportCID;         // IPFS report CID
    string evidenceCID;       // IPFS evidence CID
    string calcCID;           // IPFS calculation CID
    uint64 submittedAt;       // Submission timestamp
    ReportStatus status;      // Current status
    address officer;          // Reviewing officer
    string officerComment;    // Officer comments
    uint64 officerAt;         // Officer review timestamp
    string adminComment;      // Admin comments
    uint64 adminAt;           // Admin review timestamp
    uint256 approvedAmount;   // Approved credit amount
}
```

## Deployment Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Compile Contracts**:
   ```bash
   npx hardhat compile
   ```

3. **Deploy Contracts**:
   ```bash
   npx hardhat run scripts/deploy.js --network <network-name>
   ```

## Security Features

- **Role-Based Access Control**: Granular permissions for different operations
- **Pausability**: Emergency pause functionality for critical situations
- **Input Validation**: Comprehensive validation of all inputs
- **Audit Trails**: Complete tracking of all operations
- **Non-Transferable Tokens**: Optional soulbound functionality
- **Evidence Tracking**: IPFS-based immutable evidence storage

## Integration Points

- **IPFS**: For decentralized metadata and evidence storage
- **Frontend**: Web3 integration for user interactions
- **Backend**: API integration for data management
- **Blockchain Networks**: Ethereum mainnet and testnets

## License

MIT License - See LICENSE file for details.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## Support

For technical support and questions, please refer to the project documentation or create an issue in the repository.
