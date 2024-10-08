import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import useAuth from './useAuth';
import { RiCloseCircleFill } from 'react-icons/ri';
import { useParams } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
const MAX_BROJ_SLIKA = 4;

const AzurirajOglas = () => {
    const { oglasId } = useParams();
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
    const [existingImages, setExistingImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [opisCount, setOpisCount] = useState(0);

    const navigate = useNavigate();


    useEffect(() => {
        const fetchOglas = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/azuriraj_oglas/${oglasId}/`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setPodaciForme({
                        cijena: data.cijena,
                        naziv: data.naziv,
                        opis: data.opis,
                        trajanje: data.trajanje.toString(),
                        slike: [],
                        zupanija: user ? user.zupanija_id : '',
                        grad: user ? user.grad_id : '',
                    });
                    setOpisCount(data.opis.length);
                    setExistingImages(data.slike);
                    dohvatiKategorije();
                } else {
                    console.error('Error fetching oglas:', await response.json());
                }
            } catch (error) {
                console.error('Error fetching oglas:', error);
            }
        };

        if (!loading) {
            fetchOglas();
        }
    }, [oglasId, user, loading]);

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

    const promjenaDatoteka = (e) => {
        const files = Array.from(e.target.files);
        setPodaciForme((prevPodaci) => ({
            ...prevPodaci,
            slike: [...prevPodaci.slike, ...files],
        }));
    };
    const promjenaUnosa = (e) => {
        const { name, value } = e.target;

        if (name === 'opis') {
            if (value.length <= 1000) {
                setPodaciForme((prevPodaci) => ({
                    ...prevPodaci,
                    [name]: value,
                }));
                setOpisCount(value.length);
            }
        } else {
            setPodaciForme((prevPodaci) => ({
                ...prevPodaci,
                [name]: value,
            }));
        }

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: ''
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
        } else if (podaciForme.opis.length > 1000) {
            newErrors.opis = 'Opis može imati najviše 1000 znakova.';
        }
        if (!podaciForme.kategorija) {
            newErrors.kategorija = 'Kategorija je obavezna.';
        }
        if (podaciForme.slike.length + existingImages.length === 0) {
            newErrors.slike = 'Morate dodati barem jednu sliku.';
        } else if (podaciForme.slike.length + existingImages.length > MAX_BROJ_SLIKA) {
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
            podaciForme.slike.forEach((slika) => {
                formData.append('slike', slika);
            });

            imagesToDelete.forEach((slikaId) => {
                formData.append('delete_slike[]', slikaId);
            });
            
            


            const response = await fetch(`http://localhost:8000/api/azuriraj_oglas/${oglasId}/`, {
                method: 'PUT',
                headers: {
                    'X-CSRFToken': csrfToken,
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: formData,
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('Oglas ažuriran!', {
                    autoClose: 2000,
                    onClose: () => navigate('/moji_oglasi'),
                });
            } else {
                const errors = await response.json();
                console.log(errors);
            }
        } catch (error) {
            console.error('Error creating Oglas:', error);
        }
    };


    const removeExistingImage = (imageId) => {
        setImagesToDelete((prevImagesToDelete) => [...prevImagesToDelete, imageId]);
        setExistingImages((prevExistingImages) => prevExistingImages.filter((image) => image.id !== imageId));
    };

    const removeNewImage = (index) => {
        setPodaciForme((prevPodaci) => {
            const updatedSlike = [...prevPodaci.slike];
            updatedSlike.splice(index, 1);
            return { ...prevPodaci, slike: updatedSlike };
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    }


    return (
        <div className="rounded border border-gray-600 bg-gray-800 p-6 rounded shadow-md max-w-3xl w-full mb-32 mx-auto">
            <ToastContainer />
            <h1 className="text-3xl font-bold mb-6 text-center">Ažuriraj Oglas</h1>
            <form onSubmit={slanjeForme} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Cijena:</label>
                    <input
                        type="text"
                        name="cijena"
                        value={podaciForme.cijena}
                        placeholder="Unesite cijenu..."
                        onChange={promjenaUnosa}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
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
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
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
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white focus:ring-blue-500 focus:border-blue-500"
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
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white focus:ring-blue-500 focus:border-blue-500"
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
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white focus:ring-blue-500 focus:border-blue-500"
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
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                        rows="10"
                        maxLength="1000"
                        required
                    ></textarea>
                    <div className="text-gray-300 text-right">{opisCount}/1000</div>
                    {errors.opis && <span className="text-red-500">{errors.opis}</span>}
                </div>


                <div className="mb-4">
                    <label htmlFor="slike" className="block text-gray-700 font-bold mb-2">Slike</label>
                    <input
                        type="file"
                        id="slike"
                        name="slike"
                        multiple
                        accept="image/*"
                        onChange={promjenaDatoteka}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.slike ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.slike && <p className="text-red-500 mt-1">{errors.slike}</p>}
                </div>


                <div className="mb-4 col-span-2">
                    <label className="block text-gray-700 font-bold mb-2 text-white">Postojeće slike</label>
                    <div className="flex flex-wrap mb-4">
                        {existingImages.map((image) => (
                            <div key={image.id} className="relative mr-4 mb-4">
                                <img src={image.slika} alt="Slika oglasa" className="w-32 h-32 object-cover rounded-md" />
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(image.id)}
                                    className="absolute top-0 right-0 text-red-600"
                                >
                                    <RiCloseCircleFill size={24} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-4 col-span-2">
                    <label className="block text-gray-700 font-bold mb-2 text-white">Nove slike</label>
                    <div className="flex flex-wrap mb-4">
                        {podaciForme.slike.map((image, index) => (
                            <div key={index} className="relative mr-4 mb-4">
                                <img src={URL.createObjectURL(image)} alt="Slika oglasa" className="w-32 h-32 object-cover rounded-md" />
                                <button
                                    type="button"
                                    onClick={() => removeNewImage(index)}
                                    className="absolute top-0 right-0 text-red-600"
                                >
                                    <RiCloseCircleFill size={24} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-span-2">
                    <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-4 py-2 flex items-center">
                        <FaEdit className="mr-2" />
                        Ažuriraj Oglas
                    </button>
                </div>
            </form>
        </div>
    );
};
export default AzurirajOglas;
