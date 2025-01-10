import { cn } from '@/lib/utils'

export function XIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-5 w-5', className)}
      {...props}
    >
      <path
        d="M14.0923 10.3152L22.2824 1H20.3415L13.2304 9.08867L7.54988 1H1L9.58923 13.2311L1 23H2.94098L10.4501 14.4585L16.4492 23H23L14.0923 10.3152ZM11.4347 13.3393L10.5635 12.121L3.64169 2.43H6.62248L12.2094 10.251L13.0806 11.4692L20.3433 21.6351H17.3625L11.4347 13.3393Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function DiscourseIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-5 w-5', className)}
      {...props}
    >
      <path
        d="M19.2214 10.7283C19.1359 5.89333 15.1898 2 10.3342 2C5.42476 2 1.44531 5.97944 1.44531 10.8889C1.44531 13.2056 2.33142 15.3156 3.78365 16.8972L3.11753 20.9028L7.07031 19.2056C8.81179 19.7844 10.4553 19.9293 12.0009 19.64"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.2028 20.8497C19.1978 21.5985 17.9773 22.0019 16.724 21.9997C13.5023 21.9997 10.8906 19.388 10.8906 16.1663C10.8906 12.9447 13.5023 10.333 16.724 10.333C19.9456 10.333 22.5573 12.9447 22.5573 16.1663C22.5573 17.0552 22.3584 17.8975 22.0028 18.6513"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.0012 18.6514L22.5556 21.9997L20.2012 20.8497"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
