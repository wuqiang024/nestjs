## 中间件
***
中间件是一个在路由处理器之前被调用的函数。中间件函数可以访问请求和响应对象，以及应用程序请求响应周期中的`next()`中间件函数。`next()`中间件函数通常由名为`next`的变量表示。

Nest中间件实际上等价于express中间件。下面是Express官方文档中所述的中间件功能。

> 中间件函数可以执行以下任务:

* 执行任何代码
* 对请求和响应对象进行更改
* 结束请求-响应周期
* 调用堆栈中的下一个中间件函数
* 如果当前的中间件函数没有结束请求-响应周期，他必须调用`next()`将控制传递给下一个中间件函数。否则，请求将被挂起

Nest中间件可以是一个函数，也可以是一个带有`@Injectable()`装饰器的类。这个类应该实现`NestMiddleware`接口，而函数没有任何特殊的请求。

```javascript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: Function) {
		console.log('test');
		next();
	}
}
```

## 依赖注入
***
中间件也不例外。与提供者和控制器相同，他们能够注入属于同一模块的依赖项（通过constructor)。

## 应用中间件
***
中间件不能在`Module()`装饰器中列出。我们必须使用模块的`configure()`方法来设置他们。包含中间件的模块必须实现`NestModule`接口。我们将`LoggerMiddleware`设置在`ApplicationModule`之上。

```javascript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
	imports: [CatsModule]
})
export class ApplicationModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware)
				.forRoutes('cats');
	}
}
```

在上面的例子中，我们给之前的LoggerMiddware的`/cats`路由处理器定义了`CatsController`。我们还可以进一步通过使含有该路线的对象限制中间件于特定请求方法path和请求method到forRoutes()配置中间件时方法。

```javascript
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
	imports:[CatsModule]
})
export class ApplicationModule implements NestModule {
	configure(consumer: MiddlewareConsumer)
			.apply(LoggerMiddleware)
			.forRoutes({path: 'cats', method: RequestMethod.GET })
}
```

## 路由通配模式
***
路由同样支持模式匹配。例如星号被用作通配符。将匹配任何字符组合。

```javascript
forRoutes({ path: 'abc*d', method: RequestMethod.ALL })
```

### 中间件消费者
***
`MiddlewareConsumer`是一个帮助类。他提供了几种内置方法来管理中间件。他们都可以被简单的连接起来。在`forRoutes()`可以接受一个字符串，多个字符串，一个控制器甚至多个控制器。在大多数情况下，你可能只会传递一个由逗号分割的控制器列表。

```javascript
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
	imports:[CatsModule],
})
export class ApplicationModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware)
				.exclude(
					{path: 'cats', method: RequestMethod.GET}
				)
				.forRoutes(CatsController)
	}
}
```

通过上面的示例，LoggerMiddleware将绑定到CatsController除了exclude()方法的两个内部定义的所有路由。
`请注意，该exclude()方法不适用于函数中间件(在函数中而不是类中定义的中间件)。此外，此方法不排除来自更通用路由(例如通配符)的路径。`

## 函数式中间件
***
`LoggerMiddleware`很简单。他没有成员，没有额外方法，没有依赖关系。可以将该类转为函数中间件

```javascript
export function logger(req, res, next) {
	console.log('test');
	next();
}
```

###
***
如前所述，为了绑定顺序执行的多个中间件，可以在apply()方法中用逗号分隔他们。

```javascript
consumer.apply(cors(), helmet(), logger).forRoutes(CatsController);
```

## 全局中间件
***
为了一次将中间件绑定到每个路由，可以使用实例`INestApplication`提供的方法use():

```javascript
const app = NestFactory.create(ApplicationModule);
app.use(logger);
await app.listen(3000);
```