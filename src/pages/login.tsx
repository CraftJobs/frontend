import React, { useState } from 'react';
import { Redirect, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { endpoints } from '../constants';

export default function Login() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    const prefillUsername = query.has('u') ? query.get('u') as string : '';
    let redirect = query.has('r') ? (query.get('r') as string) : '';
    const redirectQuery = query.has('rq') ? query.get('rq') : '';

    const [changedPassword] = useState(query.has('c'));
    const [username, setUsername] = useState(prefillUsername);
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [doRedirect, setDoRedirect] = useState(false);

    function handleButtonClick() {
        endpoints.login.root(username, password, remember).then(res => {
            if (!res.success && res.message) {
                setStatusText(res.message);
            } else if (res.token) {
                localStorage.setItem('token', res.token);
                setDoRedirect(true);
            }
        });
    }

    return <div className='container mx-auto lg:px-96'>
        <figure className="bg-gray-100 rounded-xl mt-9 ml-9 shadow pl-3 pt-2 pb-3">
        <h1 className="text-2xl">Login</h1>
        <br />
        { changedPassword ? <b>Password changed. Login to continue.</b> : ''}
        <p>Enter your email or username and your password.</p>
        <br />
        <p>Username:</p>
        <input 
            className="shadow text-lg p-1" 
            type="text" 
            onChange={e => setUsername(e.target.value)} 
            value={username}
        />
        <p>Password:</p>
        <input 
            className="shadow text-lg p-1" 
            type="password" 
            onChange={e => setPassword(e.target.value)} 
        />
        <br />
        <input 
            type="checkbox"
            onChange={e => setRemember(e.target.checked)}
            checked={remember}
            className="mt-2"
        /> Remember me
        <br />
        <button 
            className="focus shadow-xl button bg-blue-100 mt-2 text-lg rounded p-1 text-blue-500 mb-2"
            onClick={handleButtonClick}
        >
            Login
        </button>
        <br />
        <Link to='/i/register/email-verification' className='hover:underline'>Sign up instead</Link>
        <span> | </span>
        <Link to='/i/register/email-verification?fp=1' className='hover:underline'>
            Forgot your password?
        </Link>
        <br />
        <p className="mt-2">
            {statusText}
        </p>
        </figure>
        {/* Use redirect component here to maintain security */}
        {doRedirect ? <Redirect to={'/i/r?r=' + redirect + '&rq=' + redirectQuery} /> : ''}
    </div>
}
