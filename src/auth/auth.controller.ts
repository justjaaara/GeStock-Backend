import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('login')
  logIn() {
    return 'login';
  }

  @Get('signup')
  signUp() {
    return 'signup';
  }
}
