FROM node:20
WORKDIR /usr/src/app
COPY --chown=node:node . .
RUN npm install
USER node
EXPOSE 3002
CMD ["npm", "run", "dev", "--", "--host"]
