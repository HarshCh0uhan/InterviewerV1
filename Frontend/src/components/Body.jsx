import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'

const Body = () => {

  return (
    <div>
        <NavBar/>
        <Outlet/>
        <Footer/>
    </div>
  )
}

export default Body