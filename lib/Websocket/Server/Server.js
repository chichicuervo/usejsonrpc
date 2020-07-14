import http from 'http'
import ws from 'ws'

import JsonRpc, { Server, BidirectionalWebsocketRouter } from '../../JsonRpc'
import WebsocketServerEndpoint from './Endpoint'

const registry = { }

export const setRegistry = ({ ...values }) => {
    Object.entries(values).forEach(([name, value]) => {
        registry[name] = value
    })
}

export const getRegistry = () => registry

export const websocketServer = ({
    app,
    debug = false,
    rpcPlugins = [
        new JsonRpc.Plugins.Server.AuthenticationSkip(),
        new JsonRpc.Plugins.Server.AuthorizeAll()
    ],
    websocketParams = {},
    endpoints = [{
        Classname: WebsocketServerEndpoint,
        ...params
    }],
    onConnection,
    ...params
}) => {
    const server = http.createServer(app)
    const wss = new ws.Server({ /* * / clientTracking: false, /* */ noServer: true, ...websocketParams })
    const rpc = new Server()

    endpoints = Array.isArray(endpoints) && endpoints || [ endpoints ]

    endpoints.forEach(endpoint => {
        debug && console.log('websocketServer::endpoint', { endpoint })

        if (endpoint instanceof Function) {
            endpoint({ debug, server: rpc })

        } else if (typeof endpoint === 'object' && endpoint.Classname) {
            const { Classname, ...params } = endpoint
            rpc.registerEndpoint(new Classname({ debug, ...params }))

        } else if (endpoint instanceof Object) {
            rpc.registerEndpoint(endpoint)
        }
    })

    rpcPlugins.forEach(plugin => rpc.addPlugin(plugin))

    const router = new BidirectionalWebsocketRouter(rpc)

    server.on('upgrade', (request, socket, head) => {
        debug && console.log('Server:on/upgrade')

        wss.handleUpgrade(request, socket, head, ws => {
            debug && console.log('Websocket:handleUpgrade')

            wss.emit('connection', ws, request)
        })
    })

    wss.on('connection', (ws, request) => {
        debug && console.log('Websocket:on/connection')

        ws.isAlive = true
        ws.on('pong', () => ws.isAlive = true)

        const connectionId = router.addWebSocketSync(ws, request)

        setRegistry({ connectionId, sessions: router._objSessions })

        onConnection && onConnection({ connectionId, router, server: rpc, websocket: ws, request })

        debug && console.log('connection id', connectionId)
        debug && console.log('endpoints', rpc.endpoints)
        debug && console.log('connections', Object.keys(router._objSessions))
    })

    const interval = setInterval(() => {
        wss.clients.forEach(ws => {
            if (ws.isAlive === false) return ws.terminate()

            ws.isAlive = false
            ws.ping(() => {})
        })
    }, 3000)

    wss.on('close', () => {
        clearInterval(interval)
    })

    setRegistry({
        server: rpc,
        router,
        websocket: wss
    })

    return server
}
