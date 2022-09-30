// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "./ERC721Royalty.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RoyaltyNFT is ERC721Royalty, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _currentTokenId;

    struct SaleInfo {
        uint256 salePrice;
        bool onSale;
    }

    uint256 _defaultSalePrice = 1_000000000; // 1 GWei 

    // Mapping from token ID to sale info
    mapping(uint256 => SaleInfo) public saleInfos;

    constructor(
        string memory name_, 
        string memory symbol_,
        address defaultRoyaltyRecipient_,
        uint96 defualtRoyaltyFraction_
    ) ERC721(name_, symbol_){
        _setDefaultRoyalty(defaultRoyaltyRecipient_, defualtRoyaltyFraction_);
    }

    /// @notice mint a royalty nft and set its royalty info
    /// @param to the recipient of the token
    /// @param royaltyRecipient the recipient of the royalty
    /// @param royaltyFraction 10000 = 100.00
    function mint(
        address to,
        address royaltyRecipient,
        uint96 royaltyFraction
    ) public {
        if ( to == address(0) ) { to = owner(); } // contract owner can mint
        if ( royaltyRecipient == address(0) ) { royaltyRecipient = _defaultRoyaltyInfo.receiver; }
        if ( royaltyFraction == 0 ) { royaltyFraction = _defaultRoyaltyInfo.royaltyFraction; }

        _currentTokenId.increment();
        uint256 newItemId = _currentTokenId.current();
        
        _safeMint(to, newItemId);
        _setTokenRoyalty(newItemId, royaltyRecipient, royaltyFraction);
        
        SaleInfo storage item = saleInfos[newItemId];
        item.onSale = false;
        item.salePrice = _defaultSalePrice;
    }

    /// @notice sender make an nft on sale
    /// @param _tokenId token ID
    /// @param _salePrice sale price
    function sell(uint256 _tokenId, uint256 _salePrice ) public {
        require(_isApprovedOrOwner(msg.sender, _tokenId), "sender is not owner nor aprroved.");
        require(_salePrice > 0, "sale price can not be 0.");

        saleInfos[_tokenId].onSale = true;
        saleInfos[_tokenId].salePrice = _salePrice;
    }

    /// @notice sender buy an nft
    /// @param _tokenId token ID
    function buy(uint256 _tokenId ) public payable {
        require(msg.sender != ERC721.ownerOf(_tokenId), "buyer should not be owner");
        require(saleInfos[_tokenId].onSale, "the token is not on sale");
        require(msg.value == saleInfos[_tokenId].salePrice);

        // cal royalty(for royaltyReciever) and payment(for owner)
        (address royaltyReciever, uint256 royalty) = royaltyInfo(_tokenId, saleInfos[_tokenId].salePrice);
        uint256 payment = msg.value - royalty;

        payable(royaltyReciever).transfer(royalty);
        payable(ERC721.ownerOf(_tokenId)).transfer(payment);

        delete saleInfos[_tokenId];
    }
    
    /// @notice get sale info of an nft
    /// @param _tokenId token ID
    function getSaleInfo(uint256 _tokenId) public view returns (uint256, bool) {
        return (saleInfos[_tokenId].salePrice, saleInfos[_tokenId].onSale);
    }
}