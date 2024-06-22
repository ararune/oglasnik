import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import useAuth from './useAuth'
import { AiOutlineCalendar, AiOutlineEnvironment, AiOutlineEuroCircle } from 'react-icons/ai';
import { AiOutlineFileSearch } from 'react-icons/ai';
import { FaHome, FaChevronRight } from 'react-icons/fa';

function Oglasi() {
    const { category } = useParams();
    const [oglasi, setOglasi] = useState([]);
    const [hijerarhija, setHijerarhija] = useState([]);
    const [children, setChildren] = useState([]);
    const [zupanijeCount, setZupanijeCount] = useState({});
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedZupanije, setSelectedZupanije] = useState([]);
    const { user } = useAuth();
    const itemsPerPage = 6;
    const navigate = useNavigate();
    const sortOption = searchParams.get('sort') || '';
    const minCijena = searchParams.get('minCijena') || '';
    const maxCijena = searchParams.get('maxCijena') || '';

    useEffect(() => {
        const page = searchParams.get('page') || 1;
        setCurrentPage(page);
        fetch(`http://localhost:8000/oglasi/${category}/?page=${page}&sort=${sortOption}`)
            .then(response => response.json())
            .then(data => {
                setOglasi(data.oglasi);
                setHijerarhija(data.hijerarhija);
                setChildren(data.children);
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
    }, [category, searchParams, sortOption]);

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

    const toggleFavorite = (oglasId, isFavorited) => {
        if (!user) {
            navigate('/prijava');
            return;
        }
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
        if (selectedZupanije.length > 0 && !selectedZupanije.includes(zupanija)) {
            return false;
        }
        return true;
    });

    const sortedOglasi = sortOglasi(filteredOglasi, sortOption);
    const paginatedOglasi = sortedOglasi.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const RenderHierarchyLinks = () => (
        <nav className="lg:w-1/3 px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white font-bold flex items-center flex-wrap">
            <Link to="/" className="flex items-center text-white text-sm hover:underline mr-2">
                <FaHome className="mr-1" /> Oglasnik
            </Link>
            {hijerarhija.map((kat, index) => (
                <React.Fragment key={index}>
                    <FaChevronRight className="mx-2" />
                    <Link to={`/oglasi/${kat.url}`} className="text-white text-sm hover:underline">
                        {kat.naziv}
                    </Link>
                </React.Fragment>
            ))}
        </nav>
    );

    const RenderCategoryInfo = () => {
        const lastCategory = hijerarhija.length > 0 ? hijerarhija[hijerarhija.length - 1].naziv : '';

        const noChildren = children.length === 0;

        if (noChildren) {
            return null;
        }

        return (
            <div className="rounded border border-gray-600 bg-gray-800 p-6 text-white mb-4 mt-2 lg:w-1/3">
                <h3 className="text-white text-xl font-bold mb-2 uppercase">{lastCategory}</h3>
                <ul className="list-disc list-inside grid grid-cols-2">
                    {children.map((child, index) => (
                        <div key={index}>
                            <Link to={`/oglasi/${child.url}`} className="text-gray-400 text-sm hover:underline">{child.naziv}</Link>
                        </div>
                    ))}
                </ul>
            </div>
        );
    };
    const RenderFilters = () => (
        <div className="p-4 rounded text-white mb-4 mt-2">
            <h3 className="text-xl font-bold mb-2">Filtriraj rezultate</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label className="block mb-1">Sortiraj po:</label>
                    <select
                        value={sortOption}
                        onChange={handleSortChange}
                        className="w-full px-4 py-2 rounded border border-gray-600 bg-zinc-900 text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="">Odaberi opciju</option>
                        <option value="cijena-uzlazno">Cijena uzlazno</option>
                        <option value="cijena-silazno">Cijena silazno</option>
                        <option value="datum-najstariji">Datum najstariji</option>
                        <option value="datum-najnoviji">Datum najnoviji</option>
                    </select>
                </div>
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
                            className="w-full px-4 py-2 rounded border border-gray-600 bg-zinc-900 text-white focus:outline-none focus:border-blue-500"
                        />
                        <p>do</p>
                        <input
                            type="text"
                            placeholder="Max cijena"
                            value={maxCijena}
                            onChange={handleMaxCijenaChange}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="ml-2 w-full px-4 py-2 rounded border border-gray-600 bg-zinc-900 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="block mb-1">Filter po županiji:</label>
                    <div className="relative">
                        <select
                            value=""
                            onChange={handleZupanijaChange}
                            className="w-full px-4 py-2 rounded border border-gray-600 bg-zinc-900 text-white focus:outline-none focus:border-blue-500"
                        >
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
                    <div key={index} className="flex items-center mr-2 text-white text-sm bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-2.5 py-1 text-center">
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
    );

    const RenderPagination = () => (
        <div className="flex justify-center my-4">
            <div className="flex">
                <Link
                    to={`?page=1&sort=${sortOption}&minCijena=${minCijena}&maxCijena=${maxCijena}${selectedZupanije.map(zupanija => `&zupanija=${zupanija}`).join('')}`}
                    className={`px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-l-md shadow-md`}
                >
                    Prva
                </Link>
                {[...Array(Math.ceil(sortedOglasi.length / itemsPerPage)).keys()].map((number) => (
                    <Link
                        key={number + 1}
                        to={`?page=${number + 1}&sort=${sortOption}&minCijena=${minCijena}&maxCijena=${maxCijena}${selectedZupanije.map(zupanija => `&zupanija=${zupanija}`).join('')}`}
                        className={`px-3 py-2 bg-gray-800 hover:bg-gray-700 ${currentPage === number + 1 ? 'bg-gray-400' : ''}`}
                    >
                        {number + 1}
                    </Link>
                ))}
                <Link
                    to={`?page=${Math.ceil(sortedOglasi.length / itemsPerPage)}&sort=${sortOption}&minCijena=${minCijena}&maxCijena=${maxCijena}${selectedZupanije.map(zupanija => `&zupanija=${zupanija}`).join('')}`}
                    className={`px-4 py-2 bg-gray-800 hover:bg-gray-700  rounded-r-md shadow-md`}
                >
                    Zadnja
                </Link>
            </div>
        </div>
    );

    const RenderOglasiList = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {paginatedOglasi.length === 0 ? (
                <div className="text-center mt-10">
                    <p className="text-white text-xl mb-4">Nema oglasa u ovoj kategoriji</p>
                    <AiOutlineFileSearch className="mx-auto w-48 h-48 text-gray-400" />
                </div>
            ) : (
                paginatedOglasi.map(oglas => (
                    <div key={oglas.id} className="relative rounded border border-gray-600 bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden shadow-md flex flex-row items-start">
                        {oglas.slike.length > 0 && (
                            <Link to={`/oglas/${oglas.sifra}`} className="block h-full">
                                <img src={`http://localhost:8000${oglas.slike[0]}`} alt={oglas.naziv} className="w-48 h-full object-cover" />
                            </Link>
                        )}
                        <div className="flex flex-col justify-between p-4 flex-grow">
                            <div>
                                <p className="inline-flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded">{oglas.kategorija}</p>
                                <Link to={`/oglas/${oglas.sifra}`} className="block">
                                    <h4 className="text-white text-xl font-bold mb-2">{oglas.naziv}</h4>
                                </Link>
                                {oglas.korisnik && (
                                    <div className="text-gray-400 text-sm mb-1 flex items-center">
                                        <AiOutlineEnvironment className="inline-block mr-2" />
                                        <p>{oglas.korisnik.zupanija}, {oglas.korisnik.grad}</p>
                                    </div>
                                )}
                                <div className="text-gray-400 text-sm mb-2 flex items-center">
                                    <AiOutlineCalendar className="inline-block mr-2" />
                                    <p>{formatDatum(oglas.datum)}</p>
                                </div>
                            </div>
                            <p className="text-yellow-500 text-lg font-bold flex items-center">
                                <AiOutlineEuroCircle className="inline-block mr-2" />
                                {oglas.cijena} €
                            </p>
                            <button
                                onClick={() => toggleFavorite(oglas.id, oglas.favorited)}
                                className="text-gray-400 hover:text-red-500 focus:outline-none"
                            >
                                {oglas.favorited ? <FaHeart /> : <FaRegHeart />}
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <div className="container mx-auto p-4">
            <RenderHierarchyLinks />
            <RenderCategoryInfo />
            <RenderFilters />
            <RenderPagination />
            <RenderOglasiList />
        </div>
    );
}

export default Oglasi;