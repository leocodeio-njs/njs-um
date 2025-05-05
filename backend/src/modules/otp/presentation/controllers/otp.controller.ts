import { IpRateLimitGuard } from '@leocodeio-njs/njs-auth';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';
import {
  VerifyMobileConfirmDto,
  VerifyMobileDto,
} from 'src/modules/validation/application/dtos/verify-mobile.dto';
import { AuthService } from 'src/utils/services/auth.service';

@UseGuards(IpRateLimitGuard)
@ApiSecurity('x-api-key')
@Controller('otp')
export class OtpController {
  constructor(private authService: AuthService) {}
  @Post('verify-mobile')
  @ApiOperation({ summary: 'Request mobile OTP' })
  @HttpCode(HttpStatus.OK)
  async requestVerification(@Body() dto: VerifyMobileDto) {
    await this.authService.requestMobileOTP(dto.mobile);
    return {
      statusCode: HttpStatus.OK,
      message: 'Verification code sent',
    };
  }

  @Post('verify-mobile/confirm')
  @ApiOperation({ summary: 'Confirm mobile OTP' })
  @HttpCode(HttpStatus.OK)
  async confirmVerification(@Body() dto: VerifyMobileConfirmDto) {
    const isValid = await this.authService.verifyOTP(dto.mobile, dto.code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Mobile number verified successfully',
    };
  }
}
