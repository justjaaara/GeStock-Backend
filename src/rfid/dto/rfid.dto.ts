import { IsOptional, IsString } from 'class-validator';

export class RfidDto {
  @IsString()
  uid: string;

  @IsOptional()
  @IsString()
  ts?: string;

  @IsOptional()
  @IsString()
  source?: string;
}
