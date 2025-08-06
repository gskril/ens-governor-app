import React from 'react'

type HtmlMetaProps = {
  title: string
  description: string
  image?: string
}

export function generateHtml({
  title,
  description,
  image,
  children,
}: React.PropsWithChildren<HtmlMetaProps>) {
  return `
  <head>
    <title>${title}</title>
    <meta name="description" content="${description}">
    ${image ? `<meta property="og:image" content="${image}">` : ''}
  </head>
  <body>
    ${children ? children : `<h1>${title}</h1><p>${description}</p>`}
  </body>
  `
}
