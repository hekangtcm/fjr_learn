import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        owned: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        reading: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        finished: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        wishlist: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
