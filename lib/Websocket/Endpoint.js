import { Endpoint } from '../JsonRpc'

export class WebsocketClientEndpoint extends Endpoint {

    #client = undefined

    constructor({
        name = 'Signal Server',
        path = '/signal',
        client,
        debug = true,
        ...options
    } = {}) {
        debug && console.log('WebsocketClientEndpoint::constructor', { client, name, path })

        super({ name, path, debug, ...options })

        this.#client = client
    }

    async pong(request) {
        console.log('WebsocketClientEndpoint::pong')
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

    async signal(request, { from, to, data } = {}) {
        this.debug && console.log('WebsocketClientEndpoint::signal', { from, to, data })

        if (!from) throw new Error('Missing Signal Sender')

        let { getPeer } = this.opts || { }

        getPeer = getPeer || this.getPeer

        if (!getPeer || !(getPeer instanceof Function)) throw new Error('Peer Not Available')

        const peer = await getPeer(this.#client, { from, to, data })

        if (!peer) throw new Error('Peer Not Found')

        return peer.signal({ from, to, data })
    }
}

export default WebsocketClientEndpoint

// const { id, client, dataChannel } = await getJsonRpcSimplePeer({
//     id: from,
//     ClientClass: WebRtcClient,
//     endpoint: (...params) => new WebRtcClientEndpoint(...params),
//     peerParams: {
//         onSignal: data => this.#client.signal(data)
//     }
// })
//
// const { peer } = dataChannel || {}