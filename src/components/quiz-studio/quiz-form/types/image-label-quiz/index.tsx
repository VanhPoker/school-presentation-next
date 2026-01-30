import { Button } from '@/components/ui/button'
import { useEffect, useMemo, useRef, useState } from 'react'
import { RefreshCw, Trash } from 'lucide-react'
import MaterialFileUploadModal from '@/components/modals/material-file-upload-modal'
import GeneratedLabels from './GeneratedLabels'
import ImageLabeling from './ImageLabeling'
import {
  initCreateImageLabelingQuizStore,
  useCreateImageLabelingQuizStore
} from '@/stores/use-create-image-labeling-quiz'
import LabelDirection from './LabelDirection'
import WrongLabels from './WrongLabels'
import QuestionInput from './QuestionInput'
import useClickOutside from '@/hooks/use-click-outside'
import { toasts } from '@/components/ui/toast-color'
import { useApollo } from '@/app/apollo/apolloClient'
import { pushFileToS3AndAppendPresignedUrl } from '@/helper/pushFileToS3AndAppendPresignedUrl'
import { isArray, isEmpty, omit } from 'lodash-es'
import { useQuizFormStudioStore } from '@/stores/use-quiz-studio-store'
import { QuizImageLabel } from '@/types/quiz-create'
import { useSearchParams } from 'next/navigation'

