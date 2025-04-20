
# Etapa 1: Construcción
FROM node:20-alpine AS builder

# Instala pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiamos solo los archivos necesarios para instalar dependencias
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

COPY . .

RUN pnpm install --frozen-lockfile

# Compilamos la app
RUN pnpm build

# Etapa 2: Producción
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar solo los archivos necesarios para ejecución
COPY package.json ./
COPY pnpm-lock.yaml ./

# Solo instalamos dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# Copiamos los artefactos compilados desde la etapa anterior
COPY --from=builder /app/dist ./dist

ARG PORT=3000

# Expón el puerto (ajusta según tu main.ts)
EXPOSE ${PORT:-3000}

# Comando por defecto
CMD ["pnpm", "start:prod"]

