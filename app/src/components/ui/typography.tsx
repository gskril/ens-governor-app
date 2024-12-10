import { cn } from '@/lib/utils'

type TypographyType = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'

type Props = {
  children: React.ReactNode
  as?: TypographyType
} & React.HTMLAttributes<HTMLDivElement>

export function Typography({ children, className, as = 'p', ...props }: Props) {
  switch (as) {
    case 'h1':
      return (
        <h1
          className={cn(
            'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
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
            'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
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
    default:
      return (
        <p
          className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}
          {...props}
        >
          {children}
        </p>
      )
  }
}
