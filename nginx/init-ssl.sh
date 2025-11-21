#!/bin/sh

# Create SSL certificate if it doesn't exist
if [ ! -f /etc/letsencrypt/live/your-domain.com/fullchain.pem ]; then
    echo "Generating SSL certificate..."
    certbot certonly --standalone --agree-tos --noninteractive \
        --email your-email@domain.com \
        -d your-domain.com -d www.your-domain.com
else
    echo "SSL certificate already exists"
fi

# Start nginx
nginx -g 'daemon off;'