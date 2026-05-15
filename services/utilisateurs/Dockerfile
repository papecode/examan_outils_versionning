FROM python:3.12-slim

WORKDIR /app

# ── Utilisateur non-root ───────────────────────────────────────
RUN useradd --create-home --uid 10001 appuser

# ── Dépendances ────────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Code source ────────────────────────────────────────────────
COPY . .
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# ── Healthcheck ────────────────────────────────────────────────
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" \
    || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]