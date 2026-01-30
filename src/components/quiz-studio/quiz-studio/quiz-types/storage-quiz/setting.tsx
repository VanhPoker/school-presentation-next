import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { memo } from 'react'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { SelectWithSearch } from '@/components/ui/select-with-search'
import { IValueSelect } from '.'
import { useCreateStorageQuizStore } from '@/stores/use-create-storage-quiz-store'
import { useShallow } from 'zustand/react/shallow'
interface ISetting {
  listGrades: IValueSelect[]
  listSubjects: IValueSelect[]
  listLanguages: IValueSelect[]
  selectedGrade: string
  selectedSubject: string
  selectedLanguage: string
  onLanguageChange: (value: string) => void
  onSubjectChange: (value: string) => void
  onGradeChange: (value: string) => void
  onSubmit: () => void
}

const Setting = ({
  listGrades,
  listSubjects,
  listLanguages,
  selectedGrade,
  selectedSubject,
  selectedLanguage,
  onLanguageChange,
  onSubjectChange,
  onGradeChange,
  onSubmit
}: ISetting) => {
  const { isUploading } = useCreateStorageQuizStore(
    useShallow((state) => ({
      isUploading: state.isUploading
    }))
  )
  return (
    <div className="rounded-xl border">
      <div className="flex items-center bg-gray-50 px-6 py-3 rounded-t-xl">
        <span className="text-[#181D27] font-semibold text-lg mr-auto">
          Cài đặt
        </span>
        <div className="flex items-center gap-2 mr-[6px] text-[#414651] text-sm font-medium">
          <Label className="whitespace-nowrap">Ngôn ngữ đầu ra</Label>
          <SelectWithSearch
            placeholder="Chọn ngôn ngữ"
            searchPlaceholder="Tìm ngôn ngữ"
            className="min-w-[150px]"
            options={listLanguages}
            value={selectedLanguage}
            onChange={onLanguageChange as (value: string | string[]) => void}
          />
        </div>
      </div>
      <Separator className="bg-gray-100" />

      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-[#414651] font-semibold text-sm">
          Môn học và lớp
        </span>
        <div className="flex items-center gap-2 text-[#414651] text-sm font-medium">
          <SelectWithSearch
            placeholder="Chọn môn học"
            searchPlaceholder="Tìm môn học"
            className="min-w-[150px]"
            options={listSubjects}
            value={selectedSubject}
            onChange={onSubjectChange as (value: string | string[]) => void}
          />

          <SelectWithSearch
            placeholder="Chọn lớp"
            searchPlaceholder="Tìm lớp"
            className="min-w-[150px]"
            options={listGrades}
            value={selectedGrade}
            onChange={onGradeChange as (value: string | string[]) => void}
          />
        </div>
      </div>
      <Separator className="bg-gray-100" />
      <div className="flex justify-end px-6 py-5">
        <Button
          variant="action"
          className="w-[220px] text-white"
          onClick={onSubmit}
          disabled={isUploading}
        >
          <Image src="/book/star.svg" alt="star-icon" width={20} height={20} />
          Tạo đề
        </Button>
      </div>
    </div>
  )
}

export default memo(Setting)
