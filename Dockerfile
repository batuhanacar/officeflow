# Adım 1: Maven ile uygulamayı derlemek için Java 21 içeren bir build ortamı kullan
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Adım 2: Derlenmiş uygulamayı daha küçük bir Java 21 runtime ortamında çalıştırmak
FROM openjdk:21-slim

# DEĞİŞİKLİK BURADA: Apache POI'nin ve Java AWT'nin ihtiyaç duyduğu tüm kütüphaneleri yüklüyoruz.
# fontconfig, Java'nın sistemdeki fontları bulmasını ve yönetmesini sağlar.
# libfreetype6, fontları render etmek için temel kütüphanedir.
RUN apt-get update && \
    apt-get install -y fontconfig libfreetype6 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]