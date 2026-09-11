"""
Builds the icon and the Open Graph card from the brand kit lockup.

Both are composed from tokens rather than styled by eye: the surfaces, the
brand red and the type colours all come from the kit. The icon uses the mark
alone, because the kit says the wordmark stops reading below 28px and to use
the favicon instead at that size.
"""

import struct
import zlib

W, H = 517, 292
BG = (15, 24, 29)


def read_raw(path, w, h):
    with open(path, 'rb') as f:
        d = f.read()
    assert len(d) == w * h * 3
    return d


def write_png(path, w, h, rgba):
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        raw.extend(rgba[y * w * 4:(y + 1) * w * 4])

    def chunk(tag, data):
        return (struct.pack('>I', len(data)) + tag + data
                + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF))

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(bytes(raw), 9))
    png += chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(png)


def crop_rgba(raw, box, bg):
    """Crop to box and key the flat background to transparency."""
    x0, y0, bw, bh = box

    def px(x, y):
        i = (y * W + x) * 3
        return raw[i], raw[i + 1], raw[i + 2]

    peak = 1
    for y in range(y0, y0 + bh):
        for x in range(x0, x0 + bw):
            peak = max(peak, max(abs(a - b) for a, b in zip(px(x, y), bg)))

    out = []
    for y in range(y0, y0 + bh):
        row = []
        for x in range(x0, x0 + bw):
            p = px(x, y)
            a = min(255, round(max(abs(c - b) for c, b in zip(p, bg)) * 255 / peak))
            if a == 0:
                row.append((0, 0, 0, 0))
                continue
            col = tuple(
                max(0, min(255, round(b + (c - b) * 255 / a))) for c, b in zip(p, bg)
            )
            row.append((col[0], col[1], col[2], a))
        out.append(row)
    return out


def scale(src, w, h):
    """Box-filter resample. Averaging keeps edges smooth when scaling down."""
    sh, sw = len(src), len(src[0])
    out = []
    for y in range(h):
        row = []
        y0, y1 = y * sh // h, max(y * sh // h + 1, (y + 1) * sh // h)
        for x in range(w):
            x0, x1 = x * sw // w, max(x * sw // w + 1, (x + 1) * sw // w)
            r = g = b = a = n = 0
            for yy in range(y0, y1):
                for xx in range(x0, x1):
                    pr, pg, pb, pa = src[yy][xx]
                    # Premultiply so transparent pixels do not drag colour in.
                    r += pr * pa
                    g += pg * pa
                    b += pb * pa
                    a += pa
                    n += 1
            if a == 0:
                row.append((0, 0, 0, 0))
            else:
                row.append((round(r / a), round(g / a), round(b / a), round(a / n)))
        out.append(row)
    return out


def flatten(rows, w, h, bg, pad_box=None):
    """Composite onto an opaque background, optionally centred in a larger box."""
    if pad_box is None:
        pad_box = (w, h)
    ow, oh = pad_box
    canvas = [[(*bg, 255) for _ in range(ow)] for _ in range(oh)]
    ox, oy = (ow - w) // 2, (oh - h) // 2
    for y in range(h):
        for x in range(w):
            r, g, b, a = rows[y][x]
            if a == 0:
                continue
            br, bg_, bb, _ = canvas[oy + y][ox + x]
            f = a / 255
            canvas[oy + y][ox + x] = (
                round(r * f + br * (1 - f)),
                round(g * f + bg_ * (1 - f)),
                round(b * f + bb * (1 - f)),
                255,
            )
    return canvas


def to_bytes(rows):
    out = bytearray()
    for row in rows:
        for p in row:
            out.extend(p)
    return out


if __name__ == '__main__':
    raw = read_raw('dark.raw', W, H)

    # The mark alone, measured at 92 x 73 starting (234, 86).
    mark = crop_rgba(raw, (234, 86, 92, 73), BG)

    # Icon: the mark centred on the base surface, square, with clear space.
    for size in (512, 192, 32):
        inner_h = round(size * 0.72)
        inner_w = round(inner_h * 92 / 73)
        small = scale(mark, inner_w, inner_h)
        canvas = flatten(small, inner_w, inner_h, BG, (size, size))
        write_png(f'icon-{size}.png', size, size, to_bytes(canvas))
        print(f'icon-{size}.png')
