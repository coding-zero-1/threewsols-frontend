import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import LandingPage from './components/LandingPage'
import SignUpPage from './components/SignUpPage'
import SignInPage from './components/SignInPage'
import Home from './components/Home'
import ProfilePage from './components/ProfilePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
