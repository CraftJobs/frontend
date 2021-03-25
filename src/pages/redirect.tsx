import React from 'react';
import { Redirect, useLocation } from 'react-router';

const USERNAME_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz012345679_';

export default function RedirectPage() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    const prefillUsername = query.has('u') ? query.get('u') as string : '';
    let redirect = query.has('r') ? (query.get('r') as string) : '';
    const redirectQuery = query.has('rq') ? '?' + query.get('rq') : '';


    if (redirect) {
        if (!redirect.startsWith('i/')) {
            // Validate username redirect
            for (const char of redirect) {
                if (!USERNAME_CHARS.includes(char)) {
                    console.log("BAD CHAR: " + char);
                    redirect = '';
                }
                break;
            }
        }
    }

    return <Redirect to={'/' + redirect + redirectQuery} />;
}
