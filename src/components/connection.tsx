import React from 'react';
import { ConnectionType, connectionTypeData } from '../constants';

type ConnectionProps = {
    type: ConnectionType,
    link: string,
}

export default function Connection({ type, link }: ConnectionProps) {
    const data = connectionTypeData[type];

    return <span>
        <br />
        {data.name}: <b>{data.isLink
            ? <a className='hover:underline' href={data.linkPrefix + link}>
                {link}
            </a>
            : link 
        }</b>
    </span>
}
