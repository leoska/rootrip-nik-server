# Import container with nodejs v14
FROM node:14.19-buster

# Install PM2 Globally in Container
#RUN npm install -g pm2

# Create app directory
WORKDIR /app

# Bundle app source
COPY ./prisma ./prisma
COPY ./package.json ./package.json
COPY ./.babelrc.json ./.babelrc.json
COPY ./process_dev.yml ./process_dev.yml

# If you are building your code for production
# RUN npm ci --only=production
RUN npm install

# Generate prisma client
RUN npx prisma generate --schema=./prisma/development/schema.prisma

EXPOSE 25565
CMD [ "npm", "run", "watch" ]