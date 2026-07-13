import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from './AuthLayout'
import { signupSchema, type SignupFormValues } from './schemas'
import { TextInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { signUp } from '@/services/authService'

export function SignupPage() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) })

  const onSubmit = async (values: SignupFormValues) => {
    setSubmitError(null)
    try {
      const result = await signUp(values.email, values.password)
      if (result.session) {
        navigate('/onboarding', { replace: true })
      } else {
        setEmailSent(true)
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to create account. Please try again.')
    }
  }

  if (emailSent) {
    return (
      <AuthLayout subtitle="Train. Evolve. Ascend.">
        <div className="text-center">
          <h1 className="mb-3 font-display text-xl font-semibold text-slate-100">Check your inbox</h1>
          <p className="text-sm text-slate-400">
            We sent a confirmation link to your email. Confirm your address, then log in to begin your ascension.
          </p>
          <Button className="mt-6 w-full" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout subtitle="Train. Evolve. Ascend.">
      <h1 className="mb-5 text-center font-display text-xl font-semibold text-slate-100">Begin Your Ascension</h1>
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextInput
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          autoComplete="new-password"
          placeholder="Re-enter password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        {submitError && (
          <p role="alert" className="rounded-lg border border-ember-500/40 bg-ember-500/10 px-3 py-2 text-sm text-ember-500">
            {submitError}
          </p>
        )}
        <Button type="submit" loading={isSubmitting} className="mt-1 w-full">
          Create Account
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-arcane-400 hover:text-arcane-300">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
