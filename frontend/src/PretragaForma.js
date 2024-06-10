import React, { useState, useEffect, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';
const PretragaForma = ({ searchQuery, handleSearchChange, handleSearchSubmit }) => {
    const [prijedlozi, setPrijedlozi] = useState([]);
    const prijedloziRef = useRef(null);

    useEffect(() => {
        if (searchQuery) {
            fetchSuggestions(searchQuery);
        } else {
            setPrijedlozi([]);
        }
    }, [searchQuery]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (prijedloziRef.current && !prijedloziRef.current.contains(event.target)) {
                setPrijedlozi([]);
            }
        }

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const fetchSuggestions = async (query) => {
        try {
            const response = await fetch(`http://localhost:8000/api/pretraga?q=${query}&prijedlozi=true`);
            const data = await response.json();
            setPrijedlozi(data.prijedlozi);
        } catch (error) {
            console.error('Error fetching prijedlozi:', error);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        handleSearchChange({ target: { value: suggestion } });
        setPrijedlozi([]);
    };

    return (
        <div>
            <form onSubmit={handleSearchSubmit} className="mb-6 mt-4 relative sm:w-80 md:w-96">
                <div className="flex">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Traži po pojmu ili šifri"
                        className="flex-grow px-4 py-2 rounded border border-gray-600 bg-zinc-900 text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        className="flex items-center justify-center text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-r px-4 py-2"
                    >
                        <FiSearch />
                    </button>
                </div>
                {prijedlozi.length > 0 && (
                    <ul ref={prijedloziRef} className="absolute left-0 right-0 mt-2 rounded border border-gray-600 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-md shadow-lg z-10">
                        {prijedlozi.map((suggestion, index) => (
                            <li
                                key={index}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </form>
        </div>
    );
};

export default PretragaForma;