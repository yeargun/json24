import { ParseOptions } from "./FuzzyJsonParser";

export class FuzzyJsonParser {
    private index: number;
    private str: string;
    private hasExplicitUndefined: boolean
    private appendStrOnEnd: string;
    private currParseSettings: ParseOptions | undefined;

    constructor({ appendStrOnEnd = '...', hasExplicitUndefined = false }: ParseOptions = {}) {
        this.index = 0;
        this.str = "";
        this.appendStrOnEnd = appendStrOnEnd;
        this.hasExplicitUndefined = hasExplicitUndefined;
    }

    parse(jsonStr: string, requiredKeys?: string[], options?: ParseOptions): any {
        try {
            return JSON.parse(jsonStr);
        } catch (error) {
            console.log('Classic JSON parse error', jsonStr.slice(this.index, this.index + 8) + '...');
            // Merge current options with instance options.
            this.currParseSettings = {
                appendStrOnEnd: this.appendStrOnEnd,
                hasExplicitUndefined: this.hasExplicitUndefined,
                ...options,
            };
            const jsonSegments = this.extractJsonLikeSegments(jsonStr);
            return this.findAndParseValidJsonSegment(jsonSegments, requiredKeys);
        }
    }



    // extractJsonLikeSegments(input: string): string[] {

    //   const segments: string[] = [];

    //   const stack: string[] = [];

    //   let jsonStart = -1;



    //   for (let i = 0; i < input.length; i++) {
    //     const char = input[i];

    //     if (char === '{' || char === '[') {
    //       if (jsonStart === -1) {
    //         jsonStart = i;
    //       }
    //       stack.push(char);
    //     } 
    //     else if (
    //       (char === '}' && stack[stack.length - 1] === '{') ||
    //       (char === ']' && stack[stack.length - 1] === '[')
    //     ) {
    //       stack.pop();
    //       if (stack.length === 0) {
    //         segments.push(input.substring(jsonStart, i + 1));
    //         jsonStart = -1;
    //       }
    //     }
    //     else if(i== input.length - 1) {
    //         segments.push(input.substring(jsonStart, i + 1));
    //         jsonStart = -1;
    //     }
    //   }
    //   return segments;
    // }

    private extractJsonLikeSegments(input: string): string[] {

        const segments: string[] = [];

        const stack: string[] = [];

        let jsonStart = -1;



        for (let i = 0; i < input.length; i++) {

            const char = input[i];



            if (char === '{' || char === '[') {

                if (jsonStart === -1) {

                    jsonStart = i;

                }

                stack.push(char);

            } else if ((char === '}' && stack[stack.length - 1] === '{') || (char === ']' && stack[stack.length - 1] === '[')) {

                stack.pop();

                if (stack.length === 0) {

                    segments.push(input.substring(jsonStart, i + 1));

                    jsonStart = -1;

                }

            }



            // Push incomplete segment when the input ends

            if (i === input.length - 1 && jsonStart !== -1) {

                segments.push(input.substring(jsonStart, i + 1));

            }

        }



        return segments;

    }



    private findAndParseValidJsonSegment(segments: string[], requiredKeys?: string[]): any {
        for (let segment of segments) {
            const obj = this.parseBase(segment);
            if (obj && this.containsRequiredKeys(obj, requiredKeys))
                return obj;
        }
        return null;
    }



    private containsRequiredKeys(obj: any, requiredKeys?: string[]): boolean {
        if (!requiredKeys || requiredKeys?.length === 0) return true;
        if (typeof obj !== 'object' || obj === null) return false;
        return requiredKeys.every(key => key in obj);
    }

    private parseBase(jsonStr: string): any {
        try {
            return JSON.parse(jsonStr);
        } catch (error) {
            this.resetParser(jsonStr);
            return this.parseInternal();
        }
    }

    private resetParser(jsonStr: string): void {
        this.index = 0;
        this.str = jsonStr;
    }

    private parseInternal(): any {
        try {
            return this.parseValue();
        } catch (error) {
            console.error("Error parsing JSON:", error);
            return null;
        }
    }



