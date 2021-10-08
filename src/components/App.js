import MOI from '../abis/MoibitStorage.json'
import React, {useEffect, useState} from 'react';
import Web3 from 'web3'
import './App.css';
import Login from './Login/Login'
import Upload from './Home/Upload'
import axios from 'axios'

const App = () => {

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
      console.log(res[0])
      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
      /* console.log(data[0].hash) */
    } catch (error){
      console.log(error)
    }
  }

  return (
    <div className="font-poppins">
      {/* <Login authToken={authToken} setAuthToken={setAuthToken}/> */}
      <Upload file={file} setFile={setFile} active={active} setActive={setActive} fileUpload={fileUpload}/>
    </div>
  );
}

export default App;
