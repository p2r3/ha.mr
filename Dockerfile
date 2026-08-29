FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docs/404.html /usr/share/nginx/html/
COPY docs/alphabets.js docs/compress.js docs/main.js docs/service-worker.js standalone.js /usr/share/nginx/html/
COPY docs/lean-qr/ /usr/share/nginx/html/lean-qr/
