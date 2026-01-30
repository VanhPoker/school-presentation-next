import InforModal from '@/components/modals/infor-modal'
import { toasts } from '@/components/ui/toast-color'
import {
  Exam_Questions,
  UpdateExamQuestionsDocument
} from '@/graphql/generated'
import { cn } from '@/lib/utils'
import { useMutation } from '@apollo/client'
import { cloneDeep } from 'lodash-es'
import { GripHorizontalIcon, Trash2Icon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { memo, useEffect, useState } from 'react'
import { QuizzHeader } from './quiz-header'
import { QuizzLayout } from './quiz-layout'
import { QUIZ_TYPE } from '@/types/quiz-studio'
import ImageLabelingLayout from './image-labeling-layout'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export type QuizDetailProps = {
  data: Exam_Questions
  showCorrectAnswers?: boolean
  refetchExams?: () => void
  className?: string
  editable?: boolean
  questionBgColor?: 'none' | 'gray'
  layout?: 1 | 2 | 3 | 4 | 5
  hasCheckBox?: boolean
  index: number
  relativeCheckbox?: boolean
  colNumber?: number
  userInfoId: string
  answerAspectRatio?: '4/3' | '2/1'
  isPreview?: boolean
  allChecked?: boolean
  quizLayoutClassName?: string
  quizHeaderClassName?: string
  isSort?: boolean
}

function QuizItem({
  data,
  className = '',
  editable = true,
  userInfoId,
  showCorrectAnswers = true,
  refetchExams,
  questionBgColor = 'gray',
  layout = 1,
  hasCheckBox = true,
  relativeCheckbox = true,
  index,
  answerAspectRatio = '2/1',
  isPreview = true,
  colNumber,
  quizLayoutClassName,
  quizHeaderClassName,
  isSort
}: QuizDetailProps) {
  const { examId } = useParams()
  const { question } = data
  const {
    id,
    name,
    time,
    point,
    must_response,
    questions_hotspots,
    question_category,
    file_urls,
    asset_type,
    asset_url,
    embedded_url,
    layout_answer,
    media_width,
    content_preview
  } = question
  const { created_by } = data
  const question_category_code = question_category?.code
  const question_category_name = question_category?.name
  const url = asset_url ? file_urls?.url : embedded_url
  const [updateExamQuestions] = useMutation(UpdateExamQuestionsDocument)
  const [isAuthor, setIsAuthor] = useState<boolean>(false)
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [overSize, setOverSize] = useState<number>(2)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: data.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const handleDuplicate = async (data: Partial<Exam_Questions>) => {
    const formatData = cloneDeep(data)
    delete formatData?.question_id
  }

  const handleDeleteConfirm = async () => {
    await updateExamQuestions({
      variables: {
        where: {
          exam_id: { _eq: examId },
          question_id: { _eq: id }
        },
        set: { is_deleted: true }
      }
    })
      .then(() => {
        setDeleteSuccess(true)
      })
      .catch((err) => console.error('Delete Question Error:', err))
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.outerWidth >= 924) setOverSize(2)
      else if (window.outerWidth < 924 && window.outerWidth >= 765)
        setOverSize(1)
      else setOverSize(0)
    }

    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (created_by && userInfoId && created_by === userInfoId) {
      setIsAuthor(true)
    }
  }, [created_by, userInfoId])

  useEffect(() => {
    if (deleteSuccess && refetchExams) {
      refetchExams()
      setDeleteSuccess(false)
    }
  }, [deleteSuccess, refetchExams])

  useEffect(() => {
    if (created_by && userInfoId && created_by === userInfoId) {
      setIsAuthor(true)
    }
  }, [created_by, userInfoId])

  const renderLayout = () => {
    if (question_category_code === QUIZ_TYPE.sticker) {
      return (
        <ImageLabelingLayout
          imageUrl={url as string}
          question={name}
          answers={questions_hotspots as any[]}
          originMediaWidth={media_width}
          showCorrectAnswers={showCorrectAnswers}
        />
      )
    }
    return (
      <QuizzLayout
        url={url ?? undefined}
        asset_type={asset_type || ''}
        question_category_code={question_category_code || ''}
        questions_hotspots={questions_hotspots}
        validateQuestion={name}
        showCorrectAnswers={showCorrectAnswers}
        questionBgColor={questionBgColor}
        hasCheckBox={hasCheckBox}
        relativeCheckbox={relativeCheckbox}
        answerAspectRatio={answerAspectRatio}
        isPreview={isPreview}
        colNumber={colNumber ? colNumber : overSize > 0 ? layout_answer : 1}
        layout={layout}
        content_preview={content_preview || ''}
        quizLayoutClassName={quizLayoutClassName}
      />
    )
  }
  return (
    <div id={id} className="relative" ref={setNodeRef} style={style}>
      <button
        className={cn(
          'absolute h-6 w-full left-0 right-0 cursor-move flex items-center justify-center text-gray-400',
          isSort ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
        {...attributes}
        {...listeners}
      >
        <GripHorizontalIcon className="transition-all" size={20} />
      </button>
      <div className={cn('rounded-lg bg-white min-h-50', className)}>
        <QuizzHeader
          code={question_category_code ?? ''}
          name={question_category_name ?? ''}
          editable={editable}
          point={point}
          time={time}
          must_response={must_response}
          isAuthor={isAuthor}
          examId={examId ?? ''}
          id={id}
          data={data}
          loading={false}
          setShowConfirmDeleteModal={(value) =>
            setShowConfirmDeleteModal(value)
          }
          handleDuplicate={(value) => handleDuplicate(value)}
          index={index}
          oversize={overSize}
          quizHeaderClassName={quizHeaderClassName}
        />
        <div className="transition-all h-auto opacity-100 visible">
          {renderLayout()}
        </div>
        <InforModal
          open={showConfirmDeleteModal}
          handleClose={() => setShowConfirmDeleteModal(false)}
          handleOpen={() => setShowConfirmDeleteModal(true)}
          confirmAction={() => {
            handleDeleteConfirm()
            toasts.success('Xóa thành công ')
          }}
          title={'Xác nhận xóa'}
          description={'Bạn có chắc muốn xóa câu hỏi này?'}
          abortText="Hủy"
          confirmText="Xác nhận"
          icon={<Trash2Icon />}
          theme="error"
        />
      </div>
    </div>
  )
}
export default memo(QuizItem)
