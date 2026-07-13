import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from './AuthLayout'
import { resetPasswordSchema, type ResetPasswordFormValues } from './schemas'
import { TextInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { updatePassword } from '@/services/authService'
import { useToast } from '@/components/ui/ToastContext'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setSubmitError(null)
    try {
      await updatePassword(values.password)
      showToast('Password updated. You can now sign in.', 'success')
      navigate('/login', { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to update password. The reset link may have expired.')
    }
  }

  return (
    <AuthLayout subtitle="Train. Evolve. Ascend.">
      <h1 className="mb-5 text-center font-display text-xl font-semibold text-slate-100">Set a New Password</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextInput
          id="password"
          type="password"
          label="New Password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextInput
          id="confirmPassword"
          type="password"
          label="Confirm New Password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        {submitError && (
          <p role="alert" className="rounded-lg border border-ember-500/40 bg-ember-500/10 px-3 py-2 text-sm text-ember-500">
            {submitError}
          </p>
        )}
        <Button type="submit" loading={isSubmitting} className="mt-1 w-full">
          Update Password
        </Button>
      </form>
    </AuthLayout>
  )
}
