// frontend/src/useAuth.js

import { useState, useEffect } from 'react';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            let accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error('No access token found');
                setLoading(false);
                return;
            }

            try {
                let response = await fetch('http://localhost:8000/api/trenutni_korisnik/', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    credentials: 'include',
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else if (response.status === 401) { // Token expired
                    accessToken = await refreshAccessToken();
                    if (accessToken) {
                        response = await fetch('http://localhost:8000/api/trenutni_korisnik/', {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`
                            },
                            credentials: 'include',
                        });

                        if (response.ok) {
                            const userData = await response.json();
                            setUser(userData);
                        } else {
                            console.error('Error fetching user after token refresh: HTTP status', response.status);
                        }
                    }
                } else {
                    console.error('Error fetching user: HTTP status', response.status);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser(); // Initial fetch when component mounts
    }, []); // Empty dependency array to run once on mount

    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            console.error('No refresh token found');
            return null;
        }

        try {
            const response = await fetch('http://localhost:8000/api/token/refresh/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('access_token', data.access);
                return data.access;
            } else {
                console.error('Error refreshing token: HTTP status', response.status);
                return null;
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            return null;
        }
    };

    return { user, loading };
};

export default useAuth;
