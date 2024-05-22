// App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Profil from './Profil';
import Kategorije from './Kategorije';
import MojiOglasi from './MojiOglasi';
import Prijava from './Prijava';
import odjavaKorisnika from './odjava'; // Import the logout function
import './App.css';
import logoSlika from './images/logo.png';

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

  return (
    <Router>
      <div className="absolute top-0 left-0 p-6">
        <Link to="/"><img src={logoSlika} alt="Logo" className="w-16 h-16 mb-4" /></Link>
      </div>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center text-white font-bold">
          {loggedInUser ? (
            <div className="fixed top-0 left-1/2 transform -translate-x-1/2 bg-gray-800 p-6 rounded shadow-md text-center">
              <div className="space-x-4">
                <button onClick={handleLogout} className="inline-block bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Odjavi se</button>
                <Link to="/profil">Profil</Link>
                <a href="http://localhost:8000/kreiraj_oglas" className="text-blue-500 hover:underline">Kreiraj Oglas</a>
                <Link to="/moji_oglasi">Moji Oglasi</Link>
              </div>
            </div>
          ) : (
            <div className="fixed top-0 left-1/2 transform -translate-x-1/2 bg-gray-800 p-6 rounded shadow-md text-center mb-6">
              <div className="space-x-4">
                <Link to="http://localhost:8000/registracija" className="text-blue-500 hover:underline">Registriraj se</Link>
                <Link to="/prijava" className="text-blue-500 hover:underline">Prijavi se</Link>
              </div>
            </div>
          )}
        </div>
        <div className='mt-32'>
          <Routes>
            <Route path="/" element={<Kategorije />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/moji_oglasi" element={<MojiOglasi />} />
            <Route path="/prijava" element={<Prijava setLoggedInUser={setLoggedInUser} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