    private parseValue(): any {
        // console.log('parsevalie atm', this.index)
        // console.log('parsevalie str', this.str)
        // console.log('parsevalie leng', this.str?.length)
        this.skipWhitespace();
        const char = this.str[this.index];
        if (char === '{') return this.parseObject();
        if (char === '[') return this.parseArray();
        if (char === '"') return this.parseString();
        if (char === '-' || this.isDigit(char)) return this.parseNumber();
        if (char === 't' || char === 'f') return this.parseBoolean();
        if (char === 'n') return this.parseNull();
        if (char === 'u') return this.parseUndefined();
        //   throw new Error(`Unexpected char: ${char}`);
    }



    private parseObject(): Record<string, any> | null {
        this.index++;
        const obj: Record<string, any> = {};
        while (this.index < this.str.length) {
            this.skipWhitespace();
            if (this.str[this.index] === '}') {
                this.index++;
                return obj;
            }
            const key = this.parseString();
            this.skipWhitespace();

            // if (this.str[this.index] !== ':') {
            //   throw new Error('Expected ":" after key in object');
            // }
            this.index++;
            this.skipWhitespace();
            const value = this.parseValue();
            if (value === undefined && !this.currParseSettings?.hasExplicitUndefined)
                continue;
            obj[key] = value;
            this.skipWhitespace();
            if (this.str[this.index] === ',') 
                this.index++;
            else if (this.str[this.index] === '}') {
                this.index++;
                return obj;
            } 
            else if (this.index >= this.str.length)
                return obj;
        }
        return obj;
    }

    private parseArray(): any[] | null {
        this.index++;
        const arr: any[] = [];
        while (this.index < this.str.length) {
            this.skipWhitespace();
            if (this.str[this.index] === ']') {
                this.index++;
                return arr;
            }
            arr.push(this.parseValue());
            this.skipWhitespace();
            if (this.str[this.index] === ',')
                this.index++;
            else if (this.str[this.index] === ']') {
                this.index++;
                return arr;
            }
            else if (this.index >= this.str.length)
                return arr;
        }
        return arr;
    }


    private parseString(): string {
        let result = '';
        this.index++; 

        while (this.index < this.str.length) {
            if (this.str[this.index] === '"') {
                this.index++;
                return result;
            }

            if (this.str[this.index] === '\\') {
                this.index++;
                const escapeChars: { [key: string]: string } = {
                    '"': '"',
                    '\\': '\\',
                    '/': '/',
                    b: '\b',
                    f: '\f',
                    n: '\n',
                    r: '\r',
                    t: '\t'
                };
                result += escapeChars[this.str[this.index]] || this.str[this.index];
            } 
            else 
                result += this.str[this.index];

            this.index++;
        }
        return result + (this.currParseSettings?.appendStrOnEnd || this.appendStrOnEnd); // unclosed string
    }



    private parseNumber(): number | null {
        const start = this.index;
        if (this.str[this.index] === '-') this.index++;
        while (this.isDigit(this.str[this.index])) this.index++;
        if (this.str[this.index] === '.') {
            this.index++;
            while (this.isDigit(this.str[this.index])) this.index++;
        }

        if (this.str[this.index] === 'e' || this.str[this.index] === 'E') {
            this.index++;
            if (this.str[this.index] === '-' || this.str[this.index] === '+') this.index++;
            while (this.isDigit(this.str[this.index])) this.index++;
        }
        return Number(this.str.slice(start, this.index));
    }



    private parseBoolean(): boolean | null {
        if (this.str.startsWith('true', this.index)) {
            this.index += 4;
            return true;
        } 
        else if (this.str.startsWith('false', this.index)) {
            this.index += 5;
            return false;
        }
        throw new Error('Unexpected token in JSON');
    }



    private parseNull(): null | never {
        if (this.str.startsWith('null', this.index)) {
            this.index += 4;
            return null;
        }
        throw new Error('Unexpected token in JSON');
    }



    private parseUndefined(): undefined | never {
        if (this.str.startsWith('undefined', this.index)) {
            this.index += 9;
            return undefined;
        }
        throw new Error('Unexpected token in JSON');
    }



    private skipWhitespace(): void {
        while (/\s/.test(this.str[this.index])) {
            this.index++;
        }
    }



    private isDigit(char: string): boolean {
        return char >= '0' && char <= '9';
    }
}




//  const xd = new FuzzyJsonParser();
//  console.log(
//     xd.extractJsonLikeSegments('{"numbers": [1, 2, 3], "users": [{"name": "John"}, {"name": "Jane"}')
//  )