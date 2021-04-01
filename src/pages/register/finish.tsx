import React, { useEffect, useState } from 'react';
import { Redirect, useParams } from 'react-router';
import { endpoints } from '../../constants';

export default function Finish() {
    const { token }: { token: string } = useParams();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [email, setEmail] = useState('');
    const [initFetched, setInitFetched] = useState(false);
    const [redirect, setRedirect] = useState('');
    const [error, setError] = useState('');

    if (!initFetched) {
        setInitFetched(true);
        endpoints.register.checkEmailToken(token).then((res) => {
            if (!res.success) {
                setRedirect('/i/register/email-verification?f=1');
            } else {
                setEmail(res.email);
            }
        })
    }

    function handleButtonClick() {
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        endpoints.register.finish(token, username, password, localStorage.getItem('deviceToken'))
        .then(res => {
            if (!res.success) {
                if (!res.message) {
                    setError('Something has seriously broke. (success=false with no message)');
                } else {
                    setError(res.message);
                }
            } else {
                if (res.token) {
                    localStorage.setItem('token', res.token);
                    // redirect to user (o=1 enables orientation)
                    setRedirect('/' + username + '?o=1');
                } else {
                    // redirect to login (r=username redirects to user after, rq=o=1 passes 
                    // query ?o=1). u=username prefills login with username for convenience.
                    setRedirect(
                        '/i/login?rq=' + encodeURIComponent('o=1') + 
                        '&r=' + username + 
                        '&u=' + username);
                }
            }
        })
    }

    useEffect(() => {
        document.title = 'Register Finish | CraftJobs';
    }, []);

    return <div className="container mx-auto lg:px-64 dark:text-gray-300">
    <figure className="dark:bg-gray-700 bg-gray-100 rounded-xl lg:mt-9 lg:ml-9 shadow pl-3 pt-2 pb-3">
        <h1 className="text-2xl">Signup: Account details</h1>
        <br />
        <p>Set a username and password. Be careful! Your username cannot be changed.</p>
        <p>Email: <b>{email}</b></p>
        <br />
        <p>Username:</p>
        <input 
            className="shadow text-lg p-1 dark:bg-gray-600" 
            type="text" 
            onChange={e => setUsername(e.target.value)} 
        />
        <p>Password:</p>
        <input 
            className="shadow text-lg p-1 dark:bg-gray-600" 
            type="password" 
            onChange={e => setPassword(e.target.value)} 
        />
        <p>Type it again:</p>
        <input 
            className="shadow text-lg p-1 dark:bg-gray-600" 
            type="password" 
            onChange={e => setConfirm(e.target.value)} 
        />
        <br />
        <button 
            className="focus shadow-xl button bg-blue-100 mt-2 text-lg rounded p-1 text-blue-500 dark:bg-gray-600 dark:text-gray-300"
            onClick={handleButtonClick}
        >
            Sign up
        </button>
        <p className="m-2 text-red-500">{error}</p>
    </figure>
    {redirect === '' ? '' : <Redirect to={redirect} />}
    </div>
}
