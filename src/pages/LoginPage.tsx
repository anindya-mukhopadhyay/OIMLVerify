import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authState'
import { loginSchema, type LoginForm } from '../validation/schemas'

export function LoginPage() {
  const { firebaseEnabled, login, user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@metriweigh.local',
      password: 'metriweigh-demo',
    },
  })

  if (user) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (values: LoginForm) => {
    setError('')
    try {
      await login(values.email, values.password)
      navigate('/')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in.')
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <div className="brand-mark">
            <ShieldCheck size={28} />
          </div>
          <div>
            <span className="eyebrow">MetriWeigh</span>
            <h1 id="login-title">Secure NAWI test workspace</h1>
          </div>
        </div>
        <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
          <label>
            Email
            <input type="email" autoComplete="email" {...register('email')} />
            {errors.email ? <small>{errors.email.message}</small> : null}
          </label>
          <label>
            Password
            <input type="password" autoComplete="current-password" {...register('password')} />
            {errors.password ? <small>{errors.password.message}</small> : null}
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            <LogIn size={18} />
            <span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
          </button>
        </form>
        <p className="demo-note">
          {firebaseEnabled
            ? 'Firebase Authentication is configured for email/password sign-in.'
            : 'Firebase env vars are not set, so this build uses a local demo session.'}
        </p>
      </section>
    </main>
  )
}
