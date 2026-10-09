function write(level, area, message, err) {
  const line = `${new Date().toISOString()} ${level} ${area}: ${message}`;
  if (level === 'error') console.error(err ? `${line} ${err.stack || err.message || err}` : line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (area, message) => write('info', area, message),
  warn: (area, message) => write('warn', area, message),
  error: (area, message, err) => write('error', area, message, err),
};
