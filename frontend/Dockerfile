FROM node:22-alpine AS development

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG VITE_API_USERS_URL=http://localhost:8000
ARG VITE_API_BOOKS_URL=http://localhost:8001
ARG VITE_API_LOANS_URL=http://localhost:8003
ARG VITE_API_RECO_URL=http://localhost:8004

ENV VITE_API_USERS_URL=$VITE_API_USERS_URL
ENV VITE_API_BOOKS_URL=$VITE_API_BOOKS_URL
ENV VITE_API_LOANS_URL=$VITE_API_LOANS_URL
ENV VITE_API_RECO_URL=$VITE_API_RECO_URL

RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
