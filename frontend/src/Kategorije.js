import React from 'react';
import { Link } from 'react-router-dom';
import { FaGuitar, FaHome, FaCar, FaLaptop, FaTshirt, FaFootballBall, FaBook, FaPaw, FaPlusCircle } from 'react-icons/fa';
import useAuth from './useAuth';

function Kategorije() {
  const { user} = useAuth();
  return (
    <div className="min-h-screen rounded border border-gray-600 bg-gradient-to-r from-gray-900 to-gray-800 px-4">
      <div className="py-20 px-4 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Pronađite sve što vam treba</h1>
        <p className="text-lg mb-4">Istražite našu ponudu kategorija i pronađite savršeni proizvod za vas.</p>
      </div>
      <div className="p-6 w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-12">
          <Link to="/oglasi/glazbala" className="bg-blue-800 p-4 rounded shadow-md hover:bg-blue-900 text-center flex flex-col items-center">
            <FaGuitar className="h-20 w-20 mb-2 text-white" />
            <span className="font-semibold text-lg text-white">Glazbala</span>
          </Link>
          <Link to="/oglasi/nekretnine" className="bg-green-800 p-4 rounded shadow-md hover:bg-green-900 text-center flex flex-col items-center">
            <FaHome className="h-20 w-20 mb-2 text-white" />
            <span className="font-semibold text-lg text-white">Nekretnine</span>
          </Link>
          <Link to="/oglasi/vozila" className="bg-amber-700 p-4 rounded shadow-md hover:bg-amber-900 text-center flex flex-col items-center">
            <FaCar className="h-20 w-20 mb-2 text-white" />
            <span className="font-semibold text-lg text-white">Vozila</span>
          </Link>
          <Link to="/oglasi/elektronika" className="bg-red-800 p-4 rounded shadow-md hover:bg-red-900 text-center flex flex-col items-center">
            <FaLaptop className="h-20 w-20 mb-2 text-white" />
            <span className="font-semibold text-lg text-white">Elektronika</span>
          </Link>
          <Link to="/oglasi/odjeca-i-obuca" className="bg-indigo-800 p-4 rounded shadow-md hover:bg-indigo-900 text-center flex flex-col items-center">
            <FaTshirt className="h-20 w-20 mb-2 text-white" />
            <span className="font-semibold text-lg text-white">Odjeća i obuća</span>
          </Link>
          <Link to="/oglasi/sport-i-rekreacija" className="bg-pink-800 p-4 rounded shadow-md hover:bg-pink-900 text-center flex flex-col items-center">
            <FaFootballBall className="h-20 w-20 mb-2 text-white" />
            <span className="font-semibold text-lg text-white">Sport i rekreacija</span>
          </Link>
          <Link to="/oglasi/literatura" className="bg-purple-800 p-4 rounded shadow-md hover:bg-purple-900 text-center flex flex-col items-center">
            <FaBook className="h-20 w-20 mb-2 text-white" />
            <span className="font-semibold text-lg text-white">Literatura</span>
          </Link>
          <Link to="/oglasi/kucni-ljubimci" className="bg-teal-800 p-4 rounded shadow-md hover:bg-teal-900 text-center flex flex-col items-center">
            <FaPaw className="h-20 w-20 mb-2 text-white" />
            <span className="font-semibold text-lg text-white">Ljubimci</span>
          </Link>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Dodajte svoj oglas</h2>
          <p className="text-lg mb-4">Imate proizvod za prodaju? Dodajte svoj oglas i dođite do više kupaca.</p>
          <Link
            to={user ? "/kreiraj_oglas" : "/prijava"}
            className="inline-flex items-center bg-blue-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
          >
            <FaPlusCircle className="mr-2 text-2xl" />
            Dodaj oglas
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Kategorije;
