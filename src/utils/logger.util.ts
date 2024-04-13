//NOTE:- Import getLoggerPrefix in all the functions to log constructor name, method name and line name in logger

export function getLoggerPrefix(): string {
  const stack = new Error().stack.split('\n');
  let callerLine: string;

  // Find the first line in the stack that is not the getLoggerPrefix or getLineNumber function
  for (let i = 1; i < stack.length; i++) {
    if (
      !stack[i].includes('getLoggerPrefix') &&
      !stack[i].includes('getLineNumber')
    ) {
      callerLine = stack[i];
      break;
    }
  }

  if (callerLine) {
    // Extract the constructor name, file path, line number, and column number from the caller line
    const matches = callerLine.match(/\s+at\s+(\S+)\s+\((.+):(\d+):(\d+)\)/);
    if (matches && matches.length === 5) {
      const constructorName = matches[1];
      const lineNumber = matches[3];
      const columnNumber = matches[4];
      return `${constructorName} [${lineNumber}:${columnNumber}]`;
    }
  }

  return '';
}
