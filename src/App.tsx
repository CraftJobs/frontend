import React from 'react';
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

function App() {
    return (
        <div className="App">
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
                <Route exact path='/' component={() => <Redirect to='/CraftJobs' />} />
                <Route exact path='/:username' component={(props: any) => 
                    <UserPage {...props} key={window.location.pathname} /*Force rerender on change */ />} 
                />
            </BrowserRouter>
        </div>
    );
}

export default App;
