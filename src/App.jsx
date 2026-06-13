import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  artifactPrompts,
  chapters,
  initialStats,
} from './data/gameContent'
import { getAssetUrl, sceneLayers } from './data/generatedAssets'

const SECRET_CODE = 'TOISHAN1910'

const defaultState = {
  phase: 'title',
  chapterIndex: 0,
  playerX: chapters[0].playerStart,
  stats: initialStats,
  discoveredHotspots: {},
  collectedArtifacts: [],
  chapterChoices: {},
  storyFlags: { colorProgress: 0 },
  activeHotspotId: null,
  dialogueOpen: false,
  choiceOpen: false,
  artifactOpen: false,
  collectionOpen: false,
  questOpen: false,
  chapterCompleteOpen: false,
  finalEndingOpen: false,
  secretEndingOpen: false,
  endingKey: undefined,
  toast: null,
  secretCodeInput: '',
  secretCodeError: '',
  secretUnlocked: false,
}

const statMeta = {
  wealth: { label: 'Wealth', tint: 'from-amber-400 to-orange-500' },
  trust: { label: 'Trust', tint: 'from-emerald-400 to-teal-500' },
  legacy: { label: 'Legacy', tint: 'from-sky-400 to-indigo-500' },
}

const endings = {
  wealth: {
    title: 'Ending: The Builder of Fortune',
    text: 'Liang learns how to turn risk into prosperity. His name becomes associated with endurance, enterprise, and the material shape of success.',
    imageKey: 'endingWealth',
  },
  trust: {
    title: 'Ending: The Keeper of Bridges',
    text: 'Liang becomes the person others look for when they arrive afraid. His true wealth lives in the trust he multiplies.',
    imageKey: 'endingTrust',
  },
  legacy: {
    title: 'Ending: The Inheritance of Care',
    text: 'Liang chooses to leave behind more than comfort. He invests in memory, education, and community, becoming part of what future generations inherit.',
    imageKey: 'endingLegacy',
  },
}

function applyChoice(stats, effects) {
  const next = { ...stats }

  Object.entries(effects).forEach(([key, value]) => {
    next[key] = Math.max(0, next[key] + value)
  })

  return next
}

