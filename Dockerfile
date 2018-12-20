FROM node:10.12

RUN npm install -g yarn nodemon

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install

COPY src ./src
COPY *.js ./
COPY .babelrc ./
COPY public ./public

EXPOSE 3000

CMD [ "npm", "start" ]
