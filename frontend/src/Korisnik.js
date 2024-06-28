import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AiOutlineEnvironment, AiOutlineCalendar, AiOutlineEuroCircle, AiOutlineFileSearch, AiOutlineDelete } from 'react-icons/ai';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import useAuth from './useAuth'
import { AiOutlineMail, AiOutlinePhone, AiOutlineIdcard, AiOutlineUser } from 'react-icons/ai';
function Korisnik() {
    const { username } = useParams();
    const [userData, setUserData] = useState(null);
    const [oglasi, setOglasi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sortOpcija, setSortOpcija] = useState('');
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [charCount, setCharCount] = useState(0);
    const [commentSortOption, setCommentSortOption] = useState('');
    const [aktivniTab, setAktivniTab] = useState('komentari');
    useEffect(() => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams(window.location.search);
        const sortiranjeOpcija = params.get('sort');
        if (sortiranjeOpcija) {
            setSortOpcija(sortiranjeOpcija);
        }
        const tabOption = params.get('tab');
        if (tabOption) {
            setAktivniTab(tabOption);
        }
        fetch(`http://localhost:8000/korisnik/${username}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response nije ok');
                }
                return response.json();
            })
            .then(data => {
                setUserData(data.korisnik);
                const activeOglasi = data.oglasi.filter(oglas => oglas.status === 'aktivan');
                setOglasi(activeOglasi);
                setComments(data.korisnik.komentari);

            })
            .catch(error => {
                setError(error.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [username]);

    const handleSubmitComment = async (event) => {
        event.preventDefault();

        if (!user) {
            navigate('/prijava');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/komentari/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({
                    korisnik: userData.id,
                    autor: user.id,
                    tekst: commentText,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add comment');
            }

            setCommentText('');

            fetch(`http://localhost:8000/korisnik/${username}/`)
                .then(response => response.json())
                .then(data => {
                    setComments(data.korisnik.komentari);
                })
                .catch(error => console.error('Error fetching comments:', error));

        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };
    const handleDeleteComment = async (commentId) => {
        if (!user) {
            navigate('/prijava');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/komentari/${commentId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete comment');
            }

            // Remove the deleted comment from the state
            setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));

        } catch (error) {
            console.error('Error deleting comment:', error);
            // Handle error state or show a notification to the user
        }
    };
    const deleteButtonVisible = (comment) => {
        return user && (user.uloga === 'Admin' || user.id === comment.autor);
    };
    const handleCommentChange = (event) => {
        const inputText = event.target.value;
        if (inputText.length <= 150) {
            setCommentText(inputText);
            setCharCount(inputText.length);
        }
    };
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!userData) {
        return <div>User not found</div>;
    }
    const toggleFavorite = (oglasId, isFavorited) => {
        if (!user) {
            navigate('/prijava');
            return;
        }
        const url = isFavorited ? 'http://localhost:8000/favoriti/ukloni/' : 'http://localhost:8000/favoriti/dodaj/';
        const method = isFavorited ? 'DELETE' : 'POST';
        fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ oglas: oglasId })
        })
            .then(response => response.json())
            .then(() => {
                setOglasi(prevOglasi =>
                    prevOglasi.map(oglas =>
                        oglas.id === oglasId ? { ...oglas, favorited: !isFavorited } : oglas
                    )
                );
            })
            .catch(error => console.error('Error toggling favorite:', error));
    };
    const handleSortChange = (event) => {
        const selectedOption = event.target.value;
        setSortOpcija(selectedOption);

        const params = new URLSearchParams(window.location.search);
        params.set('sort', selectedOption);
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    };

    const sortOglasi = (ads, option) => {
        let sortiraniOglasi = [...ads];
        if (option === 'cijena-uzlazno') {
            sortiraniOglasi.sort((a, b) => a.cijena - b.cijena);
        } else if (option === 'cijena-silazno') {
            sortiraniOglasi.sort((a, b) => b.cijena - a.cijena);
        } else if (option === 'datum-najstariji') {
            sortiraniOglasi.sort((a, b) => new Date(a.datum) - new Date(b.datum));
        } else if (option === 'datum-najnoviji') {
            sortiraniOglasi.sort((a, b) => new Date(b.datum) - new Date(a.datum));
        }
        return sortiraniOglasi;
    };

    const formatDatum = (datum) => {
        const date = new Date(datum);
        const dan = String(date.getDate()).padStart(2, '0');
        const mjesec = String(date.getMonth() + 1).padStart(2, '0');
        const godina = date.getFullYear();
        return `${dan}/${mjesec}/${godina}`;
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
    const sortiraniOglasi = sortOglasi(oglasi, sortOpcija);

    const sortComments = (comments, option) => {
        let sortedComments = [...comments];
        if (option === 'datum-najnoviji') {
            sortedComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } else if (option === 'datum-najstariji') {
            sortedComments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        }
        return sortedComments;
    };
    const sortedComments = sortComments(comments, commentSortOption);
    const handleTabChange = (tab) => {
        setAktivniTab(tab);
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    };
    const TabButtons = ({ aktivniTab, handleTabChange }) => (
        <div className="flex justify-center mb-6">
            <button
                className={`px-4 py-2 mx-2 border border-gray-600 ${aktivniTab === 'komentari' ?  'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-center' : 'bg-gray-800'} text-white rounded`}
                onClick={() => handleTabChange('komentari')}
            >
                Komentari
            </button>
            <button
                className={`px-4 py-2 mx-2 border border-gray-600 ${aktivniTab === 'oglasi' ? 'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-center' : 'bg-gray-800'} text-white rounded`}
                onClick={() => handleTabChange('oglasi')}
            >
                Oglasi
            </button>
        </div>
    );
    return (
        <div className="container mx-auto p-4">
            <div className="max-w-lg mx-auto bg-gray-800 rounded-lg border border-gray-600 overflow-hidden shadow-lg mb-6">
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <AiOutlineUser className="w-16 h-16 text-gray-400 rounded-full mr-4" />
                        <h2 className="text-white text-3xl font-bold">{userData.username}</h2>
                    </div>
                    <div className="space-y-2">
                        <div className="text-gray-400 flex items-center">
                            <AiOutlineIdcard className="mr-2 text-xl" />
                            <span><strong>Ime i prezime:</strong> {userData.first_name} {userData.last_name}</span>
                        </div>
                        <div className="text-gray-400 flex items-center">
                            <AiOutlineMail className="mr-2 text-xl" />
                            <span><strong>Email:</strong> {userData.email}</span>
                        </div>
                        <div className="text-gray-400 flex items-center">
                            <AiOutlinePhone className="mr-2 text-xl" />
                            <span><strong>Telefon:</strong> {userData.telefon}</span>
                        </div>
                        <div className="text-gray-400 flex items-center">
                            <AiOutlineIdcard className="mr-2 text-xl" />
                            <span><strong>OIB:</strong> {userData.oib}</span>
                        </div>
                        <div className="text-gray-400 flex items-center">
                            <AiOutlineEnvironment className="mr-2 text-xl" />
                            <span><strong>Lokacija:</strong> {userData.zupanija_naziv}, {userData.grad_naziv}</span>
                        </div>
                        <div className="text-gray-400 flex items-center">
                            <AiOutlineCalendar className="mr-2 text-xl" />
                            <span><strong>Datum pridruživanja:</strong> {userData.date_joined}</span>
                        </div>
                    </div>
                </div>
            </div>
            <TabButtons aktivniTab={aktivniTab} handleTabChange={handleTabChange} />
            {aktivniTab === 'komentari' && (
                <>
                    {/* Comment Form */}
                    {user && (
                        <form onSubmit={handleSubmitComment} className="max-w-lg mx-auto bg-gray-800 rounded-lg border border-gray-600 overflow-hidden shadow-lg mb-6 p-6">
                            <textarea
                                value={commentText}
                                onChange={handleCommentChange} // Updated to call handleCommentChange
                                placeholder="Unesite komentar..."
                                maxLength={150} // Restrict to 150 characters
                                required
                                className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                            />
                            <div className="flex justify-between items-center mt-2">
                                <button
                                    type="submit"
                                    className="mt-4 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg px-4 py-2 flex items-center"
                                >
                                    Dodaj komentar
                                </button>
                                <span className="text-gray-400">{charCount}/150 znakova</span>
                            </div>
                        </form>
                    )}

                    <div className="max-w-lg mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-white text-3xl font-bold">Komentari</h2>
                            <select
                                id="commentSortCriteria"
                                value={commentSortOption}
                                onChange={(e) => setCommentSortOption(e.target.value)}
                                className="px-4 py-2 rounded border border-gray-600 bg-zinc-900 text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Sortiraj komentare po</option>
                                <option value="datum-najnoviji">Datum najnoviji</option>
                                <option value="datum-najstariji">Datum najstariji</option>
                            </select>
                        </div>

                        {sortedComments.length === 0 && <p className="text-gray-400">Nema komentara za prikaz.</p>}
                        {sortedComments.map(comment => (
                            <div key={comment.id} className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden shadow-lg mb-4 p-4 relative">
                                <div className="flex items-center mb-2">
                                    <AiOutlineUser className="text-blue-500 text-md mr-2" />
                                    <Link to={`/korisnik/${comment.autor_username}`} className="text-blue-500 text-sm font-bold hover:underline">{comment.autor_username}</Link>
                                    <span className="text-gray-500 text-sm ml-auto"><AiOutlineCalendar className="inline-block mr-1" />{formatDatum(comment.timestamp)}</span>
                                    {deleteButtonVisible(comment) && (
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="absolute bottom-4 right-6 text-sm text-gray-400 hover:text-red-500 focus:outline-none"
                                        >
                                            <AiOutlineDelete className="inline-block mr-1" />
                                            Izbriši
                                        </button>
                                    )}
                                </div>
                                <p className="text-gray-400">{comment.tekst}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {aktivniTab === 'oglasi' && (
                <>
                    <h2 className="text-white text-3xl font-bold mt-4 mb-4">Aktivni oglasi korisnika {userData.username}</h2>
                    <div className="flex mb-4">
                        <select id="sortCriteria" value={sortOpcija} onChange={handleSortChange} className="px-4 py-2 rounded border border-gray-600 bg-zinc-900 text-white focus:outline-none focus:border-blue-500">
                            <option value="">Sortiraj po</option>
                            <option value="cijena-uzlazno">Cijena uzlazno</option>
                            <option value="cijena-silazno">Cijena silazno</option>
                            <option value="datum-najstariji">Datum najstariji</option>
                            <option value="datum-najnoviji">Datum najnoviji</option>
                        </select>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {oglasi.length === 0 ? (
                            <div className="text-center mt-10">
                                <p className="text-white text-xl mb-4">Ovaj korisnik nema oglasa</p>
                                <AiOutlineFileSearch className="mx-auto w-48 h-48 text-gray-400" />
                            </div>
                        ) : (
                            sortiraniOglasi.map(oglas => (
                                <li key={oglas.id} className="relative rounded border border-gray-600 bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden shadow-md flex flex-row items-start">
                                    {oglas.slike.length > 0 && (
                                        <Link to={`/oglas/${oglas.sifra}`} key={oglas.sifra} className="block h-full">
                                            <img src={`http://localhost:8000${oglas.slike[0].slika}`} alt={oglas.naziv} className="w-48 h-full object-cover" />
                                        </Link>
                                    )}
                                    <div className="flex flex-col justify-between p-4 flex-grow">
                                        <div>
                                            <p className="inline-flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded">{oglas.kategorija_naziv}</p>
                                            <Link to={`/oglas/${oglas.sifra}`} key={oglas.sifra} className="block">
                                                <h4 className="text-white text-xl font-bold mb-2">{oglas.naziv}</h4>
                                            </Link>
                                            <div className="text-gray-400 text-sm mb-1 flex items-center">
                                                <AiOutlineEnvironment className="inline-block mr-2" />
                                                <p>{oglas.zupanija.naziv}, {oglas.grad.naziv}</p>
                                            </div>
                                            <div className="text-gray-400 text-sm mb-2 flex items-center">
                                                <AiOutlineCalendar className="inline-block mr-2" />
                                                <p>{formatDatum(oglas.datum)}</p>
                                            </div>
                                        </div>
                                        <p className="text-yellow-500 text-lg font-bold flex items-center">
                                            <AiOutlineEuroCircle className="inline-block mr-2" />
                                            {formatirajCijenu(oglas.cijena)}
                                        </p>
                                        <button
                                            onClick={() => toggleFavorite(oglas.id, oglas.favorited)}
                                            className="text-gray-400 hover:text-red-500 focus:outline-none"
                                        >
                                            {oglas.favorited ? <FaHeart /> : <FaRegHeart />}
                                        </button>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </>
            )}
        </div>
    );
}

export default Korisnik;
