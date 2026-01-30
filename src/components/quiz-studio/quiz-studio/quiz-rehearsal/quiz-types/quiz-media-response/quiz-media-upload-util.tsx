import { toasts } from '@/components/ui/toast-color'
import { pushFileToS3AndAppendPresignedUrl } from '@/helper/pushFileToS3AndAppendPresignedUrl'
import { isEmpty } from 'lodash-es'

const uploadToS3 = async (
  params: any,

  apolloWithAuth: any
) => {
  if (!apolloWithAuth) return
  toasts.loading('Đang tải lên...')
  try {
    const file = params.file
    const { file_id, file_key } = await pushFileToS3AndAppendPresignedUrl(
      apolloWithAuth,
      file,
      'quiz-studio'
    )
    if (!isEmpty(file_id)) {
      toasts.success('Tải lên thành công')
      return file_key
    }
  } catch {
    toasts.error('Tải lên không thành công')
  }
}
export const handleUploadContentMedia = async (
  params: any,
  apolloWithAuth: any
) => {
  if (typeof params.file === 'string' && params.file.includes('https')) {
    return params.file
  } else {
    try {
      const fileKey = await uploadToS3(params, apolloWithAuth)
      return fileKey
    } catch (error) {
      console.error(error)
      return null
    }
  }
}
