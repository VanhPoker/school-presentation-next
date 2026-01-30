import { cn } from '@/lib/utils'
import { PointerIcon, ToolShapesIcon, PenIcon } from '../icons'
import { useWhiteboardStore, WhiteboardTool } from '@/stores/use-white-board'
import {
  Circle,
  RectangleHorizontal,
  Redo,
  Save,
  Slash,
  Square,
  Undo
} from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import SubjectsTool from './SubjectsTool'
import { memo, useEffect, useState } from 'react'
import { SimplePopover } from '../popover'
import { useBoolean } from 'react-use'
// import { getWhiteboardFavouriteTools } from "@/services/whiteboard";
// import { Skeleton } from "@/components/ui/skeleton";
type WhiteboardToolBarProps = {
  doUndo: VoidFunction
  doRedo: VoidFunction
  doSave: () => Promise<void>
}
function WhiteboardToolBar({ doRedo, doUndo, doSave }: WhiteboardToolBarProps) {
  const {
    mode,
    history,
    // currentTools,
    historyIndex,
    // favouriteTools,
    updateCurrentMode
    // updateCurrentTools,
    // updateFavouriteTools
  } = useWhiteboardStore(
    useShallow((state) => ({
      mode: state.mode,
      history: state.history,
      historyIndex: state.historyIndex,
      currentTools: state.currentTools,
      favouriteTools: state.favouriteTools,
      updateCurrentMode: state.updateCurrentMode,
      updateHistoryIndex: state.updateHistoryIndex,
      updateCurrentTools: state.updateCurrentTools,
      updateFavouriteTools: state.updateFavouriteTools,
      updateHistory: state.updateHistory
    }))
  )
  const [isOpenTools, toggleOpenTools] = useBoolean(false)
  const [loading, setLoading] = useState(false)
  // const { data: whiteboardTools, isLoading } = useSWR(
  //   {
  //     action: "fetchFavouriteTools",
  //   },
  //   () => getWhiteboardFavouriteTools(),
  //   {},
  // );
  // const renderToolIcon = useCallback(
  //   (type: WhiteboardTool) => {
  //     switch (type) {
  //       case WhiteboardTool.RULER:
  //         return <Ruler strokeWidth={1} />
  //       case WhiteboardTool.PROTRACTOR:
  //         return <Rainbow strokeWidth={1} />
  //       default:
  //         return null
  //     }
  //   },
  //   [favouriteTools.length]
  // )
  // useEffect(() => {
  //   if (whiteboardTools?.data && whiteboardTools.data.length > 0) {
  //     updateFavouriteTools(whiteboardTools.data);
  //   }
  // }, [whiteboardTools]);
  useEffect(() => {
    return () => {
      updateCurrentMode(WhiteboardTool.POINTER)
      document.body.style.cursor = 'pointer'
    }
  }, [])
  return (
    <div className="fixed z-40 items-center justify-between px-4 overflow-x-auto bottom-0 left-0 w-full h-20 bg-white border-t border-white shadow-[0_-0.3125rem_0.41666667rem_0_rgba(42,53,65,0.1),_0_0_0.41666667rem_0.20833333rem_rgba(42,53,65,0.06)] grid grid-cols-[max-content_1fr_max-content]">
      <div className="flex  overflow-hidden text-center items-center">
        <span
          className={cn(
            'p-2 bg-white border mr-2 rounded-lg',
            historyIndex <= 1
              ? 'opacity-50 cursor-not-allowed pointer-events-none'
              : 'cursor-pointer active:bg-gray-300'
          )}
          onClick={doUndo}
        >
          <Undo />
        </span>
        <span className="w-full h-0.5 bg-gray-300" />
        <span
          className={cn(
            'p-2 bg-white border rounded-lg',
            history.size < historyIndex + 1
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer active:bg-gray-300'
          )}
          onClick={doRedo}
        >
          <Redo />
        </span>
      </div>
      <div className="pl-3 flex justify-center items-center">
        <button
          disabled={mode === WhiteboardTool.POINTER}
          className={cn(
            'relative flex items-center justify-center m-1 p-2 transition duration-250 rounded-[3px] hover:bg-[#2563EB] hover:text-white hover:transition hover:duration-150 hover:round-[3px]',
            mode === WhiteboardTool.POINTER &&
              'bg-[#2563EB] text-white pointer-events-none'
          )}
          onClick={() => {
            updateCurrentMode(WhiteboardTool.POINTER)
            toggleOpenTools(false)
            document.body.style.cursor = 'pointer'
          }}
        >
          <PointerIcon />
        </button>
        <button
          disabled={mode === WhiteboardTool.PEN}
          className={cn(
            'relative flex items-center justify-center m-1 p-2 transition duration-250 rounded-[3px] hover:bg-[#2563EB] hover:text-white hover:transition hover:duration-150 hover:round-[3px]',
            mode === WhiteboardTool.PEN &&
              'bg-[#2563EB] text-white pointer-events-none'
          )}
          onClick={() => {
            updateCurrentMode(WhiteboardTool.PEN)

            document.body.style.cursor = `crosshair`
          }}
        >
          <PenIcon />
        </button>
        <SimplePopover
          open={isOpenTools}
          handleToogle={toggleOpenTools}
          content={
            <div className="flex gap-2 flex-col">
              <span
                key={1}
                onClick={() => {
                  updateCurrentMode(WhiteboardTool.RECT)
                  document.body.style.cursor = 'crosshair'
                }}
                className={cn(
                  'w-full p-2 gap-2 rounded-lg flex items-center cursor-pointer',
                  mode === WhiteboardTool.RECT && 'bg-gray-200'
                )}
              >
                <RectangleHorizontal className="h-4" />
                <span className="text-xs">Chữ nhật</span>
              </span>
              <span
                key={2}
                onClick={() => {
                  updateCurrentMode(WhiteboardTool.SQUARE)
                  toggleOpenTools(false)

                  document.body.style.cursor = 'crosshair'
                }}
                className="w-full p-2 gap-2 rounded-lg flex items-center cursor-pointer"
              >
                <Square className="h-4" />
                <span className="text-xs">Vuông</span>
              </span>
              <span
                key={3}
                onClick={() => {
                  updateCurrentMode(WhiteboardTool.CIRCLE)
                  document.body.style.cursor = 'crosshair'
                  toggleOpenTools(false)
                }}
                className="w-full p-2 gap-2 rounded-lg flex items-center cursor-pointer"
              >
                <Circle className="h-4" />
                <span className="text-xs">Tròn</span>
              </span>
              <span
                key={4}
                onClick={() => {
                  updateCurrentMode(WhiteboardTool.LINE)
                  document.body.style.cursor = 'crosshair'
                  toggleOpenTools(false)
                }}
                className="w-full p-2 gap-2 rounded-lg flex items-center cursor-pointer"
              >
                <Slash className="h-4" />
                <span className="text-xs mr-2">Đoạn thẳng</span>
              </span>
            </div>
          }
        >
          <span
            className={cn(
              'relative flex items-center justify-center p-2 transition duration-250 rounded-[3px] hover:bg-[#2563EB] hover:text-white hover:transition hover:duration-150 hover:round-[3px]',
              [
                WhiteboardTool.CIRCLE,
                WhiteboardTool.LINE,
                WhiteboardTool.RECT,
                WhiteboardTool.SQUARE
              ].includes(mode) && 'bg-[#2563EB] text-white'
            )}
          >
            <ToolShapesIcon />
          </span>
        </SimplePopover>
        <div className="border-l border-[#d1d3de] h-4 m-1" />
        <SubjectsTool />
        <div className="border-l border-[#d1d3de] h-4 m-1" />
        {/* {!isLoading &&
          favouriteTools.map((tool) => {
            const { toolId } = tool;
            return (
              <button
                key={toolId}
                className={cn(
                  "relative flex items-center  justify-center m-1 p-2 transition duration-250 rounded-[3px] hover:bg-[#2563EB] hover:text-white hover:transition hover:duration-150 hover:round-[3px]",
                  currentTools.includes(toolId) && "bg-[#2563EB] text-white",
                )}
                onClick={() => {
                  const existed = currentTools.findIndex(
                    (cur) => cur === toolId,
                  );
                  if (existed < 0) {
                    updateCurrentTools([...currentTools, toolId]);
                  } else {
                    const cloned = [...currentTools];
                    cloned.splice(existed, 1);
                    updateCurrentTools(cloned);
                  }
                }}
              >
                {renderToolIcon(toolId)}
              </button>
            );
          })} */}

        {/* {isLoading &&
          Array.from(Array(2)).map((_item, index) => {
            return <Skeleton key={index} className="w-8 h-8 mx-1 rounded-lg" />;
          })} */}
      </div>
      <button
        onClick={async () => {
          setLoading(true)
          await doSave?.()
          setLoading(false)
        }}
        disabled={loading}
        className="py-2 rounded-lg px-3 flex items-center gap-3 border border-[#E5E7EB] hover:shadow-lg"
      >
        <Save />
        {loading ? 'Đang lưu' : 'Lưu bảng'}
        {window.devicePixelRatio}
      </button>
    </div>
  )
}
export default memo(WhiteboardToolBar)
