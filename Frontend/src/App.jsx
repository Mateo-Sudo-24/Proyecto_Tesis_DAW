
import { BrowserRouter, Route, Routes } from 'react-router'
import { Home } from './pages/Home'
import Login from './pages/Login'
import { Register } from './pages/Register'
import { Forgot } from './pages/Forgot'
import { Confirm } from './pages/Confirm'
import { NotFound } from './pages/NotFound'
import Dashboard from './layout/Dashboard'
import Profile from './pages/Profile'
import List from './pages/List'
import Details from './pages/Details'
import Create from './pages/Create'
import Update from './pages/Update'
import Chat from './pages/Chat'
import Reset from './pages/Reset'



function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        
        <Route index element={<Home/>}/>
        <Route path='login' element={<Login/>}/>
        <Route path='register' element={<Register/>}/>
        <Route path='forgot/:id' element={<Forgot/>}/>
        <Route path='confirm/:token' element={<Confirm/>}/>
        <Route path='reset/:token' element={<Reset/>}/>
        <Route path='*' element={<NotFound />} />


        <Route path='/dashboard' element={<Dashboard/>}>
          <Route index element={<Profile/>}/>
          <Route path='listar' element={<List/>}/>
          <Route path='visualizar/:id' element={<Details/>}/>
          <Route path='crear' element={<Create/>}/>
          <Route path='actualizar/:id' element={<Update/>}/>
          <Route path='chat' element={<Chat/>}/>

        </Route>


      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
