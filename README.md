# simple-base64-crlf-line-wrapper

Inserts RFC 2045 CRLF line breaks every 76 characters into Base64 output for MIME compatibility.

```js
import { wrapBase64 } from './src/index.js';

const base64 = Buffer.from('hello world').toString('base64');
// => 'aGVsbG8gd29ybGQ='

const wrapped = wrapBase64(base64);
// Short input is returned unchanged.
// For longer input, CRLF is inserted every 76 characters.
```

## Why this exists

Base64 produced by `Buffer.toString('base64')` or `btoa` is a single long line. RFC 2045 requires MIME bodies to be split into lines of at most 76 characters, separated by CRLF. Doing this by hand is easy to get subtly wrong: the last line must not carry a trailing CRLF, and the split must not land in the middle of a four-character Base64 quantum.

The trade-off here is strictness over convenience. The wrapper rejects input that already contains CR or LF instead of normalising it, and it never appends a trailing CRLF. That makes the output predictable and idempotent for short inputs, at the cost of requiring callers to strip line breaks themselves if they have already-wrapped text.

## The awkward edge

The line length is a parameter, but it is not arbitrary: Base64 is encoded in four-character quanta. A line length that is not a multiple of four still works, but it splits quanta across lines, which some MIME parsers dislike. The default of 76 is a multiple of four, and the tests pin that default. If you pass a custom length, choose a multiple of four unless you have a reason not to.

## API

### `wrapBase64(base64, lineLength = 76)`

Returns `base64` with a CRLF inserted every `lineLength` characters. Throws `TypeError` if `base64` is not a string, `RangeError` if `lineLength` is not a positive integer, and `Error` if `base64` contains CR or LF.
