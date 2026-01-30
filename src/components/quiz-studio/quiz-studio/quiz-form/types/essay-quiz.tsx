import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import DialogAiJudge from '@/components/studio/modal/dialog-ai-judge'
import TopActionQuiz from '@/components/studio/tools/top-action-quiz/index'
import { QuizFormProps } from '..'
import { CircleHelpIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import InputAutoSpan from '@/components/ui/input-auto-span'
import { useDebounceEffect } from '@/hooks/use-debounce-effect'
import { AssetState } from '@/mock-data/quiz-studio'

export default function EssayQuiz({
  quizzInfo,
  arrQuizAnswers,
  handleAddItemToQuizOne
}: QuizFormProps) {
  const [completedAutoSave, setCompletedAutoSave] = useState<number>(0)
  const [settings, setSettings] = useState<any[] | undefined>([])
  const [isOpenAiJudge, setIsOpenAiJudge] = useState<boolean>(false)
  const [valuePopup, setValuePopup] = useState<any>()
  const [isDoneFetchDetail, setIsDoneFetchDetail] = useState<boolean>(false)
  const [quizzInfoState, setQuizzInfoState] = useState<AssetState>({
    name: '',
    asset_type: '',
    asset_url: '',
    embedded_url: '',
    file_urls: {
      url: ''
    }
  })
  const [quizzSettingState, setQuizzSettingState] = useState<any>({
    id: '',
    content: '',
    max_characters: 0,
    ai_content_review: ''
  })

  const handleChangeHotspots = (path: string, value: any) => {
    setQuizzSettingState({
      ...quizzSettingState,
      [path]: value
    })
    setSettings((prev) => {
      return prev?.map((x) => {
        if (x.path === path) {
          x[path] = value
          x.content = value
        }
        return x
      })
    })
  }

  useEffect(() => {
    if (quizzInfo) {
      setQuizzInfoState({
        name: quizzInfo.name || '',
        asset_type: quizzInfo.asset_type || '',
        asset_url: quizzInfo.asset_url || '',
        embedded_url: quizzInfo.embedded_url || '',
        file_urls: quizzInfo.file_urls || { url: '' }
      })
      const id = quizzInfo.questions_hotspots?.data[0]?.id || ''
      const content = quizzInfo.questions_hotspots?.data[0]?.content || ''
      const max_characters =
        quizzInfo.questions_hotspots?.data[0]?.max_characters || 0
      const ai_content_review =
        quizzInfo.questions_hotspots?.data[0]?.ai_content_review || ''
      setQuizzSettingState({
        id: id,
        content: content,
        max_characters: max_characters,
        ai_content_review: ai_content_review
      })
      setIsDoneFetchDetail(true)
    }

    if (arrQuizAnswers?.length) {
      setSettings(arrQuizAnswers)
    }
  }, [quizzInfo, arrQuizAnswers])

  useEffect(() => {
    if (quizzInfoState || quizzSettingState) {
      setCompletedAutoSave((x) => x + 1)
    }
  }, [quizzInfoState, quizzSettingState])

  useDebounceEffect(
    async () => {
      if (completedAutoSave > 0) {
        const finalObj = {
          ...quizzInfoState,
          questions_hotspots: {
            data: [quizzSettingState]
          }
        }
        handleAddItemToQuizOne('', finalObj)
      }
    },
    500,
    [completedAutoSave]
  )

  return (
    <>
      {/* Top Quiz */}
      <TopActionQuiz
        isDoneFetchDetail={isDoneFetchDetail}
        contentInfo={quizzInfoState}
        handleAssetChange={(value) => {
          setQuizzInfoState((prev) => ({
            ...prev,
            ...value
          }))
        }}
      />
      <div className="grid grid-cols-3 gap-4">
        {settings &&
          settings.map((x: any, i: number) => {
            const { content, description, id, path, title, disable } = x
            return (
              <div
                key={i + 1}
                className={cn(
                  'rounded-xl gap-4 items-center lg:text-base text-xs py-4 px-5 bg-white',
                  disable && 'opacity-50 pointer-events-none'
                )}
              >
                <div className="text-sm mb-6">
                  <p className="font-semibold flex items-center gap-1 text-gray-700">
                    {title}
                    {(id === 2 || id === 3) && (
                      <span className="text-blue-500">*</span>
                    )}
                    {id === 2 && <CircleHelpIcon size={14} />}
                  </p>
                  <p className="font-normal text-gray-600">{description}</p>
                </div>
                {id === 1 ? (
                  <div className="h-9 border rounded-md shadow-sm px-2 inline-flex items-center justify-center w-auto min-w-24 max-w-full overflow-x-auto overflow-y-hidden no-scrollbar">
                    <InputAutoSpan
                      loadingApi={false}
                      valueInputTime={content}
                      handleExportValue={(value) => {
                        handleChangeHotspots(path, value)
                      }}
                      hideIcon={true}
                    />
                  </div>
                ) : (
                  <Button
                    className={cn(
                      'border  text-black font-semibold rounded-md w-fit text-sm',
                      content && 'border-blue-500 shadow-md'
                    )}
                    onClick={() => {
                      setIsOpenAiJudge(true)
                      setValuePopup(x)
                    }}
                  >
                    {content ? 'Chỉnh sửa' : 'Thiết lập'}
                  </Button>
                )}
              </div>
            )
          })}
      </div>
      <DialogAiJudge
        isOpen={isOpenAiJudge}
        valuePopup={valuePopup}
        handleClose={() => {
          setIsOpenAiJudge(false)
        }}
        onSave={(path, val) => {
          handleChangeHotspots(path, val)
        }}
      />
    </>
  )
}
