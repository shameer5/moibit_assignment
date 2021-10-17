import React, {useState, useEffect} from 'react'
import SearchBar from './SearchBar'
import { ErrorMessage } from '@hookform/error-message';
import { useForm } from "react-hook-form";
import AES from 'crypto-js/aes'
import axios from 'axios'
import crypto from 'crypto-js'
import Credentials from '../Credentials/Credentials'

const pages = ['aadharPage', 'skPage']
const Search = ({moi, aadhar, setAadhar, account, cookies}) => {
    const { register, handleSubmit, formState: { errors }} = useForm();
    
    const [url, setUrl] = useState()
    const [downloadName, setDownloadName] = useState()
    const [blockDetails, setBlockDetails] = useState({
        response: undefined
    })
    const [activeStep, setActiveStep] = useState(0)
    const [fileDownload, setFileDownload] = useState()

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onSubmit = async (data, e) => {
        e.preventDefault()
        try {
            console.log("decrypting File...")
            const bytes  = AES.decrypt(blockDetails.response.data, data.SK)
            const decryptedFile = convertWordArrayToUint8Array(bytes);
            console.log('successfully decrypted file')
            const owner = await moi.methods.checkOwner(cookies.token.id, aadhar).call()
            console.log(owner)
            if(owner === false)
            {
              console.log('locking file(s) in blockchain')
              moi.methods.lockStudentFile(aadhar, cookies.token.id).send({from: account}).on('transactionHash', () => {
              console.log("file(s) successfully locked in the blockchain")
              var forNow = new Blob([decryptedFile])
              setFileDownload(new Blob([decryptedFile]));
              setUrl(window.URL.createObjectURL(forNow))
              setDownloadName(blockDetails.fileName)
              setActiveStep(pages.length)
            })}
            else{
              console.log('loading file(s)')
              var forNow = new Blob([decryptedFile])
              setFileDownload(new Blob([decryptedFile]));
              setUrl(window.URL.createObjectURL(forNow))
              setDownloadName(blockDetails.fileName)
              setActiveStep(pages.length)
            }
        } catch (error) {
            console.log(error)
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fileSearch = async(aadharNumber) => {
        console.log("Searching for file...")
        try{
          const res = await moi.methods.checkAccess(aadharNumber, cookies.token.id).call()
          console.log(res)
          if(res === false){
            let details = await moi.methods.getStudentFile(aadharNumber).call()
            console.log('file(s) retrieved successfully from blockchain...')
            blockDetails.fileName = details.fileName
            console.log('Searching File in Moibit...')
            var options = {
              method: 'POST', 
              url: 'https://api.moinet.io/moibit/v1/readfile',
              headers:{
                'nonce': Credentials.DEVELOPER_NONCE,
                'signature': Credentials.DEVELOPER_SIGNATURE,
                'id': Credentials.DEVELOPER_ID,
                'networkID': '12D3KooWSMAGyrB9TG45AAWaQNJmMdfJpnLQ5e1XM21hkm3FokHk',
              },
              data: {
                filename: details.fileName,
                version: Number(details.fileVersion)
              }
            }
    
            try{
              setActiveStep(1)
              const response = await axios.request(options)
              setBlockDetails({...blockDetails,
                response: response})
              console.log('file(s) retrieved successfully from Moibit...')
            } catch(error) {
              console.log(error)
            }
          }
          else {
            let details = await moi.methods.getUni(aadharNumber).call()
            blockDetails.uni_name = details
            setActiveStep(pages.length)
          }
        } catch (error){
          console.log(error)
        }
    }

    function convertWordArrayToUint8Array(wordArray) {
        var arrayOfWords = wordArray.hasOwnProperty("words") ? wordArray.words : [];
        var length = wordArray.hasOwnProperty("sigBytes") ? wordArray.sigBytes : arrayOfWords.length * 4;
        var uInt8Array = new Uint8Array(length), index=0, word, i;
        for (i=0; i<length; i++) {
            word = arrayOfWords[i];
            uInt8Array[index++] = word >> 24;
            uInt8Array[index++] = (word >> 16) & 0xff;
            uInt8Array[index++] = (word >> 8) & 0xff;
            uInt8Array[index++] = word & 0xff;
        }
        return uInt8Array;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleUnlock = (data, e) => {
        e.preventDefault()
        fileDownload.aadharNumber = aadhar
        console.log("Submitting file data...")
        console.log(fileDownload)
        const reader = new FileReader()
        reader.readAsArrayBuffer(fileDownload)
        reader.onloadend = ()=>{
            const arrayWord = crypto.lib.WordArray.create(reader.result)
            console.log("encrypting file now")
            const encryptedFile = AES.encrypt(arrayWord, data.SK).toString()
            console.log("successfully encrypted file")
            fileUpload(encryptedFile, blockDetails.fileName)
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        moi.methods.unlockStudentFile(fileName, res[0].hash, res[0].version, aadhar, cookies.token.id).send({from: account}).on('transactionHash', () => {
          console.log("file(s) unlocked & uploaded successfully to blockchain")
          setUrl(undefined)
          window.location.assign("http://localhost:3000/home")
        })
      } catch (error){
        console.log(error)
      }
    }

    useEffect(()=>{
      console.log("checking if session expired")
      if(!cookies.token)
      {
        window.alert('Your sessison has timed out');
        window.location.assign("http://localhost:3000")
      }
      else console.log("session continues")
    },[cookies.token, onSubmit, fileSearch, handleUnlock, fileUpload])

    return (
        <>
        {activeStep === pages.length + 1 ?(
          <>
          <div className={`flex items-center justify-center h-screen gap-3 bg-green-400`}>
            <div className={`flex flex-col w-9/12 max-w-xl mx-2`}>
                <h1 className='text-center text-xl font-semibold'>Encrypt student TC</h1>
                <form onSubmit={handleSubmit(handleUnlock)}  className='flex flex-auto flex-col gap-3 p-2 '>
                  <div className='flex flex-col'>
                      <label className='mb-1 font-semibold text-left'>Secret Key</label>
                      <input type="text" className="truncate outline-none border-2 border-gray-400 rounded-xl p-2 bg-gray-200 focus:ring-2"
                      placeholder='Secret Key...'
                      {...register("SK", {required: true})} />
                      <ErrorMessage errors={errors} name="SK" render={({ message }) => <p className="text-sm text-red-500">{`*${message}`}</p>} />
                  </div>
                  <div className="flex justify-center">
                  <button 
                  className="mt-2 flex-1 rounded-xl p-2 tracking-wider bg-blue-600 active:bg-blue-700 text-white"
                  type="submit">UPLOAD</button>
                  </div>
                </form>  
            </div>
          </div>
          </>
        ) : 
        (activeStep === pages.length ? (
            <div className='flex flex-col h-screen justify-center items-center bg-green-400 gap-3'>
                {downloadName ? (
                    <>
                    <h1 className='text-center text-2xl font-semibold'>{blockDetails.fileName}</h1>
                    <div className='flex flex-col justify-evenly gap-3'>
                    <div className='flex gap-3'>
                      <button className='mt-2 flex rounded-xl p-2 tracking-widest bg-blue-700 active:bg-blue-800 text-white gap-3'>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <a href={url} download={downloadName} className='font-semibold'>DOWNLOAD FILE</a></button>

                      <button className='mt-2 flex rounded-xl p-2 tracking-widest bg-red-600 active:bg-red-700 text-white gap-3'
                      onClick={() => {setActiveStep(pages.length+1)}}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                      </svg>UNLOCK FILE</button>
                      </div>
                      <button className='mt-2 justify-center items-center flex rounded-xl p-2 tracking-widest bg-black active:bg-gray-900 text-white gap-3'
                      onClick={() => {window.location.assign("http://localhost:3000/home")}}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.707 4.879A3 3 0 018.828 4H15a3 3 0 013 3v6a3 3 0 01-3 3H8.828a3 3 0 01-2.12-.879l-4.415-4.414a1 1 0 010-1.414l4.414-4.414zm4 2.414a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z" clipRule="evenodd" />
                      </svg>RETURN TO SEARCH</button>
                    </div>
                    </>):
                (blockDetails.uni_name && (
                  <div className='flex flex-col jusitfy-center itmes-center gap-3'>
                    <div>
                      <h1 className='font-semibold text-3xl text-center'>This file is locked by</h1>
                      <h1 className='font-bold text-4xl text-center'>{`${blockDetails.uni_name}`}</h1>
                    </div>
                    <button className='mt-2 justify-center items-center flex rounded-xl p-2 tracking-widest bg-red-600 active:bg-red-700 text-white gap-3'
                    onClick={() => {window.location.assign("http://localhost:3000/home")}}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.707 4.879A3 3 0 018.828 4H15a3 3 0 013 3v6a3 3 0 01-3 3H8.828a3 3 0 01-2.12-.879l-4.415-4.414a1 1 0 010-1.414l4.414-4.414zm4 2.414a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z" clipRule="evenodd" />
                    </svg>RETURN TO SEARCH</button>
                </div>))}
            </div>) :
            (activeStep < pages.length && activeStep === 0  ? (
            <div className='flex flex-col h-screen justify-center items-center bg-green-400 gap-3'>
                <h1 className='text-center text-xl font-semibold'>Search for students TC in moibit</h1>
                <SearchBar fileSearch={fileSearch} aadhar={aadhar} setAadhar={setAadhar}/>
            </div>) :
            ( blockDetails.response ? 
            (<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col h-screen justify-center items-center bg-green-400 gap-3'>
                <h1 className='text-center text-xl font-semibold'>Enter the secret key to access the file</h1>
                <div className="flex items-center justify-center mx-5">
                    <input type='text' placeholder='Secret Key...' className='outline-none max-w-xl rounded-l-xl border-2 border-blue-600 p-2'
                    {...register("SK", {required: true})} />
                    <button className="outline-none tracking-wider border-2 rounded-r-xl p-2 border-blue-700 bg-blue-700 active:bg-blue-800 active:border-blue-700 text-white"
                    type="submit">submit</button>
                </div>
                <ErrorMessage errors={errors} name="SK" render={({ message }) => <p className="mx-5 text-sm text-red-500">{`*${message}`}</p>} />
            </form>) : (
            <div className='flex h-screen justify-center items-center bg-green-400'>
                <svg className="animate-spin ml-1 mr-3 h-10 w-10 text-new-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
            )
            )
        ))}
        </>
    )
}
export default Search
