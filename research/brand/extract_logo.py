"""
Cuts the lockup out of a brand kit screenshot and keys the flat background to
transparency, so the asset can sit on any surface without a plate.

The background in both screenshots is a single flat colour, which is what makes
this safe: alpha is the pixel's distance from that colour, normalised by the
strongest ink in the image, and the colour is then unpremultiplied so
anti-aliased edges stay clean instead of picking up a halo.

Clear space is the wordmark cap height on all four sides, per the brand kit.
"""

import struct
import sys
import zlib


def read_raw(path, w, h):
    with open(path, 'rb') as f:
        d = f.read()
    assert len(d) == w * h * 3, f'expected {w * h * 3} bytes, got {len(d)}'
    return d


def write_png(path, w, h, rgba):
    raw = bytearray()
    for y in range(h):
        raw.append(0)  # filter type 0
        raw.extend(rgba[y * w * 4:(y + 1) * w * 4])

    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(bytes(raw), 9))
    png += chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(png)


def extract(raw, W, box, bg, out, pad):
    x0, y0, bw, bh = box
    x0 -= pad
    y0 -= pad
    bw += pad * 2
    bh += pad * 2

    def px(x, y):
        i = (y * W + x) * 3
        return raw[i], raw[i + 1], raw[i + 2]

    # Strongest ink in the crop sets the scale for alpha.
    peak = 1
    for y in range(y0, y0 + bh):
        for x in range(x0, x0 + bw):
            peak = max(peak, max(abs(a - b) for a, b in zip(px(x, y), bg)))

    out_px = bytearray()
    for y in range(y0, y0 + bh):
        for x in range(x0, x0 + bw):
            p = px(x, y)
            dist = max(abs(a - b) for a, b in zip(p, bg))
            a = min(255, round(dist * 255 / peak))
            if a == 0:
                out_px.extend((0, 0, 0, 0))
                continue
            # Unpremultiply: recover the ink colour from the blend with bg.
            col = []
            for c, bgc in zip(p, bg):
                v = bgc + (c - bgc) * 255 / a
                col.append(max(0, min(255, round(v))))
            out_px.extend((col[0], col[1], col[2], a))

    write_png(out, bw, bh, out_px)
    print(f'{out}: {bw} x {bh}, ratio {bw / bh:.3f}')


if __name__ == '__main__':
    W, H = 517, 292
    dark = read_raw('dark.raw', W, H)
    # Lockup measured at 138 x 97 starting (197, 86). Clear space 17px, the
    # wordmark cap height at this scale.
    extract(dark, W, (197, 86, 138, 97), (15, 24, 29), sys.argv[1], 17)
