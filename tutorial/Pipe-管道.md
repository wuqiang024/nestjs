## 管道
***
管道是具有`@Injectable()`装饰器注解的类。管道应实现`PipeTransform`接口。
管道将输入数据转换为所需的输出。另外，他可以处理验证，因为当数据不正确时可能会抛出异常。

> 管道在异常区域内运行。这意味着当抛出异常时，他们由异常处理程序和应用于当前上下文的异常过滤器处理。

## 内置管道
***
`Nest`自带两个开箱即用的管道，即`ValidationPipe`和`ParseIntPipe`。他们从`@nestjs/common`包中导出。


## 他是什么样子的？
***
我们从`ValidationPipe`开始。首先他只接受一个值并立即返回相同的值，其行为类似于一个标志函数。

```javascript
import { Injectable. PipeTransform, ValidationPipe, ParseIntPipe } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
	transform(value: any, metadata: ArgumentsMetadata) {
		return value;
	}
}
```

> `PipeTransform<T, R>`是一个通用接口，其中`T`表示`value`的类型，`R`表示`transform()`方法返回的类型。

每个管道必须提供`transform()`方法。这个方法有两个参数:
* value
* metadata
`value`是当前处理的参数，而`metadata`是其元数据。元数据对象包含一些属性:

```javascript
export interface ArgumentsMetadata {
	type: 'body' | 'query' | 'param' | 'custom';
	metatype?: new (...args) => any;
	data?:string;
}
```
这里有一些属性描述参数

>type  告诉我们该属性是一个body(`@Body()`), query(`@Query()`), param(`@Param()`) 还是自定义参数。
metatype  属性的元类型，例如`String`。如果在函数签名中省略类型声明，或者使用原生JS，则为`undefined`。
data  传递给装饰器的字符串，例如`@Body('string')`。如果你将括号留空，则为`undefined`。

## 重点是什么？


