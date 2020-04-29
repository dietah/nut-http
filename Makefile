lint:
	npm run lint

docker:
	docker build -t deetoreu/nut-http .

docker-arm:
	docker buildx build --platform=linux/arm/v7 -t deetoreu/nut-http .
