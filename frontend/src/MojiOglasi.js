import React, { useState, useEffect } from 'react';

function MojiOglasi() {
    const [oglasi, setOglasi] = useState([]);

    useEffect(() => {
        fetchOglasi();
    }, []);

    const fetchOglasi = async () => {
        try {
            const response = await fetch('http://localhost:8000/moji_oglasi/', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setOglasi(data.oglasi);
            } else {
                console.error('Error fetching oglasi: HTTP status', response.status);
            }
        } catch (error) {
            console.error('Error fetching oglasi:', error);
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

    return (
        <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-4xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <h2>Moji oglasi</h2>
                <ul>
                    {oglasi.map((oglas) => (
                        <li key={oglas.id}>
                            <p>Naziv: {oglas.naziv}</p>
                            <p>Opis: {oglas.opis}</p>
                            <p>Cijena: {oglas.cijena} €</p>
                            <p>Datum: {formatDatum(oglas.datum)}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default MojiOglasi;
