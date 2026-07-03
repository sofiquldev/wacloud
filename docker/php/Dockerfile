FROM php:8.2.30-fpm-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libsqlite3-dev \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && docker-php-ext-configure zip \
    && docker-php-ext-install -j$(nproc) pdo_mysql pdo_sqlite zip opcache ftp \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY docker/php/docker-entrypoint.sh /usr/local/bin/wacloud-docker-entrypoint
RUN chmod +x /usr/local/bin/wacloud-docker-entrypoint

WORKDIR /var/www/html

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

ENTRYPOINT ["/usr/local/bin/wacloud-docker-entrypoint"]
CMD ["php-fpm"]
