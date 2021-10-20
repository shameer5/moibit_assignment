# Moibit Assignment
## Overview
This dApp requires users to have a moibit account through which they can login to the app. 
Using the Moibit ID a specific user's role is set as school by the deployer of the smart contract. Also using the Moibit ID and their univeristy names, other users can register into the application as the university.

The file uploads of new students into the application can only be done by the users who have their role set as school. Before the file is uploaded into Moibit, the file is enrcypted using **AES encryption** alogrithim and then uploaded to Moibit. On uploading file to Moibit, the file hash, file version and the students who the file belongs to is stored into the blockchain.

The retrieval of student file is done by searching for the student using the aadhar number. After retrieving the details of the file from the blockchain, the file is then retrieved from Moibit and only is accessbile after decrypting the file using the secret key used to encrypt the file.
The file(s) are locked by the user who have the secret key to decrypt the file. If a user tries retrieving a file which is locked, then the application displays by who the file is locked by.

## Tech

This assignment uses a number of open source projects to work properly:

- [MoiBit](https://www.moibit.io/) - A decentralized storage network with reliable infrastructure and APIs
- [ReactJs](https://reactjs.org/) - A JavaScript library for building user interfaces.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework to build any design, directly in your markup.
- [Truffle](https://www.trufflesuite.com/truffle) - A development environment and testing framework for blockchains using the EVM.
- [Ganache](https://www.trufflesuite.com/ganache) - A local blockchain for Ethereum development.
- [Axios](https://axios-http.com/) - Promise based HTTP client for the browser and node.js
- [React Router](https://reactrouter.com/) - a lightweight, fully-featured routing library for the React JavaScript library. 
- [web3.js](https://web3js.readthedocs.io/en/v1.5.2/) - the Ethereum JavaScript API which connects to the Generic JSON-RPC spec.
- [React Cookie](https://github.com/reactivestack/cookies/tree/master/packages/react-cookie/#readme) - Universal cookies for React
- [React Hook Form](https://react-hook-form.com/) - Simple React forms validations

## Running the app
This application uses [node.js](https://nodejs.org/en/) v14.17.1 and download metamask to inject the web3 instance to your browser.
Clone down this repo to your computer, and then follow the steps below:
1. Install the dependencies and devDependencies and start the server.
    ```cmd
    cd moibit_assignment
    npm i
    ```
2. Deploy the smart contracts to your local blockchain (Ganache)
    ```cmd
    truffle migrate
    ```

3. Then set the school role of the application using the moibit ID of user in truffle cosnole
    ```cmd
    truffle console
    ```
    in truffle console:
    ``` cmd
     moi = await MoibitStorage.deployed()
     accounts = await web3.eth.getAccounts()
     owner = accounts[0]
     school = 'ENTER_MOIBIT_ID_OF_ACCOUNT_YOU WANT_AS_SCHOOL'
     changing = await moi.changeSchool(owner, school, {from: owner})
    ```
4. Set the developer information
    in file **_src/components/Credentials/Credentials.js_** enter the details of school's moibit account
    ``` js
    export default {
    DEVELOPER_NONCE: 'MOIBIT_NONCE_OF_SCHOOL',
    DEVELOPER_SIGNATURE: 'MOIBIT_SIGNATURE_OF_SCHOOL',
    DEVELOPER_ID: 'MOIBIT_ID_OF_SCHOOL'
     }
    ```
5. Start the application
    ``` cmd
    npm start
    ```
## Notes
- Only the Moibit account registered as school can upload files of new students and view the upload page of the dApp.
- The other accounts registering as universities into the dApp also require Moibit account in order to use the application. They can only only view the search page and not the upload page of the dApp.
- Universities which wish to unlock a file of specific student need to create a new secret key to encrypt and upload the file to the school's Moibit storage.
