'use client'
import { SelectWithSearch } from '@/components/ui/select-with-search'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetWardsLazyQuery } from '@/graphql/generated'
import { useEffect, useMemo } from 'react'

interface DropdownWardProps {
  handleSelect?: (payload: { value: any; name: string }) => void
  name?: string
  value?: any
  provinceId: string
}
export default function DropdownWard({
  handleSelect,
  name,
  value,
  provinceId
}: DropdownWardProps) {
  const [getWards, { data, loading }] = useGetWardsLazyQuery()
  const formatData = useMemo(() => {
    if (!data?.wards) return []
    return data?.wards.map((item) => ({
      label: item.name,
      value: `${item.code}`
    }))
  }, [data])
  useEffect(() => {
    if (!provinceId) return
    getWards({
      variables: {
        provinceCode: provinceId
      }
    })
  }, [provinceId])
  if (loading) return <Skeleton className="w-full h-10" />
  const handleChangeSelect = (value: any) => {
    if (handleSelect && name) {
      handleSelect({ value, name })
    }
  }
  return (
    <SelectWithSearch
      placeholder="Chọn phường"
      searchPlaceholder="Tìm kiếm"
      className="min-w-[150px]"
      disable={!provinceId}
      options={formatData}
      value={value}
      onChange={handleChangeSelect as (value: string | string[]) => void}
    />
  )
}
