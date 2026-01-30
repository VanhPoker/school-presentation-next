import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Exam_Questions, UpdateQuestionsDocument } from '@/graphql/generated'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'
import { NoData } from '@/components/ui/no-data'
import QuizItem from '../quiz-item'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useTotalQuizStore } from '@/stores/use-total-quiz-store'
import { useSearchParams } from 'next/navigation'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useMutation } from '@apollo/client'
import { toasts } from '@/components/ui/toast-color'

type ContentListQuestionProps = {
  examId: string | any
  userInfoId: string
  exam_questions: Exam_Questions[]
  onKeywordChange: (keyword: string) => void
  loadingExam: boolean
  searchLoading?: boolean
}

export default function ListQuiz({
  examId,
  exam_questions,
  userInfoId,
  loadingExam,
  searchLoading = false,
  onKeywordChange,
  refetchExams
}: ContentListQuestionProps & {
  refetchExams?: () => Promise<any>
}) {
  const searchParams = useSearchParams()
  const statusParams = searchParams.get('status')
  const codeTypeParams = searchParams.get('codeType')
  const idBook = searchParams.get('idBook')
  const { totalQuiz, setTotalQuiz } = useTotalQuizStore()
  const [UpdateQuestionsMutation] = useMutation(UpdateQuestionsDocument)
  const [examQuizUI, setExamQuizUI] = useState<any[]>([])
  const [totalPoint, setTotalPoint] = useState<number>(0)
  const [totalTime, setTotalTime] = useState<number>(0)
  const [keyword, setKeyword] = useState<string>('')
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false)
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<boolean>(true)

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    let timeString = ''
    if (hours > 0) timeString += `${hours} giờ `
    if (minutes > 0) timeString += `${minutes} phút `
    if (remainingSeconds > 0) timeString += `${remainingSeconds} giây`
    return timeString.trim() || '0s'
  }

  const handleKeywordChange = (searchTerm: string) => {
    setIsSearchMode(!!searchTerm)
    onKeywordChange(searchTerm)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsSearching(true)
      handleKeywordChange(keyword)
      setTimeout(() => {
        setIsSearching(false)
      }, 1000)
    }
  }

  const renderLoadingList = () => {
    return (
      <>
        <div className="p-5 bg-white rounded-md grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-4 border border-[#E9EAEB] rounded-md p-4"
            >
              <Skeleton className="h-10 w-10" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 bg-white rounded-md">
          <Skeleton className="h-10 w-full" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-white p-6">
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-24" />
                <Separator
                  orientation="vertical"
                  className="bg-gray-300 h-[24px]"
                />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex gap-3 items-center">
                <Skeleton className="h-6 w-32" />
                <Separator
                  orientation="vertical"
                  className="bg-gray-300 h-[24px]"
                />
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        ))}
      </>
    )
  }

  const reorderQuiz = (array: any[]) => {
    let counter = 1
    return array.map((array) => {
      if (array.order_number === -1) {
        return array
      }
      return {
        ...array,
        question: {
          ...array.question,
          order_number: counter++
        }
      }
    })
  }

  const fetchReorderQuiz = async (finalArray: any[]) => {
    toasts.loading('Đang lưu thay đổi...')
    try {
      const formatArray = finalArray.map((x) => {
        return {
          where: { id: { _eq: x.question.id } },
          _set: { order_number: x.question.order_number }
        }
      })
      const resUpdate = await UpdateQuestionsMutation({
        variables: {
          objects: formatArray
        }
      })
      if (resUpdate.data) {
        toasts.success('Lưu thành công')
      }
    } catch {
      toasts.loading('Có lỗi xảy ra !!!')
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = examQuizUI.findIndex((x) => x.id === active.id)
      const newIndex = examQuizUI.findIndex((x) => x.id === over?.id)
      const customArrayMove = arrayMove(examQuizUI, oldIndex, newIndex)
      const finalArray = reorderQuiz(customArrayMove)
      setExamQuizUI(finalArray)
      fetchReorderQuiz(finalArray)
    }
  }

  useEffect(() => {
    if (exam_questions && !isSearchMode) {
      if (exam_questions.length > 0) {
        setExamQuizUI(exam_questions)
        setTotalQuiz(exam_questions.length)
        setTotalPoint(
          exam_questions.reduce(
            (sum, item) => sum + (item.question.point || 0),
            0
          )
        )
        setTotalTime(
          exam_questions.reduce(
            (sum, item) => sum + (item.question.time || 15),
            0
          )
        )
      } else {
        setExamQuizUI([])
        setTotalQuiz(0)
        setTotalPoint(0)
        setTotalTime(0)
      }
    }
  }, [exam_questions, isSearchMode])

  return (
    <div className="flex flex-col p-6 relative container mx-auto space-y-7">
      {loadingExam || searchLoading ? (
        renderLoadingList()
      ) : (
        <>
          <div className="p-5 bg-white rounded-md grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-4 border border-[#E9EAEB] rounded-md p-4">
              <Image
                src="/quiz-studio/list.png"
                width={40}
                height={40}
                alt=""
              />
              <div>
                <p className="text-[#535862]">Số lượng câu hỏi</p>
                <p className="font-semibold">{totalQuiz}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 border border-[#E9EAEB] rounded-md p-4">
              <Image
                src="/quiz-studio/total.png"
                width={40}
                height={40}
                alt=""
              />
              <div>
                <p className="text-[#535862]">Tổng điểm của bài tập</p>
                <p className="font-semibold">{totalPoint}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 border border-[#E9EAEB] rounded-md p-4">
              <Image
                src="/quiz-studio/time.png"
                width={40}
                height={40}
                alt=""
              />
              <div>
                <p className="text-[#535862]">Thời gian dự kiến làm bài</p>
                <p className="font-semibold">{formatTime(totalTime)}</p>
              </div>
            </div>
          </div>
          <div className="p-5 bg-white rounded-mb">
            <div className="relative">
              <SearchIcon
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <Input
                value={keyword}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Nhập từ khoá để tìm kiếm câu hỏi"
                className={cn(
                  'text-sm border-gray-300 mt-3 rounded-md bg-white w-full pl-10',
                  isSearching && 'opacity-70'
                )}
                disabled={isSearching}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row  gap-2 justify-between w-full items-center mb-6">
            <div className="flex  justify-between items-center gap-3">
              <span className="font-semibold text-lg">Chi tiết bài tập</span>
              <Separator orientation="vertical" className="bg-slate-300 h-6" />
              <Switch
                className="ring-gray-300"
                checked={showCorrectAnswers}
                onCheckedChange={setShowCorrectAnswers}
              />
              <span className="text-sm font-medium">Hiển thị đáp án</span>
            </div>

            <Link
              href={`/quiz-sources?examId=${examId}&idBook=${idBook}&status=${statusParams}&codeType=${codeTypeParams}`}
              className="inline-flex justify-center"
            >
              <Button className="transition-all rounded-md bg-blue-900 border border-blue-900 hover:bg-blue-600 hover:border-blue-600 text-white">
                <PlusIcon className="size-4 mr-2" /> Thêm câu hỏi
              </Button>
            </Link>
          </div>
          {examQuizUI.length === 0 && (
            <div className="flex flex-col gap-6">
              <NoData />
            </div>
          )}
          {examQuizUI.length > 0 && (
            <div className="flex flex-col gap-6">
              <DndContext onDragEnd={handleDragEnd}>
                <SortableContext
                  items={examQuizUI}
                  strategy={verticalListSortingStrategy}
                >
                  {examQuizUI.map((question, index) => {
                    const { id } = question
                    return (
                      <QuizItem
                        key={id}
                        index={index}
                        userInfoId={userInfoId}
                        data={question}
                        layout={2}
                        className="!p-6"
                        showCorrectAnswers={showCorrectAnswers}
                        refetchExams={refetchExams}
                        answerAspectRatio="4/3"
                        relativeCheckbox={false}
                        isPreview={false}
                        colNumber={2}
                        isSort={true}
                      />
                    )
                  })}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </>
      )}
    </div>
  )
}
