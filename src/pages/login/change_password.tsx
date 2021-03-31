import React, { useState } from 'react';
import { Redirect, useLocation } from 'react-router';
import { endpoints } from '../../constants';

export default function ChangePassword() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    const [isReset] = useState(query.has('t'));
    const [token] = useState(isReset
        ? query.get('t')
        : localStorage.getItem('token'));
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [redirect, setRedirect] = useState('');
    const [statusText, setStatusText] = useState('');
    const [oldPassword, setOldPassword] = useState('');

    function handleButtonClick() {
        if (password !== confirm) {
            setStatusText('Passwords do not match.');
            return;
        }

        endpoints.login.changePassword(isReset, token as string, password, oldPassword)
        .then(res => {
            if (res.success) {
                setRedirect('/i/login?c=1');
            } else {
                setStatusText(res.message);
            }
        });
    }

    if (!token) {
        setRedirect('/i/login?r=i/login/change-password');
    }

    return <div>
        <div className='container mx-auto lg:px-96 dark:text-gray-300'>
        <figure className="dark:bg-gray-700 bg-gray-100 rounded-xl mt-9 ml-9 shadow pl-3 pt-2 pb-3">
        <h1 className="text-2xl">Login</h1>
        <br />
        <p>Enter the following details to change your password.</p>
        <br />
        {isReset
            ? ''
            : <div>
            <p>Old Password:</p>
            <input 
                className="shadow text-lg p-1 dark:bg-gray-600" 
                type="password" 
                onChange={e => setOldPassword(e.target.value)} 
            />
            <br />
            </div>}
        <p>Password:</p>
        <input 
            className="shadow text-lg p-1 dark:bg-gray-600" 
            type="password" 
            onChange={e => setPassword(e.target.value)} 
        />
        <br />
        <p>Type it again:</p>
        <input 
            className="shadow text-lg p-1 dark:bg-gray-600" 
            type="password" 
            onChange={e => setConfirm(e.target.value)} 
        />
        <br />
        <button 
            className="focus shadow-xl button bg-blue-100 mt-2 text-lg rounded p-1 text-blue-500 mb-2 dark:bg-gray-600 dark:text-gray-300"
            onClick={handleButtonClick}
        >
            Change Password
        </button>
        <br />
        <p className="mt-2">
            {statusText}
        </p>
        </figure>
        {/* Use redirect component here to maintain security */}
        {redirect !== '' ? <Redirect to={redirect} /> : ''}
    </div>
    </div>
}
