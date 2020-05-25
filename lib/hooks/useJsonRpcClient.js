import React, { useEffect, useState } from 'react'

const clientMap = new Map

export const useJsonRpcClient = ({
    getClient: getJsonRpcClient,
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
    id = id instanceof Function ? id() : id

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
    plugins = [],
    ...options
}) => {
    const server = new JsonRpc.Server()

    (plugins || [
        new JsonRpc.Plugins.Server.AuthenticationSkip(),
        new JsonRpc.Plugins.Server.AuthorizeAll()
    ]).forEach(plugin => server.addPlugin(plugin))

    if (!(initRouter instanceof Function)) throw new Error ("Invalid router function")
    if (!(syncFunction instanceof Function)) throw new Error ("Invalid router sync function")

    const router = initRouter(server)
    const id = syncFunction(router, dataChannel instanceof Function ? dataChannel({ server, router }) : dataChannel)
    const client = router.connectionIDToSingletonClient(id, ClientClass)

    if (endpoint) server.registerEndpoint(endpoint instanceof Function ? endpoint({ id, client, server, router }) : endpoint)

    return { id, client, server, router }
}
