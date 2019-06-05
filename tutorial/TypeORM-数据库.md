## 数据库(TypeORM)
***
为了减少开始与数据库进行连接所需的样板，Nest提供了随时可用的`@nestjs/typeorm`软件包。我们选择了TypeORM，因为他绝对是Node.js中可用的最成熟的对象关系映射器(ORM)。由于他是用TypeScript编写的，所以他在Nest框架下运行非常好。

首先，安装所必须的依赖关系:
```bash
npm install --save @nestjs/typeorm typeorm mysql
```
一旦安装完成，我们可以将其TypeOrmModule导入到根目录中ApplicationModule。

```javascript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports:[
		TypeOrmModule.forRoot({
			type: 'mysql',
			host: 'localhost',
			port: 3306,
			username: 'root',
			password： 'root',
			database: 'test',
			entities: [__dirname + '/**/*.entity{.ts, .js}'],
			synchronize: true,
		})
	]
})
export class ApplicationModule {}
```

`forRoot()`函数接受与TypeORM包中的createConnection()相同的配置对象。此外，我们可以在项目根目录创建一个`ormconfig.json`文件，而不是将内容传递给他。

```javascript
{
	"type": "mysql",
	"host": "localhost",
	"port": "3306",
	"username": "root",
	"password": "root",
	"database": "test",
	"entities": ["src/**/*.entity{.ts, .js}"],
	"synchronize": true
}
```
现在我们可以将括号留空:

```javascript
import { Module, TypeOrmModule } from '@nestjs/common';

@Module({
	imports:[
		TypeOrmModule.forRoot()
	]
})
export class ApplicationModule {}
```

之后， `Connection`和`EntityManager`将可用于注入整个项目(无须导入其他任何模块)，例如以这种方式:

```javascript
import { Connection } from 'typeorm';

@Module({
	imports:[ TypeOrmModule.forRoot(), PhotoModule],
})
export class ApplicationModule {
	constructor(private readonly connection: Connection) {}
}
```

## 存储库模式
该TypeORM支持库的设计模式，使每个实体都有自己的仓库。这些存储库可以从数据库里连接中获取。
首先，我们至少需要一个实体。我们将重用`Photo`官方文档中的实体。

```javascript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Photo {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({length: 500})
	name: string;

	@Column('text')
	description: string;

	@Column()
	filename: string;

	@Column('int')
	views: number;

	@Column()
	isPulished: boolean;
}
```

```javascript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoService } from './photo.service';
import { PhotoController } from '.photo.controller';
import { Photo } from './photo.entity';

@Module({
	imports:[
		TypeOrmModule.forFeature([Photo]),
		providers: [PhotoService],
		controllers: [PhotoController]
	]
})
export class PhotoModule {}
```

此模块使用`forFeature()`方法来定义哪些存储库应在当前范围内注册。
现在，我们可以使用`@InjectRepository()`修饰器向`PhotoService`注入`PhotoRepository`:

```javascript
@Injectable()
export class PhotoService {
	constructor(
		@InjectRepository(Photo) private readonly photoRepository: Reposority<Photo>)) {}
	
	async findAll(): Promise<Photo[]> {
		return await this.photoRepository.find();
	}
}
```

`不要忘记将PhotoModule引入根ApplicationModule。`

## 多个数据库
某些项目可能需要多个数据库连接。幸运的是，这也可以通过本模块实现。要使用多个连接，首先要做的是创建这些连接。在这种情况下，连接命名成为必填项。
假设你有一个`Person`实体和一个`Album`实体，每个实体都存储在他们自己的数据库中。

```javascript
const defaultOptions = {
	type: 'mysql',
	port: 3306,
	username: 'root',
	password： 'root',
	database: 'db',
	synchronize: true
};

@Module({
	imports:[
		TypeOrmModule.forRoot({
			...defaultOptions,
			host: 'photo_db_host',
			entities: [Photo]
		}),
		TypeOrmModule.forRoot({
			...defaultOptions,
			name: 'test'
			host: 'person_db_host',
			entities: [Person]
		})
	]
})
export class ApplicationModule {}
```

`如果未为连接设置任何name,则该连接的名称将设置为default。请注意，不应该有多个没有名字或者同名的连接，否则他们会被覆盖。`

此时，你的Photo、Person、Album实体中的每一个都已在各自的连接中注册。通过此设置，你必须告诉`TypeOrmModule.forFeature()`函数和`@InjectRepository()`装饰器该使用哪种连接。如果不传递任何连接名称，则使用default连接。

```javascript
@Module({
	imports: [
		TypeOrmModule.forFeature([Photo]),
		TypeOrmModule.forFeature([Person], 'personsConnection')
	]
})
export class ApplicationModule {}
```

你也可以为给定的连接注入`Connection`或`EntityManager`:

```javascript
@Injectable()
export class PersonService {
	constructor(@InjectConnection('personsConnection') private readonly connection: Connection),
	@InjectEntityManager('personsConnection') private readonly entityManager: EntityManager,) {}
}
```

## 定制存储库
***
TypeORM提供成为自定义存储库的功能。基本上，自定义存储库允许你扩展基本存储库类，并使用几种特殊方法对其进行丰富。
要创建自定义存储库，请使用@EntityRepository()装饰器和扩展Repository类。

```javascript
@EntityRepository(Author)
export class AuthorRepository extends Reposority<Author> {}
```

`@EntityRepository()和Repository来自typeorm包`

创建类后，下一步是将实例化责任移交给Nest。为此，我们必须将AuthorRepository类传递给TypeOrmModule.forFeature()函数。

```javascript
@Module({
	imports:[
		TypeOrmModule.forFeature([AuthorRepository])
	]
})
export class AuthorModule {}
```

之后，只需使用以下构造注入存储库:

```javascript
@Injectable()
export class AuthorService {
	constructor(private readonly authorRepository: AuthorRepository) {}
}
```

## 异步配置
***
通常，你可能希望异步传递模块选项，而不是实现传递他们，在这种情况下，使用forRootAsync()函数，提供了几种处理异步函数的方法。

```javascript
TypeOrmModule.forRootAsync({
	userFactory: ()=> ({
		type: 'mysql',
		host: 'localhost',
		port: 3306,
		username: 'root',
		password: 'root',
		database: 'db',
		entities: [__dirname + '/**/*.entity{.ts, .js}'],
		synchronize: true
	})
})
```

此时