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
import "@openzeppelin/contracts/security/Pausable.sol";

contract BlueCarbonAdminTokenRestricted is ERC20, AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE   = DEFAULT_ADMIN_ROLE;
    bytes32 public constant OFFICER_ROLE = keccak256("OFFICER_ROLE");

    uint8 private immutable _decimals;

    // Per‑report issuance bookkeeping keyed by IPFS CID hash
    struct ReportApproval {
        address submitter;       // who uploaded the report (off‑chain portal)
        string cid;              // IPFS CID for the report bundle
        uint256 approvedAmount;  // amount minted for this report
        address recipient;       // officer or user who received the mint
        uint64 approvedAt;
        bool minted;             // prevents double‑mint for the same CID
    }

    // reportKey (keccak256(cid)) => approval
    mapping(bytes32 => ReportApproval) public approvals;

    // Minimal ledger counters (for dashboards)
    uint256 public mintedCumulative;   // total minted over contract lifetime
    uint256 public burnedCumulative;   // total burned over contract lifetime

    // Officer/user distribution stats
    mapping(address => uint256) public officerReceived;     // minted/transferred TO officer from admin
    mapping(address => uint256) public officerDistributed;  // officer → users
    mapping(address => uint256) public userReceived;        // total received by a user from officers

    event OfficerSet(address indexed officer, bool enabled);
    event ReportApprovedAndMinted(bytes32 indexed reportKey, address indexed recipient, uint256 amount, string cid);
    event OfficerDistributed(address indexed officer, address indexed toUser, uint256 amount);

    constructor(string memory name_, string memory symbol_, uint8 decimals_, address admin_)
        ERC20(name_, symbol_)
    {
        _decimals = decimals_;
        _grantRole(ADMIN_ROLE, admin_);
    }

    // ——— Admin controls ———
    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    function setOfficer(address officer, bool enabled) external onlyRole(ADMIN_ROLE) {
        if (enabled) {
            _grantRole(OFFICER_ROLE, officer);
        } else {
            _revokeRole(OFFICER_ROLE, officer);
        }
        emit OfficerSet(officer, enabled);
    }

    /**
     * Approve a report (by IPFS CID) and mint tokens to an officer or directly to a user.
     * Prevents double‑mint for the same CID via reportKey lock.
     */
    function approveAndMint(string calldata cid, address recipient, uint256 amount, address submitter)
        external
        onlyRole(ADMIN_ROLE)
        whenNotPaused
        returns (bytes32 reportKey)
    {
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
    function adminBurn(uint256 amount) external onlyRole(ADMIN_ROLE) whenNotPaused {
        _burn(_msgSender(), amount);
    }

    function adminBurnFrom(address from, uint256 amount) external onlyRole(ADMIN_ROLE) whenNotPaused {
        _burn(from, amount);
    }

    /**
     * Optional convenience: move admin‑held tokens to an officer.
     * (You can also mint directly to the officer in approveAndMint.)
     */
    function adminTransferToOfficer(address officer, uint256 amount) external onlyRole(ADMIN_ROLE) whenNotPaused {
        require(hasRole(OFFICER_ROLE, officer), "NOT_OFFICER");
        _transfer(_msgSender(), officer, amount);
    }

    // ——— ERC‑20 hooks to enforce transfer policy + maintain ledger ———
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
        if (from != address(0) && to != address(0)) {
            bool fromAdmin   = hasRole(ADMIN_ROLE, from);
            bool fromOfficer = hasRole(OFFICER_ROLE, from);
            // Only admin or officer can send tokens
            require(fromAdmin || fromOfficer, "TRANSFER_DENIED");
            // Officers may only distribute to end‑users (not to admin/officers)
            if (fromOfficer) {
                require(!hasRole(ADMIN_ROLE, to) && !hasRole(OFFICER_ROLE, to), "OFFICER_TO_ADMIN_OR_OFFICER_FORBIDDEN");
            }
        }
    }

    function _afterTokenTransfer(address from, address to, uint256 amount) internal override {
        super._afterTokenTransfer(from, to, amount);
        if (from == address(0)) {
            // Mint
            mintedCumulative += amount;
            if (hasRole(OFFICER_ROLE, to)) {
                officerReceived[to] += amount;
            }
        } else if (to == address(0)) {
            // Burn
            burnedCumulative += amount;
        } else {
            // Transfer
            if (hasRole(ADMIN_ROLE, from) && hasRole(OFFICER_ROLE, to)) {
                officerReceived[to] += amount; // admin → officer top‑up
            } else if (hasRole(OFFICER_ROLE, from) && !hasRole(ADMIN_ROLE, to) && !hasRole(OFFICER_ROLE, to)) {
                officerDistributed[from] += amount;
                userReceived[to] += amount;
                emit OfficerDistributed(from, to, amount);
            }
        }
    }

    // ——— ERC‑20 config ———
    function decimals() public view override returns (uint8) { return _decimals; }
}
