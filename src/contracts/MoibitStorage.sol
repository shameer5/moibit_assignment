pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

contract MoibitStorage{

    struct student{
        string fileName;
        string fileHash;
        uint fileVersion;
        bool lock;
        string current_owner;
    }

    mapping(uint => student) public students;
    mapping(address => string) public uniName;
    address private _school;

    event fileAdded(string fileName, uint aadharNumber);
    event fileUnlocked(uint aadharNumber);
    event fileLocked(uint aadharNumber);
    event addedUni(string UniName);
    event newSchool(address _school);

    constructor() public{
        _school = msg.sender;
    }

    function addingNewFile(string memory _fileName, string memory _fileHash, uint _fileVersion, uint _aadharNumber, address currentUser) public onlySchool(currentUser){
        require(msg.sender != address(0), 'address not available...');
        require(bytes(_fileHash).length > 0, 'Hash of file is required...');
        require(bytes(_fileName).length > 0, 'Name of file is required...');
        require(_aadharNumber > 0, 'Aadhar number of student is required...');
        students[_aadharNumber] = student(_fileName, _fileHash, _fileVersion, false, '');
        emit fileAdded(_fileName, _aadharNumber);
    }

    function changeSchool(address currentUser, address newUser) public onlySchool(currentUser){
        _school = newUser;
        emit newSchool(_school);
    }

    function whichPage(address user) public view returns(bool){
        if(user == _school)
        {
            return true;
        }
        return false;
    }

    modifier onlyOwner(string memory _uniName, address currentUser){
        require(keccak256(abi.encodePacked(uniName[currentUser])) == keccak256(abi.encodePacked(_uniName)), "You don't own the file ");
        _;
    }

    modifier onlySchool(address currentUser)
    {
        require(_school == currentUser, "You don't have the rights to this function");
        _;
    }

    function setOrNot(address _user) public view returns(bool){
        string memory _uniName = uniName[_user];
        if(bytes(_uniName).length > 0){
            return true;
        } else if(_school == _user){
            return true;
        }
        return false;
    }

    function setCollege(string memory _uniName, address user) public {
        require(bytes(_uniName).length > 0, "University name is empty");
        require(bytes(uniName[user]).length <= 0 , "University name already exists");
        uniName[user] = _uniName;
        emit addedUni(uniName[user]);
    }
    
    function checkAccess(uint _aadharNumber, address _user) public view returns(bool){
        //checks if the uni exists in the list or not
        require(bytes(uniName[_user]).length > 0 , "University doesn't exist");
        //checks if the student searching for exists or not 
        require(bytes(students[_aadharNumber].fileName).length > 0, "Student doesn't exist");

        if(keccak256(abi.encodePacked(students[_aadharNumber].current_owner)) == keccak256(abi.encodePacked(uniName[_user]))){
            return false;
        }
        else if(students[_aadharNumber].lock == false){
            return false;
        }
        else return true;
    } 

    function getStudentFile(uint _aadharNumber) public view returns(student memory studentFile){
        return students[_aadharNumber];
    }

    function getUni(uint _aadharNumber) public view returns(string memory uni){
        return students[_aadharNumber].current_owner;
    }

    function checkOwner(address _user, uint _aadharNumber) public view returns(bool){
        if(keccak256(abi.encodePacked(students[_aadharNumber].current_owner)) == keccak256(abi.encodePacked(uniName[_user]))){
            return true;
        }
        return false;
    }

    function lockStudentFile(uint _aadharNumber, address user) public {
        require(students[_aadharNumber].lock == false, 'File is already locked...');
        require(bytes(students[_aadharNumber].current_owner).length <= 0, 'File is locked by someone else still...');
        students[_aadharNumber].lock = true;
        students[_aadharNumber].current_owner = uniName[user];
        emit fileLocked(_aadharNumber);
    }

    function unlockStudentFile(string memory _fileName, string memory _fileHash, uint _fileVersion, uint _aadharNumber, address currentUser) public onlyOwner(students[_aadharNumber].current_owner, currentUser){
        students[_aadharNumber].lock = false;
        students[_aadharNumber].current_owner = '';
        updateStudentFile(_fileName, _fileHash, _fileVersion, _aadharNumber);
        emit fileUnlocked(_aadharNumber);
    }

    function updateStudentFile(string memory _fileName, string memory _fileHash, uint _fileVersion, uint _aadharNumber) internal {
        require(msg.sender != address(0), 'address not available...');
        require(bytes(_fileHash).length > 0, 'Hash of file is required...');
        require(bytes(_fileName).length > 0, 'Name of file is required...');
        require(_aadharNumber > 0, 'Aadhar number of student is required...');
        students[_aadharNumber] = student(_fileName, _fileHash, _fileVersion, false, '');
        emit fileAdded(_fileName, _aadharNumber);
    }
}