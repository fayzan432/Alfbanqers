import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from './AuthLayout'
import { loginSchema, type LoginFormValues } from './schemas'
import { TextInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { signIn } from '@/services/authService'
import { useToast } from '@/components/ui/ToastContext'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null)
    try {
      await signIn(values.email, values.password)
      showToast('Welcome back, adventurer.', 'success')
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.')
    }
  }

  return (
    <AuthLayout subtitle="Train. Evolve. Ascend.">
      <h1 className="mb-5 text-center font-display text-xl font-semibold text-slate-100">Enter the Realm</h1>
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
        <TextInput
          id="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs font-medium text-arcane-400 hover:text-arcane-300">
            Forgot password?
          </Link>
        </div>
        {submitError && (
          <p role="alert" className="rounded-lg border border-ember-500/40 bg-ember-500/10 px-3 py-2 text-sm text-ember-500">
            {submitError}
          </p>
        )}
        <Button type="submit" loading={isSubmitting} className="mt-1 w-full">
          Sign In
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-400">
        New to the realm?{' '}
        <Link to="/signup" className="font-medium text-arcane-400 hover:text-arcane-300">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
