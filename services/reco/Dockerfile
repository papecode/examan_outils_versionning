FROM python:3.12-slim AS builder

WORKDIR /app
COPY README.md ./

FROM python:3.12-slim

WORKDIR /app

RUN useradd --create-home --uid 10001 appuser
USER appuser

COPY --from=builder /app/README.md ./

EXPOSE 8000

CMD ["python", "-c", "print('Service reco: implementation backend a fournir')"]
