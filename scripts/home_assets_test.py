import re
import tempfile
import unittest
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image

import optimize_home_assets as assets

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "public/fonts"


def unicode_points(css):
    points = set()
    for declaration in re.findall(r"unicode-range:\s*([^;]+);", css):
        for value in declaration.split(","):
            bounds = value.strip()[2:].split("-")
            points.update(range(int(bounds[0], 16), int(bounds[-1], 16) + 1))
    return points


class AssetGenerationTests(unittest.TestCase):
    def test_updated_home_sources_are_included_without_bundling_documents(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for file, character in zip(assets.HOME_SOURCES, "首页导航"):
                target = root / file
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(character, encoding="utf-8")
            before = assets.home_characters(assets.home_text(root))
            document = root / "src/content/docs/new-section/nested/new-guide.md"
            document.parent.mkdir(parents=True)
            document.write_text("---\ntitle: 麒麟\nicon: science\n---\n翱翔", encoding="utf-8")
            self.assertEqual(before, assets.home_characters(assets.home_text(root)))
            self.assertTrue(set("首页导航") <= set(before))
            header = root / assets.HOME_SOURCES[1]
            header.write_text("新增麒麟", encoding="utf-8")
            self.assertTrue(set("新增麒麟") <= set(assets.home_characters(assets.home_text(root))))

    def test_mdi_icons_are_discovered_in_nested_documents_and_components(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            devices = root / "src/app/devices.ts"
            devices.parent.mkdir(parents=True)
            devices.write_text('const devices = [{ icon: "mdi-windows" }];', encoding="utf-8")
            component = root / "src/app/copy.ts"
            component.write_text(
                '<span class="mdi mdi-set mdi-content-copy"></span>', encoding="utf-8"
            )
            test = root / "src/app/copy.spec.ts"
            test.write_text('const invalidIcon = "mdi-nonexistent";', encoding="utf-8")
            document = root / "src/content/docs/new-section/nested/new-guide.md"
            document.parent.mkdir(parents=True)
            document.write_text(
                '<span class="mdi mdi-book-open-variant"></span>'
                '<span class="mdi mdi-numeric-1-box"></span>',
                encoding="utf-8",
            )
            self.assertEqual(
                assets.mdi_names(root),
                {"windows", "content-copy", "book-open-variant", "numeric-1-box"},
            )

    def test_fallback_ranges_exclude_home_characters_without_losing_neighbors(self):
        css = "unicode-range: U+40-46, U+100;"
        result = assets.exclude_characters(css, "@BCF")
        self.assertEqual(unicode_points(result), {0x41, 0x44, 0x45, 0x100})

    def test_generated_fonts_cover_home_and_new_document_characters(self):
        characters = assets.home_characters(assets.home_text(ROOT))
        with TTFont(FONTS / "noto-sans-sc-home.woff2") as font:
            home_points = set(font.getBestCmap())
        self.assertTrue({ord(character) for character in characters} <= home_points)
        fallback = (FONTS / "noto-sans-sc-fallback.css").read_text(encoding="utf-8")
        fallback_points = unicode_points(fallback)
        self.assertFalse({ord(character) for character in characters} & fallback_points)
        new_points = {ord(character) for character in "翱翔麒麟"} - home_points
        self.assertTrue(new_points)
        self.assertTrue(new_points <= fallback_points)
        self.assertEqual(
            set(re.findall(r"font-weight:\s*(\d+)", fallback)),
            {"400", "500", "600", "700", "800"},
        )

    def test_new_home_icon_preserves_shape_and_full_document_icon_font(self):
        full_path = FONTS / "material-icons.woff2"
        original = full_path.read_bytes()
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "material-icons-home.woff2"
            home = '<mat-icon>science</mat-icon> const devices = [{ icon: "mdi-android" }];'
            assets.build_home_icons(home, original, target)
            with TTFont(target) as optimized, TTFont(full_path) as full:
                ligatures = assets.material_ligatures(optimized)
                self.assertTrue({"science", "check"} <= ligatures.keys())
                glyph = assets.material_ligatures(full)["science"]
                codepoint = next(
                    point for point, name in full.getBestCmap().items() if name == glyph
                )
                self.assertEqual(
                    assets.glyph_shape(optimized, codepoint), assets.glyph_shape(full, codepoint)
                )
                self.assertIn("rocket_launch", assets.material_ligatures(full))
        self.assertEqual(full_path.read_bytes(), original)

    def test_unknown_home_icons_fail_generation(self):
        original = (FONTS / "material-icons.woff2").read_bytes()
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "material-icons-home.woff2"
            with self.assertRaisesRegex(ValueError, "Unknown Material icons"):
                assets.build_home_icons(
                    "<mat-icon>nonexistent_home_icon</mat-icon>", original, target
                )
            self.assertFalse(target.exists())

    def test_images_refresh_from_original_without_modifying_png_fallback(self):
        with tempfile.TemporaryDirectory() as directory:
            public = Path(directory) / "public"
            public.mkdir()
            source = public / "kazumi-expressive.png"
            previous = None
            for color in ("red", "blue"):
                Image.new("RGBA", (1254, 1254), color).save(source)
                original = source.read_bytes()
                assets.build_images(public)
                self.assertEqual(source.read_bytes(), original)
                for size in (480, 768, 1024, 1254):
                    with Image.open(public / f"kazumi-expressive-{size}.webp") as generated:
                        self.assertEqual(generated.size, (size, size))
                with Image.open(public / "favicon-48.png") as favicon:
                    self.assertEqual(favicon.size, (48, 48))
                current = (public / "kazumi-expressive-480.webp").read_bytes()
                self.assertNotEqual(current, previous)
                previous = current


if __name__ == "__main__":
    unittest.main()
