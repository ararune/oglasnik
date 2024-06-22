import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import {
    AiOutlineUser, AiOutlineEnvironment, AiOutlinePhone, AiOutlineMail,
    AiOutlineEye, AiOutlineBarcode, AiOutlineCalendar, AiOutlineEuroCircle,
    AiOutlineTags
} from 'react-icons/ai';
import { FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight, FaHome } from 'react-icons/fa';
import useAuth from './useAuth';
import { debounce } from 'lodash';

const OglasDetalji = () => {
    const { sifra } = useParams();
    const [oglas, setOglas] = useState(null);
    const [selectedModalImageIndex, setSelectedModalImageIndex] = useState(0);
    const [selectedOutsideThumbnailIndex, setSelectedOutsideThumbnailIndex] = useState(0);
    const [hijerarhija, setHijerarhija] = useState([]);
    const [isFavorited, setIsFavorited] = useState(false);
    const { user } = useAuth();
    const [brojPregleda, setBrojPregleda] = useState(0);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/oglas/${sifra}/`);
                const data = await response.json();
                setOglas(data);
                setHijerarhija(data.hijerarhija);
                setIsFavorited(data.favorited);
                setBrojPregleda(data.broj_pregleda);
            } catch (error) {
                console.error('Error fetching oglas details:', error);
            }
        };

        const debouncedFetchData = debounce(fetchData, 100);

        debouncedFetchData();

        return () => {
            debouncedFetchData.cancel();
        };
    }, [sifra]);

    useEffect(() => {
        const handleBodyOverflow = () => {
            document.body.style.overflow = isModalOpen ? 'hidden' : 'auto';
        };

        handleBodyOverflow();

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isModalOpen]);

    const handleThumbnailClick = (index) => {
        setSelectedModalImageIndex(index);
        setSelectedOutsideThumbnailIndex(index);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const formatDatum = (datum) => {
        const date = new Date(datum);
        const dan = String(date.getDate()).padStart(2, '0');
        const mjesec = String(date.getMonth() + 1).padStart(2, '0');
        const godina = date.getFullYear();
        return `${dan}/${mjesec}/${godina}`;
    };

    const formatirajCijenu = (cijena) => {
        const parsedPrice = parseFloat(cijena);

        if (Number.isInteger(parsedPrice)) {
            return parsedPrice.toLocaleString('hr-HR') + ' €';
        } else {
            return parsedPrice.toLocaleString('hr-HR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + ' €';
        }
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

    const handlePrev = () => {
        setSelectedModalImageIndex(prevIndex => prevIndex === 0 ? oglas.slike.length - 1 : prevIndex - 1);
    };

    const handleNext = () => {
        setSelectedModalImageIndex(prevIndex => (prevIndex + 1) % oglas.slike.length);
    };

    if (!oglas) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-screen-xl mx-auto p-4">
            <Navigation hijerarhija={hijerarhija} />
            <div className="mt-4 rounded border border-gray-600 bg-gray-800 p-6 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 ml-4 mb-4">
                    <ImageCarousel
                        oglas={oglas}
                        selectedOutsideThumbnailIndex={selectedOutsideThumbnailIndex}
                        openModal={openModal}
                        handleThumbnailClick={handleThumbnailClick}
                    />
                    <div className="md:flex-1 px-4">
                        <OglasDetails
                            oglas={oglas}
                            formatDatum={formatDatum}
                            formatirajCijenu={formatirajCijenu}
                            brojPregleda={brojPregleda}
                            toggleFavorite={toggleFavorite}
                            isFavorited={isFavorited}
                            navigate={navigate}
                            user={user}
                        />
                    </div>
                </div>
                <div className="mb-4 ml-4 mr-4">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300">Opis</h3>
                    <p className="text-sm">{oglas.opis}</p>
                </div>
            </div>
            <KorisnikDetails oglas={oglas} />
            <ModalView
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                handlePrev={handlePrev}
                handleNext={handleNext}
                oglas={oglas}
                selectedModalImageIndex={selectedModalImageIndex}
                handleThumbnailClick={handleThumbnailClick}
            />
        </div>
    );
};

const Navigation = ({ hijerarhija }) => (
    <nav className="px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white font-bold flex items-center flex-wrap">
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

const ImageCarousel = ({ oglas, selectedOutsideThumbnailIndex, openModal, handleThumbnailClick }) => (
    <div>
        <div className="max-w-lg mx-auto bg-zinc-900 py-2 px-2">
            <Carousel
                showArrows={true}
                showStatus={false}
                showThumbs={false}
                selectedItem={selectedOutsideThumbnailIndex}
                onClickItem={openModal}
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
                    className={`thumbnail cursor-pointer mr-2 ${index === selectedOutsideThumbnailIndex ? 'border-2 border-blue-500' : ''}`}
                    onClick={() => handleThumbnailClick(index)}
                    style={{ width: '50px', height: '50px' }}
                />
            ))}
        </div>
    </div>
);
const KorisnikDetails = ({ oglas }) => (
    <div className="mt-4 rounded border border-gray-600 bg-gray-800 p-6 overflow-hidden">
        <h3 className="font-bold">Podaci o korisniku</h3>
        <div className="mt-2 text-gray-600 dark:text-gray-300 text-md mb-4">
            <p className="flex items-center">
                <AiOutlineUser className="text-lg mr-2" />
                <span className="font-semibold">
                    <Link to={`/korisnik/${oglas.korisnik.username}`} className="text-blue-500 hover:underline">
                        {oglas.korisnik.username}
                    </Link>
                </span>
            </p>
            <p className="flex items-center">
                <AiOutlineEnvironment className="text-lg mr-2" />
                <span className="font-semibold">{oglas.korisnik.zupanija}, {oglas.korisnik.grad}</span>
            </p>
            <p className="flex items-center">
                <AiOutlinePhone className="text-lg mr-2" />
                <span className="font-semibold">{oglas.korisnik.telefon}</span>
            </p>
            <p className="flex items-center">
                <AiOutlineMail className="text-lg mr-2" />
                <span className="font-semibold">{oglas.korisnik.email}</span>
            </p>
        </div>
    </div>
);
const OglasDetails = ({ oglas, formatDatum, formatirajCijenu, brojPregleda, toggleFavorite, isFavorited, navigate, user }) => (
    <div className="md:flex-1 px-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{oglas.naziv}</h2>
        <div className="text-gray-600 dark:text-gray-300 text-md mb-4">
            <p><AiOutlineBarcode className="inline-block mr-2 text-xl" /><span className="font-bold">Šifra:</span> {oglas.sifra}</p>
            <p><AiOutlineCalendar className="inline-block mr-2 text-xl" /><span className="font-bold">Datum:</span> {formatDatum(oglas.datum)}</p>
            <p><AiOutlineEuroCircle className="inline-block mr-2 text-xl" /><span className="font-bold">Cijena:</span> {formatirajCijenu(oglas.cijena)}</p>
            <p><AiOutlineTags className="inline-block mr-2 text-xl" /><span className="font-bold">Kategorija:</span> {oglas.kategorija}</p>
            <p><AiOutlineEye className="inline-block mr-2 text-xl" /><span className="font-bold">Broj pregleda:</span> {brojPregleda}</p>
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
);

const ModalView = ({ isModalOpen, closeModal, handlePrev, handleNext, oglas, selectedModalImageIndex, handleThumbnailClick }) => (
    <>
        {isModalOpen && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="max-w-screen-lg mx-auto bg-transparent overflow-hidden">
                    <button className="absolute top-4 right-4 text-white text-4xl" onClick={closeModal}>
                        &times;
                    </button>
                    <div className="relative">
                        <div className="flex items-center justify-center">
                            <img
                                src={oglas.slike[selectedModalImageIndex]}
                                alt={`Slika ${selectedModalImageIndex + 1}`}
                                className="w-full max-h-screen object-contain"
                                style={{ maxHeight: '80vh' }}
                            />
                        </div>
                        <div className="flex mt-4 justify-center space-x-2">
                            {oglas.slike.map((slika, index) => (
                                <img
                                    key={index}
                                    src={slika}
                                    alt={`Slika ${index + 1}`}
                                    className={`thumbnail cursor-pointer ${index === selectedModalImageIndex ? 'border-2 border-blue-500' : ''}`}
                                    style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                                    onClick={() => handleThumbnailClick(index)}
                                />
                            ))}
                        </div>
                        <button
                            onClick={handlePrev}
                            className="absolute top-1/2 left-4 -translate-y-1/2 bg-gray-700 bg-opacity-50 text-white rounded-full p-2 transition duration-300 hover:bg-opacity-70"
                            style={{ transform: 'translateY(-50%)' }}
                        >
                            <FaChevronLeft />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute top-1/2 right-4 -translate-y-1/2 bg-gray-700 bg-opacity-50 text-white rounded-full p-2 transition duration-300 hover:bg-opacity-70"
                            style={{ transform: 'translateY(-50%)' }}
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
);

export default OglasDetalji;
