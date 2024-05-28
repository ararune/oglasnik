import React, { useState, useEffect } from 'react';
import astronaut from './images/astronaut.png'; // Adjust the path if necessary

function MojiOglasi() {
    const [oglasi, setOglasi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [prikaziModal, setPokaziModal] = useState(false);
    const [oglasToDelete, setOglasZaBrisanje] = useState(null);

    useEffect(() => {
        dohvatiOglase();
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
                setOglasi(data.oglasi);
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

    const potvrdiBrisanje = (id) => {
        setOglasZaBrisanje(id);
        setPokaziModal(true);
    };

    const izbrisiOglas = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:8000/api/oglas/${oglasToDelete}/izbrisi/`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                credentials: 'include',
            });
            if (response.ok) {
                setOglasi(oglasi.filter(oglas => oglas.id !== oglasToDelete));
            } else {
                console.error('Greška prilikom brisanja oglasa: HTTP status', response.status);
            }
        } catch (error) {
            console.error('Greška prilikom brisanja oglasa:', error);
        } finally {
            setPokaziModal(false);
            setOglasZaBrisanje(null);
        }
    };

    const formatDatum = (datum) => {
        const date = new Date(datum);
        const dan = String(date.getDate()).padStart(2, '0');
        const mjesec = String(date.getMonth() + 1).padStart(2, '0');
        const godina = date.getFullYear();
        const sati = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${dan}/${mjesec}/${godina} ${sati}:${minute}`;
    };

    if (loading) {
        return <div>Učitavanje...</div>;
    }

    if (error) {
        return <div>Greška: {error}</div>;
    }

    return (
        <div className="w-full max-w-4xl mx-auto mb-32">
            <h2 className="text-white text-2xl mb-4">Moji oglasi</h2>
            {oglasi.length === 0 ? (
                <div className="text-center mt-10">
                    <p className="text-white text-xl mb-4">Nemate nijedan oglas</p>
                    <img src={astronaut} alt="Astronaut" className="mx-auto w-48 h-48" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {oglasi.map((oglas) => (
                        <div key={oglas.id} className="bg-gray-800 p-4 rounded shadow-lg">
                            <div className="w-full h-48 mb-4 overflow-hidden rounded">
                                {oglas.slike && oglas.slike.length > 0 ? (
                                    oglas.slike.map((slika, index) => (
                                        <img
                                            key={index}
                                            src={`http://localhost:8000${slika}`}
                                            alt={oglas.naziv}
                                            className="w-full h-full object-cover"
                                        />
                                    ))
                                ) : (
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-gray-500">Nema slike</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <h3 className="text-white text-lg font-semibold mb-2">{oglas.naziv}</h3>
                                <p className="text-white font-bold mb-2">{oglas.cijena} €</p>
                                <p className="text-white text-sm">{formatDatum(oglas.datum)}</p>
                                <button
                                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    onClick={() => potvrdiBrisanje(oglas.id)}
                                >
                                    Izbriši
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {prikaziModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4 text-white">Potvrda brisanja</h3>
                        <p className="text-white">Jeste li sigurni da želite izbrisati ovaj oglas?</p>
                        <div className="flex justify-end mt-6">
                            <button
                                className="mr-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                onClick={() => setPokaziModal(false)}
                            >
                                Odustani
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={izbrisiOglas}
                            >
                                Izbriši
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MojiOglasi;
