import { Client } from '../JsonRpc'

export class WebsocketClient extends Client {

    async ping() {
        this.debug && console.log('WebsocketClient::ping')

        this.rpc('ping', [], true)
    }

    async remoteId() {
        this.debug && console.log('WebsocketClient::remoteId')

        return await this.rpc('remoteId', [])
    }

    async connectionId() {
        this.debug && console.log('WebsocketClient::connectionId')

        return await this.rpc('connectionId', [])
    }

    async randomId() {
        this.debug && console.log('WebsocketClient::randomId')

        return await this.rpc('randomId', [])
    }

    async signal({ to, data } = {}) {
        this.debug && console.log('WebsocketClient::signal', { to, data })

        // to = to || ( await this.randomId() )

        if (!to) throw new Error("No Destination Available")

        const from = await this.connectionId()

        return await this.rpc("signal", [{ from, to, data }])
    }
}
