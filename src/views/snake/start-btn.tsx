import gsap from 'gsap'
import React, { useEffect, useRef, useState } from 'react'

import playBtnGreen from '@/assets/images/btn-play-bg-green.png'
import playBtnLilac from '@/assets/images/btn-play-bg-lilac.png'
import playBtnOrange from '@/assets/images/btn-play-bg-orange.png'

export type StartBtnProps = {
  palette: string
  onInitGame: () => void
}

const StartBtn: React.FC<StartBtnProps> = (props: StartBtnProps) => {
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const [playBtnStyle, setPlayBtnStyle] = useState(playBtnGreen)

  useEffect(() => {
    gsap.fromTo(
      btnRef.current,
      { autoAlpha: 0, scale: 0, yPercent: -50, xPercent: -50 },
      {
        duration: 0.8,
        autoAlpha: 1,
        scale: 1,
        yPercent: -50,
        xPercent: -50,
        delay: 0.3,
        ease: 'elastic.out(1.2, 0.7)'
      }
    )
  }, [])

  useEffect(() => {
    const btnImg =
      props.palette === 'lilac'
        ? playBtnLilac
        : props.palette === 'orange'
        ? playBtnOrange
        : playBtnGreen
    setPlayBtnStyle(btnImg)
  }, [props.palette])

  const handleInitGame = () => {
    props.onInitGame()
    gsap.to(btnRef.current, {
      duration: 1,
      scale: 0,
      ease: 'elastic.in(1.2, 0.7)',
      onComplete: () => {
        btnRef.current!.style.visibility = 'hidden'
      }
    })
  }

  return (
    <button
      style={{ opacity: 0 }}
      ref={btnRef}
      onClick={handleInitGame}
      className='fixed w-max drop-shadow-xl top-[75%] lg:top-[60%] left-1/2'
    >
      <img
        id='btn-play-img'
        className='h-[4rem] lg:h-[6rem]'
        src={playBtnStyle}
        alt=''
        height='20'
      />
      <span className='absolute' style={{ opacity: 0 }}>
        play
      </span>
    </button>
  )
}

export default StartBtn
