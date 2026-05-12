FROM python:3.11-slim as builder

WORKDIR /build
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.11-slim

RUN groupadd -r reco && useradd -r -g reco reco

WORKDIR /app

COPY --from=builder --chown=reco:reco /root/.local /home/reco/.local
COPY --chown=reco:reco app/ ./app/

RUN mkdir -p /app/data /app/models && chown -R reco:reco /app/data /app/models

ENV PATH=/home/reco/.local/bin:

USER reco

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
