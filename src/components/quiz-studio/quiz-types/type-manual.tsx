'use client'
import { useApollo } from '@/app/apollo/apolloClient'
import { Skeleton } from '@/components/ui/skeleton'
import {
  GetAllQuestionCategoriesDocument,
  GetAllQuestionCategoriesQuery
} from '@/graphql/generated'
import { cn } from '@/lib/utils'
import {
  ALLOWED_QUIZ_TYPES,
  LIST_QUIZ_CODE_CONFIG
} from '@/mock-data/quiz-studio/quiz-types'
import { useQuizFormStudioStore } from '@/stores/use-quiz-studio-store'
import { QUIZ_TYPE } from '@/types/quiz-studio'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Manual() {
  const searchParams = useSearchParams()
  const { apolloWithAuth } = useApollo()
  const typeUrl = searchParams.get('type')
  const quizIdUrl = searchParams.get('examId')
  const statusParams = searchParams.get('status')
  const codeTypeParams = searchParams.get('codeType')
  const idBookParams = searchParams.get('idBook')
  const {
    objQuizFormStudio,
    setNavListTypeQuiz,
    setObjQuizFormStudio,
    setObjAnswerContent,
    setIdAnswerDelete,
    setArrayQuizzAnswers,
    setArrayQuizzFalseAnswers,
    setArrayQuizzExistAnswers
  } = useQuizFormStudioStore()
  const [listQuizTypeApi, setListQuizTypeApi] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [activeQuizTypesState] = useState<any[]>(ALLOWED_QUIZ_TYPES)

  const fetchListQuizType = async () => {
    if (!apolloWithAuth) return
    setLoading(true)
    try {
      const { data } =
        await apolloWithAuth.query<GetAllQuestionCategoriesQuery>({
          query: GetAllQuestionCategoriesDocument,
          variables: {
            filter: {
              parent_id: {
                _is_null: true
              }
            }
          }
        })
      if (data) {
        setListQuizTypeApi(data.question_categories)
        setLoading(false)
        const newData = data.question_categories
          .flatMap((item: any) => item.children)
          .map((item: any) => {
            return {
              ...item,
              value: item.id
            }
          })
        setNavListTypeQuiz(newData)
      }
    } catch (error) {
      setLoading(false)
      console.error(error)
    }
  }

  const handleRenderIcon = (code: string) => {
    const targetChild = LIST_QUIZ_CODE_CONFIG.flatMap(
      (item: any) => item.children
    ).find((child: any) => child.code === code)
    if (targetChild) {
      const icon = targetChild.icon
      if (typeof icon !== 'string') {
        const color = handleRenderIconColors(code)
        return (
          <span
            className="w-8 h-8 border rounded-full p-1 flex items-center justify-center"
            style={{ backgroundColor: color.bg, borderColor: color.border }}
          >
            <span
              className="block rounded-full p-1 relative z-[3]"
              style={{ backgroundColor: color.iconBg }}
            >
              <span className="w-4 h-4 flex items-center justify-center text-white">
                {icon}
              </span>
            </span>
          </span>
        )
      } else {
        return (
          <Image
            src={icon}
            width={38}
            height={38}
            alt={'icon'}
            className="w-auto h-auto"
          />
        )
      }
    }
    return ''
  }

  const handleRenderIconColors = (code: string) => {
    const parentItem = LIST_QUIZ_CODE_CONFIG.find((item) =>
      item.children.some((child) => child.code === code)
    )
    if (parentItem) {
      return {
        bg: parentItem.bg,
        border: parentItem.border,
        iconBg: parentItem.iconBg
      }
    }
    return {}
  }

  useEffect(() => {
    if (typeUrl && apolloWithAuth) {
      // reset store all form quiz
      setObjAnswerContent({})
      setIdAnswerDelete('')
      setArrayQuizzAnswers([])
      setArrayQuizzFalseAnswers([])
      setArrayQuizzExistAnswers([])
      fetchListQuizType()
    }
  }, [typeUrl, apolloWithAuth])

  return (
    <div className="overflow-y-auto h-full no-scrollbar">
      <div className="flex flex-col gap-4 md:gap-8">
        {!loading &&
          listQuizTypeApi?.map((group: any, index: number) => {
            const { name, children } = group
            return (
              <div
                key={index + 1}
                className="border rounded-lg overflow-hidden"
              >
                <p className="font-semibold py-3 px-4 text-md bg-gray-50">
                  {name}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 p-4 gap-4 md:gap-8">
                  {children?.map((quiz: any, indexChild: number) => {
                    const { code, name, id, children } = quiz
                    return (
                      <Link
                        href={`/quiz-form?code=${code}&examId=${quizIdUrl}&idBook=${idBookParams}&status=${statusParams}&codeType=${codeTypeParams}`}
                        key={indexChild + 1}
                        className={cn(
                          'flex gap-2 items-center justify-start text-md font-medium border border-transparent hover:bg-gray-100 transition-all rounded-md',
                          !activeQuizTypesState.includes(code) &&
                            'opacity-50 pointer-events-none cursor-not-allowed'
                        )}
                        onClick={() => {
                          if (code === QUIZ_TYPE.multiple_choice) {
                            setObjQuizFormStudio({
                              ...objQuizFormStudio,
                              category_id: children[0].id,
                              code: children[0].code
                            })
                          } else {
                            setObjQuizFormStudio({
                              ...objQuizFormStudio,
                              category_id: id,
                              code: code
                            })
                          }
                        }}
                      >
                        {handleRenderIcon(code)}
                        <span>{name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        {loading && (
          <>
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-full h-24" />
          </>
        )}
        {!loading && listQuizTypeApi?.length === 0 && (
          <p className="text-center">Không có dữ liệu</p>
        )}
      </div>
    </div>
  )
}
