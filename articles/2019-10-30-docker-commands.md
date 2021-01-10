---
layout: post
title: Docker Commands
date: 2019-10-30
---

I use Docker all the time. But still I forget common commands constantly. Here are the commands I need to look up most often.

```bash
# Build a container with the a tag
docker build . -t <CONTAINER_TAG>

# Run bash inside a running container
docker exec -it <CONTAINER_ID> bash

# Run bash in a new container
docker run -it <CONTAINER_TAG> bash

# Run a container while mounting the current directory to
# `var/www` in the container
docker run -v $(pwd):/var/www <CONTAINER_TAG>

# Run a container while exposing a port to the host
docker run -p <HOST_PORT>:<CONTAINER_PORT> <CONTAINER_TAG>

# Above two combined
docker run -v $(pwd):/var/www -p <HOST_PORT>:<CONTAINER_PORT> <CONTAINER_TAG>

# Stop all of the containers
docker stop $(docker ps -aq)

# Remove all of the containers
docker rm $(docker ps -aq)

# Delete all of the images
docker rmi $(docker images -aq)

# Delete all of the volumes
docker volume rm $(docker volume ls -q)

# Copy stuff from the container to the host
docker cp <CONTAINER_ID>:<CONTAINER_PATH> <HOST_PATH>
```

