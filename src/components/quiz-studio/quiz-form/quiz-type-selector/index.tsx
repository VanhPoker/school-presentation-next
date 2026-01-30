    'use client'

import { cn } from '@/lib/utils'
import { NAV_LIST_LEVEL, NAV_LIST_POINT } from '@/mock-data/quiz-studio'
import { LIST_QUIZ_CODE_CONFIG } from '@/mock-data/quiz-studio/quiz-types'
import { QUIZ_TYPE } from '@/types/quiz-studio'
import { Zap } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export interface QuizTypeSelectorProps {
    /** Loại câu hỏi hiện tại (category code) */
    categoryCode?: string
    /** Điểm số hiện tại */
    point?: string | number
    /** Mức độ khó: 1=Dễ, 2=Trung bình, 3=Khó */
    level?: string | number
    /** Progress percentage (0-100) */
    progress?: number
    /** Label bên trái (mặc định: "Loại câu hỏi") */
    label?: string
    /** Label bên phải (mặc định: "Gợi ý") */
    rightLabel?: string
    /** Hiển thị nút gợi ý AI */
    showHint?: boolean
    /** Callback khi thay đổi loại câu hỏi */
    onCategoryChange?: (code: string) => void
    /** Callback khi thay đổi điểm số */
    onPointChange?: (value: string) => void
    /** Callback khi thay đổi mức độ khó */
    onLevelChange?: (value: string) => void
    /** Callback khi bấm nút gợi ý */
    onHintClick?: () => void
    /** Disabled state */
    disabled?: boolean
    /** className cho container */
    className?: string
    /** Variant: 'category' = Loại câu hỏi, 'type' = Trắc nghiệm/Tự luận */
    variant?: 'category' | 'type'
}

// Helper: Get readable name from category code
function getCategoryDisplayName(code?: string): string {
    if (!code) return 'Chọn loại'

    // Map quiz types to display names
    const typeMap: Record<string, string> = {
        [QUIZ_TYPE.single_choice]: 'Một đáp án',
        [QUIZ_TYPE.multiple_choice]: 'Trắc nghiệm',
        [QUIZ_TYPE.multiple_answers]: 'Nhiều đáp án',
        [QUIZ_TYPE.essay]: 'Tự luận',
        [QUIZ_TYPE.fill_in_the_blank]: 'Điền vào chỗ trống',
        [QUIZ_TYPE.matching]: 'Ghép đôi',
        [QUIZ_TYPE.drag_and_drop]: 'Kéo thả',
        [QUIZ_TYPE.drop_box]: 'Hộp thả',
        [QUIZ_TYPE.sticker]: 'Dán nhãn'
    }

    return typeMap[code] || code
}

// Helper: Get quiz type name (Trắc nghiệm/Tự luận/etc)
function getQuizTypeName(code?: string): string {
    if (!code) return 'Chọn loại'

    // Check if it's a multiple choice variant -> show "Trắc nghiệm"
    if (
        code === QUIZ_TYPE.single_choice ||
        code === QUIZ_TYPE.multiple_choice ||
        code === QUIZ_TYPE.multiple_answers
    ) {
        return 'Trắc nghiệm'
    }

    return getCategoryDisplayName(code)
}

// Helper: Get level name
function getLevelName(level?: string | number): string {
    const levelStr = String(level || '1')
    const item = NAV_LIST_LEVEL.find(l => l.value === levelStr)
    return item?.name || 'Dễ'
}

// Helper: Get point display
function getPointDisplay(point?: string | number): string {
    if (!point) return '1 điểm'
    const pointStr = String(point)
    const item = NAV_LIST_POINT.find(p => p.value === pointStr)
    return item?.name || `${point} điểm`
}

