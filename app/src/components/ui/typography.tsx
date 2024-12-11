import { cn } from '@/lib/utils'

type Elements = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'

type Props = {
  children: React.ReactNode
  as?: Elements
} & React.HTMLAttributes<HTMLSpanElement>

export function Typography({ children, className, as, ...props }: Props) {
  switch (as) {
    case 'h1':
      return (
        <h1
          className={cn(
            'scroll-m-20 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl',
            className
          )}
          {...props}
        >
          {children}
        </h1>
      )
    case 'h2':
      return (
        <h2
          className={cn(
            'scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0',
            className
          )}
          {...props}
        >
          {children}
        </h2>
      )
    case 'h3':
      return (
        <h3
          className={cn(
            'scroll-m-20 text-2xl font-semibold tracking-tight',
            className
          )}
          {...props}
        >
          {children}
        </h3>
      )
    case 'h4':
      return (
        <h4
          className={cn(
            'scroll-m-20 text-xl font-semibold tracking-tight',
            className
          )}
          {...props}
        >
          {children}
        </h4>
      )
    case 'h5':
      return (
        <h5
          className={cn(
            'scroll-m-20 text-lg font-semibold tracking-tight',
            className
          )}
          {...props}
        >
          {children}
        </h5>
      )
    case 'h6':
      return (
        <h6
          className={cn(
            'scroll-m-20 text-base font-medium tracking-tight',
            className
          )}
          {...props}
        >
          {children}
        </h6>
      )
    case 'p':
      return (
        <p
          className={cn('leading-7 [&:not(:last-child)]:mb-6', className)}
          {...props}
        >
          {children}
        </p>
      )
    default:
      return (
        <span className={className} {...props}>
          {children}
        </span>
      )
  }
}
