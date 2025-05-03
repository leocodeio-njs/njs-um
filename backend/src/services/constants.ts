export const USER_REPOSITORY = 'USER_REPOSITORY';
export const USER_PREFERENCES_REPOSITORY = 'USER_PREFERENCES_REPOSITORY';

import { TwilioSmsService } from './twilio.service';
import { Fast2SmsService } from './fast2sms.service';

export const AvailableSmsServices = {
  twilio: TwilioSmsService,
  fast2sms: Fast2SmsService,
};
