import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { User } from './interface/user.interface';

@Controller('users')
export class UsersController {
	@Get()
	findAll():User[] {
		return [
			{id:1, name:'wq', age:30}
		];
	}

	@Get('test/:id')
	test(@Param() params):string {
		return params.id
	}

	@Get('error')
	error():never {
		console.log(HttpStatus);
		throw new HttpException({status:400, msg:'error'}, HttpStatus.FORBIDDEN)
		throw new HttpException('forbidden', HttpStatus.FORBIDDEN);
	}
}
