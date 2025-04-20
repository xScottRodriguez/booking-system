# ----------------------
# Etapa 1: Builder
# ----------------------
FROM node:20-alpine AS builder

# Habilitamos corepack y preparamos pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Directorio de trabajo
WORKDIR /app

# Copiamos solo archivos necesarios para instalación
COPY package.json pnpm-lock.yaml ./
COPY tsconfig*.json nest-cli.json ./
COPY prisma ./prisma
COPY src ./src

# Instalamos TODAS las dependencias (prod + dev)
RUN pnpm install --frozen-lockfile

# Generamos cliente Prisma y compilamos el proyecto
RUN pnpm prisma:generate && pnpm build

# ----------------------
# Etapa 2: Producción
# ----------------------
FROM node:20-alpine AS production

WORKDIR /app
RUN npm i -g prisma
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY --from=builder /app/dist ./dist

# Eliminar scripts como husky para evitar errores
RUN node -e "const fs=require('fs'); const pkg=JSON.parse(fs.readFileSync('package.json')); delete pkg.scripts.prepare; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));"

RUN corepack enable && corepack prepare pnpm@latest --activate \
  && pnpm install --prod --frozen-lockfile --ignore-scripts

# 🔥 Generá el client donde se necesita
RUN pnpm prisma:generate

ARG PORT=${PORT:-3000}

EXPOSE ${PORT}
CMD ["node", "dist/src/main"]


