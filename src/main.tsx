import './styles/index.css'

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'

const rootElement = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(rootElement)

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
