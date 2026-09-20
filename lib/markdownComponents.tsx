import React from 'react'
import MermaidDiagram from '@/components/quiz/MermaidDiagram'

type CodeProps = React.ClassAttributes<HTMLElement> & React.HTMLAttributes<HTMLElement> & { node?: unknown }
type PreProps = React.ClassAttributes<HTMLPreElement> & React.HTMLAttributes<HTMLPreElement> & { node?: unknown }

type CodeComponent = (props: CodeProps) => React.ReactElement
type PreComponent = (props: PreProps) => React.ReactElement

function isMermaidClassName(className?: string): boolean {
  return !!className && className.includes('language-mermaid')
}

/**
 * Wraps a fallback `code` renderer so that ```mermaid fenced blocks render as
 * an interactive diagram instead of a highlighted code block.
 */
export function createMermaidAwareCode(fallback?: CodeComponent): CodeComponent {
  function MermaidAwareCode(props: CodeProps) {
    const { className, children } = props
    if (isMermaidClassName(className)) {
      const chart = String(children).replace(/\n$/, '')
      return <MermaidDiagram chart={chart} />
    }
    if (fallback) return fallback(props)
    return <code className={className}>{children}</code>
  }
  return MermaidAwareCode
}

/**
 * Wraps a fallback `pre` renderer so a mermaid diagram (produced by the code
 * renderer above) isn't nested inside an extra <pre> box.
 */
export function createMermaidAwarePre(fallback?: PreComponent): PreComponent {
  function MermaidAwarePre(props: PreProps) {
    const { children } = props
    const child = Array.isArray(children) ? children[0] : children
    const className = React.isValidElement(child)
      ? (child.props as { className?: string })?.className
      : undefined

    if (isMermaidClassName(className)) {
      return <>{children}</>
    }
    if (fallback) return fallback(props)
    return <pre>{children}</pre>
  }
  return MermaidAwarePre
}
