import * as React from 'react'
import { cn } from '@/shared/lib/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 h-10': variant === 'default',
            'border border-gray-300 bg-transparent px-4 py-2 hover:bg-gray-100 h-10': variant === 'outline',
            'hover:bg-gray-100 px-4 py-2 h-10': variant === 'ghost',
            'bg-red-500 px-4 py-2 text-white hover:bg-red-600 h-10': variant === 'destructive',
            'h-8 px-3 text-xs': size === 'sm',
            'h-10 px-4 py-2 text-sm': size === 'default',
            'h-11 px-6 text-base': size === 'lg',
          },
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button }
