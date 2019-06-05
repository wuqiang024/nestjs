
## 安装nest-cli
***
> 在使用npm的时候，由于xx关系，导致下载速度很慢，可以在命令行输入

```javascript
npm install -g nrm   // 安装nrm
nrm ls // 查看nrm所提供的源
nrm use   // 使用cnpm来安装，避免翻墙
````

```javascript
// 安装nestjs/cli
npm install -g @nestjs/cli  
nest new nestjs // 新建nest项目
npm run start
```
打开浏览器，输入 http://localhost:3000 
第一个nest项目页面即大功告成了.

## 平台
***
Nest旨在成为一个与平台无关的框架。从技术上讲,Nest可以在创建适配器后使用任何Node HTTP框架。有两个支持开箱即用的HTTP平台。express和fastify。

### platform-express
Express是众所周知的node.js简约web框架。默认情况下使用 `@nestjs/platform-express`包。

### platform-fastify
Fastify是一个高性能,低开销的框架,专注于提供最高的效率和速度。

不管使用哪种平台,他都会暴露自己的应用程序界面。他们分别被视为NestExpressApplication和NestFastifyApplication
。

将类型传递给NestFactory.create()方法时,如下所示,app对象将具有专用于该特定平台的方法。但是,请注意,除非您确实要访问底层平台API,否则无须指定类型。

```javascript
const app = NestFactory.create<NestExpressApplication>(ApplicationModule);