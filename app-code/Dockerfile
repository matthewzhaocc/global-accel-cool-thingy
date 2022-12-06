FROM node:18 AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

FROM node:18

WORKDIR /app

COPY --from=builder /app/build/ /app/

COPY package.json package.json

RUN npm install --omit=dev

ENV NODE_ENV=production

CMD ["node", "index.js"]