# Use the official PHP-Apache image
FROM php:8.2-apache

# Install PostgreSQL PDO extension
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo_pgsql

# Enable Apache rewrite (optional)
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html/

# Copy your backend code into the container
COPY . .

# Expose port 80
EXPOSE 80
