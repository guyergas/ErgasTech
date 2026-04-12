# ErgasTech - Premium Landing Page

A modern, high-end landing page for ErgasTech technology consulting brand.

## Tech Stack

- **Framework:** Next.js 15 with React 19
- **Styling:** Tailwind CSS
- **Deployment:** Docker + Docker Compose + Systemd
- **Routing:** Nginx with SSL support

## Project Structure

```
/root/ergastech/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout with metadata
│   │   ├── page.tsx        # Main landing page
│   │   └── globals.css     # Global styles and animations
│   └── components/         # React components
│       ├── Navbar.tsx
│       ├── Hero.tsx
│       ├── Problem.tsx
│       ├── Solution.tsx
│       ├── Services.tsx
│       ├── HowItWorks.tsx
│       ├── WhyChooseUs.tsx
│       ├── FinalCTA.tsx
│       └── Footer.tsx
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Docker compose configuration
├── Makefile              # Build and deployment commands
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## Design Features

- **Dark Theme:** Black/deep navy background with electric blue/cyan accents
- **Premium Aesthetic:** Minimal, clean, high-end consulting firm design
- **Responsive Design:** Fully responsive for mobile, tablet, and desktop
- **Abstract Visuals:** Custom SVG graphics (geometric shapes, flow diagrams, systems)
- **Smooth Animations:** Subtle hover effects, fade-ins, glow effects
- **No Stock Photos:** Original abstract visual elements only

## Available Commands

### Development

```bash
# Start the development service (runs via systemd)
make dev

# View logs
make logs

# Check status
make status

# Stop all services
make stop

# View help
make help
```

### Manual Docker Commands

```bash
# Build the Docker image
docker compose build

# Start the container
docker compose up

# Stop the container
docker compose down

# View logs
docker compose logs -f
```

## Deployment

### Systemd Service

The application runs as a systemd service: `ergastech-dev`

```bash
# Start the service
sudo systemctl start ergastech-dev

# Stop the service
sudo systemctl stop ergastech-dev

# Restart the service
sudo systemctl restart ergastech-dev

# View status
sudo systemctl status ergastech-dev

# View logs
sudo systemctl logs -u ergastech-dev

# Enable auto-start on boot
sudo systemctl enable ergastech-dev

# Disable auto-start on boot
sudo systemctl disable ergastech-dev
```

### Nginx Configuration

Nginx is configured to route traffic to ErgasTech:

- **Domain:** `ergastech.duckdns.org` (configure with DuckDNS)
- **Port:** 443 (HTTPS)
- **Local Port:** 3002
- **Config Location:** `/etc/nginx/sites-available/default`

To update the domain, edit the nginx config:

```bash
sudo nano /etc/nginx/sites-available/default
# Find the line: server_name ergastech.duckdns.org;
# Change it to your actual domain
# Then reload nginx: sudo systemctl reload nginx
```

## SSL Certificates

The site uses SSL certificates from Let's Encrypt. Currently configured to use the same certificates as TarbutRM.

To update with your own domain:

```bash
# Request a new certificate
sudo certbot certonly --nginx -d ergastech.yourdomain.com

# Update the nginx config with the new certificate paths
sudo nano /etc/nginx/sites-available/default

# Reload nginx
sudo systemctl reload nginx
```

## Port Configuration

- **Docker Container:** Port 3000 (internal)
- **Docker Host Binding:** Port 3002
- **Nginx Reverse Proxy:** Localhost:3002
- **External Access:** Via nginx on port 80/443

## DuckDNS Setup

To make the site accessible from outside the server:

1. Go to https://www.duckdns.org/
2. Create an account and add a subdomain (e.g., `ergastech`)
3. Update your router or the DuckDNS app to point to your server's IP
4. Update the nginx config with your DuckDNS domain
5. Optionally, get an SSL certificate for your domain using Let's Encrypt

## Next Steps

### Logo Integration

A custom logo is available. To integrate it:

1. Download the logo from: https://drive.google.com/file/d/1KDJvRqPNzVSZpiC7omEulHYrWGW6cR-5/view?usp=drivesdk
2. Place it in `/root/ergastech/public/logo.svg`
3. Update the Navbar component to use the image instead of the text logo

### Custom Contact Links

Update the contact information in:

- `src/components/FinalCTA.tsx` - Email link
- `src/components/Footer.tsx` - Contact details
- `src/components/Navbar.tsx` - CTA button link

### Analytics & SEO

To add analytics:

1. Integrate Google Analytics or similar
2. Update metadata in `src/app/layout.tsx`

## Performance

- **Build Time:** ~2-3 minutes (first build)
- **Image Size:** ~300MB (with dependencies)
- **Container Memory:** ~50MB idle, ~100MB under load
- **Static Site:** No database required

## Troubleshooting

### Service won't start

```bash
# Check for port conflicts
sudo lsof -i :3002

# Check Docker daemon
sudo systemctl status docker

# View full error logs
sudo journalctl -u ergastech-dev -n 50 --no-pager
```

### Nginx not forwarding traffic

```bash
# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check if the container is running
docker ps | grep ergastech
```

### Container exits immediately

```bash
# View Docker logs
docker compose logs

# Check system resources
free -h
df -h
```

## Important Notes

- The site is automatically deployed when the systemd service starts
- The service will restart automatically on failure
- The application persists even when Claude is offline (running via systemd)
- All traffic is proxied through nginx for security and SSL termination

## Support

For issues or questions, check the logs:

```bash
# Systemd logs
sudo systemctl logs -u ergastech-dev

# Docker logs
docker compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```
