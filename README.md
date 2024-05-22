# FuzzyJSONParser aka json24
**json24** is a robust JSON parser designed to handle and recover data from JSON strings with extraneous text and incomplete structures. It can parse JSON strings that include redundant pre/post content and recover from missing closing characters like `", ], and }` Might be specifically useful for parsing LLM API responses (ChatGPT, LLAMA, Claude, etc...)

## Features
- Handles extraneous text before and after the JSON string.
- Recovers from incomplete JSON structures.
- Configurable parsing options.
- Provides a simple API for easy integration.
- Works as ```JSON.parse()```'s fallback


## Installation
```bash
npm/bun install json24
```

## Usage

### Basic Example
```javascript
const { FuzzyJsonParser } = require('json24');
const parser = new FuzzyJsonParser({ appendStrOnEnd: '...', hasExplicitUndefined: true });
console.log(
    parser.parse(
        'Some random text. {"numbers": [1, 2, 3], "users": [{"name": "John"}, {"name": "Jane'
    )
)
// Output: { numbers: [1, 2, 3], users: [ { name: 'John' }, { name: 'Jane...' } ] }
```

### Configuration Options

- `appendStrOnEnd` (string, default: '...'): Specifies the string to append to incomplete JSON strings to help close them.
- `hasExplicitUndefined` (boolean, default: false): If set to `true`, the parser will include explicit undefined values in objects.

### API
#### `parse(jsonStr: string, requiredKeys?: string[], options?: ParseOptions): any`
Parses a JSON string while handling extraneous and incomplete structures.

**Parameters:**
- `jsonStr` (string): The JSON string to parse.
- `requiredKeys` (string[]): Optional array of keys that must be present in the JSON string for it to be considered valid. Is helpful when you think there might be multiple JSON-like strings might be present in the string.
- `options` (ParseOptions): Optional settings to override the default parser options.

**Returns:** `any` - The parsed JSON object or `null` if parsing fails.

## Contributing



FuzzyJSONParser is still in its early stages and not completely tested. While some test cases are included, there's plenty of room for more comprehensive testing and improvement. Any contribution is welcomed:

- **Feedback:** If you encounter any issues or have suggestions for improvements, please open an issue on GitHub.
- **Testing:** Help us expand the test coverage by writing and submitting new test cases.
- **Bug Fixes:** If you find and fix bugs, please submit a pull request.
- **Features:** If you have ideas for new features or enhancements, feel free to discuss them in an issue or submit a pull request.


We appreciate your feedback and contributions!

## License
This project is licensed under the MIT License.