import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { RiEyeFill, RiEyeOffFill } from 'react-icons/ri';

const Prijava = ({ setLoggedInUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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

            setLoggedInUser(userResponse.data);
            navigate('/');
        } catch (error) {
            console.error('Error logging in:', error);
            setError('Nevaljano korisničko ime ili lozinka.');
        }
    };

    return (
        <div className="rounded border border-gray-600 bg-gray-800 text-white p-6 rounded shadow-md max-w-md w-full mb-32 mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Prijava</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Korisničko ime</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500 w-full"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Lozinka</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500 w-full"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 dark:text-gray-400"
                        >
                            {showPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                        </button>
                    </div>
                </div>
                <div className="flex justify-between">
                </div>
                <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-4 py-2 text-center ml-2">Prijavite se</button>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                    Niste registrirani? <Link to="/registracija" className="text-blue-700 hover:underline dark:text-blue-500">Izradite račun</Link>
                </div>
            </form>
        </div>
    );
};

export default Prijava;
