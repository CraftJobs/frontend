import React, { useState } from 'react';
import { API_HOST } from '../constants';

export default function DebugButtons({ endpoint }: any) {
    const host = API_HOST + '/' + endpoint + '/_debug';
    const [fetched, setFetched] = useState(false);
    const [text, setText] = useState('');
    const [buttons, setButtons] = useState([] as string[]);

    if (!localStorage.getItem('super_secret_debug')) {
        return null;
    }

    if (!fetched) {
        setFetched(true);
        fetch(host).then(r => r.json()).then(json => {
            setButtons(json);
        })
        .catch(() => setText("Look ma, I'm a reverse engineer!"));
    }

    return <div>
        <br />
        <br />
        <br />
        <b>DEBUG</b>
        <p>Result: <pre>{text}</pre></p>
        <br />
        <b>OPTIONS: </b>
            {buttons.map(x => <span><span className='hover:underline cursor-pointer' onClick={() => {
                fetch(host + '/' + x.replaceAll(' ', '-')).then(r => r.json()).then((json) => {
                    setText(json);
                });
            }}>{x}</span> &middot; </span>)}
    </div>
}
