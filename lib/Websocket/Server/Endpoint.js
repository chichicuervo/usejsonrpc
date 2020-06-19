import { Client, Endpoint } from '../../JsonRpc'

export class WebsocketServerEndpoint extends Endpoint {

    constructor({
        name = 'Signal Server',
        path = '/signal',
        debug = false,
        ...options
    } = {}) {
        debug && console.log('WebsocketServerEndpoint::constructor', { name, path, debug })

        super({ name, path, debug, ...options })
    }

    async ping(request) {
        this.debug && console.log('ServerEndpoint::ping')

        await request.reverseCallsClient.rpc('pong', [], true)
    }

    async connectionId(request) {
        this.debug && console.log('WebsocketServerEndpoint::connectionId')

        const { _nConnectionID: connectionId } = request || {}

        return connectionId
    }

    async remoteId(request) {
        this.debug && console.log('WebsocketServerEndpoint::remoteId')

        return await request.reverseCallsClient.rpc('connectionId', [])
    }

    async randomId(request) {
        this.debug && console.log('WebsocketServerEndpoint::randomId')

        const { _nConnectionID: connectionId, _router: router } = request || {}
        const { _objSessions: session } = router || {}

        const keys = Object.keys(session).filter(k => connectionId !== Number(k))

        const key = keys[Math.floor(Math.random() * keys.length)]

        return key && Number(key)
    }

    async signal(request, { from, to, ...params } = {}) {
        this.debug && console.log('ServerEndpoint::signal', { from, to, ...params })

        const { _nConnectionID: connectionId, _router: router } = request || {}
        const { _objSessions: session } = router || {}

        from = from || connectionId

        if (from !== connectionId) throw new Error('Invalid Sender Id')
        if (!to) throw new Error("Invalid Destination Id")

        if (!session[to]) throw new Error ('Recipient Not Found')

        let { clientReverseCalls: forward } = session[to] || {}

        forward = forward || router._makeReverseCallsClient(Client, session[to])

        if (!forward) throw new Error ('Recipient Client Error')

        return await forward.rpc('signal', [{ from, to, ...params }])
    }
}

export default WebsocketServerEndpoint
