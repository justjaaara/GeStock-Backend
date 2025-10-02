# ---------- STAGE 1: Build ----------
FROM node:20-alpine AS builder

# Instalar pnpm
RUN npm install -g pnpm

# Directorio de trabajo
WORKDIR /app

# Copiar config de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar TODAS las dependencias (dev + prod)
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Compilar NestJS a JS
RUN pnpm run build


# ---------- STAGE 2: Production ----------
FROM node:20-alpine AS production

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar solo package.json y lockfile
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --prod --frozen-lockfile

# Copiar el build ya compilado desde el stage anterior
COPY --from=builder /app/dist ./dist

# Puerto expuesto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production

# Comando final
CMD ["node", "dist/main"]
