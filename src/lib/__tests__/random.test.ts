import { describe, expect, it } from "vitest";

import { createRandomHex, type RandomBiasMode } from "../random";

const sequenceRng = (values: number[]) => {
  let index = 0;
  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0.5;
    index += 1;
    return value;
  };
};

describe("createRandomHex bias modes", () => {
  const baseSequence = [0.4, 0.6, 0.2];

  const generate = (bias: RandomBiasMode, index = 0, total = 5) =>
    createRandomHex([], bias, index, total, { randomFn: sequenceRng([...baseSequence]) });

  it("biases warmer hues into the warm range", () => {
    const warm = generate("warmer");
    expect(warm.oklch.h).toBeGreaterThanOrEqual(10);
    expect(warm.oklch.h).toBeLessThanOrEqual(80);
  });

  it("biases cooler hues into the cool range", () => {
    const cool = generate("cooler");
    expect(cool.oklch.h).toBeGreaterThanOrEqual(190);
    expect(cool.oklch.h).toBeLessThanOrEqual(260);
  });

  it("reduces chroma when muted mode is selected", () => {
    const normal = generate("none");
    const muted = generate("muted");
    expect(muted.oklch.c).toBeLessThan(normal.oklch.c);
  });

  it("widens lightness spread for contrast mode", () => {
    const dark = generate("contrast", 0, 5);
    const light = generate("contrast", 4, 5);
    expect(dark.oklch.l).toBeLessThan(light.oklch.l);
  });
});
