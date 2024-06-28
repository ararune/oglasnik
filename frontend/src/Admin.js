import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useAuth from './useAuth';
import {
    AiOutlineEnvironment, AiOutlineCalendar, AiOutlineIdcard, AiOutlineEuroCircle,
    AiOutlinePhone, AiOutlineMail, AiOutlineSearch, AiOutlineCheckCircle, AiOutlineCloseCircle
} from 'react-icons/ai';
import { FaUserShield, FaUser, FaEdit } from 'react-icons/fa';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart,
    Pie,
    Cell,
} from 'recharts';
import moment from 'moment';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(4);
    const [selectedStatuses, setSelectedStatuses] = useState('');
    

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
                const params = new URLSearchParams(window.location.search);
                const page = parseInt(params.get('page')) || 1;
                setCurrentPage(page);
            } catch (error) {
                window.location.href = '/';
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
    const nextPage = () => {
        const newPage = currentPage + 1;
        handlePageChange(newPage);
    };

    const prevPage = () => {
        const newPage = currentPage - 1;
        handlePageChange(newPage);
    };
    const handlePageChange = (page) => {
        setCurrentPage(page);
        const params = new URLSearchParams(window.location.search);
        params.set('page', page);
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
    function formatirajCijenu(cijena) {
        const parsedPrice = parseFloat(cijena);

        if (Number.isInteger(parsedPrice)) {
            return parsedPrice.toLocaleString('hr-HR') + ' €';
        } else {
            return parsedPrice.toLocaleString('hr-HR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + ' €';
        }
    }

    const potvrdiBrisanje = (id) => {
        setOglasToDelete(id);
        setShowModal(true);
    };

    const renderOglasi = () => {
        const aggregatedData = aggregateOglasiByKategorija(oglasi);
        const filtriraniOglasi = oglasi.filter(oglas =>
            oglas.naziv.toLowerCase().includes(searchQuery.toLowerCase()) ||
            oglas.sifra.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const toggleStatus = (status) => {
            if (selectedStatuses.includes(status)) {
                setSelectedStatuses(selectedStatuses.filter(s => s !== status));
            } else {
                setSelectedStatuses([...selectedStatuses, status]);
            }

            setCurrentPage(1);

            const params = new URLSearchParams(window.location.search);
            params.set('page', '1');
            window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
        };


        const filteredByStatus = selectedStatuses.length > 0
            ? filtriraniOglasi.filter(oglas => selectedStatuses.includes(oglas.status))
            : filtriraniOglasi;

        const indexOfLastItem = currentPage * perPage;
        const indexOfFirstItem = indexOfLastItem - perPage;
        const currentItems = filteredByStatus.slice(indexOfFirstItem, indexOfLastItem);

        const totalPages = Math.ceil(filteredByStatus.length / perPage);

        const handlePageChange = (page) => {
            setCurrentPage(page);
            const params = new URLSearchParams(window.location.search);
            params.set('page', page);
            window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
        };

        const prevPage = () => {
            setCurrentPage(prev => Math.max(prev - 1, 1));
        };

        const nextPage = () => {
            setCurrentPage(prev => Math.min(prev + 1, totalPages));
        };

        return (
            <div>
                <div className="carousel-container relative">
                    <Carousel
                        showThumbs={false}
                        infiniteLoop
                        useKeyboardArrows
                        showStatus={false}
                        showIndicators={false}
                        renderArrowPrev={(onClickHandler, hasPrev, label) =>
                            hasPrev && (
                                <button
                                    type="button"
                                    onClick={onClickHandler}
                                    title={label}
                                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-3 text-white z-10 focus:outline-none h-12 w-12 flex items-center justify-center"
                                >
                                    &#10094;
                                </button>
                            )
                        }
                        renderArrowNext={(onClickHandler, hasNext, label) =>
                            hasNext && (
                                <button
                                    type="button"
                                    onClick={onClickHandler}
                                    title={label}
                                    className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-3 text-white z-10 focus:outline-none h-12 w-12 flex items-center justify-center"
                                >
                                    &#10095;
                                </button>
                            )
                        }
                    >
                        <div>{renderOglasiGraf()}</div>
                        <div>{renderOglasiPoKategorijiGraf(aggregatedData)}</div>
                    </Carousel>
                </div>
                <div className="relative mb-6 mt-4 sm:w-full md:w-2/5">
                    <div className="relative">
                        <input
                            type="search"
                            className="w-full px-4 py-2 rounded border border-gray-600 bg-zinc-900 text-white focus:outline-none focus:border-blue-500"
                            placeholder="Pretraži oglase po nazivu ili šifri..."
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="absolute right-0 top-0 mt-3 mr-4">
                            <AiOutlineSearch className="h-4 w-4 text-gray-600" />
                        </button>
                    </div>
                </div>

                <div className="flex mb-6">
                    <div className="space-x-2">
                        <button
                            className={`px-4 py-2 border border-gray-600 ${selectedStatuses.includes('aktivan') ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'} rounded`}
                            onClick={() => toggleStatus('aktivan')}
                        >
                            Aktivni
                        </button>
                        <button
                            className={`px-4 py-2 border border-gray-600 ${selectedStatuses.includes('neaktivan') ? 'bg-yellow-500 text-white' : 'bg-gray-800 text-white'} rounded`}
                            onClick={() => toggleStatus('neaktivan')}
                        >
                            Neaktivni
                        </button>
                        <button
                            className={`px-4 py-2 border border-gray-600 ${selectedStatuses.includes('arhiviran') ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'} rounded`}
                            onClick={() => toggleStatus('arhiviran')}
                        >
                            Arhivirani
                        </button>
                    </div>
                </div>

                <div className="flex justify-center my-4">
                    <button onClick={prevPage} disabled={currentPage === 1} className="px-4 py-2 mx-2 border border-gray-600 bg-gray-800 text-white rounded cursor-pointer">
                        Prethodna
                    </button>

                    {[...Array(totalPages).keys()].map((page) => (
                        <button
                            key={page + 1}
                            onClick={() => handlePageChange(page + 1)}
                            disabled={currentPage === page + 1}
                            className={`px-4 py-2 mx-2 border border-gray-600 ${currentPage === page + 1 ? 'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg px-4 py-2 text-center cursor-not-allowed' : 'px-4 py-2 mx-2 border border-gray-600 bg-gray-800 text-white rounded cursor-pointer'} rounded`}
                        >
                            {page + 1}
                        </button>
                    ))}

                    <button onClick={nextPage} disabled={currentPage === totalPages} className="px-4 py-2 mx-2 border border-gray-600 bg-gray-800 text-white rounded cursor-pointer">
                        Sljedeća
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {currentItems.map((oglas) => (
                        <div key={oglas.id} className="relative rounded border border-gray-600 bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden shadow-md flex flex-row items-start">
                            {oglas.slike && oglas.slike.length > 0 && (
                                <Link to={`/oglas/${oglas.sifra}`} className="block h-full">
                                    <img src={`http://localhost:8000${oglas.slike[0].slika}`} alt={oglas.naziv} className="w-48 h-full object-cover" />
                                </Link>
                            )}
                            <div className="flex flex-col justify-between p-4 flex-grow">
                                <div>
                                    {oglas.status === 'aktivan' && (
                                        <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-sm">Aktivan</span>
                                    )}
                                    {oglas.status === 'neaktivan' && (
                                        <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-sm">Neaktivan</span>
                                    )}
                                    {oglas.status === 'arhiviran' && (
                                        <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm">Arhiviran</span>
                                    )}
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
                                    {formatirajCijenu(oglas.cijena)}
                                </p>
                                <div className="flex justify-end mt-4">
                                    <button onClick={() => potvrdiBrisanje(oglas.id)} className="px-4 py-2 mx-2 border border-gray-600 bg-gray-800 text-white rounded hover:bg-gradient-to-br font-medium rounded-lg px-4 py-2 text-center ml-2 mr-2">
                                        Izbriši
                                    </button>
                                    <Link
                                        to={`/api/azuriraj-oglas/${oglas.id}`}
                                        className="px-4 py-2 mx-2 border border-gray-600 bg-gray-800 text-white rounded"
                                    >
                                        Ažuriraj
                                    </Link>
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
    };



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
                return moment(a.date, getMomentFormat(period)).unix() - moment(b.date, getMomentFormat(period)).unix();
            });

        return sortedData;
    };
    const aggregateOglasiByKategorija = (oglasi) => {
        return oglasi.reduce((acc, oglas) => {
            const kategorija = oglas.kategorija_naziv;
            if (!acc[kategorija]) {
                acc[kategorija] = 0;
            }
            acc[kategorija]++;
            return acc;
        }, {});
    };
    const renderOglasiPoKategorijiGraf = (data) => {
        const formattedData = Object.keys(data).map((key) => ({
            kategorija: key,
            count: data[key],
        }));

        const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

        return (
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-4 border border-gray-600">
                <div className="text-white text-center mb-4">
                    <h3 className="text-xl font-bold">Broj oglasa po kategoriji:</h3>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                        <Pie
                            data={formattedData}
                            dataKey="count"
                            nameKey="kategorija"
                            cx="50%"
                            cy="50%"
                            outerRadius={150}
                            fill="#8884d8"
                            label
                        >
                            {formattedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
                <div className="text-white text-center mb-4">
                    <h3 className="text-xl font-bold">Ukupan broj oglasa:</h3>
                    <p className="text-3xl font-extrabold">{Object.values(data).reduce((sum, current) => sum + current, 0)}</p>
                </div>
            </div>
        );
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
                            <Line type="monotone" dataKey="oglasi" stroke="#3b82f6" />
                        </LineChart>
                    </ResponsiveContainer>
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

    const filtriraniKorisnici = korisnici.filter(korisnik =>
        korisnik.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${korisnik.first_name.toLowerCase()} ${korisnik.last_name.toLowerCase()}`.includes(searchQuery.toLowerCase()) ||
        korisnik.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        korisnik.telefon.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const indexOfLastItem = currentPage * perPage;
    const indexOfFirstItem = indexOfLastItem - perPage;
    const paginiraniKorisnici = filtriraniKorisnici.slice(indexOfFirstItem, indexOfLastItem);
    const toggleIsActive = async (korisnikId, currentStatus) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const headers = {
                Authorization: `Bearer ${accessToken}`,
            };

            await axios.patch(`/api/korisnici/${korisnikId}/`, {
                is_active: !currentStatus
            }, { headers });

            const updatedKorisnici = korisnici.map(korisnik =>
                korisnik.id === korisnikId ? { ...korisnik, is_active: !currentStatus } : korisnik
            );
            setKorisnici(updatedKorisnici);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const renderKorisnici = () => (
        <div>
            {renderKorisniciGraf()}
            <div className="relative mb-6 mt-4 sm:w-full md:w-2/5">
                <div className="relative">
                    <input
                        type="search"
                        className="w-full px-4 py-2 rounded border border-gray-600 bg-zinc-900 text-white focus:outline-none focus:border-blue-500"
                        placeholder="Pretraži korisnike po korisničkim informacijama..."
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute right-0 top-0 mt-3 mr-4">
                        <AiOutlineSearch className="h-4 w-4 text-gray-600" />
                    </button>
                </div>
            </div>
            <div className="flex justify-center my-4">
                <button onClick={prevPage} disabled={currentPage === 1} className="px-4 py-2 mx-2 border border-gray-600 bg-gray-800 text-white rounded cursor-pointer">
                    Previous
                </button>

                {[...Array(Math.ceil(filtriraniKorisnici.length / perPage)).keys()].map((page) => (
                    <button
                        key={page + 1}
                        onClick={() => handlePageChange(page + 1)}
                        disabled={currentPage === page + 1}
                        className={`px-4 py-2 mx-2 border border-gray-600 ${currentPage === page + 1 ? 'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg px-4 py-2 text-center cursor-not-allowed' : 'bg-gray-800 text-white rounded cursor-pointer'}`}
                    >
                        {page + 1}
                    </button>
                ))}

                <button onClick={nextPage} disabled={currentPage === Math.ceil(filtriraniKorisnici.length / perPage)} className="px-4 py-2 mx-2 border border-gray-600 bg-gray-800 text-white rounded cursor-pointer">
                    Next
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-6">
                {paginiraniKorisnici.map((korisnik) => (
                    <div key={korisnik.id} className="rounded border border-gray-600 bg-gray-800 p-4 rounded-lg shadow-md relative">
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
                        <Link
                            to={`/admin-panel/azuriraj-korisnika/${korisnik.id}`}
                            className="absolute top-2 right-2 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-4 py-2 flex items-center"
                        >
                            <FaEdit className="mr-2" />
                            Ažuriraj Korisnika
                        </Link>
                        <div className="flex items-center text-gray-400 text-sm mb-2">
                            {korisnik.is_active ? (
                                <AiOutlineCheckCircle className="mr-2 text-green-500 cursor-pointer" onClick={() => toggleIsActive(korisnik.id, korisnik.is_active)} />
                            ) : (
                                <AiOutlineCloseCircle className="mr-2 text-red-500 cursor-pointer" onClick={() => toggleIsActive(korisnik.id, korisnik.is_active)} />
                            )}
                            {korisnik.is_active ? 'Aktivan' : 'Neaktivan'}
                        </div>
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
            <div className="max-w-lg bg-gray-800 rounded-lg border border-gray-600 overflow-hidden shadow-lg mb-6">
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

            <div className="flex mb-6">
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
