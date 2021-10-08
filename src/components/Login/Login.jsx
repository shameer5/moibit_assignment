import React from 'react';
import { useForm } from "react-hook-form";
import axios from 'axios'

const Login =({authToken, setAuthToken}) => {
    const { register, handleSubmit } = useForm();

    const onSubmit = async (data, e) => {
        e.preventDefault()
        setAuthToken({
            nonce: data.nonce,
            signature: data.signature,
        })
        var options = {
            method: 'POST', 
            url: 'https://api.moinet.io/moibit/v1/user/auth',
            headers:{
              'nonce': data.nonce,
              'signature': data.signature
            }
          }
        
        try {
            const {data} = await axios.request(options)
            setAuthToken(prevState=>({
                ...prevState,
                id: data.data.address
            }))
            console.log(data.meta.message)
        } catch(error){
            console.log(error)
        }
    };

    return (
        <>
            {/* <div className={`${file.name !== 'Select a file...' && !active && `filter blur`} flex flex-col gap-3 rounded-xl justify-center`} >
                <h1 className='text-center font-semibold'>Want to upload your file to the decentralized web?</h1>
                <FileUpload className="mb-2" file={file} setFile={setFile}/>
                {file.name !== 'Select a file...' && (
                    <div className={`${file.name === 'Select a file...' && `hidden`} flex justify-center mt-2`}>
                        <button className={`${!active && `hidden`}`} onClick={()=>{setActive(false)}}><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                        </svg></button>
                    </div>)}
            </div> */}
            
            <div className={`flex items-center justify-center h-screen w-screen`}>
            <div className={`mx-2 p-2 bg-gray-100 rounded-xl shadow-custom`}>
                <form onSubmit={handleSubmit(onSubmit)}  className='flex flex-col gap-3 p-2 '>
                    <h1 className="font-bold text-xl">LOGIN</h1>
                    <div className='flex flex-col'>
                        <label className='mb-1 font-semibold text-left'>Nonce</label>
                        <input className="flex-span outline-none border-2 border-gray-400 rounded-xl p-2 focus:ring-2 " 
                        placeholder='Enter Nonce..' {...register("nonce", {required: true })}/>
                    </div>
                    <div className='flex flex-col'>
                        <label className='mb-1 font-semibold text-left'>Signature</label>
                        <input className="flex-span outline-none border-2 border-gray-400 rounded-xl p-2 focus:ring-2 " 
                        placeholder='Enter Signature..' {...register("signature", {required: true })}/>
                    </div>
                    <div className="flex justify-center">
                    <button className="mt-2 outline-none flex-1 rounded-xl p-2 tracking-wider bg-blue-600 active:bg-blue-700 text-white" 
                    type="submit">LOGIN</button>
                    </div>
                </form>  
            </div>
            </div>
        </>
    )
}
export default Login