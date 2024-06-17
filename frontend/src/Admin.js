import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useAuth from './useAuth';
import { AiOutlineEnvironment, AiOutlineCalendar, AiOutlineIdcard, AiOutlineEuroCircle, AiOutlinePhone,  AiOutlineMail } from 'react-icons/ai';
import { FaUserShield, FaUser } from 'react-icons/fa';

const Admin = () => {
    const { user, loading } = useAuth();
    const [error, setError] = useState(null);
    const [oglasi, setOglasi] = useState([]);
    const [korisnici, setKorisnici] = useState([]);
    const [activeTab, setActiveTab] = useState('oglasi');
    const [showModal, setShowModal] = useState(false);
    const [oglasToDelete, setOglasToDelete] = useState(null);
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const accessToken = localStorage.getItem('access_token');
                const headers = {
                    Authorization: `Bearer ${accessToken}`,
                };

                const response = await axios.get('/admin-panel/', { headers });
                setOglasi(response.data.oglasi);
                setKorisnici(response.data.korisnici);
            } catch (error) {
                setError('Unauthorized or unable to fetch admin data');
            }
        };

        if (user) {
            fetchAdminData();
        }
    }, [user]);

    if (error) {
        return <div>{error}</div>;
    }

    if (loading || !user) {
        return <div>Loading...</div>;
    }

    const izbrisiOglas = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axios.delete(`http://localhost:8000/api/oglasi/${oglasToDelete}/`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (response.status === 204) {
                // Remove the deleted item from the state
                setOglasi(oglasi.filter(oglas => oglas.id !== oglasToDelete));
            } else {
                console.error('Greška prilikom brisanja oglasa: HTTP status', response.status);
            }
        } catch (error) {
            console.error('Greška prilikom brisanja oglasa:', error);
        } finally {
            // Close the modal and reset the state
            setShowModal(false);
            setOglasToDelete(null);
        }
    };



    const formatDatum = (datum) => {
        const date = new Date(datum);
        const dan = String(date.getDate()).padStart(2, '0');
        const mjesec = String(date.getMonth() + 1).padStart(2, '0');
        const godina = date.getFullYear();
        return `${dan}/${mjesec}/${godina}`;
    };
    const potvrdiBrisanje = (id) => {
        setOglasToDelete(id);
        setShowModal(true);
    };

    const renderOglasi = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {oglasi.map((oglas) => (
                <div key={oglas.id} className="relative rounded border border-gray-600 bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden shadow-md flex flex-row items-start">
                    {oglas.slike && oglas.slike.length > 0 && (
                        <Link to={`/oglas/${oglas.sifra}`} className="block">
                            <img src={`http://localhost:8000${oglas.slike[0].slika}`} alt={oglas.naziv} className="w-48 h-48 object-cover" />
                        </Link>
                    )}
                    <div className="flex flex-col justify-between p-4 flex-grow">
                        <div>
                            <Link to={`/oglas/${oglas.sifra}`} className="block">
                                <h4 className="text-white text-xl font-bold mb-2">{oglas.naziv}</h4>
                            </Link>
                            <p className="text-gray-400 text-sm mb-2">
                                <AiOutlineCalendar className="inline-block mr-1" />
                                Objavljen: {formatDatum(oglas.datum)}
                            </p>
                            <p className="text-gray-400 text-sm mb-2">
                                <AiOutlineEnvironment className="inline-block mr-1" />
                                {oglas.zupanija.naziv}, {oglas.grad.naziv}
                            </p>
                        </div>
                        <p className="text-yellow-500 text-lg font-bold">
                            <AiOutlineEuroCircle className="inline-block mr-1" />
                            {oglas.cijena} €
                        </p>
                        <div className="flex justify-end mt-4">
                            <button onClick={() => potvrdiBrisanje(oglas.id)} className="text-white bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:bg-gradient-to-br font-medium rounded-lg px-4 py-2 text-center ml-2 mr-2">
                                Izbriši
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <p className="text-white mb-4">Jeste li sigurni da želite izbrisati ovaj oglas?</p>
                        <div className="flex justify-end">
                            <button onClick={() => setShowModal(false)} className="bg-gray-300 text-gray-800 py-2 px-4 rounded mr-2">
                                Odustani
                            </button>
                            <button onClick={izbrisiOglas} className="text-white bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:bg-gradient-to-br font-medium rounded-lg px-4 py-2 text-center ml-2 mr-2">
                                Izbriši
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );


    const renderKorisnici = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {korisnici.map((korisnik) => (
                <div key={korisnik.id} className="rounded border border-gray-600 bg-gray-800 p-4 rounded-lg shadow-md">
                    <Link to={`/korisnik/${korisnik.username}`} className="text-white flex items-center mb-4 hover:underline">
                        {korisnik.uloga === 'Admin' ? (
                            <FaUserShield className="w-16 h-16 text-yellow-500 rounded-full mr-4" />
                        ) : (
                            <FaUser className="w-16 h-16 text-green-500 rounded-full mr-4" />
                        )}
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-1">{korisnik.username}</h2>
                            <p className="text-yellow-500 text-sm font-bold">{korisnik.uloga}</p>
                        </div>
                    </Link>
                    <div className="flex items-center text-gray-400 text-sm mb-2">
                        <AiOutlineIdcard className="mr-2" />
                        Ime i prezime: {korisnik.first_name} {korisnik.last_name}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm mb-2">
                        <AiOutlineMail className="mr-2" />
                        Email: {korisnik.email}
                    </div>

                    <div className="flex items-center text-gray-400 text-sm mb-2">
                        <AiOutlinePhone className="mr-2" />
                        Telefon: {korisnik.telefon}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm mb-2">
                        <AiOutlineEnvironment className="mr-2" />
                        Lokacija: {korisnik.zupanija_naziv}, {korisnik.grad_naziv}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm mb-2">
                        <AiOutlineCalendar className="mr-2" />
                        Datum pridruživanja: {korisnik.date_joined}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full max-w-6xl mx-auto mb-32">
            <div className="max-w-lg mx-auto bg-gray-800 rounded-lg border border-gray-600 overflow-hidden shadow-lg mb-6">
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <FaUserShield className="w-16 h-16 text-yellow-500 rounded-full mr-4" />
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
                            <span><strong>Lokacija:</strong> {user.zupanija}, {user.grad}</span>
                        </div>
                        <div className="text-gray-400 flex items-center">
                            <AiOutlineCalendar className="mr-2 text-xl" />
                            <span><strong>Datum pridruživanja:</strong> {user.datum_pridruzivanja}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mb-6">
                <button
                    className={`px-4 py-2 mx-2 ${activeTab === 'oglasi' ? 'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-center' : 'bg-gray-800'} text-white rounded`}
                    onClick={() => setActiveTab('oglasi')}
                >
                    Oglasi
                </button>
                <button
                    className={`px-4 py-2 mx-2 ${activeTab === 'korisnici' ? 'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-center' : 'bg-gray-800'} text-white rounded`}
                    onClick={() => setActiveTab('korisnici')}
                >
                    Korisnici
                </button>
            </div>

            {activeTab === 'oglasi' && renderOglasi()}
            {activeTab === 'korisnici' && renderKorisnici()}
        </div>
    );
};

export default Admin;
