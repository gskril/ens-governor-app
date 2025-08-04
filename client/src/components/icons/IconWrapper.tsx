import { Badge } from '@/components/ui/badge'

export function IconWrapper({
  href,
  icon,
  text,
}: {
  href: string
  icon: React.ReactNode
  text?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block max-w-fit"
    >
      <Badge
        variant="outline"
        className="flex items-center gap-2 rounded-lg p-2 text-primary-brand hover:bg-primary-brand/5 md:p-2.5"
      >
        {icon}
        {text && <span className="text-sm font-medium">{text}</span>}
      </Badge>
    </a>
  )
}
