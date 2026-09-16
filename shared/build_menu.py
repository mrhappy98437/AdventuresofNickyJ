from pathlib import Path
import os
import sys

site = Path(__file__).resolve().parent.parent
menu_file = site / "shared" / "menu.html"
marker = '<div id="shared-menu"></div>'

targets = [
    site / "index.html",
    site / "pages" / "mailbase.html",
    site / "pages" / "privacy.html",
]

menu = menu_file.read_text(encoding="utf-8")

for target in targets:
    if not target.exists():
        print(f"STOP: missing target: {target}")
        sys.exit(1)

    text = target.read_text(encoding="utf-8")

    home = site / "index.html"
    mailbase = site / "pages" / "mailbase.html"
    privacy = site / "pages" / "privacy.html"

    rendered = (
        menu
        .replace("__HOME__", Path(os.path.relpath(home, target.parent)).as_posix())
        .replace("__MAILBASE__", Path(os.path.relpath(mailbase, target.parent)).as_posix())
        .replace("__PRIVACY__", Path(os.path.relpath(privacy, target.parent)).as_posix())
    )

    if text.count(marker) > 1:
        print(f"STOP: multiple menu placeholders in {target}")
        sys.exit(1)

    if marker in text:
        updated = text.replace(marker, rendered, 1)
    else:
        start = text.find('<div class="menubar" id="menubar">')

        if start == -1:
            print(f"STOP: existing menu not found in {target}")
            sys.exit(1)

        if target == site / "index.html":
            end = text.find('<!-- ══ MAILBASE DESKTOP WINDOW', start)
        else:
            end = text.find('<section class="mailbase-hero"', start)
            if end == -1:
                end = text.find('<section class="content-card"', start)

        if end == -1:
            print(f"STOP: page content boundary not found in {target}")
            sys.exit(1)

        line_start = text.rfind("\n", 0, start) + 1
        updated = text[:line_start] + rendered + "\n\n      " + text[end:]

    target.write_text(updated, encoding="utf-8")
    print(f"Updated: {target}")
