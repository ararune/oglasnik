// App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import Profil from './Profil';
import Kategorije from './Kategorije';
import MojiOglasi from './MojiOglasi';
import Prijava from './Prijava';
import odjavaKorisnika from './odjava'; // Import the logout function
import './App.css';
import logoSlika from './images/logo.png';
import Registracija from './Registracija';
import KreirajOglas from './KreirajOglas';
import Oglasi from './Oglasi';


function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setLoggedInUser(null);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/trenutni_korisnik/', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setLoggedInUser(data.ime);
      } else {
        setLoggedInUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setLoggedInUser(null);
    }
  };

  const handleLogout = async () => {
    await odjavaKorisnika();
    setLoggedInUser(null);
  };

  const PrivateRoute = () => {
    return loggedInUser ?  <Outlet/> : <Navigate to="/prijava"/>
  }
  return (
    <Router>
      <div className="bg-gray-800">
        <nav className="flex items-center justify-between px-6 py-4">
          <div>
            <Link to="/">
              <img src={logoSlika} alt="Logo" className="w-10 h-10" />
            </Link>
          </div>
          <div className="text-white font-bold">
            {loggedInUser ? (
              <div className="space-x-2">
                <button type="button" onClick={handleLogout} className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-5 py-2 text-center">Odjava</button>
                <Link to="/profil">Profil</Link>
                <Link to="/kreiraj_oglas">Kreiraj Oglas</Link>
                <Link to="/moji_oglasi">Moji Oglasi</Link>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/registracija" className="text-white font-bold hover:underline">Registracija</Link>
                <Link to="/prijava" className="text-white font-bold hover:underline">Prijava</Link>
              </div>
            )}
          </div>
        </nav>
      </div>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col p-6">
        <div>
          <Routes>
            <Route path="/" element={<Kategorije />} />
            <Route element={<PrivateRoute/>}>
              <Route path="/profil" element={<Profil />} />
              <Route path="/kreiraj_oglas" element={<KreirajOglas />} />
              <Route path="/moji_oglasi" element={<MojiOglasi />} />
            </Route>
            
            <Route path="/registracija" element={<Registracija />} />
            <Route path="/prijava" element={<Prijava setLoggedInUser={setLoggedInUser} />} />
            <Route path="/oglasi/:category" element={<Oglasi />} /> {/* Add this line */}
          </Routes>
        </div>
      </div>
    </Router>
  ); 
}

export default App;
