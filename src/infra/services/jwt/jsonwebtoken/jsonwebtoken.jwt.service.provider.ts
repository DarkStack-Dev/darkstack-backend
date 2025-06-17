import { JwtService } from '../jwt.service';
import { JasonWebTokenService } from './jsonwebtoken.jwt.service';

export const jsonWebTokenJwtServiceProvider = {
  provide: JwtService,
  useClass: JasonWebTokenService,
};