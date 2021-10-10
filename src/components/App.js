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
  const [moi, setMoi] = useState({});
  const [active, setActive] = useState(false);
  const [authToken, setAuthToken] = useState({
    nonce: '1633678408693',
    signature: '0x0eceb2937e96447dcaa633c55b81e28ececaef7258f4920e8b6deeb3647e64753a74f86d7fdb0fee3a7d0aecd48f2d288225c3dc1693071378ffdff093f5c85e1b',
    id: '0x3EbA123383E7f865E32623CfC30671de1d7068D3'
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

  const fileUpload = async (data) => {
    console.log('Uploading files...')
    
    var options = {
      method: 'POST', 
      url: 'https://api.moinet.io/moibit/v1/writefile',
      headers:{
        "Content-Type": "multipart/form-data" ,
        'nonce': authToken.nonce,
        'signature': authToken.signature,
        'id': authToken.id,
        'networkID': '12D3KooWSMAGyrB9TG45AAWaQNJmMdfJpnLQ5e1XM21hkm3FokHk',
      },
      data: data
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

  /* const fileSearch = async() => {
    try{
      const two = await moi.methods.checkAccess(file.aadharNumber).call()
      console.log(two)
      if(two === false){
        let details = await moi.methods.getStudentFile(file.aadharNumber).call()
        console.log(details)
      }
      else {
        console.log("FILE IS LOCKED SOMEHOW!!!")
      }
    } catch (error){
      console.log(error)
    }
  } */

  return (
    <div className="font-poppins">
      {/* <Login authToken={authToken} setAuthToken={setAuthToken}/> */}
      <Upload file={file} setFile={setFile} active={active} setActive={setActive} fileUpload={fileUpload}/>
    </div>
  );
}

export default App;
