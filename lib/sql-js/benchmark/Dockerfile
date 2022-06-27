FROM node:14-bullseye

RUN set -ex; \
    echo 'deb http://deb.debian.org/debian unstable main' \
        > /etc/apt/sources.list.d/unstable.list; \
    apt-get update; \
    apt-get install -y -t unstable firefox; \
    apt-get install -y chromium

WORKDIR /tmp/build

COPY package.json ./
COPY lib/dist lib/dist
COPY lib/package.json lib/package.json
RUN npm install

COPY . .

CMD npm run benchmark
