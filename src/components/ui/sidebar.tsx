import React, { useState, createContext, useContext } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Sidebar com rail que expande no hover (estrutura Aceternity),
 * adaptada para Vite/React:
 *  - sem `next/link`: o SidebarLink aceita `onClick` (navegação por estado)
 *    ou `href` (link externo/âncora);
 *  - sem cores fixas: quem consome define o visual via `className`,
 *    para a identidade da marca poder ser aplicada.
 */

export interface Links {
  label: string
  icon: React.JSX.Element | React.ReactNode
  href?: string
  onClick?: () => void
}

interface SidebarContextProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  animate: boolean
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode
  open?: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  animate?: boolean
}) => {
  const [openState, setOpenState] = useState(false)

  const open = openProp !== undefined ? openProp : openState
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode
  open?: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  animate?: boolean
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  )
}

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<'div'>)} />
    </>
  )
}

type DesktopSidebarProps = React.ComponentProps<typeof motion.div> & {
  /** largura expandida (px) */
  widthOpen?: number
  /** largura do rail recolhido (px) */
  widthClosed?: number
}

export const DesktopSidebar = ({
  className,
  children,
  widthOpen = 300,
  widthClosed = 60,
  ...props
}: DesktopSidebarProps) => {
  const { open, setOpen, animate } = useSidebar()
  const width = animate ? (open ? widthOpen : widthClosed) : widthOpen
  return (
    <motion.div
      className={cn('h-full flex-shrink-0 flex-col px-4 py-4', className)}
      // `initial={false}` evita o flash na montagem: renderiza já na
      // largura correta em vez de medir o conteúdo e animar a partir dali.
      initial={false}
      animate={{ width: `${width}px` }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) => {
  const { open, setOpen } = useSidebar()
  return (
    <>
      <div className={cn('flex h-10 w-full flex-row items-center justify-between px-4 py-4')} {...props}>
        <div className="z-20 flex w-full justify-end">
          <Menu className="cursor-pointer text-ink-sub" onClick={() => setOpen(!open)} />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={cn('fixed inset-0 z-[100] flex h-full w-full flex-col justify-between bg-base p-10', className)}
            >
              <div
                className="absolute right-10 top-10 z-50 cursor-pointer text-ink-sub"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links
  className?: string
} & Omit<React.ComponentProps<'button'>, 'onClick'>) => {
  const { open, animate } = useSidebar()

  const inner = (
    <>
      {link.icon}
      <motion.span
        initial={false}
        animate={{
          display: animate ? (open ? 'inline-block' : 'none') : 'inline-block',
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="!m-0 inline-block whitespace-pre !p-0 text-sm transition duration-150 group-hover/sidebar:translate-x-1"
      >
        {link.label}
      </motion.span>
    </>
  )

  const base = 'flex items-center justify-start gap-2 group/sidebar py-2'

  if (link.href) {
    return (
      <a href={link.href} className={cn(base, className)}>
        {inner}
      </a>
    )
  }

  return (
    <button type="button" onClick={link.onClick} className={cn(base, className)} {...props}>
      {inner}
    </button>
  )
}
