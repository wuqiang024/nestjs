import { Controller, Get, Param, HttpException, HttpStatus, Render } from '@nestjs/common';
import { getManager } from 'typeorm';
import { User } from './dto/user.dto';
import { UserService } from './user.service';


@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService){

	}

	@Get()
	findAll():any {
		return getManager().findOne(User, 1);
	}

	@Get(':id')
	@Render('users/test')
	findOne():any {
		return {message: 'test'};
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
