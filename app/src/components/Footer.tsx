const links = [
  { href: 'https://ens.domains', label: 'ENS' },
  { href: 'https://docs/ens.domains/dao', label: 'Governance Docs' },
  { href: 'https://x.com/ENS_DAO', label: 'Twitter' },
  { href: 'https://github.com/gskril/ens-governor-app', label: 'GitHub' },
]

export function Footer() {
  return (
    <footer className="flex justify-center gap-3 text-zinc-600">
      {links.map(({ href, label }, idx) => (
        <>
          <a
            key={href}
            href={href}
            target="_blank"
            className="font-medium hover:underline"
          >
            {label}
          </a>

          {idx < links.length - 1 && <span>/</span>}
        </>
      ))}
    </footer>
  )
}
