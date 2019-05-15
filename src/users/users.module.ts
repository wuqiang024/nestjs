import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { User } from './interface/user.interface';

@Module({
	controllers: [ UsersController ],
	// providers: [ User ]
})
export class UsersModule {}
