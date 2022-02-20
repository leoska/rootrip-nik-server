#!/usr/bin/env bash

docker build -t rootrip-nik-server:latest .
docker image prune -f