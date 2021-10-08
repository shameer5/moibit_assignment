import React from 'react'
import { useForm } from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import {convertBytes} from '../helpers.js'
import UploadBar from './UploadBar'

const Upload = ({file, setFile,active, setActive, fileUpload}) =>{
    const { register, handleSubmit, formState: { errors }} = useForm();

    const onSubmit = (data, e) => {
        e.preventDefault()
        file.aadharNumber= data.aadharNumber
        console.log("Submitting file data...")
        setActive(!active)
        const formData = new FormData()
        formData.append('fileName', file.name)
        formData.append('file', file)
        fileUpload(formData)
        
    }

    return(
        <>
            <div className={`${file.name !== 'Select a file...' && !active && `filter blur`} flex flex-col gap-3 justify-center border-2 border-black h-screen`} >
                <h1 className='text-center text-xl font-semibold'>Upload your students TC in moibit</h1>
                <UploadBar className="mb-2" file={file} setFile={setFile}/>
                {file.name !== 'Select a file...' && (
                    <div className={`${file.name === 'Select a file...' && `hidden`} flex justify-center mt-2`}>
                        <button className={`${!active && `hidden`}`} onClick={()=>{setActive(false)}}><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                        </svg></button>
                    </div>)}
            </div>
            {file.name !== 'Select a file...' && (
            <div className={`flex items-center justify-center transition transform ease-in-out duration-1500 h-screen w-screen top-0 left-0 absolute z-10 ${active ? `translate-y-200` : `-translate-y-200`}`}>
            <div className={`flex flex-grow flex-shrink mx-4 min-w-0 max-w-xl flex-col bg-gray-100 p-2 rounded-xl shadow-custom transition transform ease-in-out duration-1500`}>
                <div className="flex justify-end">
                    <button onClick={()=>{setActive(!active)}}><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg></button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3 p-2'>
                    <div className='flex-col flex'>
                        <label className='mb-1 font-semibold text-left'>File Name</label>
                        <span type='text' className="truncate outline-none border-2 border-gray-400 rounded-xl p-2 bg-gray-200">{file.name}</span>
                    </div>
                    <div className='flex flex-col'>
                        <label className='mb-1 font-semibold text-left'>File type</label>
                        <span type='text' className="truncate outline-none border-2 border-gray-400 rounded-xl p-2 bg-gray-200">{file.type}</span>
                    </div>
                    <div className='flex flex-col'>
                        <label className='mb-1 font-semibold text-left'>File size</label>
                        <span className="outline-none border-2 border-gray-400 rounded-xl p-2 focus:ring-2 bg-gray-200">{convertBytes(file.size)}</span>
                    </div>
                    <div className='flex flex-col'>
                        <label className='mb-1 font-semibold text-left'>Student aadhar number</label>
                        <input type="number" className="truncate outline-none border-2 border-gray-400 rounded-xl p-2 bg-gray-200 focus:ring-2"
                        placeholder='Aadhar Number...'
                        {...register("aadharNumber", {required: true, minLength:{value: 12, message: 'less than 12 digits'}, maxLength:{value: 12, message: 'more than 12 digits'} })} />
                        <ErrorMessage errors={errors} name="aadharNumber" render={({ message }) => <p className="text-sm text-red-500">{`*${message}`}</p>} />
                    </div>
                    <div className="flex justify-center">
                    <button 
                    className="mt-2 flex-1 rounded-xl border-2 p-2 border-new-100 tracking-wider bg-blue-600 active:bg-blue-700 text-white"
                    type="submit">UPLOAD</button>
                    </div>
                </form>
                
            </div>
            </div>
            )}
        </>
    )
};

export default Upload