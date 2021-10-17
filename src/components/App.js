import MOI from '../abis/MoibitStorage.json'
import React, {useEffect, useState} from 'react';
import Web3 from 'web3'
import './App.css';
import Login from './Login/Login'
import Upload from './Home/Upload/Upload'
import Search from './Home/Search/Search'
import axios from 'axios'
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useCookies } from "react-cookie";
import Time from './Time';
import Credentials from './Home/Credentials/Credentials';

const App = () => {

  const [cookies, setCookie] = useCookies(["token"]);
  const [account, setAccount] = useState();
  const [aadhar, setAadhar] = useState(null);
  const [moi, setMoi] = useState({});
  const [active, setActive] = useState(false);
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

  useEffect(()=> {
    console.log('updated cookies')
  },[cookies.token])

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
        'nonce': Credentials.DEVELOPER_NONCE,
        'signature': Credentials.DEVELOPER_SIGNATURE,
        'id': Credentials.DEVELOPER_ID,
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
      moi.methods.addingNewFile(file.name, res[0].hash, res[0].version, file.aadharNumber, cookies.token.id).send({from: account}).on('transactionHash', () => {
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
            {cookies.token ? (cookies.token.page === true ? (cookies.token ? <Upload file={file} setFile={setFile} active={active} setActive={setActive} fileUpload={fileUpload} cookies={cookies}/> : <Time />) :
            (cookies.token ? <Search moi={moi} aadhar={aadhar} setAadhar={setAadhar} account={account} cookies={cookies}/>: <Time />)
            ): <Time />}
          </Route>
          <Route path='/'>
            <Login moi={moi} account={account} cookies={cookies} setCookie={setCookie}/>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
