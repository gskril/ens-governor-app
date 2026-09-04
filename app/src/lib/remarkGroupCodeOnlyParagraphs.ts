import type { InlineCode, Paragraph, Root, RootContent } from 'mdast'

type CodeOnlyParagraph = Paragraph & { children: [InlineCode] }

function isCodeOnlyParagraph(node: RootContent): node is CodeOnlyParagraph {
  return (
    node.type === 'paragraph' &&
    node.children.length === 1 &&
    node.children[0].type === 'inlineCode'
  )
}

export function remarkGroupCodeOnlyParagraphs() {
  return (tree: Root) => {
    const groupedChildren: RootContent[] = []

    for (let index = 0; index < tree.children.length; index += 1) {
      const child = tree.children[index]

      if (!isCodeOnlyParagraph(child)) {
        groupedChildren.push(child)
        continue
      }

      const values = [child.children[0].value]

      while (index + 1 < tree.children.length) {
        const nextChild = tree.children[index + 1]

        if (!isCodeOnlyParagraph(nextChild)) break

        index += 1
        values.push(nextChild.children[0].value)
      }

      groupedChildren.push({
        type: 'code',
        value: values.join('\n\n'),
      })
    }

    tree.children = groupedChildren
  }
}
