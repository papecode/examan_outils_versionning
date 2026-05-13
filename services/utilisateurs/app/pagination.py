def normalize_page(page: int | None) -> int:
    if page is None or page < 1:
        return 1
    return page


def normalize_page_size(page_size: int | None, default: int = 6) -> int:
    if page_size is None or page_size < 1:
        return default
    return page_size
