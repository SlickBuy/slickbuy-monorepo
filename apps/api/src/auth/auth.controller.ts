import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type {
  LoginRequest,
  RegisterRequest,
  ApiResponse,
  AuthResponse,
} from '@auction-platform/types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerData: RegisterRequest,
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const result = await this.authService.register(registerData);
      return {
        success: true,
        data: result,
        message: 'User registered successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: [error.message],
      };
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() loginData: LoginRequest,
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const result = await this.authService.login(loginData);
      return {
        success: true,
        data: result,
        message: 'Login successful',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: [error.message],
      };
    }
  }
}
