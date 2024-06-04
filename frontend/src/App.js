import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import Profil from './Profil';
import Kategorije from './Kategorije';
import MojiOglasi from './MojiOglasi';
import Prijava from './Prijava';
import odjavaKorisnika from './odjava'; // Import the logout function
import Pretraga from './Pretraga'; // Import the Pretraga component
import './App.css';
import logoSlika from './images/logo.png';
import Registracija from './Registracija';
import KreirajOglas from './KreirajOglas';
import Oglasi from './Oglasi';
import AzurirajOglas from './AzurirajOglas';
import AzurirajKorisnika from './AzurirajKorisnika';

const PretragaForma = ({ searchQuery, handleSearchChange, handleSearchSubmit }) => {
  const lokacija = useLocation();
  const vidljivaTrazilica = lokacija.pathname === '/' || lokacija.pathname.startsWith('/oglasi') || lokacija.pathname === '/pretraga';

  return (
    vidljivaTrazilica && (
      <div>
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Traži po pojmu ili šifri"
            className="px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="ml-2 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-4 py-2 text-center">Traži</button>
        </form>
      </div>
    )
  );
};

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setLoggedInUser(null);
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await odjavaKorisnika();
    setLoggedInUser(null);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    window.location.href = `/pretraga?q=${searchQuery}`;
  };

  const PrivateRoute = () => {
    return loggedInUser ? <Outlet /> : <Navigate to="/prijava" />;
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Stranica se učitava...</div>;
  }

  return (
    <Router>
      <div className="bg-gray-900">
        <nav className="flex items-center justify-between px-6 py-4">
          <div>
            <Link to="/">
              <img src={logoSlika} alt="Logo" className="w-10 h-10" />
            </Link>
          </div>
          <div className="text-white font-bold">
            {loggedInUser ? (
              <div className="space-x-2">
                <button type="button" onClick={handleLogout} className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-4 py-2 text-center">Odjava</button>
                <Link to="/profil">Profil</Link>
                <Link to="/kreiraj_oglas">Kreiraj Oglas</Link>
                <Link to="/moji_oglasi">Moji Oglasi</Link>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/registracija" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-4 py-2 text-center ml-2">Registracija</Link>
                <Link to="/prijava" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-4 py-2 text-center ml-2">Prijava</Link>
              </div>
            )}
          </div>
        </nav>
      </div>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col p-6 items-center justify-center">
        <PretragaForma
          searchQuery={searchQuery}
          handleSearchChange={handleSearchChange}
          handleSearchSubmit={handleSearchSubmit}
        />
        <Routes>
          <Route path="/" element={<Kategorije />} />

          <Route element={<PrivateRoute />}>
            <Route path="/profil" element={<Profil />} />
            <Route path="/kreiraj_oglas" element={<KreirajOglas />} />
            <Route path="/moji_oglasi" element={<MojiOglasi />} />
            <Route path="/api/azuriraj-oglas/:oglasId" element={<AzurirajOglas />} />
            <Route path="/azuriraj-korisnika" element={<AzurirajKorisnika />} />
          </Route>

          <Route path="/registracija" element={<Registracija />} />
          <Route path="/prijava" element={<Prijava setLoggedInUser={setLoggedInUser} />} />
          <Route path="/oglasi/:category" element={<Oglasi />} />
          <Route path="/pretraga" element={<Pretraga />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
