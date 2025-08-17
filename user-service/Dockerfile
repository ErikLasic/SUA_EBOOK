FROM node:20-alpine

WORKDIR /app

# samo package datoteke (cache layer)
COPY package*.json ./

# prod odvisnosti
RUN npm install --omit=dev

# koda
COPY src/ ./src/

ENV NODE_ENV=production
EXPOSE 5001
CMD ["node", "src/server.js"]
