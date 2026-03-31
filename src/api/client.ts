import type { CoachPlan, PublishResult } from '../types'

const BASE = 'https://api.misapi.org'

export async function publishPlan(plan: CoachPlan): Promise<PublishResult> {
  const res = await fetch(`${BASE}/coach/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => 'Unknown error')
    throw new Error(`Failed to publish plan: ${msg}`)
  }
  return res.json() as Promise<PublishResult>
}
