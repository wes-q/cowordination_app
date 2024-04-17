FROM node:20

WORKDIR /usr/src/app

COPY . .

RUN npm install

ENV VITE_SERVER_URL="//localhost:3000"

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
