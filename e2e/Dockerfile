FROM mcr.microsoft.com/playwright:v1.64.1-noble@sha256:47b510dd9230bf0b9bfc9b20102241e577ea7a99334ab4c3ca19f19770e9b8ea

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund && chmod 1777 /app
COPY playwright.config.ts vite.config.ts ./

ENTRYPOINT ["npx", "playwright", "test"]
