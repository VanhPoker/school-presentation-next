'use client'
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
import { initBookGroupsFilter } from '@/constants/initGraphqlQueryVariables'
import { useGetBookGroupsQuery } from '@/graphql/generated'
import { useMemo } from 'react'

interface DropdownBookGroupsProps {
  handleSelect: (values: string[]) => void
  name?: string
  value?: any
  placeholder?: string
  isMutipleSelect?: boolean
  extraData?: { name: string; value: string }[]
  bookGroups?: string[]
}
export default function DropdownBookGroups({
  handleSelect,
  value,
  extraData = [],
  placeholder = 'Tất cả',
  isMutipleSelect = false
  // bookGroups = []
}: DropdownBookGroupsProps) {
  const { data, loading } = useGetBookGroupsQuery({
    variables: { ...initBookGroupsFilter }
  })
  const formatData = useMemo(() => {
    if (!isMutipleSelect || !data?.book_groups) return []
    return data?.book_groups.map((item) => {
      return { label: item.name, value: item.id }
    })
  }, [data?.book_groups])

  if (loading) return <Skeleton className="w-full h-10" />

  // const handleChangeSelect = (value: any) => {
  //   if (handleSelect && name) {
  //     handleSelect(value, name)
  //   }
  // }
  return (
    <>
      <div className="flex w-full gap-2">
        <div className="w-full">
          {isMutipleSelect || Array.isArray(value) ? (
            // <MultiSelect
            //   className="w-full relative"
            //   options={formatData}
            //   maxCount={2}
            //   placeholder={placeholder}
            //   defaultValue={bookGroups}
            //   onValueChange={(values) => {
            //     handleSelect(values)
            //   }}
            // />
            <SelectWithSearch
              className="w-full relative"
              placeholder={placeholder}
              options={formatData}
              onChange={(values: any) => {
                handleSelect(values)
              }}
              multiple={true}
            />
          ) : (
            <Select
              defaultValue={value}
              onValueChange={(value) => handleSelect([value])}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {extraData.map((item, i) => {
                    return (
                      <SelectItem key={i} value={item.value}>
                        {/* <span>
                    <Image src={item.} />
                  </span> */}
                        {item.name}
                      </SelectItem>
                    )
                  })}
                  {data?.book_groups && data?.book_groups?.length > 0 ? (
                    data?.book_groups.map((item) => {
                      return (
                        <SelectItem key={item.id} value={item.id}>
                          {/* <span>
                      <Image src={item.} />
                    </span> */}
                          {item.name}
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
          )}
        </div>
      </div>
    </>
  )
}
