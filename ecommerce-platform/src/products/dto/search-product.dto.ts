import { IsString } from '@nestjs/class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchProductDto {
  @ApiProperty({
    description: 'Search query for finding products',
    example: 'Laptop',
  })
  @IsString()
  query: string;
}
