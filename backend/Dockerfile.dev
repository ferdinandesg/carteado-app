FROM node:18-alpine

WORKDIR /app

COPY tsconfig.base.json ./

COPY backend/package.json ./backend/
COPY backend/package-lock.json ./backend/
COPY shared/ ./backend/shared/

WORKDIR /app/backend
RUN npm install

COPY backend/ ./

CMD ["npm", "run", "dev"]