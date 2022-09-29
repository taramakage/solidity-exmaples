// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

import "./ERC4907.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RentableNFT is ERC4907, Ownable
{
    using Counters for Counters.Counter;
    Counters.Counter private currentTokenId;

    uint256 public baseAmount = 20000000000000; //0.00002 ethers

    struct RentableInfo {
        bool rentable;
        uint256 amountPerMinute;
    }
    
    // tokenId => rentableInfo
    mapping(uint256 => RentableInfo) public rentableInfos;

    event Lease(uint256 indexed tokenId, uint256 indexed feePerMinute, bool indexed rentable);

    constructor(string memory _name, string memory _symbol) 
        ERC4907(_name, _symbol)
    {}

    /// @notice only contract owner can mint
    function mint(address to) public onlyOwner
    {
        if (to == address(0)) { to = owner(); }

        currentTokenId.increment();
        uint256 newItemId = currentTokenId.current();
        _safeMint(to, newItemId);
        rentableInfos[newItemId] = RentableInfo(
        {
            rentable: false,
            amountPerMinute: baseAmount
        });
    }

    /// @notice owner or sender approved can lease the nft
    function lease(uint256 _tokenId, uint64 _feePerMinute, bool _rentable) public {
        require(_isApprovedOrOwner(_msgSender(), _tokenId), "Caller is not token owner nor approved");
        require(userOf(_tokenId) == address(0), "Already rented"); 
        // approve contract address, in that we want contract to set user
        approve(address(this), _tokenId);
        setRentable(_tokenId, _rentable);
        setRentFee(_tokenId, _feePerMinute);

        emit Lease(_tokenId, _feePerMinute, _rentable);
    }

    /// @notice sender rents an nft
    /// 
    function rent(uint256 _tokenId, uint64 _expires) public payable virtual {
        uint256 dueAmount = rentableInfos[_tokenId].amountPerMinute * _expires;
        require(msg.value >= dueAmount, "Uncorrect amount");
        require(userOf(_tokenId) == address(0), "Already rented");
        require(rentableInfos[_tokenId].rentable, "Renting disabled for the NFT");
        payable(ownerOf(_tokenId)).transfer(dueAmount);

        UserInfo storage info = _users[_tokenId];
        info.user = msg.sender;
        info.expires = block.timestamp + (_expires * 60);
        
        this.setUser(_tokenId, info.user, uint64(info.expires));
    }

    function setRentFee(uint256 _tokenId, uint256 _amountPerMinute) public {
        require(_isApprovedOrOwner(_msgSender(), _tokenId), "Caller is not token owner nor approved");
        rentableInfos[_tokenId].amountPerMinute = _amountPerMinute;
    }

    function setRentable(uint256 _tokenId, bool _rentable) public {
        require(_isApprovedOrOwner(_msgSender(), _tokenId), "Caller is not token owner nor approved");
        rentableInfos[_tokenId].rentable = _rentable;
    }
}
