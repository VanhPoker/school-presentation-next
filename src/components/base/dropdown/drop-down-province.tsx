'use client'

import { SelectWithSearch } from '@/components/ui/select-with-search'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetProvincesQuery } from '@/graphql/generated'
import { useMemo } from 'react'

interface IProps {
  handleSelect?: (payload: { value: any; name: string }) => void
  name?: string
  value?: any
}
export default function DropdownProvince({
  handleSelect,
  name,
  value
}: IProps) {
  const { data, loading } = useGetProvincesQuery()
  const formatData = useMemo(() => {
    if (!data?.provinces) return []
    return data?.provinces.map((item) => ({
      label: item.name,
      value: `${item.codename}`
    }))
  }, [data])
  if (loading) return <Skeleton className="w-full h-10" />
  const handleChangeSelect = (value: any) => {
    if (handleSelect && name) {
      handleSelect({ value, name })
    }
  }
  return (
    <SelectWithSearch
      placeholder="Chọn tỉnh/thành phố"
      searchPlaceholder="Tìm kiếm"
      className="min-w-[150px]"
      options={formatData}
      value={value}
      onChange={handleChangeSelect as (value: string | string[]) => void}
    />
  )
}
