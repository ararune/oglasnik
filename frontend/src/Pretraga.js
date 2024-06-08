import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import useAuth from './useAuth'
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Pretraga() {
  const query = useQuery();
  const [oglasi, setOglasi] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const searchQuery = query.get('q') || '';
  const sortOption = searchParams.get('sort') || '';
  const itemsPerPage = 6;
  const [zupanijeCount, setZupanijeCount] = useState({});
  const { user } = useAuth();
  const [selectedZupanije, setSelectedZupanije] = useState([]);
  const minCijena = searchParams.get('minCijena') || '';
  const maxCijena = searchParams.get('maxCijena') || '';
  
  useEffect(() => {
    const page = searchParams.get('page') || 1;
    setCurrentPage(page);
    fetch(`http://localhost:8000/api/pretraga?q=${searchQuery}&page=${page}&sort=${sortOption}`)
      .then(response => response.json())
      .then(data => {
        setOglasi(data.oglasi);
        const zupanijaCounts = data.oglasi.reduce((acc, oglas) => {
          const zupanija = oglas.korisnik?.zupanija;
          if (zupanija) {
            if (!acc[zupanija]) {
              acc[zupanija] = 0;
            }
            acc[zupanija]++;
          }
          return acc;
        }, {});
        setZupanijeCount(zupanijaCounts);
      })
      .catch(error => console.error('Error fetching ads:', error));
  }, [searchQuery, searchParams, sortOption]);


  const sortOglasi = useCallback((ads, option) => {
    let sortedOglasi = [...ads];
    if (option === 'cijena-uzlazno') {
      sortedOglasi.sort((a, b) => a.cijena - b.cijena);
    } else if (option === 'cijena-silazno') {
      sortedOglasi.sort((a, b) => b.cijena - a.cijena);
    } else if (option === 'datum-najstariji') {
      sortedOglasi.sort((a, b) => new Date(a.datum) - new Date(b.datum));
    } else if (option === 'datum-najnoviji') {
      sortedOglasi.sort((a, b) => new Date(b.datum) - new Date(a.datum));
    }
    return sortedOglasi;
  }, []);

  const handleSortChange = (event) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('sort', event.target.value);
      newParams.set('page', '1');
      return newParams;
    });
  };

  const handleMinCijenaChange = (event) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('minCijena', event.target.value);
      return newParams;
    });
  };

  const handleMaxCijenaChange = (event) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('maxCijena', event.target.value);
      return newParams;
    });
  };

  const handleZupanijaChange = (event) => {
    const zupanija = event.target.value;
    let updatedZupanije = [];
    if (selectedZupanije.includes(zupanija)) {
      updatedZupanije = selectedZupanije.filter(z => z !== zupanija);
    } else {
      updatedZupanije = [...selectedZupanije, zupanija];
    }
    setSelectedZupanije(updatedZupanije);
    setSearchParams((prevSearchParams) => {
      const newSearchParams = new URLSearchParams(prevSearchParams);
      newSearchParams.delete("zupanija");
      updatedZupanije.forEach((selectedZup) => {
        newSearchParams.append("zupanija", selectedZup);
      });
      return newSearchParams;
    });
  };

  const formatDatum = (datum) => {
    const date = new Date(datum);
    const dan = String(date.getDate()).padStart(2, '0');
    const mjesec = String(date.getMonth() + 1).padStart(2, '0');
    const godina = date.getFullYear();
    return `${dan}/${mjesec}/${godina}`;
  };
  const toggleFavorite = (oglasId, isFavorited) => {
    const url = isFavorited ? 'http://localhost:8000/favoriti/ukloni/' : 'http://localhost:8000/favoriti/dodaj/';
    const method = isFavorited ? 'DELETE' : 'POST';
    fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oglas: oglasId })
    })
      .then(response => response.json())
      .then(() => {
        setOglasi(prevOglasi =>
          prevOglasi.map(oglas =>
            oglas.id === oglasId ? { ...oglas, favorited: !isFavorited } : oglas
          )
        );
      })
      .catch(error => console.error('Error toggling favorite:', error));
  };
  const filteredOglasi = oglasi.filter(oglas => {
    let cijena = oglas.cijena;
    let zupanija = oglas.korisnik?.zupanija;
    if (minCijena !== '' && parseInt(minCijena) > cijena) {
      return false;
    }
    if (maxCijena !== '' && parseInt(maxCijena) < cijena) {
      return false;
    }
    if (selectedZupanije.length > 0 && !selectedZupanije.includes(zupanija)) {
      return false;
    }
    return true;
  });

  const sortedOglasi = sortOglasi(filteredOglasi, sortOption);
  const paginatedOglasi = sortedOglasi.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-white text-2xl mb-4">Rezultati pretrage za: "{searchQuery}"</h2>

      <div className="p-4 rounded text-white mb-4 mt-2">
        <h3 className="text-xl font-bold mb-2">Filtriraj rezultate</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sort Opcije */}
          <div>
            <label className="block mb-1">Sortiraj po:</label>
            <select value={sortOption} onChange={handleSortChange} className="w-full px-4 py-2 rounded border border-gray-600 bg-zinc-900 text-white focus:outline-none focus:border-rose-500">
              <option value="">Odaberi opciju</option>
              <option value="cijena-uzlazno">Cijena uzlazno</option>
              <option value="cijena-silazno">Cijena silazno</option>
              <option value="datum-najstariji">Datum najstariji</option>
              <option value="datum-najnoviji">Datum najnoviji</option>
            </select>
          </div>



          {/* Min/Max Cijena */}
          <div>
            <label className="block mb-1">Cijena raspon:</label>
            <div className="flex">
              <input
                type="text"
                placeholder="Min cijena"
                value={minCijena}
                onChange={handleMinCijenaChange}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full px-4 py-2 rounded border border-gray-600 bg-zinc-900 text-white focus:outline-none focus:border-rose-500"
              />
              <p>do</p>
              <input
                type="text"
                placeholder="Max cijena"
                value={maxCijena}
                onChange={handleMaxCijenaChange}
                inputMode="numeric"
                pattern="[0-9]*"
                className="ml-2 w-full px-4 py-2 rounded border border-gray-600 bg-zinc-900 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
          {/* Filter po Županiji */}
          <div>
            <label className="block mb-1">Filter po županiji:</label>
            <div className="relative">
              <select value="" onChange={handleZupanijaChange} className="w-full px-4 py-2 rounded border border-gray-600 bg-zinc-900 text-white focus:outline-none focus:border-rose-500">
                <option value="">Odaberi županiju</option>
                {Object.entries(zupanijeCount).map(([zupanija, count], index) => (
                  <option key={index} value={zupanija}>{zupanija} ({count})</option>
                ))}
              </select>

            </div>
          </div>
        </div>
        <div className="flex items-center pr-3 mt-4">
          {selectedZupanije.map((zupanija, index) => (
            <div key={index} className="flex items-center mr-2 text-white text-sm bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg px-2.5 py-1 text-center">
              <span>{zupanija}</span>
              <button
                onClick={() => setSelectedZupanije(prev => prev.filter(z => z !== zupanija))}
                className="ml-1 focus:outline-none"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center my-4">
        <div className="flex">
          <Link
            to={`?q=${searchQuery}&page=1&sort=${sortOption}&minCijena=${minCijena}&maxCijena=${maxCijena}${selectedZupanije.map(zupanija => `&zupanija=${zupanija}`).join('')}`}
            className={`px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-l-md shadow-md`}
          >
            Prva
          </Link>
          {[...Array(Math.ceil(sortedOglasi.length / itemsPerPage)).keys()].map((number) => (
            <Link
              key={number + 1}
              to={`?q=${searchQuery}&page=${number + 1}&sort=${sortOption}&minCijena=${minCijena}&maxCijena=${maxCijena}${selectedZupanije.map(zupanija => `&zupanija=${zupanija}`).join('')}`}
              className={`px-3 py-2 bg-gray-800 hover:bg-gray-700 ${currentPage === number + 1 ? 'bg-gray-400' : ''}`}
            >
              {number + 1}
            </Link>
          ))}
          <Link
            to={`?q=${searchQuery}&page=${Math.ceil(sortedOglasi.length / itemsPerPage)}&sort=${sortOption}&minCijena=${minCijena}&maxCijena=${maxCijena}${selectedZupanije.map(zupanija => `&zupanija=${zupanija}`).join('')}`}
            className={`px-4 py-2 bg-gray-800 hover:bg-gray-700  rounded-r-md shadow-md`}
          >
            Zadnja
          </Link>
        </div>
      </div>


      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedOglasi.map(oglas => (
          <li key={oglas.id} className="relative bg-gray-800 rounded border border-gray-600 bg-zinc-900 overflow-hidden shadow-md flex flex-row items-start">
            {oglas.slike.length > 0 && (
              <img src={`http://localhost:8000${oglas.slike[0]}`} alt={oglas.naziv} className="w-48 h-48 object-cover" />
            )}
            <div className="flex flex-col justify-between p-4 flex-grow">
              <div>
                <p className="w-full text-white bg-gray-800 font-sm px-2 py-1 text-center">{oglas.kategorija}</p>
                <h4 className="text-white text-xl font-bold mb-2">{oglas.naziv}</h4>
                {oglas.korisnik && (
                  <div className="text-gray-400 text-sm mb-1">
                    <p>{oglas.korisnik.zupanija}, {oglas.korisnik.grad}</p>
                  </div>
                )}
                <p className="text-gray-400 text-sm mb-2">Objavljen: {formatDatum(oglas.datum)}</p>
              </div>
              <p className="text-yellow-500 text-lg font-bold">{oglas.cijena} €</p>
              {user && (
                <button
                  onClick={() => toggleFavorite(oglas.id, oglas.favorited)}
                  className="text-gray-400 hover:text-red-500 focus:outline-none"
                >
                  {oglas.favorited ? <FaHeart /> : <FaRegHeart />}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Pretraga;
