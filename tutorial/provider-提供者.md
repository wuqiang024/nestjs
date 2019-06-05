## 提供者
***
几乎所有的东西都可以被认为是提供者-service,repository,factory,helper等等。他们都可以通过`constructor`注入依赖关系，也就是说，他们可以创建各种关系。但事实上，提供者不过是一个用`@Injectable()`装饰器注解的类。

控制器处理HTTP请求并将更复杂的任务委托给提供者。提供者是纯粹的javascript类，其上方有`@Injectable()`装饰器。

## 服务
***

```javascript
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
	private readonly cats: Cat[] = [];

	create(cat: Cat) {
		this.cats.push(cat);
	}

	findAll(): Cat[] {
		return this.cats;
	}
}
```

`要使用CLI创建服务了，只需只需 nest g service cats/cats 命令`

现在我们有一个服务类来检索cat，让我们在CatsController类中使用它:

```javascript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
	construct(private readonly catsService: CatsService) {}

	@Post()
	async create(@Body createCatDto: CreateDto) {
		this.catsService.create(createDto);
	}

	@Get()
	async findAll(): Promice<Cat[]> {
		return this.catsService.findAll();
	}
}
```

## 依赖注入
***
解析依赖关系并将其传递给控制器的构造函数(或分配给指定的属性):

```javascript
constructor(private readonly catsService: CatsService) {}
```

## 范围
提供者通常具有与应用程序生命周期同步的生命周期(’范围')。引导应用程旭时，必须解析每个依赖项，因此必须实例化每个提供程序。
同样，当应用程序关闭时，每个提供者都将被销毁。

## 可选提供者
***
有时候，你可能会面临不一定要解决的关联。例如，你的类可能依赖于一个配置对象，但是如果没有传递，则应使用默认值。在这情况下，关联变为可选的，提供者不会因为缺少配置导致错误。
要确保提供者不是必选的，请在constructor的参数中使用@optional()装饰器。

```javascript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
	construct(@Optional() @Inject('HTTP_OPTIONS') private readonly httpClient: T)
}
```

