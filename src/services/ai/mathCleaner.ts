/**
 * Utility to convert LaTeX and complex mathematical symbols into plain, easy-to-read text.
 * Ensures math problems are presented simply without special symbols or LaTeX code.
 */
export function cleanMathLatexToPlain(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Remove LaTeX block tags & environment declarations
  cleaned = cleaned.replace(/\\begin\{(equation|align|matrix|pmatrix|bmatrix|cases|array)\*?\}/gi, '');
  cleaned = cleaned.replace(/\\end\{(equation|align|matrix|pmatrix|bmatrix|cases|array)\*?\}/gi, '');

  // 2. Remove LaTeX delimiters ($$, $, \[, \], \(, \))
  cleaned = cleaned.replace(/\$\$([\s\S]*?)\$\$/g, '$1');
  cleaned = cleaned.replace(/\$([^$\n]+)\$/g, '$1');
  cleaned = cleaned.replace(/\\\[([\s\S]*?)\\\]/g, '$1');
  cleaned = cleaned.replace(/\\\(([\s\S]*?)\\\)/g, '$1');

  // 3. Convert fractions: \frac{a}{b}, \dfrac{a}{b}, \tfrac{a}{b} -> (a / b)
  // Repeat up to 4 times for nested fractions
  for (let i = 0; i < 4; i++) {
    cleaned = cleaned.replace(/\\(frac|dfrac|tfrac)\{([^{}]+)\}\{([^{}]+)\}/gi, '($2 / $3)');
  }

  // 4. Convert roots: \sqrt{x} -> sqrt(x), \sqrt[n]{x} -> (x)^(1/n)
  cleaned = cleaned.replace(/\\sqrt\[([^\]]+)\]\{([^{}]+)\}/gi, '($2)^($1)');
  cleaned = cleaned.replace(/\\sqrt\{([^{}]+)\}/gi, 'sqrt($1)');

  // 5. Convert common operators & symbols
  cleaned = cleaned.replace(/\\(cdot|times)/g, ' * ');
  cleaned = cleaned.replace(/\\div/g, ' / ');
  cleaned = cleaned.replace(/\\pm/g, ' +/- ');
  cleaned = cleaned.replace(/\\mp/g, ' -/+ ');
  cleaned = cleaned.replace(/\\(leq|le)/g, ' <= ');
  cleaned = cleaned.replace(/\\(geq|ge)/g, ' >= ');
  cleaned = cleaned.replace(/\\neq/g, ' != ');
  cleaned = cleaned.replace(/\\approx/g, ' approx ');
  cleaned = cleaned.replace(/\\infty/g, ' infinity ');
  cleaned = cleaned.replace(/\\(Rightarrow|implies)/g, ' => ');
  cleaned = cleaned.replace(/\\(Leftrightarrow|iff)/g, ' <=> ');
  cleaned = cleaned.replace(/\\to/g, ' -> ');

  // Calculus & summations
  cleaned = cleaned.replace(/\\int_\{([^{}]+)\}\^\{([^{}]+)\}/g, 'integral from $1 to $2 of ');
  cleaned = cleaned.replace(/\\int_([^\s^]+)\^([^\s]+)/g, 'integral from $1 to $2 of ');
  cleaned = cleaned.replace(/\\int/g, 'integral of ');

  cleaned = cleaned.replace(/\\sum_\{([^{}]+)\}\^\{([^{}]+)\}/g, 'sum from $1 to $2 of ');
  cleaned = cleaned.replace(/\\sum_([^\s^]+)\^([^\s]+)/g, 'sum from $1 to $2 of ');
  cleaned = cleaned.replace(/\\sum/g, 'sum of ');

  cleaned = cleaned.replace(/\\lim_\{([^{}\\]+)\s*\\to\s*([^{}]+)\}/g, 'limit as $1 approaches $2 of ');
  cleaned = cleaned.replace(/\\lim_([^\s]+)/g, 'limit of ');

  // Greek letters
  cleaned = cleaned.replace(/\\alpha/g, 'alpha');
  cleaned = cleaned.replace(/\\beta/g, 'beta');
  cleaned = cleaned.replace(/\\gamma/g, 'gamma');
  cleaned = cleaned.replace(/\\delta/g, 'delta');
  cleaned = cleaned.replace(/\\epsilon/g, 'epsilon');
  cleaned = cleaned.replace(/\\theta/g, 'theta');
  cleaned = cleaned.replace(/\\lambda/g, 'lambda');
  cleaned = cleaned.replace(/\\mu/g, 'mu');
  cleaned = cleaned.replace(/\\pi/g, 'pi');
  cleaned = cleaned.replace(/\\rho/g, 'rho');
  cleaned = cleaned.replace(/\\sigma/g, 'sigma');
  cleaned = cleaned.replace(/\\omega/g, 'omega');
  cleaned = cleaned.replace(/\\Delta/g, 'Delta');
  cleaned = cleaned.replace(/\\Sigma/g, 'Sigma');

  // Font/Style wrappers: \mathbf{x}, \mathrm{x}, \text{x}, \vec{x}
  cleaned = cleaned.replace(/\\(mathbf|mathrm|text|vec|hat|tilde)\{([^{}]+)\}/g, '$2');

  // Remove stray backslashes before plain functions (e.g. \sin -> sin, \cos -> cos, \log -> log)
  cleaned = cleaned.replace(/\\(sin|cos|tan|cot|sec|csc|log|ln|exp|lim|max|min)\b/g, '$1');

  // Remove remaining stray LaTeX command backslashes
  cleaned = cleaned.replace(/\\([a-zA-Z]+)/g, '$1');

  return cleaned;
}

