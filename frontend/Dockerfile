# Adım 1: Node.js ile React uygulamasını build etmek
FROM node:18-alpine AS build
WORKDIR /app

# VITE_API_BASE_URL'yi bir build argümanı olarak tanımla
ARG VITE_API_BASE_URL

# Build argümanını ortam değişkenine dönüştür, böylece npm run build bunu görebilir
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm install
COPY . .

# npm run build komutu artık VITE_API_BASE_URL ortam değişkenini kullanacaktır
RUN npm run build

# Adım 2: Build edilen statik dosyaları Nginx sunucusuna kopyalamak
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]