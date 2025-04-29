# Deployment Guide for Express Med Dispatch

This guide provides instructions for deploying the Express Med Dispatch application on a server with Nginx.

## Prerequisites

- A server with Ubuntu/Debian or similar Linux distribution
- Nginx installed
- Domain name (optional)

## Step 1: Prepare the Server

```bash
# Update the system
sudo apt update
sudo apt upgrade -y

# Install Nginx if not already installed
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 2: Deploy the Application

1. Extract the `catalyst-network-logistics.zip` file on your server:

```bash
# Create a directory for the application
sudo mkdir -p /var/www/catalyst-network-logistics

# Upload the zip file to this location using SFTP or similar

# Extract the zip file
sudo unzip catalyst-network-logistics.zip -d /var/www/catalyst-network-logistics

# Set proper permissions
sudo chown -R www-data:www-data /var/www/catalyst-network-logistics
```

## Step 3: Configure Nginx

Create a Nginx configuration file for the application:

```bash
sudo nano /etc/nginx/sites-available/catalyst-network-logistics
```

Copy the following configuration, replacing `your-domain.com` with your actual domain:

```nginx
server {
    listen 80;
    server_name your-domain.com; # Replace with your actual domain or use your server IP

    # Document root where your files are located
    root /var/www/catalyst-network-logistics;
    index index.html;

    # Compression settings
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Handle SPA routing - redirect all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/catalyst-network-logistics /etc/nginx/sites-enabled/
sudo nginx -t  # Test the configuration
sudo systemctl reload nginx  # Apply the configuration
```

## Step 4: Set Up SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Certbot will modify your Nginx configuration automatically
# Test the configuration again
sudo nginx -t
```

## Step 5: Testing the Deployment

1. Open your domain or server IP in a browser
2. Test functionality including:
   - Login
   - Viewing and managing delivery requests
   - Tracking deliveries
   - Driver assignment

## Troubleshooting

### 404 Not Found When Accessing Routes Directly

If you see 404 errors when trying to access routes directly (like `/tracking`) or when refreshing on a page, ensure your Nginx configuration includes the `try_files $uri $uri/ /index.html;` directive in the location block.

### API Connection Issues

If the application can't connect to the backend API:
1. Check that the API URL in your environment variables is correct
2. Ensure there are no CORS restrictions
3. Verify the API is running and accessible from the server

### Permission Issues

If you encounter permission issues:
```bash
sudo chown -R www-data:www-data /var/www/catalyst-network-logistics
sudo chmod -R 755 /var/www/catalyst-network-logistics
``` 