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
import { initLanguagesFilter } from '@/constants/initGraphqlQueryVariables'
import { useGetLanguagesQuery } from '@/graphql/generated'

interface IProps {
  handleSelect?: (payload: { value: any; name: string }) => void
  name?: string
  value?: any
}
export default function DropdownLanguages({
  handleSelect,
  name,
  value
}: IProps) {
  const { data, loading } = useGetLanguagesQuery({
    variables: { ...initLanguagesFilter }
  })
  if (loading) return <Skeleton className="w-full h-9" />
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
        <SelectValue placeholder="Chọn ngôn ngữ" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {data?.languages.map((item) => {
            return (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
