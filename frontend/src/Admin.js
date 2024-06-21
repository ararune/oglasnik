import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useAuth from './useAuth';
import { AiOutlineEnvironment, AiOutlineCalendar, AiOutlineIdcard, AiOutlineEuroCircle, AiOutlinePhone, AiOutlineMail } from 'react-icons/ai';
import { FaUserShield, FaUser } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const Admin = () => {
    const { user, loading } = useAuth();
    const [error, setError] = useState(null);
    const [oglasi, setOglasi] = useState([]);
    const [korisnici, setKorisnici] = useState([]);
    const [aktivniTab, setAktivniTab] = useState('oglasi');
    const [showModal, setShowModal] = useState(false);
    const [oglasToDelete, setOglasToDelete] = useState(null);
    const [period, setPeriod] = useState('day');
    const [totalPregledi, setTotalPregledi] = useState(0);
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
        const params = new URLSearchParams(window.location.search);
        const tabOption = params.get('tab');
        if (tabOption) {
            setAktivniTab(tabOption);
        }
    }, [user]);

    useEffect(() => {
        const fetchPreglediCount = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/oglasi/pregledi_count/');
                setTotalPregledi(response.data.total_pregledi);
            } catch (error) {
                console.error('Error fetching pregledi count:', error);
            }
        };

        fetchPreglediCount();
    }, []);
    if (error) {
        return <div>{error}</div>;
    }

    if (loading || !user) {
        return <div>Loading...</div>;
    }
    const handleTabChange = (tab) => {
        setAktivniTab(tab);
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    };
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
        return moment(datum).format('DD/MM/YYYY');
    };
    const potvrdiBrisanje = (id) => {
        setOglasToDelete(id);
        setShowModal(true);
    };

    const renderOglasi = () => (
        <div>
            {renderOglasiGraf()}
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
        </div>
    );


    const aggregateRegistrations = (korisnici, period) => {
        const registrations = korisnici.reduce((acc, user) => {
            let key;
            if (period === 'day') {
                key = moment(user.date_joined, 'DD/MM/YYYY').format('DD/MM/YYYY');
            } else if (period === 'month') {
                key = moment(user.date_joined, 'DD/MM/YYYY').format('MM/YYYY');
            } else if (period === 'year') {
                key = moment(user.date_joined, 'DD/MM/YYYY').format('YYYY');
            }

            if (!acc[key]) {
                acc[key] = 0;
            }
            acc[key]++;
            return acc;
        }, {});

        const sortedData = Object.keys(registrations)
            .map(date => ({
                date,
                registrirani: registrations[date]
            }))
            .sort((a, b) => {
                // Custom sorting function to handle different date formats
                return moment(a.date, getMomentFormat(period)).unix() - moment(b.date, getMomentFormat(period)).unix();
            });

        return sortedData;
    };
    const aggregateOglasi = (oglasi, period) => {
        const oglasiAggregated = oglasi.reduce((acc, oglas) => {
            let key;
            if (period === 'day') {
                key = moment(oglas.datum).format('DD/MM/YYYY');
            } else if (period === 'month') {
                key = moment(oglas.datum).format('MM/YYYY');
            } else if (period === 'year') {
                key = moment(oglas.datum).format('YYYY');
            }

            if (!acc[key]) {
                acc[key] = 0;
            }
            acc[key]++;
            return acc;
        }, {});

        const sortedData = Object.keys(oglasiAggregated)
            .map(date => ({
                date,
                oglasi: oglasiAggregated[date]
            }))
            .sort((a, b) => {
                return moment(a.date, getMomentFormat(period)).unix() - moment(b.date, getMomentFormat(period)).unix();
            });

        return sortedData;
    };
    const renderOglasiGraf = () => {
        const data = aggregateOglasi(oglasi, period);

        let countText, countValue;
        if (period === 'day') {
            const todayDate = moment().format('DD/MM/YYYY');
            countText = 'Broj kreiranih oglasa danas:';
            countValue = oglasi.filter(oglas => moment(oglas.datum).format('DD/MM/YYYY') === todayDate).length;
        } else if (period === 'month') {
            countText = 'Broj kreiranih oglasa ovaj mjesec:';
            const currentMonthYear = moment().format('MM/YYYY');
            countValue = data.find(item => item.date === currentMonthYear)?.oglasi || 0;
        } else if (period === 'year') {
            countText = 'Broj kreiranih oglasa ove godine:';
            const currentYear = moment().format('YYYY');
            countValue = data.find(item => item.date === currentYear)?.oglasi || 0;
        }

        return (
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-4 border border-gray-600">
                <div className="flex justify-center mb-4">
                    <button onClick={() => setPeriod('day')} className={`px-4 py-2 mx-2 border border-gray-600 ${period === 'day' ? 'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg px-4 py-2 text-center' : 'bg-gray-800'} text-white rounded`}>Dan</button>
                    <button onClick={() => setPeriod('month')} className={`px-4 py-2 mx-2 border border-gray-600 ${period === 'month' ? 'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg px-4 py-2 text-center' : 'bg-gray-800'} text-white rounded`}>Mjesec</button>
                    <button onClick={() => setPeriod('year')} className={`px-4 py-2 mx-2 border border-gray-600 ${period === 'year' ? 'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg px-4 py-2 text-center' : 'bg-gray-800'} text-white rounded`}>Godina</button>
                </div>
                <div className="text-white text-center mb-4">
                    <h3 className="text-xl font-bold">{countText}</h3>
                    <p className="text-3xl font-extrabold">{countValue}</p>
                </div>
                <div className="flex justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="oglasi" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-white text-center mb-4">
                    <h3 className="text-xl font-bold">Ukupan broj oglasa:</h3>
                    <p className="text-3xl font-extrabold">{oglasi.length}</p>
                </div>
                <div className="text-white text-center mb-4">
                    <h3 className="text-xl font-bold">Ukupan broj pregleda:</h3>
                    <p className="text-3xl font-extrabold">{totalPregledi}</p>
                </div>
            </div>
        );
    };

    const getMomentFormat = (period) => {
        if (period === 'day') {
            return 'DD/MM/YYYY';
        } else if (period === 'month') {
            return 'MM/YYYY';
        } else if (period === 'year') {
            return 'YYYY';
        }
    };
    const renderKorisniciGraf = () => {
        const data = aggregateRegistrations(korisnici, period);

        let countText, countValue;
        if (period === 'day') {
            const todayDate = new Date().toLocaleDateString('en-GB');
            countText = 'Broj registriranih korisnika danas:';
            countValue = korisnici.filter(user => user.date_joined === todayDate).length;
        } else if (period === 'month') {
            countText = 'Broj registriranih korisnika ovaj mjesec:';
            const currentMonthYear = moment().format('MM/YYYY');
            countValue = data.find(item => item.date === currentMonthYear)?.registrirani || 0;
        } else if (period === 'year') {
            countText = 'Broj registriranih korisnika ove godine:';
            const currentYear = moment().format('YYYY');
            countValue = data.find(item => item.date === currentYear)?.registrirani || 0;
        }

        return (
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-4 border border-gray-600">
                <div className="flex justify-center mb-4">
                    <button onClick={() => setPeriod('day')} className={`px-4 py-2 mx-2 border border-gray-600 ${period === 'day' ? 'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg px-4 py-2 text-center' : 'bg-gray-800'} text-white rounded`}>Dan</button>
                    <button onClick={() => setPeriod('month')} className={`px-4 py-2 mx-2 border border-gray-600 ${period === 'month' ? 'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg px-4 py-2 text-center' : 'bg-gray-800'} text-white rounded`}>Mjesec</button>
                    <button onClick={() => setPeriod('year')} className={`px-4 py-2 mx-2 border border-gray-600 ${period === 'year' ? 'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg px-4 py-2 text-center' : 'bg-gray-800'} text-white rounded`}>Godina</button>
                </div>
                <div className="text-white text-center mb-4">
                    <h3 className="text-xl font-bold">{countText}</h3>
                    <p className="text-3xl font-extrabold">{countValue}</p>
                </div>
                <div className="flex justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="registrirani" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-white text-center mb-4">
                    <h3 className="text-xl font-bold">Ukupan broj registriranih korisnika:</h3>
                    <p className="text-3xl font-extrabold">{korisnici.length}</p>
                </div>
            </div>
        );
    };





    const renderKorisnici = () => (
        <div>
            {renderKorisniciGraf()}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-6">
                {korisnici.map((korisnik) => (
                    <div key={korisnik.id} className="rounded border border-gray-600 bg-gray-800 p-4 rounded-lg shadow-md">
                        <Link to={`/korisnik/${korisnik.username}`} className="text-white flex items-center mb-4">
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
                    className={`px-4 py-2 mx-2 border border-gray-600 ${aktivniTab === 'oglasi' ? 'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-center' : 'bg-gray-800'} text-white rounded`}
                    onClick={() => handleTabChange('oglasi')}
                >
                    Oglasi
                </button>
                <button
                    className={`px-4 py-2 mx-2 border border-gray-600 ${aktivniTab === 'korisnici' ? 'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-center' : 'bg-gray-800'} text-white rounded`}
                    onClick={() => handleTabChange('korisnici')}
                >
                    Korisnici
                </button>
            </div>

            {aktivniTab === 'oglasi' && renderOglasi()}
            {aktivniTab === 'korisnici' && renderKorisnici()}
        </div>
    );
};

export default Admin;
