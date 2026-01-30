import { Button } from '@/components/ui/button'
import { useCreateStorageQuizStore } from '@/stores/use-create-storage-quiz-store'
import { FileIcon, TrashIcon } from 'lucide-react'
import Image from 'next/image'
import { memo, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { typeFile } from '@/utils/checkTypeFile'
import dynamic from 'next/dynamic'
import { toasts } from '@/components/ui/toast-color'
import InforModal from '@/components/modals/infor-modal'

const PdfModal = dynamic(() => import('./pdf-modal'), {
  ssr: false
})

interface ShowFileProps {
  onDelete?: () => void
}

const ShowFile = ({ onDelete }: ShowFileProps) => {
  const {
    fileType,
    fileSize,
    fileName,
    togglePdfModal,
    handleDeleteFile,
    isUploading
  } = useCreateStorageQuizStore(
    useShallow((state) => ({
      fileType: state.fileType,
      fileSize: state.fileSize,
      fileName: state.fileName,
      pdfPages: state.pdfPages,
      togglePdfModal: state.togglePdfModal,
      handleDeleteFile: state.handleDeleteFile,
      isUploading: state.isUploading
    }))
  )
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] =
    useState<boolean>(false)
  const isPdfFile = useMemo(() => fileType?.includes('pdf'), [fileType])
  const convertedFileSize = useMemo(
    () => Math.round(Number(fileSize) / 1024),
    [fileSize]
  )
  if (!fileName) return null

  return (
    <>
      <div className="flex items-center gap-3 border border-gray-200 p-4 rounded-xl bg-white">
        <Image
          src={
            typeFile.find((item) => fileName.includes(item.name))?.icon || ''
          }
          alt="pdf-icon"
          width={40}
          height={40}
        />
        <div className="flex-1 text-sm overflow-hidden">
          <div className="mb-0.5 line-clamp-1">{fileName}</div>
          <div className="text-gray-500">{`${convertedFileSize}KB`}</div>
        </div>
        {isPdfFile && (
          <Button
            className="rounded-lg px-3 mr-2"
            onClick={togglePdfModal}
            disabled={isUploading}
          >
            <span>Chọn trang</span>
            <FileIcon size={20} />
          </Button>
        )}
        <Button
          className="rounded-lg w-9 hover:bg-red-500 hover:text-white"
          onClick={() => {
            setShowConfirmDeleteModal(true)
          }}
          disabled={isUploading}
        >
          <TrashIcon size={20} />
        </Button>
      </div>
      <PdfModal />
      <InforModal
        open={showConfirmDeleteModal}
        handleClose={() => setShowConfirmDeleteModal(false)}
        handleOpen={() => setShowConfirmDeleteModal(true)}
        confirmAction={() => {
          handleDeleteFile()
          onDelete?.()
          toasts.success('Đã xóa file!')
        }}
        title={'Xác nhận xóa'}
        description={'Bạn có chắc muốn xóa file này?'}
        abortText="Hủy"
        confirmText="Xác nhận"
        icon={<TrashIcon />}
        theme="error"
      />
    </>
  )
}

export default memo(ShowFile)
