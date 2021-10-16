import React from 'react'
import { ErrorMessage } from '@hookform/error-message';
import { useForm } from "react-hook-form";

const SearchBar = ({fileSearch, setAadhar}) => {
    const { register, handleSubmit, formState: { errors }} = useForm();
    const onSubmit = (data, e) => {
        e.preventDefault()
        setAadhar(data.aadharNumber)
        fileSearch(data.aadharNumber)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col'>
         <div className="flex items-center justify-center mx-5">
            <input type='number' placeholder='Aadhar Number...' className='flex outline-none max-w-xl rounded-l-xl border-2 border-blue-700 p-2'
            {...register("aadharNumber", {required: true, minLength:{value: 12, message: 'less than 12 digits'}, maxLength:{value: 12, message: 'more than 12 digits'} })} />
            <button className="flex outline-none tracking-wider border-2 rounded-r-xl p-2 border-blue-700 bg-blue-700 active:bg-blue-800 active:border-blue-700 text-white"
            type="submit">search</button>
         </div>
         <ErrorMessage errors={errors} name="aadharNumber" render={({ message }) => <p className="mx-5 text-sm text-red-500">{`*${message}`}</p>} />
        </form>
    )
}

export default SearchBar
