## 异常过滤器
***
内置的异常层负责处理整个应用程序中的所有抛出异常。当捕获到未处理的异常时，最终用户将收到友好的响应。
每个发生的异常都是由全局异常过滤器处理，当这个异常无法被识别时，用户将收到以下JSON响应:

```javascript
{
	"statusCode": 500,
	"message": "Internal server error"
}
```

## 基础异常类
***
包`@nestjs/common`公开了一个内置的`HttpException`类。核心异常处理程序与此类会很好的处理工作。正如你所知，当你抛出HttpException时，他讲被程序捕获，然后转换为相关的JSON响应。
在`CatsController`，我们有一个`findAll()`方法。让我们假设这个路由由于某种原因会抛出一个异常。我们要硬编码他。

```javascript
@Get()
async findAll() {
	throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```

> 我们在这里使用了`HttpStatus`。他是从`@nestjs/common`包导入的辅助枚举器。

`HttpException`构造函数采用`String | object`作为第一参数。如果你传递的是对象，而不是字符串，则将完全覆盖响应体。

```javascript
@Get()
findAll() {
	throw new HttpException({
		status: HttpStatus.FORBIDDEN,
		error: 'This is a custom message'
	}, 403);
}
```
这个时候，响应不再是statusCode和message而是status和error。

## 异常过滤器
***
基础异常处理程序很好，但有时你可能希望对异常层拥有完全控制权。比如添加一些日志或者基于某些特定因素使用不同的JSON结构。这就是为什么创造异常过滤器的原因。

```javascript
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const request = ctx.getRequest();
		const response = ctx.getResponse();
		const status = exception.getStatus();
		response.status(status)
				.json({
					statusCode: status,
					timeStamp: new Date().toISOString(),
					path: request.url
				});
	}
}
```
所有的异常过滤器都应该实现`ExceptionFilter`接口。他强制你使用有效签名提供`catch(exception: T, host: ArgumentsHost)`方法。`T`表示异常的类型。

`Catch()`装饰器绑定所需的元数据到异常过滤器上。他告诉Net这个特定的过滤器正在寻找`HttpException`而没有别的。在实践中，`@Catch()`的的参数是无限个的，所以你可以通过逗号分隔来为多个类型的异常设置过滤器。

## ArgumentsHost
***
ArgumentsHost为我们提供了一组有用的方法，有助于从底层数组中选择正确的参数。换句话说，`ArgumentsHost`只不过是一个参数数组。例如，当过滤器在HTTP应用程序上下文中使用时，`ArgumentsHost`将包含`[request, response]`数组。但是，当前上下文是一个Web sockets应用程序时，该数组等于`[client, data]`。此设计决策使您能够访问最终将传递给相应处理程序的任何参数。

## 绑定过滤器
***
将过滤器绑定到`create()`方法上。

```javascript
@Post()
@UserFilters(new HttpExceptionFilter())
async create(@Body createCatDto: CreateCatDto) {
	throw new ForbiddenException();
}
```

`UserFilters()`装饰器从`@nestjs/common`包中导出。

异常过滤器可以是方法范围的，也可是控制器范围的，也可是全局范围的。

## 捕获一切
***
为了处理每个发生的异常，可以将括号留空，例如`Catch()`。

```javascript
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const request = ctx.getRequest();
		const response = ctx.getResponse();
		const status = exception.getStatus();

		response.status(status)
				.json({
					...
				})
	}
}
```