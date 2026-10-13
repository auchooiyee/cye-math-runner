export function editNumber(value, key) {
  value = String(value ?? '');
  if (key === 'clear') return '';
  if (key === 'backspace') return value.slice(0, -1);
  if (key === 'minus') return value.startsWith('-') ? value.slice(1) : `-${value}`;
  if (!/^\d$/.test(key) || value.replace('-', '').length >= 8) return value;
  return value + key;
}
