interface ParseOptions {
  appendStrOnEnd?: string;
  hasExplicitUndefined?: boolean;
}

export class FuzzyJsonParser {
  private index: number;
  private str: string;
  private hasExplicitUndefined: boolean;
  private appendStrOnEnd: string;
  private currParseSettings: ParseOptions;

  constructor({ appendStrOnEnd = '...', hasExplicitUndefined = false }: ParseOptions = {}) {
    this.index = 0;
    this.str = "";
    this.appendStrOnEnd = appendStrOnEnd;
    this.hasExplicitUndefined = hasExplicitUndefined;
  }

  parse(jsonStr: string, options?: ParseOptions): any {
    try {
      return JSON.parse(jsonStr)
    } catch (error) {
      console.log('classic JSON parse error', jsonStr?.substring(this.index, this.index + 8) + '...')
      this.currParseSettings = {
        appendStrOnEnd: this.appendStrOnEnd,
        hasExplicitUndefined: this.hasExplicitUndefined,
        ...options,
      }
      const jsonLikeSegments = this.extractJsonLikeSegments(jsonStr);
      console.log('jsonLikeSegments', jsonLikeSegments);
      return this.findAndParseValidJsonSegment(jsonLikeSegments,);
    }
  }

  parseBase(jsonStr: string, options?: ParseOptions): any {
    try {
      return JSON.parse(jsonStr)
    } catch (error) {
      this.currParseSettings = {
        appendStrOnEnd: this.appendStrOnEnd,
        hasExplicitUndefined: this.hasExplicitUndefined,
        ...options,
      }
      this.index = 0;
      this.str = jsonStr;
      try {
        return this.parseValue();
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
      }
    }
  }
  

  private extractJsonLikeSegments(input: string): string[] {
    const segments: string[] = [];
    let jsonStart = -1;
    const stack: string[] = [];
    let i = 0;

    while (i < input.length) {
      const char = input[i];

      if (char === '{' || char === '[') {
        if (jsonStart === -1) {
          jsonStart = i;
        }
        stack.push(char);
      } 
      else if (
        (char === '}' && stack[stack.length - 1] === '{') ||
        (char === ']' && stack[stack.length - 1] === '[')
      ) {
        stack.pop();
        if (stack.length === 0) {
          const jsonEnd = i + 1;
          segments.push(input.substring(jsonStart, jsonEnd));
          jsonStart = -1;
        }
      }
      i++;
    }
    return segments;
  }

  private findAndParseValidJsonSegment(segments: string[], requiredKeys?: string[], parseOptions?: ParseOptions): string | null {
    for (let segment of segments) {
      const obj = this.parseBase(segment, parseOptions);
      if (this.containsRequiredKeys(obj, requiredKeys)) {
        return segment;
      }
    }
    return null;
  }

  private containsRequiredKeys(obj: any, requiredKeys?: string[]): boolean {
    if(requiredKeys === undefined) return true;
    if (typeof obj !== 'object' || obj === null) return false;
    for (let key of requiredKeys) {
      if (!(key in obj)) {
        return false;
      }
    }
    return true;
  }



  private parseValue(): any {
    this.skipWhitespace();

    const char = this.str[this.index];

    if (char === "{") return this.parseObject();

    if (char === "[") return this.parseArray();

    if (char === '"') return this.parseString();

    if (char === "-" || this.isDigit(char)) return this.parseNumber();

    if (char === "t" || char === "f") return this.parseBoolean();

    if (char === "n") return this.parseNull();

    if (char === "u") return this.parseUndefined();

    // throw new Error(`Unexpected char: ${char}`);
  }

  private parseObject(): Record<string, any> | null {
    this.index++;

    const obj: Record<string, any> = {};

    while (this.index < this.str.length) {
      this.skipWhitespace();

      if (this.str[this.index] === "}") {
        this.index++;

        return obj;
      }

      const key = this.parseString();

      this.skipWhitespace();

      if (this.str[this.index] !== ":") {
        throw new Error('Expected ":" after key in object');
      }

      this.index++;

      this.skipWhitespace();

      const value = this.parseValue();
      // console.log('value this', value)

      if (value === undefined) {
        if (this?.currParseSettings?.hasExplicitUndefined)
          obj[key] = value;
      }
      else
        obj[key] = value;

      this.skipWhitespace();

      if (this.str[this.index] === ",")
        this.index++;
      else if (this.str[this.index] === "}") {
        this.index++;
        return obj;
      }
      else if (this.index >= this.str.length)
        return obj;
    }

    return obj;
  }

  private parseArray(): any[] | null {
    this.index++; // skip '['

    const arr: any[] = [];

    while (this.index < this.str.length) {
      this.skipWhitespace();

      if (this.str[this.index] === "]") {
        this.index++;

        return arr;
      }

      const value = this.parseValue();

      arr.push(value);

      this.skipWhitespace();

      if (this.str[this.index] === ",") {
        this.index++;
      } else if (this.str[this.index] === "]") {
        this.index++;

        return arr;
      } else if (this.index >= this.str.length) {
        return arr;
      }
    }

    return arr;
  }

  private parseString(): string {
    let result = "";

    this.index++;

    while (this.index < this.str.length) {
      if (this.str[this.index] === '"') {
        this.index++;

        return result;
      }

      if (this.str[this.index] === "\\") {
        this.index++;

        const escapeChars: { [key: string]: string } = {
          '"': '"',
          "\\": "\\",
          "/": "/",
          b: "\b",
          f: "\f",
          n: "\n",
          r: "\r",
          t: "\t",
        };

        result += escapeChars[this.str[this.index]] || this.str[this.index];
      }
      else
        result += this.str[this.index];

      this.index++;
    }

    return result + this?.currParseSettings?.appendStrOnEnd || this.appendStrOnEnd; //unclosed string
    // throw new Error("Unexpected end of string");
  }

  private parseNumber(): number | null {
    const start = this.index;

    if (this.str[this.index] === "-") this.index++;

    while (this.isDigit(this.str[this.index])) this.index++;

    if (this.str[this.index] === ".") {
      this.index++;

      while (this.isDigit(this.str[this.index])) this.index++;
    }

    if (this.str[this.index] === "e" || this.str[this.index] === "E") {
      this.index++;

      if (this.str[this.index] === "-" || this.str[this.index] === "+")
        this.index++;

      while (this.isDigit(this.str[this.index])) this.index++;
    }

    return Number(this.str.slice(start, this.index));
  }

  private parseBoolean(): boolean | null {
    if (this.str.startsWith("true", this.index)) {
      this.index += 4;

      return true;
    } else if (this.str.startsWith("false", this.index)) {
      this.index += 5;

      return false;
    }

    throw new Error("Unexpected token in JSON");
  }

  private parseNull(): null | never {
    if (this.str.startsWith("null", this.index)) {
      this.index += 4;
      return null;
    }
    throw new Error("Unexpected token in JSON");
  }

  private parseUndefined(): undefined | never {
    if (this.str.startsWith("undefined", this.index)) {
      this.index += 9;
      return undefined;
    }

    throw new Error("Unexpected token in JSON");
  }

  private skipWhitespace(): void {
    while (/\s/.test(this.str[this.index])) {
      this.index++;
    }
  }

  private isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
  }
}


export { type ParseOptions }