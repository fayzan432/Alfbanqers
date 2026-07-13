import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Unhandled application error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-void-950 px-6 text-center">
          <ShieldAlert className="size-12 text-arcane-400" aria-hidden />
          <h1 className="font-display text-xl font-semibold text-slate-100">The realm encountered a rift</h1>
          <p className="max-w-sm text-sm text-slate-400">
            Something went wrong while rendering this page. Try reloading — your progress is safely stored.
          </p>
          <Button onClick={() => window.location.reload()}>Reload App</Button>
        </div>
      )
    }
    return this.props.children
  }
}
