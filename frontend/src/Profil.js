import React from 'react';
import useAuth from './useAuth';
import { Link } from 'react-router-dom';
import { FaEdit, FaKey } from 'react-icons/fa';
import { AiOutlineUser, AiOutlineIdcard, AiOutlineMail, AiOutlinePhone, AiOutlineEnvironment, AiOutlineCalendar, AiOutlineWarning } from 'react-icons/ai';

function Profil() {
    const { user, loading } = useAuth();

    if (loading) {
        return <p>Loading user information...</p>;
    }

    return (
        <>
            {user ? (
                <div className="max-w-lg mx-auto bg-gray-800 rounded-lg border border-gray-600 overflow-hidden shadow-lg mb-6">
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <AiOutlineUser className="w-16 h-16 text-gray-400 rounded-full mr-4" />
                            <h2 className="text-white text-3xl font-bold">{user.korisnicko_ime}</h2>
                        </div>
                        <div className="space-y-2">
                            <div className="text-gray-400 flex items-center">
                                <AiOutlineIdcard className="mr-2 text-xl" />
                                <span><strong>Ime i prezime:</strong> {user.ime} {user.prezime}</span>
                            </div>
                            <div className="text-gray-400 flex items-center">
                                <AiOutlineMail className="mr-2 text-xl" />
                                <span><strong>Email:</strong> {user.email}</span>
                            </div>
                            <div className="text-gray-400 flex items-center">
                                <AiOutlinePhone className="mr-2 text-xl" />
                                <span><strong>Telefon:</strong> {user.telefon}</span>
                            </div>
                            <div className="text-gray-400 flex items-center">
                                <AiOutlineIdcard className="mr-2 text-xl" />
                                <span><strong>OIB:</strong> {user.oib}</span>
                            </div>
                            <div className="text-gray-400 flex items-center">
                                <AiOutlineEnvironment className="mr-2 text-xl" />
                                <span><strong>Lokacija:</strong> {user.grad}, {user.zupanija}</span>
                            </div>
                            <div className="text-gray-400 flex items-center">
                                <AiOutlineCalendar className="mr-2 text-xl" />
                                <span><strong>Datum pridruživanja:</strong> {user.datum_pridruzivanja}</span>
                            </div>
                        </div>
                    </div>
                </div>
           ) : (
            <div className="flex items-center justify-center text-gray-400">
                <AiOutlineWarning className="text-xl mr-2" />
                <span>Nema dostupnih informacija o korisniku</span>
            </div>
        )}
            <div className="flex justify-between max-w-lg mx-auto">
                <Link to="/azuriraj-korisnika" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-4 py-2 flex items-center mb-2">
                    <FaEdit className="mr-2" />
                    Ažuriraj
                </Link>
                <Link to="/promjena-lozinke" className="ml-2 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-4 py-2 flex items-center mb-2">
                    <FaKey className="mr-2" />
                    Promjena Lozinke
                </Link>
            </div>
        </>
    );
}

export default Profil;
