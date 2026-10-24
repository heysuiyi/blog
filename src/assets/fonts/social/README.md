# Build-only Chinese social-card font

`SuiyiSocialSans-Regular.otf` is Noto Sans SC Regular 2.004, licensed under
the SIL Open Font License 1.1 in `OFL.txt`. It is bundled for offline,
portable social-image rendering; the website does not download this font.

Upstream copyright: © 2014–2021 Adobe (http://www.adobe.com/).
Noto is a trademark of Google Inc. The renamed derivative retains these
copyright and license notices inside the font, in addition to this document.

Official upstream release and original binary:

- https://github.com/notofonts/noto-cjk/releases/tag/Sans2.004
- https://github.com/notofonts/noto-cjk/blob/Sans2.004/Sans/SubsetOTF/SC/NotoSansSC-Regular.otf
- https://github.com/notofonts/noto-cjk/blob/Sans2.004/LICENSE

The upstream SC subset contains 30,890 Unicode mappings, not just the current
article titles. All glyph outlines and metrics are unchanged. Only font naming
records (IDs 1, 2, 3, 4, 6, 16, 17) and CFF family/full/PostScript names were
renamed to `Suiyi Social Sans` / `SuiyiSocialSans-Regular` with fontTools 4.61.1.
The unique family prevents a similarly named system font from being selected.
No fontTools installation or network download is needed for site builds.

The font stays in source assets. The static `/og/*.png` routes rasterize it with
the existing Sharp dependency during `npm run build`; no PNGs need committing.
