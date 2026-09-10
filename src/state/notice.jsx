import { createContext, useContext } from 'react'

/** Shared toast bus — see NoticeProvider for the UI that renders it. */
export const NoticeContext = createContext(() => {})

export const useNotice = () => useContext(NoticeContext)
