'use client'
import DialogWrapper from '@/components/base/dialog-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { SelectWithSearch } from '@/components/ui/select-with-search'
import { Skeleton } from '@/components/ui/skeleton'
import { toasts } from '@/components/ui/toast-color'
import { initSubjectsFilter } from '@/constants/initGraphqlQueryVariables'
import {
  InsertSubjectOneDocument,
  useGetSubjectsQuery
} from '@/graphql/generated'
import { getUserInfoFromCookie } from '@/server-action/auth'
import { useFilterSearchStore } from '@/stores/use-filter-search-store'
import handleObject from '@/utils/handleObject'
import { useMutation } from '@apollo/client'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useBoolean } from 'react-use'

interface IProps {
  handleSelect: (object: any) => void
  name?: string
  value?: any
  gradeId?: string | null
  canAddManual?: boolean
  placeholder?: string
  isMutipleSelect?: boolean
}
export default function DropdownSubject({
  handleSelect,
  value,
  name,
  gradeId = null,
  isMutipleSelect = false,
  canAddManual = true,
  placeholder = 'Nhập'
}: IProps) {
  const { grades } = useFilterSearchStore()
  const query = useMemo(() => {
    return grades && grades.length > 0 && gradeId
      ? handleObject().addKey(
          initSubjectsFilter,
          'where.grade_subjects.grade_id._eq',
          gradeId
        )
      : initSubjectsFilter
  }, [gradeId, grades])
  const { data, loading, refetch } = useGetSubjectsQuery({
    variables: { ...query }
  })
  const formatData = useMemo(() => {
    if (!isMutipleSelect || !data?.subjects) return []
    return data?.subjects.map((item) => {
      return { label: item.name, value: item.id }
    })
  }, [data?.subjects, gradeId])
  const [isDisable, setIsDisable] = useState(false)
  const [isShowAddSubjectModal, toggleShowAddSubjectModal] = useBoolean(false)

  const [subject, setSubject] = useState('')
  const [isValidate, setIsValidate] = useState(false)
  const [insertSubjectMutation] = useMutation(InsertSubjectOneDocument)

  if (loading) return <Skeleton className="w-full h-9" />
  // const handleChangeSelect = (value: any) => {
  //   if (handleSelect && name) {
  //     handleSelect(value, name)
  //   }
  // }

  const handleChange = (e: any) => {
    // handleSelect && handleSelect(e.target.value)
    setSubject(e.target.value)
    if (e.target.value) {
      setIsValidate(false)
    }
  }

  const handleAddSubject = async () => {
    const userInfoId = await getUserInfoFromCookie()
    if (!userInfoId) return
    const insertData = {
      variables: {
        object: {
          name: subject,
          created_by: userInfoId
        }
      }
    }
    try {
      if (subject) {
        setIsDisable(true)
        const res = await insertSubjectMutation(insertData)
        setIsValidate(false)
        if (res.data) {
          toasts.success('Thêm môn học thành công')
        }
        toggleShowAddSubjectModal(false)
        setIsDisable(false)
        refetch()
      } else {
        setIsValidate(true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div className="flex w-full gap-2">
        <div className="w-full">
          {isMutipleSelect ? (
            // <MultiSelect
            //   className="w-full relative"
            //   options={formatData}
            //   maxCount={2}
            //   placeholder={placeholder}
            //   defaultValue={[]}
            //   onValueChange={(values) => {
            //     handleSelect({ values })
            //     //   setValue('assignee_email', values)
            //   }}
            // />
            <SelectWithSearch
              className="w-full relative"
              placeholder={placeholder}
              options={formatData}
              onChange={(values) => {
                handleSelect(values)
              }}
              multiple={true}
            />
          ) : (
            <Select
              defaultValue={value}
              onValueChange={(value) => handleSelect({ name, value })}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Chọn bộ môn" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {data?.subjects.map((item) => {
                    return (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    )
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
        {canAddManual && (
          <div className="w-1/4">
            <Button
              className="h-10 w-full"
              onClick={() => toggleShowAddSubjectModal(true)}
              type="button"
            >
              <Plus />
              Thêm
            </Button>
          </div>
        )}
      </div>
      <DialogWrapper
        isOpen={isShowAddSubjectModal}
        onClose={() => toggleShowAddSubjectModal(false)}
        className="px-0 pt-8"
      >
        <div className=" absolute top-3 left-5 font-bold text-lg">
          Thêm bộ môn
        </div>
        <div className="mt-2 border-t pt-3 px-6">
          <div className="mb-7">
            <Label className="text-sm inline-block mb-1">
              Thêm bộ môn <sup className="text-rose-500">*</sup>
            </Label>
            <Input
              placeholder="Nhập bộ môn"
              onChange={handleChange}
              error={isValidate ? 'Tên bộ môn là bắt buộc' : ''}
            />
            {/* {isValidate && (
              <p className="text-rose-500">Tên bộ môn là bắt buộc</p>
            )} */}
          </div>
          <div className="flex justify-end gap-3">
            <Button onClick={() => toggleShowAddSubjectModal(false)}>
              Huỷ
            </Button>
            <Button
              variant={'signIn'}
              onClick={handleAddSubject}
              disabled={isDisable}
            >
              Thêm
            </Button>
          </div>
        </div>
      </DialogWrapper>
    </>
  )
}
