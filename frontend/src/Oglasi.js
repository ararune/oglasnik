import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';

function Oglasi() {
    const { category } = useParams();
    const [oglasi, setOglasi] = useState([]);
    const [hijerarhija, setHijerarhija] = useState([]);
    const [children, setChildren] = useState([]);
    const [zupanijeCount, setZupanijeCount] = useState({});
    const [searchParams, setSearchParams] = useSearchParams();

    const sortOption = searchParams.get('sort') || '';
    const minCijena = searchParams.get('minCijena') || '';
    const maxCijena = searchParams.get('maxCijena') || '';
    const selectedZupanije = new Set(searchParams.getAll('zupanija'));

    useEffect(() => {
        fetch(`http://localhost:8000/oglasi/${category}/`)
            .then(response => response.json())
            .then(data => {
                setOglasi(data.oglasi);
                setHijerarhija(data.hijerarhija);
                setChildren(data.children);

                // Count occurrences of each Županija
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
    }, [category]);

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
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            const zupanije = newParams.getAll('zupanija');
            if (zupanije.includes(zupanija)) {
                newParams.delete('zupanija');
                zupanije.forEach(z => {
                    if (z !== zupanija) {
                        newParams.append('zupanija', z);
                    }
                });
            } else {
                newParams.append('zupanija', zupanija);
            }
            return newParams;
        });
    };

    const formatDatum = (datum) => {
        const date = new Date(datum);
        const dan = String(date.getDate()).padStart(2, '0');
        const mjesec = String(date.getMonth() + 1).padStart(2, '0');
        const godina = date.getFullYear();
        return `${dan}/${mjesec}/${godina}`;
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
        if (selectedZupanije.size > 0 && !selectedZupanije.has(zupanija)) {
            return false;
        }
        return true;
    });

    const sortedOglasi = sortOglasi(filteredOglasi, sortOption);

    return (
        <div className="container mx-auto p-4 mb-32">
            <nav className="bg-gray-800 p-3 rounded shadow-md w-full md:max-w-4xl text-white">
                <Link to="/" className="text-blue-400 hover:underline">Oglasnik</Link>
                {hijerarhija.map((kat, index) => (
                    <span key={index} className="mx-1"> {'>'} <Link to={`/oglasi/${kat.url}`} className="text-blue-400 hover:underline">{kat.naziv}</Link></span>
                ))}
            </nav>

            <div className="p-4 rounded text-white mb-4 mt-2">
                <h3 className="text-xl font-bold mb-2 uppercase">{category}</h3>
                <ul className="list-disc list-inside">
                    {children.map((child, index) => (
                        <li key={index}>
                            <Link to={`/oglasi/${child.url}`} className="text-blue-400 hover:underline">{child.naziv}</Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="p-4 rounded text-white mb-4 mt-2">
                <h3 className="text-xl font-bold mb-2">Filter po županiji</h3>
                <div className="flex flex-wrap">
                    {Object.entries(zupanijeCount).map(([zupanija, count], index) => (
                        <div key={index} className="mr-4 mb-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    value={zupanija}
                                    checked={selectedZupanije.has(zupanija)}
                                    onChange={handleZupanijaChange}
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2">{zupanija} ({count})</span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="flex">
                    <select value={sortOption} onChange={handleSortChange} className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 mr-2">
                        <option value="">Sortiraj po</option>
                        <option value="cijena-uzlazno">Cijena uzlazno</option>
                        <option value="cijena-silazno">Cijena silazno</option>
                        <option value="datum-najstariji">Datum najstariji</option>
                        <option value="datum-najnoviji">Datum najnoviji</option>
                    </select>
                    <input type="number" placeholder="Min cijena" value={minCijena} onChange={handleMinCijenaChange} className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 mr-2" />
                    <input type="number" placeholder="Max cijena" value={maxCijena} onChange={handleMaxCijenaChange} className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1" />
                </div>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
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

export default Oglasi;
