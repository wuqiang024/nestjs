import { Repository } from 'typeorm';
import { User } from './dto/user.dto';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
}
