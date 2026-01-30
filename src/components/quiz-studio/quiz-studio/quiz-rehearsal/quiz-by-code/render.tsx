import { useDoQuizStore } from '@/stores/use-do-quiz-store'
import { QUIZ_CATEGORY_CODE } from '@/types/quiz-studio'
import { memo, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import Matching from '../quiz-types/matching'
import { isEmpty } from 'lodash-es'
import DragDrop from '../quiz-types/fill-drag-drop/drag-box'
import Choice from '../quiz-types/choice'
import Sticker from '../quiz-types/sticker'
import Essay from '../quiz-types/essay'
import Fill from '../quiz-types/fill-drag-drop/fill-box'
import { QuizImageLabelAnswer } from '@/types/quiz-create'
import { QuizMediaResponse } from '../quiz-types/quiz-media-response'
import useQuizStudioEditor from '@/hooks/use-quiz-studio-editor'
import { convertQuillToString } from '@/utils/convertQuillToString'
import DropBox from '../quiz-types/fill-drag-drop/drop-box'
import useDoQuiz from '../_hooks/useDoQuiz'
import { getUserInfoFromCookie } from '@/server-action/auth'

type Props = {
  questionId: string
  categoryCode: QUIZ_CATEGORY_CODE
  isActive: boolean
  previewProps?: Record<string, any>
}

const Render = ({
  questionId,
  categoryCode,
  isActive,
  previewProps
}: Props) => {
  const { answers, results } = useDoQuizStore(
    useShallow((state) => ({
      answers: state.answers,
      results: state.results
    }))
  )
  const { activeQuestionResult } = useDoQuiz()
  const { collectFillDragDrop } = useQuizStudioEditor()
  const addOrUpdateAnswers = (payload: any) => {
    useDoQuizStore.setState((state) => {
      const hasAnswer = state.answers?.some((item) => item?.id === questionId)
      let newAnswers
      if (hasAnswer) {
        newAnswers = state.answers?.map((item) =>
          item?.id === questionId
            ? {
                id: item?.id,
                questionId,
                payload
              }
            : item
        )
      } else {
        newAnswers = [
          ...state.answers,
          {
            id: questionId,
            questionId,
            payload
          }
        ]
      }
      state.answers = newAnswers
    })
  }
  const handleChangeAnswer = useCallback(
    async (payload: any) => {
      const userInfoId = await getUserInfoFromCookie()
      if (!userInfoId) return
      let convertPayload
      if (categoryCode === QUIZ_CATEGORY_CODE.STICKER) {
        convertPayload = payload
          ?.filter((item: QuizImageLabelAnswer) => item?.hotspotsId)
          ?.map((item: any) => ({
            category_code: QUIZ_CATEGORY_CODE.STICKER,
            question_id: questionId,
            hotspots_id: item?.hotspotsId,
            alignment: item?.alignment,
            left: item?.left,
            top: item?.top,
            fill_order: item?.fillOrder
          }))
      }

      if (categoryCode === QUIZ_CATEGORY_CODE.MATCHING) {
        const flatMap = payload.flatMap((item: any) => {
          return item.child
        })
        const fomatArray = flatMap.filter((item: any) => {
          return !isEmpty(item.item_drop)
        })
        const finalArray = fomatArray.map((item: any) => {
          return {
            ...item,
            question_id: questionId,
            hotspots_id: item?.id,
            user_id: userInfoId,
            item_drop: {
              ...item.item_drop,
              question_id: questionId,
              hotspots_id: item.item_drop.id,
              user_id: userInfoId
            }
          }
        })
        convertPayload = finalArray
      }

      if (
        categoryCode === QUIZ_CATEGORY_CODE.FILL_IN_THE_BLANK ||
        categoryCode === QUIZ_CATEGORY_CODE.DRAG_AND_DROP ||
        categoryCode === QUIZ_CATEGORY_CODE.DROP_BOX
      ) {
        const getAllNodeFillDragDrop = collectFillDragDrop(payload)
        const getAllAttrs = getAllNodeFillDragDrop.map((x: any) => {
          return x.attrs
        })
        const formatAnswerContent = getAllAttrs.map((x: any) => {
          if (x.item_drop) {
            return {
              ...x,
              user_id: userInfoId,
              question_id: questionId,
              hotspots_id: x.id,
              content: convertQuillToString(x.content),
              item_drop: {
                ...x.item_drop,
                user_id: userInfoId,
                question_id: questionId,
                hotspots_id: x.id,
                content: convertQuillToString(x.item_drop.content)
              }
            }
          } else {
            return { ...x }
          }
        })
        convertPayload = formatAnswerContent.filter((x: any) => {
          return x.item_drop?.content !== ''
        })
      }

      if (
        categoryCode === QUIZ_CATEGORY_CODE.SINGLE_CHOICE ||
        categoryCode === QUIZ_CATEGORY_CODE.MULTIPLE_ANSWERS
      ) {
        convertPayload = payload?.map((item: any) => ({
          category_code: categoryCode,
          question_id: questionId,
          hotspots_id: item?.hotspots_id
        }))
      }
      if (categoryCode === QUIZ_CATEGORY_CODE.ESSAY) {
        convertPayload = {
          category_code: categoryCode,
          content: payload,
          question_id: questionId
        }
      }
      if (
        categoryCode === QUIZ_CATEGORY_CODE.AUDIO_RESPONSE ||
        categoryCode === QUIZ_CATEGORY_CODE.VIDEO_RESPONSE
      ) {
        convertPayload = {
          category_code: categoryCode,
          asset_url: payload,
          question_id: questionId
        }
      }
      addOrUpdateAnswers(convertPayload)
    },
    [questionId, categoryCode, results]
  )
  const renderContent = useMemo(() => {
    const commonWrapperClass = 'h-full overflow-y-auto py-3 flex justify-center'
    const commonInnerClass = 'w-full md:w-[90%] lg:w-1/2'

    if (categoryCode === QUIZ_CATEGORY_CODE.STICKER) {
      return (
        <div className={commonWrapperClass}>
          <div className={commonInnerClass}>
            <Sticker
              imageUrl={previewProps?.imageUrl}
              questionsHotpots={previewProps?.questionsHotpots}
              originMediaWidth={previewProps?.originMediaWidth}
              answerPositions={previewProps?.answerPositions}
              containerClass="h-full"
              onChange={handleChangeAnswer}
              isCorrect={results?.get(questionId)?.isCorrect}
              externalAnswers={
                answers?.find((item) => item?.id === questionId)?.payload
              }
            />
          </div>
        </div>
      )
    }

    if (categoryCode === QUIZ_CATEGORY_CODE.MATCHING) {
      return (
        <div className={commonWrapperClass}>
          <div className={'w-full lg:w-1/2'}>
            <Matching
              item={previewProps}
              handleJSONChange={handleChangeAnswer}
              results={results?.get(questionId)?.response}
              externalAnswers={
                answers?.find((item) => item?.id === questionId)?.payload
              }
            />
          </div>
        </div>
      )
    }

    if (
      categoryCode === QUIZ_CATEGORY_CODE.SINGLE_CHOICE ||
      categoryCode === QUIZ_CATEGORY_CODE.MULTIPLE_ANSWERS
    ) {
      return (
        <div className={commonWrapperClass}>
          <div className={commonInnerClass}>
            <Choice
              hotspots={previewProps?.hotspots}
              isMultiple={categoryCode === QUIZ_CATEGORY_CODE.MULTIPLE_ANSWERS}
              onChange={handleChangeAnswer}
              isCorrect={results?.get(questionId)?.isCorrect}
              externalAnswers={
                answers?.find((item) => item?.id === questionId)?.payload
              }
            />
          </div>
        </div>
      )
    }

    if (categoryCode === QUIZ_CATEGORY_CODE.ESSAY) {
      return (
        <div className={commonWrapperClass}>
          <div className={commonInnerClass}>
            <Essay
              handleEssayChange={handleChangeAnswer}
              externalAnswer={
                answers?.find((item) => item?.id === questionId)?.payload
                  ?.content
              }
            />
          </div>
        </div>
      )
    }

    if (categoryCode === QUIZ_CATEGORY_CODE.DRAG_AND_DROP) {
      return (
        <div className={commonWrapperClass}>
          <div className={'w-full lg:w-1/2'}>
            <DragDrop
              item={previewProps}
              handleJSONChange={handleChangeAnswer}
              results={results?.get(questionId)?.response}
              isCorrect={
                activeQuestionResult
                  ? activeQuestionResult.isCorrect
                  : undefined
              }
              externalAnswers={
                answers?.find((item) => item?.id === questionId)?.payload
              }
            />
          </div>
        </div>
      )
    }

    if (categoryCode === QUIZ_CATEGORY_CODE.FILL_IN_THE_BLANK) {
      return (
        <div className={commonWrapperClass}>
          <div className={'w-full lg:w-1/2'}>
            <Fill
              item={previewProps}
              handleJSONChange={handleChangeAnswer}
              results={results?.get(questionId)?.response}
              isCorrect={
                activeQuestionResult
                  ? activeQuestionResult.isCorrect
                  : undefined
              }
              externalAnswers={
                answers?.find((item) => item?.id === questionId)?.payload
              }
            />
          </div>
        </div>
      )
    }

    if (categoryCode === QUIZ_CATEGORY_CODE.DROP_BOX) {
      return (
        <div className={commonWrapperClass}>
          <div className={'w-full lg:w-1/2'}>
            <DropBox
              item={previewProps}
              handleJSONChange={handleChangeAnswer}
              results={results?.get(questionId)?.response}
              isCorrect={
                activeQuestionResult
                  ? activeQuestionResult.isCorrect
                  : undefined
              }
              externalAnswers={
                answers?.find((item) => item?.id === questionId)?.payload
              }
            />
          </div>
        </div>
      )
    }

    if (
      categoryCode === QUIZ_CATEGORY_CODE.VIDEO_RESPONSE ||
      categoryCode === QUIZ_CATEGORY_CODE.AUDIO_RESPONSE
    ) {
      return (
        <div className={commonWrapperClass}>
          <div className={commonInnerClass}>
            <QuizMediaResponse
              item={previewProps}
              handleJSONChange={(value: any) => handleChangeAnswer(value)}
              checkRecording={(value: boolean) => {
                if (value) {
                  useDoQuizStore.setState({
                    isQuizStopped: true
                  })
                } else {
                  useDoQuizStore.setState({
                    isQuizStopped: false
                  })
                }
              }}
            />
          </div>
        </div>
      )
    }

    return null
  }, [categoryCode, previewProps, questionId, answers, results])
  return (
    <div
      className={cn('hidden w-full h-full bg-white', {
        block: isActive
      })}
    >
      {renderContent}
    </div>
  )
}

export default memo(Render)
