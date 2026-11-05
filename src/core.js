const DEFAULT_LINE_LENGTH = 76;
const CRLF = '\r\n';

/**
 * Wraps a Base64 string with CRLF line breaks every `lineLength` characters,
 * as required by RFC 2045 for MIME bodies.
 *
 * The function never inserts a trailing line break. This choice keeps the
 * output byte-for-byte identical to the input when the input already contains
 * fewer than `lineLength` characters, which is the common case for short
 * Base64 blobs. Callers that need a final CRLF can append one themselves.
 *
 * @param {string} base64 - the Base64 text to wrap; must not contain CR or LF
 * @param {number} [lineLength=76] - characters per line; must be a positive integer
 * @returns {string} the wrapped Base64 text
 */
export function wrapBase64(base64, lineLength = DEFAULT_LINE_LENGTH) {
  if (typeof base64 !== 'string') {
    throw new TypeError('base64 must be a string');
  }
  if (!Number.isInteger(lineLength) || lineLength <= 0) {
    throw new RangeError('lineLength must be a positive integer');
  }

  // Reject embedded newlines rather than silently normalising them. Base64
  // produced by btoa or Buffer.toString('base64') never contains them, so a
  // newline here means the caller passed something else, and hiding that would
  // make the wrapper's output ambiguous.
  if (base64.includes('\r') || base64.includes('\n')) {
    throw new Error('base64 must not contain CR or LF characters');
  }

  if (base64.length <= lineLength) {
    return base64;
  }

  let out = '';
  for (let i = 0; i < base64.length; i += lineLength) {
    if (i > 0) {
      out += CRLF;
    }
    out += base64.slice(i, i + lineLength);
  }
  return out;
}
