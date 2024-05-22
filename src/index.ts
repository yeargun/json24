import { JSONParser } from "./JsonParser";

interface ParsedJson {
    [key: string]: any;
}

interface ParseOptions {
    hasExplicitUndefined?: boolean;
}

// function closeJson(jsonString: string): string {

//     // Function to attempt to close incomplete strings

//     let stack = [];

//     let inStringWithOpenQuote = false;



//     for (let i = 0; i < jsonString.length; i++) {

//         const char = jsonString[i];

//         if (char === '"' && (i === 0 || jsonString[i - 1] !== '\\')) {

//             inStringWithOpenQuote = !inStringWithOpenQuote;

//         }



//         if (!inStringWithOpenQuote) {

//             if (char === '{' || char === '[') {

//                 stack.push(char);

//             } else if (char === '}' && stack[stack.length - 1] === '{') {

//                 stack.pop();

//             } else if (char === ']' && stack[stack.length - 1] === '[') {

//                 stack.pop();

//             }

//         }

//     }



//     while (stack.length) {

//         const unbalanced = stack.pop();

//         if (unbalanced === '{') jsonString += '}';

//         if (unbalanced === '[') jsonString += ']';

//     }



//     if (inStringWithOpenQuote) {

//         jsonString += '..."';

//     }



//     return jsonString;

// }


const parse = (closedJsonString: string, options: ParseOptions = {}) => {
    try {
        return JSON.parse(closedJsonString)
    } catch (error) {
        console.log('cant parse')
        const resilientJsonParser = new JSONParser();
        return resilientJsonParser.parse(closedJsonString);
        // return parsePartialJson(closedJsonString, options);
    }
}


// function parsePartialJson(jsonString: string, options: ParseOptions = {}) {
//     const { hasExplicitUndefined = false } = options;
//     const closedJsonString = closeJson(jsonString);

//     console.log('@',closedJsonString);


//     const pattern = /"([^"]+)":\s*(null|undefined|true|false|\d+|"(?:[^"\\]|\\.)*"?|\{(?:[^{}]|\{[^{}]*\})*\}|\[(?:[^[\]]|\[[^[\]]*\])*\])/g;    
//     let result: ParsedJson = {};
//         closedJsonString.replace(pattern, (match, key, rawVal) => {
//             let value;
//             console.log(match, key, rawVal);

//             if (rawVal === "null") 
//                 value = null;
//             else if (rawVal === "undefined") 
//                 value = hasExplicitUndefined ? undefined : null;
//             else if (rawVal === "true") 
//                 value = true;
//             else if (rawVal === "false")
//                 value = false;
//             else if (!isNaN(Number(rawVal))) 
//                 value = Number(rawVal);
//             else if (rawVal.startsWith('"')) {
//                 if (!rawVal.endsWith('"')) 
//                     rawVal += '..."';
//                 value = rawVal.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
//             } 
//             else if (rawVal.startsWith('{') ) {
//                 try {
//                     value = parse(rawVal, options);
//                 } catch (error) {
//                     console.log('failed parsing object at key', key)
//                 }
//             }
//             else if (rawVal.startsWith('[')) {
//                 try {
//                     value = parse(rawVal, options);
//                 } catch (error) {
//                     console.log('failed parsing object at key', key)
//                 }
//             } 
//             else
//                 value = rawVal;
//             result[key] = value;
//             return match;
//         });
//         return result;

// }

// const parse = (jsonString: string, options: ParseOptions = {}) => {
//     try{
//         return JSON.parse(jsonString);
//     } catch (e) {
//         console.log('failed parsing')
//         parsePartialJson(jsonString, options);
//     }
// }



//00 function parsePartialJson(jsonString: string, options: ParseOptions = {}): ParsedJson {
//     const { hasExplicitUndefined = false } = options;
//     const closedJsonString = closeJson(jsonString);
//     const pattern = /"([^"]+)":\s*(null|undefined|true|false|\d+|"(?:[^"\\]|\\.)*"?|\{(?:[^{}]|\{[^{}]*\})*\}|\[(?:[^[\]]|\[[^[\]]*\])*\])/g;    let result: ParsedJson = {};

//     closedJsonString.replace(pattern, (match, key, rawVal) => {
//         let value;
//         console.log(match, key, rawVal);
//         if (rawVal === "null") 
//             value = null;
//         else if (rawVal === "undefined")
//             value = hasExplicitUndefined ? undefined : null;
//         else if (rawVal === "true")
//             value = true; 
//         else if (rawVal === "false") 
//             value = false;
//         else if (!isNaN(Number(rawVal)))
//             value = Number(rawVal);
//         else if (rawVal.startsWith('"')) {
//             // Correct potentially unclosed string
//             if (!rawVal.endsWith('"')) {
//                 rawVal += '..."';
//             }
//             // Remove surrounding quotes and handle escape sequences
//             value = rawVal.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
//         }
//         else if (rawVal.startsWith('"') && rawVal.endsWith('"')) {
//             // String value
//             value = rawVal.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
//         } 
//         else if (rawVal.startsWith('{') && rawVal.endsWith('}')) {
//             // Nested object
//             value = parse(rawVal, options);
//         }
//         else if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
//             // Array
//             value = JSON.parse(rawVal, (key, val) => {
//                 if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
//                     return parsePartialJson(val, options);
//                 }
//                 return val;
//             });
//         }
//         result[key] = value;
//         return match;
//     });
//     return result;
// }


// function logFaultyJson(jsonString: string, parsedJson: ParsedJson): void {
//     console.warn("Warning: Faulty JSON string encountered:", jsonString);
// }

// function parsePartialJsonWithLogging(jsonString: string, options: ParseOptions = {}): ParsedJson | FaultyJson {
//     try {
//         return parsePartialJson(jsonString, options);
//     } catch (error) {
//         logFaultyJson(jsonString, {});
//         return {
//             faultyJsonString: jsonString,
//             parsedJson: {}
//         };
//     }
// }

// export { parsePartialJson, parsePartialJsonWithLogging, parse };
export { parse }



// console.log(closeJson('{"numbers": [1, 2, 3], "users": [{"name": "John"}, {"name": "Jane"}'));