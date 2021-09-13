pragma solidity = 0.5.16;


contract MyContract {
    uint public value;

    constructor() public {
        value = 0;
    }

    function setValue(uint _value) external {
         value = _value;
    }

}
