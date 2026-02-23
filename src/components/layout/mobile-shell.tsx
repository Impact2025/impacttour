interface MobileShellProps {
  children: React.ReactNode
  className?: string
  withBottomNav?: boolean
}

export function MobileShell({ children, className = '', withBottomNav = true }: MobileShellProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex justify-center">
      <div
        className={`relative w-full max-w-md min-h-screen flex flex-col bg-white ${className}`}
        style={{ paddingBottom: withBottomNav ? 'calc(64px + env(safe-area-inset-bottom, 0px))' : undefined }}
      >
        {children}
      </div>
    </div>
  )
}
