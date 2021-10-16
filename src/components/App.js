import MOI from '../abis/MoibitStorage.json'
import React, {useEffect, useState} from 'react';
import Web3 from 'web3'
import './App.css';
import Login from './Login/Login'
import Upload from './Home/Upload/Upload'
import Search from './Home/Search/Search'
import axios from 'axios'
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

const App = () => {

  const [page, setPage] = useState()
  const [account, setAccount] = useState();
  const [aadhar, setAadhar] = useState(null);
  const [moi, setMoi] = useState({});
  const [active, setActive] = useState(false);
  const [authToken, setAuthToken] = useState({
    nonce: undefined,
    signature: undefined,
    id: undefined
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
      moi.methods.addingNewFile(file.name, res[0].hash, res[0].version, file.aadharNumber, authToken.id).send({from: account}).on('transactionHash', () => {
        setFile({name: 'Select a file...', aadharNumber: null})
        console.log("file(s) uploaded successfully to blockchain")
      })
    } catch (error){
      console.log(error)
    }
  }

  return (
    <div className="font-poppins ">
      <Router>
        <Switch>
          <Route path='/home'>
            {page && page === true ? (<Upload file={file} setFile={setFile} active={active} setActive={setActive} fileUpload={fileUpload}/>) :
            (<Search moi={moi} aadhar={aadhar} setAadhar={setAadhar} authToken={authToken} account={account}/>)}
          </Route>
          <Route path='/'>
            <Login authToken={authToken} setAuthToken={setAuthToken} moi={moi} account={account} setPage={setPage}/>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
