
//00 const closeJson = (input: string): string => {

//     let buffer = "";

//     const stack: any[] = [];

//     let closedObject = false;
//     let closedArray = false;
//     let closedSingleQuote = true;
//     let closedDoubleQuote = true;

//     for (const char of input) {
//         buffer += char;
//         switch (char) {
//             case "{":
//                 stack.push(char);
//                 closedObject = false;
//                 break;
//             case "'":
//                 closedSingleQuote = !closedSingleQuote; break;
//             case '"':
//                 closedDoubleQuote = !closedDoubleQuote; break;
//             case "}":
//                 if (stack[stack.length - 1] === "{")
//                     stack.pop();
//                 closedObject = true;
//                 break;
//             case "[":
//                 stack.push(char);
//                 closedArray = false;
//                 break;

//             case "]":
//                 if (stack[stack.length - 1] === "[")
//                     stack.pop();
//                 closedArray = true;
//                 break;
//             case '"':
//                 if (stack[stack.length - 1] === '"')
//                     stack.pop();
//                 else
//                     stack.push(char);
//                 break;
//             default:
//                 break;
//         }
//     }

//     let closeBuffer = buffer.trim();
//     for (const char of [...stack].reverse()) {
//         if(!closedSingleQuote || !closedDoubleQuote) continue;
//         switch (char) {
//             case "{":
//                 if (closeBuffer[closeBuffer.length - 1] === ",") {
//                     closeBuffer = closeBuffer.slice(0, -1);
//                 }
//                 closeBuffer += "}";
//                 break;
//             case "[":
//                 if (closeBuffer[closeBuffer.length - 1] === ",") {
//                     closeBuffer = closeBuffer.slice(0, -1);
//                 }
//                 closeBuffer += "]";
//                 break;
//             case '"':
//                 break;
//             default:
//                 break;
//         }
//     }
//     return closeBuffer;

// };

const closeJson = (input: string): string => {

    let buffer = "";

    const stack: any[] = [];

    let closedObject = false;

    let closedArray = false;

    let closedSingleQuote = true;

    let closedDoubleQuote = true;



    for (const char of input) {

        buffer += char;

        switch (char) {

            case "{":

                stack.push(char);

                closedObject = false;

                break;

            case "'":

                closedSingleQuote = !closedSingleQuote;

                stack.push(char);

                break;

            case '"':

                closedDoubleQuote = !closedDoubleQuote;

                stack.push(char);

                break;

            case "}":

                if (stack[stack.length - 1] === "{") stack.pop();

                closedObject = true;

                break;

            case "[":

                stack.push(char);

                closedArray = false;

                break;

            case "]":

                if (stack[stack.length - 1] === "[") stack.pop();

                closedArray = true;

                break;

            default:

                break;

        }

    }



    let closeBuffer = buffer.trim();

    let skip = false;



    for (let i = stack.length - 1; i >= 0; i--) {

        if(skip) {

            skip = false;

            continue;

        }

        

        switch (stack[i]) {

            case "{":

                if (closeBuffer[closeBuffer.length - 1] === ",") {

                    closeBuffer = closeBuffer.slice(0, -1);

                }

                closeBuffer += "}";

                break;

            case "[":

                if (closeBuffer[closeBuffer.length - 1] === ",") {

                    closeBuffer = closeBuffer.slice(0, -1);

                }

                closeBuffer += "]";

                break;

            case '"':

                if (i > 0 && stack[i - 1] === '"') {

                    skip = true;

                } else {

                    closeBuffer += '..."';

                }

                break;

            case "'":

                if (i > 0 && stack[i - 1] === "'") {

                    skip = true;

                } else {

                    closeBuffer += "'";

                }

                break;

            default:

                break;

        }

    }



    return closeBuffer;

};

// const input = '{"name": "John", "age": 30, "hobbies": ["reading", "gami';


// const closedJson = closeJson(input);

// console.log(closedJson);  // Should output a properly closed JSON string

export { closeJson };