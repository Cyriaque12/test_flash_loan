pragma solidity = 0.5.16;

interface IMyContract {
    function setValue(uint _value) external;
}


contract MyCaller {
    uint public value;
    address myContract;

    constructor() public {
        value = 0;
    }

    function setContractAdress(address _myContract) external {
        myContract = _myContract;
    }

    function callSetValue(uint _value) external {
        IMyContract(myContract).setValue(_value);
    }

}
