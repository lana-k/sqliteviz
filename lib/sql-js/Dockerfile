FROM emscripten/emsdk:2.0.24

WORKDIR /tmp/build

ENV SQLJS_V=1.5.0

RUN set -ex; \
    wget -q https://github.com/sql-js/sql.js/archive/refs/tags/v${SQLJS_V}.zip; \
    unzip -q v${SQLJS_V}.zip; \
    rm v${SQLJS_V}.zip; \
    mv sql.js-${SQLJS_V}/* sql.js-${SQLJS_V}/.[^.]* .; \
    rmdir sql.js-${SQLJS_V}

COPY ext_init.c.in .
COPY Makefile.sql-js Makefile

RUN set -ex; \
    EM_NODE_JS=$(which node) npm run build -- optimized; \
    rm dist/.[^.]*
