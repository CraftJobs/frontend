import React, { useState } from 'react';
import { Redirect } from 'react-router';
import { endpoints } from '../constants';

export default function Logout() {
    const [done, setDone] = useState(false);
    const token = localStorage.getItem('token');

    if (!token) {
        setDone(true);
        return null;
    }

    endpoints.login.logout(token).then(() => setDone(true));
    return done ? <Redirect to='/' /> : null; 
}
