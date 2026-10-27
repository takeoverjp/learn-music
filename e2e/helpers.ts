import { test as base, expect, type Page } from '@playwright/test'

// Independent acceptance table, not derived from the production chord definitions.
export const notationCases = [
  { label: 'C', notes: 'C4、E4、G4', ys: [125, 115, 105], accidentals: [], ledger: [125] },
  { label: 'Cm', notes: 'C4、Eフラット4、G4', ys: [125, 115, 105], accidentals: [['♭', 115]], ledger: [125] },
  { label: 'D', notes: 'D4、Fシャープ4、A4', ys: [120, 110, 100], accidentals: [['♯', 110]], ledger: [] },
  { label: 'Dm', notes: 'D4、F4、A4', ys: [120, 110, 100], accidentals: [], ledger: [] },
  { label: 'E', notes: 'E4、Gシャープ4、B4', ys: [115, 105, 95], accidentals: [['♯', 105]], ledger: [] },
  { label: 'Em', notes: 'E4、G4、B4', ys: [115, 105, 95], accidentals: [], ledger: [] },
  { label: 'F', notes: 'F4、A4、C5', ys: [110, 100, 90], accidentals: [], ledger: [] },
  { label: 'Fm', notes: 'F4、Aフラット4、C5', ys: [110, 100, 90], accidentals: [['♭', 100]], ledger: [] },
  { label: 'G', notes: 'G4、B4、D5', ys: [105, 95, 85], accidentals: [], ledger: [] },
  { label: 'Gm', notes: 'G4、Bフラット4、D5', ys: [105, 95, 85], accidentals: [['♭', 95]], ledger: [] },
  { label: 'A', notes: 'A4、Cシャープ5、E5', ys: [100, 90, 80], accidentals: [['♯', 90]], ledger: [] },
  { label: 'Am', notes: 'A4、C5、E5', ys: [100, 90, 80], accidentals: [], ledger: [] },
  { label: 'B', notes: 'B4、Dシャープ5、Fシャープ5', ys: [95, 85, 75], accidentals: [['♯', 85], ['♯', 75]], ledger: [] },
  { label: 'Bm', notes: 'B4、D5、Fシャープ5', ys: [95, 85, 75], accidentals: [['♯', 75]], ledger: [] },
] as const

type Fixtures = { expectedConsoleErrors: RegExp[]; runtimeChecks: void }

export const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern -- Playwright requires fixture arguments to be destructured.
  expectedConsoleErrors: async ({}, use) => { await use([]) },
  runtimeChecks: [async ({ page, expectedConsoleErrors }, use) => {
    const errors: string[] = []
    const consoleErrors: string[] = []
    const externalRequests: string[] = []
    const failedRequests: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('request', (request) => {
      const url = new URL(request.url())
      if (['http:', 'https:'].includes(url.protocol) && url.origin !== 'http://127.0.0.1:4173') {
        externalRequests.push(request.url())
      }
    })
    page.on('requestfailed', (request) => failedRequests.push(request.url()))
    await use()
    expect(errors, 'uncaught browser errors').toEqual([])
    expect(consoleErrors.filter((message) => !expectedConsoleErrors.some((pattern) => pattern.test(message))),
      'unexpected console errors').toEqual([])
    expect(externalRequests, 'all assets, including notation fonts, must be bundled').toEqual([])
    expect(failedRequests, 'failed asset requests').toEqual([])
  }, { auto: true }],
})

export { expect }

export const choices = (page: Page) => page.getByRole('group', { name: 'コード名を選んでください' }).getByRole('button')
export const staff = (page: Page) => page.getByRole('img', { name: /^ト音記号の五線譜。/ })
export const next = (page: Page) => page.getByRole('button', { name: '次の問題', exact: true })

export async function openQuiz(page: Page, index?: number) {
  await page.addInitScript((value) => { Math.random = () => value }, index === undefined ? 0 : (index + 0.25) / 14)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'このコードは？' })).toBeVisible()
  await expect(staff(page).locator('svg')).toHaveCount(1)
  await page.evaluate(() => document.fonts.ready)
}

export async function expectScore(page: Page, correct: number, answered: number) {
  await expect(page.getByLabel('成績')).toHaveText(`正解数 ${correct}回答数 ${answered}`)
}

export async function expectNotation(page: Page, item: typeof notationCases[number]) {
  const image = staff(page)
  await expect(image).toHaveAttribute('aria-label', `ト音記号の五線譜。下から ${item.notes}。`)
  const svg = image.locator('svg')
  await expect(svg).toHaveAttribute('viewBox', '0 0 320 180')
  await expect(svg).toHaveAttribute('width', '320')
  await expect(svg).toHaveAttribute('height', '180')
  const notation = await svg.evaluate((element) => {
    const heads = [...element.querySelectorAll('.vf-notehead > text:first-child')]
    const accidentals = [...element.querySelectorAll('.vf-notehead > text:not(:first-child)')]
    return {
      clefs: [...element.querySelectorAll('.vf-clef text')].map((text) => text.textContent),
      heads: heads.map((text) => ({ glyph: text.textContent, x: Number(text.getAttribute('x')), y: Number(text.getAttribute('y')) })),
      accidentals: accidentals.map((text) => ({ glyph: text.textContent, x: Number(text.getAttribute('x')), y: Number(text.getAttribute('y')) })),
      lines: [...element.querySelectorAll('.vf-stave > path')].map((path) => path.getAttribute('d')),
      ledger: [...element.querySelectorAll('.vf-stavenote > path')].map((path) => path.getAttribute('d')),
    }
  })
  expect(notation.clefs).toEqual(['\uE050'])
  expect(notation.heads.map((head) => head.glyph)).toEqual(['\uE0A2', '\uE0A2', '\uE0A2'])
  expect(notation.heads.map((head) => head.y)).toEqual(item.ys)
  expect(new Set(notation.heads.map((head) => head.x)).size).toBe(1)
  expect(notation.accidentals.map(({ glyph, y }) => [glyph, y]))
    .toEqual(item.accidentals.map(([symbol, y]) => [symbol === '♭' ? '\uE260' : '\uE262', y]))
  for (const accidental of notation.accidentals) {
    expect(accidental.x).toBeLessThan(notation.heads[0]!.x)
  }
  expect(notation.lines).toEqual([75.5, 85.5, 95.5, 105.5, 115.5].map((y) => `M12 ${y}L308 ${y}`))
  expect(notation.ledger).toHaveLength(item.ledger.length)
  item.ledger.forEach((y, index) => expect(notation.ledger[index]).toMatch(new RegExp(`^M[\\d.]+ ${y}L[\\d.]+ ${y}$`)))
  expect(await page.evaluate(() => document.fonts.check('40px Bravura'))).toBe(true)
}
