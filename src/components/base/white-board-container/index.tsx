'use client'
import dynamic from 'next/dynamic'
const Whiteboard = dynamic(() => import('./Whiteboard'), {
  loading: () => (
    <div className="w-screen h-screen grid place-content-center">
      <Loading />
    </div>
  ),
  ssr: false
})
import Loading from '../loading'
export default function WhiteboardContainer() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-200">
      <Whiteboard />
    </div>
  )
}
