import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { Request } from 'express';
import { LoginDto } from '../../application/dtos/login.dto';
import { IpRateLimitGuard } from '@leocodeio-njs/njs-auth';
import { RefreshTokenDto } from '../../../validation/application/dtos/refresh-token.dto';
import { ValidateTokenDto } from '../../../validation/application/dtos/validate-token.dto';
import { LogoutDto } from '../../application/dtos/logout.dto';
import { AuthService } from 'src/services/auth.service';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@UseGuards(IpRateLimitGuard)
@ApiSecurity('x-api-key')
@Controller('auth')
export class AuthorizationController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'User login' })
  @Post('login')
  async login(@Req() req: Request, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user, loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh your access token' })
  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @Post('logout')
  async logout(@Body() logoutDto: LogoutDto) {
    await this.authService.logout(logoutDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Logged out successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'User validate' })
  @Post('validate')
  async validateToken(
    @Req() req: Request,
    @Body() validateTokenDto: ValidateTokenDto,
  ) {
    const isValid = await this.authService.validateToken(
      (req.user as { id: string }).id,
      validateTokenDto.channel,
      validateTokenDto.clientId,
    );

    return {
      valid: isValid,
      userId: (req.user as { id: string }).id,
      channel: validateTokenDto.channel,
    };
  }
}
