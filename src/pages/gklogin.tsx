/**
 * Gatekeeper token -> cookie login
 */
import React, { useState } from 'react';
import { Redirect, useLocation } from 'react-router';
import { endpoints } from '../constants';

const VALID_SUB_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz012345679-'

export default function GKLogin() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    const [sub] = useState(query.get('s'));
    const [redirect, setRedirect] = useState('');
    const [token] = useState(localStorage.getItem('token'));

    if (!sub) return <Redirect to='/' />

    for (const char of sub) {
        if (!VALID_SUB_CHARS.includes(char)) {
            return <Redirect to='/' />
        }
    }

    if (!token) return <Redirect to={'/i/login?r=i/gklogin&rq=s=' + sub} />

    endpoints.gk.check(token, sub).then((res) => {
        if (!res.valid) {
            setRedirect('/i/login?r=i/gklogin&rq=s=' + sub);
            return;
        } else if (!res.field) {
            setRedirect('/');
        } else {
            document.cookie = 'gktoken=' + token + ';path=/;domain=.craftjobs.net;max-age=31536000';
            window.location.href = 'https://' + sub + '.craftjobs.net';
        }
    });

    return <div>{redirect === '' ? '' : <Redirect to={redirect} />}</div>
}
