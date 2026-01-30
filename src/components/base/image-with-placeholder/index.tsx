import { Skeleton } from '@/components/ui/skeleton'
import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

type ImageWithPlaceholderProps = ImageProps
export default function ImageWithPlaceholder(props: ImageWithPlaceholderProps) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  return (
    <div className="relative min-h-80 h-full flex items-center">
      {props.src && (
        <Image
          {...props}
          onLoad={() => {
            setLoading(false)
          }}
          alt={props.alt || 'placeholder'}
          style={{ height: props.fill ? undefined : 'auto' }}
          onError={() => {
            setLoading(false)
            setError('Có lỗi xảy ra')
          }}
        />
      )}
      {(error || !props.src) && (
        <div className="inset-0 absolute z-20 grid bg-gray-100 place-content-center">
          <Image
            src={'/empty/book.png'}
            style={{ height: 'auto' }}
            height={58}
            width={58}
            alt="book-error"
          />
        </div>
      )}
      {loading && props.src && <Skeleton className="inset-0 absolute z-20" />}
    </div>
  )
}
