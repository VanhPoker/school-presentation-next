import { cn } from '@/lib/utils'
import {
  ToolQuickAccessIcon,
  WhiteboardCompaTool,
  WhiteboardRulerTool,
  WhitboardCalculatorTool,
  WhiteboardAtomIcon,
  WhiteboardChemicalIcon,
  WhiteboardBiologyIcon,
  WhiteboardLiteratureIcon,
  WhiteboardLanguageIcon,
  WhiteboardGeography,
  WhiteboardHistoryIcon,
  WhiteboardMoreToolIcon,
  WhiteboardProtractorTool,
  WhiteboardTriangleProtractorTool
} from '../icons'
import { Heart } from 'lucide-react'
import { useWhiteboardStore, WhiteboardTool } from '@/stores/use-white-board'
import { useShallow } from 'zustand/react/shallow'
import { useRef, useTransition } from 'react'
// import { updateWhiteboardFavouriteTools } from "@/services/whiteboard";
import DialogWrapper from '../dialog-wrapper'

export default function SubjectsTool() {
  const [isPending] = useTransition()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const {
    currentTools,
    favouriteTools,
    updateCurrentTools,
    updateFavouriteTools
  } = useWhiteboardStore(
    useShallow((state) => ({
      currentTools: state.currentTools,
      favouriteTools: state.favouriteTools,
      updateCurrentTools: state.updateCurrentTools,
      updateFavouriteTools: state.updateFavouriteTools
    }))
  )
  const handleUpdateFavouriteTool = async (data: {
    toolId: WhiteboardTool
    toolName: string
  }) => {
    const { toolId, toolName } = data
    const existed = favouriteTools.findIndex((tool) => tool.toolId === toolId)
    if (existed < 0) {
      updateFavouriteTools([
        ...favouriteTools,
        {
          toolId,
          toolName
        }
      ])
      // startTransition(async () => {
      //   await updateWhiteboardFavouriteTools({
      //     toolId,
      //     isFavorite: 1,
      //   });
      // });
    } else {
      const cloned = [...favouriteTools]
      cloned.splice(existed, 1)
      updateFavouriteTools(cloned.filter((tool) => tool.toolId !== toolId))
      // startTransition(async () => {
      //   await updateWhiteboardFavouriteTools({
      //     toolId,
      //     isFavorite: 0,
      //   });
      // });
    }
  }
  return (
    <DialogWrapper
      className="max-w-4xl"
      triggerElement={
        <button
          ref={buttonRef}
          className={cn(
            'relative flex items-center justify-center m-1 p-2 transition duration-250 rounded-[3px] hover:bg-[#2563EB] hover:text-white hover:transition hover:duration-150 hover:round-[3px]'
          )}
        >
          <ToolQuickAccessIcon />
        </button>
      }
    >
      <div className="flex md:flex-row flex-col overflow-hidden">
        <ul className="md:pl-4 flex md:flex-col gap-1 text-sm overflow-x-auto">
          <li className="flex gap-2 items-center whitespace-nowrap px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ToolQuickAccessIcon />
            Công cụ Toán học
          </li>
          <li className="flex gap-2 items-center whitespace-nowrap px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors">
            <WhiteboardAtomIcon />
            Công cụ Vật lý
          </li>
          <li className="flex gap-2 items-center whitespace-nowrap px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors">
            <WhiteboardChemicalIcon />
            Công cụ Hoá học
          </li>
          <li className="flex gap-2 items-center whitespace-nowrap px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors">
            <WhiteboardBiologyIcon />
            Công cụ Sinh học
          </li>
          <li className="flex gap-2 items-center whitespace-nowrap px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors">
            <WhiteboardLiteratureIcon />
            Ngữ văn
          </li>
          <li className="flex gap-2 items-center whitespace-nowrap px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors">
            <WhiteboardLanguageIcon />
            Ngoại ngữ
          </li>
          <li className="flex gap-2 items-center whitespace-nowrap px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors">
            <WhiteboardGeography />
            Địa lý
          </li>
          <li className="flex gap-2 items-center whitespace-nowrap px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors">
            <WhiteboardHistoryIcon />
            Lịch sử
          </li>
          <li className="flex gap-2 items-center whitespace-nowrap px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors">
            <WhiteboardMoreToolIcon />
            Khác
          </li>
        </ul>
        <div className="h-0.5 w-full mb-4 md:mb-0 md:h-full md:w-0.5 bg-gray-300 md:mx-5" />
        <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
          <div
            onClick={() => {
              if (currentTools.includes(WhiteboardTool.RULER)) return
              updateCurrentTools([...currentTools, WhiteboardTool.RULER])
              buttonRef.current?.click()
            }}
            className="flex gap-2 border rounded-lg px-5 py-4 hover:shadow-lg cursor-pointer"
          >
            <WhiteboardRulerTool />
            <div className="ml-5 text-left">
              <h4>Thước thẳng</h4>
              <p className="text-[#6B7280] text-sm">
                Dùng để vẽ đoạn thẳng, tia, đường thẳng, đo chiều dài,...
              </p>
            </div>
            <button
              disabled={isPending}
              onClick={(e) => {
                e.stopPropagation()
                handleUpdateFavouriteTool({
                  toolId: WhiteboardTool.RULER,
                  toolName: 'Thước kẻ'
                })
              }}
              className={cn(
                'h-12 w-12 ml-auto hover:bg-[#DBEAFE] hover:text-[#1E40AF] transition-colors rounded-lg flex justify-center items-center',
                favouriteTools.some(
                  (tool) => tool.toolId === WhiteboardTool.RULER
                ) && 'bg-[#DBEAFE] text-[#1E40AF]'
              )}
            >
              <Heart strokeWidth={1} />
            </button>
          </div>
          <div
            onClick={() => {
              if (currentTools.includes(WhiteboardTool.PROTRACTOR)) return
              updateCurrentTools([...currentTools, WhiteboardTool.PROTRACTOR])
              buttonRef.current?.click()
            }}
            className="flex gap-2 border rounded-lg px-5 py-4 hover:shadow-lg"
          >
            <WhiteboardProtractorTool />
            <div className="ml-5 text-left">
              <h4>Thước đo góc</h4>
              <p className="text-[#6B7280] text-sm">
                Dùng để đo số đo một góc từ 0 độ đến 180 độ.
              </p>
            </div>
            <button
              disabled={isPending}
              onClick={(e) => {
                e.stopPropagation()
                handleUpdateFavouriteTool({
                  toolId: WhiteboardTool.PROTRACTOR,
                  toolName: 'Thước đo độ'
                })
                // buttonRef.current?.click();
              }}
              className={cn(
                'h-12 w-12 ml-auto hover:bg-[#DBEAFE] hover:text-[#1E40AF] transition-colors rounded-lg flex justify-center items-center',
                favouriteTools.some(
                  (tool) => tool.toolId === WhiteboardTool.PROTRACTOR
                ) && 'bg-[#DBEAFE] text-[#1E40AF]'
              )}
            >
              <Heart strokeWidth={1} />
            </button>
          </div>
          <div className="flex gap-2 border rounded-lg px-5 py-4">
            <WhiteboardTriangleProtractorTool />
            <div className="ml-5 text-left">
              <h4>Thước Ê ke</h4>
              <p className="text-[#6B7280] text-sm">
                Dùng để đo, vẽ góc vuông (90 độ) và góc 45 độ.
              </p>
            </div>
            <button
              className={cn(
                'h-12 w-12 ml-auto hover:bg-[#DBEAFE] hover:text-[#1E40AF] transition-colors rounded-lg flex justify-center items-center'
              )}
            >
              <Heart strokeWidth={1} />
            </button>
          </div>
          <div className="flex gap-2 border rounded-lg px-5 py-4">
            <WhiteboardCompaTool />
            <div className="ml-5 text-left">
              <h4>Compa</h4>
              <p className="text-[#6B7280] text-sm">
                Dùng để vẽ cung tròn, đường tròn.
              </p>
            </div>
            <span
              className={cn(
                'h-12 w-12 ml-auto hover:bg-[#DBEAFE] hover:text-[#1E40AF] transition-colors rounded-lg flex justify-center items-center'
              )}
            >
              <Heart strokeWidth={1} />
            </span>
          </div>
          <div className="flex gap-2 border rounded-lg px-5 py-4">
            <WhitboardCalculatorTool />
            <div className="ml-5 text-left">
              <h4>Máy tính</h4>
              <p className="text-[#6B7280] text-sm">
                Dùng để thực hiện tác phép tính
              </p>
            </div>
            <button
              className={cn(
                'h-12 w-12 ml-auto hover:bg-[#DBEAFE] hover:text-[#1E40AF] transition-colors rounded-lg flex justify-center items-center'
              )}
            >
              <Heart strokeWidth={1} />
            </button>
          </div>
        </div>
      </div>
    </DialogWrapper>
  )
}
