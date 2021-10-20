import React, {useState} from 'react';
import { useForm } from "react-hook-form";
import axios from 'axios'
import { useHistory } from 'react-router-dom'

var token = {}

const Login =({moi, account, cookies, setCookie}) => {
    const { register, handleSubmit } = useForm();
    const [addUser , setAddUser] = useState();


    const history = useHistory();

    const onSubmit = async (data, e) => {
        const details = data
        e.preventDefault()
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
            const id = data.data.address
            console.log(data.meta.message)
            var value = await moi.methods.setOrNot(data.data.address).call()
            console.log(value)
            token = {
                nonce: details.nonce,
                id: id,
                signature: details.signature
            }
            setAddUser(value)
            if(value === true){
                /* Move to the home page */
                var response = await moi.methods.whichPage(data.data.address).call()

                console.log('setting cookies')
                token.page = response
                setCookie('token', token, {path:'/', expires: 0, maxAge: 3600});
                console.log(cookies.token)
                console.log('cookies are set')
                history.push('/home')
            }
        } catch(error){
            console.log(error)
        }
    };

    const registerUser = (data, e) => {
        e.preventDefault()
        console.log(data.uniName)
        moi.methods.setCollege(data.uniName, token.id).send({from: account}).on('transactionHash', async () => {
            console.log("user successfully registered in the blockchain")
            var response = await moi.methods.whichPage(token.id).call()
            token.page = response
            setCookie('token',token, {path:'/', expires: 0, maxAge: 3600});
            history.push('/home')
        })
    }

    if(addUser === undefined){
    return (
        <div className={`flex flex-col items-center justify-center h-screen gap-5`}>
            <div>
                <h1 className="font-bold text-3xl text-center">LOGIN</h1>
                <h1 className="font-bold text-xl text-center"> with moibit credentials</h1>
            </div>
            <div className={`flex w-9/12 max-w-xl mx-2 p-2 bg-gray-100 rounded-xl shadow-custom`}>
                <form onSubmit={handleSubmit(onSubmit)}  className='flex flex-auto flex-col gap-3 p-2 '>
                    <div className='flex flex-col'>
                        <label className='mb-1 font-semibold text-left'>Nonce</label>
                        <input className="outline-none border-2 border-gray-400 rounded-xl p-2 focus:ring-2 " 
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
        </div>)}
    if(addUser === false){ 
        return(
        <div className={`flex flex-col items-center justify-center h-screen gap-5`}>
            <div>
                <h1 className="font-bold text-3xl text-center">Register</h1>
                <h1 className="font-bold text-xl text-center">account in blockchain</h1>
            </div>
            <div className={`flex w-9/12 max-w-xl mx-2 p-2 bg-gray-100 rounded-xl shadow-custom`}>
                <form onSubmit={handleSubmit(registerUser)}  className='flex flex-auto flex-col gap-3 p-2 '>
                    <div className='flex flex-col'>
                        <label className='mb-1 font-semibold text-left'>University name</label>
                        <input className="outline-none border-2 border-gray-400 rounded-xl p-2 focus:ring-2 " 
                        placeholder='Enter university name..' {...register("uniName", {required: true })}/>
                    </div>
                    <div className="flex justify-center">
                    <button className="mt-2 outline-none flex-1 rounded-xl p-2 tracking-wider bg-blue-600 active:bg-blue-700 text-white" 
                    type="submit">REGISTER</button>
                    </div>
                </form>  
            </div>
        </div>)
    }
    else{
        return(
        <div className='flex h-screen justify-center items-center'>
                <svg className="animate-spin ml-1 mr-3 h-10 w-10 text-new-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
        </div>)
    }
}
export default Login