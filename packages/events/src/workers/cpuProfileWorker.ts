/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { Session, Profiler, Runtime } from 'node:inspector'
import { logger } from '@opencrvs/commons'

/** How long each profile runs for. */
const PROFILE_MS = 20_000
/** Gap between profiles, so the service spends most of its time unprofiled. */
const IDLE_MS = 40_000
/** Wait before the first profile, to let a run get past its login phase. */
const START_DELAY_MS = 60_000
/** How many frames to report. Enough to see a culprit, small enough to log. */
const TOP_FRAMES = 20

/**
 * V8 attributes samples it cannot place in JS to these synthetic frames.
 * Reported separately because they answer a different question than a hot
 * function does: heavy '(garbage collector)' means allocation pressure, and
 * heavy '(program)' means time outside JS altogether.
 */
const SYNTHETIC_FRAMES = new Set([
  '(root)',
  '(idle)',
  '(program)',
  '(garbage collector)'
])

/** Trims absolute build paths down to something readable in a log line. */
function shortenUrl(url: string) {
  if (!url) {
    return 'native'
  }

  const packageRelative = url.match(/packages\/(.+)$/)

  return packageRelative ? packageRelative[1] : url.split('/').slice(-2).join('/')
}

function frameLabel({ functionName, url, lineNumber }: Runtime.CallFrame) {
  const name = functionName || '(anonymous)'

  if (SYNTHETIC_FRAMES.has(name)) {
    return name
  }

  return `${name} @ ${shortenUrl(url)}:${lineNumber + 1}`
}

/**
 * Self time per frame, in milliseconds.
 *
 * `samples[i]` is the node the profiler saw on the stack top, and
 * `timeDeltas[i]` is the microseconds attributed to that observation, so
 * summing deltas by node gives self time rather than total time. Total time
 * would just point at the request handler at the top of every stack; self time
 * points at whatever is actually burning the thread.
 */
function selfTimeByFrame(profile: Profiler.Profile) {
  const framesById = new Map(
    profile.nodes.map((node) => [node.id, frameLabel(node.callFrame)])
  )
  const selfMs = new Map<string, number>()
  const samples = profile.samples ?? []
  const timeDeltas = profile.timeDeltas ?? []

  samples.forEach((nodeId, index) => {
    const label = framesById.get(nodeId)

    if (!label) {
      return
    }

    const deltaMs = (timeDeltas[index] ?? 0) / 1000

    selfMs.set(label, (selfMs.get(label) ?? 0) + deltaMs)
  })

  return selfMs
}

async function runProfile(session: Session) {
  await new Promise<void>((resolve, reject) => {
    session.post('Profiler.start', (err) => (err ? reject(err) : resolve()))
  })

  await new Promise((resolve) => setTimeout(resolve, PROFILE_MS))

  const profile = await new Promise<Profiler.Profile>((resolve, reject) => {
    session.post('Profiler.stop', (err, result) =>
      err ? reject(err) : resolve(result.profile)
    )
  })

  const selfMs = selfTimeByFrame(profile)
  const wallMs = (profile.endTime - profile.startTime) / 1000
  const ranked = [...selfMs.entries()].sort(([, a], [, b]) => b - a)
  const accountedMs = [...selfMs.values()].reduce((sum, ms) => sum + ms, 0)
  const idleMs = selfMs.get('(idle)') ?? 0

  logger.info({
    msg: 'cpuProfile',
    wallMs: Math.round(wallMs),
    /* Everything except '(idle)': how much of the window the thread was busy. */
    busyMs: Math.round(accountedMs - idleMs),
    sampleCount: (profile.samples ?? []).length,
    top: ranked.slice(0, TOP_FRAMES).map(([frame, ms]) => ({
      frame,
      selfMs: Math.round(ms),
      pctOfBusy:
        accountedMs > idleMs
          ? Number(((100 * ms) / (accountedMs - idleMs)).toFixed(1))
          : 0
    }))
  })
}

/**
 * Repeatedly profiles this process and logs the frames burning the most thread
 * time.
 *
 * The saturation worker establishes *that* the event loop is blocked; this
 * says *what* is blocking it. It reports an aggregate rather than writing a
 * .cpuprofile because logs are the only channel out of these pods — a full
 * profile would need a volume and a way to fetch the file.
 *
 * This is a diagnostic, not a permanent feature: sampling costs a few percent
 * of throughput, so it should not outlive the question it answers.
 */
export function startCpuProfileWorker() {
  const session = new Session()

  try {
    session.connect()
  } catch (error) {
    logger.warn(
      `CPU profile worker: could not connect inspector session: ${
        error instanceof Error ? error.message : String(error)
      }`
    )

    return
  }

  session.post('Profiler.enable')

  const loop = async () => {
    for (;;) {
      try {
        await runProfile(session)
      } catch (error) {
        logger.warn(
          `CPU profile worker: profile failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      }

      await new Promise((resolve) => setTimeout(resolve, IDLE_MS))
    }
  }

  setTimeout(() => void loop(), START_DELAY_MS).unref()
}
