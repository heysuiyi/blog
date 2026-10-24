import test from 'node:test';
import assert from 'node:assert/strict';
import { serializeJsonLd } from '../src/lib/structured-data.ts';

test('JSON-LD keeps arbitrary content as data without closing its script element', () => {
	const value = { headline: '</script><script>alert("&")</script>\u2028\u2029', author: 'SuiYI' };
	const output = serializeJsonLd(value);
	assert.ok(!/[<>&\u2028\u2029]/u.test(output));
	assert.deepEqual(JSON.parse(output), value);
});
