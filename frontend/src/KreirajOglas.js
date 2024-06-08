import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import useAuth from './useAuth';
const MAX_BROJ_SLIKA = 4;

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
    const [errors, setErrors] = useState({});
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
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: ''
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

    const validateInputs = () => {
        const newErrors = {};
        if (!podaciForme.cijena || isNaN(podaciForme.cijena)) {
            newErrors.cijena = 'Cijena mora biti broj.';
        } else {
            const cijenaDecimale = podaciForme.cijena.split('.');
            if (cijenaDecimale.length > 1 && cijenaDecimale[1].length > 2) {
                newErrors.cijena = 'Cijena može imati najviše dvije decimale.';
            }
        }
        if (!podaciForme.naziv) {
            newErrors.naziv = 'Naziv je obavezan.';
        }
        if (!podaciForme.opis) {
            newErrors.opis = 'Opis je obavezan.';
        }
        if (!podaciForme.kategorija) {
            newErrors.kategorija = 'Kategorija je obavezna.';
        }
        if (podaciForme.slike.length === 0) {
            newErrors.slike = 'Morate dodati barem jednu sliku.';
        } else if (podaciForme.slike.length > MAX_BROJ_SLIKA) {
            newErrors.slike = `Možete odabrati maksimalno ${MAX_BROJ_SLIKA} slike.`;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const slanjeForme = async (e) => {
        e.preventDefault();

        if (!validateInputs()) {
            return;
        }

        const csrfToken = document.cookie
            .split('; ')
            .find((row) => row.startsWith('csrftoken='))
            ?.split('=')[1];

        let lastSelectedKategorija = '';
        if (unukKategorije.length > 0) {
            lastSelectedKategorija = podaciForme.unukKategorija || podaciForme.podkategorija || podaciForme.kategorija;
        } else {
            lastSelectedKategorija = podaciForme.podkategorija || podaciForme.kategorija;
        }

        try {
            const formData = new FormData();
            formData.append('cijena', podaciForme.cijena);
            formData.append('naziv', podaciForme.naziv);
            formData.append('opis', podaciForme.opis);
            formData.append('trajanje', podaciForme.trajanje);
            formData.append('kategorija', lastSelectedKategorija);
            formData.append('zupanija', podaciForme.zupanija);
            formData.append('grad', podaciForme.grad);
            podaciForme.slike.forEach(file => {
                formData.append('slike', file);
            });

            const response = await fetch('http://localhost:8000/api/kreiraj_oglas/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: formData,
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('Oglas kreiran!', {
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

    const removeImage = (index) => {
        const newImages = [...podaciForme.slike];
        newImages.splice(index, 1);
        setPodaciForme((prevPodaci) => ({
            ...prevPodaci,
            slike: newImages,
        }));
    };

    if (loading) {
        return <div>Loading...</div>;
    }


    return (
        <div className="bg-gray-800 p-6 rounded shadow-md max-w-3xl w-full mb-32 mx-auto">
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                toastClassName={() => "relative flex p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer bg-gray-700 border border-gray-600"}
                bodyClassName={() => "text-sm font-white font-med block p-3 text-gray-300"}
                closeButton={false}
            />
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
                        className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-rose-500"
                        required
                    />
                    {errors.cijena && <span className="text-red-500">{errors.cijena}</span>}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Naziv:</label>
                    <input
                        type="text"
                        name="naziv"
                        value={podaciForme.naziv}
                        placeholder="Unesite naziv..."
                        onChange={promjenaUnosa}
                        className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-rose-500"
                        required
                    />
                    {errors.naziv && <span className="text-red-500">{errors.naziv}</span>}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Trajanje:</label>
                    <select
                        name="trajanje"
                        value={podaciForme.trajanje}
                        onChange={promjenaUnosa}
                        className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-rose-500"
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
                        className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-rose-500"
                        required
                    >
                        <option value="">Odaberi kategoriju</option>
                        {kategorije.map((kategorija) => (
                            <option key={kategorija.id} value={kategorija.id}>
                                {kategorija.naziv}
                            </option>
                        ))}
                    </select>
                    {errors.kategorija && <span className="text-red-500">{errors.kategorija}</span>}
                </div>
                {podkategorije.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Podkategorija:</label>
                        <select
                            name="podkategorija"
                            value={podaciForme.podkategorija}
                            onChange={promjenaPodkategorije}
                            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-rose-500"
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
                            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-rose-500"
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

                <div className="mb-4 col-span-2">
                    <label htmlFor="opis" className="block text-gray-300 mb-2">Opis:</label>
                    <textarea
                        id="opis"
                        name="opis"
                        value={podaciForme.opis}
                        placeholder="Unesite opis..."
                        onChange={promjenaUnosa}
                        className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-rose-500"
                        rows="10"
                        required
                    ></textarea>

                    {errors.opis && <span className="text-red-500">{errors.opis}</span>}
                </div>

                <div className="mb-4">
                    <div className="mb-2">
                        <label className="block text-gray-300 mb-2">Dodajte slike:</label>
                        <input
                            type="file"
                            multiple
                            onChange={promjenaDatoteka}
                            className={`w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-300 ${errors.slike ? 'border-red-500' : ''}`}
                        />
                    </div>
                    {errors.slike && <span className="text-red-500">{errors.slike}</span>}
                    <div className="flex flex-wrap -mx-2">
                        {podaciForme.slike.map((image, index) => (
                            <div key={index} className="relative w-24 h-24 mx-2 mb-2">
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt={`Slika ${index + 1}`}
                                    className="w-full h-full object-cover rounded mt-2"
                                />
                                  <button
                                    type="button"
                                    className="absolute top-0 right-0 text-white px-2.5 py-1 rounded-md bg-red-500"
                                    onClick={() => removeImage(index)}
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-span-2">
                    <button type="submit" className="text-white bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg px-4 py-2 text-center ml-2">Kreiraj</button>
                </div>
            </form>
        </div>
    );
};

export default KreirajOglas;
