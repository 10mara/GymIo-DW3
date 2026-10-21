require("./helpers/setup");
const test = require("node:test");
const assert = require("node:assert/strict");
const d = require("../src/utils/date");

test("startOfDay: dia de São Paulo começa às 03:00 UTC", () => {
  assert.equal(d.startOfDay("2026-10-20").toISOString(), "2026-10-20T03:00:00.000Z");
  assert.equal(d.startOfDay("2026-01-01").toISOString(), "2026-01-01T03:00:00.000Z");
});

test("startOfDay: respeita outro fuso informado (UTC)", () => {
  assert.equal(d.startOfDay("2026-10-20", "UTC").toISOString(), "2026-10-20T00:00:00.000Z");
});

test("addDaysISO: atravessa mês e ano", () => {
  assert.equal(d.addDaysISO("2026-10-31", 1), "2026-11-01");
  assert.equal(d.addDaysISO("2026-01-01", -1), "2025-12-31");
  assert.equal(d.addDaysISO("2026-10-20", -6), "2026-10-14");
});

test("firstDayOfMonthISO: mês atual, anterior e seguinte (virada de ano)", () => {
  assert.equal(d.firstDayOfMonthISO("2026-10-20"), "2026-10-01");
  assert.equal(d.firstDayOfMonthISO("2026-01-15", -1), "2025-12-01");
  assert.equal(d.firstDayOfMonthISO("2026-12-15", 1), "2027-01-01");
});

test("localDateISO/localHour: 22:30 em São Paulo ainda é o mesmo dia (UTC já virou)", () => {
  const instante = new Date("2026-10-21T01:30:00.000Z"); // 22:30 de 20/10 em SP
  assert.equal(d.localDateISO(instante), "2026-10-20");
  assert.equal(d.localHour(instante), 22);
});

test("localHour: meia-noite local é 0 (não 24)", () => {
  assert.equal(d.localHour(new Date("2026-10-20T03:00:00.000Z")), 0);
});

test("weekdayLabel", () => {
  assert.equal(d.weekdayLabel("2026-10-20"), "Ter");
  assert.equal(d.weekdayLabel("2026-10-18"), "Dom");
});
