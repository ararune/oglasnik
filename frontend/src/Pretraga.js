import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Pretraga() {
  const query = useQuery();
  const [oglasi, setOglasi] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const searchQuery = query.get('q');
  const sortOption = searchParams.get('sort') || '';

  useEffect(() => {
    const fetchData = async () => {
      if (searchQuery) {
        try {
          const response = await fetch(`http://localhost:8000/api/pretraga?q=${searchQuery}`);
          if (response.ok) {
            const data = await response.json();
            setOglasi(data.oglasi);
          } else {
            console.error('Error fetching search results');
          }
        } catch (error) {
          console.error('Error fetching search results:', error);
        }
      }
    };

    fetchData();
  }, [searchQuery]);

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
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', event.target.value);
    setSearchParams(newSearchParams);
  };

  const formatDatum = (datum) => {
    const date = new Date(datum);
    const dan = String(date.getDate()).padStart(2, '0');
    const mjesec = String(date.getMonth() + 1).padStart(2, '0');
    const godina = date.getFullYear();
    return `${dan}/${mjesec}/${godina}`;
  };

  const sortedOglasi = sortOglasi(oglasi, sortOption);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-white text-2xl mb-4">Rezultati pretrage za: "{searchQuery}"</h2>

      <div className="flex justify-between items-center mb-4">
        <select value={sortOption} onChange={handleSortChange} className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1">
          <option value="">Sortiraj po</option>
          <option value="cijena-uzlazno">Cijena uzlazno</option>
          <option value="cijena-silazno">Cijena silazno</option>
          <option value="datum-najstariji">Datum najstariji</option>
          <option value="datum-najnoviji">Datum najnoviji</option>
        </select>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedOglasi.map(oglas => (
          <li key={oglas.id} className="bg-gray-800 p-4 rounded shadow-md flex flex-row items-start">
            {oglas.slike.length > 0 && (
              <img src={`http://localhost:8000${oglas.slike[0]}`} alt={oglas.naziv} className="w-48 h-48 object-contain rounded mb-4 mr-4" />
            )}
            <div className="flex-grow">
              <h4 className="text-white text-xl mb-2">{oglas.naziv}</h4>
              {oglas.korisnik && (
                <div>
                  <p>{oglas.korisnik.zupanija}, {oglas.korisnik.grad}</p>
                </div>
              )}
              <p className="text-gray-300 mb-2">Objavljen: {formatDatum(oglas.datum)}</p>
              <p className="text-yellow-500 font-bold">{oglas.cijena} €</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Pretraga;
