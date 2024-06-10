import React from 'react';
import useAuth from './useAuth';
import { Link } from 'react-router-dom';
import { FaEdit, FaKey } from 'react-icons/fa';

function Profil() {
    const { user, loading } = useAuth();

    if (loading) {
        return <p>Loading user information...</p>;
    }

    return (
        <div className="rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500 p-6 rounded shadow-md max-w-lg w-full mb-32 mx-auto">
            <div className="">
                {user ? (
                    <div>
                        <p className="text-xl font-bold mb-2">{user.korisnicko_ime}</p>
                        <hr className="mb-4" />
                        <p><span className="font-bold">Ime:</span> {user.ime}</p>
                        <p><span className="font-bold">Prezime:</span> {user.prezime}</p>
                        <p><span className="font-bold">Email:</span> {user.email}</p>
                        <p><span className="font-bold">Telefon:</span> {user.telefon}</p>
                        <p><span className="font-bold">OIB:</span> {user.oib}</p>
                        <p><span className="font-bold">Datum pridruživanja:</span> {user.datum_pridruzivanja}</p>
                        <p><span className="font-bold">Grad:</span> {user.grad}</p>
                        <p><span className="font-bold">Županija:</span> {user.zupanija}</p>
                        <div className="mt-4 flex flex-wrap">
                            <Link to="/azuriraj-korisnika" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-4 py-2 flex items-center mb-2">
                                <FaEdit className="mr-2" />
                                Ažuriraj
                            </Link>
                            <Link to="/promjena-lozinke" className="ml-2 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-4 py-2 flex items-center mb-2">
                                <FaKey className="mr-2" />
                                Promjena Lozinke
                            </Link>
                        </div>
                    </div>
                ) : (
                    <p>Nema dostupnih informacija o korisniku</p>
                )}
            </div>
        </div>
    );
}

export default Profil;
