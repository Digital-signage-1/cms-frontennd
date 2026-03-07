// Polyfills for Smart TV browsers (Chrome 38+)
import 'core-js/stable'
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
