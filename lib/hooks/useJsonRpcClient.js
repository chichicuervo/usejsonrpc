import React, { useEffect, useState } from 'react'

import JsonRpc from '../JsonRpc'

import { clientMap } from './useJsonRpc'

export const useJsonRpcClient = ({
    getClient = getJsonRpcClient,
    debug,
    ...params
}) => {
    debug && console.log('useJsonRpcClient', { debug })

    const [ client, setClient ] = useState({})

    useEffect(() => {
        setClient && getClient({ setClient, debug, ...params })
    }, [setClient])

    return client
}

export const getJsonRpcClient = async ({
    id,
    debug,
    setClient,
    makeClient,
    validateClient,
    onClose,
    ...params
}) => {
    try {
        debug && console.log('getJsonRpcClient', { id, debug })

        id = id instanceof Function ? (await id()) : id

        if (!id || !clientMap.has(id)) {
            if (!(makeClient instanceof Function)) throw new Error ("Invalid Client Function")
            clientMap.set(id, await makeClient({
                id,
                debug,
                onClose: () => {
                    clientMap.delete(id)
                    setClient && setClient(undefined)
                    onClose && onClose()
                },
                ...params
            }))
        }

        const client = clientMap.get(id)

        validateClient && (await validateClient(client)) // expects: throw Error

        setClient && setClient(client)

        return client

    } catch (err) {
        clientMap.delete(id)
        setClient && setClient(undefined)

        throw err
    }
}

export const makeJsonRpcClient = async ({
    debug,
    initRouter,
    syncFunction,
    dataChannel,
    endpoint,
    ClientClass,
    clientOverload,
    plugins = [
        new JsonRpc.Plugins.Server.AuthenticationSkip(),
        new JsonRpc.Plugins.Server.AuthorizeAll()
    ],
    ...params
}) => {
    debug && console.log('makeJsonRpcClient', { debug })

    const server = new JsonRpc.Server()

    plugins.forEach(plugin => server.addPlugin(plugin))

    if (!(initRouter instanceof Function)) throw new Error ("Invalid router function")
    if (!(syncFunction instanceof Function)) throw new Error ("Invalid router sync function")

    const router = (await initRouter(server))
    dataChannel = dataChannel instanceof Function ? (await dataChannel({ server, router })) : dataChannel
    const id = (await syncFunction(router, dataChannel))
    const client = router.connectionIDToSingletonClient(id, ClientClass)

    if (clientOverload instanceof Function) clientOverload({ id, client, server, router, dataChannel })
    else client._overload = clientOverload

    const out = { id, client, server, router, dataChannel }

    if (endpoint) server.registerEndpoint(endpoint instanceof Function ? (await endpoint(out)) : endpoint)

    return out
}
