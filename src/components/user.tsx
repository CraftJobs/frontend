import moment from 'moment';
import React, { useState } from 'react';
import { Link, Redirect, useLocation } from 'react-router-dom';

import { 
    User, 
    Experience, 
    rateRangeTypeStrings, 
    roleStrings, 
    RateRangeType,
    ReputationLogEntry,
    Role,
    connectionTypeData,
    ConnectionType,
    UsersGetSelfUser,
    endpoints
} from '../constants';
import Connection from './connection';

export default function UserComponent(props: { user: User, self?: UsersGetSelfUser }) {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const { self } = props;

    //#region state
    const [user] = useState(props.user);
    const [avatarUrl] = useState(user.avatarUrl);
    const [fullName] = useState(user.fullName);
    const [username] = useState(user.username);
    const [lookingFor] = useState(user.lookingFor);
    const [rateRange] = useState(user.rateRange);
    const [reputation] = useState(user.reputation);
    const [role] = useState(user.role);
    const [experience] = useState(user.experience);
    const [rateRangeType] = useState(user.rateRangeType);
    const [admin,] = useState(user.admin);
    const [description] = useState(user.description);
    const [reputationLog] = useState(user.reputationLog);
    const [fullNameInput, setFullNameInput] = useState(fullName);
    const [rateRangeLowerInput, setRateRangeLowerInput] = useState(rateRange.length > 0 ? rateRange[0] : 0);
    const [rateRangeHigherInput, setRateRangeHigherInput] = useState(rateRange.length > 1 ? rateRange[1] : 0);
    const [rateIsRangeInput, setRateIsRangeInput] = useState(rateRange.length > 1);
    const [rateRangeTypeInput, setRateRangeTypeInput] = useState(rateRangeType);
    const [, setLookingForInput] = useState(lookingFor);
    const [roleInput, setRoleInput] = useState(role);
    const [orientation, setOrientation] = useState(query.has('o'));
    const [edit, setEdit] = useState(orientation);
    const [displayRateInput, setDisplayRateInput] = useState(rateRange.length > 0);
    const [connectionsInput, setConnectionsInput] = useState(new Map(user.connections.entries()));
    const [refreshHack, setRefreshHack] = useState(-1);
    const [avatarUrlInput, setAvatarUrlInput] = useState(avatarUrl);
    const [redirect, setRedirect] = useState('');
    const [descriptionInput, setDescriptionInput] = useState(description);
    const [error, setError] = useState('');
    const [rateRangeHigherDisplay, setRateRangeHigherDisplay] = useState(rateRangeHigherInput + '');
    const [rateRangeLowerDisplay, setRateRangeLowerDisplay] = useState(rateRangeLowerInput + '');
    const [avatarInput, setAvatarInput] = useState(null as File | null);
    const [isFollowing, setIsFollowing] = useState(self?.isFollowing);
    const [reputationInput, setReputationInput] = useState(0);
    const [reputationMessageInput, setReputationMessageInput] = useState('');
    const [adminReputation, setAdminReputation] = useState(false);
    const [dark, _] = useState(!!localStorage.getItem('dark'));
    //#endregion state

    function setNeutralReputation() {
        setReputationInput(0);
        handleRepClick();
    }

    function getRateRangeFormatted() {
        let rateRangeTwo;

        if (rateRange.length < 2) {
            rateRangeTwo = '';
        } else {
            rateRangeTwo = <span> - ${rateRange[1]}</span>
        }

        return <span><b>${rateRange[0]}{rateRangeTwo}/{rateRangeTypeStrings[rateRangeType]}</b></span>;
    }

    function getRepStyle() {
        return reputation < 0 ? "text-red-500" : "text-green-500";
    }

    function getRepFormatted() {
        let formatted = reputation + "";

        if (reputation > 0) {
            formatted = "+" + reputation;
        }

        return formatted;
    }

    function getExperience({name, start, end, verified, avatarUrl, description, craftJobsAccount}: Experience) {
        let verifiedText = <span></span>;

        if (verified) {
            verifiedText = <span> &middot; verified by {name}</span>
        }

        return <figure className="lg:flex bg-gray-200 rounded-xl p-3 m-5 pl-5 shadow">
            <img 
                className="w-16 h-16 rounded-full shadow-lg bg-gray-200" 
                alt="organization avatar" 
                src={avatarUrl}
            />
            <div className="pl-5">
                <b>{craftJobsAccount 
                    ? <Link to={'/o/' + craftJobsAccount} className="hover:underline">{name}</Link> 
                    : name
                }</b>
                <span className="pl-2">{start} &ndash; {end}{verifiedText}</span>
                <br />
                <span className="pt-3">{description}</span>
            </div>
        </figure>
    }

    function arrayEquals(a: number[], b: number[]) {
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((val, index) => val === b[index]);
    }

    function handleEditClick() {
        setEdit(true);
    }

    function handleCancelClick() {
        setEdit(false);
        setOrientation(false);
        resetInputs();
        setRedirect('/' + username);
    }

    // https://stackoverflow.com/a/54140811
    const mapToObj = (m: Map<ConnectionType, string>) => {
        return Array.from(m).reduce((obj, [key, value]) => {
          (obj as any)[key] = value;
          return obj;
        }, {});
      };

    function handleSaveClick() {
        function compareMaps(map1: Map<ConnectionType, string>, map2: Map<ConnectionType, string>) {
            var testVal;
            if (map1.size !== map2.size) {
                return false;
            }
            for (var [key, val] of map1) {
                testVal = map2.get(key);
                // in cases of an undefined value, make sure the key
                // actually exists on the object so there are no false positives
                if (testVal !== val || (testVal === undefined && !map2.has(key))) {
                    return false;
                }
            }
            return true;
        }


        const changes: {
            fullName?: string,
            rateRange?: number[],
            role?: Role,
            rateRangeType?: RateRangeType,
            description?: string,
            connections?: object,
        } = {};

        const rateRangeInput = [];

        if (displayRateInput) {
            rateRangeInput.push(Number.parseInt(rateRangeLowerDisplay));
            
            if (rateIsRangeInput) {
                rateRangeInput.push(Number.parseInt(rateRangeHigherDisplay));
            }
        }

        if (fullName !== fullNameInput) changes.fullName = fullNameInput;
        if (!arrayEquals(rateRange, rateRangeInput)) changes.rateRange = rateRangeInput;
        if (role !== roleInput) changes.role = roleInput;
        if (rateRangeType !== rateRangeTypeInput) changes.rateRangeType = rateRangeTypeInput;
        if (description !== descriptionInput) changes.description = descriptionInput;
        if (!compareMaps(user.connections, connectionsInput)) 
        changes.connections = mapToObj(connectionsInput);

        if (avatarUrl !== avatarUrlInput) {
            endpoints.users.avatarMe(localStorage.getItem('token') as string, avatarInput as File)
            .then((res) => {
                if (!res.success) {
                    setError(res.message);
                    return;
                } 

                endpoints.users.editMe(localStorage.getItem('token') as string, changes).then(res => {
                    if (res.success) {
                        // TODO: Make this more pretty, but right now we're just gonna redirect us back to
                        // reload the component lol.
                        setRedirect('/i/r?r=' + username);
                    } else {
                        setError(res.message);
                    }
                });
            })
        } else {
            endpoints.users.editMe(localStorage.getItem('token') as string, changes).then(res => {
                if (res.success) {
                    // TODO: Make this more pretty, but right now we're just gonna redirect us back to
                    // reload the component lol.
                    setRedirect('/i/r?r=' + username);
                } else {
                    setError(res.message);
                }
            });
        }
    }

    function handleFollowClick() {
        endpoints.users.follow(localStorage.getItem('token') as string, username).then(
            () => setIsFollowing(true)
        );
    }

    function handleUnfollowClick() {
        endpoints.users.unfollow(localStorage.getItem('token') as string, username).then(
            () => setIsFollowing(false)
        );
    }

    function handleLoginFollowClick() {
        setRedirect('/i/login?r=' + username);
    }

    function handleRepClick() {
        endpoints.users.rep(
            localStorage.getItem('token') as string, 
            username, 
            reputationInput, 
            reputationInput !== 0 ? reputationMessageInput : ''
        ).then(() => setRedirect('/i/r?r=' + username));
    }

    function resetInputs() {
        setFullNameInput(fullName);
        setRateRangeLowerInput(rateRange.length > 0 ? rateRange[0] : 0);
        setRateRangeHigherInput(rateRange.length > 1 ? rateRange[1] : 0);
        setRateIsRangeInput(rateRange.length > 1);
        setRateRangeTypeInput(rateRangeType);
        setLookingForInput(lookingFor);
        setRoleInput(role);
        setDisplayRateInput(rateRange.length > 0);
        setConnectionsInput(user.connections);
        setAvatarUrlInput(avatarUrl);
    }

    function getReputationEntry(entry: ReputationLogEntry) {
        const userLink = '/' + entry.user;

        return <span>
            <b>{entry.userFullName}</b>
            {' '}(<Link to={userLink} className="hover:underline">@{entry.user}</Link>) gave 
            <b> {username} </b>
            <span className={entry.amount > 0 ? "text-green-500" : "text-red-500"}>
            <b>{entry.amount > 0 ? '+' : ''}{entry.amount} rep</b>
            </span>: {entry.message}

            <span className="text-sm text-gray-500"> 
                {' '}&ndash; {moment(entry.time).fromNow()}
                {/* {' '}&middot; report abuse */}
            </span>
            <br />
        </span>
    }

    function toggleDarkMode() {
        if (dark) {
            localStorage.removeItem('dark');
        } else {
            localStorage.setItem('dark', 'this value is irrelevant so hello how are you?');
        }

        console.log(window.location.protocol);

        // Force actual page change here because React sucks
        window.location.href = window.location.protocol + '//' + window.location.host + '/i/r?r=' + username;
    }

    return <div className="dark:text-gray-300">
    <figure className="lg:flex dark:bg-gray-700 bg-gray-100 rounded-xl lg:mt-9 lg:ml-5 shadow pl-3 pt-2 pb-3">
        <div className="pl-3">
            {orientation
                ? 'Welcome to CraftJobs! Set up your profile.'
                : (self
                    ? <span>Logged in as:{' '}
                        <Link className='hover:underline' to={'/' + self.username}>
                            <b>@{self.username}</b>
                        </Link> | {' '}
                        <Link className='hover:underline' to={'/i/login/change-password'}>
                            <b>Change password</b>
                        </Link> | {' '}
                    <b><Link className='hover:underline' to='/i/logout'>Logout</Link></b></span>
                    : <span>
                        Not logged in. | 
                        <b>{' '}<Link className='hover:underline' to='/i/login'>Login</Link></b> |
                        <b>{' '}<Link 
                            className='hover:underline' 
                            to='/i/register/email-verification'>Register</Link>
                        </b>
                    </span>)}
                {' '}|{' '}
                    <a className="hover:underline" href="https://discord.gg/QKMYAaJPCU">
                        <b>Discord</b>
                    </a> |{' '}
                    <b><Link className='hover:underline' to='/i/users'>User directory</Link></b> |{' '}
                    <span className="hover:underline cursor-pointer" onClick={() => toggleDarkMode()}>
                        <b>{dark ? 'Light theme' : 'Dark theme'}</b>
                    </span>
        </div>
    </figure>
    <figure className="dark:bg-gray-700 bg-gray-100 rounded-xl lg:mt-9 lg:ml-5 shadow pb-3">
    <div className="lg:flex pt-6 text-left pl-3 lg:pl-0 space-y-4 lg:ml-9">
        <img 
            className="w-24 h-24 rounded-full shadow-lg bg-gray-200 dark:bg-gray-600 mx-auto lg:mx-0" 
            alt="user avatar" 
            src={avatarUrlInput} 
            style={{objectFit: 'cover'}}
        />
        { edit 
            ? <div>
                <input type="file" accept="image/*" onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                        setAvatarUrlInput(URL.createObjectURL(e.target.files[0]));
                        setAvatarInput(e.target.files[0]);
                    }
                }} />
                <br />
                To save your avatar/profile, <br />
                click save on the right.
            </div>
            : '' 
        }
        <div className="lg:pl-5" style={{'marginTop': 'auto'}}>
            <p className="text-2xl pb-1">
                { edit 
                    ? <input 
                        className="shadow dark:bg-gray-600 pl-2" 
                        value={fullNameInput} 
                        onChange={e => setFullNameInput(e.target.value)}
                        type="text"
                    />
                    : fullName }
                <span className="text-base pl-1">
                    @{username}
                    {admin 
                        ? <span> 
                            <span> &middot; </span>
                            <span className="text-red-500"> Staff</span>
                        </span>
                        : ''}
                    {(self && self.isSelf 
                        ? (edit
                            ? [['save', handleSaveClick], ['cancel', handleCancelClick]]
                            : [['edit', handleEditClick]])
                        : (!self 
                            // Don't show follow button if not logged in
                            ? [['login to follow', handleLoginFollowClick]] : 
                            isFollowing
                            ? [['unfollow', handleUnfollowClick]]
                            : [['follow', handleFollowClick]]))
                            .map(([text, handler]: any[]) => 
                                <span> 
                                    {' '}&middot;{' '}
                                    <span className="hover:underline cursor-pointer" onClick={handler}>
                                        <b>{text}</b>
                                    </span>
                                </span>)
                    }
                </span>
            </p>
            { edit 
                ? <span>
                    <input type='checkbox' 
                        checked={displayRateInput} 
                        onChange={e => setDisplayRateInput(e.target.checked)} 
                    /> 
                    {' '}Display a rate on your profile <br />
                </span> 
                : '' 
            }
            {displayRateInput ? 
            <span>Rate{rateIsRangeInput ? ' range' : ''}: {edit 
                ? <span>
                    $<input 
                        className="dark:bg-gray-600 shadow pl-1 w-9" 
                        value={rateRangeLowerDisplay} 
                        onChange={e => {
                            setRateRangeLowerInput(e.target.valueAsNumber);
                            setRateRangeLowerDisplay(e.target.value);
                        }}
                        type="text"
                    />
                    {rateIsRangeInput
                        ? <span> - 
                            $<input 
                                className="dark:bg-gray-600 shadow pl-1 w-9" 
                                value={rateRangeHigherDisplay} 
                                onChange={e => {
                                    setRateRangeHigherInput(e.target.valueAsNumber);
                                    setRateRangeHigherDisplay(e.target.value);
                                }}
                                type="text"
                            />
                        </span>
                        : ''
                    }/
                    <select 
                        value={rateRangeTypeInput} 
                        onChange={e => setRateRangeTypeInput(e.target.value as RateRangeType)}
                        className="ml-1 pl-1 shadow dark:bg-gray-600"
                    >
                        {Object.keys(RateRangeType)
                            .map(type => 
                                <option value={type}>{rateRangeTypeStrings[type as RateRangeType]}</option>
                            )
                        }
                    </select>
                    <input
                        type="checkbox"
                        className="shadow ml-1"
                        checked={rateIsRangeInput}
                        onChange={e => setRateIsRangeInput(e.target.checked)}
                    />
                    <span> is range</span>
                </span>
                : getRateRangeFormatted()
            }<br /></span> : ''} 
            Role: {edit 
                ? <select className="shadow dark:bg-gray-600" value={roleInput} onChange={e => setRoleInput(e.target.value as Role)}>
                    {Object.values(Role).map(x => 
                        <option value={x}>{roleStrings[x]}</option>)
                    }
                </select>
                : <b>{roleStrings[role]}</b>
            }<br />
            Reputation: <b className={getRepStyle()}>{getRepFormatted()}</b>
            {self && self.isSelf
                ? ''
                : !self ? '' : <span> 
                    {' '}(
                    <span className={
                        "text-green-500 hover:underline cursor-pointer" + 
                        (self && self.reputationGiven === 1 ? ' font-bold' : '')
                    } onClick={() => setReputationInput(1)}>+rep</span> 
                    {' '}/{' '}
                    <span className={
                        "text-gray-500 hover:underline cursor-pointer dark:text-gray-300" + 
                        (self && self.reputationGiven === 0 ? ' font-bold' : '')
                    } onClick={() => setNeutralReputation()}>neutral</span> 
                    {' '}/{' '}
                    { self.admin ? <span><span className={
                        "text-blue-500 hover:underline cursor-pointer"
                    } onClick={() => setAdminReputation(true)}>custom</span> 
                    {' '}/{' '}</span> : '' }
                    <span className={
                        "text-red-500 hover:underline cursor-pointer" + 
                        (self && self.reputationGiven === -1 ? ' font-bold' : '')
                    } onClick={() => setReputationInput(-1)}>-rep</span>)
                </span>
            }
            <br />
            {self && self.plusReputationFollowing.length > 0
                ? <span>
                    <span className="text-green-500"><b>+reps</b> </span>
                    you know:
                    <b> {self.plusReputationFollowing.map(x => 
                            <span>
                                <Link className="hover:underline" to={'/' + x}>@{x}</Link>{' '}
                            </span>
                        )}</b>
                        <br />
                </span>
                : ''
            }
            {self && self.minusReputationFollowing.length > 0
                ? <span>
                    <span className="text-red-500"><b>-reps</b> </span>
                    you know:
                    <b> {self.minusReputationFollowing.map(x => 
                            <span>
                                <Link className="hover:underline" to={'/' + x}>@{x}</Link>{' '}
                            </span>
                        )}</b>
                        <br />
                </span>
                : ''
            }
            {edit
                ? Object.values(ConnectionType).map(type => <span className={'ignoreme-' + refreshHack}>
                    <br />
                    {connectionTypeData[type].name}: {connectionTypeData[type].linkPrefix}<input 
                        className="dark:bg-gray-600 shadow pl-1" 
                        value={connectionsInput.has(type) ? connectionsInput.get(type) : ''} 
                        onChange={e => {
                            setConnectionsInput(connectionsInput.set(type, e.target.value));
                            // React doesn't get the message when you update an ES6 map, so we have
                            // to slap it in the face and make it realise a re-render is reuqired.
                            setRefreshHack(Math.random());
                        }}
                        type="text"
                    />
                </span>)
                : Array.from(user.connections).map(([type, link]) => 
                    <Connection link={link} type={type} username={username} />
                )
            }
            { user.connections.size > 0 ? <br /> : '' }
            { description.trim() !== '' ? <br /> : '' }
            {!edit ? description.split('\n').map(x => <span>{x}<br /></span>) : ''}
            <span className='text-red-500'>{error}</span>
        </div>
    </div>
    <div>
        {experience ? experience.map(getExperience) : ''}
    </div>
    { edit || reputationInput !== 0 || adminReputation ? <figure className="dark:bg-gray-700 bg-gray-100 rounded-xl mt-3 lg:ml-5 shadow pb-3">
        <div className="text-sm pl-3 pt-3 mr-3">
            {adminReputation ? <span>
                Rep Amount: 
                <input type="number" onChange={e => setReputationInput(e.target.valueAsNumber)} 
                />
                <br />
            </span> : ''}
            <b>{reputationInput !== 0 || adminReputation ? 'Reputation message' : 'Description:'}</b>
            <br />
            <textarea 
                className="mt-3 w-full shadow-xl rounded dark:bg-gray-600"
                value={reputationInput !== 0 || adminReputation ? reputationMessageInput : descriptionInput}
                onChange={
                    e => 
                    (reputationInput !== 0 || adminReputation
                        ? setReputationMessageInput 
                        : setDescriptionInput)(e.target.value)
                }
            />
            <br />
            {reputationInput !== 0 ? <span><span className='hover:underline cursor-pointer' onClick={handleRepClick}>
                submit</span>
                <br />
                {self?.reputationGiven !== 0 
                    ? <b>This will override your previous reputation!</b> : ''}
            </span> : ''}
        </div>
    </figure> : ''}
    </figure>
    { reputationLog.length > 0
        ? <figure className="dark:bg-gray-700 bg-gray-100 rounded-xl mt-3 lg:ml-5 shadow pb-3">
            <div className="pt-6 text-left space-y-4 ml-3 lg:ml-9 pb-3">
                {reputationLog.map(getReputationEntry)}
            </div>
        </figure> 
        : ''
    }
    <figure className="dark:bg-gray-700 bg-gray-100 rounded-xl mt-3 lg:ml-5 shadow pb-3">
        <div className="text-sm pl-3 pt-3 text-gray-500 dark:text-gray-300">
            &copy; 2021 CraftJobs 
            &ndash; All Rights Reserved
        </div>
    </figure>
    {redirect === '' ? '' : <Redirect to={redirect} />}
    </div>
}
