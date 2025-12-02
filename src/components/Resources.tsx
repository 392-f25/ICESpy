import {
  BellRing,
  Camera,
  DoorClosed,
  FileX2,
  Home,
  NotebookPen,
  PhoneCall,
  ShieldCheck,
  ShieldOff,
  type LucideIcon,
} from 'lucide-react'

type Tone = 'emerald' | 'cyan' | 'amber' | 'violet' | 'sky'

type RightCard = {
  title: string
  summary: string
  detail: string
  icon: LucideIcon
  tone: Tone
}

const tonePalette: Record<Tone, { border: string; glow: string; icon: string; iconBg: string }> = {
  emerald: {
    border: 'border-emerald-400/40',
    glow: 'from-emerald-500/25 via-emerald-500/10 to-transparent',
    icon: 'text-emerald-200',
    iconBg: 'bg-emerald-500/15',
  },
  cyan: {
    border: 'border-cyan-300/40',
    glow: 'from-cyan-400/25 via-cyan-400/10 to-transparent',
    icon: 'text-cyan-200',
    iconBg: 'bg-cyan-500/15',
  },
  amber: {
    border: 'border-amber-400/40',
    glow: 'from-amber-500/25 via-amber-500/10 to-transparent',
    icon: 'text-amber-100',
    iconBg: 'bg-amber-500/15',
  },
  violet: {
    border: 'border-violet-400/40',
    glow: 'from-violet-500/25 via-violet-500/10 to-transparent',
    icon: 'text-violet-100',
    iconBg: 'bg-violet-500/15',
  },
  sky: {
    border: 'border-sky-400/40',
    glow: 'from-sky-400/25 via-sky-400/10 to-transparent',
    icon: 'text-sky-100',
    iconBg: 'bg-sky-500/15',
  },
}

const rights: RightCard[] = [
  {
    title: 'You have the right not to open the door',
    summary: 'Speak through a closed door or window. ICE/CBP can only enter with consent or a judge-signed warrant.',
    detail: 'Ask for the warrant to be slipped under the door. Administrative warrants (I-200/I-205) do not allow entry without permission.',
    icon: DoorClosed,
    tone: 'emerald',
  },
  {
    title: 'You have the right to remain silent & not sign',
    summary: 'You can say, “I am exercising my right to remain silent.” Do not sign anything without a lawyer.',
    detail: 'If you choose to speak, ask for an attorney first. Signing papers can harm your immigration case.',
    icon: ShieldOff,
    tone: 'cyan',
  },
  {
    title: 'You have the right not to consent to a warrantless search',
    summary: 'You can refuse searches of your body, car, or home without a judicial warrant.',
    detail: 'Say clearly: “I do not consent to a search.” Keep your hands visible and stay calm.',
    icon: ShieldCheck,
    tone: 'amber',
  },
  {
    title: 'You have the right to record and take notes',
    summary: 'You may take photos, video, and document details as long as you do not interfere or threaten safety.',
    detail: 'State you are recording. Capture names, badge numbers, time, location, and what was said or taken.',
    icon: Camera,
    tone: 'violet',
  },
  {
    title: 'You can report activity to the rapid response hotline',
    summary: 'WA Immigrant Solidarity Network can verify, document, and send support teams.',
    detail: 'Call 1-844-724-3737 to report ICE/CBP activity or request urgent assistance.',
    icon: PhoneCall,
    tone: 'sky',
  },
]

const quickSteps = [
  {
    title: 'Stay calm and keep the door closed',
    body: 'You can talk through the door. Opening it can be seen as consent to enter.',
  },
  {
    title: 'Ask for a judge-signed warrant',
    body: 'Look for your name, address, and a judge’s signature. Administrative warrants are not enough.',
  },
  {
    title: 'Name your rights out loud',
    body: 'Say you do not consent to entry or a search and that you want to speak to a lawyer.',
  },
  {
    title: 'Document everything safely',
    body: 'Record, take photos, and write down badge numbers, names, and what happened.',
  },
]

const stayConnected = [
  {
    title: 'Stay updated',
    body: 'Visit waisn.org for alerts, trainings, and resources in multiple languages.',
    href: 'https://www.waisn.org',
  },
  {
    title: 'Create a safety plan',
    body: 'Share the hotline number with family, choose an emergency contact, and keep copies of key documents.',
    href: 'https://www.waisn.org/legal',
  },
]

const hotlineNumber = '1-844-724-3737'

