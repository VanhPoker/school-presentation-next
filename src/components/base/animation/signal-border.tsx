import { PropsWithChildren } from 'react'

type SignalBorderProps = {
  color: string
}
export default function SignalBorder({
  color,
  children
}: PropsWithChildren<SignalBorderProps>) {
  return (
    <span className="relative p-1 inline-flex items-center justify-center">
      <span
        className="absolute inset-0 animate-signal-border -z-1 border rounded-full"
        style={{ borderColor: color }}
      />
      {children}
    </span>
  )
}
