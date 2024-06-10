import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { AiOutlineUser, AiOutlineEnvironment, AiOutlinePhone, AiOutlineMail } from 'react-icons/ai';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import useAuth from './useAuth';

function OglasDetalji() {
    const { sifra } = useParams();
    const [oglas, setOglas] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [hijerarhija, setHijerarhija] = useState([]);
    const [isFavorited, setIsFavorited] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:8000/oglas/${sifra}/`)
            .then(response => response.json())
            .then(data => {
                setOglas(data);
                setHijerarhija(data.hijerarhija);
                setIsFavorited(data.favorited); // Set the favorite status from the response
            })
            .catch(error => console.error('Error fetching oglas details:', error));
    }, [sifra]);

    const handleThumbnailClick = (index) => {
        setSelectedImageIndex(index);
    };

    const formatDatum = (datum) => {
        const date = new Date(datum);
        const dan = String(date.getDate()).padStart(2, '0');
        const mjesec = String(date.getMonth() + 1).padStart(2, '0');
        const godina = date.getFullYear();
        return `${dan}/${mjesec}/${godina}`;
    };

    const toggleFavorite = () => {
        if (!user) {
            navigate('/prijava');
            return;
        }

        const url = isFavorited ? 'favoriti/ukloni/' : 'favoriti/dodaj/';
        const method = isFavorited ? 'DELETE' : 'POST';

        fetch(`http://localhost:8000/${url}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ oglas: oglas.id })
        })
            .then(response => {
                if (response.ok) {
                    setIsFavorited(!isFavorited);
                }
            })
            .catch(error => console.error('Error:', error));
    };

    if (!oglas) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-screen-xl mx-auto p-4">
            <nav className="lg:w-2/3 px-4 py-2 rounded border border-gray-600 bg-gray-800 p-6 p-6 text-white font-bold">
                <Link to="/" className="text-white text-sm hover:underline">Oglasnik</Link>
                {hijerarhija.map((kat, index) => (
                    <span key={index} className="mx-1"> {'>'} <Link to={`/oglasi/${kat.url}`} className="text-white text-sm hover:underline">{kat.naziv}</Link></span>
                ))}
            </nav>
            <div className="mt-4 rounded border border-gray-600 bg-gray-800 p-6 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 ml-4 mb-4">
                    <div>
                        <div className="max-w-lg mx-auto bg-zinc-900 py-2 px-2">
                            <Carousel
                                showArrows={true}
                                showStatus={false}
                                showThumbs={false}
                                selectedItem={selectedImageIndex}
                            >
                                {oglas.slike.map((slika, index) => (
                                    <div key={index}>
                                        <img src={slika} alt={`Slika ${index + 1}`} className="w-full h-96 object-contain" />
                                    </div>
                                ))}
                            </Carousel>
                        </div>
                        <div className="flex mt-2 justify-center">
                            {oglas.slike.map((slika, index) => (
                                <img
                                    key={index}
                                    src={slika}
                                    alt={`Slika ${index + 1}`}
                                    className={`thumbnail cursor-pointer ${index === selectedImageIndex ? 'border-2 border-blue-500' : ''}`}
                                    onClick={() => handleThumbnailClick(index)}
                                    style={{ width: '50px', height: '50px' }} // Adjust the width and height as needed
                                />
                            ))}
                        </div>
                    </div>
                    <div className="md:flex-1 px-4">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{oglas.naziv}</h2>
                        <div className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                            <p><span className="font-bold">Šifra:</span> {oglas.sifra}</p>
                            <p><span className="font-bold">Datum:</span> {formatDatum(oglas.datum)}</p>
                            <p><span className="font-bold">Cijena:</span> {oglas.cijena} €</p>
                            <p><span className="font-bold">Kategorija:</span> {oglas.kategorija}</p>
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                            <p>
                                <span className="font-bold">
                                    <Link to={`/korisnik/${oglas.korisnik.username}`} className="text-yellow-500 hover:underline">
                                        <AiOutlineUser className="inline-block align-middle mr-2" />
                                        {oglas.korisnik.username}
                                    </Link>
                                </span>
                            </p>
                            <p><span className="font-bold"><AiOutlineEnvironment className="inline-block align-middle mr-2" /></span> {oglas.korisnik.zupanija}, {oglas.korisnik.grad}</p>
                            <p><span className="font-bold"><AiOutlinePhone className="inline-block align-middle mr-2" /></span> {oglas.korisnik.telefon}</p>
                            <p><span className="font-bold"><AiOutlineMail className="inline-block align-middle mr-2" /></span> {oglas.korisnik.email}</p>
                        </div>
                        <div className="flex items-center mb-4">
                            <button
                                onClick={toggleFavorite}
                                className="text-gray-400 hover:text-red-500 focus:outline-none"
                            >
                                {isFavorited ? <FaHeart /> : <FaRegHeart />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mb-4 ml-4 mr-4">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300">Opis</h3>
                    <p className="text-sm">{oglas.opis}</p>
                </div>
            </div>
        </div>
    );
}

export default OglasDetalji;
