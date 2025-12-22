FROM node:18-alpine as build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Use LOCALHOST build args
ARG REACT_APP_API_URL=http://localhost:5000/api
ARG REACT_APP_WS_URL=ws://localhost:5000
ARG REACT_APP_DOMAIN=localhost

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_WS_URL=$REACT_APP_WS_URL
ENV REACT_APP_DOMAIN=$REACT_APP_DOMAIN

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3002
CMD ["nginx", "-g", "daemon off;"]