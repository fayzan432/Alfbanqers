import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from './AuthLayout'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from './schemas'
import { TextInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { requestPasswordReset } from '@/services/authService'

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setSubmitError(null)
    try {
      await requestPasswordReset(values.email)
      setSent(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to send reset email.')
    }
  }

  return (
    <AuthLayout subtitle="Train. Evolve. Ascend.">
      <h1 className="mb-5 text-center font-display text-xl font-semibold text-slate-100">Recover Access</h1>
      {sent ? (
        <p className="text-center text-sm text-slate-300">
          If an account exists for that email, a password reset link has been sent.
        </p>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextInput
            id="email"
            type="email"
            label="Email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          {submitError && (
            <p role="alert" className="rounded-lg border border-ember-500/40 bg-ember-500/10 px-3 py-2 text-sm text-ember-500">
              {submitError}
            </p>
          )}
          <Button type="submit" loading={isSubmitting} className="mt-1 w-full">
            Send Reset Link
          </Button>
        </form>
      )}
      <p className="mt-5 text-center text-sm text-slate-400">
        <Link to="/login" className="font-medium text-arcane-400 hover:text-arcane-300">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  )
}
