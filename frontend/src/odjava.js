const odjavaKorisnika = async () => {
    try {
        const response = await fetch('http://localhost:8000/api/odjava/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            },
            credentials: 'include'
        });
        if (response.ok) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = 'http://localhost:3000/';
        } else {
            console.error('Odjava neuspješna');
        }
    } catch (error) {
        console.error('Error pri odjavi:', error);
    }
};

export default odjavaKorisnika;
