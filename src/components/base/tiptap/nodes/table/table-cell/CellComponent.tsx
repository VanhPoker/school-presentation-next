import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react'

const CellComponent = ({}: NodeViewProps) => {
  return (
    <NodeViewWrapper style={{ position: 'relative', display: 'flex' }}>
      <NodeViewContent as="td" />
    </NodeViewWrapper>
  )
}
export default CellComponent
