import React from 'react'
import ReactDOM from 'react-dom'

export default function Portal({ children }: { children: React.ReactNode }) {
  return ReactDOM.createPortal(
    <div id="modal-wrapper" className="relative z-[999999]">
      {children}
    </div>,
    document.querySelector('body')!
  )
}
