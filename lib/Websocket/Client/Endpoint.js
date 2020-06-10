import { Endpoint } from '../../JsonRpc'

export class WebsocketClientEndpoint extends Endpoint {

    #client = undefined

    constructor({
        name = 'Signal Server',
        path = '/signal',
        client,
        debug = false,
        ...options
    } = {}) {
        debug && console.log('WebsocketClientEndpoint::constructor', { name, path, debug, client })

        super({ name, path, debug, ...options })

        this.#client = client
    }

    async pong(request) {
        this.debug && console.log('WebsocketClientEndpoint::pong')
    }

    async connectionId(request) {
        this.debug && console.log('WebsocketClientEndpoint::connectionId')

        const { _nConnectionID: connectionId } = request || {}

        return connectionId
    }

    async remoteId(request) {
        this.debug && console.log('WebsocketClientEndpoint::remoteId')

        return await request.reverseCallsClient.rpc('connectionId', [])
    }

    async signal(request, { from, to, ...params } = {}) {
        this.debug && console.log('WebsocketClientEndpoint::signal', { from, to, ...params })

        if (!from) throw new Error('Missing Signal Sender')

        let { getPeer } = this.opts || { }

        getPeer = getPeer || this.getPeer

        if (!getPeer || !(getPeer instanceof Function)) throw new Error('Peer Not Available')

        const peer = await getPeer(this.#client, { from, to, ...params })

        if (!peer) throw new Error('Peer Not Found')

        return peer.signal({ from, to, ...params })
    }
}

export default WebsocketClientEndpoint
