'use client'

import { ProgressProvider as ProgressBar } from '@bprogress/next/app'

const Topbar = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressBar
      height="2px"
      color="#1E3A8A"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressBar>
  )
}

export default Topbar
