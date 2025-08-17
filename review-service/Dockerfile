# Build stage
FROM maven:3-openjdk-17 as builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-alpine
WORKDIR /app
COPY --from=builder /app/target/review-service-1.0.0.jar app.jar
EXPOSE 5003
ENV JAVA_OPTS="-Xmx512m -Xms256m"
CMD ["java", "-jar", "app.jar"]
