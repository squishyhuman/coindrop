FROM debian:buster
MAINTAINER Sami Mäkelä

RUN apt-get update \
 && apt-get install -y wget ocaml opam libzarith-ocaml-dev m4 pkg-config zlib1g-dev apache2 psmisc sudo \
 && opam init -y \
 && eval `opam config env` \
 && opam install cryptokit yojson -y

RUN git clone https://github.com/TrueBitFoundation/ocaml-offchain \
 && cd ocaml-offchain/interpreter \
 && eval `opam config env` \
 && make

RUN git clone https://github.com/juj/emsdk \
 && cd emsdk \
 && ./emsdk install sdk-1.37.28-64bit \
 && ./emsdk activate sdk-1.37.28-64bit

RUN apt install -y bash \
 && rm /bin/sh \
 && ln -s /bin/bash /bin/sh

RUN git clone https://github.com/TrueBitFoundation/emscripten-module-wrapper \
 && cd emscripten-module-wrapper \
 && . /emsdk/emsdk_env.sh \
 && npm install ipfs-api \
 && sed -e "s/\/home\/sami//" prepare.js > prepare2.js

RUN git clone https://github.com/mrsmkl/coindrop \
 && cd coindrop \
 && . /emsdk/emsdk_env.sh \
 && emcc -s WASM=1 -o simple.js simple.c \
 && touch output.data \
 && touch input.data \
 && node /emscripten-module-wrapper/prepare2.js simple.js --file input.data --file output.data

