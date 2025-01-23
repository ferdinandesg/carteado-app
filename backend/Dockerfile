FROM node:18-alpine

WORKDIR /app

# Copia a estrutura sem achatar pastas
COPY . /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
