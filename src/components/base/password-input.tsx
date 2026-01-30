import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'
import * as React from 'react'

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange'
> & {
  isPassword?: boolean
  inputClassName?: string
  error?: string
  numberOnly?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      inputClassName,
      disabled,
      error = false,
      isPassword = true,
      numberOnly = false,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(
      isPassword ? false : true
    )

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (numberOnly) {
        const { value } = event.target
        const numericValue = value.replace(/[^0-9]/g, '')
        event.target.value = numericValue
      }
      if (onChange) {
        onChange(event)
      }
    }

    return (
      <div className={cn('relative ', className)}>
        <input
          type={isPassword && !showPassword ? 'password' : 'text'}
          className={cn(
            'flex h-11 mt-2 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus:border-[#2D7CFB] placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            inputClassName
          )}
          ref={ref}
          disabled={disabled}
          onChange={handleInputChange}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isPassword && (
            <div
              className="cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </div>
          )}
        </div>
        {error && (
          <p
            role="error-message"
            className="text-xs text-rose-500 absolute top-full mt-1 left-0"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput' // Renamed for better clarity

export { PasswordInput }
