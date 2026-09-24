import React from 'react';
import {Head} from '@inertiajs/react';

export default function TestPage({message}: { message: string }) {
    return (
        <>
            <Head>
                <title>Test Inertia SSR — Tree of Unity</title>
                <meta name="description" content="Testing Inertia SSR setup"/>
            </Head>
            <div style={{padding: '40px', fontFamily: 'sans-serif'}}>
                <h1>Inertia + React + SSR Работает!</h1>
                <p>{message}</p>
            </div>
        </>
    );
}