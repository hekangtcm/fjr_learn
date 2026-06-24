import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
        outline:
          'border-2 border-slate-200 bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
        ghost:
          'hover:bg-slate-100 active:bg-slate-200 text-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
        link:
          'text-primary-600 underline-offset-4 hover:underline dark:text-primary-400',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
