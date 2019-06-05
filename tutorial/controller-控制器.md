## 控制器
***
控制器负责处理传入的请求,并返回对客户端的响应。
控制器的目的是接收应用的特定请求。路由机制控制哪个控制器接受哪个请求。通常，每个控制器有多个路由，不同的路由可以执行不同的操作。

为了创建一个基本的控制器，我们必须使用`装饰器`。装饰器将类与所需的元数据关联，并使Nest能够创建路由映射(将请求绑定到相应的控制器)。

## 路由
***

```javascript
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
export class CatsController {
	@Get('abc*d')
	@HTTPCode(200)
	@Header('Cache-Controller', 'none')
	findAll(@Req() request: Request): string {

	}
}
```

>> 要使用CLI创建控制器，只需nest g controller cats命令
>> 为了在express中使用typescript，（如request:Request上面的参数所示），请安装`@types/express`。

Request对象表示HTTP请求，并具有Request查询字符串，参数，HTTP头和正文的属性。

## 请求负载
***
之前的POST请求路由处理程序不接受任何客户端参数。可以通过添加`@body()`参数来解决这个问题。
首先，需要确定DTO架构。DTO是一个定义如何通过网络发送数据的对象。

```javascript
export class CreateCatsDto {
	readonly name: string;
	readonly age: number;
	readonly breed: string;
}
```

这时候我们可以使用CatsController中的模式
```javascript
@Post()
async create(@Body() createCatsDto: CreateCatsDto) {
	return ...
}
```

## 类库特有方式
***
到目前为止，我们讨论了Nest操作响应的标准方式。操作响应的第二种方法是使用类库特有的响应对象(Response)。为了注入响应对象，我们需要使用`@Res()`装饰器。

```javascript
import { Controller, Get, Post, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('cats')
export class CatsController {
	@Post()
	create(@Res() res: Response) {
		res.status(HttpStatus.CREATED).send();
	}

	@Get()
	findAll(@Res res: Response) {
		res.status(HttpStatus.OK).json([]);
	}
}
```

