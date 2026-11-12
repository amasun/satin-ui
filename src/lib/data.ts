export type Person = { id: string; name: string; color: string };

export const people: Person[] = [
  { id: "ava", name: "Ava", color: "var(--chart-1)" },
  { id: "kai", name: "Kai", color: "var(--chart-2)" },
  { id: "noor", name: "Noor", color: "var(--chart-3)" },
  { id: "juno", name: "Juno", color: "var(--chart-4)" },
  { id: "theo", name: "Theo", color: "var(--chart-5)" },
];

export const person = (id: string) => people.find((p) => p.id === id) ?? people[0];

export const money = (n: number) => `$${n.toFixed(2)}`;
