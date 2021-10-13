import MOI from '../abis/MoibitStorage.json'
import React, {useEffect, useState} from 'react';
import Web3 from 'web3'
import './App.css';
import Login from './Login/Login'
import Upload from './Home/Upload/Upload'
import Search from './Home/Search/Search'
import axios from 'axios'

const App = () => {

  const [account, setAccount] = useState();
  const [aadhar, setAadhar] = useState(null);
  const [moi, setMoi] = useState({});
  const [active, setActive] = useState(false);
  const [authToken, setAuthToken] = useState({
    nonce: '1633953052249',
    signature: '0x8d5480f6e11896cbca71fe6fceb4e333a3171503d24b89bf4b6021c3e61a839e5f04479e933990c93e43a9ecfc46b6469ee5d5f6769c14e07cb73f289591df321b',
    id: '0x9035E064dF4E35863cD3658512D450dF9c6c7F5E'
  });
  const [file, setFile] = useState({
    name: 'Select a file...',
    aadharNumber: null
  });

  useEffect(()=> {
    getWeb3()
  },[])

  useEffect(()=> {
    getBlockChain()
  },[account])

  const getWeb3 = async() => {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      console.log("ethereum...")
    }
    else if (window.web3)
    {
      window.web3 = new Web3(window.web3.currentProvider)
      console.log("web3...")
    }
    else {
      console.log("CAN NOT CONNECT....")
    }
  }

  const getBlockChain = async() => {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])
    const netId = await web3.eth.net.getId()
    /* Each network details are stored in their respective network id*/
    const netData = MOI.networks[netId]
    if(netData)
    { 
      const moi = new web3.eth.Contract(MOI.abi,netData.address)
      setMoi(moi)
    }
    else {
      window.alert(`The Moi contract isn't available in the network`)
    }
  }

  const fileUpload = async (data, fileName) => {
    console.log('Uploading files...')
    
    var options = {
      method: 'POST', 
      url: 'https://api.moinet.io/moibit/v1/writetexttofile',
      headers:{
        "Content-Type": "multipart/form-data" ,
        'nonce': authToken.nonce,
        'signature': authToken.signature,
        'id': authToken.id,
        'networkID': '12D3KooWSMAGyrB9TG45AAWaQNJmMdfJpnLQ5e1XM21hkm3FokHk',
      },
      data: {
        filename: fileName,
        text: data
      }
    }

    try{
      const {data} = await axios.request(options)
      console.log(data.meta.message)
      const res = JSON.parse(data.data[0])

      console.log('Adding File to the blockchain...')
      moi.methods.addingNewFile(file.name, res[0].hash, res[0].version, file.aadharNumber).send({from: account}).on('transactionHash', () => {
        setFile({name: 'Select a file...', aadharNumber: null})
        console.log("file(s) uploaded successfully to blockchain")
      })
    } catch (error){
      console.log(error)
    }
  }

  return (
    <div className="font-poppins ">
      {/* <Login authToken={authToken} setAuthToken={setAuthToken}/> */}
      <Upload file={file} setFile={setFile} active={active} setActive={setActive} fileUpload={fileUpload}/>
      <Search moi={moi} aadhar={aadhar} setAadhar={setAadhar} authToken={authToken}/>
    </div>
  );
}

export default App;
