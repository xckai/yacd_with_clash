ARG COMMIT_SHA=""
FROM  dreamacro/clash-premium:2023.08.17 as clash

FROM  node:alpine AS builder
WORKDIR /app
RUN npm i -g pnpm
COPY pnpm-lock.yaml package.json ./
COPY ./patches/ ./patches/
COPY . .
RUN pnpm i
RUN pnpm build \
  # remove source maps - people like small image
  && rm public/*.map || true


FROM node:alpine as runner
# the brotli module is only in the alpine *edge* repo
# https://pkgs.alpinelinux.org/package/edge/main/x86/nginx-mod-http-brotli
RUN apk add \
  nginx \
  nginx-mod-http-brotli \
  bash \
  --repository=https://dl-cdn.alpinelinux.org/alpine/edge/community
COPY docker/nginx-default.conf /etc/nginx/http.d/default.conf
RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/public /usr/share/nginx/html
COPY --from=clash  /etc/ssl/certs/ /etc/ssl/certs/
COPY --from=clash /root/.config/clash/ /root/.config/clash/
COPY --from=clash /clash /clash
COPY ./server /server

ENV YACD_DEFAULT_BACKEND "/internal-clash"
ENV INTERVAL_UPDATE_MINUTE "1440"
ADD docker-entrypoint.sh /
CMD ["/docker-entrypoint.sh"]
