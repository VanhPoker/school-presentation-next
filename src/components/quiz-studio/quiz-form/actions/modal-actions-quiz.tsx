import DialogWrapper from '@/components/base/dialog-wrapper'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calculator } from '@untitled-ui/icons-react'
import { useState } from 'react'
import { MATH_SYMBOLS } from './mockMathSymbols'
import 'katex/dist/katex.min.css'
import { PlusIcon } from 'lucide-react'
import { useEditorStore } from '@/stores/use-editor-state-store'
import dynamic from 'next/dynamic'
import { KatexText } from '@/components/ui/katex-label'
const LatexEditor = dynamic(() => import('@/components/base/latex-editor'), {
  ssr: false
})

export default function ModalActionsQuiz({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [activeCategory, setActiveCategory] = useState('characters')
  const [latexValue, setLatexValue] = useState('')
  const { setLatexValueModal } = useEditorStore()

  const handleSymbolClick = (symbol: string) => {
    setLatexValue((prev) => prev + `$${symbol}$`)
  }
  const handleAddFormula = () => {
    setLatexValueModal(latexValue)
    onClose()
  }

  const getCategorySymbols = () => {
    switch (activeCategory) {
      case 'characters':
        return MATH_SYMBOLS.characters
      case 'arrows':
        return MATH_SYMBOLS.arrows
      case 'operations':
        return MATH_SYMBOLS.operations
      case 'symbols':
        return MATH_SYMBOLS.symbols
      case 'comparisons':
        return MATH_SYMBOLS.comparisons
      case 'matrices':
        return MATH_SYMBOLS.matrices
      default:
        return MATH_SYMBOLS.characters
    }
  }

  return (
    <>
      <DialogWrapper
        className="max-w-5xl w-full border-none outline-none"
        isOpen={isOpen}
        onClose={onClose}
        closeButtonClassname="top-7 right-6"
        titleClassname="p-0"
        title={
          <div className="flex gap-4 items-center">
            <span className="p-2 rounded-lg border">
              <Calculator />
            </span>
            <h3 className="text-lg font-semibold">Thêm công thức toán học</h3>
          </div>
        }
      >
        <div className="space-y-6">
          <Separator className="bg-gray-200" />
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              className={`text-sm font-semibold border-none ${activeCategory === 'characters' ? 'bg-blue-100 text-blue-700' : 'text-gray-400'}`}
              onClick={() => setActiveCategory('characters')}
            >
              Ký tự
            </Button>
            <Button
              className={`text-sm font-semibold border-none ${activeCategory === 'arrows' ? 'bg-blue-100 text-blue-700' : 'text-gray-400'}`}
              onClick={() => setActiveCategory('arrows')}
            >
              Mũi tên
            </Button>
            <Button
              className={`text-sm font-semibold border-none ${activeCategory === 'operations' ? 'bg-blue-100 text-blue-700' : 'text-gray-400'}`}
              onClick={() => setActiveCategory('operations')}
            >
              Phép toán
            </Button>
            <Button
              className={`text-sm font-semibold border-none ${activeCategory === 'symbols' ? 'bg-blue-100 text-blue-700' : 'text-gray-400'}`}
              onClick={() => setActiveCategory('symbols')}
            >
              Biểu tượng
            </Button>
            <Button
              className={`text-sm font-semibold border-none ${activeCategory === 'comparisons' ? 'bg-blue-100 text-blue-700' : 'text-gray-400'}`}
              onClick={() => setActiveCategory('comparisons')}
            >
              So sánh
            </Button>
            <Button
              className={`text-sm font-semibold border-none ${activeCategory === 'matrices' ? 'bg-blue-100 text-blue-700' : 'text-gray-400'}`}
              onClick={() => setActiveCategory('matrices')}
            >
              Ma trận
            </Button>
          </div>
          <div
            className={`flex flex-wrap gap-2 h-[220px] overflow-y-auto ${
              activeCategory === 'matrices' ? 'justify-center' : ''
            }`}
          >
            {getCategorySymbols().map((symbol) => (
              <Button
                key={symbol.id}
                className={`flex items-center justify-center text-lg font-medium border border-gray-200 hover:bg-gray-100 ${
                  activeCategory === 'matrices' ? 'h-24 w-24' : 'h-14 w-16'
                }`}
                variant="outline"
                onClick={() => handleSymbolClick(symbol.value)}
              >
                <KatexText
                  value={symbol.name}
                  className="flex items-center justify-center"
                />
              </Button>
            ))}
          </div>
          <Separator className="bg-gray-200" />
          {/* LaTeX input area */}
          <div>
            <span className="text-sm font-medium">Nhập nội dung</span>
            <div className="mt-2 border border-gray-200 rounded-md p-3">
              <textarea
                className="w-full min-h-20 outline-none resize-none"
                value={latexValue}
                onChange={(e) => setLatexValue(e.target.value)}
                placeholder="Nhập công thức vào đây..."
              />
            </div>
          </div>

          <div className="flex justify-center items-center min-h-24">
            {latexValue && (
              <LatexEditor
                content={latexValue}
                className="[&>*]:!p-0 [&>*]:!min-h-0 [&>*]:!max-w-none"
              />
            )}
          </div>
          <Separator className="bg-gray-200" />
          <div className="flex justify-end gap-3 mt-6">
            <Button
              className="bg-blue-900 text-white"
              onClick={handleAddFormula}
            >
              <PlusIcon />
              <span>Thêm công thức</span>
            </Button>
          </div>
        </div>
      </DialogWrapper>
    </>
  )
}
