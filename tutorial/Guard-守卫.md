## 守卫
***
守卫是一个使用`@Injectable()`装饰器注释的类。守卫应该实现`CanActivate()`接口。
守卫有一个单独的责任。他们确定请求是否应该由路由处理程序处理。到目前为止，访问限制逻辑大多在中间件内。这样很好，因为诸如token验证或将`request`对象附加属性与特定路由没有强关联。
但中间件是非常笨的。他不知道调用`next()`函数后会执行哪个处理程序。另一方面，守卫可以访问`ExecutionContext`对象，所以我们确切知道将要执行什么。

`守卫在每个中间件之后执行，但是在拦截器和管道之前`

## 授权看守卫
***
最好的守卫用例之一就是授权逻辑，因为只有当调用者具有足够的权限时才能使用特定的路由。我们计划创建的`AuthGuard`将按顺序提取并验证请求标头中发送的token。

```javascript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest();
		return validate(request);
	}
}
```
不管`validate()`函数背后的逻辑是什么，重点是展示守卫是多么简单。每个守卫都提供一个`canActivate`方法。守卫可能通过`Promise`或`Observable`同步或异步地返回他的布尔答复。返回的值控制Nest行为:

* 如果返回true,将处理用户调用。
* 如果返回false,则Nest将忽略当前处理的请求。

`canActivate()`函数采用单参数`ExecutionContext`实例。`ExecutionContext`继承自`ArgumentsHost`。

## ExecutionContext
***
ExecutionContext提供了更多功能，他扩展了ArgumentsHost，但是也提供了有关当前执行过程的更多详细信息。

```javascript
export interface ExecutionContext extends ArgumentsHost {
	getClass<T = any>(): Type<T>;
	getHandler(): Function;
}
```
`getHandler()`方法返回对当前处理的处理程序的引用，而`getClass()`返回此特定处理程序所属的`Controller`类型。用另外的
话来说，如果用户指向在`CatsController`中定义和注册的`create()`方法，`getHandler()`将返回`create()`方法的引用，在这种情况下`getClass()`将只返回一个`CatsController`的类型。

## 基于角色的认证
***
一个更详细的例子是`RoleGuard`。这个守卫只允许具有特定角色的用户访问。我们要从一个基本的守卫模板开始。

```javascript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RoleGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		return true;
	}
```

## 绑定守卫
***
守卫可以是控制器范围的，方法范围的和全局范围的。为了建立守卫，我们使用`@UserGuards()`这个装饰器。这个装饰器可以有无数的参数，也就是说，你可以传递几个守卫并用逗号分隔他们。

```javascript
@Controller('cats')
@UserGuards(RoleGuard)
export class CatsController {}
```

`@UserGuards()`装饰器是从`@nestjs/common`包中导入的。

```javascript
const app = await NestFactory.create(ApplicationModule);
app.useGlabalGuards(new RoleGuard());
```

```javascript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

@Module({
	providers:[
		{provide: APP_GUARD, useClass: RoleGuard }
	]
})
export class ApplicationModule() {}
```

还有，控制器里的守卫，在依赖注入方面，可以类似的看成普通的可注入类来注入。例如

```javascript
import { Module } from '@nestjs/common';
import { RoleGuard } from '../guard';
import { UserService } from '../service';

@Module({
	providers:[
		UserService, RoleGuard
	]
})
export class ServiceModule {}
```

## 反射器
***
守卫现在在正常工作，但是我们仍然没有利用最重要的守卫的特征，即执行上下文。
现在，`RoleGuard`是不可重用的。我们如何知道处理程序需要处理哪些角色？`CatsController`可以有很多，有些可能只适用于管理员，一些适用于所有人，虽然他们没有任何权限。
这就是为什么与守卫一起，`Nest`提供了通过`@SetMetadata()`装饰器附加自定义元数据的功能。

```javascript
@Post()
@SetMetadata('roles', ['admin'])
async create(@Body() createCatDto: CreateCatDto) {
	this.catsService.create(createCatDto);
}
```

> `@SetMetadata()`装饰器是从`@nestjs/common`包中导入的。

通过上面的构建，我们将`roles`元数据(`roles`是一个键，而`['admin']`是一个特定的值)附加到`create()`方法。直接使用`@SetMetadata()`并不是一个好习惯。相反，你应该总是建立你自己的装饰器。

```javascript
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```
这种方法更清晰，更易读。由于现在我们有一个`@Roles()`装饰器，所以我们可以在`create()`方法中使用它。

```javascript
@Post()
@Roles('admin')
async create(@Body() createCatDto: CreateCatDto) {
	this.catsService.create(createCatDto);
}
```
为了反映元数据，我们将使用在`@nestjs/core`中提供的`Reflector`帮助类。

```javascript
import { Injectable, Observable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const roles = this.reflector.get<string[]>('roles', context.getHandler());
		if(!roles) {
			return true;
		}
		const request = context.swichToHttp().getRequest();
		const user = request.user;
		const hasRole = ()=>user.roles.some((role)=>roles.includes(role));
		return user && user.roles && hasRols();
	}
}
```
