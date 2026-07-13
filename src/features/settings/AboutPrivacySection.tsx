import { useState } from 'react'
import { Info, ShieldCheck } from 'lucide-react'
import { Panel, PanelHeader, PanelTitle } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

export function AboutPrivacySection() {
  const [aboutOpen, setAboutOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>About</PanelTitle>
      </PanelHeader>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => setAboutOpen(true)}>
          <Info className="size-3.5" /> About Level Up
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setPrivacyOpen(true)}>
          <ShieldCheck className="size-3.5" /> Privacy
        </Button>
      </div>

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About LEVEL UP MULLICK">
        <div className="flex flex-col gap-3 text-sm text-slate-300">
          <p>
            <strong className="text-slate-100">LEVEL UP MULLICK</strong> — Train. Evolve. Ascend. An original dark fantasy RPG
            fitness and habit tracker. Complete quests, log workouts, track nutrition, and grow your character's attributes as
            you build real-life discipline and fitness.
          </p>
          <p className="text-xs text-slate-500">
            This app uses general RPG progression concepts (levels, ranks, XP) but has no affiliation with any anime, game, or
            copyrighted franchise. All artwork, badges, and iconography are original.
          </p>
          <p className="text-xs text-slate-500">
            Calorie, macro, and fitness calculations shown throughout the app are general estimates only and are not medical
            advice. Consult a healthcare professional for personalized guidance.
          </p>
        </div>
      </Modal>

      <Modal open={privacyOpen} onClose={() => setPrivacyOpen(false)} title="Privacy">
        <div className="flex flex-col gap-3 text-sm text-slate-300">
          <p>Your data belongs to you. LEVEL UP MULLICK stores only what's needed to run the app:</p>
          <ul className="list-inside list-disc space-y-1 text-slate-400">
            <li>Your account email (for authentication only)</li>
            <li>Profile info you provide (name, body stats, goals)</li>
            <li>Quests, workouts, nutrition/water/weight logs, and progression data you create</li>
          </ul>
          <p className="text-slate-400">
            All data is protected by Row Level Security in Supabase — only you can read or write your own records. We do not
            include advertisements, tracking scripts, or sell/share your data with third parties. You can export or permanently
            erase your data at any time from this Settings page.
          </p>
        </div>
      </Modal>
    </Panel>
  )
}