export function QuizTypeSelector({
    categoryCode,
    point = '1',
    level = '1',
    progress = 50,
    label = 'Loại câu hỏi',
    rightLabel = 'Gợi ý',
    showHint = true,
    onCategoryChange,
    onPointChange,
    onLevelChange,
    onHintClick,
    disabled = false,
    className,
    variant = 'category'
}: QuizTypeSelectorProps) {
    // Get available quiz types from config (flatten children)
    const availableTypes = LIST_QUIZ_CODE_CONFIG.flatMap(group =>
        group.children.filter(child => !child.disable)
    )

    const displayName = variant === 'type'
        ? getQuizTypeName(categoryCode)
        : getCategoryDisplayName(categoryCode)

    return (
        <div className={cn('flex items-center gap-2 w-full', className)}>
            {/* Left Section: Label + Badge */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-500">{label}</span>

                {/* Badge with dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger
                        disabled={disabled}
                        className="px-2 py-0.5 border border-gray-200 rounded text-xs font-medium text-gray-700 shadow-sm bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {displayName}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[160px]">
                        {availableTypes.map((type) => (
                            <DropdownMenuItem
                                key={type.code}
                                onClick={() => onCategoryChange?.(type.code)}
                                className={cn(
                                    'flex items-center gap-2 cursor-pointer',
                                    categoryCode === type.code && 'bg-blue-50 text-blue-600'
                                )}
                            >
                                <span className="w-4 h-4 flex items-center justify-center">
                                    {type.icon}
                                </span>
                                <span>{type.name}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
                <div
                    className="absolute left-0 top-0 h-full bg-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
            </div>

            {/* Right Section: AI Hint Button */}
            {showHint && (
                <button
                    onClick={onHintClick}
                    disabled={disabled}
                    className="flex items-center gap-1 text-gray-500 text-sm hover:text-gray-700 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Zap className="w-5 h-5" />
                    <span>{rightLabel}</span>
                </button>
            )}
        </div>
    )
}

/**
 * Variant: QuizPointSelector - For selecting point + showing level
 */
export interface QuizPointSelectorProps {
    /** Loại câu hỏi (Trắc nghiệm/Tự luận, etc) */
    quizTypeName?: string
    /** Điểm số hiện tại */
    point?: string | number
    /** Mức độ khó: 1=Dễ, 2=Trung bình, 3=Khó */
    level?: string | number
    /** Progress percentage (0-100) */
    progress?: number
    /** Callback khi thay đổi điểm số */
    onPointChange?: (value: string) => void
    /** Callback khi thay đổi mức độ khó */
    onLevelChange?: (value: string) => void
    /** Disabled state */
    disabled?: boolean
    /** className cho container */
    className?: string
}

export function QuizPointSelector({
    quizTypeName = 'Trắc nghiệm',
    point = '1',
    level = '1',
    progress = 50,
    onPointChange,
    onLevelChange,
    disabled = false,
    className
}: QuizPointSelectorProps) {
    const levelName = getLevelName(level)

    return (
        <div className={cn('flex items-center gap-2 w-full', className)}>
            {/* Left Section: Quiz Type + Point Badge */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-500">{quizTypeName}</span>

                {/* Point Badge with dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger
                        disabled={disabled}
                        className="px-2 py-0.5 border border-gray-200 rounded text-xs font-medium text-gray-700 shadow-sm bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {getPointDisplay(point)}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[120px]">
                        {NAV_LIST_POINT.map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                onClick={() => onPointChange?.(item.value)}
                                className={cn(
                                    'cursor-pointer',
                                    String(point) === item.value && 'bg-blue-50 text-blue-600'
                                )}
                            >
                                {item.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
                <div
                    className="absolute left-0 top-0 h-full bg-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
            </div>

            {/* Right Section: Level with Zap icon */}
            <DropdownMenu>
                <DropdownMenuTrigger
                    disabled={disabled}
                    className="flex items-center gap-1 text-gray-500 text-sm hover:text-gray-700 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                >
                    <Zap className="w-5 h-5" />
                    <span>{levelName}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[120px]">
                    {NAV_LIST_LEVEL.map((item) => (
                        <DropdownMenuItem
                            key={item.id}
                            onClick={() => onLevelChange?.(item.value)}
                            className={cn(
                                'cursor-pointer',
                                String(level) === item.value && 'bg-blue-50 text-blue-600'
                            )}
                        >
                            {item.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default QuizTypeSelector
