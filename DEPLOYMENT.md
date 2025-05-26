# Deployment Guide for Catalyst Network Logistics Website

This guide covers how to deploy the Catalyst Network Logistics website to various server environments.

## Build the Application

First, build the application:

```bash
npm run build
```

This will create a `dist` directory with all the necessary files.

## Deployment Options

### Option 1: Nginx (Recommended)

#### 1. Prepare the Server

Install Nginx if not already installed:

```bash
sudo apt update
sudo apt install nginx
```

#### 2. Copy Files to Server

Copy the `dist` directory and `nginx.conf` to your server:

```bash
# Using SCP
scp -r dist/ nginx.conf user@your-server:/tmp/

# On the server
sudo mkdir -p /var/www/html/dist
sudo cp -r /tmp/dist/* /var/www/html/dist/
sudo cp /tmp/nginx.conf /etc/nginx/sites-available/catnetlogistics.com
```

#### 3. Configure Nginx

Set up the Nginx configuration:

```bash
# Create a symlink to enable the site
sudo ln -s /etc/nginx/sites-available/catnetlogistics.com /etc/nginx/sites-enabled/

# Remove the default site if necessary
sudo rm /etc/nginx/sites-enabled/default

# Test the configuration
sudo nginx -t

# If the test passes, reload Nginx
sudo systemctl reload nginx
```

**IMPORTANT:** Make sure the `dist` folder is in the correct location as specified in the nginx.conf file. The default is `/var/www/html/dist`.

#### 4. Set Proper Permissions

```bash
sudo chown -R www-data:www-data /var/www/html/dist
sudo chmod -R 755 /var/www/html/dist
```

### Option 2: Apache Server

#### 1. Prepare the Server

If you're using Apache, ensure that mod_rewrite is enabled:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

#### 2. Copy Files to Server

Copy the `dist` directory and `.htaccess` file to your server:

```bash
# Using SCP
scp -r dist/ .htaccess user@your-server:/tmp/

# On the server
sudo mkdir -p /var/www/html/
sudo cp -r /tmp/dist/* /var/www/html/
sudo cp /tmp/.htaccess /var/www/html/
```

#### 3. Configure Apache

Make sure your Apache configuration allows .htaccess files:

```apache
<Directory /var/www/html>
    AllowOverride All
    Require all granted
</Directory>
```

#### 4. Set Proper Permissions

```bash
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

### Option 3: Shared Hosting

For shared hosting environments:

1. Upload the contents of the `dist` directory to your web root
2. Upload the `.htaccess` file to your web root
3. Upload the `404.html` file to your web root

## Troubleshooting

### 404 Errors on Direct URL Access

If you're experiencing 404 errors when directly accessing URLs like `/tracking?id=MED-123`:

1. **Verify the server configuration**:
   - For Nginx: Make sure the `try_files $uri $uri/ /index.html;` directive is correctly set
   - For Apache: Ensure the `.htaccess` file is properly uploaded and mod_rewrite is enabled

2. **Check file permissions**:
   ```bash
   sudo ls -la /var/www/html/dist
   ```

3. **Check server logs**:
   ```bash
   sudo tail -n 50 /var/log/nginx/error.log
   # or for Apache
   sudo tail -n 50 /var/log/apache2/error.log
   ```

4. **Test with curl**:
   ```bash
   curl -I https://catnetlogistics.com/tracking?id=MED-123
   ```
   
5. **Check folder structure**:
   The server configuration needs to match where your files are actually located. If you see 404 errors, verify that:
   
   - For Nginx: Ensure the `root` directive points to the correct folder
   - For Apache: Make sure you've placed the files in the actual web root

## SSL Configuration

To enable HTTPS with Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d catnetlogistics.com -d www.catnetlogistics.com
```

Follow the prompts to complete the SSL setup.

## Important Files

- `nginx.conf`: Nginx server configuration
- `.htaccess`: Apache rewrite rules
- `404.html`: Fallback for handling direct URL access
- `index.html`: Entry point with client-side routing handling

## Managing Updates

For future updates:

1. Build the new version locally
2. Copy only the updated files to maintain any server-specific configurations
3. If there are significant structural changes, consider a full redeployment 