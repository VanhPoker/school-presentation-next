'use client'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  initExamsExampleFilter,
  initExamsFilter
} from '@/constants/initGraphqlQueryVariables'
import { useGetExamsLazyQuery } from '@/graphql/generated'
import handleObject from '@/utils/handleObject'
import { useEffect, useState } from 'react'

interface DropdownExamProps {
  handleSelect?: (value: any, name: string) => void
  name?: string
  value?: any
  isPublish?: boolean
  gradeId?: string
  subjectId?: string
}
export default function DropdownExam({
  handleSelect,
  name,
  isPublish = true,
  value,
  gradeId,
  subjectId
}: DropdownExamProps) {
  const [loading, setLoading] = useState(false)
  const [configFilter, setConfigFilter] = useState({
    gradeId: gradeId,
    subjectId: subjectId,
    isPublish
  })
  const [data, setData] = useState<any[]>([])
  const [filterQuery, setFilterQuery] = useState({
    ...initExamsExampleFilter
  })
  const [getExam] = useGetExamsLazyQuery({
    variables: initExamsFilter
  })
  const handleChangeSelect = (value: any) => {
    if (handleSelect && name) {
      handleSelect(value, name)
    }
  }
  const handleFetchExam = async (name: string, value: string | boolean) => {
    setLoading(true)
    // let filter: GetExamsQueryVariables
    // if (value.trim() === '') {
    //   filter = handleObject().removeKey(
    //     filterQuery,
    //     `where.materials.material_detail.${name}`
    //   )
    // } else {
    let filter = filterQuery
    if (typeof value === 'string') {
      filter = handleObject().addKey(
        filterQuery,
        `where.materials.material_detail.${name}._eq`,
        value
      )
    } else if (typeof value === 'boolean') {
      if (value) {
        filter = handleObject().addKey(
          filterQuery,
          `where.materials.${name}._eq`,
          value
        )
      } else {
        filter = handleObject().removeKey(
          filterQuery,
          `where.materials.${name}`
        )
      }
    }
    // filter = handleObject().addKey(
    //   filterQuery,
    //   `where.materials.is_published._eq`,
    //   true
    // )
    // }
    setFilterQuery(filter)
    try {
      const res = await getExam({
        variables: filter
      })
      setData(res?.data?.exams || [])
    } catch (error) {
      console.error('error', error)
    }
    setLoading(false)
  }
  useEffect(() => {
    if (gradeId !== configFilter.gradeId && gradeId) {
      handleFetchExam('grade_id', gradeId)
      setConfigFilter((prev) => ({ ...prev, gradeId }))
    } else if (subjectId !== configFilter.subjectId && subjectId) {
      handleFetchExam('subject_id', subjectId)
      setConfigFilter((prev) => ({ ...prev, subjectId }))
    } else if (isPublish !== configFilter.isPublish) {
      handleFetchExam('is_published', isPublish)
      setConfigFilter((prev) => ({ ...prev, isPublish }))
    }
  }, [configFilter, gradeId, subjectId, isPublish])

  if (loading) return <Skeleton className="w-full h-10" />
  return (
    <Select
      value={value}
      disabled={!gradeId && !subjectId}
      onValueChange={(value) => handleChangeSelect(value)}
    >
      <SelectTrigger className="w-full h-10">
        <SelectValue placeholder="Chọn bộ đề" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {data.length > 0 ? (
            data.map((item) => {
              return (
                <SelectItem key={item.id} value={item.id}>
                  {item.materials?.title}
                </SelectItem>
              )
            })
          ) : (
            <SelectItem value="null" disabled>
              Không có dữ liệu
            </SelectItem>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
