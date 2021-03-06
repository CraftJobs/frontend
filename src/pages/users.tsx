import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Link, Redirect, useLocation } from 'react-router-dom';
import { endpoints, ListUser } from '../constants';

const ALL_CATS = ['rep', 'low', 'old', 'new', 'adm', 'fol', 'fpr'];

export default function UsersPage() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    const [currentCat] = useState(query.get('c'));
    const [users, setUsers] = useState([{
        admin: false,
        createdAt: new Date(),
        fullName: 'Loading...',
        partialDescription: '',
        reputation: 0,
        username: 'CraftJobs',
    }]);
    const [fetched, setFetched] = useState(false);
    const [redirect, setRedirect] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        document.title = 'Users | CraftJobs';
    }, []);

    if (!currentCat || !ALL_CATS.includes(currentCat)) {
        return <Redirect to='/i/users?c=rep' />
    }

    function getCatLink(cat: string, display: string) {
        return <Link to={'/i/users?c=' + cat} className='hover:underline'>
            <b className={currentCat === cat ? 'text-blue-500' : ''}>{display}</b>
        </Link>
    }

    if (!fetched) {
        setFetched(true);
        endpoints.users.list(currentCat, token).then((res) => {
            if (!Array.isArray(res)) {
                // Bad session.
                localStorage.removeItem('token');
                setRedirect('/i/users?c=rep');
                setUsers([]);
            } else {
                setUsers(res);
            }
        });
    }

    return <div><figure className="dark:bg-gray-700 bg-gray-100 rounded-xl lg:mt-5 lg:ml-9 lg:mr-9 shadow pb-1 pt-1 dark:text-gray-300">
    <div className="lg:flex text-left pl-3 lg:pl-0 space-y-4 lg:ml-5 lg:mr-5">
        <span>
            <b><Link className='hover:underline' to='/'>back home</Link></b> &mdash;{' '}
            sort by:{' '}
            {getCatLink('rep', 'top reputation')} |{' '}
            {getCatLink('low', 'lowest reputation')} |{' '}
            {getCatLink('old', 'oldest users')} |{' '}
            {getCatLink('new', 'newest users')} |{' '}
            {getCatLink('adm', 'staff')}
            { token ? 
            <span>
                {' | '}
                {getCatLink('fol', 'people you follow')} |{' '}
                {getCatLink('fpr', '+reps of people you follow')
            }</span> : ''}
        </span>
    </div>
    </figure>
    <figure className="dark:bg-gray-700 bg-gray-100 rounded-xl lg:mt-5 lg:ml-9 lg:mr-9 shadow pb-1 pt-1 dark:text-gray-300">
    <div className="text-left lg:pl-0 space-y-4">
        <table className="table-auto">
            <tr>
                <th className="pl-5 pr-5">Name</th>
                <th className="pl-5 pr-5">Description</th>
                <th className="pl-5 pr-5">Reputation</th>
                <th className="pl-5 pr-5">Joined</th>
            </tr>
            {users.map(user => <tr>
                <td className="pl-5 pr-5 pt-3">
                    <Link className='hover:underline' to={'/' + user.username}>
                        <b>{user.fullName}</b> (@{user.username})
                    </Link>
                    {user.admin ? <span>
                        {' '}&middot; <span className='text-red-500'>Staff</span>
                    </span> : ''}
                </td>
                <td className="pl-5 pr-5 pt-3">{user.partialDescription}</td>
                <td className="pl-5 pr-5 pt-3">
                    <b className={user.reputation > -1 ? 'text-green-500' : 'text-red-500'}>
                        {user.reputation > 0 ? '+' : ''}{user.reputation} rep
                    </b>
                </td>
                <td className="pl-5 pr-5 pt-3">
                    {moment(user.createdAt).calendar()}
                </td>
            </tr>)}
        </table>
    </div>
    </figure>
    { redirect === '' ? '' : <Redirect to={redirect} />}
    </div>
}
