import React, { useState, useRef } from 'react'
import Dropzone from "react-dropzone";
import { AiOutlineCloudUpload } from "react-icons/ai";
import axios from "axios";

const Form = () => {
    const file = useRef(null)
    const [diag, setDiag] = useState(null);
    const [filename, setfilename] = useState(null)
    const [symptomsImageURL, setSymptomsImageURL] = useState('');
    const [imageURL, setimageURL] = useState('');

    const handleSubmit = async () => {
        if (file.current) {
            const cloud = new FormData()
            cloud.append("file", file.current)
            cloud.append("upload_preset", "dip_project")
            cloud.append("cloud_name", "djzejdmyb")

            const response1 = await fetch(
                "https://api.cloudinary.com/v1_1/djzejdmyb/image/upload",
                {
                    method: "POST",
                    body: cloud,
                }
            )

            console.log(response1);
            const data1 = await response1.json()

            console.log("sent to cloudinary");
            console.log(data1);

            try {
                const form = new FormData()
                form.append("file", file.current)
                const response = await axios.post("http://localhost:5000/predict", form)
                    .then((res) => {
                        setDiag(res.data.prediction)

                    })
                console.log(response);
                const form1 = new FormData()
                form1.append("file", file.current)
                const response2 = await axios.post("http://localhost:5000/segment", form1).then((res) => {
                    setimageURL(res.data)
                })
                console.log(response2);
            }
            catch (err) {
                console.log(err)
            }
        }
    }

    const handlefiles = async (param) => {
        if (param[0]) {
            const type = param[0].type
            const splitted = type.split("/")

            let temp1 = "jpeg"
            let temp2 = "png"

            if (splitted[1] === temp1 || splitted[1] === temp2) {
                file.current = param[0]
                const myFile = new FileReader()
                myFile.addEventListener("load", () => {
                    console.log(myFile.result);
                    setSymptomsImageURL(myFile.result)
                }, false)
                myFile.readAsDataURL(file.current)
                // setError(null)
            } else {
                // setError("Please upload supported files only")
                setfilename(null)
                file.current = null
            }
        } else {
            // setError("Please upload single file only")
            setfilename(null)
            file.current = null
        }
    }
    return (
        <div class="p-2" >
            <Dropzone
                className='dropzone'
                onDrop={(acceptedFiles) => handlefiles(acceptedFiles)}
                multiple={false}
            >
                {({ getRootProps, getInputProps }) => (
                    <section>
                        <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <p style={{ textAlign: 'center' }}>
                                    Drag and drop your image here, or click to select a
                                    file
                                </p>
                                <p style={{ textAlign: 'center' }}>
                                    Accepts JPEG and PNG formats, limited to one image at
                                    a time.
                                </p>
                                <AiOutlineCloudUpload
                                    style={{
                                        transform: 'scale(3)',
                                        marginTop: '3vh',
                                        cursor: 'pointer',
                                        alignSelf: 'center',
                                    }}
                                />
                            </div>
                        </div>
                    </section>
                )}
            </Dropzone>


            <div class="p-5" style={{ display: 'flex', justifyContent: 'center' }} >
                {symptomsImageURL ? (<img src={symptomsImageURL} style={{ height: '100%' }} />) : <p style={{ fontWeight: '700', textAlign: 'center', fontSize: 'large' }}> No file uploaded </p>}
            </div>
            <div class="p-5" style={{ display: 'flex', justifyContent: 'center' }} >
                {imageURL ? <p style={{ fontWeight: '700', textAlign: 'center', fontSize: 'large' }}> Segmented Image </p> : ""}
            </div>
            <div class="p-5" style={{ display: 'flex', justifyContent: 'center' }} >
                {imageURL ? (<img src={imageURL} style={{ height: '100%' }} />) : <p style={{ fontWeight: '700', textAlign: 'center', fontSize: 'large' }}></p>}
            </div>

            {
                !diag ? (<div>
                    <p style={{ fontWeight: '700', textAlign: 'center', fontSize: 'large' }}>Discover your path to better health. Take the first step with our model's precise answers.</p>

                    <p style={{ fontWeight: '700', textAlign: 'center', fontSize: 'large' }}>
                        <button

                            class="bg-blue-500 text-white p-2 border-none outline-none rounded-2xl font-bold text-lg shadow-md cursor-pointer"
                            onClick={handleSubmit}
                        >
                            Send for diagnosis
                        </button>
                    </p>
                </div>)
                    : (
                        <p style={{ fontWeight: '700', textAlign: 'center', fontSize: 'large' }}>
                            The probability of you having brain tumour based on the image you have uploaded is {diag * 100}%
                        </p>
                    )
            }
        </div >
    )
}

export default Form
