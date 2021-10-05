pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

contract MoibitStorage{

    struct student{
        string fileName;
        string fileHash;
        bool lock;
        string current_owner;
    }

    mapping(uint => student) public students;
    mapping(address => string) public uniName;

    event fileAdded(string fileName, uint aadharNumber);
    event fileUnlocked(uint aadharNumber);
    event fileLocked(uint aadharNumber);

    function addingNewFile(string memory _fileName, string memory _fileHash, uint _aadharNumber) public {
        require(msg.sender != address(0), 'address is available...');
        require(bytes(_fileHash).length > 0, 'Hash of file is required...');
        require(bytes(_fileName).length > 0, 'Name of file is required...');
        require(_aadharNumber > 0, 'Aadhar number of student is required...');
        students[_aadharNumber] = student(_fileName, _fileHash, false, '');
        emit fileAdded(_fileName, _aadharNumber);
    }

    modifier onlyOwner(string memory _uniName){
        require(keccak256(abi.encodePacked(uniName[msg.sender])) == keccak256(abi.encodePacked(_uniName)), "You don't own the file ");
        _;
    }

    function setCollege(string memory _uniName) public {
        uniName[msg.sender] = _uniName;
    }
    
    function intialView(uint _aadharNumber) public view returns(string memory access){
        if(students[_aadharNumber].lock != false){
            return students[_aadharNumber].current_owner;
        }
        else{
            _getStudentFile(_aadharNumber);
        }
    } 

    function _getStudentFile(uint _aadharNumber) internal view returns(student memory studentFile){
        return students[_aadharNumber];
    }

    function lockStudentFile(uint _aadharNumber) public {
        require(students[_aadharNumber].lock == false, 'File is already locked...');
        require(keccak256(abi.encodePacked(uniName[msg.sender])) == keccak256(abi.encodePacked('')), 'File is locked by someone else still...');
        students[_aadharNumber].lock = true;
        students[_aadharNumber].current_owner = uniName[msg.sender];
        emit fileLocked(_aadharNumber);
    }

    function unlockStudentFile(uint _aadharNumber) public onlyOwner(students[_aadharNumber].current_owner){
        students[_aadharNumber].lock = false;
        students[_aadharNumber].current_owner = '';
        emit fileUnlocked(_aadharNumber);
    }
}