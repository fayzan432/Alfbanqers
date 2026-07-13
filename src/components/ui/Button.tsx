import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-arcane-600 to-arcane-500 text-white hover:from-arcane-500 hover:to-arcane-400 shadow-[0_0_20px_rgba(139,92,246,0.35)]',
  secondary: 'bg-void-600 text-slate-100 border border-white/10 hover:bg-void-500',
  ghost: 'bg-transparent text-slate-200 hover:bg-white/5 border border-transparent',
  danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400',
  gold: 'bg-gradient-to-r from-gold-500 to-gold-400 text-void-950 font-semibold hover:brightness-110',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 gap-1.5 min-h-9',
  md: 'text-sm px-4 py-2.5 gap-2 min-h-11',
  lg: 'text-base px-6 py-3 gap-2 min-h-12',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-cyan-glow disabled:cursor-not-allowed disabled:opacity-50',
          'active:scale-[0.98]',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
