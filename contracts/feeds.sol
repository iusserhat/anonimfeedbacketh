// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AnonymousFeedback {
    struct Message {
        uint256 id;
        string content;
        uint256 timestamp;
    }

    address public admin;
    Message[] private messages;
    uint256 private nextId;

    event NewMessage(uint256 id, uint256 timestamp);

    constructor() {
        admin = msg.sender;
    }

    function sendMessage(string memory _content) public {
        messages.push(Message(nextId, _content, block.timestamp));
        emit NewMessage(nextId, block.timestamp);
        nextId++;
    }

    function getMessages() public view returns (Message[] memory) {
        return messages;
    }
}