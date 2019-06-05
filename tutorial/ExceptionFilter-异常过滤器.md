## 异常过滤器
***
内置的异常层负责处理整个应用程序中的所有抛出的异常。当捕获到未处理的异常时，最终用户将收到友好的响应。

每个发生的异常都由全局异常过滤器处理，当这个异常无法被识别时（既不是HttpException也不是继承的类HttpException)。用户将收到以下JSON响应。

```javascript
{
	'statusCode': 500,
	'message': 'Internal server error'
}
```

## 基础异常类(Base exceptions)
***
包`@nestjs/common`中公开了一个内置的HttpException类。核心异常处理程序与此类会很好的工作。当你抛出HttpException对象时，他将被处理程序捕获，然后转换为相关的JSON响应。
在CatsController，我们有一个findAll()方法，让我们假设这个路由处理器由于某种原因会抛出一个异常。我们要硬编码他:

```javascript
@Get()
async findAll() {
	throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```

`我们在这里使用了HttpStatus。他是从@nestjs/common包导入的辅助没举器`

现在当客户调用这个端点时，响应如下所示:

```javascript
{
	'statusCode': 403,
	'message': 'Forbidden'
}
```

HttpException构造函数才有 `string | object`作为第一个参数。如果你传递的是对象而不是字符串，则将完全覆盖响应体。

## 异常层次
***
好的做法是创建自己的异常层次结构。这意味着每个HTTP异常都应从基础HttpException类继承。因此Nest将识别你的异常，并将完全处理错误响应。

```javascript
export class ForbiddenException extends HttpException {
	constructor() {
		super('Forbidden', HttpStatus.FORBIDDEN);
	}
}
```

## 异常过滤器
***
基础异常处理程序很好，但有时你可能希望对异常层拥有完全控制权，例如，添加一些日志记录或者基于某些选定的因素使用不同的JSON结构。
下例会创建一个过滤器，负责捕获HttpException类的实例，并为他们设置自定义响应逻辑。

```javascript
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();
		const status = exception.getStatus();
		response.status(status)
			 	.json({
			 		statusCode: exception.getStatus(),
			 		timestamp: new Date().toISOString(),
			 		path: request.rul
			 	})
	}
}
```

`所有的异常过滤器都应该实现通用的ExceptionFilter接口。他强制你使用有效签名提供catch(exception: T, host: ArgumentsHost) 方法，T表示异常的类型`

`@Catch()`装饰器绑定所需的元数据到异常过滤器上。他告诉Nest这个特定的过滤器正在寻找HttpException，而没有别的。
`@Catch()`的参数是无限个的，所以你可以通过逗号分隔来为多个类型的异常设置过滤器。

## ArgumentsHost
***
exception是当前处理的异常，而host是ArgumentsHost对象。ArgumentsHost是传递给原始处理程序的参数的一个包装，他根据应用程序的类型包含不同的参数数组（和正在使用的平台)

## 绑定过滤器
***

```javascript
@Post()
@UserFilters(new HttpExceptionFilter())
async create(@Body createCatsDto: CreateCatsDto) {
	throw new ForbiddenException()
}
```

`UserFilters`装饰器从 `@nestjs/common`包导入。

我们在这里用了`@UserFilters()`装饰器，他跟`@Catch()`一样，可以有无限个参数。

HttpExceptionFilter实例已就地立即创建。另一种可用的方式是传递类(不是实例)，让框架承担实例化责任并启用依赖注入。
```javascript
@Post()
@UserFilters(HttpExceptionFilter)
async create(@Body createCatDto: CreateCatsDto) {
	throw new ForbiddenException();
}
```

如果可能，最好使用类而不是实例，他可以减少内存使用量。因为Nest可以轻松地在整个应用程序中重复使用同一类的实例。

## 全局过滤器
***

```javascript
async function bootstrap() {
	const app = NestFactory.create(ApplicationModule);
	app.useGlobalFilters(new HttpExceptionFilters());
	await app.listen(3000);
}
bootstrap();
```

全局过滤器用于整个应用程序，每个控制器和每个路由处理程序。就依赖注入而言，从任何模块外部注册的全局过滤器（如上例所示）不能注入依赖，因为他不属于任何模块。为了解决这个问题，可以用以下构造直接为任何模块设置过滤器。

```javascript
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

@Module({
	providers:[
		{ provide: APP_FILTER, useClass: HttpExceptionFilter }
	]
})
```

## 捕获一切
***
为了处理每个发生的异常（无论异常类型如何），可以将括号留空，例如 `Catch()`。用户将收到以下JSON响应。

```javascript
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		const ctx = ArgumentsHost.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();
		response.status(status)
				.json({
					statusCode: exception.getStatus(),
					timestamp: new Date().toISOString(),
					path: request.url
				})
	}
}
```

## 继承
***
通常，你将创建完全定制的异常过滤器，以满足你的应用程序需求。如果你希望用已经实现的核心异常过滤器，并基于某些因素重写行为，请看以下例子。
为了将异常处理委托给基础过滤器，需要继承BaseExceptionFilter并调用继承的catch()方法。
```javascript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionFilter extends BaseExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		super.catch(exception, host);
	}
```

你可以通过注入HttpServer 来使用继承自基础类的全局过滤器。

```javascript
async function bootstrap() {
	const app = NestFactory.create(ApplicationModule);
	const { httAdapter } = app.get(HttpAdapterHost);
	app.useGlobalFilters(new AllExceptionFilter(httAdapter));
	await app.listen(3000);
}
```