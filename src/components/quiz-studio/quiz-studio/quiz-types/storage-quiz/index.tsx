'use client'
import MaterialFileUploadModal from '@/components/modals/material-file-upload-modal'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { File } from 'lucide-react'
import React, { memo, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useCreateStorageQuizStore } from '@/stores/use-create-storage-quiz-store'
import Setting from './setting'
import { useShallow } from 'zustand/react/shallow'
import { pdfjs } from 'react-pdf'
import { toast } from 'sonner'
import { isEmpty } from 'lodash-es'
import { toasts } from '@/components/ui/toast-color'
import { pushFileToS3AndAppendPresignedUrl } from '@/helper/pushFileToS3AndAppendPresignedUrl'
import { useApollo } from '@/app/apollo/apolloClient'
// import { CirclePercentage } from '@/components/ui/percentage-circle'
import { postJobs, postParseDocument } from '@/services/quiz-studio'
import {
  initGradesFilter,
  initLanguagesFilter,
  initSubjectsFilter
} from '@/constants/initGraphqlQueryVariables'
import {
  useGetGradesQuery,
  useGetLanguagesQuery,
  useGetSubjectsQuery,
  useGetFileQuery,
  InsertQuestionsDocument,
  GetAllQuestionCategoriesDocument,
  GetAllQuestionCategoriesQuery
} from '@/graphql/generated'
import { useRouter } from 'next/navigation'
import { useLocalStorage } from 'react-use'
import { useSearchParams } from 'next/navigation'
import LoadingOverlay from './loadingOverlay'
import {
  getAccessTokenFromCookie,
  getUserInfoFromCookie
} from '@/server-action/auth'

// import { mockDataQuestions } from './mockData'

export interface IValueSelect {
  value: string
  label: string
}

const ShowFile = dynamic(() => import('./show-file'), {
  ssr: false
})

// Set the worker source for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs'

const MAX_FILE_SIZE_MB = 25
const MAX_PDF_PAGES = 30

