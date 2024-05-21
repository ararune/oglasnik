import React, { useState, useEffect } from 'react';

function Profil() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/trenutni_korisnik/', {
                credentials: 'include',
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                console.error('Error fetching user: HTTP status', response.status);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-4xl">
            {user && (
                <div>
                    <p className="text-xl font-bold mb-2">{user.korisnicko_ime}</p>
                    <hr className="mb-4" />
                    <p><span className="font-bold">Ime:</span> {user.ime}</p>
                    <p><span className="font-bold">Prezime:</span> {user.prezime}</p>
                    <p><span className="font-bold">Email:</span> {user.email}</p>
                    <p><span className="font-bold">Datum pridruživanja:</span> {user.datum_pridruzivanja}</p>
                    <p><span className="font-bold">Grad:</span> {user.grad}</p>
                    <p><span className="font-bold">Županija:</span> {user.zupanija}</p>
                </div>
            )}
        </div>
    );
}

export default Profil;
