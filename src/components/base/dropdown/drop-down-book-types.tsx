'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { SelectWithSearch } from '@/components/ui/select-with-search'
import { Skeleton } from '@/components/ui/skeleton'
import { initBookTypesFilter } from '@/constants/initGraphqlQueryVariables'
import { useGetBookTypesQuery } from '@/graphql/generated'
import { BookOpen } from 'lucide-react'
import Image from 'next/image'
import { useMemo } from 'react'

type DropdownBookTypesProps = {
  handleSelect: (values: any) => void
  name?: string
  value?: any
  isMutipleSelect?: boolean
  placeholder?: string
  extraData?: { name: string; value: string; id?: string; file_uploads?: any }[]
  bookTypes?: string[]
}
export default function DropdownBookTypes({
  handleSelect,
  value,
  placeholder = 'Tất cả',
  extraData = [],
  isMutipleSelect = false,
  bookTypes = []
}: DropdownBookTypesProps) {
  const { data, loading } = useGetBookTypesQuery({
    variables: { ...initBookTypesFilter }
  })
  const formatData = useMemo(() => {
    if (!isMutipleSelect || !data?.book_types) return []
    return data?.book_types.map((item) => {
      return { label: item.name, value: item.id }
    })
  }, [data?.book_types])

  // const handleChangeSelect = (value: any) => {
  //   if (handleSelect && name) {

  //     handleSelect(value, name)
  //   }
  // }

  const filterList = useMemo(() => {
    return [...extraData, ...(data?.book_types || [])]
  }, [data?.book_types])
  if (loading) return <Skeleton className="w-full h-10" />
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
            //   defaultValue={bookTypes}
            //   onValueChange={(values) => {
            //     handleSelect(values)
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
              value={bookTypes}
            />
          ) : (
            <Select
              defaultValue={value === 'all' ? '000' : value}
              onValueChange={(values) => handleSelect(values)}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Chọn bộ sách" />
              </SelectTrigger>
              <SelectContent>
                {filterList.map((item, index) => {
                  return (
                    <SelectItem key={item.id || index} value={item.id}>
                      <div className="flex items-center gap-2">
                        {item.file_uploads?.file_urls?.url ? (
                          <Image
                            height={20}
                            width={20}
                            alt={item.name}
                            src={item.file_uploads?.file_urls?.url}
                          />
                        ) : (
                          <BookOpen size={20} />
                        )}
                        <span className="flex-1">{item.name}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </>
  )
}
