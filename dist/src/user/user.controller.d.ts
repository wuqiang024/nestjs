import { User } from './interface/user.interface';
import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    findAll(): User[];
    findOne(): any;
    test(params: any): string;
    error(): never;
}
