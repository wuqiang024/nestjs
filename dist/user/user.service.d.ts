import { Repository } from 'typeorm';
import { User } from './dto/user.dto';
export declare class UserService {
    construct(private readonly userRepository: Repository<User>): void;
}
