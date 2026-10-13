import { test, expect } from '@playwright/test'

for (const width of [320, 360, 390, 430, 1280]) {
  test(`layout at ${width}px has no overflow and preserves mobile geometry`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Открыть за 1 990 ₽ / год' })).toBeEnabled()
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
    await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(255, 252, 245)')
    const hero = await page.locator('.hero-art img').boundingBox()
    expect(hero?.height).toBeGreaterThan(130)
    const button = await page.locator('.buy-button').boundingBox()
    expect(button?.height).toBe(56)
    if (width >= 360) expect(button?.y).toBe(574)
    await page.screenshot({ path: `test-results/paywall-${width}.png`, fullPage: true })
    expect(errors).toEqual([])
  })
}

test('both plans can be bought and both success actions return to offers', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Открыть за 1 990 ₽ / год' }).click()
  await expect(page.getByRole('heading', { name: 'Покупка сохранена' })).toBeVisible()
  await expect(page.locator('.receipt-plan')).toHaveText('Годовой доступ · 1 990 ₽')
  await page.screenshot({ path: 'test-results/success-390.png', fullPage: true })
  await page.getByRole('button', { name: 'Здорово!' }).click()
  await page.getByText('На месяц', { exact: true }).click()
  await expect(page.locator('.purchase-terms')).toContainText('Доступ на 1 месяц.')
  await page.getByRole('button', { name: 'Открыть за 299 ₽ / месяц' }).click()
  await expect(page.locator('.receipt-plan')).toHaveText('Месячный доступ · 299 ₽')
  await page.getByRole('button', { name: 'Вернуться к тарифам' }).click()
  await expect(page.getByRole('radio', { name: 'На месяц, 299 рублей' })).toBeChecked()
})

test('restore works after reload and reports no purchase on a fresh device', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Восстановить покупки' }).click()
  await expect(page.getByRole('status')).toContainText('нет активных покупок')
  await page.getByRole('button', { name: 'Открыть за 1 990 ₽ / год' }).click()
  await expect(page.getByRole('heading', { name: 'Покупка сохранена' })).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: 'Восстановить покупки' }).click()
  await expect(page.getByRole('heading', { name: 'Покупка восстановлена' })).toBeVisible()
})

for (const action of ['Здорово!', 'Вернуться к тарифам']) {
  test(`${action} reloads offers and displays fresh prices`, async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Открыть за 1 990 ₽ / год' }).click()
    await expect(page.getByRole('heading', { name: 'Покупка сохранена' })).toBeVisible()
    let release: () => void = () => {}
    const hold = new Promise<void>((resolve) => { release = resolve })
    let requests = 0
    await page.route('**/api/offers', async route => {
      requests++
      const response = await route.fetch()
      const data = await response.json()
      data.offers[0].price = 2100
      await hold
      await route.fulfill({ response, json: data })
    })
    await page.getByRole('button', { name: action, exact: true }).click()
    await expect(page.getByRole('status')).toHaveText('Загружаем тарифы…')
    await expect(page.locator('.buy-button')).toBeDisabled()
    release()
    await expect(page.getByRole('button', { name: 'Открыть за 2 100 ₽ / год' })).toBeEnabled()
    await expect(page.getByRole('radio', { name: 'На год, 2 100 рублей' })).toBeChecked()
    expect(requests).toBe(1)
  })
}

test('offer reload failure after returning can be retried', async ({ page }) => {
  await page.goto('/')
  await page.getByText('На месяц', { exact: true }).click()
  await page.getByRole('button', { name: 'Открыть за 299 ₽ / месяц' }).click()
  await expect(page.getByRole('heading', { name: 'Покупка сохранена' })).toBeVisible()
  await page.route('**/api/offers', route => route.fulfill({ status: 503, json: {} }))
  await page.getByRole('button', { name: 'Вернуться к тарифам' }).click()
  await expect(page.getByRole('alert')).toContainText('Не удалось загрузить тарифы')
  await expect(page.locator('.buy-button')).toBeDisabled()
  await page.unroute('**/api/offers')
  await page.getByRole('button', { name: 'Попробовать ещё раз' }).click()
  await expect(page.getByRole('radio', { name: 'На месяц, 299 рублей' })).toBeChecked()
  await expect(page.getByRole('button', { name: 'Открыть за 299 ₽ / месяц' })).toBeEnabled()
})

