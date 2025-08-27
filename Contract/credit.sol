// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Seacred Blue Carbon – Tokenized Credits + MRV Registry (v2)
 *
 * What’s new vs v1
 * - Adds OFFICER role and explicit report workflow (Submit → OfficerReview → AdminApprove/Mint)
 * - Tracks cumulative minted & retired (separate from current totalSupply)
 * - Per‑project/vintage ERC‑1155 classes; optional non‑transferable
 * - IPFS CIDs for reports, evidence, and calculation bundles
 * - Distribution helper for officers (requires setApprovalForAll)
 *
 * NOTE: Imports are OpenZeppelin 4.9‑style; adjust if you’re on OZ 5.x.
 */

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SeacredCredit is ERC1155, ERC1155Supply, AccessControl, Pausable {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    struct CreditClass {
        bytes32 projectId; // project key (keccak of fieldRef+vintage)
        uint16 vintage; // e.g., 2025
        address beneficiary; // optional default beneficiary
        string dataURI; // IPFS/HTTPS JSON describing class
        bool transferable; // false → soulbound‑like (no wallet‑to‑wallet transfer)
        uint8 unitDecimals; // display scaling: 0..18 (1 unit = 10^−d tCO2e)
        bool exists;
    }

    mapping(uint256 => CreditClass) private _classes; // tokenId → class

    // Cumulative counters (do NOT decrease on burn; for audit)
    mapping(uint256 => uint256) public mintedCumulative; // tokenId → total minted over lifetime
    mapping(uint256 => uint256) public retiredCumulative; // tokenId → total retired via retire()

    string private _baseURI;

    event ClassCreated(
        uint256 indexed tokenId,
        bytes32 indexed projectId,
        uint16 vintage,
        bool transferable,
        uint8 unitDecimals,
        string dataURI
    );
    event ClassUpdated(
        uint256 indexed tokenId,
        address beneficiary,
        bool transferable,
        string dataURI
    );
    event Retired(
        address indexed account,
        uint256 indexed tokenId,
        uint256 amount,
        string reason,
        string evidenceURI
    );

    constructor(string memory baseURI_, address admin) ERC1155("") {
        _baseURI = baseURI_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    // —— Class management ——
    function computeTokenId(
        bytes32 projectId,
        uint16 vintage
    ) public pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(projectId, vintage)));
    }

    function createClass(
        bytes32 projectId,
        uint16 vintage,
        address beneficiary,
        string calldata dataURI,
        bool transferable,
        uint8 unitDecimals
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256 tokenId) {
        tokenId = computeTokenId(projectId, vintage);
        require(!_classes[tokenId].exists, "CLASS_EXISTS");
        _classes[tokenId] = CreditClass({
            projectId: projectId,
            vintage: vintage,
            beneficiary: beneficiary,
            dataURI: dataURI,
            transferable: transferable,
            unitDecimals: unitDecimals,
            exists: true
        });
        emit ClassCreated(
            tokenId,
            projectId,
            vintage,
            transferable,
            unitDecimals,
            dataURI
        );
    }

    function updateClass(
        uint256 tokenId,
        address beneficiary,
        bool transferable,
        string calldata dataURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_classes[tokenId].exists, "NO_CLASS");
        _classes[tokenId].beneficiary = beneficiary;
        _classes[tokenId].transferable = transferable;
        _classes[tokenId].dataURI = dataURI;
        emit ClassUpdated(tokenId, beneficiary, transferable, dataURI);
    }

    // —— Mint & burn ——
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external onlyRole(MINTER_ROLE) {
        require(_classes[id].exists, "NO_CLASS");
        mintedCumulative[id] += amount;
        _mint(to, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external onlyRole(MINTER_ROLE) {
        for (uint256 i = 0; i < ids.length; i++) {
            require(_classes[ids[i]].exists, "NO_CLASS");
            mintedCumulative[ids[i]] += amounts[i];
        }
        _mintBatch(to, ids, amounts, data);
    }

    // Retirement = burn with reason + evidence
    function retire(
        uint256 id,
        uint256 amount,
        string calldata reason,
        string calldata evidenceURI
    ) external {
        _burn(_msgSender(), id, amount);
        retiredCumulative[id] += amount;
        emit Retired(_msgSender(), id, amount, reason, evidenceURI);
    }

    // —— Admin ops ——
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function setBaseURI(
        string calldata newBase
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseURI = newBase;
    }

    // —— Views ——
    function classInfo(
        uint256 tokenId
    ) external view returns (CreditClass memory) {
        return _classes[tokenId];
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory cid = _classes[tokenId].dataURI;
        if (bytes(cid).length > 0) return cid; // per‑class URI dominates
        return
            string(abi.encodePacked(_baseURI, _toHexString(tokenId), ".json"));
    }

    function _toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp >>= 4;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint8(value & 0xf)));
            if (uint8(value & 0xf) > 9) {
                buffer[digits] = bytes1(uint8(87 + uint8(value & 0xf)));
            }
            value >>= 4;
        }
        return string(buffer);
    }

    // —— Hooks & overrides ——
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) whenNotPaused {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
        // Enforce non‑transferability (allow mints (from=0) and burns (to=0))
        if (from != address(0) && to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                if (!classTransferable(ids[i])) revert("NON_TRANSFERABLE");
            }
        }
    }

    function classTransferable(uint256 id) public view returns (bool) {
        return _classes[id].transferable;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

// ————————————————————————————————————————————————————————————————————————
// Registry: MRV + Roles (Admin, Officer, Verifier) + Issuance ledger
// ————————————————————————————————————————————————————————————————————————

contract SeacredRegistry is AccessControl, Pausable {
    using Counters for Counters.Counter;

    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE"); // can approve issuance & mint
    bytes32 public constant OFFICER_ROLE = keccak256("OFFICER_ROLE"); // receives credits and distributes

    SeacredCredit public immutable token;

    constructor(address token_, address admin) {
        token = SeacredCredit(token_);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    // ——— Data model ———
    struct Project {
        bytes32 projectId; // keccak(fieldRef, vintage)
        address owner; // user wallet
        string fieldRef; // geohash/parcel id
        uint256 areaSqM; // area
        uint16 vintage; // year
        string methodologyURI; // IPFS/HTTPS
        address verifier; // optional assigned verifier
        bool active;
    }

    enum ReportStatus {
        Submitted,
        OfficerApproved,
        RejectedByOfficer,
        AdminApproved,
        RejectedByAdmin,
        Minted
    }

    struct Report {
        bytes32 projectId;
        address submitter; // user
        string reportCID; // IPFS root of structured report bundle
        string evidenceCID; // IPFS: imagery, UAV, photos, raw sheets
        string calcCID; // IPFS JSON: computed estimations
        uint64 submittedAt;
        ReportStatus status;
        address officer;
        string officerComment;
        uint64 officerAt;
        string adminComment;
        uint64 adminAt;
        uint256 approvedAmount; // amount approved for mint (units per token class)
    }

    struct IssuanceRecord {
        bytes32 projectId;
        uint256 tokenId; // ERC‑1155 class id
        uint256 amount; // minted
        address recipient; // officer or user
        string calcCID; // calc snapshot used
        uint64 timestamp;
        uint256 reportIndex; // links to Report
    }

    mapping(bytes32 => Project) public projects; // projectId → Project
    mapping(bytes32 => Report[]) public projectReports; // projectId → Reports
    mapping(bytes32 => IssuanceRecord[]) public issuances; // projectId → Issuance history

    event ProjectRegistered(
        bytes32 indexed projectId,
        address indexed owner,
        string fieldRef,
        uint256 areaSqM,
        uint16 vintage,
        string methodologyURI
    );
    event ProjectUpdated(
        bytes32 indexed projectId,
        address owner,
        bool active,
        string methodologyURI
    );
    event VerifierAssigned(bytes32 indexed projectId, address indexed verifier);

    event ReportSubmitted(
        bytes32 indexed projectId,
        uint256 indexed reportIndex,
        address indexed submitter,
        string reportCID,
        string evidenceCID,
        string calcCID
    );
    event ReportOfficerReviewed(
        bytes32 indexed projectId,
        uint256 indexed reportIndex,
        address indexed officer,
        bool approved,
        string comment
    );
    event ReportAdminReviewed(
        bytes32 indexed projectId,
        uint256 indexed reportIndex,
        bool approved,
        uint256 approvedAmount,
        string comment
    );

    event IssuanceApproved(
        bytes32 indexed projectId,
        uint256 indexed tokenId,
        address indexed to,
        uint256 amount,
        string calcCID,
        uint256 reportIndex
    );
    event Distributed(
        address indexed officer,
        uint256 indexed tokenId,
        address indexed to,
        uint256 amount
    );

    // —— Project lifecycle ——
    function registerProject(
        string calldata fieldRef,
        uint256 areaSqM,
        uint16 vintage,
        string calldata methodologyURI,
        address owner
    )
        external
        whenNotPaused
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (bytes32 projectId)
    {
        projectId = keccak256(abi.encodePacked(fieldRef, vintage));
        require(projects[projectId].owner == address(0), "PROJECT_EXISTS");
        projects[projectId] = Project({
            projectId: projectId,
            owner: owner,
            fieldRef: fieldRef,
            areaSqM: areaSqM,
            vintage: vintage,
            methodologyURI: methodologyURI,
            verifier: address(0),
            active: true
        });
        emit ProjectRegistered(
            projectId,
            owner,
            fieldRef,
            areaSqM,
            vintage,
            methodologyURI
        );
    }

    function updateProject(
        bytes32 projectId,
        address owner,
        bool active,
        string calldata methodologyURI
    ) external whenNotPaused onlyRole(DEFAULT_ADMIN_ROLE) {
        Project storage p = projects[projectId];
        require(p.owner != address(0), "NO_PROJECT");
        p.owner = owner;
        p.active = active;
        p.methodologyURI = methodologyURI;
        emit ProjectUpdated(projectId, owner, active, methodologyURI);
    }

    function assignVerifier(
        bytes32 projectId,
        address verifier
    ) external whenNotPaused onlyRole(DEFAULT_ADMIN_ROLE) {
        Project storage p = projects[projectId];
        require(p.owner != address(0), "NO_PROJECT");
        p.verifier = verifier;
        emit VerifierAssigned(projectId, verifier);
    }

    // —— Reports ——
    function submitReport(
        bytes32 projectId,
        string calldata reportCID,
        string calldata evidenceCID,
        string calldata calcCID
    ) external whenNotPaused returns (uint256 reportIndex) {
        Project storage p = projects[projectId];
        require(p.owner != address(0) && p.active, "NO_PROJECT");
        require(msg.sender == p.owner, "ONLY_OWNER");
        reportIndex = projectReports[projectId].length;
        projectReports[projectId].push(
            Report({
                projectId: projectId,
                submitter: msg.sender,
                reportCID: reportCID,
                evidenceCID: evidenceCID,
                calcCID: calcCID,
                submittedAt: uint64(block.timestamp),
                status: ReportStatus.Submitted,
                officer: address(0),
                officerComment: "",
                officerAt: 0,
                adminComment: "",
                adminAt: 0,
                approvedAmount: 0
            })
        );
        emit ReportSubmitted(
            projectId,
            reportIndex,
            msg.sender,
            reportCID,
            evidenceCID,
            calcCID
        );
    }

    function officerReviewReport(
        bytes32 projectId,
        uint256 reportIndex,
        bool approve,
        string calldata comment
    ) external whenNotPaused onlyRole(OFFICER_ROLE) {
        Report storage r = projectReports[projectId][reportIndex];
        require(r.status == ReportStatus.Submitted, "BAD_STATUS");
        r.officer = msg.sender;
        r.officerComment = comment;
        r.officerAt = uint64(block.timestamp);
        r.status = approve
            ? ReportStatus.OfficerApproved
            : ReportStatus.RejectedByOfficer;
        emit ReportOfficerReviewed(
            projectId,
            reportIndex,
            msg.sender,
            approve,
            comment
        );
    }

    function adminApproveReport(
        bytes32 projectId,
        uint256 reportIndex,
        bool approve,
        uint256 approvedAmount,
        string calldata comment
    ) external whenNotPaused onlyRole(ISSUER_ROLE) {
        Report storage r = projectReports[projectId][reportIndex];
        require(r.status == ReportStatus.OfficerApproved, "NEEDS_OFFICER_OK");
        r.adminComment = comment;
        r.adminAt = uint64(block.timestamp);
        if (!approve) {
            r.status = ReportStatus.RejectedByAdmin;
            emit ReportAdminReviewed(projectId, reportIndex, false, 0, comment);
            return;
        }
        r.status = ReportStatus.AdminApproved;
        r.approvedAmount = approvedAmount;
        emit ReportAdminReviewed(
            projectId,
            reportIndex,
            true,
            approvedAmount,
            comment
        );
    }

    /**
     * Mint credits to an officer (for later distribution) or directly to a user.
     * Requires: Report is AdminApproved. The ERC‑1155 class with (projectId, p.vintage) must exist.
     */
    function mintApproved(
        bytes32 projectId,
        uint256 reportIndex,
        address recipient
    ) external whenNotPaused onlyRole(ISSUER_ROLE) {
        Project memory p = projects[projectId];
        require(p.owner != address(0) && p.active, "NO_PROJECT");
        Report storage r = projectReports[projectId][reportIndex];
        require(r.status == ReportStatus.AdminApproved, "REPORT_NOT_APPROVED");
        require(r.approvedAmount > 0, "NO_AMOUNT");

        uint256 tokenId = token.computeTokenId(projectId, p.vintage);
        token.mint(recipient, tokenId, r.approvedAmount, bytes(""));

        // Record issuance
        issuances[projectId].push(
            IssuanceRecord({
                projectId: projectId,
                tokenId: tokenId,
                amount: r.approvedAmount,
                recipient: recipient,
                calcCID: r.calcCID,
                timestamp: uint64(block.timestamp),
                reportIndex: reportIndex
            })
        );
        r.status = ReportStatus.Minted;
        emit IssuanceApproved(
            projectId,
            tokenId,
            recipient,
            r.approvedAmount,
            r.calcCID,
            reportIndex
        );
    }

    /**
     * Officer distribution helper: requires the officer to have setApprovalForAll(registry, true) on SeacredCredit.
     */
    function distributeFromOfficer(
        uint256 tokenId,
        address fromOfficer,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external whenNotPaused onlyRole(OFFICER_ROLE) {
        require(recipients.length == amounts.length, "LEN_MISMATCH");
        require(msg.sender == fromOfficer, "ONLY_SENDER_OFFICER");
        for (uint256 i = 0; i < recipients.length; i++) {
            token.safeTransferFrom(
                fromOfficer,
                recipients[i],
                tokenId,
                amounts[i],
                bytes("")
            );
            emit Distributed(fromOfficer, tokenId, recipients[i], amounts[i]);
        }
    }

    // —— Admin ops ——
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // —— Views ——
    function getReports(
        bytes32 projectId
    ) external view returns (Report[] memory) {
        return projectReports[projectId];
    }

    function getIssuances(
        bytes32 projectId
    ) external view returns (IssuanceRecord[] memory) {
        return issuances[projectId];
    }
}
