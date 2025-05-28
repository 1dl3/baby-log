FROM node:22-slim

# PostgreSQL-Client für pg_isready (DB-Wait im entrypoint.sh)
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Arbeitsverzeichnis
WORKDIR /app

# Nur was benötigt wird kopieren
COPY package.json yarn.lock ./
COPY drizzle.config.ts .
COPY svelte.config.js .
COPY entrypoint.sh .
COPY build ./build
COPY static ./static
#COPY drizzle ./drizzle
COPY src ./src


# Permissions sicherstellen
RUN chmod +x entrypoint.sh

# Dependencies installieren
RUN yarn install --frozen-lockfile

# Optional: falls du esbuild-register oder drizzle-kit CLI brauchst zur Laufzeit
# Hier ist es explizit installiert
RUN yarn add drizzle-kit esbuild esbuild-register

# Exponiere Port (für Traefik)
EXPOSE 3000

# Start-Kommando (via entrypoint.sh)
ENTRYPOINT ["/app/entrypoint.sh"]