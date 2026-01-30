import { Skeleton } from '@/components/ui/skeleton'
import Papa from 'papaparse'
import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

type CSVUploadMaterialProps = {
  src: string
}
export default function CSVUploadMaterial({ src }: CSVUploadMaterialProps) {
  const [content, setContent] = useState<string[][]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const handleExtractData = () => {
    Papa.parse(src, {
      download: true,
      complete(result) {
        if (Array.isArray(result.data)) {
          setContent(result.data as string[][])
        }
        setLoading(false)
      },
      error(e) {
        setError(e.message)
        setLoading(false)
      }
      // rest of config ...
    })
  }
  useEffect(() => {
    if (!src) return
    handleExtractData()
  }, [src])
  if (loading) return <Skeleton className="w-full h-72" />
  if (error)
    return <div className="px-2 py-1 text-center text-rose-400">{error}</div>
  if (content.length === 0)
    return <div className="px-2 py-1 text-center">Không có dữ liệu</div>
  return (
    <Table className="!mb-0">
      <TableHeader>
        <TableRow>
          {Array.isArray(content[0]) &&
            content[0].map((item, index) => {
              return (
                <TableHead className="w-full" key={index}>
                  {item}
                </TableHead>
              )
            })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {content.slice(1).map((item, outer) => {
          return (
            <TableRow key={outer}>
              {item.map((child, index) => {
                if (!child) return
                return (
                  <TableCell key={`${outer}-${index}`} className="font-medium">
                    {child}
                  </TableCell>
                )
              })}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
