import Home from './layout/DashboardSt'
import Signin from './pages/Signin'
import Events from "./pages/Events"
import { Routes,Route } from 'react-router-dom'
import EventCreate from './pages/EventCreate'
import Signup from './pages/Signup'
import EventDetail from './pages/EventDetailST'
import RegisterEvent from './pages/RegisterEvent'
import Feedback from './pages/Feedback'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home/> }></Route>
      <Route path='/login' element={<Signin />}></Route>
      <Route path="/signup" element={<Signup />}></Route>
      <Route path='/create-events' element={<EventCreate/>}></Route>
      <Route path='/events' element={<Events />}></Route>
      <Route path ="/event/:id" element={<EventDetail />}></Route>
      <Route path="/event/:id/register" element={<RegisterEvent/>}></Route>
      <Route path='/event/:id/feedback' element={<Feedback/>}></Route>
    </Routes>
  )
}

export default App
