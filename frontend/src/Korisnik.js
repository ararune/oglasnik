import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AiOutlineEnvironment, AiOutlineCalendar, AiOutlineEuroCircle } from 'react-icons/ai';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import useAuth from './useAuth'
import astronaut from './images/astronaut.png';
function Korisnik() {
    const { username } = useParams();
    const [userData, setUserData] = useState(null);
    const [oglasi, setOglasi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sortOpcija, setSortOpcija] = useState('');
    useEffect(() => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams(window.location.search);
        const sortiranjeOpcija = params.get('sort');
        if (sortiranjeOpcija) {
            setSortOpcija(sortiranjeOpcija);
        }

        fetch(`http://localhost:8000/korisnik/${username}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response nije ok');
                }
                return response.json();
            })
            .then(data => {
                setUserData(data.korisnik);
                setOglasi(data.oglasi);
            })
            .catch(error => {
                setError(error.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [username]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!userData) {
        return <div>User not found</div>;
    }
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
    const handleSortChange = (event) => {
        const selectedOption = event.target.value;
        setSortOpcija(selectedOption);

        const params = new URLSearchParams(window.location.search);
        params.set('sort', selectedOption);
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    };

    const sortOglasi = (ads, option) => {
        let sortiraniOglasi = [...ads];
        if (option === 'cijena-uzlazno') {
            sortiraniOglasi.sort((a, b) => a.cijena - b.cijena);
        } else if (option === 'cijena-silazno') {
            sortiraniOglasi.sort((a, b) => b.cijena - a.cijena);
        } else if (option === 'datum-najstariji') {
            sortiraniOglasi.sort((a, b) => new Date(a.datum) - new Date(b.datum));
        } else if (option === 'datum-najnoviji') {
            sortiraniOglasi.sort((a, b) => new Date(b.datum) - new Date(a.datum));
        }
        return sortiraniOglasi;
    };

    const formatDatum = (datum) => {
        const date = new Date(datum);
        const dan = String(date.getDate()).padStart(2, '0');
        const mjesec = String(date.getMonth() + 1).padStart(2, '0');
        const godina = date.getFullYear();
        return `${dan}/${mjesec}/${godina}`;
    };
    const sortiraniOglasi = sortOglasi(oglasi, sortOpcija);
    return (
        <div className="container mx-auto p-4">
            <div className="max-w-lg mx-auto bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-4">
                <div className="p-4">
                    <h2 className="text-white text-2xl font-bold mb-4">{userData.username}</h2>
                    <p className="text-gray-400">Email: {userData.email}</p>
                    <p className="text-gray-400">OIB: {userData.oib}</p>
                    <p className="text-gray-400">Lokacija: {userData.zupanija_naziv}, {userData.grad_naziv}</p>
                </div>
            </div>
            <h2 className="text-white text-2xl mb-4">Oglasi korisnika {userData.username}</h2>
            <div className="flex justify-end mb-4">
                <select id="sortCriteria" value={sortOpcija} onChange={handleSortChange} className="px-4 py-2 rounded border border-gray-600 bg-zinc-900 text-white focus:outline-none focus:border-rose-500">
                    <option value="">Sortiraj po</option>
                    <option value="cijena-uzlazno">Cijena uzlazno</option>
                    <option value="cijena-silazno">Cijena silazno</option>
                    <option value="datum-najstariji">Datum najstariji</option>
                    <option value="datum-najnoviji">Datum najnoviji</option>
                </select>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
                {oglasi.length === 0 ? (
                    <div className="text-center mt-10">
                        <p className="text-white text-xl mb-4">Ovaj korisnik nema oglasa</p>
                        <img src={astronaut} alt="Astronaut" className="mx-auto w-48 h-48" />
                    </div>
                ) : (
                    sortiraniOglasi.map(oglas => (
                        <li key={oglas.id} className="relative bg-gray-800 rounded border border-gray-600 bg-zinc-900 overflow-hidden shadow-md flex flex-row items-start">
                            {oglas.slike.length > 0 && (
                                <Link to={`/oglas/${oglas.sifra}`} key={oglas.sifra} className="block">
                                    <img src={`http://localhost:8000${oglas.slike[0].slika}`} alt={oglas.naziv} className="w-48 h-48 object-contain" />
                                </Link>
                            )}
                            <div className="flex flex-col justify-between p-4 flex-grow">
                                <div>
                                    <p className="w-full text-white bg-gray-800 font-sm px-2 py-1 text-center">{oglas.kategorija_naziv}</p>
                                    <Link to={`/oglas/${oglas.sifra}`} key={oglas.sifra} className="block">
                                        <h4 className="text-white text-xl font-bold mb-2 white-space: nowrap;">{oglas.naziv}</h4>
                                    </Link>
                                    <div className="text-gray-400 text-sm mb-1 flex items-center">
                                        <AiOutlineEnvironment className="inline-block mr-2" />
                                        <p>{oglas.zupanija.naziv}, {oglas.grad.naziv}</p>
                                    </div>
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
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default Korisnik;
