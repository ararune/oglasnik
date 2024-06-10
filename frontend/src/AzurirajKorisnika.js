import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from './useAuth';
import { FaEdit } from 'react-icons/fa';
const AzurirajKorisnika = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        oib: '',
        zupanija: '',
        grad: '',
        telefon: ''
    });

    const [zupanije, setZupanije] = useState([]);
    const [gradovi, setGradovi] = useState([]);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (zupanije.length === 0) {
            fetchZupanije();
        }
        if (user) {
            setFormData({
                email: user.email,
                first_name: user.ime,
                last_name: user.prezime,
                oib: user.oib,
                zupanija: user.zupanija_id,
                grad: user.grad_id,
                telefon: user.telefon
            });
            fetchGradovi(user.zupanija_id);
        }
    }, [user, zupanije]);

    const fetchZupanije = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/zupanije/');
            const data = await response.json();
            setZupanije(data);
        } catch (error) {
            console.error('Error pri dohvaćanju županija:', error);
        }
    };

    const fetchGradovi = async (zupanijaId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/gradovi/?zupanija=${zupanijaId}`);
            const data = await response.json();
            setGradovi(data);
        } catch (error) {
            console.error('Error pri dohvaćanju gradova:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleZupanijaChange = (e) => {
        const { value } = e.target;
        setFormData({
            ...formData,
            zupanija: value,
            grad: ''
        });
        fetchGradovi(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];

        try {
            const response = await fetch('http://localhost:8000/azuriraj-korisnika/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success('Korisnik ažuriran!', {
                    onClose: () => navigate('/profil'),
                });
            } else {
                const data = await response.json();
                setErrors(data);
            }
        } catch (error) {
            toast.error('Greška pri ažuriranju!');
            console.error('Error updating user:', error);
        }
    };


    return (
        <div className="rounded border border-gray-600 bg-gray-800 p-6 rounded shadow-md max-w-3xl w-full mb-32 mx-auto">
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
            <h2 className="text-3xl font-bold mb-6 text-center">Ažuriraj Korisnika</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            placeholder="Unesite e-mail..."
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                        {errors.email && <p className="text-red-500">{errors.email}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Ime:</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            placeholder="Unesite ime..."
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                        {errors.first_name && <p className="text-red-500">{errors.first_name}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Prezime:</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            placeholder="Unesite prezime..."
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                        {errors.last_name && <p className="text-red-500">{errors.last_name}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">OIB:</label>
                        <input
                            type="text"
                            name="oib"
                            value={formData.oib}
                            placeholder="OIB sadrži 11 znamenki..."
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                        {errors.oib && <p className="text-red-500">{errors.oib}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Telefon:</label>
                        <input
                            type="tel"
                            name="telefon"
                            value={formData.telefon}
                            placeholder="Unesite broj telefona..."
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                        {errors.telefon && <p className="text-red-500">{errors.telefon}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Županija:</label>
                        <select
                            name="zupanija"
                            value={formData.zupanija}
                            onChange={handleZupanijaChange}
                            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                            required
                        >
                            <option value="">Odaberi županiju</option>
                            {zupanije.map((zupanija) => (
                                <option key={zupanija.id} value={zupanija.id}>
                                    {zupanija.naziv}
                                </option>
                            ))}
                        </select>
                        {errors.zupanija && <p className="text-red-500">{errors.zupanija}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Grad:</label>
                        <select
                            name="grad"
                            value={formData.grad}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                            required
                        >
                            <option value="">Odaberi grad</option>
                            {gradovi.map((grad) => (
                                <option key={grad.id} value={grad.id}>
                                    {grad.naziv}
                                </option>
                            ))}
                        </select>
                        {errors.grad && <p className="text-red-500">{errors.grad}</p>}
                    </div>

                </div>
                <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-4 py-2 flex items-center">
                    <FaEdit className="mr-2" />
                    Ažuriraj Korisnika
                </button>
            </form>
        </div>
    );
};

export default AzurirajKorisnika;
