"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
let UsersController = class UsersController {
    construct(userService) {
    }
    findAll() {
        return [
            { id: 1, name: 'wq', age: 30 }
        ];
    }
    findOne() {
        return 'test122';
    }
    test(params) {
        return params.id;
    }
    error() {
        console.log(common_1.HttpStatus);
        throw new common_1.HttpException({ status: 400, msg: 'error' }, common_1.HttpStatus.FORBIDDEN);
        throw new common_1.HttpException('forbidden', common_1.HttpStatus.FORBIDDEN);
    }
};
__decorate([
    common_1.Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], UsersController.prototype, "findAll", null);
__decorate([
    common_1.Get(':id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], UsersController.prototype, "findOne", null);
__decorate([
    common_1.Get('test/:id'),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", String)
], UsersController.prototype, "test", null);
__decorate([
    common_1.Get('error'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "error", null);
UsersController = __decorate([
    common_1.Controller('users')
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=user.controller.js.map