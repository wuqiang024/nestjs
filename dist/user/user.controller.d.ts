import { User } from './interface/user.interface';
import { UserService } from './user.service';
export declare class UsersController {
    construct(private readonly userService: UserService): void;
    findAll(): User[];
    findOne(): string;
    test(params: any): string;
    error(): never;
}
