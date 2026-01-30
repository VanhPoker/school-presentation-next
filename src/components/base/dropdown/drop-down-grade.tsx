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
import { initGradesFilter } from '@/constants/initGraphqlQueryVariables'
import { useGetGradesQuery } from '@/graphql/generated'

interface DropdownGradeProps {
  handleSelect?: (payload: { value: any; name: string }) => void
  name?: string
  value?: any
  fieldValue?: 'id' | 'code'
}
export default function DropdownGrade({
  handleSelect,
  name,
  value,
  fieldValue = 'id'
}: DropdownGradeProps) {
  const { data, loading } = useGetGradesQuery({
    variables: { ...initGradesFilter }
  })
  if (loading) return <Skeleton className="w-full h-10" />
  const handleChangeSelect = (value: any) => {
    if (handleSelect && name) {
      handleSelect({ value, name })
    }
  }
  return (
    <Select
      defaultValue={value}
      onValueChange={(value) => handleChangeSelect(value)}
    >
      <SelectTrigger className="w-full h-10">
        <SelectValue placeholder="Chọn khối lớp" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {data?.grades.map((item) => {
            return (
              <SelectItem key={item.id} value={item[fieldValue]}>
                {item.name}
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
