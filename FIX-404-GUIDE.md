# Fix for 404 Error on Tracking URLs

This guide will help you fix the 404 errors when accessing tracking URLs like `catnetlogistics.com/tracking?id=REQ-9DYA7U` on your domain.

## Step 1: Upload the Updated Files

Upload the contents of the `dist` folder to your web server's root directory (typically `/var/www/html` or similar).

## Step 2: Update Nginx Configuration

1. Replace your current Nginx configuration with the updated `fixed-nginx.conf` file:

```bash
# SSH into your server
ssh user@your-server

# Back up your current configuration
sudo cp /etc/nginx/sites-available/catnetlogistics.com /etc/nginx/sites-available/catnetlogistics.com.backup

# Replace with the new configuration
sudo nano /etc/nginx/sites-available/catnetlogistics.com
```

2. Paste the contents of `fixed-nginx.conf` into the editor, then save and exit (Ctrl+X, then Y, then Enter).

3. Test and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Step 3: Ensure 404.html is in the Root Directory

Make sure that the `404.html` file is located in your web root directory:

```bash
ls -la /var/www/html/dist/404.html
```

If it's not there, upload it:

```bash
scp 404.html user@your-server:/var/www/html/dist/
```

## What's Been Fixed

The key changes in the new configuration:

1. Added a special location block for `/tracking` URLs
2. Set proper cache control headers to prevent caching issues
3. Ensured that the SPA routing works correctly
4. Properly configured the 404 error handling

## Additional Troubleshooting

If you're still experiencing issues:

1. Check your server logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

2. Make sure all file permissions are correct:
```bash
sudo chown -R www-data:www-data /var/www/html/dist
sudo chmod -R 755 /var/www/html/dist
```

3. Clear browser cache by pressing Ctrl+F5 or using incognito mode to test 