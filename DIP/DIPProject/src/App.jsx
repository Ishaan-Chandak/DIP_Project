import { useState } from 'react'
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import Form from './Components/Form'

function App() {

  return (
    <>
      <Navbar />

      <Form />

      <div class='bottom-0 w-full'>
        <Footer />
      </div>
    </>
  )
}

export default App
