import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Settings, Eye, SaveIcon, LoaderIcon } from 'lucide-react'
import { useTotalQuizStore } from '@/stores/use-total-quiz-store'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useApollo } from '@/app/apollo/apolloClient'
import { UpdateMaterialsByPkDocument } from '@/graphql/generated'
import { useMutation } from '@apollo/client'
import { toasts } from '@/components/ui/toast-color'
import { useRouter } from '@bprogress/next/app'
interface ButtonActionProps {
  examId: string
  setIsOpenExamCreate: (value: boolean) => void
}

export default function ButtonAction({
  examId,
  setIsOpenExamCreate
}: ButtonActionProps) {
  const { totalQuiz } = useTotalQuizStore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const idBook = searchParams.get('idBook')
  const statusParams = searchParams.get('status')
  const codeParams = searchParams.get('codeType')
  const { apolloWithAuth } = useApollo()
  const [updateMaterialsByMutation] = useMutation(UpdateMaterialsByPkDocument)
  const [loadingPublished, setLoadingPublished] = useState<boolean>(false)

  const removeStyleFixedHeader = () => {
    const elHeader = document.getElementById('main-header')
    if (!elHeader) return
    setTimeout(() => {
      elHeader.classList.remove('!fixed')
    }, 1000)
  }
  const handlePublishItem = async () => {
    setLoadingPublished(true)
    try {
      if (apolloWithAuth) {
        const res = await updateMaterialsByMutation({
          variables: {
            id: idBook,
            set: {
              is_published: true
            }
          }
        })
        if (res) {
          setLoadingPublished(false)
          toasts.success('Xuất bản thành công!')
          const url = new URL(window.location.href)
          url.searchParams.set('status', 'published')
          router.replace(url.pathname + '?' + url.searchParams.toString())
        }
      }
    } catch {
      setLoadingPublished(false)
      toasts.error('Xuất bản thất bại!')
    }
  }

  return (
    <div className="flex flex-row gap-2">
      <Link
        href={`/quiz-preview/${examId}?idBook=${idBook}&status=${statusParams}&codeType=${codeParams}`}
        onClick={() => {
          removeStyleFixedHeader()
        }}
      >
        {totalQuiz !== 0 && (
          <Button variant={'default'}>
            <Eye size="16" />
            <span className="text-sm md:text-[15] hidden sm:inline">
              Xem trước
            </span>
          </Button>
        )}
      </Link>

      <Button variant={'default'} onClick={() => setIsOpenExamCreate(true)}>
        <Settings size="16" />
        <span className="text-sm md:text-[15] hidden sm:inline">Thiết lập</span>
      </Button>

      <Button
        variant={'action'}
        size="sm"
        onClick={handlePublishItem}
        disabled={loadingPublished}
      >
        {loadingPublished ? (
          <LoaderIcon className="h-4 w-4 animate-spin" />
        ) : (
          <SaveIcon size="16" />
        )}
        <span className="text-sm md:text-[15] hidden sm:inline">Xuất bản</span>
      </Button>
    </div>
  )
}
