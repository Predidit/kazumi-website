import io
import re
import textwrap
import urllib.parse
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.pens.recordingPen import RecordingPen
from fontTools.ttLib import TTFont
from PIL import Image

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
)
WEIGHTS = (400, 500, 600, 700, 800)
WEIGHT_QUERY = ";".join(map(str, WEIGHTS))
HOME_SOURCES = (
    "src/app/features/home/hero.ts",
    "src/app/features/layout/header.ts",
    "src/app/features/layout/footer.ts",
    "src/app/app.ts",
)
TEXT_CSS_URL = (
    f"https://fonts.googleapis.com/css2?family=Manrope:wght@{WEIGHT_QUERY}"
    f"&family=Noto+Sans+SC:wght@{WEIGHT_QUERY}&display=swap"
)
MDI_URL = "https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/"


def home_text(root):
    return "".join((root / file).read_text(encoding="utf-8") for file in HOME_SOURCES)


def home_characters(home):
    ascii_characters = "".join(chr(point) for point in range(32, 127))
    return ascii_characters + "".join(sorted(set(re.findall(r"[^\x00-\x7f]", home))))


def mdi_names(root):
    names = set()
    sources = sorted(
        file for file in (root / "src/app").rglob("*.ts")
        if not file.name.endswith(".spec.ts")
    )
    sources += sorted((root / "src/content/docs").rglob("*.md"))
    for file in sources:
        names.update(re.findall(
            r"mdi-([a-z0-9]+(?:-[a-z0-9]+)*)", file.read_text(encoding="utf-8")
        ))
    names.discard("set")
    return names


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def save_font(fonts, name, url):
    (fonts / name).write_bytes(fetch(url))
    return f"/fonts/{name}"


def glyph_shape(font, codepoint):
    name = font.getBestCmap()[codepoint]
    pen = RecordingPen()
    font.getGlyphSet()[name].draw(pen)
    return pen.value, font["hmtx"][name]


def exclude_characters(face, characters):
    excluded = sorted({ord(char) for char in characters})

    def replace(match):
        ranges = []
        for value in match[1].split(","):
            bounds = value.strip()[2:].split("-")
            start, end = int(bounds[0], 16), int(bounds[-1], 16)
            for point in excluded:
                if start <= point <= end:
                    if start < point:
                        ranges.append((start, point - 1))
                    start = point + 1
            if start <= end:
                ranges.append((start, end))
        return "unicode-range: " + ", ".join(
            f"U+{start:X}" if start == end else f"U+{start:X}-{end:X}"
            for start, end in ranges
        ) + ";"

    return re.sub(r"unicode-range:\s*([^;]+);", replace, face)


def weight_rules(rule):
    # Discrete weights preserve existing CSS weight matching, including 650.
    weights = ", ".join(map(str, WEIGHTS))
    return f"@each $weight in {weights} {{\n" + textwrap.indent(rule, "  ") + "\n}\n"


def material_ligatures(font):
    letters = {glyph: chr(point) for point, glyph in font.getBestCmap().items() if point < 128}
    result = {}
    for lookup in font["GSUB"].table.LookupList.Lookup:
        for table in lookup.SubTable:
            for first, ligatures in getattr(table, "ligatures", {}).items():
                for ligature in ligatures:
                    name = "".join(letters.get(glyph, "") for glyph in [first, *ligature.Component])
                    result[name] = ligature.LigGlyph
    return result


def build_home_icons(home, font_bytes, target):
    names = set(re.findall(r"<mat-icon\b[^>]*>\s*([a-z_]+)\s*</mat-icon>", home))
    names.update(re.findall(r'icon:\s*"([a-z_]+)"', home))
    names.add("check")  # The theme menu renders this icon through interpolation.
    with TTFont(io.BytesIO(font_bytes), recalcBBoxes=False, recalcTimestamp=False) as font:
        ligatures = material_ligatures(font)
        unknown = names - ligatures.keys()
        if unknown:
            raise ValueError(f"Unknown Material icons: {sorted(unknown)}")
        options = subset.Options()
        options.layout_closure = False
        subsetter = subset.Subsetter(options)
        subsetter.populate(
            text=" ".join(sorted(names)),
            glyphs=[ligatures[name] for name in sorted(names)],
        )
        subsetter.subset(font)
        font.flavor = "woff2"
        font.save(target)


def build_images(public):
    with Image.open(public / "kazumi-expressive.png") as original:
        for size in (480, 768, 1024, 1254):
            original.resize((size, size), Image.Resampling.LANCZOS).save(
                public / f"kazumi-expressive-{size}.webp",
                quality=88,
                method=6,
            )
        original.resize((48, 48), Image.Resampling.LANCZOS).save(
            public / "favicon-48.png", optimize=True
        )


