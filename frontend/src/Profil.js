import React from 'react';
import useAuth from './useAuth';

function Profil() {
    const { user, loading } = useAuth();

    if (loading) {
        return <p>Loading user information...</p>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-4xl mb-32">
                {user ? (
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
                ) : (
                    <p>No user information available</p>
                )}
            </div>
        </div>
    );
}

export default Profil;
