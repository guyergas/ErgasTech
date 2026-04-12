.PHONY: help build run dev stop logs status

help:
	@echo "ErgasTech Landing Page - Available Commands"
	@echo ""
	@echo "  make build     - Build the Docker image"
	@echo "  make run       - Start the application in production mode"
	@echo "  make dev       - Start the application in development mode (via systemd)"
	@echo "  make stop      - Stop all containers"
	@echo "  make logs      - View application logs"
	@echo "  make status    - Check application status"
	@echo "  make clean     - Remove Docker containers and images"

build:
	@echo "Building ErgasTech Docker image..."
	docker compose build

run:
	@echo "Starting ErgasTech in production mode..."
	docker compose up -d
	@echo "ErgasTech is running on http://localhost:3002"

dev:
	@echo "Starting ErgasTech development service..."
	sudo systemctl start ergastech-dev
	@echo "ErgasTech dev service started"
	@echo "Check status: sudo systemctl status ergastech-dev"

stop:
	@echo "Stopping ErgasTech..."
	docker compose down
	sudo systemctl stop ergastech-dev 2>/dev/null || true
	@echo "ErgasTech stopped"

logs:
	docker compose logs -f

status:
	@echo "Docker container status:"
	docker compose ps
	@echo ""
	@echo "Systemd service status:"
	sudo systemctl status ergastech-dev 2>/dev/null || echo "Service not enabled"

clean:
	@echo "Removing containers and images..."
	docker compose down --rmi all
	@echo "Cleanup complete"

.DEFAULT_GOAL := help
