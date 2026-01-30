import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { DEFAULT_COLOR_BG } from '@/constants'
import { cn } from '@/lib/utils'
import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import {
  Ban,
  Copy,
  EllipsisVertical,
  Palette,
  Table,
  Trash
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'

const TableComponent = ({
  deleteNode,
  getPos,
  updateAttributes,
  node,
  editor,
  extension
}: NodeViewProps) => {
  const pathName = usePathname()
  const [isPreview] = useState(
    !editor.isEditable ||
      pathName.endsWith('/read') ||
      pathName.includes('/admin-view-content-lesson')
      ? true
      : false
  )
  const [nodeData, columns, columnsWidth] = useMemo(() => {
    const nodeStartPos = getPos()
    const nodeResolve = editor.state.doc.nodeAt(nodeStartPos)
    if (!nodeResolve) return [nodeResolve, 0, []]
    let countCells = 0
    let countRows = 0
    const columnsWidth: (number | null)[] = []
    nodeResolve.descendants((node) => {
      if (node.type.name === 'tableRow') {
        countRows += 1
      }
      if (node.type.name === 'tableCell') {
        countCells += 1
        if (!node.attrs.colwidth) {
          columnsWidth.push(null)
        } else if (
          Array.isArray(node.attrs?.colwidth) &&
          node.attrs?.colwidth[0]
        ) {
          columnsWidth.push(node.attrs.colwidth[0] || null)
        }
      }
    })
    if (countRows === 0) return [nodeResolve, 0, []]
    const countCols = countCells / countRows
    return [nodeResolve, countCols, columnsWidth]
  }, [editor.state])

  return (
    <NodeViewWrapper
      style={{
        position: 'relative',
        display: 'flex',
        gap: 4,
        // marginBottom: 24,
        zIndex: 10
      }}
    >
      <div className="overflow-x-auto custom-scrollbar w-full py-[3px]">
        <NodeViewContent
          as="table"
          className={cn(node.attrs.isShowTableBorder ? '' : 'no-border')}
        >
          <colgroup>
            {Array.from({ length: columns }).map((_, i) => (
              <col
                key={i}
                style={{
                  minWidth: `${extension.options.cellMinWidth}px`,
                  width: columnsWidth[i] ? columnsWidth[i] : undefined
                }}
              />
            ))}
          </colgroup>
        </NodeViewContent>
      </div>
      {!isPreview && (
        <div className="cursor-pointer hover:bg-gray-300 p-1 rounded-sm h-fit">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <EllipsisVertical size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="p-0 text-sm w-60 font-semibold"
            >
              <DropdownMenuItem
                // onClick={() => editor.chain().focus().addColumnBefore().run()}
                className="flex gap-2 cursor-pointer items-center py-2 px-3 rounded-none"
              >
                <Table color="#717680" size={16} /> <span>Đường viền bảng</span>
                <Switch
                  checked={node.attrs.isShowTableBorder}
                  className="ml-auto"
                  onCheckedChange={(value) => {
                    updateAttributes({ isShowTableBorder: value })
                  }}
                />
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="px-3">
                  <div className="flex space-x-2 py-1 items-center">
                    <Palette color="#717680" size={16} /> <span>Màu nền</span>
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="p-0">
                    <p className="font-semibold px-4 py-3 text-sm">Màu nền</p>
                    <Separator className="" />
                    <div className="grid grid-cols-5 gap-2 justify-between p-4">
                      {DEFAULT_COLOR_BG.map((value, index) => {
                        return (
                          <div
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation()
                              const nodeStartPos = getPos()
                              if (!nodeData) return
                              editor
                                .chain()
                                .setAllTableCellAttribute(
                                  'backgroundColor',
                                  value.bgColor,
                                  {
                                    from: nodeStartPos,
                                    to: nodeStartPos + nodeData.nodeSize
                                  }
                                )
                                .run()
                            }}
                            style={{
                              backgroundColor: value?.bgColor,
                              borderColor: value?.borderColor
                            }}
                            className={cn(
                              'cursor-pointer grid place-content-center rounded-lg w-9 h-9 border font-semibold'
                            )}
                          >
                            {index === 0 && <Ban color="#f50000" />}
                          </div>
                        )
                      })}
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuItem
                onClick={() => {
                  editor.commands.insertContentAt(
                    getPos() + node.nodeSize,
                    node
                  )
                }}
                className="flex gap-2 cursor-pointer px-3"
              >
                <div className="flex space-x-2 py-1 items-center">
                  <Copy color="#717680" size={16} /> <span>Tạo bản sao</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex gap-2 cursor-pointer px-3"
                onClick={() => {
                  deleteNode()
                }}
              >
                <div className="flex space-x-2 py-1 items-center">
                  <Trash color="#717680" size={16} /> <span>Xoá</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </NodeViewWrapper>
  )
}
export default TableComponent
