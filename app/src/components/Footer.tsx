const links = [
  { href: 'https://ens.domains', label: 'ENS' },
  { href: 'https://docs/ens.domains/dao', label: 'Documentation' },
  { href: 'https://x.com/ensdomains', label: 'Twitter' },
]

export function Footer() {
  return (
    <footer className="flex justify-center gap-3">
      {links.map(({ href, label }, idx) => (
        <>
          <a
            href={href}
            target="_blank"
            className="font-medium hover:underline"
          >
            {label}
          </a>

          {idx < links.length - 1 && <span className="text-zinc-500">/</span>}
        </>
      ))}
    </footer>
  )
}
