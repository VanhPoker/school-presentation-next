'use client'
import DialogWrapper from '@/components/base/dialog-wrapper'
import { Button } from '@/components/ui/button'
import { useCreateStorageQuizStore } from '@/stores/use-create-storage-quiz-store'
import React, { memo, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { useShallow } from 'zustand/react/shallow'
import { CheckIcon, LoaderIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Document, Page } from 'react-pdf'
import { toast } from 'sonner'

const PdfModal = () => {
  const { isOpenPdfModal, togglePdfModal, pdfPages, fileUrl } =
    useCreateStorageQuizStore(
      useShallow((state) => ({
        isOpenPdfModal: state.isOpenPdfModal,
        togglePdfModal: state.togglePdfModal,
        pdfPages: state.pdfPages,
        fileUrl: state.fileUrl
      }))
    )
  const [numPages, setNumPages] = useState(0)
  const [selectedPages, setSelectedPages] = useState<number[]>([])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setSelectedPages(
      pdfPages.length > 0
        ? pdfPages
        : Array.from({ length: numPages }, (_, i) => i + 1)
    )
  }
  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error)
  }

  const togglePageSelection = (pageNumber: number) => {
    if (selectedPages.includes(pageNumber)) {
      setSelectedPages(selectedPages.filter((page) => page !== pageNumber))
    } else {
      setSelectedPages([...selectedPages, pageNumber])
    }
  }

  const toggleSelectAll = () => {
    if (selectedPages.length === numPages) {
      setSelectedPages([])
    } else {
      setSelectedPages(Array.from({ length: numPages }, (_, i) => i + 1))
    }
  }
  const handleSaveSelection = () => {
    useCreateStorageQuizStore.setState({
      pdfPages: selectedPages
    })
    toast.success('Lưu số trang thành công!')
    togglePdfModal()
  }

  const handleCloseModal = () => {
    togglePdfModal()
  }
  return (
    <DialogWrapper
      className="max-w-5xl w-full border-none outline-none px-6"
      isOpen={isOpenPdfModal}
      onClose={handleCloseModal}
      closeButtonClassname="top-7 right-6"
    >
      <div className="space-y-6">
        <div className="text-xl font-semibold">Chọn trang</div>
        <Separator className="bg-gray-300" />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-900 font-semibold">
            Đã chọn {selectedPages.length}/{numPages}
          </span>
          <Button
            className="text-sm font-semibold text-blue-900 border-none"
            onClick={toggleSelectAll}
          >
            {selectedPages.length === numPages
              ? 'Bỏ chọn tất cả'
              : 'Chọn tất cả'}
          </Button>
        </div>
        <div className="max-h-96 gap-4 overflow-y-auto px-4">
          {fileUrl && (
            <Document
              className={'grid grid-cols-4 overflow-y-auto gap-4'}
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="col-span-full flex justify-center items-center py-20">
                  <LoaderIcon
                    className="animate-spin text-blue-900"
                    size={24}
                  />
                  <span className="ml-2 w-full">Đang tải dữ liệu...</span>
                </div>
              }
              error={
                <div className="col-span-full flex justify-center items-center text-red-500 text-xs py-10">
                  Lỗi tải dữ liệu
                </div>
              }
            >
              {Array.from(new Array(numPages), (_, index) => (
                <div
                  key={index}
                  className={cn(
                    'relative group cursor-pointer rounded-lg overflow-hidden border bg-gray-300',
                    selectedPages.includes(index + 1)
                      ? 'border-blue-500'
                      : 'border-gray-200'
                  )}
                  onClick={() => togglePageSelection(index + 1)}
                >
                  <div className="w-full h-40 flex items-center justify-center">
                    <Page
                      pageNumber={index + 1}
                      width={100}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </div>
                  <div
                    className={cn(
                      'absolute left-1 bottom-1 p-1 text-xs rounded-md flex items-center justify-center transition-colors',
                      selectedPages.includes(index + 1)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-50 text-transparent'
                    )}
                  >
                    <CheckIcon size={12} />
                  </div>
                </div>
              ))}
            </Document>
          )}
        </div>
        <Separator className="bg-gray-200" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={handleCloseModal}>
            Huỷ
          </Button>
          <Button
            className="bg-blue-900 text-white"
            onClick={handleSaveSelection}
          >
            Lưu
          </Button>
        </div>
      </div>
    </DialogWrapper>
  )
}

export default memo(PdfModal)
