import { useEffect, useRef, useState } from 'react'

import ThreeSceneManage from '@/helpers/three-scene-manage'
import ThreeSnakeManage from '@/helpers/three-snake-manage'

import StartBtn from './start-btn'
import Theme from './theme'

const paletteName = localStorage.getItem('paletteName') || 'green'

export default function Snake() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [paletteState, setPaletteState] = useState(paletteName)
  const threeSnakeManage = useRef<ThreeSnakeManage | null>(null)

  useEffect(() => {
    ThreeSceneManage.init(containerRef.current as HTMLDivElement)
    const { scene, camera, resolution } = ThreeSceneManage
    threeSnakeManage.current = new ThreeSnakeManage(scene, camera, resolution)
  }, [])

  const handleSelectTheme = (color: string) => {
    localStorage.setItem('paletteName', color)
    threeSnakeManage.current!.applyPalette(color)
    ThreeSceneManage.applyPalette(color)
    setPaletteState(color)
  }

  const handleInitGame = () => {
    threeSnakeManage.current?.initGame()
  }

  return (
    <>
      <div className='w-full h-full' ref={containerRef}></div>
      <Theme onSelectTheme={handleSelectTheme} />
      <StartBtn palette={paletteState} onInitGame={handleInitGame} />
    </>
  )
}