const StorageQuiz = () => {
  const { apolloWithAuth } = useApollo()
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [categoryList, setCategoryList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [quizStudio] = useLocalStorage<any>('quizStudio')
  const searchParams = useSearchParams()
  const materialId = quizStudio.state.objQuizFormStudio.material_id
  const router = useRouter()
  const examIdFromUrl = searchParams.get('examId')
  const statusParams = searchParams.get('status')
  const codeTypeParams = searchParams.get('codeType')
  const idBookParams = searchParams.get('idBook')
  const { data: gradesData } = useGetGradesQuery({
    variables: { ...initGradesFilter }
  })
  const { data: subjectsData } = useGetSubjectsQuery({
    variables: { ...initSubjectsFilter }
  })
  const { data: languagesData } = useGetLanguagesQuery({
    variables: { ...initLanguagesFilter }
  })

  const grades =
    gradesData?.grades?.map((g) => ({ value: g.id, label: g.name })) || []
  const subjects =
    subjectsData?.subjects?.map((s) => ({ value: s.id, label: s.name })) || []
  const languages =
    languagesData?.languages?.map((l) => ({ value: l.id, label: l.name })) || []

  const { fileType, fileKey, pdfPages } = useCreateStorageQuizStore(
    useShallow((state) => ({
      fileType: state.fileType,
      fileSize: state.fileSize,
      pdfPages: state.pdfPages,
      fileKey: state.fileKey
    }))
  )
  const { data: fileData } = useGetFileQuery({
    variables: { file_key: fileKey || '' }
  })

  const getAllCategoryNodes = (
    categories: any[]
  ): { code: string; id: number }[] => {
    const result: { code: string; id: number }[] = []

    function traverse(nodes: any[]) {
      for (const node of nodes) {
        if (node.id) {
          result.push({ code: node.code, id: node.id })
        }
        if (Array.isArray(node.children)) {
          traverse(node.children)
        }
      }
    }

    traverse(categories)
    return result
  }

  const fetchCategoryList = async () => {
    if (!apolloWithAuth) return
    const { data } = await apolloWithAuth.query<GetAllQuestionCategoriesQuery>({
      query: GetAllQuestionCategoriesDocument,
      variables: {
        filter: {
          parent_id: {
            _is_null: true
          }
        }
      }
    })
    if (data) {
      const flat = getAllCategoryNodes(data.question_categories)
      setCategoryList(flat)
    }
  }

  useEffect(() => {
    fetchCategoryList()
  }, [apolloWithAuth])

  const uploadToS3 = async (file: File) => {
    if (!apolloWithAuth) return
    toasts.loading('Đang tải lên...')
    useCreateStorageQuizStore.getState().setIsUploading(true)
    try {
      const { file_id, file_key } = await pushFileToS3AndAppendPresignedUrl(
        apolloWithAuth,
        file,
        'quiz-type'
      )
      if (!isEmpty(file_id)) {
        toasts.success('Tải lên thành công')
        useCreateStorageQuizStore.setState({
          fileKey: file_key
        })
      }
    } catch (error) {
      console.error(error)
      toasts.error('Tải lên không thành công !!!')
    } finally {
      useCreateStorageQuizStore.getState().setIsUploading(false)
    }
  }

  const handleUploadFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error('Kích thước tệp tài liệu vượt quá giới hạn')
      return
    }
    if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
        const numPages = pdf.numPages
        if (numPages > MAX_PDF_PAGES) {
          toast.error('Số trang tài liệu vượt quá giới hạn')
          return
        }
        useCreateStorageQuizStore.setState({
          fileType: file.type,
          fileSize: file.size,
          fileName: file.name,
          pdfPages: []
        })
        await uploadToS3(file)
        useCreateStorageQuizStore.setState({
          fileUrl: ''
        })
      } catch (error) {
        console.error('Error reading file:', error)
      }
    } else {
      useCreateStorageQuizStore.setState({
        fileType: file.type,
        fileSize: file.size,
        fileName: file.name,
        pdfPages: []
      })
      await uploadToS3(file)
      useCreateStorageQuizStore.setState({
        fileUrl: ''
      })
    }
  }

  const mapCategoryCodeToId = (code: string) => {
    return categoryList.find((cat: any) => cat.code === code)?.id || null
  }

  const processQuestions = (apiResponse: any, userInfoId: string) => {
    const questions = apiResponse?.data || []
    return questions.map((question: any) => {
      return {
        ...question,
        name: question.name,
        category_id: mapCategoryCodeToId(question.category_id),
        material_id: materialId,
        created_by: userInfoId,
        asset_type: question.asset_url ? 'images' : '',
        questions_hotspots: {
          data:
            Array.isArray(question.questions_hotspots?.data) &&
            question.questions_hotspots.data.length > 0
              ? question.questions_hotspots.data.map((hotspot: any) => ({
                  content: hotspot.content,
                  created_by: userInfoId,
                  is_correct: hotspot.is_correct
                }))
              : [
                  {
                    content: '',
                    created_by: userInfoId,
                    is_correct: false
                  }
                ]
        },
        questions_exam: {
          data: [
            {
              created_by: userInfoId,
              exam_id: examIdFromUrl
            }
          ]
        }
      }
    })
  }

  const handleFetchDocument = async () => {
    const accessToken = await getAccessTokenFromCookie()
    const userInfoId = await getUserInfoFromCookie()
    if (!accessToken || !userInfoId) return
    if (!fileKey) {
      toasts.error('Không tìm thấy file')
      return
    }

    if (!selectedGrade || !selectedSubject || !selectedLanguage) {
      toasts.error('Vui lòng chọn đầy đủ thông tin: Khối, Môn học và Ngôn ngữ')
      return
    }

    // if (usageCount >= 10) {
    //   toasts.error('Bạn đã sử dụng hết số lần tạo đề trong tháng')
    //   return
    // }
    const fileUrl = fileData?.get_file?.url
    if (!fileUrl) {
      toasts.error('Không tìm thấy URL của file')
      return
    }
    const payload = {
      auto_solve: true,
      grade: grades.find((g) => g.value === selectedGrade)?.label || '',
      num_quiz: 0,
      content_type: fileType,
      subject: subjects.find((s) => s.value === selectedSubject)?.label || '',
      language:
        languages.find((l) => l.value === selectedLanguage)?.label || '',
      url: fileUrl,
      page_number: pdfPages.length > 0 ? pdfPages : []
    }
    const payloadStringify = JSON.stringify(payload)
    const payloadJobs = {
      created_by: userInfoId,
      input_data: payloadStringify,
      name: 'AIGenQuiz',
      status: 'pending'
    }
    try {
      if (!apolloWithAuth) return
      setIsLoading(true)
      const res = await postJobs(payloadJobs)
      if (!res.data) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = res.data
      const jobId = data?.job_id
      const payloadParseDocument = {
        job_id: jobId
      }
      const resParseDocument = await postParseDocument(
        accessToken!,
        payloadParseDocument
      )
      const reader = resParseDocument.body?.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      const questionsArray = []
      while (true) {
        const { value, done } = (await reader?.read()) || {
          value: null,
          done: true
        }
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n\n')
        buffer = lines.pop() || '' // dòng chưa hoàn chỉnh

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6)
            try {
              if (!payload.includes('__DONE__')) {
                const questionObj = JSON.parse(payload)
                questionsArray.push(questionObj)
              }
            } catch (e) {
              console.error('Parse error:', e, payload)
            }
          }
        }
      }
      if (questionsArray.length > 0) {
        const { data: insertQuestionsData } = await apolloWithAuth.mutate({
          mutation: InsertQuestionsDocument,
          variables: {
            objects: processQuestions({ data: questionsArray }, userInfoId)
          }
        })
        if (insertQuestionsData) {
          // useCreateStorageQuizStore.getState().increaseUsage()
          toasts.success('Tạo bộ đề thành công')
          router.push(
            `/quiz-detail/${examIdFromUrl}?idBook=${idBookParams}&status=${statusParams}&codeType=${codeTypeParams}`
          )
          setIsLoading(false)
        }
      } else {
        toasts.error('Không nhận được câu hỏi nào từ tài liệu')
      }
    } catch (error) {
      console.error('Error fetching document:', error)
      toasts.error('Có lỗi xảy ra khi xử lý tài liệu')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (fileData?.get_file?.url) {
      useCreateStorageQuizStore.setState({
        fileUrl: fileData.get_file.url
      })
    }
  }, [fileData])

  useEffect(() => {
    return () => {
      useCreateStorageQuizStore.setState({
        isUploading: false,
        isOpenPdfModal: false,
        fileType: '',
        fileSize: 0,
        fileName: '',
        fileKey: '',
        fileUrl: '',
        pdfPages: []
      })
    }
  }, [])
  return (
    <>
      {isLoading && (
        <div>
          <LoadingOverlay />
        </div>
      )}
      <Tabs defaultValue={'upload'} className="mb-4">
        <TabsList className="flex gap-3 bg-white px-6 py-0 h-auto">
          <TabsTrigger
            value="upload"
            className="w-3/12 pt-[18px] pb-[14px] flex gap-2"
          >
            <File size={24} color="#055BE6" />
            <span className="text-base font-semibold">Tài liệu</span>
          </TabsTrigger>
          <TabsTrigger
            value="materials"
            disabled
            className="w-3/12 pt-[18px] pb-[14px] flex gap-2"
          >
            <File size={24} color="#055BE6" />
            <span className="text-base font-semibold">Dán nội dung</span>
          </TabsTrigger>
          <TabsTrigger
            value="materials"
            disabled
            className="w-3/12 pt-[18px] pb-[14px] flex gap-2"
          >
            <File size={24} color="#055BE6" />
            <span className="text-base font-semibold">Kho học liệu</span>
          </TabsTrigger>
          <TabsTrigger
            value="my-lib"
            disabled
            className="w-3/12 pt-[18px] pb-[14px] flex gap-2"
          >
            <File size={24} color="#055BE6" />
            <span>Thư viện của tôi</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="bg-white rounded-xl px-6 pb-6 flex flex-col gap-6">
        <div className="flex items-center justify-between py-5 border-b border-solid border-[#E9EAEB]">
          <div>
            <h5 className="text-[#181D27] font-semibold mb-[2px] text-lg">
              Tải học liệu từ tài liệu học tập
            </h5>
            <span className="text-[#535862] text-sm">
              Hỗ trợ tạo học liệu từ tài liệu của bạn
            </span>
          </div>
          {/* <div className="flex items-center">
            <CirclePercentage
              percentage={0}
              radius={25}
              strokeWidth="8"
              className="w-10 h-10"
              hasPercentage={false}
              text=""
            />
            <span className="font-semibold text-xs text-[#414651]">
              Giới hạn 0/10 hàng tháng
            </span>
          </div> */}
        </div>
        {fileType ? (
          <>
            <ShowFile />
            <Setting
              listGrades={grades}
              listSubjects={subjects}
              listLanguages={languages}
              selectedGrade={selectedGrade}
              selectedSubject={selectedSubject}
              selectedLanguage={selectedLanguage}
              onGradeChange={setSelectedGrade}
              onSubjectChange={setSelectedSubject}
              onLanguageChange={setSelectedLanguage}
              onSubmit={handleFetchDocument}
            />
          </>
        ) : (
          <MaterialFileUploadModal
            acceptedFileTypes={{
              document: ['.doc', '.docx', '.pdf', '.txt', '.pptx', '.ppt'],
              image: ['.jpg', '.jpeg', '.png']
            }}
            defaultText="Kéo và thả tệp tài liệu"
            otherText="Định dạng tài liệu hỗ trợ: DOC, DOCX, PDF, TXT,PPTX, PPT, JPG, JPEG, PNG"
            maxSize={MAX_FILE_SIZE_MB * 1024 * 1024}
            canCrop={false}
            infoText="Giới hạn kích thước tệp: tối đa 25 MB và không quá 30 trang"
            onFilesUploaded={handleUploadFile}
            className="bg-white"
          />
        )}
      </div>
    </>
  )
}

export default memo(StorageQuiz)
