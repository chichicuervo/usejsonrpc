import React, { useEffect, useState } from 'react'

import { useJsonRpcClient, getJsonRpcClient, makeJsonRpcClient } from './useJsonRpcClient'
import { BidirectionalWebRTCRouter, Endpoint, Client } from '../JsonRpc'
import { DataChannel } from '../SimplePeer'

export const useJsonRpcSimplePeer = ({
    getClient = getJsonRpcSimplePeer,
    ...params
}) => {
    return useJsonRpcClient({ getClient, ...params })
}

export const getJsonRpcSimplePeer = async ({
    makeClient = makeJsonRpcSimplePeer,
    ...params
}) => {
    const validatePeer = async (client) => {
        console.log('validatePeer', client)
    }

    return getJsonRpcClient({ makeClient, validatePeer, ...params })
}

export const makeJsonRpcSimplePeer = async ({
    initRouter = server => new BidirectionalWebRTCRouter(server),
    syncFunction = (router, channel) => router.addRTCDataChannelSync(channel),
    endpoint = (...params) => new Endpoint(...params),
    ClientClass = Client,
    setClient,
    PeerClass = DataChannel,
    // peerParams: { onConnect, onClose, ...peerParams } = {},
    peerParams = {},
    debug,
    ...params
}) => {
    const client = await makeJsonRpcClient({
        initRouter,
        syncFunction,
        endpoint,
        ClientClass,
        // dataChannel: () => makeDataChannel({ client, PeerClass, setClient, onConnect, onClose, debug, ...peerParams }),
        dataChannel: () => new PeerClass ({ // how do i only return when conneciton successful?
            // onConnect: () => {
            //     setClient && setClient(client)
            //     onConnect && onConnect()
            // },
            // onClose: () => {
            //     setClient && setClient(undefined)
            //     onClose && onClose()
            // },
            debug,
            ...peerParams
        }),
        ...params
    })

    return client
}

// const makeDataChannel = ({ client, PeerClass, setClient, onConnect, onClose, debug, ...params }) => {
//     return new Promise((resolve, reject) => {
//         const peer = new PeerClass ({ // how do i only return when conneciton successful?
//             onConnect: () => {
//                 setClient && setClient(client)
//                 onConnect && onConnect()
//                 resolve(peer)
//             },
//             onClose: () => {
//                 setClient && setClient(undefined)
//                 onClose && onClose()
//             },
//             debug,
//             ...params
//         })
//     })
// }


const makeDataChannel = ({ client, PeerClass, setClient, onConnect, onClose, debug, ...params }) => {
    return new PeerClass ({ // how do i only return when conneciton successful?
        onConnect: () => {
            setClient && setClient(client)
            onConnect && onConnect()
        },
        onClose: () => {
            setClient && setClient(undefined)
            onClose && onClose()
        },
        debug,
        ...params
    })
}
