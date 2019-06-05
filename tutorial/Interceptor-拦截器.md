## 拦截器
***
拦截器是使用`@Injectable()`装饰器注解的类。拦截器应该实现`NestInterceptor`接口。

拦截器具有一系列有用的功能，这些功能受面向切片编程(AOP)技术的启发。他们可以:

* 在函数执行之前/之后绑定额外的逻辑
* 转换从函数返回的结果
* 转换从函数抛出的异常
* 扩展基本的函数行为
* 根据所选条件完全重写函数

## 基础
***
每个拦截器都有`intercept()`方法，他接收两个参数。第一个是`ExecutionContext`实例。`ExecutionContext`继承自`ArgumentsHost`。

## 执行上下文
***
`ExecutionContext`提供了更多功能，他扩展了`ArgumentsHost`，但是也提供了有关当前执行过程的更多详细信息。


```javascript
export interface ExecutionContext extends ArgumentsHost {
	getClass<T = any>: Type<T>;
	getHandler(): Function;
}
```
`getHandler()`方法返回对当前处理的处理程序的应用，而`getClass()`返回此特定处理程序所属的`Controller`类的类型。用另外的话来说，如果用户指向在`CatsController`中定义和注册的`create()`方法，`getHandler()`将返回对`create()`方法的引用，在这种情况下，`getClass()`将只返回一个`CatsController`的类型(不是实例);

## 调用处理程序
***
第二个参数是`CallHandler`。如果不手动调用`handle()`方法，则主程序根本不会进行求值。

## 截取切面
***
第一个用例是使用拦截器在函数执行之前或之后添加额外的逻辑。当我们要记录与应用程序的交互时，他很有用，例如存储用户调用，异步调度事件或者计算时间戳。作为一个例子，我们来创建一个简单的例子。

```javascript
import { Injectable, NestInterceptor, CallHandler, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler) {
		console.log('before');
		return next.handle().pipe(tap(...));
	}
}
```
由于`handle()`返回一个RxJS`Observable`，我们有很多操作符可以用来操作流。在上面例子中，我们使用了`tap()`运算符，该运算符在可观察序列的正常或异常终止时调用函数。

## 绑定拦截器
***
为了设置拦截器，我们使用从`@nestjs/common`包导入的`@UserInterceptors()`装饰器。与守卫一样，拦截器可以在控制器范围内，方法范围内或全局范围内。

```javascript
@UserInterceptors(LoggerInterceptor)
export class CatsController {}
```

`@UserInterceptors`从`@nextjs/common`包中导入。

由此，`CatsController`中定义的每一个路由处理程序都将使用`LoggerInterceptor`。当有人调用GET方法请求`/cats`端点时，将在控制台窗口看到输出。

如果我们只需拦截某个方法，我们只需在方法级别上设置拦截器。为了绑定全局拦截器，我们使用Nest应用程序实例的`userGlobalInterceptors()`方法:

```javascript
const app = await NestFactory.create(ApplicationModule);
app.userGlobalInterceptors(new LoggerInterceptor());
```

全局拦截器用于整个应用程序、每个控制器和每个路由处理程序。
