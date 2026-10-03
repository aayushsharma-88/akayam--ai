'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none text-[15px]', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          code(props) {
            const { children, className, node, ...rest } = props
            const match = /language-(\w+)/.exec(className || '')
            const isBlock = !!match
            
            const extractText = (node: any): string => {
              if (!node) return '';
              if (node.type === 'text') return node.value || '';
              if (node.children) return node.children.map(extractText).join('');
              return '';
            }
            const rawCode = node ? extractText(node).replace(/\n$/, '') : String(children).replace(/\n$/, '');

            return isBlock ? (
              <CodeBlock language={match?.[1] ?? ''} code={rawCode}>
                {children}
              </CodeBlock>
            ) : (
              <code className="bg-white/10 text-cyan-200 px-1.5 py-0.5 rounded-md text-[13px] font-mono" {...rest}>
                {children}
              </code>
            )
          },
          img: ({src, alt}) => src ? (
            <span className="relative group inline-block max-w-full">
              <img src={src} alt={alt || ''} className="rounded-lg max-w-full my-4 border border-white/10 block" />
              <a 
                href={src} 
                download={alt ? `${alt}.jpg` : 'image-download.jpg'} 
                target="_blank"
                rel="noreferrer"
                className="absolute top-6 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                title="Download image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </a>
            </span>
          ) : null,
          audio: ({src}) => src ? <audio src={src} controls className="w-full my-4" /> : null,
          p: ({children}) => <p className="mb-4 last:mb-0 text-white/90">{children}</p>,
          a: ({children, href}) => <a href={href} className="text-cyan-400 hover:underline">{children}</a>,
          ul: ({children}) => <ul className="list-disc pl-4 mb-4 text-white/90 space-y-1">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal pl-4 mb-4 text-white/90 space-y-1">{children}</ol>,
          h1: ({children}) => <h1 className="text-2xl font-semibold mb-4 mt-6 text-white">{children}</h1>,
          h2: ({children}) => <h2 className="text-xl font-semibold mb-3 mt-5 text-white">{children}</h2>,
          h3: ({children}) => <h3 className="text-lg font-medium mb-2 mt-4 text-white">{children}</h3>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function CodeBlock({ language, code, children }: { language: string; code: string; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  
  async function copyCode() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-white/10 bg-[#0C0F18]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#121620] border-b border-white/5">
        <span className="text-xs text-[#8B91A1] font-mono lowercase">{language || 'text'}</span>
        <button 
          onClick={copyCode} 
          className="text-[#8B91A1] hover:text-white transition-colors text-xs flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md"
        >
          {copied ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy code</>}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-[13px] font-mono text-white/80 leading-relaxed scrollbar-thin">
        <pre className="!mt-0 !mb-0 !bg-transparent">
          <code className={language ? `language-${language}` : ''}>{children || code}</code>
        </pre>
      </div>
    </div>
  )
}
