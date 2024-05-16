interface ParsedJson {
    [key: string]: any;
}

interface ParseOptions {
    hasNull?: boolean;
}

interface FaultyJson {
    faultyJsonString: string;
    parsedJson: ParsedJson;
}

function parsePartialJson(jsonString: string, options: ParseOptions = {}): ParsedJson {
    const { hasNull = false } = options;

    const pattern = /"([^"]+)":\s*(?:"([^"]*)"|(\d+)|true|false|null|undefined|\[|\{|\s*"?([^",\]}]*))?/g;
    const matches = [...jsonString.matchAll(pattern)];
    const result: ParsedJson = {};

    matches.forEach(match => {
        const key = match[1];
        let value;

        if (match[2] !== undefined) {
            value = match[2];
        } else if (match[3] !== undefined) {
            value = parseInt(match[3], 10);
        } else if (match[0].includes(`${key}: true`)) {
            value = true;
        } else if (match[0].includes(`${key}: false`)) {
            value = false;
        } else if (match[0].includes(`${key}: null`)) {
            value = hasNull ? null : undefined;
        } else if (match[0].includes(`${key}: undefined`)) {
            value = undefined;
        } else if (match[4] !== undefined) {
            value = match[4];
        }

        result[key] = value;
    });

    return result;
}

function logFaultyJson(jsonString: string, parsedJson: ParsedJson): void {
    console.warn("Warning: Faulty JSON string encountered:", jsonString);
}

function parsePartialJsonWithLogging(jsonString: string, options: ParseOptions = {}): ParsedJson | FaultyJson {
    try {
        return parsePartialJson(jsonString, options);
    } catch (error) {
        logFaultyJson(jsonString, {});
        return {
            faultyJsonString: jsonString,
            parsedJson: {}
        };
    }
}

export { parsePartialJson, parsePartialJsonWithLogging };
