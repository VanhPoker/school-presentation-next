import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import TopActionQuiz from '@/components/studio/tools/top-action-quiz/index'
import { QuizFormProps } from '..'
import { Timer, VideoIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounceEffect } from '@/hooks/use-debounce-effect'
import { RadioGroup } from '@/components/ui/radio-group'
import { QUIZ_TYPE } from '@/types/quiz-studio'
import { Microphone01 } from '@untitled-ui/icons-react'
import { AssetState } from '@/mock-data/quiz-studio'

export default function VideoAndAudioQuiz({
  quizzInfo,
  arrQuizAnswers,
  handleAddItemToQuizOne,
  checkType
}: QuizFormProps) {
  const [completedAutoSave, setCompletedAutoSave] = useState<number>(0)
  const [selectedTime, setSelectedTime] = useState<number>(15)
  const [selectedId, setSelectedId] = useState<string>('')
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

  const timeOptions = [
    { value: 15, label: '15 giây', id: '1' },
    { value: 30, label: '30 giây', id: '2' },
    { value: 60, label: '1 phút', id: '3' },
    { value: 120, label: '2 phút', id: '4' },
    { value: 300, label: '5 phút', id: '5' }
  ]

  //   const handleChangeHotspots = (path: string, value: any) => {
  //     setQuizzSettingState({
  //       ...quizzSettingState,
  //       [path]: value
  //     })
  //     setSettings((prev) => {
  //       return prev?.map((x) => {
  //         if (x.path === path) {
  //           x[path] = value
  //           x.content = value
  //         }
  //         return x
  //       })
  //     })
  //   }

  useEffect(() => {
    if (quizzInfo) {
      setSelectedTime(quizzInfo?.questions_hotspots?.data[0]?.duration)
      const currentTimeItem = timeOptions.find((x) => {
        return x.value === quizzInfo?.questions_hotspots?.data[0]?.duration
      })
      if (currentTimeItem) setSelectedId(currentTimeItem.id)
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
      const duration = quizzInfo?.questions_hotspots?.data[0]?.duration
      setQuizzSettingState({
        id: id,
        content: content,
        max_characters: max_characters,
        ai_content_review: ai_content_review,
        duration
      })
      setIsDoneFetchDetail(true)
    }
    // if (arrQuizAnswers?.length) {
    //   setSettings(arrQuizAnswers)
    // }
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
            data: [
              {
                ...quizzSettingState,
                duration: selectedTime
              }
            ]
          }
        }
        handleAddItemToQuizOne('', finalObj)
      }
    },
    500,
    [completedAutoSave, selectedTime]
  )
  useEffect(() => {
    const value = timeOptions.find((x) => x.id === selectedId)
    if (value) setSelectedTime(value?.value)
  }, [selectedId])
  return (
    <>
      {/* Top Quiz */}
      <TopActionQuiz
        isDoneFetchDetail={isDoneFetchDetail}
        contentInfo={quizzInfoState}
        handleAssetChange={(value) => {
          setQuizzInfoState({
            ...quizzInfoState,
            ...value
          })
        }}
      />
      <div className="flex flex-col items-center justify-center w-full gap-4">
        <div className="w-full max-w-2xl  bg-gray-50 rounded-xl">
          <div className="flex flex-col justify-center items-center py-6 px-4 gap-4">
            <div className="flex flex-col items-center gap-3">
              <div>
                {checkType === QUIZ_TYPE.video_response ? (
                  <VideoIcon className="w-9 h-9 text-gray-600 cursor-pointer" />
                ) : (
                  <Microphone01 className="w-9 h-9 text-gray-600 cursor-pointer" />
                )}
              </div>
              <div>
                {checkType === QUIZ_TYPE.video_response ? (
                  <p className="text-sm font-semibold text-slate-700">
                    Quay Video để phản hồi câu hỏi
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-slate-700">
                    Ghi âm để phản hồi câu hỏi
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-medium text-slate-700">
                Thời gian tối đa của phản hồi là bao nhiêu?
              </p>
              <div>
                <RadioGroup
                  value={selectedId}
                  onValueChange={setSelectedId}
                  className="flex flex-wrap justify-center gap-2"
                >
                  {timeOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <Button
                        className={cn(
                          'rounded-lg px-4 py-2',
                          selectedTime === option.value
                            ? 'bg-blue-900 text-white'
                            : 'bg-white text-gray-700'
                        )}
                        onClick={() => setSelectedTime(option.value)}
                      >
                        <Timer className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {option.label}
                        </span>
                      </Button>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
