import { useApollo } from '@/app/apollo/apolloClient'
import InforModal from '@/components/modals/infor-modal'
import RecordModal from '@/components/modals/record-modal'
import VideoRecordModal from '@/components/modals/video-record-modal'
import { Button } from '@/components/ui/button'
import AudioWaveform from '@/components/ui/wave-audio-player'
import { cn } from '@/lib/utils'
import { Material_Code } from '@/types/material/type'
import { QUIZ_TYPE } from '@/types/quiz-studio'
import { Microphone01 } from '@untitled-ui/icons-react'
import {
  CameraIcon,
  TimerIcon,
  Trash,
  TrashIcon,
  VideoIcon
} from 'lucide-react'
import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import useDoQuiz from '../../_hooks/useDoQuiz'
import { handleUploadContentMedia } from './quiz-media-upload-util'

const MediaRender = dynamic(() => import('@/components/base/media-render'), {
  ssr: false
})

interface QuizMediaResponseProps {
  item: any
  handleJSONChange?: (value: any) => void

  checkRecording?: (value: boolean) => void
}
export const RecordingContext = React.createContext<{
  isRecording: boolean
  setIsRecording: (v: boolean) => void
} | null>(null)
export function QuizMediaResponse({
  item,
  handleJSONChange,
  checkRecording
}: QuizMediaResponseProps) {
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] =
    useState<boolean>(false)
  const [isOpenModalAudio, setIsOpenModalAudio] = useState<boolean>(false)
  const [isOpenModalVideo, setIsOpenModalVideo] = useState<boolean>(false)
  const [recordUrl, setRecordUrl] = useState<any>('')
  const [recordData, setRecordData] = useState<any>('')
  //Info
  const { isQuizPreview } = useDoQuiz()
  const { question_category, questions_hotspots } = item
  const { code } = question_category
  const time = questions_hotspots?.[0]?.duration
  //Results
  const { apolloWithAuth } = useApollo()
  const [tempRecordData, setTempRecordData] = useState<any>()
  const [fileKey, setFileKey] = useState<any>(null)
  //

  const [isRecording, setIsRecording] = useState<boolean>(false)

  useEffect(() => {
    if (recordData) {
      const blobUrl = URL.createObjectURL(recordData.blob)
      setRecordUrl(blobUrl)
    }
    setTempRecordData(recordData)
  }, [recordData])

  const isVideoResponse = code === QUIZ_TYPE.video_response
  const isAudioResponse = code === QUIZ_TYPE.audio_response

  useEffect(() => {
    if (recordData) {
      const blobUrl = URL.createObjectURL(recordData.blob)
      setRecordUrl(blobUrl)
    }
    setTempRecordData(recordData)
  }, [recordData])

  useEffect(() => {
    if (tempRecordData) {
      ;(async () => {
        const key = await handleUploadContentMedia(
          tempRecordData,
          apolloWithAuth
        )
        setFileKey(key)
      })()
    } else {
      setFileKey(null)
    }
  }, [tempRecordData])

  useEffect(() => {
    if (fileKey && handleJSONChange) {
      handleJSONChange(fileKey)
    }
  }, [fileKey])

  useEffect(() => {
    if (checkRecording) checkRecording(isRecording)
  }, [isRecording])

  if (!isVideoResponse && !isAudioResponse) {
    return null
  }
  const handleReRecord = () => {
    setTempRecordData(null)
    setRecordData(null)
    if (isVideoResponse) {
      setIsOpenModalVideo(true)
    } else if (isAudioResponse) {
      setIsOpenModalAudio(true)
    }
  }
  return (
    <div className="flex flex-col h-full w-full justify-end">
      <div className=" w-full border-t p-6 relative flex flex-col ">
        <div
          className={cn(
            'flex flex-col items-center gap-4 max-w-[700px] w-full mx-auto p-7',
            !isQuizPreview && 'mb-16',

            'flex-1 justify-end'
          )}
        >
          {isQuizPreview && <div className="w-full h-full z-10 absolute"></div>}

          <div
            className={cn(
              'border rounded-xl border-dashed w-[80%] h-full flex items-center justify-center overflow-hidden',
              recordData && 'border-none',
              isVideoResponse && 'aspect-[7/3]',
              isAudioResponse && 'border-none rounded-lg',
              isAudioResponse && recordData && 'border'
            )}
          >
            {recordData ? (
              isVideoResponse ? (
                <div className="aspect-[16/9] h-full !rounded-lg overflow-hidden">
                  <MediaRender
                    type={Material_Code.VIDEO}
                    url={recordUrl}
                    containerClass="bg-white aspect-[16/9]"
                  />
                </div>
              ) : (
                isAudioResponse && (
                  <AudioWaveform
                    audioUrl={recordUrl}
                    size={30}
                    className="border rounded-lg w-full py-2 px-6"
                  />
                )
              )
            ) : (
              <Button
                className={cn(
                  'flex items-center gap-3 w-fit rounded-lg text-slate-700',
                  isAudioResponse && 'w-[100%] !py-[32px]'
                )}
                onClick={() =>
                  isVideoResponse
                    ? setIsOpenModalVideo(true)
                    : setIsOpenModalAudio(true)
                }
              >
                {isVideoResponse ? (
                  <>
                    <VideoIcon className="!w-5 !h-5" />
                    <span className="font-semibold text-md">
                      Ấn vào để quay Video
                    </span>
                  </>
                ) : (
                  isAudioResponse && (
                    <>
                      <Microphone01 className="!w-5 !h-5" />
                      <span className="font-semibold text-md">
                        Ấn vào đây để ghi âm
                      </span>
                    </>
                  )
                )}
              </Button>
            )}
          </div>

          {!recordData ? (
            <div className="flex items-center gap-2 text-slate-600 font-regular text-sm">
              <TimerIcon size={20} />
              <span>
                Trả lời tối đa trong:{' '}
                {time > 60
                  ? `${Math.floor(time / 60)} phút${time % 60 ? ` ${time % 60} giây` : ''}`
                  : `${time} giây`}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Button
                className="bg-blue-900 text-white hover:text-gray-700 hover:bg-white rounded-lg"
                onClick={handleReRecord}
              >
                {isVideoResponse ? (
                  <>
                    <CameraIcon className="!h-5 !w-5" />
                    Quay lại video
                  </>
                ) : (
                  isAudioResponse && (
                    <>
                      <Microphone01 className="!h-5 !w-5" />
                      Ghi âm lại
                    </>
                  )
                )}
              </Button>
              <Button
                className="text-red-700 border-red-300 rounded-lg hover:text-white hover:bg-red-700"
                onClick={() => setShowConfirmDeleteModal(true)}
              >
                <Trash size={20} />
                Xóa
              </Button>
            </div>
          )}
          <RecordingContext.Provider value={{ isRecording, setIsRecording }}>
            {isVideoResponse && (
              <VideoRecordModal
                isOpen={isOpenModalVideo}
                handleClose={() => setIsOpenModalVideo(false)}
                onSave={(value: any) => {
                  setIsOpenModalVideo(false)
                  setTempRecordData(value)
                  setRecordData(value)
                }}
                limitTime={time}
                onClose={() => setIsOpenModalVideo(false)}
              />
            )}

            {isAudioResponse && (
              <RecordModal
                isOpen={isOpenModalAudio!}
                handleClose={() => setIsOpenModalAudio(false)}
                onSave={(value: any) => {
                  setIsOpenModalAudio(false)
                  setTempRecordData(value)
                  setRecordData(value)
                }}
                limitTime={time}
              />
            )}
          </RecordingContext.Provider>

          <InforModal
            open={showConfirmDeleteModal}
            handleClose={() => setShowConfirmDeleteModal(false)}
            handleOpen={() => setShowConfirmDeleteModal(true)}
            confirmAction={() => {
              setRecordData(null)
            }}
            title={'Xác nhận xóa'}
            description={`Bạn có chắc muốn xóa ${
              isVideoResponse ? 'video' : 'âm thanh'
            } này?`}
            abortText="Hủy"
            confirmText="Xác nhận"
            icon={<TrashIcon />}
            theme="error"
          />
        </div>
      </div>
    </div>
  )
}
