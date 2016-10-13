#!/usr/bin/fish
set -x DATA_BASE (cd (dirname (status -f)); and pwd)/data
mkdir -p $DATA_BASE

set -x POSTGRES_DB "paper-walrus"
set -x POSTGRES_USER "paper-walrus"
set -x POSTGRES_PASSWORD "paper-walrus"

set cid (docker run -d -v $DATA_BASE/postgres:/var/lib/postgresql/data \
	-e POSTGRES_DB=$POSTGRES_DB \
	-e POSTGRES_USER=$POSTGRES_USER \
	-e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
	postgres:9.6)

set -x POSTGRES_HOST (docker inspect --format '{{ .NetworkSettings.IPAddress }}' $cid)