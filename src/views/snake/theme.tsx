import gsap from 'gsap'
import { useEffect, useRef } from 'react'

import greenImage from '@/assets/images/palette-green.png'
import lilacImage from '@/assets/images/palette-lilac.png'
import orangeImage from '@/assets/images/palette-orange.png'

export type ThemeProps = {
  onSelectTheme: (color: string) => void
}

const Theme: React.FC<ThemeProps> = (props: ThemeProps) => {
  const nodeRefs = useRef<HTMLLIElement[]>([])

  const state = [
    {
      color: 'green',
      image: greenImage
    },
    {
      color: 'orange',
      image: orangeImage
    },
    {
      color: 'lilac',
      image: lilacImage
    }
  ]

  useEffect(() => {
    gsap.to(nodeRefs.current, {
      duration: 1,
      x: 0,
      autoAlpha: 1,
      ease: 'elastic.out(1.2, 0.9)',
      stagger: {
        amount: 0.2
      }
    })
  }, [])

  const handleSelectTheme = (color: string) => () => {
    props.onSelectTheme(color)
  }

  return (
    <ul className='fixed z-50 flex gap-3 left-4 lg:flex-col lg:gap-4 bottom-4 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2'>
      {state.map((item, index) => (
        <li
          style={{ transform: 'translateX(-200px)' }}
          data-color={item.color}
          className='cursor-pointer'
          key={index}
          ref={(node) => (nodeRefs.current[index] = node as HTMLLIElement)}
          onClick={handleSelectTheme(item.color)}
        >
          <img
            className='transition-transform duration-150 ease-in-out border-2 border-white rounded-full aspect-square hover:scale-110 lg:border-4 w-9 lg:w-11'
            src={item.image}
            height='44'
            alt=''
          />
        </li>
      ))}
    </ul>
  )
}

export default Theme
