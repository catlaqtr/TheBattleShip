# ---------- Build stage ----------
FROM eclipse-temurin:17-jdk AS build
WORKDIR /workspace

# Pre-copy Maven wrapper and pom to leverage Docker layer cache
COPY mvnw mvnw
COPY .mvn .mvn
COPY pom.xml pom.xml

# Ensure wrapper is executable and warm up the dependency cache
RUN chmod +x mvnw \
    && ./mvnw -q -B -DskipTests dependency:go-offline

# Copy sources and build
COPY src src
RUN ./mvnw -q -B -DskipTests package

# ---------- Runtime stage ----------
FROM eclipse-temurin:17-jre
ENV TZ=UTC
WORKDIR /app

# Copy the built jar
COPY --from=build /workspace/target/*.jar /app/app.jar

# Spring respects PORT via application.properties (server.port=${PORT:8080})
EXPOSE 8080

# Sensible JVM defaults for containers
ENTRYPOINT ["java","-XX:MaxRAMPercentage=75.0","-Djava.security.egd=file:/dev/./urandom","-jar","/app/app.jar"]
