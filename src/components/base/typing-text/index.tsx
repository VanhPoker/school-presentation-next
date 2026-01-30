import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'
type TypingTextProps = {
  content: string
}
export default function TypingText({ content }: TypingTextProps) {
  const textIndex = useMotionValue(0)
  const baseText = useTransform(textIndex, () => content)
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const displayText = useTransform(rounded, (latest) => {
    return baseText.get().slice(0, latest)
  })
  const updatedThisRound = useMotionValue(true)

  useEffect(() => {
    animate(count, 120, {
      type: 'tween',
      duration: 1,
      ease: 'easeIn',
      repeat: 0,
      delay: 1,
      //   repeatType: 'reverse',
      //   repeatDelay: 1,
      onUpdate(latest) {
        if (updatedThisRound.get() === true && latest > 0) {
          updatedThisRound.set(false)
        } else if (updatedThisRound.get() === false && latest === 0) {
          if (textIndex.get() === content.length - 1) {
            textIndex.set(0)
          } else {
            textIndex.set(textIndex.get() + 1)
          }
          updatedThisRound.set(true)
        }
      }
    })
  }, [])

  return <motion.span className="inline">{displayText}</motion.span>
}
