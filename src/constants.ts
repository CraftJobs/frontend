import { stringify } from "node:querystring";

const API_HOST = 'http://localhost:7085/v1';
const SELF_HOST = 'http://localhost:3000';

const endpoints = {
    register: {
        sendEmail: (
            email: string, 
            captchaToken: string
        ): Promise<{ message: string, deviceToken: string }> => 
            getEndpoint(
                'register/send-email', 
                { body: JSON.stringify({ email, captchaToken }) }
            ),
        checkEmailToken: (token: string): Promise<{success: boolean, email: string}> => 
            getEndpoint('register/check-email-token?token=' + token, {}),
        finish: (
            emailToken: string, 
            username: string, 
            password: string, 
            deviceToken: string|null,
        ): Promise<{success: boolean, message?: string, token?: string}> => {
            const body: {
                emailToken: string,
                username: string,
                password: string,
                deviceToken?: string
            } = { emailToken, username, password };

            if (deviceToken) {
                body.deviceToken = deviceToken;
            }

            return getEndpoint('register/finish', { body: JSON.stringify(body) });
        }
    }, 
    users: {
        me: (token: string) => getEndpoint('users/@me', { headers: { 'Authorization': token } }),
        get: (
            user: string, 
            token: string|null = null,
        ): Promise<{ success: boolean, user?: User, message?: string, self: UsersGetSelfUser }> =>
            getEndpoint('users/' + user, token ? { headers: { 'Authorization': token } } : {}),
        editMe: (token: string, changes: object): Promise<{ success: boolean, message: string }> =>
            getEndpoint('users/@me/edit', { 
                headers: { 'Authorization': token },
                body: JSON.stringify(changes)
            }),
        avatarMe: (token: string, avatar: File): Promise<{ success: boolean, message: string }> => {
            const body = new FormData();
            body.append('avatar', avatar);
            return getEndpoint('users/@me/avatar', { body, headers: {
                'Authorization': token, 
            } });
        },
        follow: (token: string, user: string): Promise<void> =>
            getEndpoint('users/' + user + '/follow', { headers: { Authorization: token }, body: '{}' }),
        unfollow: (token: string, user: string): Promise<void> =>
            getEndpoint('users/' + user + '/unfollow', { headers: { Authorization: token }, body: '{}' }),
        rep: (token: string, user: string, amount: number, message: string): Promise<void> =>
            getEndpoint('users/' + user + '/reputation', { 
                headers: { Authorization: token },
                body: JSON.stringify({ message, amount })
            }),
    },
    login: {
        checkToken: (token: string): Promise<boolean> => getEndpoint(
            'login/check-token', 
            { headers: { 'Authorization': token } }
        ),
        root: (
            username: string, 
            password: string, 
            remember: boolean,
        ): Promise<{success: boolean, token?: string, message?: string}> =>
            getEndpoint('login', { body: JSON.stringify({ username, password, remember }) })
    },
}

async function getEndpoint(url: string, options: RequestInit | undefined) {
    if (!options) {
        options = {};
    }

    if (!options.headers) {
        options.headers = {};
    }

    if (typeof options.body === 'string') {
        options.headers = {'Content-Type': 'application/json', ...options.headers};
    }
    
    if (options.body && !options.method) {
        options.method = 'post';
    }

    return await fetch(API_HOST + '/' + url, options).then(r => r.json());
}

enum LookingFor {
    LONG_TERM = "LONG_TERM",
    SHORT_TERM = "SHORT_TERM",
    PROJECTS = "PROJECTS",
}

enum Role {
    DEVELOPER = "DEVELOPER",
    SYSADMIN = "SYSADMIN",
    MANAGER = "MANAGER",
    OTHER = "OTHER",
}

enum Language {
    JAVA = "JAVA",
    KOTLIN = "KOTLIN",
}

enum RateRangeType {
    HOURLY = "HOURLY",
    FLAT = "FLAT",
}

enum ConnectionType {
    GITHUB = "GITHUB",
    EMAIL = "EMAIL",
    DISCORD = "DISCORD",
    TWITTER = "TWITTER",
}

const lookingForStrings = {
    [LookingFor.LONG_TERM]: "long-term",
    [LookingFor.SHORT_TERM]: "short-term",
    [LookingFor.PROJECTS]: "projects",
}

const rateRangeTypeStrings = {
    [RateRangeType.HOURLY]: "hr",
    [RateRangeType.FLAT]: "project",
}

const languageStrings = {
    [Language.JAVA]: "Java",
    [Language.KOTLIN]: "Kotlin",
}

const roleStrings = {
    [Role.DEVELOPER]: "Developer",
    [Role.MANAGER]: "Manager",
    [Role.SYSADMIN]: "Sysadmin",
    [Role.OTHER]: "Other",
}

const connectionTypeData = {
    [ConnectionType.GITHUB]: { 
        isLink: true, 
        linkPrefix: 'https://github.com/', 
        name: 'GitHub',
        // https://github.com/shinnn/github-username-regex/blob/master/index.js
        pattern: /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i
    },
    [ConnectionType.EMAIL]: { 
        isLink: true, 
        linkPrefix: 'mailto:', 
        name: 'Email',
        // jesus christ. https://stackoverflow.com/a/201378
        pattern: /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/g
    },
    [ConnectionType.DISCORD]: { 
        isLink: false, 
        linkPrefix: '', 
        name: 'Discord',
        // https://stackoverflow.com/questions/51507182/discord-username-format-check/51507374#comment114713791_51507374
        pattern: /^((?!(discordtag|everyone|here)#)((?!@|#|:|```).{2,32})#\d{4})$/g
    },
    [ConnectionType.TWITTER]: { 
        isLink: true, 
        linkPrefix: 'https://twitter.com/', 
        name: 'Twitter', 
        // slightly modified from: https://stackoverflow.com/a/8650024
        pattern: /^(\w){1,15}$/g
    },
}

type ReputationLogEntry = {
    user: string,
    amount: number,
    time: Date,
    message: string,
    userFullName: string,
}

type User = {
    avatarUrl: string,
    fullName: string,
    username: string,
    lookingFor: LookingFor[],
    rateRange: number[],
    reputation: number,
    role: Role,
    experience: Experience[],
    rateRangeType: RateRangeType,
    languages: Language[],
    admin: boolean,
    description: string,
    reputationLog: ReputationLogEntry[],
    connections: Map<ConnectionType, string>,
}

type Experience = {
    name: string, 
    start: Date, 
    end: Date, 
    verified: boolean, 
    avatarUrl: string,
    description: string,
    craftJobsAccount?: string,
}

type UsersGetSelfUser = {
    username: string,
    admin: boolean,
    reputationGiven: number,
    isSelf: boolean,
    isFollowing: boolean,
    plusReputationFollowing: string[],
    minusReputationFollowing: string[],
}

export {
    Role,
    Language,
    RateRangeType,
    LookingFor,
    ConnectionType,
    lookingForStrings,
    rateRangeTypeStrings,
    languageStrings,
    roleStrings,
    connectionTypeData,
    endpoints,
    SELF_HOST,
    API_HOST,
}

export type { User, Experience, ReputationLogEntry, UsersGetSelfUser }
