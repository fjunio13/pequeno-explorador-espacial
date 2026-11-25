const bands = [
  {
    targets: [7, 6, 8, 9, 10],
    starts: [7, 6, 8, 9, 6],
    comparisons: [[6, 9], [8, 10], [8, 7], [9, 6], [10, 8]],
  },
  {
    targets: [13, 12, 11, 14, 15],
    starts: [8, 9, 6, 7, 8],
    comparisons: [[12, 15], [14, 11], [12, 13], [14, 15], [11, 15]],
  },
  {
    targets: [18, 20, 16, 19, 17],
    starts: [17, 16, 18, 19, 16],
    comparisons: [[18, 20], [16, 19], [18, 17], [20, 19], [20, 16]],
  },
];

export const lastEnergyBand = bands.length - 1;

export function energyConfiguration(band, visit) {
  const { targets, starts, comparisons } = bands[band];
  const index = visit % targets.length;
  const start = starts[index];
  const panel = band === lastEnergyBand ? 20 : 10;
  const missing = panel - start;
  const capacity = band === 0 ? 10 : 20;

  return [
    { mode: "build", target: targets[index], capacity, modules: capacity === 10 ? [1, 5] : [1, 5, 10] },
    {
      mode: "complete", target: panel, capacity: panel, start,
      modules: [1, Math.max(2, missing), 5],
    },
    {
      mode: "compare", capacity, loads: comparisons[index],
      relation: (band + visit) % 2 === 0 ? "more" : "less",
    },
  ];
}
