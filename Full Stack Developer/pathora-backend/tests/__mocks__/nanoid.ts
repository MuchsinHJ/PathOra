
let counter = 0;
export function nanoid(size = 21): string {
  return `test-id-${++counter}-${Math.random().toString(36).slice(2, size)}`;
}
