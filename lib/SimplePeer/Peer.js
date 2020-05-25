import Peer from 'simple-peer'

export class SimplePeer extends Peer {

    #opts = undefined
    #peer_id = undefined

    constructor({ debug, ...opts } = {}) {
        debug && console.log('SimplePeer::constructor', opts)

        super(opts)

        this.#opts = { debug, ...opts }

        const { id, onError, onClose, onData, onConnect } = this.#opts

        if (id) {
            this._id = id instanceof Function ? id() : id
            this._debug(`peer renamed to ${this._id}`)
        }

        this.on('connect', () => {
            debug && console.log('SimplePeer::on/connect')
            return onConnect ? onConnect(this) : this.onConnect ? this.onConnect() : undefined
        })

        this.on('close', () => {
            debug && console.log('SimplePeer::on/close')
            return onClose ? onClose(this) : this.onClose ? this.onClose() : undefined
        })

        this.on('error', err => {
            debug && console.log('SimplePeer::on/error', err)
            return onError ? onError(err, this) : this.onError ? this.onError(err) : undefined
        })

        this.on('data', data => {
            debug && console.log('SimplePeer::on/data', data)
            return onData ? onData(data, this) : this.onData ? this.onData(data) : undefined
        })

        this.on('signal', data => this.onSignal(data))
    }

    get debug() {
        const { debug } = this.#opts
        return debug
    }

    get id() {
        return this._id
    }

    get remoteId() {
        return this.#peer_id
    }

    // send to peer
    onSignal(data) {
        this.debug && console.log('SimplePeer::on/signal', data)

        const { onSignal } = this.#opts

        // onSignal && onSignal({ from: this.id, to: this.remoteId, data })
        onSignal && onSignal({ data })
    }

    // recv from peer
    signal(data) {
        this.debug && console.log('SimplePeer::signal', data)

        const { from, to, data: signal } = data || {}

        // if (to && this.id && to !== this.id) {
        //     throw new Error ("Peer Id does not match")
        // }

        const remoteId = this.remoteId

        // if (from && remoteId && from !== remoteId) {
        //     throw new Error ("Invalid Peer Id")
        // }

        if (!remoteId && from) this.#peer_id = from

        super.signal(signal)

        return this
    }
}

export default SimplePeer
