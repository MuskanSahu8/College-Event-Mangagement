import React from 'react'
import {Link} from "react-router-dom" 
const Nav = () => {
  return (
    <nav className='nav-list'>
        <div className='logo'>
            EventManager Student
        </div>
        <div className='nav-links'>
            <Link to="/">Home</Link>
            <Link to="/events">Events</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">SignUp</Link>
        </div>
      
    </nav>
  )
}

export default Nav
