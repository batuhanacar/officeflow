# Adım 1: Node.js ile React uygulamasını build etmek
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Build komutu, production için optimize edilmiş statik dosyaları /app/dist klasörüne oluşturur
RUN npm run build

# Adım 2: Build edilen statik dosyaları Nginx sunucusuna kopyalamak
FROM nginx:stable-alpine
# Build ortamından sadece production dosyalarını kopyala
COPY --from=build /app/dist /usr/share/nginx/html
# Web sunucusu yapılandırmasını kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Nginx 80 portunu kullanacak
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]