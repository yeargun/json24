import { parsePartialJson, parsePartialJsonWithLogging } from './jsOnGod.ts';

describe('parsePartialJson', () => {
    test('should parse proper JSON strings', () => {
        const jsonString = '{"name": "John", "age": 30, "city": "New York"}';
        const parsedJson = parsePartialJson(jsonString);
        expect(parsedJson).toEqual({ name: 'John', age: 30, city: 'New York' });
    });

    test('should parse incomplete JSON string', () => {
        const jsonString = '{"name": "John", "age": 30, "ciy": "New York"}';
        const parsedJson = parsePartialJson(jsonString);
        expect(parsedJson).toEqual({ name: 'John', age: 30, ciy: 'New York' });
    });

    test('should handle null values when convertNullToUndefined option is true', () => {
        const jsonString = '{"name": "John", "age": null}';
        const parsedJson = parsePartialJson(jsonString, { hasNull: true });
        expect(parsedJson).toEqual({ name: 'John', age: null });
    });
});

describe('parsePartialJsonWithLogging', () => {
    test('should parse complete JSON string without logging', () => {
        const jsonString = '{"name": "John", "age": 30, "city": "New York"}';
        const parsedJson = parsePartialJsonWithLogging(jsonString);
        expect(parsedJson).toEqual({ name: 'John', age: 30, city: 'New York' });
    });

    test('should parse incomplete JSON string and log faulty JSON', () => {
        const jsonString = '{"name": "John", "age": 30, "ciy": "New York"}';
        const parsedJson = parsePartialJsonWithLogging(jsonString);
        expect(parsedJson).toEqual({ name: 'John', age: 30, ciy: 'New York' });
    });

    test('should handle null values when convertNullToUndefined option is true and log faulty JSON', () => {
        const jsonString = '{"name": "John", "age": null}';
        const parsedJson = parsePartialJsonWithLogging(jsonString, { convertNullToUndefined: true });
        expect(parsedJson).toEqual({ name: 'John', age: undefined });
    });

    test('should log faulty JSON when encountered', () => {
        const jsonString = '{"name": "John", "age": 30, "ciy": "New York"';
        const parsedJson = parsePartialJsonWithLogging(jsonString);
        expect(parsedJson).toEqual({
            faultyJsonString: '{"name": "John", "age": 30, "ciy": "New York"',
            parsedJson: {}
        });
    });
});
