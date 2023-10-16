import { createHashRouter } from 'react-router-dom'

import Snake from '@/views/snake'

const router = createHashRouter([
  {
    path: '/',
    element: <Snake />
  }
])
export default router
