import SimplePeer from './Peer'

export class DataChannel extends EventTarget {

    #peer = undefined
    #opts = undefined

    constructor({ debug, ...opts } = {}) {
        debug && console.log('SimplePeer/DataChannel::constructor', opts)
        super()
        this.#opts = { debug, ...opts }
    }

    get debug() {
        const { debug } = this.#opts
        return debug
    }

    get peer() {
        const { onClose, onError, onData, onConnect, debug, ...opts } = this.#opts

        if (!this.#peer) {
            const peer = new SimplePeer({
                debug,
                onData: data => {
                    this.onData(data)
                    onData && onData(data)
                },
                onClose: () => {
                    this.onClose()
                    onClose && onClose(this)
                },
                onError: err => {
                    this.onError(err)
                    onError && onError(err)
                },
                onConnect: () => {
                    this.onConnect && this.onConnect()
                    onConnect && onConnect(this)
                },
                ...opts
            })

            this.#peer = peer
        }

        debug && console.log('SimplePeer/DataChannel::peer', this.#peer)

        return this.#peer
    }

    get channel() {
        return this.peer._channel || {}
    }

    get readyState() {
        return this.channel.readyState
    }

    get label() {
        // return this.peer.channelName || '/'
        // return this.channel.label || '/'
        return '/' // this is lame but it works
    }

    get negotiated() {
        return this.channel.negotiated
    }

    onData(data) {
        this.debug && console.log('SimplePeer/DataChannel::onData', data)
        data = data.toString()
        this.dispatchEvent(new MessageEvent('message', { data }))
    }

    onClose() {
        this.debug && console.log('SimplePeer/DataChannel::onClose')
        this.dispatchEvent(new CloseEvent('close'))
    }

    onError(err) {
        this.debug && console.log('SimplePeer/DataChannel::onError', err)
        this.dispatchEvent(new ErrorEvent('error', {
            error: err,
            message: err.message,
            filename: err.fileName,
            lineno: err.lineNumber,
            collno: err.columnNumber
        }))
    }

    close() {
        this.debug && console.log('SimplePeer/DataChannel::close')
        this.peer.destroy()
        this.#peer = undefined
    }

    send(data) {
        this.debug && console.log('SimplePeer/DataChannel::send', data)
        this.#peer.send(data)
    }
}

export default DataChannel
