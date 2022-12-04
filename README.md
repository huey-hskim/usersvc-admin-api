## Description

- backend api for usersvc admin

## Build

```bash
$ docker build -t build-usersvc-admin-api .
```

## Run
```bash
$ docker run -p 8087:8087 -d build-usersvc-admin-api
```

## Run (using compose)
```bash
$ docker compose up -d 
```

## Run (local)
```bash
$ npm install
$ NODE_ENV=local node server.js
```
