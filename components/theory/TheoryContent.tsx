import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import type { Components } from 'react-markdown'

interface TheoryContentProps {
  content: string
}

function slugify(text: string): string {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\wㄱ-힣가-힣-]/g, '')
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>
    return extractText(el.props.children)
  }
  return ''
}

const components: Components = {
  h2({ node: _node, children, ...props }) {
    const id = slugify(extractText(children))
    return (
      <h2 id={id} {...props}>
        {children}
      </h2>
    )
  },
  h3({ node: _node, children, ...props }) {
    const id = slugify(extractText(children))
    return (
      <h3 id={id} {...props}>
        {children}
      </h3>
    )
  },
}

export default function TheoryContent({ content }: TheoryContentProps) {
  return (
    <div className="prose-sqld">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