const Resources = () => {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-10 lg:py-14 space-y-10">
        <section className="relative overflow-hidden rounded-3xl border border-emerald-400/35 bg-slate-900/70 shadow-2xl shadow-emerald-900/40 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950" />
          <div className="relative p-7 md:p-10 grid gap-8 md:grid-cols-[1.4fr_1fr] items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
                Immigration safety • ICE / CBP
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold leading-tight text-white">
                Your rights, clearly stated.
                <span className="block text-emerald-200 text-lg mt-2">Keep this within reach.</span>
              </h1>
              <p className="text-slate-100 text-lg md:text-xl max-w-2xl">
                You have choices in every interaction. These reminders center safety, consent, and rapid response so you can
                protect yourself and your community.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`tel:${hotlineNumber.replace(/-/g, '')}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 text-slate-950 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5 hover:shadow-emerald-500/50"
                >
                  <PhoneCall className="h-4 w-4" />
                  Call the hotline: {hotlineNumber}
                </a>
                <a
                  href="https://www.waisn.org"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/50 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/10 hover:-translate-y-0.5"
                >
                  <BellRing className="h-4 w-4" />
                  waisn.org resources
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-6 backdrop-blur">
                <div className="flex items-center gap-3 text-sm text-emerald-100 font-semibold uppercase tracking-wide">
                  <Home className="h-5 w-5" />
                  If agents are at your door
                </div>
                <div className="mt-4 space-y-3 text-slate-100 text-sm leading-relaxed">
                  <p>Do not open the door. Ask who they are through the door and request they slide any warrant underneath.</p>
                  <p>Look for your name, address, a judge&apos;s signature, and a recent date. If it is not a judicial warrant, you can refuse entry.</p>
                  <p>Say clearly: “I do not consent to entry or a search. I choose to remain silent. I want to speak to a lawyer.”</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">Key protections</p>
              <h2 className="text-2xl font-semibold text-white mt-1">Remember these rights in the moment</h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              Use your words, stay calm, keep the record.
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {rights.map((item) => {
              const palette = tonePalette[item.tone]
              const Icon = item.icon
              return (
                <article
                  key={item.title}
                  className={`relative overflow-hidden rounded-2xl border ${palette.border} bg-slate-900/70 backdrop-blur`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${palette.glow}`} />
                  <div className="relative p-5 flex gap-4">
                    <div className={`mt-1 h-12 w-12 rounded-xl ${palette.iconBg} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${palette.icon}`} />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-semibold text-white leading-snug">{item.title}</h3>
                      <p className="text-sm text-emerald-50/90 font-semibold">{item.summary}</p>
                      <p className="text-sm text-slate-200 leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-emerald-400/25 bg-slate-900/70 p-6 shadow-lg shadow-emerald-900/30">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-emerald-200">
              <NotebookPen className="h-4 w-4" />
              If agents arrive
            </div>
            <h3 className="text-xl font-semibold text-white mt-2">Quick steps to protect yourself</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {quickSteps.map((step) => (
                <div key={step.title} className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4">
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="text-sm text-slate-200 mt-1 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-cyan-400/30 bg-slate-900/70 p-6 shadow-lg shadow-cyan-900/30 space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-200">
              <BellRing className="h-4 w-4" />
              Report and connect
            </div>
            <div className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-4">
              <p className="text-sm text-cyan-100 font-semibold uppercase tracking-wide">Deportation defense hotline</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-2xl font-bold text-white">{hotlineNumber}</p>
                  <p className="text-sm text-slate-200">WA Immigrant Solidarity Network rapid response</p>
                </div>
                <a
                  href={`tel:${hotlineNumber.replace(/-/g, '')}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 text-slate-950 px-3 py-2 text-sm font-semibold shadow-md shadow-cyan-400/40 transition hover:-translate-y-0.5"
                >
                  <PhoneCall className="h-4 w-4" />
                  Call now
                </a>
              </div>
              <p className="mt-2 text-xs text-cyan-50/90">
                Use for urgent reports of ICE/CBP activity, detentions, and to request verification or accompaniment.
              </p>
            </div>
            <div className="space-y-3">
              {stayConnected.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group block rounded-xl border border-slate-700/70 bg-slate-900/70 p-4 transition hover:border-cyan-300/40 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-sm text-slate-200 mt-1 leading-relaxed">{item.body}</p>
                    </div>
                    <span className="text-xs text-cyan-200 font-semibold opacity-0 transition group-hover:opacity-100">
                      Visit →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-400/25 bg-slate-900/70 p-5 text-center shadow-inner shadow-emerald-900/30">
          <p className="text-sm text-emerald-100 font-semibold uppercase tracking-[0.22em]">Remember</p>
          <p className="mt-2 text-slate-200 text-sm leading-relaxed">
            This page is for educational purposes only and does not constitute legal advice. Laws and policies change—verify
            with a trusted attorney or community organization.
          </p>
        </section>
      </div>
    </div>
  )
}

export default Resources
