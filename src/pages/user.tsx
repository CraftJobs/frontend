import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Role, RateRangeType, ConnectionType, User as UserType, endpoints, UsersGetSelfUser } from '../constants';
import User from '../components/user';


export default function UserPage() {
    const { username }: { username: string } = useParams();

    // Fake user while loading
    const [user, setUser] = useState({
        avatarUrl: 'https://static.craftjobs.net/default-avatar.png',
        fullName: '',
        username,
        lookingFor: [],
        rateRange: [],
        reputation: 0,
        role: Role.DEVELOPER,
        experience: [],
        rateRangeType: RateRangeType.FLAT,
        languages: [],
        admin: false,
        description: '',
        reputationLog: [],
        connections: new Map(),
    } as UserType);

    const [self, setSelf] = useState(undefined as UsersGetSelfUser|undefined);

    const errors = {
        'not_found': 'User not found.'
    };

    const [fetched, setFetched] = useState(false);
    const [error, setError] = useState('Loading...');

    if (!fetched) {
        setFetched(true);
        endpoints.users.get(username, localStorage.getItem('token')).then((res) => {
            if (!res.success && res.message) {
                setError((errors as any)[res.message]);
                return;
            }
            
            if (res.user) {
                res.user.connections = new Map(
                    Object.entries(res.user.connections)
                    ) as Map<ConnectionType, string>;

                setUser(res.user);
            }

            if (res.self) {
                setSelf(res.self);
            }

            setError('');
        })
    }

    return <div className="lg:container mx-auto lg:px-64">
        {error === '' 
            ? (self ? <User user={user} self={self} /> : <User user={user} />)
            : <div className="lg:container mx-auto lg:px-64">
                <figure className="bg-gray-100 rounded-xl lg:mt-9 lg:ml-9 shadow pl-3 pt-2 pb-3">
                    <h1 className="text-2xl">{error}</h1>
                </figure>
            </div>
        }
    </div>
}
