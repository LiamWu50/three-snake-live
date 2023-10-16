import { createBrowserRouter } from 'react-router-dom'

import Snake from '@/views/snake'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Snake />
  }
])
export default router
