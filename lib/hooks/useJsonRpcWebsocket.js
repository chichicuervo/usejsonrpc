import React, { useEffect, useState } from 'react'

import { useJsonRpcClient, getJsonRpcClient, makeJsonRpcClient } from './useJsonRpcClient'
import { BidirectionalWebsocketRouter, Endpoint, Client } from '../JsonRpc'

export const useJsonRpcWebsocket = ({
    getClient = getJsonRpcWebsocket,
    ...params
}) => {
    return useJsonRpcClient({ getClient, ...params })
}

export const getJsonRpcWebsocket = async ({
    makeClient = makeJsonRpcWebsocket,
    ...params
}) => {
    return getJsonRpcClient({ makeClient, ...params })
}

export const makeJsonRpcWebsocket = async ({
    initRouter = server => new BidirectionalWebsocketRouter(server),
    syncFunction = (router, channel) => router.addWebSocketSync(channel),
    endpoint = (...params) => new Endpoint(...params),
    ClientClass = Client,
    ...params
}) => {
    return makeJsonRpcClient({
        initRouter,
        syncFunction,
        endpoint,
        ClientClass,
        ...params
    })
}
