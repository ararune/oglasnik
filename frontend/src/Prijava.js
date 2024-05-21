import React, { useState } from 'react';

function Prijava({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:8000/prijava/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                // Store token in local storage
                localStorage.setItem('token', data.access); // Store the access token
                // Fetch the current user
                onLogin(); // Notify parent component of successful login
            } else {
                setError('Invalid username or password.');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setError('An error occurred while logging in.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleLogin} method="POST">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Username:</label>
                    <input 
                        className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
                    <input 
                        className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </div>
                <button 
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                    type="submit"
                >
                    Login
                </button>
            </form>
        </div>
    );
}

export default Prijava;
