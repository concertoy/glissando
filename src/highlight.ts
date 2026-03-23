/**
 * Simple syntax highlighter for slide code blocks.
 *
 * Produces an array of colored tokens from source code.
 * Not a full parser — handles keywords, strings, comments, numbers.
 */

import type { CodeStyle } from "./types.js";

export interface Token {
  text: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Language keyword sets
// ---------------------------------------------------------------------------

const KEYWORDS: Record<string, Set<string>> = {
  python: new Set([
    "and", "as", "assert", "async", "await", "break", "class", "continue",
    "def", "del", "elif", "else", "except", "finally", "for", "from",
    "global", "if", "import", "in", "is", "lambda", "nonlocal", "not",
    "or", "pass", "raise", "return", "try", "while", "with", "yield",
    "True", "False", "None",
  ]),
  typescript: new Set([
    "abstract", "as", "async", "await", "break", "case", "catch", "class",
    "const", "continue", "debugger", "default", "delete", "do", "else",
    "enum", "export", "extends", "false", "finally", "for", "from",
    "function", "if", "implements", "import", "in", "instanceof", "interface",
    "let", "new", "null", "of", "package", "private", "protected", "public",
    "return", "static", "super", "switch", "this", "throw", "true", "try",
    "type", "typeof", "undefined", "var", "void", "while", "yield",
  ]),
  javascript: new Set([
    "async", "await", "break", "case", "catch", "class", "const", "continue",
    "debugger", "default", "delete", "do", "else", "export", "extends",
    "false", "finally", "for", "from", "function", "if", "import", "in",
    "instanceof", "let", "new", "null", "of", "return", "static", "super",
    "switch", "this", "throw", "true", "try", "typeof", "undefined", "var",
    "void", "while", "yield",
  ]),
  rust: new Set([
    "as", "async", "await", "break", "const", "continue", "crate", "dyn",
    "else", "enum", "extern", "false", "fn", "for", "if", "impl", "in",
    "let", "loop", "match", "mod", "move", "mut", "pub", "ref", "return",
    "self", "Self", "static", "struct", "super", "trait", "true", "type",
    "unsafe", "use", "where", "while",
  ]),
  go: new Set([
    "break", "case", "chan", "const", "continue", "default", "defer", "else",
    "fallthrough", "for", "func", "go", "goto", "if", "import", "interface",
    "map", "package", "range", "return", "select", "struct", "switch", "type",
    "var", "true", "false", "nil",
  ]),
  bash: new Set([
    "if", "then", "else", "elif", "fi", "for", "while", "do", "done",
    "case", "esac", "in", "function", "return", "exit", "local", "export",
    "source", "echo", "read", "set", "unset", "true", "false",
  ]),
  java: new Set([
    "abstract", "assert", "boolean", "break", "byte", "case", "catch",
    "char", "class", "const", "continue", "default", "do", "double",
    "else", "enum", "extends", "final", "finally", "float", "for",
    "goto", "if", "implements", "import", "instanceof", "int", "interface",
    "long", "native", "new", "null", "package", "private", "protected",
    "public", "return", "short", "static", "strictfp", "super", "switch",
    "synchronized", "this", "throw", "throws", "transient", "try", "void",
    "volatile", "while", "true", "false",
  ]),
  sql: new Set([
    "SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET",
    "DELETE", "CREATE", "TABLE", "DROP", "ALTER", "ADD", "INDEX", "VIEW",
    "JOIN", "INNER", "LEFT", "RIGHT", "OUTER", "ON", "AS", "AND", "OR",
    "NOT", "NULL", "IS", "IN", "BETWEEN", "LIKE", "ORDER", "BY", "GROUP",
    "HAVING", "LIMIT", "OFFSET", "UNION", "ALL", "DISTINCT", "COUNT",
    "SUM", "AVG", "MIN", "MAX", "CASE", "WHEN", "THEN", "ELSE", "END",
    "EXISTS", "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "CONSTRAINT",
    "DEFAULT", "CHECK", "UNIQUE", "WITH", "RECURSIVE", "OVER", "PARTITION",
    // lowercase aliases
    "select", "from", "where", "insert", "into", "values", "update", "set",
    "delete", "create", "table", "drop", "alter", "add", "index", "view",
    "join", "inner", "left", "right", "outer", "on", "as", "and", "or",
    "not", "null", "is", "in", "between", "like", "order", "by", "group",
    "having", "limit", "offset", "union", "all", "distinct", "count",
    "sum", "avg", "min", "max", "case", "when", "then", "else", "end",
    "exists", "primary", "key", "foreign", "references", "constraint",
    "default", "check", "unique", "with", "recursive", "over", "partition",
  ]),
  c: new Set([
    "auto", "break", "case", "char", "const", "continue", "default", "do",
    "double", "else", "enum", "extern", "float", "for", "goto", "if",
    "inline", "int", "long", "register", "restrict", "return", "short",
    "signed", "sizeof", "static", "struct", "switch", "typedef", "union",
    "unsigned", "void", "volatile", "while", "NULL",
  ]),
  cpp: new Set([
    "alignas", "alignof", "auto", "bool", "break", "case", "catch", "char",
    "class", "const", "constexpr", "continue", "decltype", "default",
    "delete", "do", "double", "else", "enum", "explicit", "extern",
    "false", "float", "for", "friend", "goto", "if", "inline", "int",
    "long", "mutable", "namespace", "new", "noexcept", "nullptr",
    "operator", "override", "private", "protected", "public", "register",
    "return", "short", "signed", "sizeof", "static", "static_cast",
    "struct", "switch", "template", "this", "throw", "true", "try",
    "typedef", "typeid", "typename", "union", "unsigned", "using",
    "virtual", "void", "volatile", "while",
  ]),
  ruby: new Set([
    "alias", "and", "begin", "break", "case", "class", "def", "defined?",
    "do", "else", "elsif", "end", "ensure", "false", "for", "if", "in",
    "module", "next", "nil", "not", "or", "redo", "rescue", "retry",
    "return", "self", "super", "then", "true", "undef", "unless", "until",
    "when", "while", "yield", "require", "include", "extend", "attr_reader",
    "attr_writer", "attr_accessor", "puts", "print",
  ]),
  yaml: new Set([
    "true", "false", "null", "yes", "no", "on", "off",
  ]),
  json: new Set([
    "true", "false", "null",
  ]),
};

// Alias common names
KEYWORDS["ts"] = KEYWORDS["typescript"];
KEYWORDS["js"] = KEYWORDS["javascript"];
KEYWORDS["py"] = KEYWORDS["python"];
KEYWORDS["sh"] = KEYWORDS["bash"];
KEYWORDS["shell"] = KEYWORDS["bash"];
KEYWORDS["c++"] = KEYWORDS["cpp"];
KEYWORDS["rb"] = KEYWORDS["ruby"];
KEYWORDS["yml"] = KEYWORDS["yaml"];

// Comment prefix per language
const COMMENT_PREFIX: Record<string, string> = {
  python: "#",
  bash: "#",
  sh: "#",
  py: "#",
  shell: "#",
  ruby: "#",
  rb: "#",
  yaml: "#",
  yml: "#",
  sql: "--",
};
// Default is "//" for all others

/**
 * Tokenize a single line of code into colored segments.
 */
function tokenizeLine(line: string, lang: string, style: CodeStyle): Token[] {
  const tokens: Token[] = [];
  const keywords = KEYWORDS[lang] ?? new Set();
  const commentChar = COMMENT_PREFIX[lang] ?? "//";
  let i = 0;

  function push(text: string, color: string) {
    if (text) tokens.push({ text, color });
  }

  while (i < line.length) {
    // --- Comment (rest of line) ---
    if (line.startsWith(commentChar, i)) {
      push(line.slice(i), style.comment);
      return tokens;
    }

    // --- String literal ---
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === "\\") j++; // skip escaped char
        j++;
      }
      j++; // include closing quote
      push(line.slice(i, j), style.string);
      i = j;
      continue;
    }

    // --- Number ---
    if (/[0-9]/.test(line[i]) && (i === 0 || /[\s(,=:+\-*/<>[\]{}]/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[0-9.xXa-fA-F_]/.test(line[j])) j++;
      push(line.slice(i, j), style.number);
      i = j;
      continue;
    }

    // --- Word (keyword, function, or identifier) ---
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);

      if (keywords.has(word)) {
        push(word, style.keyword);
      } else if (j < line.length && line[j] === "(") {
        push(word, style.function);
      } else {
        push(word, style.text);
      }
      i = j;
      continue;
    }

    // --- Operator / punctuation ---
    if (/[=+\-*/<>!&|^~%?:;,.()\[\]{}@]/.test(line[i])) {
      // Special handling for negative numbers: - followed by a digit is part of the number
      if (line[i] === '-' && i + 1 < line.length && /[0-9.]/.test(line[i + 1])) {
        // Check if this - is a unary minus (not subtraction) by looking at previous char
        const prevChar = i > 0 ? line[i - 1] : ' ';
        if (/[\s(,[=:+<>{|]/.test(prevChar)) {
          // This is a negative number - tokenize it as such
          let j = i + 1;
          while (j < line.length && /[0-9.xXa-fA-F_]/.test(line[j])) j++;
          push(line.slice(i, j), style.number);
          i = j;
          continue;
        }
      }
      let j = i;
      while (j < line.length && /[=+\-*/<>!&|^~%?]/.test(line[j])) j++;
      if (j === i) j++; // single punctuation char
      push(line.slice(i, j), style.operator);
      i = j;
      continue;
    }

    // --- Whitespace or other ---
    push(line[i], style.text);
    i++;
  }

  return tokens;
}

/**
 * Tokenize a full code block into lines of colored tokens.
 * Each line is an array of Token objects.
 */
export function highlightCode(code: string, language: string, style: CodeStyle): Token[][] {
  const lang = language.toLowerCase();
  return code.split("\n").map((line) =>
    line.length === 0 ? [{ text: " ", color: style.text }] : tokenizeLine(line, lang, style)
  );
}