test('loading blocks duplicate purchases; error preserves selection and permits retry', async ({ page }) => {
  let release: () => void = () => {}
  const hold = new Promise<void>((resolve) => { release = resolve })
  let calls = 0
  await page.route('**/api/purchase', async route => {
    calls++
    await hold
    await route.fulfill({ status: 503, json: { message: 'Unavailable' } })
  })
  await page.goto('/')
  await page.getByText('На месяц', { exact: true }).click()
  await page.getByRole('button', { name: 'Открыть за 299 ₽ / месяц' }).click()
  await expect(page.getByRole('button', { name: 'Открываем доступ…' })).toBeDisabled()
  await expect(page.getByRole('radio', { name: 'На год, 1 990 рублей' })).toBeDisabled()
  await page.screenshot({ path: 'test-results/loading-390.png' })
  release()
  await expect(page.getByRole('alert')).toContainText('Не удалось завершить покупку')
  await expect(page.getByRole('radio', { name: 'На месяц, 299 рублей' })).toBeChecked()
  expect(calls).toBe(1)
  await page.screenshot({ path: 'test-results/error-390.png', fullPage: true })
  await page.unroute('**/api/purchase')
  await page.getByRole('button', { name: 'Открыть за 299 ₽ / месяц' }).click()
  await expect(page.getByRole('heading', { name: 'Покупка сохранена' })).toBeVisible()
})

test('offer loading and error can recover; keyboard selection works', async ({ page }) => {
  let release: () => void = () => {}
  const hold = new Promise<void>((resolve) => { release = resolve })
  await page.route('**/api/offers', async route => {
    await hold
    await route.fulfill({ status: 503, json: {} })
  })
  await page.goto('/')
  await expect(page.locator('.buy-button')).toBeDisabled()
  release()
  await expect(page.getByRole('alert')).toContainText('Не удалось загрузить тарифы')
  await page.unroute('**/api/offers')
  await page.getByRole('button', { name: 'Попробовать ещё раз' }).click()
  const yearly = page.getByRole('radio', { name: 'На год, 1 990 рублей' })
  await expect(yearly).toBeChecked()
  await yearly.focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('radio', { name: 'На месяц, 299 рублей' })).toBeChecked()
})

test('short screen scrolls and reduced motion is respected', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 568 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const restore = page.getByRole('button', { name: 'Восстановить покупки' })
  await restore.scrollIntoViewIfNeeded()
  await expect(restore).toBeInViewport()
  await page.getByRole('button', { name: 'Открыть за 1 990 ₽ / год' }).click()
  await expect(page.getByRole('heading', { name: 'Приключения начинаются!' })).toBeFocused()
})

test('lost purchase response can be retried without another database record', async ({ page }) => {
  let firstId = ''
  let requestId = ''
  await page.route('**/api/purchase', async route => {
    requestId = route.request().postDataJSON().requestId
    const saved = await route.fetch()
    firstId = (await saved.json()).purchase.id
    await route.abort('connectionreset')
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Открыть за 1 990 ₽ / год' }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await page.unroute('**/api/purchase')
  const responsePromise = page.waitForResponse('**/api/purchase')
  await page.getByRole('button', { name: 'Открыть за 1 990 ₽ / год' }).click()
  const response = await responsePromise
  expect(response.request().postDataJSON().requestId).toBe(requestId)
  expect((await response.json()).purchase.id).toBe(firstId)
  await expect(page.getByRole('heading', { name: 'Покупка сохранена' })).toBeVisible()
})

test('restore failure gives an actionable error and can be retried', async ({ page }) => {
  await page.route('**/api/restore', route => route.fulfill({ status: 503, json: {} }))
  await page.goto('/')
  await page.getByRole('button', { name: 'Восстановить покупки' }).click()
  await expect(page.getByRole('alert')).toContainText('Не удалось восстановить покупки')
  await page.unroute('**/api/restore')
  await page.getByRole('button', { name: 'Восстановить покупки' }).click()
  await expect(page.getByRole('status')).toContainText('нет активных покупок')
})
