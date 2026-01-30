import { useBookSidebarStore } from '@/stores/use-book-sidebar-store'
import { useDoQuizStore } from '@/stores/use-do-quiz-store'
import { useListChatMessagesStore } from '@/stores/use-list-chat-messages-store'
import { QUIZ_CATEGORY_CODE } from '@/types/quiz-studio'
import { groupBy } from 'lodash-es'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

export default function useQuizChatbot() {
  const setMetadata = useListChatMessagesStore((state) => state.setMetadata)
  const setStatus = useBookSidebarStore((state) => state.setStatus)

  const { questions, activeQuestionId, answers } = useDoQuizStore(
    useShallow((state) => ({
      questions: state.questions,
      activeQuestionId: state.activeQuestionId,
      answers: state.answers
    }))
  )

  const activeQuestion = useMemo(() => {
    const result = questions?.find((item) => item?.id === activeQuestionId)
    return result
  }, [questions, activeQuestionId])

  const handleSendAnswerChatBot = () => {
    if (activeQuestion?.categoryCode === QUIZ_CATEGORY_CODE.ESSAY) {
      const imageData = activeQuestion?.fileUrl
        ? { content: activeQuestion.fileUrl }
        : null
      setMetadata({
        type: 'wrong_answer',
        user_answer_quiz: {
          is_correct: false,
          type: activeQuestion?.categoryCode || '',
          question: { content: activeQuestion?.name || '' },
          image: imageData || undefined,
          user_answer: {
            choice: [],
            content: answers[0]?.payload.content
          },
          quiz_id: activeQuestionId
        }
      })
    }

    if (
      activeQuestion?.categoryCode === QUIZ_CATEGORY_CODE.SINGLE_CHOICE ||
      activeQuestion?.categoryCode === QUIZ_CATEGORY_CODE.MULTIPLE_CHOICE ||
      activeQuestion?.categoryCode === QUIZ_CATEGORY_CODE.MULTIPLE_ANSWERS
    ) {
      const payload = answers?.find(
        (item) => item?.questionId === activeQuestionId
      )?.payload
      const choiceIndexs: any = []
      const quizMainChoices = activeQuestion.previewProps?.hotspots
      payload.forEach((select: any) => {
        const matchedIndex = quizMainChoices.findIndex(
          (item: any) => item.id === select.hotspots_id
        )
        if (matchedIndex >= 0) {
          choiceIndexs.push(matchedIndex)
        }
      })
      const imageData = activeQuestion?.fileUrl
        ? { content: activeQuestion.fileUrl }
        : null

      setMetadata({
        type: 'wrong_answer',
        user_answer_quiz: {
          is_correct: false,
          type: activeQuestion?.categoryCode || '',
          question: { content: activeQuestion?.name || '' },
          image: imageData || undefined,
          user_answer: { content: '', choice: choiceIndexs },
          quiz_id: activeQuestionId
        }
      })
    }
    if (activeQuestion?.categoryCode === QUIZ_CATEGORY_CODE.DROP_BOX) {
      const payload = answers?.find(
        (item) => item?.questionId === activeQuestionId
      )?.payload
      const questionsHotspots =
        activeQuestion.previewProps?.questions_hotspots || []
      const sortedQuizMainChoices = [...questionsHotspots]
        .sort((a: any, b: any) => a.fill_order - b.fill_order)
        .filter((x: any) => {
          return x.children && x.children.length > 0
        })
        .map((x: any) => {
          const newChildren = [...x.children].sort((a, b) => {
            if (a.is_correct) return -1
            if (b.is_correct) return 1
            return 0
          })
          return {
            ...x,
            children: [...newChildren]
          }
        })
      const choiceContents: string[] = new Array(
        sortedQuizMainChoices.length
      ).fill('')
      payload.forEach((select: any) => {
        const matchedChoice = sortedQuizMainChoices
          .flatMap((choice: any) => choice.children)
          .find((item: any) => item.id === select.item_drop?.answer_id)
        if (matchedChoice) {
          const parentChoice = sortedQuizMainChoices.find((choice: any) =>
            choice.children.some((child: any) => child.id === matchedChoice.id)
          )

          if (parentChoice) {
            const index = parentChoice.fill_order - 1
            choiceContents[index] = matchedChoice.content
          }
        }
      })
      const availableChoices: { [key: string]: string[] } = {}
      sortedQuizMainChoices.forEach((item: any) => {
        item.children.map((child: any) => {
          const blankKey = `blank_${child.fill_order}`
          if (!availableChoices[blankKey]) {
            availableChoices[blankKey] = []
          }
          availableChoices[blankKey].push(child.content)
        })
      })
      const formatQuestionName = (quesionName: string) => {
        if (!quesionName) return '<blank_1>'
        let formattedName = quesionName
        let index = 1
        formattedName = formattedName.replace(/<fill-drag-drop[^>]*>/g, () => {
          return `<blank_${index++}>`
        })
        formattedName = formattedName.replace(
          /<math-inline[^>]*>(.*?)<\/math-inline>/g,
          (_, content) => {
            const match = content.match(/\\cfrac\{.*?\}\{.*?\}/)
            return match ? match[0] : ''
          }
        )

        return formattedName
      }

      const imageData = activeQuestion?.fileUrl
        ? { content: activeQuestion.fileUrl }
        : null
      const userAnswerQuiz = {
        is_correct: false,
        type: activeQuestion?.categoryCode || '',
        image: imageData || undefined,
        question: { content: formatQuestionName(activeQuestion?.name) },
        available_choices: availableChoices,
        user_answer: { content: choiceContents },
        quiz_id: activeQuestionId
      }
      setMetadata({
        type: 'wrong_answer',
        user_answer_quiz: userAnswerQuiz
      })
    }
    if (activeQuestion?.categoryCode === QUIZ_CATEGORY_CODE.MATCHING) {
      const payload = answers?.find(
        (item) => item?.questionId === activeQuestionId
      )?.payload
      const quizMainChoices = activeQuestion.previewProps?.questions_hotspots
      const leftChoices = [...(quizMainChoices || [])]
        .filter((item: any) => item.left === 0)
        .sort((a: any, b: any) => a.label?.localeCompare(b.label))
      const rightChoices = [...(quizMainChoices || [])]
        .filter((item: any) => item.left === 1)
        .sort((a: any, b: any) => a.label?.localeCompare(b.label))
      const choiceContents: [string, string][] = []
      leftChoices.forEach((leftChoice: any) => {
        const matchedAnswer = payload.find(
          (select: any) => select.hotspots_id === leftChoice.id
        )

        if (matchedAnswer && matchedAnswer.item_drop) {
          const rightChoice = quizMainChoices.find(
            (item: any) => item.id === matchedAnswer.item_drop.id
          )
          const pair: [string, string] = [
            leftChoice.content,
            rightChoice?.content || ''
          ]
          choiceContents.push(pair)
        }
      })
      const availableChoices: { [key: string]: string[] } = {}

      if (leftChoices.length > 0) {
        availableChoices['list 1'] = leftChoices.map(
          (item: any) => item.content
        )
      }

      if (rightChoices.length > 0) {
        availableChoices['list 2'] = rightChoices.map(
          (item: any) => item.content
        )
      }
      const formatQuestionName = (questionName: string): string => {
        if (!questionName || typeof questionName !== 'string') return ''
        const cleaned = questionName.replace(
          /<math-inline[^>]*>([\s\S]*?)<\/math-inline>/g,
          (_, latexContent: string) => latexContent.trim()
        )
        return cleaned
      }

      const imageData = activeQuestion?.fileUrl
        ? { content: activeQuestion.fileUrl }
        : null

      setMetadata({
        type: 'wrong_answer',
        user_answer_quiz: {
          is_correct: false,
          type: activeQuestion?.categoryCode || '',
          image: imageData || undefined,
          question: { content: formatQuestionName(activeQuestion?.name || '') },
          available_choices: availableChoices,
          user_answer: { content: choiceContents },
          quiz_id: activeQuestionId
        }
      })
    }
    if (activeQuestion?.categoryCode === QUIZ_CATEGORY_CODE.FILL_IN_THE_BLANK) {
      const choiceContents: string[] = []

      const formatQuestionName = (questionName: string) => {
        if (!questionName) return '<blank_1>'
        let index = 1
        let formatted = questionName.replace(
          /<fill-drag-drop[^>]*>.*?<\/fill-drag-drop>/g,
          () => `<blank_${index++}>`
        )
        formatted = formatted.replace(
          /<math-inline[^>]*>(.*?)<\/math-inline>/g,
          (_, content) => {
            const match = content.match(/\\cfrac{.*?}{.*?}/)
            return match ? match[0] : ''
          }
        )

        return formatted
      }

      setMetadata({
        type: 'wrong_answer',
        user_answer_quiz: {
          is_correct: false,
          type: activeQuestion?.categoryCode || '',
          question: { content: formatQuestionName(activeQuestion?.name) },
          user_answer: { content: choiceContents },
          quiz_id: activeQuestionId
        }
      })
    }
    if (activeQuestion?.categoryCode === QUIZ_CATEGORY_CODE.DRAG_AND_DROP) {
      const payload = answers?.find(
        (item) => item?.questionId === activeQuestionId
      )?.payload
      const quizMainChoices = activeQuestion.previewProps?.questions_hotspots
      const sortedQuizMainChoices = [...(quizMainChoices || [])].sort(
        (a: any, b: any) => a.fill_order - b.fill_order
      )
      const choiceContents: string[] = new Array(
        sortedQuizMainChoices?.length || 0
      ).fill('')
      payload.forEach((select: any) => {
        if (select?.item_drop) {
          const matchedHotspot = sortedQuizMainChoices.find(
            (hotspot: any) => hotspot.id === select.hotspots_id
          )
          if (matchedHotspot) {
            const index = matchedHotspot.fill_order - 1
            choiceContents[index] = select.item_drop.content
          }
        }
      })
      const formatQuestionName = (questionName: string): string => {
        if (!questionName) return '<blank_1>'
        let index = 1
        let formatted = questionName.replace(
          /<fill-drag-drop[^>]*>[\s\S]*?<\/fill-drag-drop>/g,
          () => `<blank_${index++}>`
        )
        formatted = formatted.replace(
          /<math-inline[^>]*>([\s\S]*?)<\/math-inline>/g,
          (_, content: string) => content.trim()
        )
        return formatted
      }

      const availableChoices: string[] = []
      quizMainChoices.forEach((item: any) => {
        availableChoices.push(item.content)
      })

      const imageData = activeQuestion?.fileUrl
        ? { content: activeQuestion.fileUrl }
        : null
      setMetadata({
        type: 'wrong_answer',
        user_answer_quiz: {
          is_correct: false,
          type: activeQuestion?.categoryCode || '',
          image: imageData || undefined,
          question: { content: formatQuestionName(activeQuestion?.name) },
          available_choices: availableChoices,
          user_answer: { content: choiceContents },
          quiz_id: activeQuestionId
        }
      })
    }
    if (activeQuestion?.categoryCode === QUIZ_CATEGORY_CODE.STICKER) {
      const payload = answers?.find(
        (item) => item?.questionId === activeQuestionId
      )?.payload
      const questionsHotpots = activeQuestion.previewProps?.questionsHotpots
      const questionsHotpotsGroupById = groupBy(questionsHotpots, 'id')
      const choiceContents = payload?.map(
        (item: any) =>
          questionsHotpotsGroupById[item?.hotspots_id]?.[0]?.content
      )
      const availableChoices = questionsHotpots?.map(
        (item: any) => item?.content
      )
      const bbox = payload?.map((item: any) => [item?.left, item?.top])

      const formatQuestionName = (questionName: string): string => {
        if (!questionName || typeof questionName !== 'string') return ''
        const cleaned = questionName.replace(
          /<math-inline[^>]*>([\s\S]*?)<\/math-inline>/g,
          (_, latexContent: string) => latexContent.trim()
        )
        return cleaned
      }

      const imageData = activeQuestion?.fileUrl
        ? { content: activeQuestion.fileUrl }
        : null
      setMetadata({
        type: 'wrong_answer',
        user_answer_quiz: {
          is_correct: false,
          type: activeQuestion?.categoryCode || '',
          image: imageData || undefined,
          question: { content: formatQuestionName(activeQuestion?.name || '') },
          available_choices: availableChoices,
          user_answer: { content: choiceContents },
          bbox,
          quiz_id: activeQuestionId
        }
      })
    }

    setStatus({ isShowChatbot: true })
  }

  return {
    handleSendAnswerChatBot
  }
}
