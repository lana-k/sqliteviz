FROM node:20.14-bookworm

RUN set -ex; \
    apt-get update; \
    apt-get install -y firefox-esr; \
    apt-get install -y chromium

WORKDIR /tmp/build

COPY package.json ./
COPY lib/dist lib/dist
COPY lib/package.json lib/package.json
RUN npm install

COPY . .

CMD npm run benchmark
