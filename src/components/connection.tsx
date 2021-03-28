import React from 'react';
import { ConnectionType, connectionTypeData } from '../constants';

type ConnectionProps = {
    type: ConnectionType,
    link: string,
    username: string,
}

export default function Connection({ type, link, username }: ConnectionProps) {
    const data = connectionTypeData[type];

    let linkDest = link;
    let linkText = link;

    if (link === '_unauthed') {
        linkDest = 'https://craftjobs.net/i/login?r=' + username;
        linkText = 'login to view';
    }

    return <span>
        <br />
        {data.name}: <b>{data.isLink
            ? <a className='hover:underline' href={data.linkPrefix + linkDest}>
                {linkText}
            </a>
            : link 
        }</b>
    </span>
}
