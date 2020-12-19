// Utility Methods
//

function isNumber(val: string) {
  return val && val !== '' && !isNaN(parseInt(val));
}

function isBoolean(val: string) {
  return val === 'true' || val === 'false';
}

function parseBoolean(val: string) {
  return val === 'true';
}

function camelToSnakeUpperCase(str: string) {
  const _ = str.replace(/([A-Z])/g, `_$1`);
  return _.toUpperCase();
}

export function configKeyToCraEnvKey(key: string) {
  // if already in .env cra format, just return
  if (key.startsWith('REACT_APP')) return key;

  // if already in uppercase, just add cra prefix
  if (!/[a-z]/.test(key)) return `REACT_APP_${key}`;

  // else, convert from camel to upper
  return `REACT_APP_${camelToSnakeUpperCase(key)}`;
}

// Main
//
export function getConfigValue<TKey extends string = string, TVal = string | number | boolean>(key: TKey, defaultVal: TVal): TVal {
  let val: any = process.env[key];
  if (!val) val = process.env[configKeyToCraEnvKey(key)];
  if (!val) return defaultVal;

  if (typeof val !== 'string') return (val as unknown) as TVal;
  if (isNumber(val)) return (parseInt(val) as unknown) as TVal;
  if (isBoolean(val)) return (parseBoolean(val) as unknown) as TVal;
  return (val as unknown) as TVal;
}
