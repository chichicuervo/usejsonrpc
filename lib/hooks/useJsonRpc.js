import React, { useContext, createContext, useEffect, useState } from 'react'

export const clientMap = new Map

const ctx = createContext()

export const JsonRpcProvider = ({ children, ...params }) => {
    return (
        <ctx.Provider value={{ clientMap, ...params }}>
            {children}
        </ctx.Provider>
    )
}

export const useJsonRpc = () => {
    return useContext(ctx)
}
