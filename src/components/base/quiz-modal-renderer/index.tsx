import ModalCheckProgressQuiz from '@/components/modals/modal-check-progress-quiz'
import ModalStudyQuiz from '@/components/modals/modal-study-quiz'
import { RefreshCwIcon } from 'lucide-react'

type ModalType = 'none' | 'study' | 'progress' | 'loading'

interface QuizModalRendererProps {
  modalType: ModalType
  isModalOpen: boolean
  onClose: () => void
  hasCompleted: boolean
  progressPercentage: number
  progressId?: string
  missionId?: string
  examDetailId?: string
  progressMaterialId?: string
  materialId: string
  examId?: string
  onContinue: (params: {
    id?: string
    missionId?: string
    examDetailId?: string
    materialId?: string
  }) => void
  onRestart: () => void
}

export function QuizModalRenderer({
  modalType,
  isModalOpen,
  onClose,
  hasCompleted,
  progressPercentage,
  progressId,
  missionId,
  examDetailId,
  progressMaterialId,
  materialId,
  examId,
  onContinue,
  onRestart
}: QuizModalRendererProps) {
  if (modalType === 'loading') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 flex flex-col items-center">
          <RefreshCwIcon className="h-8 w-8 animate-spin" />
          <span className="ml-3 text-lg">Đang kiểm tra tiến độ...</span>
        </div>
      </div>
    )
  }

  if (modalType === 'progress') {
    return (
      <ModalCheckProgressQuiz
        isOpen={isModalOpen}
        onClose={onClose}
        hasCompleted={hasCompleted}
        progressPercentage={progressPercentage}
        onContinue={onContinue}
        onRestart={onRestart}
        title="Bắt đầu Quiz"
        id={progressId}
        missionId={missionId}
        examDetailId={examDetailId}
        materialId={progressMaterialId}
      />
    )
  }

  if (modalType === 'study') {
    return (
      <ModalStudyQuiz
        idBook={materialId}
        examId={examId}
        isOpen={isModalOpen}
        onClose={onClose}
      />
    )
  }

  return null
}
