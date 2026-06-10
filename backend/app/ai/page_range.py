"""Parse user page/slide range strings like '12-14' or '1, 3-5'."""

from __future__ import annotations

import re


def parse_page_range(spec: str | None) -> set[int] | None:
    if not spec or not spec.strip():
        return None

    pages: set[int] = set()
    for part in re.split(r"[,;]", spec.strip()):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            bounds = part.split("-", 1)
            if len(bounds) != 2:
                continue
            try:
                start = int(bounds[0].strip())
                end = int(bounds[1].strip())
            except ValueError:
                continue
            if start > end:
                start, end = end, start
            pages.update(range(start, end + 1))
        else:
            try:
                pages.add(int(part))
            except ValueError:
                continue

    return pages if pages else None
