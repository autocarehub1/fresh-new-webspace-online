# Quick Fix for 404 Errors with React Router

Follow these simple steps to fix 404 errors when accessing URLs like `/tracking?id=MED-8LJ92C`:

## Option 1: Nginx Server (Recommended)

1. **SSH into your server**

2. **Find out where your site is actually served from**:
   ```bash
   grep "root" /etc/nginx/sites-enabled/*
   ```
   This will show you the path like `/var/www/html` or similar.

3. **Upload the website files**:
   ```bash
   # Replace user@server with your actual SSH details
   # Replace /var/www/html with the path you found above
   scp -r dist/* user@server:/var/www/html/
   ```

4. **Create a simple Nginx configuration**:
   ```bash
   sudo nano /etc/nginx/sites-available/catnetlogistics.com
   ```
   
   Paste the content from `simple-nginx.conf` file, making sure to change the `root` path to match the one you found in step 2.

5. **Enable the site and reload Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/catnetlogistics.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Option 2: Apache Server

1. **SSH into your server**

2. **Upload the website files and .htaccess**:
   ```bash
   scp -r dist/* user@server:/var/www/html/
   scp .htaccess user@server:/var/www/html/
   ```

3. **Ensure mod_rewrite is enabled**:
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

## Option 3: Direct Fix on Server

If you're not sure what server you're using, run these commands:

```bash
# 1. Log into your server
ssh user@server

# 2. Create a simple test file in your web root to verify
cat > /var/www/html/spa-fix.html << EOL
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;URL='/'">
</head>
<body>
  <p>Redirecting to home page...</p>
</body>
</html>
EOL

# 3. Create a symbolic link that redirects all routes to index.html
cd /var/www/html
ln -s index.html tracking
```

## Testing

After deploying, test by accessing:
https://catnetlogistics.com/tracking?id=MED-8LJ92C

## Troubleshooting

If you're still having issues:

1. **Check server logs**:
   ```bash
   sudo tail -n 50 /var/log/nginx/error.log
   # or
   sudo tail -n 50 /var/log/apache2/error.log
   ```

2. **Verify your server configuration**:
   ```bash
   # For Nginx
   sudo nginx -t
   
   # For Apache
   sudo apachectl -t
   ```

3. **Contact your hosting provider** to ask specifically about:
   - How to configure SPA routing
   - Where your web root is located
   - What server software they're using (Nginx, Apache, etc.) 