/**
 * Prepares response text specifically for Text-to-Speech (TTS) audio playback.
 * Strips code blocks, LaTeX tags, URLs, markdown syntax, and translates math
 * operators into natural spoken phrases (e.g. 'divided by', 'square root of').
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';

  // 1. First run full LaTeX & math symbol cleaner
  let speech = cleanMathLatexToPlain(text);

  // 2. Remove code blocks and inline code
  speech = speech.replace(/```[\s\S]*?```/g, ' Code example omitted. ');
  speech = speech.replace(/`([^`]+)`/g, '$1');

  // 3. Remove URLs and image links
  speech = speech.replace(/https?:\/\/\S+/gi, '');
  speech = speech.replace(/!\[([^\]]*)\]\([^)]*\)/g, '');
  speech = speech.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // 4. Remove Markdown headers, bullet points, horizontal rules, and formatting
  speech = speech.replace(/^#{1,6}\s+/gm, '');
  speech = speech.replace(/^[-*+]\s+/gm, '');
  speech = speech.replace(/^\d+\.\s+/gm, '');
  speech = speech.replace(/---{3,}/g, '');
  speech = speech.replace(/(\*\*|__)(.*?)\1/g, '$2');
  speech = speech.replace(/(\*|_)(.*?)\1/g, '$2');
  speech = speech.replace(/~~(.*?)~~/g, '$1');

  // 5. Convert mathematical expressions to natural spoken English
  speech = speech.replace(/sqrt\(([^)]+)\)/gi, 'square root of $1');
  speech = speech.replace(/sqrt\b/gi, 'square root');

  // Exponents (e.g., x^2 -> x squared, x^3 -> x cubed, x^n -> x to the power of n)
  speech = speech.replace(/(\b[a-zA-Z0-9]+\b)\^2\b/g, '$1 squared');
  speech = speech.replace(/(\b[a-zA-Z0-9]+\b)\^3\b/g, '$1 cubed');
  speech = speech.replace(/(\b[a-zA-Z0-9]+\b)\^(\b[a-zA-Z0-9]+\b)/g, '$1 to the power of $2');
  speech = speech.replace(/\^/g, ' to the power of ');

  // Math Operators (apply to numbers & isolated variables, e.g. "5 / 2" or "x * y")
  speech = speech.replace(/(\b\d+\b|\b[a-zA-Z]\b)\s*\/\s*(\b\d+\b|\b[a-zA-Z]\b)/g, '$1 divided by $2');
  speech = speech.replace(/(\b\d+\b|\b[a-zA-Z]\b)\s*\*\s*(\b\d+\b|\b[a-zA-Z]\b)/g, '$1 times $2');
  speech = speech.replace(/\s*-\/\+\s*/g, ' minus or plus ');
  speech = speech.replace(/\s*\+\/-\s*/g, ' plus or minus ');
  speech = speech.replace(/\s*!=\s*/g, ' is not equal to ');
  speech = speech.replace(/\s*<=\s*/g, ' is less than or equal to ');
  speech = speech.replace(/\s*>=\s*/g, ' is greater than or equal to ');
  speech = speech.replace(/\s*==\s*/g, ' equals ');
  speech = speech.replace(/\s*=>\s*/g, ' implies ');
  speech = speech.replace(/\s*->\s*/g, ' approaches ');

  // Replace isolated + and - surrounded by spaces or numbers
  speech = speech.replace(/(\d)\s*\+\s*(\d)/g, '$1 plus $2');
  speech = speech.replace(/(\d)\s*-\s*(\d)/g, '$1 minus $2');

  // 6. Strip remaining unpronounceable special symbols
  speech = speech.replace(/[{}[\]\\/|~@#$%&_<=>]/g, ' ');

  // 7. Clean up whitespace and punctuation for smooth cadence
  speech = speech.replace(/\n+/g, '. ');
  speech = speech.replace(/\s{2,}/g, ' ');
  speech = speech.replace(/\.{2,}/g, '.');

  return speech.trim();
}

/**
 * Splits long text into small sentence chunks (~150 chars max)
 * to prevent browser SpeechSynthesis length limit timeouts.
 */
export function splitTextIntoSentenceChunks(text: string, maxChunkLength = 160): string[] {
  if (!text) return [];

  // Match sentences ending in punctuation or line breaks
  const rawSentences = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of rawSentences) {
    if ((current + sentence).length > maxChunkLength) {
      if (current.trim()) chunks.push(current.trim());
      // If sentence itself is longer than maxChunkLength, split by commas or spaces
      if (sentence.length > maxChunkLength) {
        const subParts = sentence.split(/([,;:]\s+)/);
        let subCurrent = '';
        for (const part of subParts) {
          if ((subCurrent + part).length > maxChunkLength) {
            if (subCurrent.trim()) chunks.push(subCurrent.trim());
            subCurrent = part;
          } else {
            subCurrent += part;
          }
        }
        if (subCurrent.trim()) current = subCurrent;
        else current = '';
      } else {
        current = sentence;
      }
    } else {
      current += sentence;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}


