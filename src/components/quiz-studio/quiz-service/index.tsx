import { toasts } from '@/components/ui/toast-color'
import { ARRAY_BORDER_INPUT_COLOR } from '@/mock-data/quiz-studio'
import { LIST_QUIZ_CODE_CONFIG } from '@/mock-data/quiz-studio/quiz-types'
import { getUserInfoFromCookie } from '@/server-action/auth'
import {
  Extended_Questions_Insert_Input,
  GroupedItem,
  QUIZ_TYPE
} from '@/types/quiz-studio'
import { isEmpty } from 'lodash-es'
import { nanoid } from 'nanoid'

export default function useQuizService() {
  const handleCheckQuiz = (
    objQuizFormStudio: Extended_Questions_Insert_Input,
    codeURL: string | null
  ) => {
    const name = objQuizFormStudio.name || ''
    const content_preview = objQuizFormStudio.content_preview
    const answers = objQuizFormStudio.questions_hotspots?.data || []

    if (name === '') {
      toasts.error('Không để trống tên câu hỏi')
      return false
    }
    if (codeURL === QUIZ_TYPE.essay) {
      const content = answers[0]?.content || ''
      if (content === '') {
        toasts.error('Chưa thêm đáp án cho câu hỏi')
        return false
      }
    }
    if (
      codeURL === QUIZ_TYPE.single_choice ||
      codeURL === QUIZ_TYPE.multiple_choice ||
      codeURL === QUIZ_TYPE.multiple_answers
    ) {
      const hasContent = answers.filter((x) => {
        return x.content || x.asset_url || x.embedded_url
      })
      const hasIsCorrect = answers.filter((x) => {
        return x.is_correct === true
      })
      if (!(hasContent.length > 1)) {
        toasts.error('Không để trống câu trả lời vui lòng kiểm tra lại')
        return false
      }
      if (hasIsCorrect.length < 1) {
        toasts.error('Ít nhất phải chọn 1 câu trả lời đúng')
        return false
      }
    }

    if (
      (codeURL === QUIZ_TYPE.fill_in_the_blank ||
        codeURL === QUIZ_TYPE.drag_and_drop ||
        codeURL === QUIZ_TYPE.drop_box) &&
      content_preview === ''
    ) {
      toasts.error('Không để trống tên câu hỏi')
      return false
    }

    if (codeURL === QUIZ_TYPE.drop_box) {
      const questionHotpotsData =
        objQuizFormStudio.questions_hotspots?.data || []
      let checkLength = false
      checkLength = questionHotpotsData?.every(
        (item) =>
          item?.children?.data &&
          item?.children?.data?.filter((x: any) => {
            return !x.is_deleted
          }).length < 3
      )
      if (checkLength) {
        toasts.error('Ít nhất phải có 3 lựa chọn cho mỗi chỗ trống')
        return false
      }
      let checkContent = false
      checkContent = questionHotpotsData.every(
        (item) =>
          item?.children?.data &&
          item?.children?.data
            .filter((x: any) => {
              return !x.is_deleted
            })
            .every((child) => child.content !== '')
      )
      if (!checkContent) {
        toasts.error('Không để trống các lựa chọn vui lòng kiểm tra lại')
        return false
      }
    }

    if (codeURL === QUIZ_TYPE.sticker) {
      if (!objQuizFormStudio.asset_url) {
        toasts.error('Không để trống ảnh câu hỏi')
        return false
      }
      const questionHotpotsData =
        objQuizFormStudio.questions_hotspots?.data || []
      if (
        questionHotpotsData?.length === 0 ||
        questionHotpotsData?.every((item) => item?.is_deleted)
      ) {
        toasts.error('Phải có ít nhất một đáp án cho câu hỏi')
        return false
      }
    }

    if (codeURL === QUIZ_TYPE.matching) {
      const hasEmptyItem = answers
        .map((item: any) => {
          let check = false
          if (
            isEmpty(item.content) &&
            isEmpty(item.asset_url) &&
            isEmpty(item.embedded_url)
          ) {
            check = true
          }
          return check
        })
        .filter((item: any) => {
          return item
        })

      if (hasEmptyItem.length > 0) {
        toasts.error('Không để trống câu trả lời vui lòng kiểm tra lại')
        return false
      }
    }
    return true
  }

  const handleFormatUnuseParam = (obj: any) => {
    delete obj.file_urls
    delete obj.is_new
    delete obj.is_render
    delete obj.id
    delete obj.quizId
    delete obj.item_drop
    delete obj.children
    delete obj.__typename
    return obj
  }

  const handleRenderPayloadEditQuiz = async (
    arrayAnswers: any[],
    quizIdFromUrl: string,
    existAnswers: Extended_Questions_Insert_Input[]
  ) => {
    const updated_by = await getUserInfoFromCookie()
    if (!updated_by) return
    const updated_at = new Date().toISOString()
    let hotspotsObj = []
    let hotspotsNewObj = []
    if (existAnswers.length > 0) {
      existAnswers.forEach((x) => {
        const checkItem = arrayAnswers.find((y) => {
          return y.id === x.id
        })
        if (!checkItem) {
          arrayAnswers.push({
            ...x,
            is_deleted: true,
            updated_by: updated_by,
            updated_at: updated_at
          })
        }
      })
    }
    hotspotsObj = arrayAnswers
      .filter((x) => {
        return !x.is_new
      })
      .map((x) => {
        const newObj = handleFormatUnuseParam({
          ...x,
          updated_by: updated_by,
          updated_at: updated_at
        })

        return {
          where: { id: { _eq: x.id } },
          _set: newObj
        }
      })
    hotspotsNewObj = arrayAnswers
      .filter((x) => {
        return x.is_new
      })
      .map((x) => {
        if (quizIdFromUrl) {
          return handleFormatUnuseParam({
            ...x,
            created_by: updated_by,
            created_at: updated_at,
            question_id: quizIdFromUrl
          })
        } else {
          return handleFormatUnuseParam({
            ...x,
            created_by: updated_by,
            created_at: updated_at
          })
        }
      })
    return {
      hotspotsObj: hotspotsObj,
      hotspotsNewObj: hotspotsNewObj
    }
  }

  const handleFormatAnwersDropBox = (newAnswers: any[]) => {
    const groupedAnswers = new Map()
    newAnswers.forEach((answer) => {
      const { fill_order } = answer
      if (!groupedAnswers.has(fill_order)) {
        groupedAnswers.set(fill_order, [])
      }
      groupedAnswers.get(fill_order).push(answer)
    })
    const answersByFillOrder = Array.from(groupedAnswers.values())
    return answersByFillOrder
  }

  return {
    handleCheckQuiz,
    handleFormatUnuseParam,
    handleRenderPayloadEditQuiz,
    handleFormatAnwersDropBox
  }
}