def build_text_fonts(fonts, characters):
    css = fetch(TEXT_CSS_URL).decode()
    faces = re.findall(r"(?:/\* (.*?) \*/\s*)?(@font-face\s*\{.*?\})", css, re.S)
    rules = []
    fallback_rules = []
    for label, face in faces:
        if "font-weight: 400;" not in face:
            continue
        url = re.search(r"url\((.*?)\)", face)[1]
        if "'Manrope'" in face:
            face = face.replace(url, save_font(fonts, f"manrope-{label}.woff2", url))
            rules.append(face.replace("font-weight: 400;", "font-weight: $weight;"))
        else:
            face = exclude_characters(face, characters)
            fallback_rules.extend(
                face.replace("font-weight: 400;", f"font-weight: {weight};")
                for weight in WEIGHTS
            )
    home_css = fetch(
        f"https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@{WEIGHT_QUERY}"
        f"&display=swap&text={urllib.parse.quote(characters)}"
    ).decode()
    home_face = re.search(r"@font-face\s*\{.*?\}", home_css, re.S)[0]
    home_url = re.search(r"url\((.*?)\)", home_face)[1]
    home_face = home_face.replace(
        home_url, save_font(fonts, "noto-sans-sc-home.woff2", home_url)
    ).replace("font-weight: 400;", "font-weight: $weight;")
    home_face = home_face.replace("'Noto Sans SC'", "'Noto Sans SC Home'")
    if "unicode-range:" not in home_face:
        ranges = ", ".join(f"U+{ord(char):04X}" for char in characters)
        home_face = home_face.replace("}", f"  unicode-range: {ranges};\n}}")
    if len(fallback_rules) < 500:
        raise ValueError("The upstream font response is missing character ranges")
    rules.append(home_face)
    (fonts / "noto-sans-sc-fallback.css").write_text("\n".join(fallback_rules), encoding="utf-8")
    return "\n".join(weight_rules(rule) for rule in rules)


def build_material_icons(fonts, home):
    icons = fetch(
        "https://fonts.googleapis.com/icon?family=Material+Icons&display=block"
    ).decode()
    icons = re.sub(r"/\*.*?\*/", "", icons, flags=re.S).strip()
    icon_url = re.search(r"url\((.*?)\)", icons)[1]
    font_bytes = fetch(icon_url)
    (fonts / "material-icons.woff2").write_bytes(font_bytes)
    output = icons.replace(icon_url, "/fonts/material-icons.woff2")
    build_home_icons(home, font_bytes, fonts / "material-icons-home.woff2")
    output += (
        '\n@font-face { font-family: "Material Icons Home"; '
        'src: url("/fonts/material-icons-home.woff2") format("woff2"); '
        'font-weight: normal; font-style: normal; font-display: block; }\n'
        'app-header .mat-icon, app-hero .mat-icon, app-footer .mat-icon, '
        '.theme-menu .mat-icon { font-family: "Material Icons Home"; }\n'
    )
    return output


def build_mdi_icons(fonts, names):
    mdi_css = fetch(MDI_URL + "css/materialdesignicons.min.css").decode()
    mdi_rules = []
    codepoints = []
    for name in sorted(names):
        rule = re.search(
            r"\.mdi-" + re.escape(name) + r"::before\{content:\"\\([A-F0-9]+)\"\}", mdi_css
        )
        if rule is None:
            raise ValueError(f"Unknown MDI icon: {name}")
        mdi_rules.append(rule[0])
        codepoints.append(int(rule[1], 16))
    # Recalculating upstream bounds can shift MDI glyphs even without outline changes.
    with TTFont(
        io.BytesIO(fetch(MDI_URL + "fonts/materialdesignicons-webfont.woff2")),
        recalcBBoxes=False,
        recalcTimestamp=False,
    ) as font:
        shapes = {codepoint: glyph_shape(font, codepoint) for codepoint in codepoints}
        subsetter = subset.Subsetter()
        subsetter.populate(unicodes=codepoints)
        subsetter.subset(font)
        font.flavor = "woff2"
        font.save(fonts / "mdi-subset.woff2")
    with TTFont(fonts / "mdi-subset.woff2") as optimized:
        if any(glyph_shape(optimized, point) != shape for point, shape in shapes.items()):
            raise ValueError("Icon subsetting changed glyph shapes or spacing")
    output = (
        '\n@font-face { font-family: "Material Design Icons"; '
        'src: url("/fonts/mdi-subset.woff2") format("woff2"); '
        'font-weight: normal; font-style: normal; font-display: block; }\n'
    )
    output += re.search(r"\.mdi:before,\.mdi-set\{[^}]+\}", mdi_css)[0] + "\n"
    output += "\n".join(mdi_rules) + "\n"
    return output


def build_fonts(root):
    fonts = root / "public/fonts"
    fonts.mkdir(parents=True, exist_ok=True)
    home = home_text(root)
    output = build_text_fonts(fonts, home_characters(home))
    output += build_material_icons(fonts, home)
    output += build_mdi_icons(fonts, mdi_names(root))
    (root / "src/_fonts.scss").write_text(output, encoding="utf-8")


if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    build_images(root / "public")
    build_fonts(root)
