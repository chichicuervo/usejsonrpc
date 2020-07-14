import { Client, EndpointBase } from '.'

const DEBUG = true

export class Endpoint extends EndpointBase {

    #opts = undefined
    debug = undefined

    constructor({
        name = '',
        path = '/',
        reverseClientClass = Client,
        debug = DEBUG,
        ...options
    } = {}) {
        debug && console.log('JsonRpc/Endpoint::constructor', { name, path, debug, options })

        super(name, path, {}, reverseClientClass)

        this.debug = debug

        this.#opts = { name, path, ...options }
    }

    get opts() {
        return this.#opts
    }
}

export default Endpoint
