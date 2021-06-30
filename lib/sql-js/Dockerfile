FROM emscripten/emsdk:2.0.24

WORKDIR /tmp/build

COPY configure.py .
RUN python3.8 configure.py

COPY build.py .
RUN python3.8 build.py
