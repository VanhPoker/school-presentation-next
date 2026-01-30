import { useEffect, useState } from 'react'
import { QuizFormProps } from '../..'
import { useDebounceEffect } from '@/hooks/use-debounce-effect'
import { AssetState } from '@/mock-data/quiz-studio'
import { useSearchParams } from 'next/navigation'
import { QUIZ_TYPE } from '@/types/quiz-studio'
import { useQuizFormStudioStore } from '@/stores/use-quiz-studio-store'
import { isEmpty } from 'lodash-es'
import { cleanObject } from '@/helper/cleanObject'
import TopActionQuiz from '@/components/studio/tools/top-action-quiz/index'
import DragFalseAnswers from './drag-false-answers'
import FillDragAnswers from './fill-drag-answers'
import DropAnswers from './drop-answers'

export default function FillDragDropQuiz({
  quizzInfo,
  handleAddItemToQuizOne
}: QuizFormProps) {
  const {
    arrayQuizzAnswers,
    arrayQuizzFalseAnswers,
    idAnswerDelete,
    objAnswerContent,
    setArrayQuizzExistAnswers,
    setArrayQuizzAnswers,
    setArrayQuizzFalseAnswers
  } = useQuizFormStudioStore()
  const searchParams = useSearchParams()
  const codeUrl = searchParams.get('code')
  const [completedAutoSave, setCompletedAutoSave] = useState<number>(0)
  const [isDoneFetchDetail, setIsDoneFetchDetail] = useState<boolean>(false)
  const [quizzInfoState, setQuizzInfoState] = useState<AssetState>({
    name: '',
    content_preview: '',
    asset_type: '',
    asset_url: '',
    embedded_url: '',
    file_urls: {
      url: ''
    }
  })

  useEffect(() => {
    if (quizzInfo) {
      const {
        name,
        content_preview,
        asset_type,
        asset_url,
        embedded_url,
        file_urls,
        questions_hotspots
      } = quizzInfo
      let new_content_preview = ''
      let finalQuestionsHotspots: any[] | undefined = []
      const sortQuestionsHotspots = questions_hotspots?.data
        .map((x) => {
          return cleanObject({
            ...x,
            is_new: false
          })
        })
        .sort((a, b) => a.fill_order - b.fill_order)
      if (codeUrl === QUIZ_TYPE.drop_box) {
        const answersWithChildren = sortQuestionsHotspots
          ?.filter((x) => {
            return x.children && x.children.length > 0
          })
          .map((x) => {
            const newChildren = [...x.children].sort((a, b) => {
              if (a.is_correct) return -1
              if (b.is_correct) return 1
              return 0
            })
            x.children = [...newChildren]
            return x
          })
        finalQuestionsHotspots = answersWithChildren?.map((x) => {
          const data = [...x.children]
          x.children = {
            data: data.map((y) => {
              y.is_new = false
              return y
            })
          }
          return x
        })
      } else {
        finalQuestionsHotspots = sortQuestionsHotspots
      }
      if (finalQuestionsHotspots) {
        const is_correct_array =
          finalQuestionsHotspots.filter((x) => {
            return x.is_correct
          }) || []
        const is_in_correct_array =
          finalQuestionsHotspots.filter((x) => {
            return !x.is_correct
          }) || []
        setArrayQuizzAnswers(is_correct_array)
        setArrayQuizzExistAnswers(is_correct_array)
        setArrayQuizzFalseAnswers(is_in_correct_array)
      }
      if (content_preview) {
        const fomat_content_preview = JSON.parse(content_preview)
        const raw_content_preview = fomat_content_preview.map((block: any) => {
          if (block.content) {
            block.content = block.content.map((node: any) => {
              if (node.type === 'fill-drag-drop') {
                node.attrs.is_new = false
                const checkItem = finalQuestionsHotspots?.find((x) => {
                  return x.fill_order === node.attrs.fill_order
                })
                if (checkItem) {
                  node.attrs.id = checkItem.id
                }
              }
              return node
            })
          }
          return block
        })
        new_content_preview = JSON.stringify(raw_content_preview)
      }
      setQuizzInfoState({
        name: name || '',
        content_preview: new_content_preview,
        asset_type: asset_type || '',
        asset_url: asset_url || '',
        embedded_url: embedded_url || '',
        file_urls: file_urls || { url: '' }
      })
      setIsDoneFetchDetail(true)
    }
  }, [quizzInfo])

  useEffect(() => {
    if (quizzInfoState) {
      setCompletedAutoSave((x) => x + 1)
    }
  }, [quizzInfoState, arrayQuizzAnswers, arrayQuizzFalseAnswers])

  useDebounceEffect(
    async () => {
      if (completedAutoSave > 0) {
        const finalObj = {
          ...quizzInfoState,
          questions_hotspots: {
            data: [...arrayQuizzAnswers, ...arrayQuizzFalseAnswers]
          }
        }
        handleAddItemToQuizOne('', finalObj)
      }
    },
    500,
    [completedAutoSave]
  )

  useEffect(() => {
    if (!isEmpty(idAnswerDelete)) {
      const newArrayQuizzAnswers = arrayQuizzAnswers
        .filter((x) => {
          return x.id !== idAnswerDelete
        })
        .map((x, i) => {
          x.fill_order = i + 1
          return x
        })
      setArrayQuizzAnswers(newArrayQuizzAnswers)
    }
  }, [idAnswerDelete])

  useEffect(() => {
    if (!isEmpty(objAnswerContent)) {
      const newArrayQuizzAnswers = arrayQuizzAnswers.map((x) => {
        if (x.id === objAnswerContent.id) {
          x.content = objAnswerContent.content
        }
        return x
      })
      setArrayQuizzAnswers(newArrayQuizzAnswers)
    }
  }, [objAnswerContent])

  return (
    <>
      {/* Top Quiz */}
      <TopActionQuiz
        isDoneFetchDetail={isDoneFetchDetail}
        contentInfo={quizzInfoState}
        fill={true}
        handleAssetChange={(value) => {
          setQuizzInfoState((prev) => ({
            ...prev,
            ...value
          }))
        }}
      />

      {(codeUrl === QUIZ_TYPE.fill_in_the_blank ||
        codeUrl === QUIZ_TYPE.drag_and_drop) && <FillDragAnswers />}

      {codeUrl === QUIZ_TYPE.drag_and_drop && <DragFalseAnswers />}

      {codeUrl === QUIZ_TYPE.drop_box && <DropAnswers />}
    </>
  )
}
