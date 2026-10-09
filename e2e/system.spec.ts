import { test, expect, type Page } from "@playwright/test";
const key = "the_system_user_abhinav_state";
async function login(
  page: Page,
  user = "abhinav",
  password = "hunter_password_1",
) {
  await page.goto("/");
  await page.getByLabel("HUNTER ID", { exact: true }).fill(user);
  await page.getByLabel("PASSWORD / PIN", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
}
async function awaken(page: Page) {
  await login(page);
  await expect(
    page.getByRole("heading", { name: "Biometrics", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: /Forward Head/ }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Begin my plan", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();
}
async function read(page: Page) {
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), key);
}
async function nav(page: Page, name: string) {
  if (
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .isVisible()
  )
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: new RegExp(name) })
    .click();
}

test("gateway, calibration, quest CRUD, anatomy, XP, fuel, backups and persistent session", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.screenshot({ path: "test-results/gateway.png", fullPage: true });
  await login(page, "abhinav", "incorrect");
  await expect(page.getByRole("alert")).toContainText("incorrect");
  await page
    .getByLabel("PASSWORD / PIN", { exact: true })
    .fill("hunter_password_1");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  for (let step = 0; step < 3; step++)
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Review your plan", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Begin my plan", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  expect((await read(page)).profile.age).toBe(24);
  await nav(page, "Daily quests");
  await page
    .getByRole("button", {
      name: "Guide for Incline push-ups",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Start position anatomy" }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Range of motion path");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page
    .getByRole("button", { name: "Complete Incline push-ups", exact: true })
    .click();
  await expect.poll(async () => (await read(page)).totalXp).toBe(40);
  await page
    .getByRole("button", { name: "Undo Incline push-ups", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Undo completion", exact: true })
    .click();
  await expect.poll(async () => (await read(page)).totalXp).toBe(0);
  await page
    .getByRole("button", { name: "Complete Incline push-ups", exact: true })
    .click();
  await expect.poll(async () => (await read(page)).totalXp).toBe(40);
  await page.getByRole("button", { name: "Add routine", exact: true }).click();
  await page.getByLabel("Routine name", { exact: true }).fill("Test mobility");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add routine", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "View Test mobility form guide" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit Test mobility", exact: true })
    .click();
  await page.getByLabel("Target", { exact: true }).fill("12");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect
    .poll(
      async () =>
        (await read(page)).quests.find((q: any) => q.name === "Test mobility")
          ?.reps,
    )
    .toBe(12);
  await page
    .getByRole("button", { name: "Delete Test mobility", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete routine", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "View Test mobility form guide" }),
  ).toHaveCount(0);
  await nav(page, "Fuel & nutrition");
  await page.getByRole("button", { name: /Log Soya Chunks/i }).click();
  await expect.poll(async () => (await read(page)).meals.length).toBe(1);
  await page.getByRole("button", { name: "250 ml", exact: true }).click();
  await expect.poll(async () => (await read(page)).water).toBe(250);
  await nav(page, "System archive");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download backup/ }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toMatch(/^System_Backup_.*\.json$/);
  const saved = await read(page);
  await page.getByLabel("Select JSON backup").setInputFiles({
    name: "restore.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        format: "the-system-backup",
        version: 1,
        state: { ...saved, water: 750 },
      }),
    ),
  });
  await expect(
    page.getByRole("dialog", { name: "Review backup" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Replace this hunter’s data" })
    .click();
  await expect.poll(async () => (await read(page)).water).toBe(750);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await nav(page, "Fuel & nutrition");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("account isolation and cross-tab session logout", async ({
  page,
  context,
}) => {
  await awaken(page);
  await page
    .getByRole("button", { name: "Complete Incline push-ups", exact: true })
    .click();
  await expect.poll(async () => (await read(page)).totalXp).toBe(40);
  const tab = await context.newPage();
  await tab.goto("/");
  await expect(
    tab.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Log out", exact: true })
    .click();
  await expect(
    tab.getByRole("heading", { name: "Welcome, Hunter." }),
  ).toBeVisible();
  await login(page, "hunter_02", "hunter_password_2");
  await expect(
    page.getByRole("heading", { name: "Biometrics", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("the_system_user_hunter_02_state")!)
          .totalXp,
    ),
  ).toBe(0);
  expect((await read(page)).totalXp).toBe(40);
});

test("midnight penalty, hold timer, lock and recovery alternative", async ({
  page,
}) => {
  await awaken(page);
  await page.evaluate((k) => {
    const s = JSON.parse(localStorage.getItem(k)!);
    const date = new Date();
    date.setDate(date.getDate() - 1);
    s.day = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    s.penalty = {
      kind: "hold",
      fromDate: s.day,
      cleared: false,
      title: "Wall-sit endurance hold",
      target: 60,
      remaining: 60,
      startedAt: null,
    };
    localStorage.setItem(k, JSON.stringify(s));
  }, key);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "PENALTY ZONE", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Complete Incline push-ups",
      exact: true,
    }),
  ).toBeDisabled();
  await page.getByRole("button", { name: /Start hold/ }).click();
  await expect
    .poll(async () => (await read(page)).penalty.remaining)
    .toBeLessThan(60);
  await page.getByRole("button", { name: /Pause/ }).click();
  const before = (await read(page)).penalty.remaining;
  await page.waitForTimeout(1100);
  expect((await read(page)).penalty.remaining).toBe(before);
  await page.getByRole("button", { name: /Use XP recovery/ }).click();
  await page.getByRole("button", { name: /Confirm XP/ }).click();
  await expect(
    page.getByRole("heading", { name: "PENALTY ZONE", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Complete Incline push-ups",
      exact: true,
    }),
  ).toBeEnabled();
});

test("custom meal CRUD, planned recovery and attributes", async ({ page }) => {
  await awaken(page);
  await nav(page, "Fuel & nutrition");
  await page.getByRole("button", { name: "Log food", exact: true }).click();
  await page.getByLabel("Food and serving").fill("Test bowl");
  await page.getByLabel("calories (kcal)", { exact: true }).fill("200");
  await page.getByLabel("protein (g)", { exact: true }).fill("15");
  await page.getByLabel("carbs (g)", { exact: true }).fill("20");
  await page.getByLabel("fat (g)", { exact: true }).fill("7");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Log food", exact: true })
    .click();
  await expect.poll(async () => (await read(page)).meals.length).toBe(1);
  await page
    .getByRole("button", { name: "Edit Test bowl", exact: true })
    .click();
  await page.getByLabel("calories (kcal)", { exact: true }).fill("250");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect.poll(async () => (await read(page)).meals[0].calories).toBe(250);
  await page
    .getByRole("button", { name: "Delete Test bowl", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete meal", exact: true }).click();
  await expect.poll(async () => (await read(page)).meals.length).toBe(0);
  await nav(page, "Daily quests");
  await page.getByRole("button", { name: "Recovery day", exact: true }).click();

  await expect.poll(async () => (await read(page)).restDay).toBe(true);
  await expect(page.getByRole("status")).toContainText("Recovery day planned");
  await page
    .getByRole("button", { name: "Recovery day planned", exact: true })
    .click();
  await expect.poll(async () => (await read(page)).restDay).toBe(false);
  await expect(page.getByRole("status")).toContainText("active training day");

  await page.evaluate((k) => {
    const state = JSON.parse(localStorage.getItem(k)!);
    state.totalXp = 300;
    localStorage.setItem(k, JSON.stringify(state));
  }, key);
  await page.reload();
  await page
    .getByRole("button", { name: "Increase Strength", exact: true })
    .click();
  await expect
    .poll(async () => (await read(page)).attributes.strength)
    .toBe(11);
  expect((await read(page)).spentPoints).toBe(1);
});

test("installed production app loads and logs progress offline", async ({
  page,
  context,
}) => {
  test.skip(
    process.env.TEST_PWA !== "1",
    "Run against a production preview with TEST_PWA=1.",
  );
  await awaken(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Complete Incline push-ups", exact: true })
    .click();
  await expect.poll(async () => (await read(page)).totalXp).toBe(40);
});

test("sticky HUD, static diagrams and nested zoom lightbox on desktop and mobile", async ({
  page,
}) => {
  test.setTimeout(75000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await awaken(page);
  await expect(page.locator(".wordmark").first()).toHaveText("THE SYSTEM");
  await expect(page.locator("body")).toHaveCSS("font-family", /Inter/);
  await expect(page.locator(".monarch-aura")).toHaveCount(1);
  await page.evaluate(() => window.scrollTo(0, 800));
  await expect
    .poll(() =>
      page
        .locator(".topbar")
        .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
    )
    .toBe(0);
  await page
    .getByRole("button", { name: "Guide for Incline push-ups", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("[ DAILY QUEST ]");
  await expect(page.getByRole("dialog")).toContainText("Peak contraction");
  await expect(page.locator(".movement-figure")).toHaveCount(2);
  await expect(page.locator(".range-arrow")).toHaveCount(1);
  const paths = () =>
    page
      .locator(".movement-diagram")
      .evaluate((svg) =>
        [...svg.querySelectorAll("path")]
          .map((p) => p.getAttribute("d"))
          .join("|"),
      );
  const start = await paths();
  await page.waitForTimeout(180);
  expect(await paths()).toBe(start);
  await page.screenshot({
    path: "test-results/visual-guide-desktop.png",
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Expand visual guide" }).click();
  const lightbox = page.getByRole("dialog", {
    name: "Incline push-ups — visual guide",
    exact: true,
  });
  await expect(lightbox).toBeVisible();
  await lightbox.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(lightbox.locator("output")).toHaveText("150%");
  expect(
    await lightbox
      .locator(".lightbox-viewport")
      .evaluate((el) => el.scrollWidth > el.clientWidth),
  ).toBe(true);
  await lightbox.getByRole("button", { name: "Reset zoom" }).click();
  await page.screenshot({
    path: "test-results/visual-guide-lightbox.png",
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await expect(lightbox).toHaveCount(0);
  await expect(
    page.getByRole("dialog", { name: "Incline push-ups", exact: true }),
  ).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await expect(
    page.getByRole("button", { name: "Expand visual guide" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await nav(page, "Daily quests");
  for (const [name, motion] of [
    ["Prone lat pull-downs", "pull"],
    ["Lateral raises", "raise"],
    ["Dead bugs", "deadbug"],
    ["Chair squats", "chair"],
  ]) {
    await page
      .getByRole("button", { name: `Guide for ${name}`, exact: true })
      .click();
    await expect(page.locator(".movement-diagram")).toHaveAttribute(
      "data-movement",
      motion,
    );
    await page.getByRole("button", { name: "Close dialog" }).click();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".app-shell")).toHaveCSS("animation-name", "none");
  await page
    .getByRole("button", { name: "Guide for Chair squats", exact: true })
    .click();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
  await page.getByRole("button", { name: "Expand visual guide" }).click();
  const mobile = page.getByRole("dialog", {
    name: "Chair squats — visual guide",
    exact: true,
  });
  expect(await mobile.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  await page.screenshot({
    path: "test-results/visual-guide-mobile.png",
    animations: "disabled",
  });
  await mobile.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(mobile.locator("output")).toHaveText("150%");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("custom guide image CRUD, persistence, zoom and failed-image fallback", async ({
  page,
}) => {
  await awaken(page);
  await nav(page, "Daily quests");
  await page.route("https://guide.example/form.svg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="#152b4d"/><text x="50" y="200" fill="white" font-size="32">Custom form diagram</text></svg>',
    }),
  );
  await page.getByRole("button", { name: "Add routine", exact: true }).click();
  await page.getByLabel("Routine name").fill("Custom shoulder flow");
  await page
    .getByLabel("Guide Image URL (optional)")
    .fill("https://guide.example/form.svg");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add routine", exact: true })
    .click();
  await expect
    .poll(
      async () =>
        (await read(page)).quests.find(
          (q: { name: string }) => q.name === "Custom shoulder flow",
        ).guideImageUrl,
    )
    .toBe("https://guide.example/form.svg");
  await page.reload();
  await nav(page, "Daily quests");
  await page
    .getByRole("button", {
      name: "Guide for Custom shoulder flow",
      exact: true,
    })
    .click();
  const img = page.getByRole("img", {
    name: "Custom shoulder flow custom form guide",
  });
  await expect
    .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
    .toBe(800);
  await page.getByRole("button", { name: "Expand visual guide" }).click();
  await expect(
    page
      .getByRole("dialog", {
        name: "Custom shoulder flow — visual guide",
        exact: true,
      })
      .getByRole("img", { name: "Custom shoulder flow custom form guide" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Edit Custom shoulder flow", exact: true })
    .click();
  await page
    .getByLabel("Guide Image URL (optional)")
    .fill("https://guide.example/missing.png");
  await page.route("https://guide.example/missing.png", (route) =>
    route.abort(),
  );
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Guide for Custom shoulder flow",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Guide image unavailable",
  );
  await expect(page.getByRole("dialog")).toContainText("target anatomy only");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Edit Custom shoulder flow", exact: true })
    .click();
  await page.getByLabel("Guide Image URL (optional)").fill("");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect
    .poll(
      async () =>
        (await read(page)).quests.find(
          (q: { name: string }) => q.name === "Custom shoulder flow",
        ).guideImageUrl,
    )
    .toBeUndefined();
});
