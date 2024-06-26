import React, { useState, useEffect } from 'react';
import { AiOutlineFileSearch } from 'react-icons/ai';
import { Link } from 'react-router-dom';

function MojiOglasi() {
    const [oglasi, setOglasi] = useState([]);
    const [favoriziraniOglasi, setFavoriziraniOglasi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [prikaziModal, setPokaziModal] = useState(false);
    const [oglasToDelete, setOglasZaBrisanje] = useState(null);
    const [sortOpcija, setSortOpcija] = useState('');
    const [aktivniTab, setAktivniTab] = useState('moji-oglasi');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sortiranjeOpcija = params.get('sort');
        const tabOption = params.get('tab');
        if (sortiranjeOpcija) {
            setSortOpcija(sortiranjeOpcija);
        }
        if (tabOption) {
            setAktivniTab(tabOption);
        }
        dohvatiOglase();
        dohvatiFavoriziraneOglase();
    }, []);

    const dohvatiOglase = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/moji_oglasi/', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                // Filter out 'arhiviran' oglasi
                const activeOglasi = data.oglasi.filter(oglas => oglas.status !== 'arhiviran');
                setOglasi(activeOglasi);
            } else {
                if (response.status === 401) {
                    setError('Korisnik nije prijavljen');
                } else {
                    setError(`Greška prilikom dohvaćanja oglasa: HTTP status ${response.status}`);
                }
            }
        } catch (error) {
            setError(`Greška prilikom dohvaćanja oglasa: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


    const dohvatiFavoriziraneOglase = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/favoriti/moji_favoriti/', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                const activeOglasi = data.oglasi.filter(oglas => oglas.status === 'aktivan');
                setFavoriziraniOglasi(activeOglasi);
            } else {
                if (response.status === 401) {
                    setError('Korisnik nije prijavljen');
                } else {
                    setError(`Greška prilikom dohvaćanja favorita: HTTP status ${response.status}`);
                }
            }
        } catch (error) {
            setError(`Greška prilikom dohvaćanja favorita: ${error.message}`);
        }
    };
    const ukloniIzFavorita = async (oglasId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/favoriti/ukloni/', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ oglas: oglasId }),
            });
            if (response.ok) {
                setFavoriziraniOglasi(favoriziraniOglasi.filter(oglas => oglas.id !== oglasId));
            } else {
                console.error('Greška prilikom uklanjanja oglasa iz favorita: HTTP status', response.status);
            }
        } catch (error) {
            console.error('Greška prilikom uklanjanja oglasa iz favorita:', error);
        }
    };
    const potvrdiBrisanje = (id) => {
        setOglasZaBrisanje(id);
        setPokaziModal(true);
    };

    const izbrisiOglas = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:8000/api/oglas/${oglasToDelete}/arhiviraj/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (response.ok) {
                setOglasi(
                    oglasi.map((oglas) =>
                        oglas.id === oglasToDelete ? { ...oglas, status: 'arhiviran' } : oglas
                    )
                );
            } else {
                console.error('Greška prilikom arhiviranja oglasa: HTTP status', response.status);
            }
        } catch (error) {
            console.error('Greška prilikom arhiviranja oglasa:', error);
        } finally {
            setPokaziModal(false);
            setOglasZaBrisanje(null);
        }
    };

    const handleTabChange = (tab) => {
        setAktivniTab(tab);
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
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

    if (loading) {
        return <div>Učitavanje...</div>;
    }

    if (error) {
        return <div>Greška: {error}</div>;
    }

    const sortiraniOglasi = sortOglasi(oglasi, sortOpcija);
    const sortiraniFavoriziraniOglasi = sortOglasi(favoriziraniOglasi, sortOpcija);
    const SortSelect = ({ sortOpcija, handleSortChange }) => (
        <div className="flex justify-end mb-4">
            <select id="sortCriteria" value={sortOpcija} onChange={handleSortChange} className="px-4 py-2 rounded border border-gray-600 bg-zinc-900 text-white focus:outline-none focus:border-blue-500">
                <option value="">Sortiraj po</option>
                <option value="cijena-uzlazno">Cijena uzlazno</option>
                <option value="cijena-silazno">Cijena silazno</option>
                <option value="datum-najstariji">Datum najstariji</option>
                <option value="datum-najnoviji">Datum najnoviji</option>
            </select>
        </div>
    );

    const TabButtons = ({ aktivniTab, handleTabChange }) => (
        <div className="flex justify-center mb-6">
            <button
                className={`px-4 py-2 mx-2 ${aktivniTab === 'moji-oglasi' ? 'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg px-4 py-2 text-center' : 'bg-gray-800'} text-white rounded`}
                onClick={() => handleTabChange('moji-oglasi')}
            >
                Moji oglasi
            </button>
            <button
                className={`px-4 py-2 mx-2 ${aktivniTab === 'favorizirani-oglasi' ? 'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg px-4 py-2 text-center' : 'bg-gray-800'} text-white rounded`}
                onClick={() => handleTabChange('favorizirani-oglasi')}
            >
                Favoriti
            </button>
        </div>
    );

    const OglasItem = ({ oglas, potvrdiBrisanje }) => {
        const getStatusBadge = () => {
            if (oglas.status === 'aktivan') {
                return <span className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-md text-sm">Aktivan</span>;
            } else if (oglas.status === 'neaktivan') {
                return <span className="absolute top-2 right-2 bg-yellow-600 text-white px-2 py-1 rounded-md text-sm">Neaktivan</span>;
            } else if (oglas.status === 'arhiviran') {
                return <span className="absolute top-2 right-2 bg-gray-600 text-white px-2 py-1 rounded-md text-sm">Arhiviran</span>;
            } else {
                return null;
            }
        };

        if (oglas.status === 'arhiviran') {
            return null; // Skip rendering if status is 'arhiviran'
        }

        return (
            <li key={oglas.id} className="relative rounded border border-gray-600 bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden shadow-md flex flex-row items-start">
                {oglas.slike && oglas.slike.length > 0 && (
                    <Link to={`/oglas/${oglas.sifra}`} className="block h-full"><img src={`http://localhost:8000${oglas.slike[0]}`} alt={oglas.naziv} className="w-48 h-full object-cover" /></Link>
                )}
                <div className="flex flex-col justify-between p-4 flex-grow relative">
                    <div>
                        <Link to={`/oglas/${oglas.sifra}`} className="block"><h4 className="text-white text-xl font-bold mb-2">{oglas.naziv}</h4></Link>
                        <p className="text-gray-400 text-sm mb-2">Objavljen: {formatDatum(oglas.datum)}</p>
                    </div>
                    {getStatusBadge()}
                    <p className="text-yellow-500 text-lg font-bold">{formatirajCijenu(oglas.cijena)}</p>
                    <div className="flex justify-end mt-4">
                        <button onClick={() => potvrdiBrisanje(oglas.id)} className="px-4 py-2 mx-2 border border-gray-600 bg-gray-800 text-white rounded">
                            Izbriši
                        </button>
                        <Link
                            to={`/api/azuriraj-oglas/${oglas.id}`}
                            className="px-4 py-2 mx-2 border border-gray-600 bg-gray-800 text-white rounded"
                        >
                            Ažuriraj
                        </Link>
                    </div>
                </div>
            </li>
        );
    };


    const FavoriziraniOglasItem = ({ oglas, ukloniIzFavorita }) => (
        <li key={oglas.id} className="relative rounded border border-gray-600 bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden shadow-md flex flex-row items-start">
            {oglas.slike && oglas.slike.length > 0 && (
                <Link to={`/oglas/${oglas.sifra}`} className="block"><img src={`http://localhost:8000${oglas.slike[0]}`} alt={oglas.naziv} className="w-48 h-48 object-cover" /></Link>
            )}
            <div className="flex flex-col justify-between p-4 flex-grow">
                <div>
                    <Link to={`/oglas/${oglas.sifra}`} className="block"><h4 className="text-white text-xl font-bold mb-2">{oglas.naziv}</h4></Link>
                    <p className="text-gray-400 text-sm mb-2">Objavljen: {formatDatum(oglas.datum)}</p>
                </div>
                <p className="text-yellow-500 text-lg font-bold">{formatirajCijenu(oglas.cijena)} </p>
                <div className="flex justify-end mt-4">
                    <button onClick={() => ukloniIzFavorita(oglas.id)} className="text-white bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg px-4 py-2 text-center ml-2 mr-2">
                        Ukloni iz favorita
                    </button>
                </div>
            </div>
        </li>
    );

    const Modal = ({ prikaziModal, setPokaziModal, izbrisiOglas }) => (
        prikaziModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <p className="text-white mb-4">Jeste li sigurni da želite izbrisati ovaj oglas?</p>
                    <div className="flex justify-end">
                        <button onClick={() => setPokaziModal(false)} className="bg-gray-300 text-gray-800 py-2 px-4 rounded mr-2">
                            Odustani
                        </button>
                        <button onClick={izbrisiOglas} className="text-white bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg px-4 py-2 text-center ml-2 mr-2">
                            Izbriši
                        </button>
                    </div>
                </div>
            </div>
        )
    );
    function formatirajCijenu(cijena) {
        const parsedPrice = parseFloat(cijena);

        if (Number.isInteger(parsedPrice)) {
            return parsedPrice.toLocaleString('hr-HR') + ' €';
        } else {
            return parsedPrice.toLocaleString('hr-HR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + ' €';
        }
    }
    return (
        <div className="w-full max-w-4xl mx-auto mb-32">
            <h2 className="text-white text-2xl mb-4">Moji oglasi</h2>
            <SortSelect sortOpcija={sortOpcija} handleSortChange={handleSortChange} />
            <TabButtons aktivniTab={aktivniTab} handleTabChange={handleTabChange} />
            {aktivniTab === 'moji-oglasi' && (
                sortiraniOglasi.length === 0 ? (
                    <div className="text-center mt-10">
                        <p className="text-white text-xl mb-4">Nemate nijedan oglas</p>
                        <Link
                            to="/kreiraj_oglas"
                            className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-4 py-2 text-center"
                        >
                            Kreiraj Oglas
                        </Link>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {sortiraniOglasi.map(oglas => (
                            <OglasItem key={oglas.id} oglas={oglas} potvrdiBrisanje={potvrdiBrisanje} />
                        ))}
                    </ul>
                )
            )}
            {aktivniTab === 'favorizirani-oglasi' && (
                sortiraniFavoriziraniOglasi.length === 0 ? (
                    <div className="text-center mt-10">
                        <p className="text-white text-xl mb-4">Nemate nijedan aktivni oglas u favoritima</p>
                        <AiOutlineFileSearch className="mx-auto w-48 h-48 text-gray-400" />
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {sortiraniFavoriziraniOglasi.map(oglas => (
                            <FavoriziraniOglasItem key={oglas.id} oglas={oglas} ukloniIzFavorita={ukloniIzFavorita} />
                        ))}
                    </ul>
                )
            )}
            <Modal prikaziModal={prikaziModal} setPokaziModal={setPokaziModal} izbrisiOglas={izbrisiOglas} />
        </div>
    );
}

export default MojiOglasi;
