import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import UserPage from './pages/user';
import RegisterEmailVerification from './pages/register/email_verification';
import RegisterFinish from './pages/register/finish';
import Login from './pages/login';
import LoginChangePassword from './pages/login/change_password';
import RedirectPage from './pages/redirect';
import Logout from './pages/logout';
import UsersPage from './pages/users';
import GKLogin from './pages/gklogin';
import OutPage from './pages/out';

function App() {
    const [tokenCookieSet, setTokenCookieSet] = useState('no');

    if (localStorage.getItem('dark')) {
        document.getElementsByTagName('body')[0].className = 'dark bg-gray-800';
    }

    const token = localStorage.getItem('token');

    if (token && !document.cookie.includes('sistoken=' + token)) {
        document.cookie = 'sistoken=' + token + ';path=/;max-age=31536000';
        setTokenCookieSet('yes');
    }

    return (
        <div className={localStorage.getItem('dark') ? 'dark' : ''} key={tokenCookieSet}>
            <BrowserRouter>
                <Route exact path='/i/register/email-verification' component={RegisterEmailVerification} />
                <Route exact path='/i/register/finish/:token' component={RegisterFinish} />
                <Route exact path='/i/login' component={Login} />
                <Route exact path='/i/login/change-password' component={LoginChangePassword} />
                <Route exact path='/i/r' component={RedirectPage} />
                <Route exact path='/i/logout' component={Logout} />
                <Route exact path='/i/users' component={(props: any) => 
                    <UsersPage {...props} key={window.location.href} />
                }/>
                <Route exact path='/i/gklogin' component={GKLogin} />
                <Route exact path='/i/out' component={OutPage} />
                <Route exact path='/' component={() => <Redirect to='/CraftJobs' />} />
                <Route exact path='/:username' component={(props: any) => 
                    <UserPage {...props} key={window.location.pathname} /*Force rerender on change */ />} 
                />
            </BrowserRouter>
        </div>
    );
}

export default App;
