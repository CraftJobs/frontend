import React from 'react';
import { ConnectionType, connectionTypeData } from '../constants';

type ConnectionProps = {
    type: ConnectionType,
    link: string,
    username: string,
}

export default function Connection({ type, link, username }: ConnectionProps) {
    const data = connectionTypeData[type];

    let isLink = false;
    let linkDest = data.linkPrefix + link;
    let linkText = link;

    if (link === '_unauthed') {
        linkDest = 'https://craftjobs.net/i/login?r=' + username;
        linkText = 'login to view';
    }

    if (link.startsWith('https://discord.gg')) {
        linkDest = link;
        linkText = link.replace('https://', '');
        isLink = true;
    } else if (link.startsWith('discord.gg')) {
        linkDest = 'https://' + link;
        linkText = link;
        isLink = true;
    }

    return <span>
        <br />
        {data.name}: <b>{isLink
            ? <a className='hover:underline' href={linkDest}>
                {linkText}
            </a>
            : link 
        }</b>
    </span>
}
