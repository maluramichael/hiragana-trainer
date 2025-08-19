#!/bin/bash

OUTPUT_DIR=dist
HOST=$1
DESTINATION="/var/www/hiragana-trainer.de/"

if ! rsync -ra --progress --delete "${OUTPUT_DIR}/" "${HOST}":"${DESTINATION}"; then exit 1; fi

ssh $HOST <<EOF
    cd ${DESTINATION}

    chown -R www-data:www-data ${DESTINATION}
    chmod -R 755 ${DESTINATION}

    systemctl reload nginx
EOF