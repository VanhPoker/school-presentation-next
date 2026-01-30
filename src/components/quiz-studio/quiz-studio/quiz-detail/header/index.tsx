import { MATERIAL_CATEGORY_LIST } from '@/mock-data/materials/config'
import { ClockRewind } from '@untitled-ui/icons-react'
import dayjs from 'dayjs'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import ButtonAction from '../button-action'
import { PuzzleIcon } from 'lucide-react'
import { useCreateBookStore } from '@/stores/use-create-book-store'
import { cn } from '@/lib/utils'
import { useQuizFormStudioStore } from '@/stores/use-quiz-studio-store'
import dynamic from 'next/dynamic'
const BookCreateModal = dynamic(
  () => import('@/components/modals/create-book/book-create-modal'),
  {}
)

interface IProps {
  dataExam: any
}
export default function QuizDetailHeader({ dataExam }: IProps) {
  const { examId } = useParams()
  const { dataBook } = useCreateBookStore()
  const { setObjQuizFormStudio } = useQuizFormStudioStore()
  const quizDetailHeaderRef = useRef<HTMLDivElement>(null)
  const [isOpenExamCreate, setIsOpenExamCreate] = useState(false)
  const [expanded, setExpanded] = useState<boolean>(false)
  const [description, setDescription] = useState<string | null | undefined>('')
  const [title, setTitle] = useState<string | undefined>('')
  const [useAvatar, setUserAvatar] = useState('')
  const [author, setAuthor] = useState<string | undefined>('')
  const [subject, setSubject] = useState<string | null | undefined>('')
  const [grade, setGrade] = useState<string | undefined>('')
  const [createdAt, setCreatedAt] = useState<string | undefined>('')
  const [views, setViews] = useState<number | undefined>(0)
  const [tags, setTags] = useState<any[] | undefined>([])

  const handerRenderIconType = () => {
    const itemCategory = MATERIAL_CATEGORY_LIST.find((x: any) => {
      return x.code === 'exam'
    })
    if (itemCategory) {
      return (
        <div
          style={{
            color: itemCategory.textColor,
            backgroundColor: itemCategory.bgColor,
            borderColor: itemCategory.textColor
          }}
          className={`flex items-center gap-1 px-1 rounded-md border`}
        >
          <span className="w-3 h-3 flex items-center">{itemCategory.icon}</span>
          <span className="font-medium text-sm whitespace-nowrap">
            {itemCategory.name}
          </span>
        </div>
      )
    } else {
      return null
    }
  }

  const handleRenderButtonAction = useCallback(() => {
    return (
      <ButtonAction
        examId={examId as string}
        setIsOpenExamCreate={setIsOpenExamCreate}
      />
    )
  }, [])

  useEffect(() => {
    if (dataExam) {
      const examDetail = dataExam?.exams[0]
      if (examDetail) {
        setTitle(examDetail?.materials?.title)
        setAuthor(examDetail.materials?.materials_created_infors?.fullname)
        setSubject(examDetail?.materials?.material_detail?.subject?.name)
        setGrade(examDetail?.materials?.material_detail?.grade?.code)
        setCreatedAt(examDetail?.created_at)
        setUserAvatar(examDetail.materials?.materials_created_infors?.avatar)
        setViews(
          examDetail?.materials?.material_views_aggregate.aggregate?.count
        )
        setTags(examDetail?.materials?.material_tags)
        setDescription(examDetail?.materials?.description)
      }

      // reset store all form quiz
      setObjQuizFormStudio({
        material_id: dataExam?.exams[0]?.materials?.id,
        point: 0,
        time: 15
      })
      quizDetailHeaderRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [dataExam])

  return (
    <div
      ref={quizDetailHeaderRef}
      className="p-8 bg-white space-y-6 relative z-[2]"
    >
      <div className="flex flex-col lg:flex-row md:items-start md:justify-between gap-4">
        <div className="flex md:items-center gap-4">
          <div className=" bg-red-300 rounded-full w-16 h-16 relative overflow-hidden shrink-0">
            <Image
              src={dataBook.thumbnail || '/book/Avatar.png'}
              alt="Profile avatar"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="scroll-m-20 text-lg font-semibold text-blue-900 lg:text-2xl line-clamp-1">
              {title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {handerRenderIconType()}
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1">
                <Image
                  alt=""
                  src={useAvatar ?? '/book/Avatar.png'}
                  className="rounded-full"
                  width={16}
                  height={16}
                />
                <span className="text-blue-600 font-medium">{author}</span>
              </div>
              {subject && (
                <>
                  <span className="text-gray-300">•</span>
                  <div className="text-blue-600 font-medium">
                    <span>{subject}</span>
                  </div>
                </>
              )}
              {grade && (
                <>
                  <span className="text-gray-300">•</span>
                  <div className="text-blue-600 font-medium">
                    <span>Khối {grade}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center flex-col sm:flex-row gap-2">
          {handleRenderButtonAction()}
        </div>
      </div>
      <div className="bg-gray-100 rounded-md p-3">
        <div className="flex flex-wrap gap-3 items-center">
          <p className="flex gap-1 text-slate-700 font-medium items-center text-sm">
            <ClockRewind className="w-4 h-4" />
            Cập nhật: {dayjs(createdAt).format('DD/MM/YYYY')}
          </p>
          <span className="text-gray-300">•</span>
          <p className="flex gap-1 text-slate-700 font-medium items-center text-sm">
            <PuzzleIcon size={15} />
            {views} lượt xem
          </p>
          {tags && tags?.length > 0 && (
            <>
              <span className="text-gray-300">•</span>
              <div>
                {dataBook.relatedKeywords.map((tag: any, index: number) => (
                  <span className="text-blue-400 text-sm" key={index}>
                    #{tag.keyword.replace(/\s+/g, '')}{' '}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        {description && (
          <div className="flex flex-wrap items-center">
            <div
              className={cn(
                '',
                expanded
                  ? 'line-clamp-none w-full'
                  : 'line-clamp-1 md:w-1/2 relative'
              )}
            >
              <p className="mt-2 mb-4 text-sm text-gray-500 inline ">
                {description}
              </p>
            </div>
            {description?.length > 100 && (
              <span
                className="text-blue-900 font-semibold cursor-pointer text-sm inline-block "
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Ẩn bớt' : 'Xem thêm'}
              </span>
            )}
          </div>
        )}
      </div>
      <BookCreateModal
        code={'exam'}
        isOpen={isOpenExamCreate}
        handleToggle={setIsOpenExamCreate}
        id={dataExam?.exams[0]?.materials?.id}
        limitSizeText={'Kích thước hỗ trợ tối thiếu: 300 x 450 px'}
        title="Thiết lập"
        des="Điền đầy đủ thông tin cài đặt"
        idMaterialDetail={dataExam?.exams[0]?.materials?.material_detail?.id}
      />
    </div>
  )
}
