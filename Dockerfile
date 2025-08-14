# Adım 1: Maven ile uygulamayı derlemek için bir build ortamı kullan
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Adım 2: Derlenmiş uygulamayı daha küçük bir Java runtime ortamında çalıştırmak
FROM openjdk:21-slim
WORKDIR /app
# Build ortamından sadece çalıştırılabilir jar dosyasını kopyala
COPY --from=build /app/target/*.jar app.jar
# Uygulama 8080 portunu kullanacak
EXPOSE 8080
# Uygulamayı çalıştır
ENTRYPOINT ["java","-jar","app.jar"]