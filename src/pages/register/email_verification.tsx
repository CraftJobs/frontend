import React, { useEffect, useState } from 'react';
import { Redirect, useLocation } from 'react-router';
import DebugButtons from '../../components/debug_buttons';
import { endpoints } from '../../constants';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Link } from 'react-router-dom';

export default function EmailVerification() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    const [isForgotPassword] = useState(query.has('fp'));
    const [fromFinishFail] = useState(query.has('f'));
    const [statusText, setStatusText] = useState('');
    const [email, setEmail] = useState('');
    const [doRedirect, setDoRedirect] = useState(false);
    const [tokenChecked, setTokenChecked] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');

    const token = localStorage.getItem('token');

    if (token && !tokenChecked) {
        setTokenChecked(true);
        endpoints.login.checkToken(token).then(good => {
            if (good) {
                setDoRedirect(true);
            }
        });
    }

    function handleButtonClick() {
        endpoints.register.sendEmail(email, captchaToken, isForgotPassword).then(res => {
            if (res.deviceToken) {
                localStorage.setItem("deviceToken", res.deviceToken);
            }

            setStatusText(res.message);
        });
    }

    useEffect(() => {
        document.title = 'Email Verification | CraftJobs';
    }, []);

    return <div>
        <div className="container mx-auto lg:px-64 dark:text-gray-300">
        <figure className="dark:bg-gray-700 bg-gray-100 rounded-xl lg:mt-9 lg:ml-9 shadow pl-3 pt-2 pb-3">
            <h1 className="text-2xl">{!isForgotPassword
                ? 'Signup: Email Verification' 
                : 'Forgot Password'
            }</h1>
            <br />
            {fromFinishFail
                ? <div><p><b>
                    Uh oh! Looks like your email token expired, or something broke on our end. Try 
                    confirming your email again.
                </b></p><br /></div>
                : ''}
            {!isForgotPassword ? 
                <p>In order to protect the email addresses of our users, we'll send you an email first
                before completing registration. If you already have an account here, we'll let you
                know. NOTE: You can only send these emails once every 10 minutes.</p>
                : <p>
                Enter your email below. We'll send you a link to reset your password if your account exists.
                </p>}
            <br />
            <p>Your email address:</p>
            <input 
                className="shadow text-lg p-1 dark:bg-gray-600" 
                type="email" 
                onChange={e => setEmail(e.target.value)} 
            />
            <br />
            <br />
            <HCaptcha 
                sitekey="8ab99297-33ae-4799-ae34-3e38ca68e7a9" 
                theme={localStorage.getItem('dark') ? 'dark' : 'light'}
            onVerify={(token) => {
                setCaptchaToken(token);
            }} />
            <button 
                className="focus shadow-xl button bg-blue-100 mt-2 text-lg rounded p-1 text-blue-500 dark:text-gray-300 dark:bg-gray-600"
                onClick={handleButtonClick}
            >
                Send Email
            </button>
            <br />
            <Link to='/i/login' className='hover:underline'>Login instead</Link>
            <br />
            <p className="mt-2">
                {statusText}
            </p>
            {doRedirect ? <Redirect to='/' /> : ''}
            <DebugButtons endpoint="register" />
        </figure>
        </div>
    </div>
}
