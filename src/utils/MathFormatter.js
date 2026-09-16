/**
 * MathFormatter — Converts raw array and mathematical expressions into
 * standard 2D textbook matrix representations.
 */

export function formatMatrixNotation(text) {
  if (!text || typeof text !== 'string') return text;

  // Replace nested array syntax [[a, b], [c, d]] or [[a, b, c], [d, e, f]]
  const matrixRegex = /\[\s*\[([^\]]+)\](?:\s*,\s*\[([^\]]+)\])+\s*\]/g;

  return text.replace(matrixRegex, (match) => {
    // Extract each row within the brackets [ ... ]
    const rowMatches = match.slice(1, -1).match(/\[([^\]]+)\]/g);
    if (!rowMatches || rowMatches.length === 0) return match;

    const rows = rowMatches.map(r =>
      r.slice(1, -1).trim().split(/[\s,]+/).filter(Boolean)
    );

    if (rows.length === 0) return match;

    // Calculate maximum width for each column so numbers align neatly
    const numCols = Math.max(...rows.map(r => r.length));
    const colWidths = new Array(numCols).fill(0);

    for (const row of rows) {
      row.forEach((val, c) => {
        colWidths[c] = Math.max(colWidths[c], val.length);
      });
    }

    // Build standard 2D matrix box with brackets
    const formattedRows = rows.map((row, rIdx) => {
      const paddedCells = row.map((val, c) => val.padStart(colWidths[c], ' ')).join('  ');
      let leftBracket = '│';
      let rightBracket = '│';

      if (rows.length === 1) {
        leftBracket = '[';
        rightBracket = ']';
      } else if (rIdx === 0) {
        leftBracket = '┌';
        rightBracket = '┐';
      } else if (rIdx === rows.length - 1) {
        leftBracket = '└';
        rightBracket = '┘';
      }

      return `${leftBracket} ${paddedCells} ${rightBracket}`;
    });

    return formattedRows.join('\n');
  });
}

export default {
  formatMatrixNotation
};