export default function ImageLabelQuiz() {
  const { objQuizFormStudio, setObjQuizFormStudio } = useQuizFormStudioStore()
  const [imageUrl, setImageUrl] = useState('')
  const { activeLabelId, createdLabels, wrongLabels } =
    useCreateImageLabelingQuizStore()
  const container = useRef(null)
  const imageContainer = useRef(null)
  const { apolloWithAuth } = useApollo()
  const searchParams = useSearchParams()

  const handleUploadFile = (file: File) => {
    if (!file) return
    setImageUrl(URL.createObjectURL(file))
    uploadToS3(file)
  }

  const uploadToS3 = async (file: File) => {
    if (!apolloWithAuth) return
    toasts.loading('Đang tải lên...')
    try {
      const { file_id, file_key } = await pushFileToS3AndAppendPresignedUrl(
        apolloWithAuth,
        file,
        'quiz-studio'
      )
      if (!isEmpty(file_id)) {
        toasts.success('Tải lên thành công')
        const fileUrl = URL.createObjectURL(file)
        setObjQuizFormStudio({
          ...objQuizFormStudio,
          asset_type: 'images',
          asset_url: file_key,
          file_urls: {
            url: fileUrl
          },
          media_width: (imageContainer?.current as any)?.offsetWidth
        })
      }
    } catch {
      toasts.error('Tải lên không thành công !!!')
    }
  }

  const handleUpdateToQuizStudio = (
    createdLabels: QuizImageLabel[],
    wrongLabels: QuizImageLabel[]
  ) => {
    const convertedLabels = createdLabels?.map((item) => {
      const obj = {
        id: item?.id,
        content: item?.value,
        left: item?.left,
        top: item?.top,
        alignment: item?.alignment,
        is_correct: true,
        is_deleted: Boolean(item?.is_deleted)
      }
      if (item?.is_existed) return obj
      return omit(obj, 'id')
    })
    const convertedWrongLabels = wrongLabels?.map((item) => {
      const obj = {
        id: item?.id,
        content: item?.value,
        is_correct: false,
        is_deleted: Boolean(item?.is_deleted)
      }
      if (item?.is_existed) return obj
      return omit(obj, 'id')
    })
    setObjQuizFormStudio({
      ...objQuizFormStudio,
      asset_url: '',
      file_urls: {
        url: ''
      },
      questions_hotspots: {
        data: [...convertedLabels, ...convertedWrongLabels]
      }
    })
  }

  const handleReplaceImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.jpg,.jpeg,.png,.gif'

    input.addEventListener('change', (event: any) => {
      const file = event.target.files[0]
      URL.revokeObjectURL(imageUrl)
      setImageUrl(URL.createObjectURL(file))

      const newCreatedLabels = createdLabels?.map((item) => ({
        ...item,
        is_deleted: true
      }))
      const newWrongLabels = wrongLabels?.map((item) => ({
        ...item,
        is_deleted: true
      })) as QuizImageLabel[]

      // Update image labeling quiz store
      useCreateImageLabelingQuizStore.setState({
        createdLabels: newCreatedLabels,
        wrongLabels: newWrongLabels,
        currentLabel: undefined,
        activeLabelId: '',
        activeWrongLabelId: ''
      })

      // Update to quiz form studio
      handleUpdateToQuizStudio(newCreatedLabels, newWrongLabels)

      // Upload to S3
      uploadToS3(file)
    })
    input.click()
  }

  const handleDeleteImage = () => {
    setImageUrl('')
    const newCreatedLabels = createdLabels?.map((item) => ({
      ...item,
      is_deleted: true
    }))
    const newWrongLabels = wrongLabels?.map((item) => ({
      ...item,
      is_deleted: true
    })) as QuizImageLabel[]

    // Update image labeling quiz store
    useCreateImageLabelingQuizStore.setState({
      createdLabels: newCreatedLabels,
      wrongLabels: newWrongLabels,
      currentLabel: undefined,
      activeLabelId: '',
      activeWrongLabelId: ''
    })

    // Update to quiz form studio
    handleUpdateToQuizStudio(newCreatedLabels, newWrongLabels)
  }

  const renderHeaderContent = useMemo(() => {
    if (!imageUrl)
      return (
        <h4 className="mr-auto text-[#181D27] font-semibold text-lg">
          Thêm hình ảnh để dán nhãn
        </h4>
      )
    if (activeLabelId) {
      return <LabelDirection />
    }
    return (
      <>
        <h4 className="mr-auto text-[#181D27] font-semibold text-lg">
          {imageUrl
            ? 'Chọn vị trí để thêm nhãn trên ảnh'
            : 'Thêm hình ảnh để dán nhãn'}
        </h4>
        <Button
          className="mr-3 border-[#D5D7DA] hover:bg-white hover:text-[#414651]"
          onClick={handleReplaceImage}
        >
          <RefreshCw size={20} color="#414651" />
          Thay thế
        </Button>
        <Button
          className="p-2 border-[#D5D7DA] hover:bg-white"
          onClick={handleDeleteImage}
        >
          <Trash size={20} color="#414651" />
        </Button>
      </>
    )
  }, [imageUrl, activeLabelId])

  useClickOutside(container, () => {
    useCreateImageLabelingQuizStore.setState({
      currentLabel: undefined,
      activeLabelId: ''
    })
  })

  // Reset store when component unmounts
  useEffect(() => {
    return () => {
      useCreateImageLabelingQuizStore.setState(initCreateImageLabelingQuizStore)
    }
  }, [])

  // Update store when component mounts
  useEffect(() => {
    if (!searchParams.get('quizId')) return
    const imageUrl = objQuizFormStudio?.file_urls?.url
    setImageUrl(imageUrl as string)
    const createdLabels = objQuizFormStudio?.questions_hotspots?.data
      ?.filter((item: any) => item?.is_correct && !item?.is_deleted)
      ?.map((item: any) => ({
        id: item?.id,
        value: item?.content,
        left: item?.left,
        top: item?.top,
        alignment: item?.alignment,
        is_existed: true,
        is_new: false
      })) as QuizImageLabel[]
    const wrongLabels = objQuizFormStudio?.questions_hotspots?.data
      ?.filter((item: any) => !item?.is_correct && !item?.is_deleted)
      ?.map((item: any) => ({
        id: item?.id,
        value: item?.content,
        is_existed: true,
        is_new: false
      })) as QuizImageLabel[]
    useCreateImageLabelingQuizStore.setState({
      createdLabels: isArray(createdLabels) ? createdLabels : [],
      wrongLabels: isArray(wrongLabels) ? wrongLabels : []
    })
  }, [])

  return (
    <div
      className="grid grid-cols-[1fr_2fr] grid-rows-[auto_1fr] gap-4"
      ref={container}
      onClick={(event: any) => {
        if (event.target.closest('#image-labeling, .label-direction')) {
          return
        }
        useCreateImageLabelingQuizStore.setState({
          currentLabel: undefined,
          activeLabelId: ''
        })
      }}
    >
      <QuestionInput />
      <div className="row-[1_/_span_2] col-[2_/_span_1] bg-white flex flex-col rounded-2xl overflow-hidden ">
        <div className="bg-[#FAFAFA] flex items-center px-6 py-3 min-h-[62px]">
          {renderHeaderContent}
        </div>
        <div className="aspect-[4_/_3]" ref={imageContainer}>
          {imageUrl ? (
            <ImageLabeling imageUrl={imageUrl} />
          ) : (
            <MaterialFileUploadModal
              acceptedFileTypes={{
                image: ['.jpg', '.jpeg', '.png']
              }}
              defaultText="Kéo và thả tệp học liệu"
              otherText="Định dạng hình ảnh hỗ trợ: JPG, JPEG, PNG"
              maxSize={500 * 1024 * 1024}
              canCrop={false}
              infoText="Giới hạn kích thước tệp: 01 tệp - tối đa 500 MB"
              type="image"
              onFilesUploaded={handleUploadFile}
              className="border-0 rounded-none"
              onFileError={() =>
                toasts.error('File vượt quá 500MB hoặc không đúng định dạng')
              }
            />
          )}
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl">
        <GeneratedLabels className="mb-6" />
        <WrongLabels />
      </div>
    </div>
  )
}
