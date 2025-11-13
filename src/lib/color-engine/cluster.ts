import kmeans from "ml-kmeans";

import type { ExtractedSwatch } from "@/lib/types";
import { deltaE, fromVector, oklchToHex, toVector, type Oklch } from "./oklch";
import type { SampledPixel } from "./image";

const MIN_DELTA = 3;

export const clusterSamples = (samples: SampledPixel[], colorCount: number): ExtractedSwatch[] => {
  if (!samples.length) return [];
  const k = Math.min(Math.max(colorCount, 3), 8);
  const dataset: number[][] = [];
  const weights: number[] = [];

  samples.forEach((sample) => {
    const repeats = Math.max(1, Math.round(sample.weight * 2));
    for (let index = 0; index < repeats; index += 1) {
      dataset.push(toVector(sample.oklch));
      weights.push(sample.weight);
    }
  });

  const result = kmeans(dataset, k, {
    initialization: "kmeans++",
    maxIterations: 64,
  });

  const centroidWeights = new Array(result.centroids.length).fill(0);
  result.clusters.forEach((clusterIndex, dataIndex) => {
    centroidWeights[clusterIndex] += weights[dataIndex];
  });

  const centroids = result.centroids.map((entry, index) => ({
    color: fromVector(entry.centroid as [number, number, number]),
    weight: centroidWeights[index] || 1,
  }));

  const deduped: { color: Oklch; weight: number }[] = [];
  centroids
    .sort((a, b) => b.weight - a.weight)
    .forEach((candidate) => {
      const existing = deduped.find((entry) => deltaE(entry.color, candidate.color) < MIN_DELTA);
      if (existing) {
        existing.weight += candidate.weight;
        existing.color = {
          l: (existing.color.l * existing.weight + candidate.color.l * candidate.weight) / (existing.weight + candidate.weight),
          c: (existing.color.c * existing.weight + candidate.color.c * candidate.weight) / (existing.weight + candidate.weight),
          h: (existing.color.h * existing.weight + candidate.color.h * candidate.weight) / (existing.weight + candidate.weight),
        };
      } else {
        deduped.push(candidate);
      }
    });

  const totalWeight = deduped.reduce((sum, entry) => sum + entry.weight, 0) || 1;

  return deduped
    .slice(0, 8)
    .map(({ color, weight }) => ({
      hex: oklchToHex(color),
      oklch: [color.l, color.c, color.h] as [number, number, number],
      share: Number((weight / totalWeight).toFixed(3)),
    }))
    .sort((a, b) => b.share - a.share);
};