export const handleRenderInputColor = (index: number) => {
  const borderColor = ARRAY_BORDER_INPUT_COLOR[index]
  return borderColor
}

export const handleRenderCodeIcon = (codeURL: string | null) => {
  const itemParent = LIST_QUIZ_CODE_CONFIG.find((x: any) =>
    x.children.some((y: any) => y.code === codeURL)
  )
  if (itemParent) {
    const itemChild = itemParent.children.find((y: any) => y.code === codeURL)
    if (itemChild) {
      return itemChild.icon
    }
  }
  return null
}

export const handleRenderCodeName = (codeURL: string | null) => {
  const itemParent = LIST_QUIZ_CODE_CONFIG.find((x: any) =>
    x.children.some((y: any) => y.code === codeURL)
  )
  if (itemParent) {
    const itemChild = itemParent.children.find((y: any) => y.code === codeURL)
    if (itemChild) {
      return itemChild.name
    }
  }
  return null
}

export const handleGroupByString = (
  answers: Extended_Questions_Insert_Input[],
  match: string
) => {
  const sortAnswers = [...answers].sort(
    (a, b) => (a.order_number || 0) - (b.order_number || 0)
  )
  const groupBy: GroupedItem[] = Object.values(
    sortAnswers.reduce<Record<string, GroupedItem>>((acc: any, item: any) => {
      if (!acc[item[`${match}`]]) {
        acc[item[`${match}`]] = {
          id: nanoid(5),
          order_number: 0,
          is_new: false,
          is_deleted: false,
          child: []
        }
      }
      acc[item[`${match}`]]?.child.push({
        ...item,
        is_new: false,
        is_deleted: false
      })
      return acc
    }, {})
  )
  return groupBy.map((item: any) => {
    item.child = item.child.sort(
      (a: any, b: any) => (a.left || 0) - (b.left || 0)
    )
    return { ...item }
  })
}
