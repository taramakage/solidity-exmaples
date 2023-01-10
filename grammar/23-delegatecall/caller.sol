// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Caller {
    uint public num;
    address public sender;

    // call modifies the Callee state variables.
    function callSetVars(address _addr, uint _num) external payable{
        (bool success, bytes memory data) = _addr.call(
            abi.encodeWithSignature("setVars(uint256)", _num)
        );
    }

    // delegatecall modifies the Caller state variables.
    function delegatecallSetVars(address _addr, uint _num) external payable{
        (bool success, bytes memory data) = _addr.delegatecall(
            abi.encodeWithSignature("setVars(uint256)", _num)
        );
    }
}