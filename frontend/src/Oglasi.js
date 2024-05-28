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

    return (
        <div className="container mx-auto p-4 mb-32">
            <nav className="bg-gray-800 p-2 rounded shadow-md w-full md:max-w-4xl text-white">
                <Link to="/" className="text-blue-400 hover:underline">Natrag na početnu</Link>
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
                    <li key={oglas.id} className="bg-gray-800 p-4 rounded shadow-md">
                        {oglas.slike.length > 0 && (
                            <img src={`http://localhost:8000${oglas.slike[0]}`} alt={oglas.naziv} className="w-full h-48 object-cover rounded mb-4" />
                        )}
                        <h4 className="text-white text-xl mb-2">{oglas.naziv}</h4>
                        <p className="text-gray-300 mb-2">{oglas.opis}</p>
                        <p className="text-yellow-500 font-bold">Cijena: {oglas.cijena} €</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Oglasi;
