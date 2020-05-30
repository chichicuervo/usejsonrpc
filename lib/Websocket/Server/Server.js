import http from 'http'
import ws from 'ws'

import JsonRpc, { Server, BidirectionalWebsocketRouter } from '../../JsonRpc'
import WebsocketServerEndpoint from './Endpoint'

export const websocketServer = ({
    app,
    debug = false,
    rpcPlugins = [
        new JsonRpc.Plugins.Server.AuthenticationSkip(),
        new JsonRpc.Plugins.Server.AuthorizeAll()
    ],
    websocketParams = {},
    endpointParams = {},
    ...params
}) => {
    const server = http.createServer(app)
    const wss = new ws.Server({ /* * / clientTracking: false, /* */ noServer: true, ...websocketParams })
    const rpc = new Server()

    rpc.registerEndpoint(new WebsocketServerEndpoint({ debug, ...endpointParams }))

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

        const connId = router.addWebSocketSync(ws, request)

        debug && console.log('connection id', connId)
        debug && console.log('endpoints', rpc.endpoints)
        debug && console.log('connections', Object.keys(router._objSessions))
    })

    return server
}
