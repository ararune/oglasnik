import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import Profil from './Profil';
import Kategorije from './Kategorije';
import MojiOglasi from './MojiOglasi';
import Prijava from './Prijava';
import odjavaKorisnika from './odjava';
import Pretraga from './Pretraga';
import './App.css';
import logoSlika from './images/logo.png';
import Registracija from './Registracija';
import KreirajOglas from './KreirajOglas';
import Oglasi from './Oglasi';
import AzurirajOglas from './AzurirajOglas';
import AzurirajKorisnika from './AzurirajKorisnika';
import PromjenaLozinke from './PromjenaLozinke';
import { FiMenu } from 'react-icons/fi';
import OglasDetalji from './OglasDetalji';
import Korisnik from './Korisnik';
import PretragaForma from './PretragaForma';
import { FaUserPlus, FaSignInAlt, FaUser, FaPlus, FaListAlt, FaSignOutAlt } from 'react-icons/fa';
function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchUser();
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const handleMenuLinkClick = () => {
    setMenuOpen(false);
  };

  const PrivateRoute = () => {
    return loggedInUser ? <Outlet /> : <Navigate to="/prijava" />;
  };

  if (loading) {
    return <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">Stranica se učitava...</div>;
  }

  return (
    <Router>
      <div className="bg-zinc-900">
        <nav className="bg-zinc-900">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
              <img src={logoSlika} alt="Logo" className="h-8 md:h-12" />
            </Link>
            <PretragaForma
              searchQuery={searchQuery}
              handleSearchChange={handleSearchChange}
              handleSearchSubmit={handleSearchSubmit}
            />
            {!loggedInUser && (
              <div className="flex space-x-4">
                <Link
                  to="/registracija"
                  className="flex items-center space-x-2 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-4 py-2 text-center ml-2"
                >
                  <FaUserPlus /><span>Registracija</span>
                </Link>
                <Link
                  to="/prijava"
                  className="flex items-center space-x-2 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-4 py-2 text-center ml-2"
                >
                  <FaSignInAlt /><span>Prijava</span>
                </Link>
              </div>
            )}
            {loggedInUser && (
              <button
                data-collapse-toggle="navbar-default"
                type="button"
                className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                aria-controls="navbar-default"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <FiMenu className="w-7 h-7" />
              </button>
            )}
            <div className={`${menuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`} id="navbar-default">
              <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 bg-gray-800 md:dark:bg-zinc-900 dark:border-gray-700">
                {loggedInUser && (
                  <>
                    <li>
                      <Link
                        to="/profil"
                        className="font-bold flex items-center space-x-2 block py-2 px-3 text-gray-900 rounded hover:bg-blue-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-blue-700 dark:hover:text-white md:dark:hover:bg-transparent"
                        onClick={handleMenuLinkClick}
                      >
                        <FaUser /><span>Profil</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/kreiraj_oglas"
                        className="font-bold flex items-center space-x-2 block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-blue-700 dark:hover:text-white md:dark:hover:bg-transparent"
                        onClick={handleMenuLinkClick}
                      >
                        <FaPlus /><span>Kreiraj Oglas</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/moji_oglasi"
                        className="font-bold flex items-center space-x-2 block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-blue-700 dark:hover:text-white md:dark:hover:bg-transparent"
                        onClick={handleMenuLinkClick}
                      >
                        <FaListAlt /><span>Moji Oglasi</span>
                      </Link>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          handleLogout();
                          handleMenuLinkClick();
                        }}
                        className="font-bold flex items-center space-x-2 block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-blue-700 dark:hover:text-white md:dark:hover:bg-transparent"
                      >
                        <FaSignOutAlt /><span>Odjava</span>
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>

        <div className="min-h-screen bg-zinc-900 text-white flex flex-col p-6 items-center justify-center">


          <Routes>
            <Route path="/" element={<Kategorije />} />

            <Route element={<PrivateRoute />}>
              <Route path="/profil" element={<Profil />} />
              <Route path="/kreiraj_oglas" element={<KreirajOglas />} />
              <Route path="/moji_oglasi" element={<MojiOglasi />} />
              <Route path="/api/azuriraj-oglas/:oglasId" element={<AzurirajOglas />} />
              <Route path="/azuriraj-korisnika" element={<AzurirajKorisnika />} />
              <Route path="/promjena-lozinke" element={<PromjenaLozinke />} />
            </Route>

            <Route path="/registracija" element={<Registracija />} />
            <Route path="/prijava" element={<Prijava setLoggedInUser={setLoggedInUser} />} />
            <Route path="/oglasi/:category" element={<Oglasi />} />
            <Route path="/pretraga" element={<Pretraga />} />
            <Route path="/oglas/:sifra" element={<OglasDetalji />} />
            <Route path="/korisnik/:username" element={<Korisnik />} />


          </Routes>
          <footer className="rounded-lg bg-zinc-900 m-4 w-full max-w-screen">
            <div className="w-full max-w-screen-xl mx-auto p-8 md:p-10 lg:p-12">
              <div className="sm:flex sm:items-center sm:justify-between">
                <Link to="/" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                  <img src={logoSlika} alt="Logo" className="h-10 md:h-12" />
                </Link>
                <ul className="ml-3 flex flex-wrap items-center mb-6 text-sm md:text-base lg:text-lg font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
                  <li>
                    <Link to="/profil" className="flex items-center space-x-2 hover:underline me-4 md:me-6">
                      <FaUser /><span>Profil</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/kreiraj_oglas" className="flex items-center space-x-2 hover:underline me-4 md:me-6">
                      <FaPlus /><span>Kreiraj Oglas</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/moji_oglasi" className="flex items-center space-x-2 hover:underline me-4 md:me-6">
                      <FaListAlt /><span>Moji Oglasi</span>
                    </Link>
                  </li>
                </ul>
              </div>
              <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
              <span className="block text-sm md:text-base lg:text-lg text-gray-500 sm:text-center dark:text-gray-400">
                2024 <Link to="/" className="hover:underline">Oglasnik</Link>. Josip Čondić Jurkić
              </span>
            </div>
          </footer>
        </div>
      </div>
    </Router>
  );
};

export default App;
