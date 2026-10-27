import { expect, test } from './helpers'

for (const failure of ['font loading', 'SVG drawing'] as const) {
  test(`${failure} failure stops the quiz and offers reload`, async ({ page, expectedConsoleErrors }) => {
    expectedConsoleErrors.push(/Injected notation failure/, /Quiz (initialization|rendering) failed/)
    await page.addInitScript((kind) => {
      if (kind === 'font loading') {
        Object.defineProperty(Object.getPrototypeOf(document.fonts), 'load', {
          value: () => Promise.reject(new Error('Injected notation failure')),
          configurable: true,
        })
      } else {
        document.createElementNS = new Proxy(document.createElementNS, {
          apply(target, receiver, args) {
            if (args[0] === 'http://www.w3.org/2000/svg' && args[1] === 'svg') {
              throw new Error('Injected notation failure')
            }
            return Reflect.apply(target, receiver, args)
          },
        })
      }
    }, failure)
    await page.goto('/')
    await expect(page.getByRole('alert')).toContainText('楽譜の読み込みまたは描画に失敗しました。')
    await expect(page.getByRole('heading', { name: 'クイズを表示できませんでした' })).toBeVisible()
    await expect(page.getByRole('group', { name: 'コード名を選んでください' })).toHaveCount(0)
    await expect(page.getByRole('img')).toHaveCount(0)
    await Promise.all([
      page.waitForEvent('framenavigated', (frame) => frame === page.mainFrame()),
      page.getByRole('button', { name: '再読み込み', exact: true }).click(),
    ])
    await expect(page.getByRole('alert')).toBeVisible()
  })
}
