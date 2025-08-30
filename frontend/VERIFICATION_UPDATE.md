# Verification Management System Update

## Overview

This update adds comprehensive verification management functionality to the Blue Carbon Credit system, including status tracking, verification reports, and blockchain integration.

## Smart Contract Changes

### New Features Added

#### 1. Verification Status Management

- **VerificationStatus Enum**: Added to track project verification states
  - `PENDING` (0): Initial status when project is viewed
  - `IN_PROGRESS` (1): Officer has started verification
  - `APPROVED` (2): Verification report submitted and approved
  - `REJECTED` (3): Verification failed

#### 2. Project Structure Updates

- Added verification status fields to Project struct:
  - `verificationStatus`: Current verification status
  - `verificationStartedAt`: Timestamp when verification started
  - `verificationCompletedAt`: Timestamp when verification completed

#### 3. Verification Report Structure

- New `VerificationReport` struct with fields:
  - `projectId`: Associated project ID
  - `officerAddress`: Officer who submitted the report
  - `area`: Area in hectares (stored with 2 decimal precision)
  - `plots`: Number of plots
  - `uavFlights`: Number of UAV flights
  - `biomass`: Biomass in tonnes (stored with 2 decimal precision)
  - `uncertainty`: Uncertainty percentage (stored with 2 decimal precision)
  - `creditsRecommended`: Recommended credits in tCO2e (stored with 2 decimal precision)
  - `siteInspection`: Boolean for site inspection completion
  - `documentationVerified`: Boolean for documentation verification
  - `measurementsValidated`: Boolean for measurements validation
  - `qualityAssurance`: Boolean for quality assurance checks
  - `additionalNotes`: Additional notes from officer
  - `submittedAt`: Timestamp when report was submitted
  - `isApproved`: Whether report is approved by admin
  - `approvedBy`: Address of admin who approved
  - `approvedAt`: Timestamp when approved

#### 4. New Contract Functions

##### Officer Functions

- `startVerification(uint256 projectId)`: Start verification process

  - Only assigned officers can call
  - Changes status from PENDING to IN_PROGRESS
  - Records verification start timestamp

- `submitVerificationReport(...)`: Submit verification report
  - Only assigned officers can call
  - Requires verification to be IN_PROGRESS
  - Validates all input parameters
  - Stores report data on blockchain
  - Changes status to APPROVED (auto-approval)

##### Admin Functions

- `approveVerificationReport(uint256 projectId)`: Approve verification report

  - Only admin can call
  - Marks report as approved
  - Records approval timestamp

- `rejectVerificationReport(uint256 projectId)`: Reject verification report
  - Only admin can call
  - Changes status to REJECTED

##### View Functions

- `getVerificationReport(uint256 projectId)`: Get report by project ID
- `getVerificationReportById(uint256 reportId)`: Get report by report ID
- `getVerificationReportCount()`: Get total number of reports
- `getProject(uint256 projectId)`: Get project with verification status

#### 5. Events

- `VerificationStatusUpdated`: Emitted when verification status changes
- `VerificationReportSubmitted`: Emitted when report is submitted
- `VerificationReportApproved`: Emitted when report is approved

## Frontend Changes

### Web3 Integration (`frontend/src/lib/web3.ts`)

#### New Functions Added

- `startVerification(projectId)`: Call contract to start verification
- `submitVerificationReport(projectId, reportData)`: Submit verification report
- `getVerificationReport(projectId)`: Get verification report
- `getVerificationReportById(reportId)`: Get report by ID
- `getVerificationReportCount()`: Get total report count
- `approveVerificationReport(projectId)`: Approve report (admin)
- `rejectVerificationReport(projectId)`: Reject report (admin)
- `getProject(projectId)`: Get project with verification status

#### New Interfaces

- `VerificationReportData`: Interface for report submission data
- `VerificationReport`: Interface for report data from contract
- `VerificationStatus`: Enum for verification statuses

### VerificationDetails Component Updates

#### New Features

1. **Real-time Status Loading**: Loads verification status from blockchain on component mount
2. **Conditional UI**: Shows different UI based on verification status
3. **Blockchain Integration**: All verification actions now interact with smart contract
4. **Report Display**: Shows existing verification reports if available
5. **Status-based Actions**: Only shows relevant actions based on current status

#### Workflow Integration

1. **PENDING Status**: Shows "Start Verification" button for officers
2. **IN_PROGRESS Status**: Shows verification report form
3. **APPROVED Status**: Shows submitted report details
4. **REJECTED Status**: Shows rejection status

#### New State Management

- `projectVerificationStatus`: Current verification status from blockchain
- `existingVerificationReport`: Existing report data if available
- `isStartingVerification`: Loading state for start verification
- `canStartVerification`: Boolean for showing start button
- `canSubmitReport`: Boolean for showing report form

## Workflow Summary

### Complete Verification Process

1. **Project Creation**: Project starts with PENDING status
2. **View Project**: When project is viewed, status remains PENDING
3. **Start Verification**: Officer clicks "Start Verification" button
   - Calls `startVerification()` on contract
   - Status changes to IN_PROGRESS
   - Records start timestamp
4. **Submit Report**: Officer fills and submits verification report
   - Calls `submitVerificationReport()` on contract
   - All report data stored on blockchain
   - Status changes to APPROVED
   - Records completion timestamp
5. **Admin Review**: Admin can approve/reject reports
   - Calls `approveVerificationReport()` or `rejectVerificationReport()`
   - Updates approval status and timestamps

### Data Storage

- All verification data is stored on the blockchain
- Reports are immutable once submitted
- Full audit trail with timestamps
- Officer and admin actions are recorded

## Deployment

### New Contract Deployment

Use the new deployment script:

```bash
npx hardhat run scripts/deploy-verification.js --network holesky
```

### Contract Address Update

After deployment, update the contract address in:

- `frontend/src/lib/web3.ts` (CONTRACT_ADDRESS)
- `frontend/src/abi/BlueCarbonAdminTokenRestricted.json` (if needed)

## Security Features

1. **Role-based Access**: Only officers can start verification and submit reports
2. **Assignment Validation**: Only assigned officers can work on projects
3. **Status Validation**: Actions only allowed in appropriate status
4. **Input Validation**: All report data validated before storage
5. **Immutable Records**: Once submitted, reports cannot be modified

## Benefits

1. **Transparency**: All verification data stored on blockchain
2. **Audit Trail**: Complete history of verification process
3. **Immutability**: Reports cannot be tampered with
4. **Real-time Updates**: Status changes reflected immediately
5. **Role-based Security**: Proper access control for different user types
6. **Data Integrity**: All data validated and stored securely

## Future Enhancements

1. **Multi-step Verification**: Support for multiple verification phases
2. **Document Upload**: IPFS integration for document storage
3. **Automated Validation**: AI-powered validation of reports
4. **Notification System**: Real-time notifications for status changes
5. **Advanced Reporting**: Detailed analytics and reporting features
