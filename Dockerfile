# Import container with nodejs v14
FROM node:14.19-buster

# Install PM2 Globally in Container
RUN npm install -g pm2

# Create app directory
WORKDIR /app

# Bundle app source
COPY . .

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

EXPOSE 25565
CMD [ "npm", "run", "watch" ]