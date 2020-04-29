lint:
	npm run lint

docker:
	docker build -t deetoreu/nut-http:latest .

docker-arm:
	docker buildx build --platform=linux/arm/v7 -t deetoreu/nut-http:latest .
