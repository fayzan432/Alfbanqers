import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface FieldWrapperProps {
  label?: string
  error?: string
  hint?: string
  id: string
}

const fieldClass =
  'w-full rounded-lg border border-white/10 bg-void-800/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-arcane-500 focus:outline-none focus:ring-2 focus:ring-arcane-500/40 min-h-11'

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldWrapperProps>(
  ({ label, error, hint, id, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={clsx(fieldClass, error && 'border-ember-500 focus:ring-ember-500/40', className)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-ember-500">
          {error}
        </p>
      )}
    </div>
  ),
)
TextInput.displayName = 'TextInput'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldWrapperProps>(
  ({ label, error, hint, id, className, children, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={clsx(fieldClass, 'appearance-none', error && 'border-ember-500', className)}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="text-xs text-ember-500">
          {error}
        </p>
      )}
    </div>
  ),
)
Select.displayName = 'Select'

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldWrapperProps>(
  ({ label, error, hint, id, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <textarea id={id} ref={ref} className={clsx(fieldClass, 'min-h-24 resize-y', error && 'border-ember-500', className)} {...props} />
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-ember-500">{error}</p>}
    </div>
  ),
)
TextArea.displayName = 'TextArea'
