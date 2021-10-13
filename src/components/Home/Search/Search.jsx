import React, {useState} from 'react'
import SearchBar from './SearchBar'
import { ErrorMessage } from '@hookform/error-message';
import { useForm } from "react-hook-form";
import AES from 'crypto-js/aes'
import axios from 'axios'

const pages = ['aadharPage', 'skPage']
const Search = ({moi, aadhar, setAadhar, authToken}) => {
    const { register, handleSubmit, formState: { errors }} = useForm();
    
    const [url, setUrl] = useState()
    const [downloadName, setDownloadName] = useState()
    const [blockDetails, setBlockDetails] = useState({
        response: undefined
    })
    const [activeStep, setActiveStep] = useState(0)

    const onSubmit = (data, e) => {
        e.preventDefault()
        try {
            console.log("decrypting File...")
            const bytes  = AES.decrypt(blockDetails.response.data, data.SK)
            const decryptedFile = convertWordArrayToUint8Array(bytes);
            console.log('successfully decrypted file')
            var fileDownload = new Blob([decryptedFile]);
            setUrl(window.URL.createObjectURL(fileDownload))
            setDownloadName(blockDetails.fileName)
            setActiveStep(pages.length)
        } catch (error) {
            console.log(error)
        }
    }

    const fileSearch = async(aadharNumber) => {
        console.log("Searching for file...")
        try{
          const res = await moi.methods.checkAccess(aadharNumber).call()
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
                'nonce': authToken.nonce,
                'signature': authToken.signature,
                'id': authToken.id,
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

    return (
        <>
        { activeStep === pages.length ? (
            <div className='flex flex-col h-screen justify-center items-center bg-green-400'>
                {downloadName ? (
                    <>
                    <h1 className='text-center text-xl'>{blockDetails.fileName}</h1>
                    <button className='mt-2 flex rounded-xl p-2 tracking-widest bg-blue-700 active:bg-blue-800 text-white gap-3'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <a href={url} download={downloadName} className='font-semibold'>DOWNLOAD FILE</a></button>
                    </>):
                (<div>
                    <h1 className='text-center text-xl font-semibold'>File Locked!!</h1>
                    <h1 className='text-center text-xl font-semibold'>{`By ${blockDetails.uni_name}`}</h1>
                </div>)}
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
        )}
        </>
    )
}
/* {downloadName && (
    <a href={url} download={downloadName}>DOWNLOAD</a>
)} */
export default Search