function pickEnding(stats, chosenEnding) {
  if (chosenEnding) return chosenEnding
  return Object.entries(stats).sort((a, b) => b[1] - a[1])[0][0]
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function normalizeSecretCode(value) {
  return value.trim().toUpperCase()
}

function App() {
  const [game, setGame] = useState(defaultState)
  const chapter = chapters[game.chapterIndex]
  const layers = sceneLayers[chapter.sceneId]
  const discoveredInChapter = game.discoveredHotspots[chapter.id] || []
  const chapterArtifactFound =
    !chapter.artifactId || game.collectedArtifacts.includes(chapter.artifactId)
  const chapterReadyForChoice =
    !!chapter.choice &&
    !game.chapterChoices[chapter.id] &&
    discoveredInChapter.length === chapter.hotspots.length &&
    chapterArtifactFound
  const activeHotspot = chapter.hotspots.find(
    (item) => item.id === game.activeHotspotId,
  )
  const chapterChoiceResult = chapter.choice.options.find(
    (option) => option.id === game.chapterChoices[chapter.id],
  )
  const nearbyHotspot = findNearbyHotspot(chapter.hotspots, game.playerX)

  const colorStrength = useMemo(() => {
    if (chapter.id === 'legacy') return 1
    return Math.min(0.85, game.storyFlags.colorProgress)
  }, [chapter.id, game.storyFlags.colorProgress])

  useEffect(() => {
    if (!game.toast) return undefined

    const timer = window.setTimeout(() => {
      setGame((current) => ({ ...current, toast: null }))
    }, 1800)

    return () => window.clearTimeout(timer)
  }, [game.toast])

  useEffect(() => {
    if (!['playing', 'chapter-intro'].includes(game.phase)) return undefined

    const onKeyDown = (event) => {
      if (
        game.dialogueOpen ||
        game.choiceOpen ||
        game.artifactOpen ||
        game.chapterCompleteOpen ||
        game.finalEndingOpen ||
        game.secretEndingOpen ||
        game.questOpen
      ) {
        if (event.key.toLowerCase() === 'e') {
          setGame((current) => ({
            ...current,
            dialogueOpen: false,
            artifactOpen: false,
          }))
        }
        return
      }

      if (event.key === 'ArrowLeft') {
        movePlayer(-3)
      }

      if (event.key === 'ArrowRight') {
        movePlayer(3)
      }

      if (event.key.toLowerCase() === 'e') {
        interactOrChoose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  function movePlayer(delta) {
    setGame((current) => ({
      ...current,
      playerX: clamp(
        current.playerX + delta,
        chapter.playerStart,
        chapter.playerEnd,
      ),
    }))
  }

  function startGame() {
    setGame((current) => ({ ...current, phase: 'chapter-intro' }))
  }

  function continueToPlay() {
    setGame((current) => ({ ...current, phase: 'playing', dialogueOpen: true }))
  }

  function openHotspot(hotspotId) {
    const hotspot = chapter.hotspots.find((item) => item.id === hotspotId)
    if (!hotspot) return

    setGame((current) => {
      const chapterSeen = current.discoveredHotspots[chapter.id] || []
      const alreadySeen = chapterSeen.includes(hotspotId)
      const nextSeen = alreadySeen ? chapterSeen : [...chapterSeen, hotspotId]
      const artifactUnlocked =
        hotspot.unlocksArtifact &&
        chapter.artifactId &&
        !current.collectedArtifacts.includes(chapter.artifactId)
      const nextArtifacts = artifactUnlocked
        ? [...current.collectedArtifacts, chapter.artifactId]
        : current.collectedArtifacts
      const colorGain = alreadySeen ? 0 : hotspot.colorize || 0.08

      return {
        ...current,
        activeHotspotId: hotspotId,
        dialogueOpen: !artifactUnlocked,
        artifactOpen: artifactUnlocked,
        discoveredHotspots: {
          ...current.discoveredHotspots,
          [chapter.id]: nextSeen,
        },
        collectedArtifacts: nextArtifacts,
        storyFlags: {
          colorProgress: Math.min(1, current.storyFlags.colorProgress + colorGain),
        },
        toast: alreadySeen
          ? null
          : artifactUnlocked
            ? `Artefact found: ${hotspot.label}`
            : `Memory restored: ${hotspot.label}`,
      }
    })
  }

  function interactOrChoose() {
    if (nearbyHotspot) {
      openHotspot(nearbyHotspot.id)
      return
    }

    if (chapterReadyForChoice) {
      setGame((current) => ({ ...current, choiceOpen: true }))
    }
  }

  function resolveChoice(option) {
    const updatedStats = applyChoice(game.stats, option.effects)
    const isLast = game.chapterIndex === chapters.length - 1

    setGame((current) => ({
      ...current,
      stats: updatedStats,
      chapterChoices: {
        ...current.chapterChoices,
        [chapter.id]: option.id,
      },
      choiceOpen: false,
      dialogueOpen: false,
      activeHotspotId: `${chapter.id}-choice-${option.id}`,
      chapterCompleteOpen: !isLast,
      finalEndingOpen: isLast,
      phase: isLast ? 'ending' : current.phase,
      endingKey: isLast ? pickEnding(updatedStats, option.ending) : undefined,
      toast: `Choice made: ${option.label}`,
    }))
  }

  function nextChapter() {
    if (game.chapterIndex === chapters.length - 1) {
      setGame((current) => ({
        ...current,
        finalEndingOpen: false,
        questOpen: true,
      }))
      return
    }

    const nextIndex = game.chapterIndex + 1
    setGame((current) => ({
      ...current,
      chapterIndex: nextIndex,
      phase: 'chapter-intro',
      playerX: chapters[nextIndex].playerStart,
      dialogueOpen: false,
      choiceOpen: false,
      artifactOpen: false,
      activeHotspotId: null,
      chapterCompleteOpen: false,
      toast: `Chapter ${chapters[nextIndex].number} begins`,
    }))
  }

  function jumpToChapter(index) {
    setGame((current) => ({
      ...current,
      chapterIndex: index,
      phase: 'chapter-intro',
      playerX: chapters[index].playerStart,
      dialogueOpen: false,
      choiceOpen: false,
      artifactOpen: false,
      collectionOpen: false,
      activeHotspotId: null,
      chapterCompleteOpen: false,
      finalEndingOpen: false,
      questOpen: false,
      secretEndingOpen: false,
      toast: `Jumped to Chapter ${chapters[index].number}`,
    }))
  }

  function submitSecretCode() {
    const normalized = normalizeSecretCode(game.secretCodeInput)

    if (!normalized) {
      setGame((current) => ({
        ...current,
        secretCodeError: 'Enter the code from the association representative.',
      }))
      return
    }

    if (normalized !== SECRET_CODE) {
      setGame((current) => ({
        ...current,
        secretCodeError: 'That code does not unlock the hidden epilogue.',
      }))
      return
    }

    setGame((current) => ({
      ...current,
      secretUnlocked: true,
      secretCodeError: '',
      questOpen: false,
      secretEndingOpen: true,
      toast: 'Secret epilogue unlocked',
    }))
  }

  const contextualActionLabel = chapterReadyForChoice
    ? 'Make Choice'
    : nearbyHotspot
      ? `Read ${nearbyHotspot.label}`
      : 'Interact'
  const contextualActionHint = chapterReadyForChoice
    ? 'Liang has seen enough of this moment. It is time to decide.'
    : nearbyHotspot
      ? `${nearbyHotspot.label} is within reach.`
      : 'Move toward a glowing memory, then tap Interact or press E.'

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-950 text-stone-100">
      <AnimatePresence mode="wait">
        {game.phase === 'title' ? (
          <TitleScreen key="title" onStart={startGame} />
        ) : (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative min-h-screen"
          >
            <SceneView
              chapter={chapter}
              layers={layers}
              playerX={game.playerX}
              onHotspot={openHotspot}
              colorStrength={colorStrength}
              discoveredInChapter={discoveredInChapter}
              nearbyHotspotId={nearbyHotspot?.id}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
            <div className="pointer-events-none absolute inset-0 bg-grain opacity-20" />

            <header className="absolute left-0 right-0 top-0 z-20 p-4 md:p-6">
              <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[28px] border border-white/10 bg-black/35 p-4 shadow-glow backdrop-blur-md md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                  <p className="font-body text-xs uppercase tracking-[0.35em] text-stone-300/80">
                    Nanyang: The Road from Toishan
                  </p>
                  <h1 className="font-display text-3xl text-paper md:text-5xl">
                    Chapter {chapter.number}: {chapter.title}
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-stone-200/85 md:text-base">
                    {chapter.subtitle}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-stone-300/75">
                    <span>
                      Memories {discoveredInChapter.length}/{chapter.hotspots.length}
                    </span>
                    <span>Color {Math.round(colorStrength * 100)}%</span>
                    <span>Chapter {chapter.number}/{chapters.length}</span>
                  </div>
                </div>
                <StatsPanel stats={game.stats} />
              </div>
            </header>

            <footer className="absolute bottom-0 left-0 right-0 z-20 p-4 md:p-6">
              <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[28px] border border-white/10 bg-black/45 p-4 backdrop-blur-md">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="text-sm text-stone-200/85">
                    <p>{chapter.era}</p>
                    <p className="mt-1 text-stone-300/70">
                      Move with arrows or touch controls. Press{' '}
                      <span className="font-semibold text-paper">E</span> near glowing memories.
                    </p>
                  </div>
                  <div className="max-w-xl rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-200/85">
                    <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/70">
                      Current Prompt
                    </p>
                    <p className="mt-1">{contextualActionHint}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 md:hidden">
                  <ControlButton onClick={() => movePlayer(-10)} size="large">
                    Left
                  </ControlButton>
                  <ControlButton onClick={() => movePlayer(10)} size="large">
                    Right
                  </ControlButton>
                  <ControlButton
                    onClick={() =>
                      setGame((current) => ({ ...current, collectionOpen: true }))
                    }
                    size="large"
                  >
                    Artefacts
                  </ControlButton>
                  <ControlButton
                    onClick={interactOrChoose}
                    size="large"
                    variant={chapterReadyForChoice ? 'choiceReady' : 'default'}
                  >
                    {chapterReadyForChoice ? 'Choose' : 'Act'}
                  </ControlButton>
                </div>

                <div className="hidden flex-wrap items-center gap-2 md:flex">
                  <ControlButton onClick={() => movePlayer(-8)}>
                    Move Left
                  </ControlButton>
                  <ControlButton onClick={() => movePlayer(8)}>
                    Move Right
                  </ControlButton>
                  <ControlButton
                    onClick={interactOrChoose}
                    variant={chapterReadyForChoice ? 'choiceReady' : 'default'}
                  >
                    {contextualActionLabel}
                  </ControlButton>
                  <ControlButton
                    onClick={() =>
                      setGame((current) => ({ ...current, collectionOpen: true }))
                    }
                  >
                    Artefacts
                  </ControlButton>
                </div>
              </div>
            </footer>

            <DebugPanel onJump={jumpToChapter} />

            <AnimatePresence>
              {game.toast && <Toast message={game.toast} />}
            </AnimatePresence>

            <AnimatePresence>
              {game.phase === 'chapter-intro' && (
                <ChapterCard chapter={chapter} onContinue={continueToPlay} />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {game.dialogueOpen && (
                <DialogueBox
                  chapter={chapter}
                  hotspot={activeHotspot}
                  choiceResult={chapterChoiceResult}
                  onClose={() =>
                    setGame((current) => ({
                      ...current,
                      dialogueOpen: false,
                      choiceOpen: chapterReadyForChoice,
                    }))
                  }
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {game.choiceOpen && !game.chapterChoices[chapter.id] && (
                <ChoiceModal
                  choice={chapter.choice}
                  onChoose={resolveChoice}
                  onClose={() =>
                    setGame((current) => ({ ...current, choiceOpen: false }))
                  }
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {game.artifactOpen && chapter.artifactId && (
                <ArtifactModal
                  artifactId={chapter.artifactId}
                  onClose={() =>
                    setGame((current) => ({
                      ...current,
                      artifactOpen: false,
                      dialogueOpen: true,
                    }))
                  }
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {game.collectionOpen && (
                <CollectionModal
                  collectedArtifacts={game.collectedArtifacts}
                  onClose={() =>
                    setGame((current) => ({ ...current, collectionOpen: false }))
                  }
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {game.chapterCompleteOpen && chapterChoiceResult && (
                <ChapterCompleteModal
                  chapter={chapter}
                  choiceResult={chapterChoiceResult}
                  stats={game.stats}
                  onNext={nextChapter}
                  onClose={() =>
                    setGame((current) => ({
                      ...current,
                      chapterCompleteOpen: false,
                    }))
                  }
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {game.finalEndingOpen && (
                <EndingModal
                  endingKey={game.endingKey}
                  onNext={nextChapter}
                  onClose={() =>
                    setGame((current) => ({
                      ...current,
                      finalEndingOpen: false,
                    }))
                  }
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {game.questOpen && (
                <QuestModal
                  collectedArtifacts={game.collectedArtifacts}
                  secretCodeInput={game.secretCodeInput}
                  secretCodeError={game.secretCodeError}
                  onCodeChange={(value) =>
                    setGame((current) => ({
                      ...current,
                      secretCodeInput: value,
                      secretCodeError: '',
                    }))
                  }
                  onUnlock={submitSecretCode}
                  onRestart={() => setGame(defaultState)}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {game.secretEndingOpen && (
                <SecretEndingModal
                  onRestart={() => setGame(defaultState)}
                  onClose={() =>
                    setGame((current) => ({
                      ...current,
                      secretEndingOpen: false,
                    }))
                  }
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TitleScreen({ onStart }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="paper-noise relative flex min-h-screen items-end overflow-hidden"
    >
      <img
        src={getAssetUrl('title')}
        alt="Nanyang title background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/40" />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 md:px-10 md:py-16">
        <div className="max-w-3xl rounded-[32px] border border-white/10 bg-black/30 p-6 backdrop-blur-lg md:p-10">
          <p className="font-body text-xs uppercase tracking-[0.45em] text-stone-300/80">
            Fictionalised Interactive Story
          </p>
          <h1 className="mt-4 font-display text-5xl leading-none text-paper md:text-7xl">
            Nanyang:
            <span className="mt-2 block text-4xl text-stone-100 md:text-6xl">
              The Road from Toishan
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-stone-200/90 md:text-lg">
            A heritage hackathon prototype blending side-scrolling exploration,
            visual novel dialogue, and artefact discovery in a story inspired by
            Toishanese migration and Wong Ah Fook&apos;s legacy.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-300/80">
            Presented as a fictionalised interactive story rather than a strict
            historical reconstruction.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={onStart}
              className="rounded-full bg-paper px-6 py-3 font-semibold text-ink transition hover:scale-[1.02]"
            >
              Begin the Journey
            </button>
            <div className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-stone-200/80">
              Side-scroll, speak, choose, remember
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function SceneView({
  chapter,
  layers,
  playerX,
  onHotspot,
  colorStrength,
  discoveredInChapter,
  nearbyHotspotId,
}) {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {layers.map((layer) => (
        <motion.img
          key={layer.id}
          src={layer.src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            x: `${(50 - playerX) * layer.parallax}px`,
            scale: layer.scale,
            filter: `grayscale(${layer.grayscaleBase * (1 - colorStrength)}) saturate(${1 + colorStrength * layer.saturateBoost}) brightness(${layer.brightness})`,
            opacity: layer.opacity,
          }}
        />
      ))}

      <div className="absolute bottom-[17%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-stone-400/40 to-transparent" />

      {chapter.hotspots.map((hotspot) => {
        const discovered = discoveredInChapter.includes(hotspot.id)
        const isNearby = nearbyHotspotId === hotspot.id

        return (
          <button
            key={hotspot.id}
            onClick={() => onHotspot(hotspot.id)}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
          >
            <span className="relative block">
              <span
                className={`absolute inset-0 rounded-full blur-xl ${
                  isNearby ? 'bg-sky-300/30' : 'bg-amber-300/25'
                }`}
              />
              <span
                className={`block h-8 w-8 rounded-full border ${
                  discovered
                    ? 'border-emerald-200/70 bg-emerald-300/20'
                    : isNearby
                      ? 'animate-pulseGlow border-sky-200/90 bg-sky-300/35'
                      : 'animate-pulseGlow border-amber-200/80 bg-amber-300/30'
                }`}
              />
            </span>
            <span className="mt-2 block rounded-full bg-black/45 px-3 py-1 text-xs tracking-[0.2em] text-stone-100 backdrop-blur">
              {hotspot.label}
            </span>
          </button>
        )
      })}

      <motion.div
        className="absolute bottom-[18%] z-10"
        animate={{ left: `${playerX}%`, y: [0, -4, 0] }}
        transition={{
          left: { type: 'spring', stiffness: 120, damping: 18 },
          y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{ x: '-50%' }}
      >
        <div className="relative">
          <div className="absolute bottom-0 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-black/35 blur-md" />
          <ChromaImage
            src={getAssetUrl('liang')}
            alt="Liang"
            className="relative h-[28vh] min-h-[180px] max-h-[290px] w-auto drop-shadow-[0_18px_35px_rgba(0,0,0,0.55)]"
          />
        </div>
      </motion.div>

      {chapter.id !== 'arrival' && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-[18%] right-[10%] z-10 hidden md:block"
        >
          <ChromaImage
            src={getAssetUrl(chapter.id === 'clan-hall' ? 'elder' : 'wong')}
            alt=""
            className="h-[30vh] min-h-[190px] max-h-[300px] w-auto opacity-90 drop-shadow-[0_14px_28px_rgba(0,0,0,0.5)]"
          />
        </motion.div>
      )}
    </section>
  )
}

function StatsPanel({ stats }) {
  return (
    <div className="grid gap-3 md:min-w-[280px]">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key}>
          <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-stone-300/75">
            <span>{statMeta[key].label}</span>
            <span>{value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={`stat-fill h-full rounded-full bg-gradient-to-r ${statMeta[key].tint}`}
              style={{ width: `${Math.min(100, value * 18)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function DialogueBox({ chapter, hotspot, choiceResult, onClose }) {
  const lines = hotspot
    ? [
        ...chapter.dialogue,
        { speaker: hotspot.label, text: hotspot.detail },
        ...(choiceResult
          ? [{ speaker: 'Outcome', text: choiceResult.outcome }]
          : []),
      ]
    : chapter.dialogue

  return (
    <OverlayShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-4xl rounded-[32px] border border-white/10 bg-stone-950/90 p-6 shadow-glow backdrop-blur-xl"
      >
        {lines.map((line, index) => (
          <div key={`${line.speaker}-${index}`} className="mb-4 last:mb-0">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">
              {line.speaker}
            </p>
            <p className="mt-1 text-base leading-7 text-stone-100 md:text-lg">
              {line.text}
            </p>
          </div>
        ))}
        <button
          onClick={onClose}
          className="mt-4 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-paper transition hover:bg-white/10"
        >
          Continue
        </button>
        <p className="mt-3 text-xs uppercase tracking-[0.28em] text-stone-400">
          Tap continue or press E
        </p>
      </motion.div>
    </OverlayShell>
  )
}

function ChoiceModal({ choice, onChoose, onClose }) {
  return (
    <OverlayShell>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-3xl rounded-[32px] border border-white/10 bg-black/90 p-6 backdrop-blur-xl"
      >
        <p className="text-xs uppercase tracking-[0.35em] text-stone-300/65">
          Choice
        </p>
        <h2 className="mt-2 font-display text-3xl text-paper">
          What should Liang do?
        </h2>
        <p className="mt-4 text-base leading-7 text-stone-200/90">
          {choice.prompt}
        </p>
        <div className="mt-6 grid gap-3">
          {choice.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onChoose(option)}
              className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-left transition hover:border-amber-200/40 hover:bg-white/10"
            >
              <span className="block text-lg text-paper">{option.label}</span>
              <span className="mt-2 block text-sm leading-6 text-stone-300/85">
                {option.outcome}
              </span>
              <span className="mt-2 block text-sm text-stone-300/80">
                {formatEffects(option.effects)}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-5 text-sm text-stone-400 transition hover:text-stone-200"
        >
          Close
        </button>
      </motion.div>
    </OverlayShell>
  )
}

function ArtifactModal({ artifactId, onClose }) {
  const artifact = artifactPrompts.find((item) => item.id === artifactId)
  if (!artifact) return null

  return (
    <OverlayShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        className="w-full max-w-3xl rounded-[32px] border border-amber-100/15 bg-stone-950/92 p-6 backdrop-blur-xl"
      >
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">
          Artefact Unlocked
        </p>
        <div className="mt-4 grid gap-5 md:grid-cols-[220px_1fr]">
          <ChromaImage
            src={getAssetUrl(artifact.id)}
            alt={artifact.name}
            className="mx-auto h-48 w-48 rounded-[28px] border border-white/10 bg-white/5 object-contain p-4"
          />
          <div>
            <h2 className="font-display text-3xl text-paper">{artifact.name}</h2>
            <p className="mt-3 text-base leading-7 text-stone-200/90">
              {artifact.description}
            </p>
            <p className="mt-4 text-sm leading-6 text-stone-400">
              This object deepens the world&apos;s color and unlocks the closing
              heritage quest.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 rounded-full bg-paper px-5 py-2 text-sm font-semibold text-ink"
        >
          Continue
        </button>
      </motion.div>
    </OverlayShell>
  )
}

function CollectionModal({ collectedArtifacts, onClose }) {
  return (
    <OverlayShell>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-5xl rounded-[32px] border border-white/10 bg-black/90 p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-300/65">
              Collection
            </p>
            <h2 className="mt-1 font-display text-3xl text-paper">
              Heritage Artefacts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-stone-200"
          >
            Close
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {artifactPrompts.map((artifact) => {
            const unlocked = collectedArtifacts.includes(artifact.id)
            return (
              <div
                key={artifact.id}
                className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4"
              >
                <ChromaImage
                  src={getAssetUrl(artifact.id)}
                  alt={artifact.name}
                  className={`h-40 w-full rounded-[24px] object-contain p-4 ${
                    unlocked ? 'opacity-100' : 'opacity-20 grayscale'
                  }`}
                />
                <h3 className="mt-3 text-lg text-paper">{artifact.name}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-300/75">
                  {unlocked
                    ? artifact.description
                    : 'Locked until discovered in play.'}
                </p>
              </div>
            )
          })}
        </div>
      </motion.div>
    </OverlayShell>
  )
}

function ChapterCompleteModal({ chapter, choiceResult, stats, onNext, onClose }) {
  return (
    <OverlayShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-3xl rounded-[32px] border border-white/10 bg-black/90 p-6 backdrop-blur-xl"
      >
        <p className="text-xs uppercase tracking-[0.35em] text-stone-300/65">
          Chapter Complete
        </p>
        <h2 className="mt-2 font-display text-4xl text-paper">
          {chapter.title} resolved
        </h2>
        <p className="mt-4 text-base leading-7 text-stone-200/90">
          {choiceResult.outcome}
        </p>
        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.32em] text-stone-400">
            Current Standing
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="rounded-[18px] bg-black/25 p-3">
                <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                  {statMeta[key].label}
                </p>
                <p className="mt-2 text-2xl text-paper">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onNext}
            className="rounded-full bg-paper px-5 py-2 font-semibold text-ink"
          >
            Continue to Chapter {chapter.number + 1}
          </button>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 px-5 py-2 text-stone-200"
          >
            Close
          </button>
        </div>
      </motion.div>
    </OverlayShell>
  )
}

function EndingModal({ endingKey, onNext, onClose }) {
  const ending = endings[endingKey] || endings.legacy
  return (
    <OverlayShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-black/90 backdrop-blur-xl"
      >
        <div className="grid md:grid-cols-[1.2fr_0.9fr]">
          <img
            src={getAssetUrl(ending.imageKey)}
            alt={ending.title}
            className="h-[300px] w-full object-cover md:h-full"
          />
          <div className="p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-300/65">
              Final Chapter Complete
            </p>
            <h2 className="mt-2 font-display text-4xl text-paper">
              {ending.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-stone-200/90">
              {ending.text}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={onNext}
                className="rounded-full bg-paper px-5 py-2 font-semibold text-ink"
              >
                Continue
              </button>
              <button
                onClick={onClose}
                className="rounded-full border border-white/10 px-5 py-2 text-stone-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </OverlayShell>
  )
}

function QuestModal({
  collectedArtifacts,
  secretCodeInput,
  secretCodeError,
  onCodeChange,
  onUnlock,
  onRestart,
}) {
  const found = artifactPrompts.filter((artifact) =>
    collectedArtifacts.includes(artifact.id),
  )

  return (
    <OverlayShell>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl rounded-[36px] border border-amber-100/15 bg-[linear-gradient(145deg,rgba(77,46,27,0.92),rgba(15,10,8,0.96))] p-6 text-paper shadow-glow"
      >
        <p className="text-xs uppercase tracking-[0.35em] text-amber-100/70">
          Real-World Heritage Quest
        </p>
        <h2 className="mt-2 font-display text-4xl">
          Find these artefacts at the association
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-amber-50/85">
          The story you played is fictionalised, but its emotional map points back to
          real networks of migration, support, labor, and remembrance. Find these
          objects in person, then receive a code from a Toishan association representative
          to unlock the hidden epilogue.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {found.map((artifact) => (
            <div
              key={artifact.id}
              className="rounded-[26px] border border-white/10 bg-black/20 p-4"
            >
              <ChromaImage
                src={getAssetUrl(artifact.id)}
                alt={artifact.name}
                className="h-36 w-full object-contain"
              />
              <h3 className="mt-3 text-lg">{artifact.name}</h3>
              <p className="mt-2 text-sm leading-6 text-amber-50/75">
                Ask: what did this object make possible for migrants?
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-[28px] border border-white/10 bg-black/25 p-5">
          <h3 className="font-display text-2xl text-paper">Unlock Hidden Epilogue</h3>
          <p className="mt-2 text-sm leading-6 text-amber-50/80">
            After visiting the association, enter the representative&apos;s secret code.
          </p>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <input
              value={secretCodeInput}
              onChange={(event) => onCodeChange(event.target.value)}
              placeholder="Enter secret code"
              className="w-full rounded-full border border-white/15 bg-black/35 px-5 py-3 text-paper outline-none placeholder:text-stone-400"
            />
            <button
              onClick={onUnlock}
              className="rounded-full bg-paper px-6 py-3 font-semibold text-ink"
            >
              Unlock
            </button>
          </div>
          {secretCodeError ? (
            <p className="mt-3 text-sm text-rose-200">{secretCodeError}</p>
          ) : null}
        </div>
        <button
          onClick={onRestart}
          className="mt-8 rounded-full border border-white/20 px-6 py-3 text-paper"
        >
          Return to Title
        </button>
      </motion.div>
    </OverlayShell>
  )
}

function SecretEndingModal({ onRestart, onClose }) {
  return (
    <div className="absolute inset-0 z-50 bg-black">
      <img
        src={getAssetUrl('secretEpilogue')}
        alt="Secret epilogue"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
      <div className="relative z-10 flex min-h-screen items-end px-6 py-8 md:px-10 md:py-12">
        <div className="max-w-3xl rounded-[32px] border border-white/10 bg-black/40 p-6 backdrop-blur-lg md:p-8">
          <p className="text-xs uppercase tracking-[0.42em] text-amber-100/70">
            Secret Epilogue
          </p>
          <h2 className="mt-3 font-display text-4xl text-paper md:text-5xl">
            Memory Lives When Someone Returns
          </h2>
          <p className="mt-4 text-base leading-7 text-stone-100/90 md:text-lg">
            The student stands where Liang once stood. The hall is no longer only a
            room of the past. It has become a bridge, completed by those willing to
            return, remember, and carry the story forward.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onRestart}
              className="rounded-full bg-paper px-6 py-3 font-semibold text-ink"
            >
              Return to Title
            </button>
            <button
              onClick={onClose}
              className="rounded-full border border-white/20 px-6 py-3 text-paper"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChapterCard({ chapter, onContinue }) {
  return (
    <OverlayShell>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="w-full max-w-2xl rounded-[34px] border border-white/10 bg-black/85 p-8 text-center backdrop-blur-xl"
      >
        <p className="text-xs uppercase tracking-[0.45em] text-stone-300/60">
          Chapter {chapter.number}
        </p>
        <h2 className="mt-3 font-display text-5xl text-paper">{chapter.title}</h2>
        <p className="mt-4 text-base leading-7 text-stone-200/90">
          {chapter.narrator || chapter.subtitle}
        </p>
        <button
          onClick={onContinue}
          className="mt-6 rounded-full bg-paper px-6 py-3 font-semibold text-ink"
        >
          Enter Scene
        </button>
      </motion.div>
    </OverlayShell>
  )
}

function DebugPanel({ onJump }) {
  return (
    <div className="absolute right-4 top-36 z-30 hidden rounded-[24px] border border-white/10 bg-black/45 p-3 backdrop-blur-md xl:block">
      <p className="mb-2 text-[11px] uppercase tracking-[0.35em] text-stone-400">
        Debug
      </p>
      <div className="grid gap-2">
        {chapters.map((chapter, index) => (
          <button
            key={chapter.id}
            onClick={() => onJump(index)}
            className="rounded-full border border-white/10 px-3 py-2 text-left text-xs text-stone-200 transition hover:bg-white/10"
          >
            Jump to {chapter.number}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toast({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="absolute left-1/2 top-24 z-30 -translate-x-1/2 rounded-full border border-amber-200/20 bg-black/75 px-4 py-2 text-sm text-paper shadow-glow backdrop-blur-md"
    >
      {message}
    </motion.div>
  )
}

function OverlayShell({ children }) {
  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center overflow-y-auto bg-black/55 px-4 py-6 md:items-center md:py-8">
      {children}
    </div>
  )
}

function ControlButton({
  children,
  onClick,
  size = 'default',
  variant = 'default',
}) {
  const variantClass =
    variant === 'choiceReady'
      ? 'border-sky-200/60 bg-sky-300/20 text-sky-50 animate-pulseChoice hover:bg-sky-300/30'
      : 'border-white/10 bg-white/5 text-paper hover:bg-white/10'

  return (
    <button
      onClick={onClick}
      className={`rounded-full border transition ${variantClass} ${
        size === 'large'
          ? 'px-4 py-3 text-base font-semibold'
          : 'px-4 py-2 text-sm'
      }`}
    >
      {children}
    </button>
  )
}

function findNearbyHotspot(hotspots, playerX) {
  return hotspots.find((hotspot) => Math.abs(hotspot.x - playerX) <= 8)
}

function formatEffects(effects) {
  return Object.entries(effects)
    .map(
      ([key, value]) => `${value > 0 ? '+' : ''}${value} ${statMeta[key].label}`,
    )
    .join(' • ')
}

function ChromaImage({ src, alt, className }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const context = canvas.getContext('2d')
    const image = new Image()
    image.crossOrigin = 'anonymous'

    image.onload = () => {
      canvas.width = image.width
      canvas.height = image.height
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0)

      const frame = context.getImageData(0, 0, canvas.width, canvas.height)
      const data = frame.data

      for (let index = 0; index < data.length; index += 4) {
        const r = data[index]
        const g = data[index + 1]
        const b = data[index + 2]
        const isKey = g > 180 && g > r * 1.35 && g > b * 1.35

        if (isKey) {
          data[index + 3] = 0
        }
      }

      context.putImageData(frame, 0, 0)
    }

    image.src = src
    return () => {
      image.onload = null
    }
  }, [src])

  return <canvas ref={canvasRef} aria-label={alt} className={className} />
}

export default App
