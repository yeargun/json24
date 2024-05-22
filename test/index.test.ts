import { FuzzyJsonParser } from "../src";

const json24 = new FuzzyJsonParser({ hasExplicitUndefined: true });


describe('parsePartialJson tests', () => {
    test('should parse incomplete JSON string', () => {
        const jsonString = '{"name": "John", "age": 30, "ciy": "New York"}';
        const parsedJson = json24.parse(jsonString);
        expect(parsedJson).toEqual({ name: 'John', age: 30, ciy: 'New York' });
    });

    test('null value', () => {
        const jsonString = '{"name": "John", "age": null';
        const parsedJson = json24.parse(jsonString);
        expect(parsedJson).toEqual({ name: 'John', age: null });
    });

    test('undefined with hasExplicitUndefined=true', () => {
        const jsonString = '{"name": "John", "age": undefined';
        const parsedJson = json24.parse(jsonString,[], { hasExplicitUndefined: true });
        expect(parsedJson).toEqual({ name: 'John', age: undefined });
        expect(Object.keys(parsedJson)).toContain('age');
    });

    test('undefined with hasExplicitUndefined=false', () => {
        const jsonString = '{"name": "John", "age": undefined';
        const parsedJson = json24.parse(jsonString, [], { hasExplicitUndefined: false });
        expect(parsedJson).toEqual({ name: 'John' });
        expect(Object.keys(parsedJson).indexOf('age')).toBe(-1);
    });


    test('boolean values', () => {
        const jsonString = '{"isAdmin": true, "isGuest": false';
        const parsedJson = json24.parse(jsonString);
        expect(parsedJson).toEqual({ isAdmin: true, isGuest: false });
    });

    test('number values', () => {
        const jsonString = '{"age": 30, "height": 175';
        const parsedJson = json24.parse(jsonString);
        expect(parsedJson).toEqual({ age: 30, height: 175 });
    });

    test('closed string', () => {
        const jsonString = '{"greeting": "Hello, World!", "farewell": "Goodbye"';
        const parsedJson = json24.parse(jsonString);
        expect(parsedJson).toEqual({ greeting: 'Hello, World!', farewell: 'Goodbye' });
    });

    test('unclosed string', () => {
        const jsonString = '{"greeting": "Hello, World!", "farewell": "Goodbye';
        const parsedJson = json24.parse(jsonString);
        expect(parsedJson).toEqual({ greeting: 'Hello, World!', farewell: 'Goodbye...' });
    });

    test('nested objects', () => {
        const jsonString = '{"user": {"name": "John", "age": 30}, "isAdmin": true}';
        const parsedJson = json24.parse(jsonString);
        expect(parsedJson).toEqual({ user: { name: 'John', age: 30 }, isAdmin: true });
    });


    test('arrays', () => {
        const jsonString = '{"numbers": [1, 2, 3], "users": [{"name": "John"}, {"name": "Jane"}';
        const parsedJson = json24.parse(jsonString, []);
        expect(parsedJson).toEqual({ numbers: [1, 2, 3], users: [{ name: 'John' }, { name: 'Jane' }] });
    });

    test('nested arrays and objects', () => {
        const jsonString = '{"data": {"items": [{"id": 1}, {"id": 2}], "count": 2}, "status": "success"}';
        const parsedJson = json24.parse(jsonString);
        expect(parsedJson).toEqual({
            data: { items: [{ id: 1 }, { id: 2 }], count: 2 },
            status: 'success'
        });
    });

    test('escaping characters in strings', () => {
        const jsonString = '{"escaped": "\\"quoted\\", \\\\backslash"';
        const parsedJson = json24.parse(jsonString);
        expect(parsedJson).toEqual({ escaped: '"quoted", \\backslash' });
    });

    test('deeply nested structures', () => {
        const jsonString = '{"level1": {"level2": {"level3": {"level4": {"name": "John"}}}}, "simple": {"key": "value"}';
        const parsedJson = json24.parse(jsonString);
        expect(parsedJson).toEqual({
            level1: {
                level2: {
                    level3: {
                        level4: {
                            name: 'John'
                        }
                    }
                }
            },
            simple: { key: 'value' }
        });
    });



    test('mixed types in arrays', () => {
        const jsonString = '{"items": [1, "two", true, null, {"name": "John"}, ["inner", "array"], "undefined"]}';
        const parsedJson = json24.parse(jsonString, [], { hasExplicitUndefined: true });
        expect(parsedJson).toEqual({
            items: [1, 'two', true, null, { name: 'John' }, ['inner', 'array'], "undefined"]
        });
    });


    test('array root case', () => {
        const jsonString = '["one", "two", {"three": "4"}, 5]';
        const parsedJson = json24.parse(`{"root": ${jsonString}}`);
        expect(parsedJson.root).toEqual(["one", "two", { "three": "4" }, 5]);
    });


    test('empty object', () => {
        const jsonString = '{';
        const parsedJson = json24.parse(jsonString);
        expect(parsedJson).toEqual({});
    });

    test('empty array', () => {
        const jsonString = '[';
        const parsedJson = json24.parse(jsonString);
        expect(parsedJson).toEqual([]);
    });


    test('array of empty objects', () => {
        const jsonString = '[{}, {}';
        const parsedJson = json24.parse(jsonString);
        expect(parsedJson).toEqual([{}, {}]);
    });


    test('pre text not related to the json output', () => {
        const jsonString = 'unemployment day 10. its very hard to live a life without money Ive lost 10pounds already. god help me {"items": [1, "two", true, null, {"name": "John"}, ["inner", "array"], "undefined"]}';
        const parsedJson = json24.parse(jsonString, [], { hasExplicitUndefined: true });
        expect(parsedJson).toEqual({
            items: [1, 'two', true, null, { name: 'John' }, ['inner', 'array'], "undefined"]
        });
    });

    test('post text not related to the json output', () => {
        const jsonString = ' {"items": [1, "two", true, null, {"name": "John"}, ["inner", "array"], "undefined"]}  unemployment day 10. its very hard to live a life without money Ive lost 10pounds already';
        const parsedJson = json24.parse(jsonString, [], { hasExplicitUndefined: true });
        expect(parsedJson).toEqual({
            items: [1, 'two', true, null, { name: 'John' }, ['inner', 'array'], "undefined"]
        });
    });

    test('pre and post text not related to the json output', () => {
        const jsonString = 'unemployment day 10. its very hard to live a life without money ive lost 10pounds already. {"items": [1, "two", true, null, {"name": "John"}, ["inner", "array"], "undefined"]}  unemployment day 10. its very hard to live a life without money Ive lost 10pounds already';
        const parsedJson = json24.parse(jsonString, [], { hasExplicitUndefined: true });

        expect(parsedJson).toEqual({
            items: [1, 'two', true, null, { name: 'John' }, ['inner', 'array'], "undefined"]
        });
    });
});
