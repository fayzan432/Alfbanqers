import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, RotateCcw, Trash2 } from 'lucide-react'
import { Panel, PanelHeader, PanelTitle } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/ToastContext'
import { useAuth } from '@/features/auth/AuthContext'
import { buildUserDataExport, downloadJson } from '@/services/exportService'
import { deleteMyData, resetMyProgress } from '@/services/accountService'
import { signOut } from '@/services/authService'
import { localDateKey } from '@/utils/date'

export function DangerZoneSection() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [exporting, setExporting] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleExport = async () => {
    if (!user) return
    setExporting(true)
    try {
      const data = await buildUserDataExport(user.id)
      downloadJson(data, `level-up-mullick-export-${localDateKey()}.json`)
      showToast('Export downloaded.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to export data.', 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      await resetMyProgress()
      showToast('Progress reset. Your profile info was kept.', 'success')
      setResetOpen(false)
      window.location.reload()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to reset progress.', 'error')
    } finally {
      setResetting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteMyData()
      await signOut()
      showToast('Your data has been erased.', 'success')
      navigate('/login', { replace: true })
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete data.', 'error')
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Data &amp; Account</PanelTitle>
      </PanelHeader>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-200">Export your data</p>
            <p className="text-xs text-slate-500">Download everything as a JSON file.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={handleExport} loading={exporting}>
            <Download className="size-3.5" /> Export
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3">
          <div>
            <p className="text-sm font-medium text-slate-200">Reset progress</p>
            <p className="text-xs text-slate-500">Clears XP, quests, workouts, and logs. Keeps your profile info.</p>
          </div>
          <Button size="sm" variant="danger" onClick={() => setResetOpen(true)}>
            <RotateCcw className="size-3.5" /> Reset
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3">
          <div>
            <p className="text-sm font-medium text-slate-200">Delete account data</p>
            <p className="text-xs text-slate-500">
              Erases all your app data and signs you out. Removing your login credentials entirely requires a support request.
            </p>
          </div>
          <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-3.5" /> Delete
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset Progress"
        message="This permanently deletes your quests, workouts, nutrition/water/weight logs, achievements, and coins. Your profile info stays. This cannot be undone."
        confirmLabel="Reset Everything"
        danger
        loading={resetting}
        onConfirm={handleReset}
        onCancel={() => setResetOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Account Data"
        message="This permanently erases all your data from LEVEL UP MULLICK and signs you out. This cannot be undone."
        confirmLabel="Delete Everything"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </Panel>
  )
}
