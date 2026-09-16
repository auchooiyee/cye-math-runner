export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatDistance(metres) {
  return formatNumber(Math.floor(metres)) + " m";
}

export function formatPercent(value) {
  return value.toFixed(1) + "%";
}

export function pixelsToMetres(pixels, speed) {
  // Approximate conversion: 100 pixels = 1 metre (just for display scaling)
  return pixels / 100;
}

export function generateDirectVariation() {
  const k = randomInt(2, 10);
  const x1 = randomInt(2, 8);
  const x2 = randomInt(9, 15);
  const y1 = k * x1;
  const y2 = k * x2;
  
  const question = `If y varies directly as x, and y = ${y1} when x = ${x1}, find the value of y when x = ${x2}.`;
  
  const correct = y2.toString();
  const options = [
    correct,
    (k * x2 + randomInt(1, 5)).toString(),
    ((k + 1) * x2).toString(),
    (y1 * x2).toString()
  ];
  
  const uniqueOptions = Array.from(new Set(options));
  while(uniqueOptions.length < 4) {
    uniqueOptions.push((y2 + randomInt(1, 20)).toString());
  }
  
  const finalOptions = shuffleArray(uniqueOptions.slice(0, 4));
  const answer = finalOptions.indexOf(correct);
  
  return {
    question,
    options: finalOptions,
    answer,
    explanation: `y = kx. ${y1} = k(${x1}), so k = ${k}. When x = ${x2}, y = ${k}(${x2}) = ${y2}.`,
    formula: "y = kx"
  };
}

export function generateInverseVariation() {
  const k = randomInt(12, 48); // make sure it's divisible by some numbers
  const x1 = 2;
  const y1 = k / x1;
  const x2 = 4;
  const y2 = k / x2;
  
  const question = `If y varies inversely as x, and y = ${y1} when x = ${x1}, find y when x = ${x2}.`;
  
  const correct = y2.toString();
  const options = [
    correct,
    (y2 + 1).toString(),
    (y2 * 2).toString(),
    (y2 + 3).toString()
  ];
  
  const finalOptions = shuffleArray(options);
  const answer = finalOptions.indexOf(correct);
  
  return {
    question,
    options: finalOptions,
    answer,
    explanation: `y = k/x. ${y1} = k/${x1}, k = ${k}. y = ${k}/${x2} = ${y2}.`,
    formula: "y = k/x"
  };
}

export function generatePowerVariation() {
  const n = randomInt(2, 3);
  const k = randomInt(2, 5);
  const x1 = 2;
  const y1 = k * Math.pow(x1, n);
  const x2 = 3;
  const y2 = k * Math.pow(x2, n);
  
  const powerStr = n === 2 ? "square" : "cube";
  const question = `y varies directly as the ${powerStr} of x. When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`;
  
  const correct = y2.toString();
  const options = [
    correct,
    (y2 + k).toString(),
    (k * Math.pow(x2, n-1)).toString(),
    (y2 + 10).toString()
  ];
  
  const uniqueOptions = Array.from(new Set(options));
  while (uniqueOptions.length < 4) {
    uniqueOptions.push((y2 + randomInt(1, 20)).toString());
  }
  
  const finalOptions = shuffleArray(uniqueOptions.slice(0, 4));
  const answer = finalOptions.indexOf(correct);
  
  return {
    question,
    options: finalOptions,
    answer,
    explanation: `y = kx^${n}. ${y1} = k(${Math.pow(x1, n)}), k = ${k}. When x = ${x2}, y = ${k}(${Math.pow(x2, n)}) = ${y2}.`,
    formula: n === 2 ? "y = kx²" : "y = kx³"
  };
}
