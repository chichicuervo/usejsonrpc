import React, { useEffect, useState } from 'react'

import JsonRpc from '../JsonRpc'

const clientMap = new Map

export const useJsonRpcClient = ({
    getClient = getJsonRpcClient,
    ...params
}) => {
    const [ client, setClient ] = useState({})

    useEffect(() => {
        setClient && getClient({ setClient, ...params })
    }, [setClient])

    return client
}

export const getJsonRpcClient = async ({
    id,
    makeClient,
    ...params
}) => {
    id = id instanceof Function ? (await id()) : id

    if (!id || !clientMap.has(id)) {
        if (!(makeClient instanceof Function)) throw new Error ("Invalid Client Function")
        clientMap.set(id, await makeClient({ id, ...params }))
    }

    return clientMap.get(id)
}

export const makeJsonRpcClient = async ({
    initRouter,
    syncFunction,
    dataChannel,
    endpoint,
    ClientClass,
    plugins = [
        new JsonRpc.Plugins.Server.AuthenticationSkip(),
        new JsonRpc.Plugins.Server.AuthorizeAll()
    ],
    setClient,
    ...params
}) => {
    const server = new JsonRpc.Server()

    plugins.forEach(plugin => server.addPlugin(plugin))

    if (!(initRouter instanceof Function)) throw new Error ("Invalid router function")
    if (!(syncFunction instanceof Function)) throw new Error ("Invalid router sync function")

    const router = (await initRouter(server))
    dataChannel = dataChannel instanceof Function ? (await dataChannel({ server, router })) : dataChannel
    const id = (await syncFunction(router, dataChannel))
    const client = router.connectionIDToSingletonClient(id, ClientClass)

    const out = { id, client, server, router, dataChannel }

    if (endpoint) server.registerEndpoint(endpoint instanceof Function ? (await endpoint(out)) : endpoint)

    setClient && setClient(out)

    return out
}
