FROM node:23-alpine3.20

WORKDIR /app

# kopiowanie package.json do /app (naszego work directory)
COPY package.json ./

# ściaganie node modules
RUN npm install

# kopiowanie całego folderu projektu w którym znajduje się dockerfile (WEPPO-ITCC-PROJECT) bez docker ignore 
COPY . .

CMD ["node", "src/server.js"]
