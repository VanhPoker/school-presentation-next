import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

const CircleWaveAnimation = ({ className }: Props) => {
  const commonClass =
    'absolute w-full h-full border-blue-500 -translate-x-2/4 -translate-y-2/4 opacity-0 rounded-[50%] border-2 border-solid scale-50 left-2/4 top-2/4 animate-circle-wave'

  return (
    <div className={cn('relative', className)}>
      <span className={cn(commonClass)} style={{ animationDelay: '0s' }} />
      <span className={cn(commonClass)} style={{ animationDelay: '0.5s' }} />
      <span className={cn(commonClass)} style={{ animationDelay: '1s' }} />
    </div>
  )
}

export default CircleWaveAnimation
