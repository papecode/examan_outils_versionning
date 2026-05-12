import httpx
from typing import List, Dict, Optional
import asyncio
import logging

logger = logging.getLogger(__name__)

class BooksServiceClient:
    def __init__(self):
        self.base_url = "http://livres:8001"
        self.timeout = httpx.Timeout(5.0)
    
    async def get_book_by_id(self, book_id: int) -> Optional[Dict]:
        for attempt in range(3):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.get(f"{self.base_url}/api/books/{book_id}")
                    if response.status_code == 200:
                        return response.json()
                    elif response.status_code == 404:
                        return None
            except Exception as e:
                logger.warning(f"Attempt {attempt+1}: {e}")
                await asyncio.sleep(0.5)
        
        return None
    
    async def get_books_batch(self, book_ids: List[int]) -> List[Dict]:
        books = []
        for book_id in book_ids:
            book = await self.get_book_by_id(book_id)
            if book:
                books.append(book)
        return books
