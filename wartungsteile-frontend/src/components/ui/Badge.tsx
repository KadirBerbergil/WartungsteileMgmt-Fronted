import { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-blue-100 text-blue-800 focus:ring-blue-500',
        success: 'bg-green-100 text-green-800 focus:ring-green-500',
        warning: 'bg-yellow-100 text-yellow-800 focus:ring-yellow-500',
        danger: 'bg-red-100 text-red-800 focus:ring-red-500',
        destructive: 'bg-red-100 text-red-800 focus:ring-red-500',
        secondary: 'bg-gray-100 text-gray-800 focus:ring-gray-500',
        outline: 'border border-gray-300 bg-transparent text-gray-700'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }