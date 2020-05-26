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
    return getJsonRpcClient({ makeClient, ...params })
}

export const makeJsonRpcSimplePeer = async ({
    initRouter = server => new BidirectionalWebRTCRouter(server),
    syncFunction = (router, channel) => router.addRTCDataChannelSync(channel),
    endpoint = (...params) => new Endpoint(...params),
    ClientClass = Client,
    setClient,
    PeerClass = DataChannel,
    peerParams: { onConnect, ...peerParams } = {},
    ...params
}) => {
    const client = await makeJsonRpcClient({
        initRouter,
        syncFunction,
        endpoint,
        ClientClass,
        dataChannel: ()  => new PeerClass ({
            onConnect: () => {
                setClient && setClient(client)
                onConnect && onConnect()
            },
            ...peerParams
        }),
        ...params
    })

    return client
}
