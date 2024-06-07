import React, { useState, useEffect } from 'react';

const IzradaOglasa = () => {
    const [cijena, setCijena] = useState('');
    const [naziv, setNaziv] = useState('');
    const [opis, setOpis] = useState('');
    const [trajanje, setTrajanje] = useState('');
    const [kategorija, setKategorija] = useState('');
    const [podkategorija, setPodkategorija] = useState('');
    const [subSubcategory, setSubSubcategory] = useState(''); // State for sub-subcategory
    const [slike, setSlike] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [subSubcategories, setSubSubcategories] = useState([]); // State for storing sub-subcategories
    const [allCategories, setAllCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/kategorije/');
            const data = await response.json();
            const parentCategories = data.filter(category => category.roditelj === null);
            setCategories(parentCategories);
            setAllCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Something went wrong. Please try again later.');
        }
    };

    const handleCategoryChange = (e) => {
        const selectedCategoryId = parseInt(e.target.value);
        setKategorija(selectedCategoryId);

        const children = allCategories.filter(category => category.roditelj === selectedCategoryId);
        setSubcategories(children);
        setPodkategorija('');
    };

    const handleSubcategoryChange = (e) => {
        const selectedSubcategoryId = parseInt(e.target.value);
        setPodkategorija(selectedSubcategoryId);

        const subSubcategories = allCategories.filter(category => category.roditelj === selectedSubcategoryId);
        setSubSubcategories(subSubcategories);
        setSubSubcategory('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Fetch CSRF token
        const response = await fetch('http://localhost:8000/csrf/', {
            method: 'GET',
            credentials: 'include', // Ensure cookies are included in the request
        });
        const csrftoken = response.headers.get('X-CSRFToken');

        // Create FormData object and append form data
        const formData = new FormData();
        formData.append('cijena', cijena);
        formData.append('naziv', naziv);
        formData.append('opis', opis);
        formData.append('trajanje', trajanje);
        formData.append('kategorija', kategorija);
        formData.append('podkategorija', podkategorija);
        formData.append('subSubcategory', subSubcategory);
        const filesArray = Array.from(slike);
        filesArray.forEach(file => {
            formData.append('slike', file);
        });

        try {
            // Make POST request with CSRF token included in headers
            const response = await fetch('http://localhost:8000/izrada_oglasa/', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'X-CSRFToken': csrftoken, // Include CSRF token in headers
                },
                credentials: 'include', // Ensure cookies are included in the request
            });

            if (response.ok) {
                setSuccess(true);
            } else {
                const data = await response.json();
                setError(data);
            }

        } catch (error) {
            // Log last selected value based on conditions
            if (subSubcategories.length > 0) {
                const selectedSubSubcategory = subSubcategories.find(subSub => subSub.id === parseInt(subSubcategory));
                console.log("Last selected value for subSubcategory:", selectedSubSubcategory ? selectedSubSubcategory.naziv : '');
            } else if (subcategories.length > 0) {
                const selectedSubcategory = subcategories.find(sub => sub.id === parseInt(podkategorija));
                console.log("Last selected value for podkategorija:", selectedSubcategory ? selectedSubcategory.naziv : '');
            }
            console.error('Error creating Oglas:', error);
            setError('Something went wrong. Please try again later.');
        }
    };


    return (
        <div className="bg-gray-800 p-6 rounded shadow-md max-w-3xl w-full mb-32 mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Izrada Oglasa</h2>
            {success ? (
                <p>Oglas uspješno kreiran!</p>
            ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                    <div>
                        <label htmlFor="cijena" className="block text-gray-300 mb-2">Cijena:</label>
                        <input type="number" id="cijena" value={cijena} onChange={(e) => setCijena(e.target.value)} required className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-900" />
                    </div>
                    <div>
                        <label htmlFor="naziv" className="block text-gray-300 mb-2">Naziv:</label>
                        <input type="text" id="naziv" value={naziv} onChange={(e) => setNaziv(e.target.value)} required className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-900" />
                    </div>
                    <div>
                        <label htmlFor="opis" className="block text-gray-300 mb-2">Opis:</label>
                        <textarea id="opis" value={opis} onChange={(e) => setOpis(e.target.value)} required className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-900" />
                    </div>
                    <div>
                        <label htmlFor="trajanje" className="block text-gray-300 mb-2">Trajanje:</label>
                        <select id="trajanje" value={trajanje} onChange={(e) => setTrajanje(e.target.value)} required className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-900">
                            <option value="">Odaberi trajanje</option>
                            <option value="1">1 dan</option>
                            <option value="7">1 tjedan</option>
                            <option value="30">1 mjesec</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="kategorija" className="block text-gray-300 mb-2">Kategorija:</label>
                        <select
                            id="kategorija"
                            value={kategorija}
                            onChange={handleCategoryChange}
                            required
                            className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-900"
                        >
                            <option value="">Odaberi kategoriju</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.naziv}
                                </option>
                            ))}
                        </select>
                    </div>
                    {subcategories.length > 0 && (
                        <div>
                            <label htmlFor="podkategorija" className="block text-gray-300 mb-2">Podkategorija:</label>
                            <select
                                id="podkategorija"
                                value={podkategorija}
                                onChange={handleSubcategoryChange}
                                required
                                className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-900"
                            >
                                <option value="">Odaberi podkategoriju</option>
                                {subcategories.map(subcategory => (
                                    <option key={subcategory.id} value={subcategory.id}>
                                        {subcategory.naziv}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {subSubcategories.length > 0 && (
                        <div>
                            <label htmlFor="subSubcategory" className="block text-gray-300 mb-2">Sub-subkategorija:</label>
                            <select
                                id="subSubcategory"
                                value={subSubcategory}
                                onChange={(e) => setSubSubcategory(e.target.value)}
                                required
                                className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-900"
                            >
                                <option value="">Odaberi sub-subkategoriju</option>
                                {subSubcategories.map(subSubcategory => (
                                    <option key={subSubcategory.id} value={subSubcategory.id}>
                                        {subSubcategory.naziv}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label htmlFor="slike" className="block text-gray-300 mb-2">Slike:</label>
                        <input type="file" id="slike" accept="image/*" multiple onChange={(e) => setSlike(e.target.files)} required className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:bg-gray-900" />
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    <button type="submit" className="w-full px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded focus:outline-none focus:bg-rose-600 transition-colors">Kreiraj Oglas</button>
                </form>
            )}
        </div>
    );
};

export default IzradaOglasa;

