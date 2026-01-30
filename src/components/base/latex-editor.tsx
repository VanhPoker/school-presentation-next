export default function LatexEditor({ content }: { content: string }) {
  // Simplified renderer
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
