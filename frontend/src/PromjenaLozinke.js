import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import eyeOnIcon from './images/eye-on.svg';
import eyeOffIcon from './images/eye-off.svg';

const PromjenaLozinke = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword1, setNewPassword1] = useState('');
    const [newPassword2, setNewPassword2] = useState('');
    const [errors, setErrors] = useState({});
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword1, setShowNewPassword1] = useState(false);
    const [showNewPassword2, setShowNewPassword2] = useState(false);
    const navigate = useNavigate();

    const validatePasswords = () => {
        let valid = true;
        const newErrors = {};

        if (newPassword1 === oldPassword) {
            newErrors.new_password1 = 'Nova lozinka mora biti različita od stare lozinke.';
            valid = false;
        }
        if (newPassword1 !== newPassword2) {
            newErrors.new_password2 = 'Nova lozinka i potvrda lozinke se ne podudaraju.';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validatePasswords()) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/promjena-lozinke/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password1: newPassword1,
                    new_password2: newPassword2,
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Lozinka je promijenjena!', {
                    onClose: () => navigate('/profil')
                });
            } else {
                toast.error('Došlo je do pogreške. Molimo pokušajte ponovo.');
                setErrors(data);
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error('Došlo je do pogreške. Molimo pokušajte ponovo.');
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded shadow-md max-w-md w-full mb-32 mx-auto">
            <ToastContainer 
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                toastClassName={() => "relative flex p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer bg-gray-700 border border-gray-600"}
                bodyClassName={() => "text-sm font-white font-med block p-3 text-gray-300"}
                closeButton={false}
            />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Promjena Lozinke</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Stara Lozinka</label>
                    <div className="relative">
                        <input
                            type={showOldPassword ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-rose-500"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 dark:text-gray-400"
                        >
                            <img src={showOldPassword ? eyeOffIcon : eyeOnIcon} alt="toggle password visibility" className="w-5 h-5" />
                        </button>
                    </div>
                    {errors.old_password && <p className="text-red-500">{errors.old_password}</p>}
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nova Lozinka</label>
                    <div className="relative">
                        <input
                            type={showNewPassword1 ? "text" : "password"}
                            value={newPassword1}
                            onChange={(e) => setNewPassword1(e.target.value)}
                            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-rose-500"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword1(!showNewPassword1)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 dark:text-gray-400"
                        >
                            <img src={showNewPassword1 ? eyeOffIcon : eyeOnIcon} alt="toggle password visibility" className="w-5 h-5" />
                        </button>
                    </div>
                    {errors.new_password1 && <p className="text-red-500">{errors.new_password1}</p>}
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Ponovite Novu Lozinku</label>
                    <div className="relative">
                        <input
                            type={showNewPassword2 ? "text" : "password"}
                            value={newPassword2}
                            onChange={(e) => setNewPassword2(e.target.value)}
                            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-rose-500"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword2(!showNewPassword2)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 dark:text-gray-400"
                        >
                            <img src={showNewPassword2 ? eyeOffIcon : eyeOnIcon} alt="toggle password visibility" className="w-5 h-5" />
                        </button>
                    </div>
                    {errors.new_password2 && <p className="text-red-500">{errors.new_password2}</p>}
                </div>
                <button type="submit" className="text-white bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 font-medium rounded-lg px-4 py-2 text-center ml-2">Promijeni Lozinku</button>
            </form>
        </div>
    );
};

export default PromjenaLozinke;
