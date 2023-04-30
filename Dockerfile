# from 构建镜像的基础源镜像 该image镜像文件继承官方的node image
FROM node:17.9.1

# 在容器中创建一个工作目录
WORKDIR /usr/src/wxbot

# RUN/COPY是分层的，package.json 提前，只要没修改就不会重新安装包
COPY package*.json ./
COPY *.js ./
COPY node_modules ./node_modules
COPY assets ./assets
COPY ".nuxt" "./.nuxt"
COPY ".nuxt5" "./.nuxt5"
COPY bot ./bot
COPY build ./build
COPY components ./components
COPY layouts ./layouts
COPY logs ./logs
COPY pages ./pages
COPY plugins ./plugins
COPY server ./server
COPY static ./static
COPY store ./store
RUN npm install -g cnpm --registry=https://registry.npmmirror.com
RUN cnpm install
RUN cnpm install cross-env@5.2.0
RUN cnpm install pm2 -g
RUN cnpm install nice-try@3.0.1
RUN cnpm install which
RUN cnpm install path-key


EXPOSE 3000
CMD ["npm", "run", "dev"]
