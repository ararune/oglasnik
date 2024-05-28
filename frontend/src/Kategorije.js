import React from 'react';
import { Link } from 'react-router-dom';
import domSlika from './images/dom.png';
import elektronikaSlika from './images/elektronika.png';
import autoSlika from './images/car.png';
import glazbalaSlika from './images/glazba.png';
import knjigeSlika from './images/knjige.png';
import ljubimciSlika from './images/ljubimci.png';
import odjecaSlika from './images/odjeca.png';
import sportSlika from './images/sport.png';

function Kategorije() {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-4xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <Link to="/oglasi/glazbala" className="bg-blue-800 p-4 rounded shadow-md hover:bg-blue-900 text-center flex flex-col items-center">
              <img src={glazbalaSlika} alt="Glazbala" className="h-24 mb-2 rounded" />
              <span className="font-semibold text-lg text-white">Glazbala</span>
            </Link>
            <Link to="/oglasi/nekretnine" className="bg-green-800 p-4 rounded shadow-md hover:bg-green-900 text-center flex flex-col items-center">
              <img src={domSlika} alt="Nekretnine" className="h-24 mb-2 rounded" />
              <span className="font-semibold text-lg text-white">Nekretnine</span>
            </Link>
            <Link to="/oglasi/vozila" className="bg-orange-700 p-4 rounded shadow-md hover:bg-orange-900 text-center flex flex-col items-center">
              <img src={autoSlika} alt="Vozila" className="h-24 mb-2 rounded" />
              <span className="font-semibold text-lg text-white">Vozila</span>
            </Link>
            <Link to="/oglasi/elektronika" className="bg-red-800 p-4 rounded shadow-md hover:bg-red-900 text-center flex flex-col items-center">
              <img src={elektronikaSlika} alt="Elektronika" className="h-24 mb-2 rounded" />
              <span className="font-semibold text-lg text-white">Elektronika</span>
            </Link>
            <Link to="/oglasi/odjeca-i-obuca" className="bg-indigo-800 p-4 rounded shadow-md hover:bg-indigo-900 text-center flex flex-col items-center">
              <img src={odjecaSlika} alt="Odjeca" className="h-24 mb-2 rounded" />
              <span className="font-semibold text-lg text-white">Odjeća i obuća</span>
            </Link>
            <Link to="/oglasi/sport-i-rekreacija" className="bg-pink-800 p-4 rounded shadow-md hover:bg-pink-900 text-center flex flex-col items-center">
              <img src={sportSlika} alt="Sport" className="h-24 mb-2 rounded" />
              <span className="font-semibold text-lg text-white">Sport i rekreacija</span>
            </Link>
            <Link to="/oglasi/literatura" className="bg-purple-800 p-4 rounded shadow-md hover:bg-purple-900 text-center flex flex-col items-center">
              <img src={knjigeSlika} alt="Knjige" className="h-24 mb-2 rounded" />
              <span className="font-semibold text-lg text-white">Literatura</span>
            </Link>
            <Link to="/oglasi/kucni-ljubimci" className="bg-teal-800 p-4 rounded shadow-md hover:bg-teal-900 text-center flex flex-col items-center">
              <img src={ljubimciSlika} alt="Ljubimci" className="h-24 mb-2 rounded" />
              <span className="font-semibold text-lg text-white">Ljubimci</span>
            </Link>
          </div>
        </div>
      </div>
    );
}

export default Kategorije;
