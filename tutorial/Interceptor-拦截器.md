## 拦截器
***
拦截器是使用`@Injectable()`装饰器注解的类。拦截器应该实现NestInterceptor接口。
拦截器具有一系列有用的功能，这些功能受面向切面编程（AOP）技术的启发。他们可以:

* 在函数执行之前/之后绑定额外的逻辑
* 转换从函数返回的结果
* 转换从函数抛出的异常
* 扩展基本函数行为
* 根据所选条件完全重写函数(例如，缓存目的)

## 基础
***
每个拦截器都有`intercept()`方法，接收两个参数。第一个是`ExecutionContext`实例，`ExecutionContext`继承自`ArgumentsHost`。

## 调用处理程序
***
第二个参数是`CallHandler`。如果不手动调用Handle()方法，则主处理程序根本不会进行求值。

## 绑定拦截器
为了设置拦截器，我们从`@nestjs/common`包导入`@UserInterceptors()`装饰器。与守卫一样，拦截器是在控制器范围内的，方法方位内的，或者全局范围内的。

```javascript
@UserInterceptors(LoggingInterceptor)
export class CatsController() {}
```

由此，`CatsController`中定义的每个路由处理程序都将使用`LoggingInterceptor`。当有人调用GET /cats 端点时，将可以看到输出.
如上所述，上面的构造将拦截器附加到此控制器声明的每个处理程序。如果我们决定只限制其中一个，我们只需在方法级别设置拦截器。为了绑定全局拦截器，我们使用Nest应用程序实例的`userGlobalInterceptors()`方法。

```javascript
const app = await NestFactory.create(ApplicationModule);
app.userGlobalInterceptors(new LoggingInterceptor());
```

如果想在局部设置拦截器，可以如下处理:

```javascript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
	providers:[
		{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }
	]
})
export class ApplicationModule() {}