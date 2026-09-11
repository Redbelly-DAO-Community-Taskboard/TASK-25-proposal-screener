# Fonts

Three static font files, used only at build time.

`src/app/opengraph-image.tsx` renders the social card with satori, which
rasterises text itself and needs the real font binaries rather than a CSS link.
The pages in the browser do not read these files. They load the same two
families through `next/font/google` in `src/app/layout.tsx`.

Static cuts are committed rather than variable ones because satori cannot read a
variable font. `JetBrainsMono[wght].ttf` fails with a null dereference, so the
static Medium cut is used instead.

## Files

| File | Family | Weight | Used for |
| --- | --- | --- | --- |
| `BeVietnamPro-Bold.ttf` | Be Vietnam Pro | 700 | Card headline |
| `BeVietnamPro-Regular.ttf` | Be Vietnam Pro | 400 | Card subtitle |
| `JetBrainsMono-Medium.ttf` | JetBrains Mono | 500 | Card labels and figures |

## Licence

Both families are licensed under the SIL Open Font License, Version 1.1. The
licence and its FAQ are at https://openfontlicense.org.

Be Vietnam Pro: Copyright 2021 The Be Vietnam Pro Project Authors,
https://github.com/bettergui/BeVietnamPro. Yellow Type Foundry, by Lam Bao,
Tony Le and Vietanh Nguyen.

JetBrains Mono: Copyright 2020 The JetBrains Mono Project Authors,
https://github.com/JetBrains/JetBrainsMono. By Philipp Nurullin and Konstantin
Bulenkov. JetBrains Mono is a trademark of JetBrains s.r.o.

Neither file has been modified. Both are the upstream releases, Be Vietnam Pro
version 1.002 and JetBrains Mono version 2.305.
