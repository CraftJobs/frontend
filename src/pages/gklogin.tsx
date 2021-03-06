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
    const [field] = useState(query.get('f'));
    const [redirect, setRedirect] = useState('');
    const [token] = useState(localStorage.getItem('token'));
    const [domain] = useState(query.get('d'));
    const login = '/i/login?r=i/gklogin&rq=' + 
        encodeURIComponent('s=' + sub + '&f=' + field + (domain ? '&d=' + domain : ''));

    if (!sub || !field) return <Redirect to='/' />

    for (const char of sub) {
        if (!VALID_SUB_CHARS.includes(char)) {
            return <Redirect to='/' />
        }
    }

    if (!token) return <Redirect to={login} />

    endpoints.gk.check(token, field).then((res) => {
        if (!res.valid) {
            setRedirect(login);
            return;
        } else if (!res.field) {
            setRedirect('/');
        } else {
            document.cookie = 'gktoken=' + token + ';path=/;domain=.craftjobs.net;max-age=31536000';

            if (sub == 'cdt') {
                // No need to verify here because cdt has a whitelist
                window.location.href = 'https://cdt.craftjobs.net/?d=' + domain;
                return; 
            }

            window.location.href = 'https://' + sub + '.craftjobs.net';
        }
    });

    return <div>{redirect === '' ? '' : <Redirect to={redirect} />}</div>
}
