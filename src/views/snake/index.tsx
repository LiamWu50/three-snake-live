import { useEffect, useRef } from 'react'

import ThreeSceneManage from '@/helpers/three-scene-manage'
import ThreeSnakeManage from '@/helpers/three-snake-manage'

export default function Snake() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const threeSnakeManage = useRef<ThreeSnakeManage | null>(null)

  useEffect(() => {
    ThreeSceneManage.init(containerRef.current as HTMLDivElement)
    // const { scene, resolution } = ThreeSceneManage
    // threeSnakeManage.current = new ThreeSnakeManage(scene, resolution)
  }, [])

  return <div className='w-full h-full' ref={containerRef}></div>
}
