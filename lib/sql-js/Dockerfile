FROM emscripten/emsdk:3.0.1

WORKDIR /tmp/build

COPY configure.py .
RUN python3.8 configure.py

COPY build.py .
RUN python3.8 build.py
