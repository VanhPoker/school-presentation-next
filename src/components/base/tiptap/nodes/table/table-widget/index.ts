import { mergeAttributes, Node } from '@tiptap/core'

export interface TableWidgetOptions {
  /**
   * The HTML attributes for a table cell node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

/**
 * This extension allows you to create table cells.
 * @see https://www.tiptap.dev/api/nodes/table-cell
 */
export const TableWidget = Node.create<TableWidgetOptions>({
  name: 'tableWidget',
  group: 'block',
  addOptions() {
    return {
      HTMLAttributes: {
        class: 'absolute top-0 left-0 bg-rose-500',
        contenteditable: false
      }
    }
  },
  parseHTML() {
    return [{ tag: 'div' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0
    ]
  }
  // addNodeView() {
  //   return ReactNodeViewRenderer(CellComponent)
  // }
})
