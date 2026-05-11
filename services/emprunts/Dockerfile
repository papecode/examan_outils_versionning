FROM python:3.12-slim

WORKDIR /app

RUN useradd --create-home --uid 10001 appuser
USER appuser

COPY README.md ./

EXPOSE 8000

CMD ["python", "-c", "print('Service emprunts: implementation backend a fournir')"]
