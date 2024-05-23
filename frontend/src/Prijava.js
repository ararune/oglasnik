// Prijava.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Prijava = ({ setLoggedInUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/token/', {
                username,
                password
            }, { withCredentials: true });

            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            const userResponse = await axios.get('http://localhost:8000/api/trenutni_korisnik/', {
                headers: {
                    Authorization: `Bearer ${access}`
                }
            });

            setLoggedInUser(userResponse.data.ime);
            navigate('/');
        } catch (error) {
            console.error('Error logging in:', error);
            setError('Nevaljano korisničko ime ili lozinka.');
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded shadow-md max-w-md w-full mb-32">
            <h2 className="text-3xl font-bold mb-6">Prijava</h2>
            <p>
                Niste registrirani?
                <Link to="/registracija" className="text-blue-500 hover:text-blue-700 underline"> Registrirajte se ovdje</Link>.
            </p>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className='mt-4'>
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Korisničko ime:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 text-white"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Lozinka:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 text-white"
                        required
                    />
                </div>
                <button type="submit" className="w-full p-2 bg-blue-500 hover:bg-blue-600 rounded">Prijavi se</button>
            </form>
        </div>
    );
};

export default Prijava;
