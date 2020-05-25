import { Client, EndpointBase } from '.'

export class Endpoint extends EndpointBase {

    #opts = undefined

    constructor({
        name = '',
        path = '/',
        reverseClientClass = Client,
        ...options
    } = {}) {
        console.log('JsonRpc/Endpoint::constructor', { name, path, options })

        super(name, path, {}, reverseClientClass)

        this.#opts = options
    }

    get opts() {
        return this.#opts
    }
}

export default Endpoint
