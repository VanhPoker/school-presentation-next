'use client'
import { useApollo } from '@/app/apollo/apolloClient'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Main } from '@/components/layout/main'
import { initExamsFilter } from '@/constants/initGraphqlQueryVariables'
import {
  GetExamsDocument,
  GetExamsQueryHookResult,
  GetExamsQueryVariables,
  useGetFileLazyQuery
} from '@/graphql/generated'
import { cn } from '@/lib/utils'
import { useCreateBookStore } from '@/stores/use-create-book-store'
import handleObject from '@/utils/handleObject'
import { debounce, isEmpty } from 'lodash-es'
import { CircleArrowUpIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import ListQuiz from './list-quiz'
import QuizDetailLoading from './loading'
import QuizDetailHeader from './header'
type QuizDetailMainProps = {
  userInfoId: string
}
export default function QuizDetailMain({ userInfoId }: QuizDetailMainProps) {
  const { examId } = useParams()
  const { apolloWithAuth } = useApollo()
  const { dataBook, setBook, setImageBook, isRefresh } = useCreateBookStore()
  const listRef = useRef<HTMLDivElement>(null)
  const [exam_questions, setExam_questions] = useState<any[]>([])
  const [keyword, setKeyword] = useState<string>('')
  const [loadingExam, setLoadingExam] = useState<boolean>(true)
  const [searchLoading, setSearchLoading] = useState<boolean>(false)
  const [dataExam, setDataExam] = useState<any>(null)
  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false)
  const scrollToTopPosition = useRef<number>(266)
  const headerRef = useRef<HTMLDivElement | null>(null)
  const [isHeaderOut, setIsHeaderOut] = useState(false)
  const [listQuestionFilter, setListQuestionFilter] =
    useState<GetExamsQueryVariables>({
      ...initExamsFilter,
      where: {
        is_deleted: {
          _eq: false
        }
      }
    })
  const [getFileQuery] = useGetFileLazyQuery({})

  useEffect(() => {
    setListQuestionFilter((prevState) => ({
      ...prevState,
      offset_question: 0
    }))
    setExam_questions([])
    setSearchLoading(true)
    setLoadingExam(true)
  }, [keyword])

  const handleFetch = async () => {
    const res = await getFileQuery({
      variables: {
        file_key: dataBook.imageUrl || ''
      }
    })
    setImageBook(res?.data?.get_file?.url)
  }

  const fetchDetailQuiz = async () => {
    if (!apolloWithAuth) {
      setLoadingExam(false)
      setSearchLoading(false)
      return
    }
    try {
      const examQuery = handleObject().addMultipleKeys(initExamsFilter, {
        'where_question.question.name._ilike': `%${keyword}%`,
        'where.id._eq': examId,
        limit_question: listQuestionFilter.limit_question,
        offset_question: listQuestionFilter.offset_question
      })
      const { data } = await apolloWithAuth.query<GetExamsQueryHookResult>({
        query: GetExamsDocument,
        fetchPolicy: 'no-cache',
        variables: {
          ...examQuery
        }
      })
      setDataExam(data)
      setTimeout(() => {
        setSearchLoading(false)
        setLoadingExam(false)
      }, 500)
      return data
    } catch (error) {
      console.error(error)
      setSearchLoading(false)
      setLoadingExam(false)
      return null
    } finally {
      setLoadingExam(false)
    }
  }

  const handleScroll = useMemo(
    () =>
      debounce(() => {
        const scrollTop = listRef.current?.scrollTop ?? 0
        const shouldShowButton = scrollTop >= scrollToTopPosition.current
        setShowScrollToTop(shouldShowButton)
      }, 100),
    []
  )

  useEffect(() => {
    const div = listRef.current
    if (div) {
      div.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (div) {
        div.removeEventListener('scroll', handleScroll)
        handleScroll.cancel()
      }
    }
  }, [handleScroll])

  useEffect(() => {
    if (apolloWithAuth && examId) {
      fetchDetailQuiz()
    }
    listRef.current?.scrollTo({ top: 0 })
  }, [isRefresh, examId, apolloWithAuth, keyword, listQuestionFilter])

  useEffect(() => {
    if (dataExam?.exams[0]) {
      const newQuestions = dataExam.exams[0].exam_questions || []
      setExam_questions(newQuestions)
      const authors =
        dataExam.exams[0]?.materials?.material_detail?.material_creators.filter(
          (item: any) => item.type === 'author'
        )
      const editors =
        dataExam.exams[0]?.materials?.material_detail?.material_creators.filter(
          (item: any) => item.type === 'editor'
        )
      const translators =
        dataExam.exams[0]?.materials?.material_detail?.material_creators.filter(
          (item: any) => item.type === 'translator'
        )
      setBook({
        ...dataBook,
        title: dataExam?.exams[0].materials?.title,
        description: dataExam?.exams[0].materials?.description,
        relatedKeywords: !isEmpty(dataExam?.exams[0]?.materials?.material_tags)
          ? dataExam?.exams[0]?.materials?.material_tags.map(
              (item: any) => item.tags
            )
          : [],
        status: dataExam?.exams[0].materials?.status,
        imageUrl: dataExam?.exams[0].materials?.thumbnail,
        subjectId: dataExam?.exams[0].materials?.material_detail?.subject?.id,
        grade_id: dataExam?.exams[0].materials?.material_detail?.grade?.id,
        thumbnail: dataExam?.exams[0].materials?.material_thumbnails?.url,
        language_id:
          dataExam?.exams[0].materials?.material_detail?.language?.id,
        level: dataExam?.exams[0].materials?.material_detail?.levels?.id,
        authorName: authors?.map((item: any) => item.name),
        translatorName: translators?.map((item: any) => item.name),
        compilerName: editors?.map((item: any) => item.name),
        published_year:
          dataExam?.exams[0]?.materials?.material_detail?.published_year,
        source: dataExam?.exams[0]?.materials?.material_sources?.map(
          (item: any) => item.name
        )
      })
    }
  }, [isRefresh, dataExam])

  useEffect(() => {
    if (dataBook.imageUrl) {
      handleFetch()
    }
  }, [dataBook.imageUrl])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsHeaderOut(!entry.isIntersecting)
        }
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: '0px'
      }
    )

    if (headerRef.current) {
      observer.observe(headerRef.current)
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const el = document.getElementById('main-header')

    if (el) {
      if (isHeaderOut) {
        el.style.position = 'fixed'
        el.style.zIndex = '50'
        el.style.top = '0'
        el.style.left = '0'
        el.style.right = '0'
      } else {
        el.style.position = ''
        el.style.zIndex = ''
        el.style.top = ''
        el.style.left = ''
        el.style.right = ''
      }
    }
    return () => {
      if (el) {
        el.style.position = ''
        el.style.zIndex = ''
        el.style.top = ''
        el.style.left = ''
        el.style.right = ''
      }
    }
  }, [isHeaderOut])

  return (
    <Main className="p-0 min-h-screen">
      <div ref={headerRef}>
        {loadingExam ? (
          <QuizDetailLoading />
        ) : (
          <QuizDetailHeader dataExam={dataExam} />
        )}
      </div>

      <div className="flex w-full relative bg-gray-200">
        <div
          id="quiz-detail-sidebar"
          className={cn(
            'transition-all duration-300 ease-in-out',
            loadingExam ? 'opacity-0 invisible' : 'opacity-100 visible',
            isHeaderOut
              ? 'fixed top-[72px] left-0 w-64 z-50 bg-gray-100'
              : 'relative w-64'
          )}
        >
          <AppSidebar fixed={false} />
        </div>
        {isHeaderOut && <div className="w-64 shrink-0" aria-hidden />}
        <div id="quiz-detail-content" className="flex-1 pl-6 transition-all">
          <div ref={listRef} className="flex flex-col gap-6">
            <ListQuiz
              userInfoId={userInfoId}
              examId={examId}
              exam_questions={exam_questions}
              onKeywordChange={setKeyword}
              loadingExam={loadingExam}
              searchLoading={searchLoading}
              refetchExams={fetchDetailQuiz}
            />
          </div>
        </div>
      </div>

      <button
        className={cn(
          'fixed bottom-8 right-8 p-2 bg-blue-800 text-white rounded-full shadow-md transition-opacity duration-300 z-[50]',
          showScrollToTop
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
        onClick={() =>
          listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        }
      >
        <CircleArrowUpIcon className="w-6 h-6" />
      </button>
    </Main>
  )
}
