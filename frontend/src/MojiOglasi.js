import React, { useState, useEffect } from 'react';

function MojiOglasi() {
    const [oglasi, setOglasi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOglasi();
    }, []);

    const fetchOglasi = async () => {
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
                    setError('User is not authenticated');
                } else {
                    setError(`Error fetching oglasi: HTTP status ${response.status}`);
                }
            }
        } catch (error) {
            setError(`Error fetching oglasi: ${error.message}`);
        } finally {
            setLoading(false);
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
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="w-full max-w-4xl mx-auto mb-32">
            <h2 className="text-white text-2xl mb-4">Moji oglasi</h2>
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
                                    <span className="text-gray-500">No Image</span>
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <h3 className="text-white text-lg font-semibold mb-2">{oglas.naziv}</h3>
                            <p className="text-white font-bold mb-2">{oglas.cijena} €</p>
                            <p className="text-white text-sm">{formatDatum(oglas.datum)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MojiOglasi;
