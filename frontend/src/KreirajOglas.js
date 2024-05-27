import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import useAuth from './useAuth';

const KreirajOglas = () => {
    const { user, loading } = useAuth();
    const [podaciForme, setPodaciForme] = useState({
        cijena: '',
        naziv: '',
        opis: '',
        trajanje: '1',
        kategorija: '',
        slike: [],
        zupanija: user ? user.zupanija_id : '',
        grad: user ? user.grad_id : '',
    });
    const [kategorije, setKategorije] = useState([]);
    const [podkategorije, setPodkategorije] = useState([]);
    const [unukKategorije, setUnukKategorije] = useState([]);
    const [sveKategorije, setSveKategorije] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            setPodaciForme((prevPodaci) => ({
                ...prevPodaci,
                zupanija: user.zupanija_id,
                grad: user.grad_id,
            }));
            dohvatiKategorije();
        }
    }, [loading, user]);

    const dohvatiKategorije = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/kategorije/');
            const data = await response.json();
            const roditeljskeKategorije = data.filter(kategorija => kategorija.roditelj === null);
            setKategorije(roditeljskeKategorije);
            setSveKategorije(data);
        } catch (error) {
            console.error('Greška pri dohvaćanju kategorija:', error);
        }
    };

    const promjenaUnosa = (e) => {
        const { name, value } = e.target;
        setPodaciForme((prevPodaci) => ({
            ...prevPodaci,
            [name]: value,
        }));
    };

    const promjenaDatoteka = (e) => {
        const files = Array.from(e.target.files);
        setPodaciForme((prevPodaci) => ({
            ...prevPodaci,
            slike: [...prevPodaci.slike, ...files],
        }));
    };

    const promjenaKategorije = (e) => {
        const odabranaKategorijaId = parseInt(e.target.value);
        setPodaciForme((prevPodaci) => ({
            ...prevPodaci,
            kategorija: odabranaKategorijaId,
        }));

        const djeca = sveKategorije.filter(kategorija => kategorija.roditelj === odabranaKategorijaId);
        setPodkategorije(djeca);
        setUnukKategorije([]);
    };

    const promjenaPodkategorije = (e) => {
        const odabranaPodkategorijaId = parseInt(e.target.value);
        setPodaciForme((prevPodaci) => ({
            ...prevPodaci,
            podkategorija: odabranaPodkategorijaId,
            unukKategorija: ''
        }));

        // Check if the 'kategorija' value is already set, if not, set it
        if (!podaciForme.kategorija) {
            const roditeljKategorija = sveKategorije.find(kategorija => kategorija.id === odabranaPodkategorijaId)?.roditelj;
            setPodaciForme((prevPodaci) => ({
                ...prevPodaci,
                kategorija: roditeljKategorija
            }));
        }

        const unuci = sveKategorije.filter(kategorija => kategorija.roditelj === odabranaPodkategorijaId);
        setUnukKategorije(unuci);
    };

    const slanjeForme = async (e) => {
        e.preventDefault();
        const csrfToken = document.cookie
            .split('; ')
            .find((row) => row.startsWith('csrftoken='))
            ?.split('=')[1];

        // Determine the last selected kategorija
        let lastSelectedKategorija = '';
        if (unukKategorije.length > 0) {
            lastSelectedKategorija = podaciForme.unukKategorija || podaciForme.podkategorija || podaciForme.kategorija;
        } else {
            lastSelectedKategorija = podaciForme.podkategorija || podaciForme.kategorija;
        }

        try {
            const response = await fetch('http://localhost:8000/kreiraj_oglas/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    ...podaciForme,
                    kategorija: lastSelectedKategorija,
                    slike: podaciForme.slike,
                }),
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('Oglas kreiran!', {
                    autoClose: 3000,
                    onClose: () => navigate('/'),
                });
            } else {
                const errors = await response.json();
                console.log(errors);
            }
        } catch (error) {
            console.error('Error creating Oglas:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    return (
        <div className="bg-gray-800 p-6 rounded shadow-md max-w-3xl w-full mb-32 mx-auto">
            <ToastContainer />
            <h1 className="text-3xl font-bold mb-6 text-center">Kreiraj Oglas</h1>
            <form onSubmit={slanjeForme} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Cijena:</label>
                    <input
                        type="text"
                        name="cijena"
                        value={podaciForme.cijena}
                        placeholder="Unesite cijenu..."
                        onChange={promjenaUnosa}
                        className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-900"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Naziv:</label>
                    <input
                        type="text"
                        name="naziv"
                        value={podaciForme.naziv}
                        placeholder="Unesite naziv..."
                        onChange={promjenaUnosa}
                        className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-900"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Opis:</label>
                    <textarea
                        name="opis"
                        value={podaciForme.opis}
                        placeholder="Unesite opis..."
                        onChange={promjenaUnosa}
                        className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-900"
                        required
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Trajanje:</label>
                    <select
                        name="trajanje"
                        value={podaciForme.trajanje}
                        onChange={promjenaUnosa}
                        className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-900"
                        required
                    >
                        <option value="1">1 dan</option>
                        <option value="7">1 tjedan</option>
                        <option value="30">1 mjesec</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Kategorija:</label>
                    <select
                        name="kategorija"
                        value={podaciForme.kategorija}
                        onChange={promjenaKategorije}
                        className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-900"
                        required
                    >
                        <option value="">Odaberi kategoriju</option>
                        {kategorije.map((kategorija) => (
                            <option key={kategorija.id} value={kategorija.id}>
                                {kategorija.naziv}
                            </option>
                        ))}
                    </select>
                </div>
                {podkategorije.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Podkategorija:</label>
                        <select
                            name="podkategorija"
                            value={podaciForme.podkategorija}
                            onChange={promjenaPodkategorije}
                            className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-900"
                            required
                        >
                            <option value="">Odaberi podkategoriju</option>
                            {podkategorije.map((podkategorija) => (
                                <option key={podkategorija.id} value={podkategorija.id}>
                                    {podkategorija.naziv}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {unukKategorije.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Unuk kategorija:</label>
                        <select
                            name="unukKategorija"
                            value={podaciForme.unukKategorija}
                            onChange={promjenaUnosa}
                            className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-900"
                            required
                        >
                            <option value="">Odaberi unuk kategoriju</option>
                            {unukKategorije.map((unukKategorija) => (
                                <option key={unukKategorija.id} value={unukKategorija.id}>
                                    {unukKategorija.naziv}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Slike:</label>
                    <input
                        type="file"
                        name="slike"
                        onChange={promjenaDatoteka}
                        multiple
                        className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-900"
                        required
                    />
                </div>
                <div className="col-span-2">
                    <button type="submit" className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded focus:outline-none focus:bg-blue-600 transition-colors">Kreiraj</button>
                </div>
            </form>
        </div>
    );
};

export default KreirajOglas;