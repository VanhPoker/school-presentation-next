import { cn } from '@/lib/utils'
import { CircleAlertIcon, Eye, EyeOff } from 'lucide-react'
import * as React from 'react'

type AuthFormInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange'
> & {
  isPassword?: boolean
  inputClassName?: string
  error?: boolean
  numberOnly?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

const AuthFormInput = React.forwardRef<HTMLInputElement, AuthFormInputProps>(
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
            'flex h-11 mt-2 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus:border-[#2D7CFB] placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50 truncate',
            error && 'border-red-500 focus-visible:ring-red-500',
            isPassword && 'pr-10',
            inputClassName
          )}
          ref={ref}
          disabled={disabled}
          onChange={handleInputChange}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {(!props.value ||
            (typeof props.value === 'string' && props.value.length === 0)) &&
            error && <CircleAlertIcon size={16} className=" text-red-500" />}
          {isPassword &&
            props.value &&
            typeof props.value === 'string' &&
            props.value.length > 0 && (
              <div
                className="cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </div>
            )}
        </div>
      </div>
    )
  }
)
AuthFormInput.displayName = 'AuthFormInput' // Renamed for better clarity

export { AuthFormInput }
