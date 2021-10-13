import React, {useRef} from 'react'

const UploadBar = ({file, setFile}) => {
    const inputFile = useRef();
    return(
        <>
         <input className="hidden" type='file' multiple={false} ref={inputFile} onChange={e=> {e.target.files[0] && setFile(e.target.files[0])}}/>
         <div className="flex items-center justify-center mx-5">
             <span className='max-w-xl flex-1 rounded-l-xl border-2 border-blue-700 p-2 truncate bg-white text-left'>{file.name}</span>
                <button className="outline-none tracking-wider border-2 rounded-r-xl p-2 border-blue-700 bg-blue-700 active:bg-blue-800 active:border-blue-700 text-white"
                onClick={()=>inputFile.current.click()}>browse</button>
         </div>
        </>
    )
}

export default UploadBar