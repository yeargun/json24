export class JSONParser {
  private index: number;

  private str: string;

  constructor() {
    this.index = 0;
    this.str = "";
  }

  parse(jsonStr: string): any {
    this.index = 0;

    this.str = jsonStr;

    try {
      return this.parseValue();
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
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
      console.log('value this', value)

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

  private parseString(): string | null {
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

    console.log('unclosed string');
    return result + '...';

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

  private skipWhitespace(): void {
    while (/\s/.test(this.str[this.index])) {
      this.index++;
    }
  }

  private isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
  }
}
