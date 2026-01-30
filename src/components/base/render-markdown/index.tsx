import 'katex/dist/katex.min.css'
import RemarkMath from 'remark-math'
import RehypeKatex from 'rehype-katex'
import RemarkBreaks from 'remark-breaks'
import RehypeRaw from 'rehype-raw'
import RemarkGfm from 'remark-gfm'
import Markdown from 'react-markdown'
import Link from 'next/link'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
const CustomLink = ({ node }: any) => {
  return (
    <Link
      className="text-green-400 underline"
      href={node?.properties?.href ? node.properties.href : '/'}
    >
      {node?.properties?.href && node.children[0]
        ? node.children[0]?.value
        : 'Đường dẫn lỗi'}
    </Link>
  )
}
const CustomCode = (props: any) => {
  const { children, className, node, ...rest } = props
  const match = /language-(\w+)/.exec(className || '')
  return match ? (
    <SyntaxHighlighter {...rest} PreTag="div" language={match[1]}>
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code {...rest} className={className}>
      {children}
    </code>
  )
}
const CustomImage = ({ node }: any) => {
  return (
    <img
      className="text-green-400 underline w-1/2 mx-auto object-contain"
      src={node?.properties?.src ? node.properties.src : '/'}
      alt=""
    />
  )
}
export default function RenderMarkdown({
  children,
  disallowedElements = []
}: {
  children: string
  disallowedElements?: string[]
}) {
  return (
    <Markdown
      remarkPlugins={[RemarkGfm, RemarkMath, RemarkBreaks]}
      rehypePlugins={[
        RehypeKatex,
        RehypeRaw as any,
        () => {
          return (tree) => {
            const iterate = (node: any) => {
              if (
                node.type === 'element' &&
                !node.properties?.src &&
                node.properties?.ref &&
                node.properties.ref.startsWith('{') &&
                node.properties.ref.endsWith('}')
              )
                delete node.properties.ref

              if (node.children) node.children.forEach(iterate)
            }
            tree.children.forEach(iterate)
          }
        }
      ]}
      components={{
        a: CustomLink,
        img: CustomImage,
        code: CustomCode
      }}
      disallowedElements={[
        'script',
        'iframe',
        'head',
        'html',
        'meta',
        'link',
        'body',
        ...disallowedElements
      ]}
    >
      {children}
    </Markdown>
  )
}
