import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function Oglasi() {
    const { category } = useParams();
    const [oglasi, setOglasi] = useState([]);
    const [hijerarhija, setHijerarhija] = useState([]);
    const [children, setChildren] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:8000/oglasi/${category}/`)
            .then(response => response.json())
            .then(data => {
                setOglasi(data.oglasi);
                setHijerarhija(data.hijerarhija);
                setChildren(data.children);
            })
            .catch(error => console.error('Error fetching ads:', error));
    }, [category]);
    const formatDatum = (datum) => {
        const date = new Date(datum);
        const dan = String(date.getDate()).padStart(2, '0');
        const mjesec = String(date.getMonth() + 1).padStart(2, '0');
        const godina = date.getFullYear();
        return `${dan}/${mjesec}/${godina}`;
    };
    return (
        <div className="container mx-auto p-4 mb-32">
            <nav className="bg-gray-800 p-3 rounded shadow-md w-full md:max-w-4xl text-white">
                <Link to="/" className="text-blue-400 hover:underline">Oglasnik</Link>
                {hijerarhija.map((kat, index) => (
                    <span key={index} className="mx-1"> {'>'} <Link to={`/oglasi/${kat.url}`} className="text-blue-400 hover:underline">{kat.naziv}</Link></span>
                ))}
            </nav>

            <h2 className="text-white text-2xl my-4">Oglasi po kategoriji: {category}</h2>

            <h3 className="text-white text-xl mb-2">Podkategorije:</h3>
            <ul className="list-disc list-inside text-white mb-4">
                {children.map((child, index) => (
                    <li key={index}>
                        <Link to={`/oglasi/${child.url}`} className="text-blue-400 hover:underline">{child.naziv}</Link>
                    </li>
                ))}
            </ul>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {oglasi.map(oglas => (
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