export default function RenderTiptapContent({ content }: { content: string }) {
  // If content is just a string without HTML tags properly, we might just display it.
  // But usually Tiptap produces HTML.
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
