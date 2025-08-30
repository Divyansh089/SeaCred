// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * BlueCarbonAdminTokenRestricted
 * Minimal, admin‑centric ERC‑20 with officer distribution + IPFS‑keyed mint ledger.
 *
 * Your ask, implemented:
 * - Admin can: set officers, pause, approve+mint by IPFS CID, burn (supply reduction),
 *   and transfer own balance to officers if desired.
 * - Officer can: ONLY transfer out to end‑user wallets (not to admin/officers).
 * - Users: receive tokens; cannot transfer (by design here).
 * - Small ledger: cumulative minted/burned; per‑officer received/distributed; per‑user received;
 *   per‑report mint record (prevents double mint for the same CID).
 *
 * NOTE: Uses OpenZeppelin 4.9.x style hooks (_beforeTokenTransfer/_afterTokenTransfer).
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BlueCarbonAdminTokenRestricted is
    ERC20,
    AccessControl,
    ReentrancyGuard
{
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    bytes32 public constant OFFICER_ROLE = keccak256("OFFICER_ROLE");

    uint8 private immutable _decimals;
    bool public paused;

    // Verification status enum
    enum VerificationStatus {
        PENDING, // 0 - Initial status when project is viewed
        IN_PROGRESS, // 1 - Officer has started verification
        APPROVED, // 2 - Verification report submitted and approved
        REJECTED // 3 - Verification failed
    }

    // Officer management
    struct Officer {
        string name;
        string designation;
        string area;
        string contracts;
        string jurisdiction;
        address walletAddress;
        bool isActive;
        uint256 assignedAt;
    }

    // Officer registry
    mapping(address => Officer) public officers;
    address[] public officerAddresses;
    mapping(string => address[]) public officersByArea;
    mapping(string => address[]) public officersByJurisdiction;

    // User management
    struct User {
        string firstName;
        string lastName;
        string phone;
        string email;
        string district;
        address walletAddress;
        bool isRegistered;
        uint256 registeredAt;
    }

    // User registry
    mapping(address => User) public users;
    address[] public userAddresses;
    mapping(string => address[]) public usersByDistrict;

    // Project management
    struct Project {
        string name;
        string description;
        string projectType;
        uint256 startDate;
        uint256 endDate;
        string projectAddress;
        string city;
        string state;
        uint256 landArea;
        uint256 estimatedCredits;
        string ipfsUrl;
        address owner;
        address assignedOfficer;
        bool isActive;
        uint256 createdAt;
        VerificationStatus verificationStatus; // Added verification status
        uint256 verificationStartedAt; // When verification started
        uint256 verificationCompletedAt; // When verification completed
    }

    // Project registry
    mapping(uint256 => Project) public projects;
    uint256 public projectCount;
    mapping(address => uint256[]) public userProjects;
    mapping(address => uint256[]) public officerAssignedProjects;

    // Verification Report management
    struct VerificationReport {
        uint256 projectId;
        address officerAddress;
        uint256 area; // Area in hectares
        uint256 plots; // Number of plots
        uint256 uavFlights; // Number of UAV flights
        uint256 biomass; // Biomass in tonnes
        uint256 uncertainty; // Uncertainty percentage
        uint256 creditsRecommended; // Recommended credits in tCO2e
        bool siteInspection;
        bool documentationVerified;
        bool measurementsValidated;
        bool qualityAssurance;
        string additionalNotes;
        uint256 submittedAt;
        bool isApproved;
        address approvedBy;
        uint256 approvedAt;
    }

    // Verification reports registry
    mapping(uint256 => VerificationReport) public verificationReports; // projectId => report
    uint256 public verificationReportCount;
    mapping(uint256 => uint256) public projectToReportId; // projectId => reportId

    // Per‑report issuance bookkeeping keyed by IPFS CID hash
    struct ReportApproval {
        address submitter; // who uploaded the report (off‑chain portal)
        string cid; // IPFS CID for the report bundle
        uint256 approvedAmount; // amount minted for this report
        address recipient; // officer or user who received the mint
        uint64 approvedAt;
        bool minted; // prevents double‑mint for the same CID
    }

    // reportKey (keccak256(cid)) => approval
    mapping(bytes32 => ReportApproval) public approvals;

    // Minimal ledger counters (for dashboards)
    uint256 public mintedCumulative; // total minted over contract lifetime
    uint256 public burnedCumulative; // total burned over contract lifetime

    // Officer/user distribution stats
    mapping(address => uint256) public officerReceived; // minted/transferred TO officer from admin
    mapping(address => uint256) public officerDistributed; // officer → users
    mapping(address => uint256) public userReceived; // total received by a user from officers

    event OfficerSet(address indexed officer, bool enabled);
    event OfficerRegistered(
        address indexed officer,
        string name,
        string designation,
        string area,
        string jurisdiction
    );
    event OfficerUpdated(
        address indexed officer,
        string name,
        string designation,
        string area,
        string jurisdiction
    );
    event ReportApprovedAndMinted(
        bytes32 indexed reportKey,
        address indexed recipient,
        uint256 amount,
        string cid
    );
    event OfficerDistributed(
        address indexed officer,
        address indexed toUser,
        uint256 amount
    );
    event UserRegistered(
        address indexed walletAddress,
        string firstName,
        string lastName,
        string district
    );
    event ProjectAdded(
        uint256 indexed projectId,
        address indexed owner,
        string name,
        string projectAddress
    );
    event OfficerAssignedToProject(
        uint256 indexed projectId,
        address indexed officer
    );
    event VerificationStatusUpdated(
        uint256 indexed projectId,
        VerificationStatus status,
        address indexed officer
    );
    event VerificationReportSubmitted(
        uint256 indexed projectId,
        uint256 indexed reportId,
        address indexed officer,
        uint256 creditsRecommended
    );
    event VerificationReportApproved(
        uint256 indexed projectId,
        uint256 indexed reportId,
        address indexed approvedBy
    );
    event ProjectRemoved(uint256 indexed projectId, address indexed remover);

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address admin_
    ) ERC20(name_, symbol_) {
        _decimals = decimals_;
        _grantRole(ADMIN_ROLE, admin_);
    }

    // ——— Admin controls ———
    function pause() external onlyRole(ADMIN_ROLE) {
        paused = true;
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        paused = false;
    }

    function setOfficer(
        address officer,
        bool enabled
    ) external onlyRole(ADMIN_ROLE) {
        if (enabled) {
            _grantRole(OFFICER_ROLE, officer);
        } else {
            _revokeRole(OFFICER_ROLE, officer);
        }
        emit OfficerSet(officer, enabled);
    }

    /**
     * Register a new officer with complete details
     */
    function addOfficer(
        address walletAddress,
        string memory name,
        string memory designation,
        string memory area,
        string memory contracts,
        string memory jurisdiction
    ) external onlyRole(ADMIN_ROLE) {
        require(walletAddress != address(0), "INVALID_WALLET_ADDRESS");
        require(bytes(name).length > 0, "NAME_REQUIRED");
        require(bytes(area).length > 0, "AREA_REQUIRED");
        require(bytes(jurisdiction).length > 0, "JURISDICTION_REQUIRED");

        // Check if officer already exists
        require(!officers[walletAddress].isActive, "OFFICER_ALREADY_EXISTS");

        // Create new officer
        Officer memory newOfficer = Officer({
            name: name,
            designation: designation,
            area: area,
            contracts: contracts,
            jurisdiction: jurisdiction,
            walletAddress: walletAddress,
            isActive: true,
            assignedAt: block.timestamp
        });

        officers[walletAddress] = newOfficer;
        officerAddresses.push(walletAddress);

        // Add to area mapping
        officersByArea[area].push(walletAddress);

        // Add to jurisdiction mapping
        officersByJurisdiction[jurisdiction].push(walletAddress);

        // Grant officer role
        _grantRole(OFFICER_ROLE, walletAddress);

        emit OfficerRegistered(
            walletAddress,
            name,
            designation,
            area,
            jurisdiction
        );
        emit OfficerSet(walletAddress, true);
    }

    /**
     * Update existing officer details
     */
    function updateOfficer(
        address walletAddress,
        string memory name,
        string memory designation,
        string memory area,
        string memory contracts,
        string memory jurisdiction
    ) external onlyRole(ADMIN_ROLE) {
        require(officers[walletAddress].isActive, "OFFICER_NOT_FOUND");
        require(bytes(name).length > 0, "NAME_REQUIRED");
        require(bytes(area).length > 0, "AREA_REQUIRED");
        require(bytes(jurisdiction).length > 0, "JURISDICTION_REQUIRED");

        // Remove from old area mapping
        string memory oldArea = officers[walletAddress].area;
        removeFromArray(officersByArea[oldArea], walletAddress);

        // Remove from old jurisdiction mapping
        string memory oldJurisdiction = officers[walletAddress].jurisdiction;
        removeFromArray(officersByJurisdiction[oldJurisdiction], walletAddress);

        // Update officer details
        officers[walletAddress].name = name;
        officers[walletAddress].designation = designation;
        officers[walletAddress].area = area;
        officers[walletAddress].contracts = contracts;
        officers[walletAddress].jurisdiction = jurisdiction;

        // Add to new area mapping
        officersByArea[area].push(walletAddress);

        // Add to new jurisdiction mapping
        officersByJurisdiction[jurisdiction].push(walletAddress);

        emit OfficerUpdated(
            walletAddress,
            name,
            designation,
            area,
            jurisdiction
        );
    }

    /**
     * Deactivate an officer
     */
    function deactivateOfficer(
        address walletAddress
    ) external onlyRole(ADMIN_ROLE) {
        require(officers[walletAddress].isActive, "OFFICER_NOT_FOUND");

        officers[walletAddress].isActive = false;

        // Remove from area mapping
        string memory area = officers[walletAddress].area;
        removeFromArray(officersByArea[area], walletAddress);

        // Remove from jurisdiction mapping
        string memory jurisdiction = officers[walletAddress].jurisdiction;
        removeFromArray(officersByJurisdiction[jurisdiction], walletAddress);

        // Revoke officer role
        _revokeRole(OFFICER_ROLE, walletAddress);

        emit OfficerSet(walletAddress, false);
    }

    /**
     * Get officer details by wallet address
     */
    function getOfficer(
        address walletAddress
    ) external view returns (Officer memory) {
        return officers[walletAddress];
    }

    /**
     * Get all officers in a specific area
     */
    function getOfficersByArea(
        string memory area
    ) external view returns (address[] memory) {
        return officersByArea[area];
    }

    /**
     * Get all officers in a specific jurisdiction
     */
    function getOfficersByJurisdiction(
        string memory jurisdiction
    ) external view returns (address[] memory) {
        return officersByJurisdiction[jurisdiction];
    }

    /**
     * Get all active officer addresses
     */
    function getAllOfficers() external view returns (address[] memory) {
        return officerAddresses;
    }

    /**
     * Helper function to remove address from array
     */
    function removeFromArray(address[] storage arr, address target) internal {
        for (uint i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                arr[i] = arr[arr.length - 1];
                arr.pop();
                break;
            }
        }
    }

    // ——— User Management ———

    /**
     * Register a new user
     */
    function registerUser(
        string memory firstName,
        string memory lastName,
        string memory phone,
        string memory email,
        string memory district
    ) external {
        require(!users[msg.sender].isRegistered, "USER_ALREADY_REGISTERED");
        require(bytes(firstName).length > 0, "FIRST_NAME_REQUIRED");
        require(bytes(lastName).length > 0, "LAST_NAME_REQUIRED");
        require(bytes(phone).length > 0, "PHONE_REQUIRED");
        require(bytes(email).length > 0, "EMAIL_REQUIRED");
        require(bytes(district).length > 0, "DISTRICT_REQUIRED");

        User memory newUser = User({
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            email: email,
            district: district,
            walletAddress: msg.sender,
            isRegistered: true,
            registeredAt: block.timestamp
        });

        users[msg.sender] = newUser;
        userAddresses.push(msg.sender);
        usersByDistrict[district].push(msg.sender);

        emit UserRegistered(msg.sender, firstName, lastName, district);
    }

    /**
     * Get user details by wallet address
     */
    function getUser(
        address walletAddress
    ) external view returns (User memory) {
        require(users[walletAddress].isRegistered, "USER_NOT_REGISTERED");
        return users[walletAddress];
    }

    /**
     * Check if user is registered
     */
    function isUserRegistered(
        address walletAddress
    ) external view returns (bool) {
        return users[walletAddress].isRegistered;
    }

    /**
     * Get all users in a specific district
     */
    function getUsersByDistrict(
        string memory district
    ) external view returns (address[] memory) {
        return usersByDistrict[district];
    }

    /**
     * Get all registered user addresses
     */
    function getAllUsers() external view returns (address[] memory) {
        return userAddresses;
    }

    // ——— Project Management ———

    /**
     * Add a new project (only registered users can add projects)
     */
    function addProject(
        string memory name,
        string memory description,
        string memory projectType,
        uint256 startDate,
        uint256 endDate,
        string memory projectAddress,
        string memory city,
        string memory state,
        uint256 landArea,
        uint256 estimatedCredits,
        string memory ipfsUrl
    ) external {
        require(users[msg.sender].isRegistered, "USER_MUST_BE_REGISTERED");
        require(bytes(name).length > 0, "PROJECT_NAME_REQUIRED");
        require(bytes(description).length > 0, "PROJECT_DESCRIPTION_REQUIRED");
        require(bytes(projectType).length > 0, "PROJECT_TYPE_REQUIRED");
        require(startDate > 0, "START_DATE_REQUIRED");
        require(endDate > startDate, "END_DATE_MUST_BE_AFTER_START_DATE");
        require(bytes(projectAddress).length > 0, "PROJECT_ADDRESS_REQUIRED");
        require(bytes(city).length > 0, "CITY_REQUIRED");
        require(bytes(state).length > 0, "STATE_REQUIRED");
        require(landArea > 0, "LAND_AREA_MUST_BE_POSITIVE");
        require(estimatedCredits > 0, "ESTIMATED_CREDITS_MUST_BE_POSITIVE");
        require(bytes(ipfsUrl).length > 0, "IPFS_URL_REQUIRED");

        projectCount++;
        uint256 projectId = projectCount;

        Project memory newProject = Project({
            name: name,
            description: description,
            projectType: projectType,
            startDate: startDate,
            endDate: endDate,
            projectAddress: projectAddress,
            city: city,
            state: state,
            landArea: landArea,
            estimatedCredits: estimatedCredits,
            ipfsUrl: ipfsUrl,
            owner: msg.sender,
            assignedOfficer: address(0), // No officer assigned initially
            isActive: true,
            createdAt: block.timestamp,
            verificationStatus: VerificationStatus.PENDING, // Initial status
            verificationStartedAt: 0,
            verificationCompletedAt: 0
        });

        projects[projectId] = newProject;
        userProjects[msg.sender].push(projectId);

        emit ProjectAdded(projectId, msg.sender, name, projectAddress);
    }

    /**
     * Assign an officer to a project based on the project's city.
     */
    function assignOfficerToProject(
        uint256 projectId,
        address officer
    ) external onlyRole(ADMIN_ROLE) {
        require(projects[projectId].isActive, "PROJECT_NOT_ACTIVE");
        require(
            projects[projectId].assignedOfficer == address(0),
            "OFFICER_ALREADY_ASSIGNED"
        );
        require(hasRole(OFFICER_ROLE, officer), "NOT_OFFICER");

        projects[projectId].assignedOfficer = officer;
        officerAssignedProjects[officer].push(projectId);
        emit OfficerAssignedToProject(projectId, officer);
    }

    /**
     * Get project details by project ID
     */
    function getProject(
        uint256 projectId
    ) external view returns (Project memory) {
        require(
            projectId > 0 && projectId <= projectCount,
            "PROJECT_NOT_FOUND"
        );
        return projects[projectId];
    }

    /**
     * Get all projects for a specific user
     */
    function getUserProjects(
        address userAddress
    ) external view returns (uint256[] memory) {
        return userProjects[userAddress];
    }

    /**
     * Get all projects assigned to a specific officer
     */
    function getOfficerAssignedProjects(
        address officerAddress
    ) external view returns (uint256[] memory) {
        return officerAssignedProjects[officerAddress];
    }

    /**
     * Get total number of projects
     */
    function getProjectCount() external view returns (uint256) {
        return projectCount;
    }

    /**
     * Remove a project (only admin can remove projects not created by them)
     */
    function removeProject(uint256 projectId) external onlyRole(ADMIN_ROLE) {
        require(
            projectId > 0 && projectId <= projectCount,
            "PROJECT_NOT_FOUND"
        );
        require(projects[projectId].isActive, "PROJECT_ALREADY_INACTIVE");

        // Only allow removal of projects not created by the admin
        require(
            projects[projectId].owner != msg.sender,
            "CANNOT_REMOVE_OWN_PROJECTS"
        );

        // Mark project as inactive
        projects[projectId].isActive = false;

        emit ProjectRemoved(projectId, msg.sender);
    }

    // ——— Verification Management ———

    /**
     * Start verification process (called when officer clicks "Start Verification")
     * Only assigned officers can start verification
     */
    function startVerification(uint256 projectId) external {
        require(hasRole(OFFICER_ROLE, msg.sender), "NOT_OFFICER");
        require(projects[projectId].isActive, "PROJECT_NOT_ACTIVE");
        require(
            projects[projectId].assignedOfficer == msg.sender,
            "NOT_ASSIGNED_OFFICER"
        );
        require(
            projects[projectId].verificationStatus ==
                VerificationStatus.PENDING,
            "VERIFICATION_ALREADY_STARTED"
        );

        projects[projectId].verificationStatus = VerificationStatus.IN_PROGRESS;
        projects[projectId].verificationStartedAt = block.timestamp;

        emit VerificationStatusUpdated(
            projectId,
            VerificationStatus.IN_PROGRESS,
            msg.sender
        );
    }

    /**
     * Submit verification report
     * Only assigned officers can submit reports
     */
    function submitVerificationReport(
        uint256 projectId,
        uint256 area,
        uint256 plots,
        uint256 uavFlights,
        uint256 biomass,
        uint256 uncertainty,
        uint256 creditsRecommended,
        bool siteInspection,
        bool documentationVerified,
        bool measurementsValidated,
        bool qualityAssurance,
        string memory additionalNotes
    ) external {
        require(hasRole(OFFICER_ROLE, msg.sender), "NOT_OFFICER");
        require(projects[projectId].isActive, "PROJECT_NOT_ACTIVE");
        require(
            projects[projectId].assignedOfficer == msg.sender,
            "NOT_ASSIGNED_OFFICER"
        );
        require(
            projects[projectId].verificationStatus ==
                VerificationStatus.IN_PROGRESS,
            "VERIFICATION_NOT_IN_PROGRESS"
        );
        require(area > 0, "AREA_MUST_BE_POSITIVE");
        require(plots > 0, "PLOTS_MUST_BE_POSITIVE");
        require(uavFlights > 0, "UAV_FLIGHTS_MUST_BE_POSITIVE");
        require(biomass > 0, "BIOMASS_MUST_BE_POSITIVE");
        require(uncertainty <= 100, "UNCERTAINTY_MUST_BE_0_TO_100");
        require(creditsRecommended > 0, "CREDITS_MUST_BE_POSITIVE");

        verificationReportCount++;
        uint256 reportId = verificationReportCount;

        VerificationReport memory newReport = VerificationReport({
            projectId: projectId,
            officerAddress: msg.sender,
            area: area,
            plots: plots,
            uavFlights: uavFlights,
            biomass: biomass,
            uncertainty: uncertainty,
            creditsRecommended: creditsRecommended,
            siteInspection: siteInspection,
            documentationVerified: documentationVerified,
            measurementsValidated: measurementsValidated,
            qualityAssurance: qualityAssurance,
            additionalNotes: additionalNotes,
            submittedAt: block.timestamp,
            isApproved: false,
            approvedBy: address(0),
            approvedAt: 0
        });

        verificationReports[reportId] = newReport;
        projectToReportId[projectId] = reportId;

        // Update project status to approved (assuming auto-approval for now)
        projects[projectId].verificationStatus = VerificationStatus.APPROVED;
        projects[projectId].verificationCompletedAt = block.timestamp;

        emit VerificationReportSubmitted(
            projectId,
            reportId,
            msg.sender,
            creditsRecommended
        );
        emit VerificationStatusUpdated(
            projectId,
            VerificationStatus.APPROVED,
            msg.sender
        );
    }

    /**
     * Approve verification report (admin function)
     */
    function approveVerificationReport(
        uint256 projectId
    ) external onlyRole(ADMIN_ROLE) {
        require(projects[projectId].isActive, "PROJECT_NOT_ACTIVE");
        uint256 reportId = projectToReportId[projectId];
        require(reportId > 0, "NO_REPORT_FOUND");
        require(
            !verificationReports[reportId].isApproved,
            "REPORT_ALREADY_APPROVED"
        );

        verificationReports[reportId].isApproved = true;
        verificationReports[reportId].approvedBy = msg.sender;
        verificationReports[reportId].approvedAt = block.timestamp;

        projects[projectId].verificationStatus = VerificationStatus.APPROVED;
        projects[projectId].verificationCompletedAt = block.timestamp;

        emit VerificationReportApproved(projectId, reportId, msg.sender);
        emit VerificationStatusUpdated(
            projectId,
            VerificationStatus.APPROVED,
            msg.sender
        );
    }

    /**
     * Reject verification report (admin function)
     */
    function rejectVerificationReport(
        uint256 projectId
    ) external onlyRole(ADMIN_ROLE) {
        require(projects[projectId].isActive, "PROJECT_NOT_ACTIVE");
        uint256 reportId = projectToReportId[projectId];
        require(reportId > 0, "NO_REPORT_FOUND");

        projects[projectId].verificationStatus = VerificationStatus.REJECTED;
        projects[projectId].verificationCompletedAt = block.timestamp;

        emit VerificationStatusUpdated(
            projectId,
            VerificationStatus.REJECTED,
            msg.sender
        );
    }

    /**
     * Get verification report by project ID
     */
    function getVerificationReport(
        uint256 projectId
    ) external view returns (VerificationReport memory) {
        uint256 reportId = projectToReportId[projectId];
        require(reportId > 0, "NO_REPORT_FOUND");
        return verificationReports[reportId];
    }

    /**
     * Get verification report by report ID
     */
    function getVerificationReportById(
        uint256 reportId
    ) external view returns (VerificationReport memory) {
        require(
            reportId > 0 && reportId <= verificationReportCount,
            "REPORT_NOT_FOUND"
        );
        return verificationReports[reportId];
    }

    /**
     * Get total number of verification reports
     */
    function getVerificationReportCount() external view returns (uint256) {
        return verificationReportCount;
    }

    /**
     * Approve a report (by IPFS CID) and mint tokens to an officer or directly to a user.
     * Prevents double‑mint for the same CID via reportKey lock.
     */
    function approveAndMint(
        string calldata cid,
        address recipient,
        uint256 amount,
        address submitter
    ) external onlyRole(ADMIN_ROLE) returns (bytes32 reportKey) {
        require(!paused, "CONTRACT_PAUSED");
        require(recipient != address(0), "BAD_RECIPIENT");
        require(amount > 0, "ZERO_AMOUNT");
        reportKey = keccak256(abi.encodePacked(cid));
        ReportApproval storage ra = approvals[reportKey];
        require(!ra.minted, "REPORT_ALREADY_MINTED");

        // Record approval
        ra.submitter = submitter;
        ra.cid = cid;
        ra.recipient = recipient;
        ra.approvedAmount = amount;
        ra.approvedAt = uint64(block.timestamp);
        ra.minted = true;

        _mint(recipient, amount);
        emit ReportApprovedAndMinted(reportKey, recipient, amount, cid);
    }

    /**
     * Admin may burn own balance (supply reduction) or claw back from any address if your
     * program rules require it (disclose clearly to users!).
     */
    function adminBurn(uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(!paused, "CONTRACT_PAUSED");
        _burn(_msgSender(), amount);
    }

    function adminBurnFrom(
        address from,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) {
        require(!paused, "CONTRACT_PAUSED");
        _burn(from, amount);
    }

    /**
     * Optional convenience: move admin‑held tokens to an officer.
     * (You can also mint directly to the officer in approveAndMint.)
     */
    function adminTransferToOfficer(
        address officer,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) {
        require(!paused, "CONTRACT_PAUSED");
        require(hasRole(OFFICER_ROLE, officer), "NOT_OFFICER");
        _transfer(_msgSender(), officer, amount);
    }

    // ——— ERC‑20 hooks to enforce transfer policy + maintain ledger ———
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        require(!paused, "CONTRACT_PAUSED");

        if (from != address(0) && to != address(0)) {
            bool fromAdmin = hasRole(ADMIN_ROLE, from);
            bool fromOfficer = hasRole(OFFICER_ROLE, from);
            // Only admin or officer can send tokens
            require(fromAdmin || fromOfficer, "TRANSFER_DENIED");
            // Officers may only distribute to end‑users (not to admin/officers)
            if (fromOfficer) {
                require(
                    !hasRole(ADMIN_ROLE, to) && !hasRole(OFFICER_ROLE, to),
                    "OFFICER_TO_ADMIN_OR_OFFICER_FORBIDDEN"
                );
            }
        }

        super._update(from, to, value);

        // Update ledger after transfer
        if (from == address(0)) {
            // Mint
            mintedCumulative += value;
            if (hasRole(OFFICER_ROLE, to)) {
                officerReceived[to] += value;
            }
        } else if (to == address(0)) {
            // Burn
            burnedCumulative += value;
        } else {
            // Transfer
            if (hasRole(ADMIN_ROLE, from) && hasRole(OFFICER_ROLE, to)) {
                officerReceived[to] += value; // admin → officer top‑up
            } else if (
                hasRole(OFFICER_ROLE, from) &&
                !hasRole(ADMIN_ROLE, to) &&
                !hasRole(OFFICER_ROLE, to)
            ) {
                officerDistributed[from] += value;
                userReceived[to] += value;
                emit OfficerDistributed(from, to, value);
            }
        }
    }

    // ——— ERC‑20 config ———
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}
