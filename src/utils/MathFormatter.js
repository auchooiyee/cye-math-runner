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

const MATRIX_PATTERN = /\[\s*\[([^\]]+)\](?:\s*,\s*\[([^\]]+)\])+\s*\]/g;

function matrixRows(source) {
  const rows = [...source.matchAll(/\[\s*([^\[\]]+?)\s*\]/g)]
    .map(match => match[1].split(',').map(cell => cell.trim()));
  if (rows.length < 2 || rows.some(row => row.length !== rows[0].length)) return null;
  return rows;
}

// Phaser text cannot render MathML. Compose every matrix on an equation line
// at the same height, so the operands and equals sign stay in one equation.
export function formatMatrixEquation(text) {
  if (typeof text !== 'string') return text;
  return text.split('\n').map(line => {
    const matches = [...line.matchAll(MATRIX_PATTERN)];
    if (!matches.length) return line;
    const tokens = [];
    let position = 0;
    for (const match of matches) {
      if (match.index > position) tokens.push({ text: line.slice(position, match.index) });
      const rows = matrixRows(match[0]);
      tokens.push(rows ? { rows } : { text: match[0] });
      position = match.index + match[0].length;
    }
    if (position < line.length) tokens.push({ text: line.slice(position) });
    const rowCount = Math.max(...tokens.map(token => token.rows?.length || 0));
    if (!rowCount) return line;
    const height = rowCount * 2 - 1;
    const segments = tokens.map(token => {
      if (!token.rows) return Array.from({ length: height }, (_, i) => i === Math.floor(height / 2) ? token.text : ' '.repeat(token.text.length));
      const widths = token.rows[0].map((_, column) => Math.max(...token.rows.map(row => row[column].length)));
      const insideWidth = widths.reduce((sum, width) => sum + width, 0) + 2 * (widths.length - 1) + 2;
      return Array.from({ length: height }, (_, i) => {
        if (i % 2) return `⎢${' '.repeat(insideWidth)}⎥`;
        const index = i / 2;
        const cells = token.rows[index]?.map((cell, column) => cell.padStart(widths[column], ' ')).join('  ') || ' '.repeat(insideWidth - 2);
        const left = index === 0 ? '⎡' : index === rowCount - 1 ? '⎣' : '⎢';
        const right = index === 0 ? '⎤' : index === rowCount - 1 ? '⎦' : '⎥';
        return `${left} ${cells} ${right}`;
      });
    });
    return Array.from({ length: height }, (_, i) => segments.map(segment => segment[i]).join('').trimEnd()).join('\n');
  }).join('\n');
}

// Native portrait UI uses semantic MathML rather than array or box characters.
export function appendMatrixMath(parent, text) {
  const namespace = 'http://www.w3.org/1998/Math/MathML';
  const mathNode = (name, value = '') => {
    const node = document.createElementNS(namespace, name);
    if (value) node.textContent = value;
    return node;
  };
  String(text ?? '').split('\n').forEach((line, lineIndex) => {
    if (lineIndex) parent.append(document.createElement('br'));
    const matches = [...line.matchAll(MATRIX_PATTERN)];
    if (!matches.length) {
      parent.append(document.createTextNode(line));
      return;
    }
    const isEquation = /^\s*(?:-?\d+\s*[×*/]\s*)?\[\[/.test(line);
    const target = isEquation ? document.createElement('span') : parent;
    if (isEquation) target.className = 'matrix-equation';
    let position = 0;
    for (const match of matches) {
      if (match.index > position) target.append(document.createTextNode(line.slice(position, match.index)));
      const rows = matrixRows(match[0]);
      if (!rows) {
        target.append(document.createTextNode(match[0]));
      } else {
        const math = mathNode('math');
        const fenced = mathNode('mrow');
        const table = mathNode('mtable');
        rows.forEach(row => {
          const tr = mathNode('mtr');
          row.forEach(cell => {
            const td = mathNode('mtd');
            td.append(mathNode(cell === '?' ? 'mo' : /^-?\d+(?:\.\d+)?$/.test(cell) ? 'mn' : 'mi', cell));
            tr.append(td);
          });
          table.append(tr);
        });
        fenced.append(mathNode('mo', '['), table, mathNode('mo', ']'));
        math.append(fenced);
        target.append(math);
      }
      position = match.index + match[0].length;
    }
    if (position < line.length) target.append(document.createTextNode(line.slice(position)));
    if (isEquation) parent.append(target);
  });
}

export default {
  formatMatrixNotation
};
