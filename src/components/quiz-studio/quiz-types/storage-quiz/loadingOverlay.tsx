import { WandSparklesIcon } from 'lucide-react'
import Image from 'next/image'
import type React from 'react'

const LoadingOverlay = () => {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-200 z-50 flex items-center justify-center p-6">
        <div className="bg-white w-full h-full rounded-xl flex flex-col items-center justify-center p-4">
          <Image
            src="/book/generate-animation.gif"
            alt="logo"
            width={150}
            height={150}
          />
          <h3 className="text-2xl font-semibold text-blue-900 mb-1">
            Tài liệu của bạn đang chuẩn bị...
          </h3>
          <p className="text-sm text-blue-900 font-semibold mb-8">
            Vui lòng chờ trong giây lát
          </p>
          <div className="flex items-center text-sm font-normal text-gray-400 gap-2">
            <WandSparklesIcon className="w-4 h-4" />
            AI tips: Tài liệu nên...
          </div>
        </div>
      </div>
    </>
  )
}

export default LoadingOverlay
