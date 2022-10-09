import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App';
import { CssBaseline } from '@mui/material'

import ThemeWrapper from  './components/Theme';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeWrapper>
      <App />
    </ThemeWrapper>
  </React.StrictMode>
)
