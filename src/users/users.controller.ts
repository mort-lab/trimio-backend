// src/users/users.controller.ts
import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile fetched successfully',
  })
  @Get('profile')
  getProfile(@GetUser() user) {
    return this.usersService.getProfile(user.id);
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or incorrect current password',
  })
  @Put('update-profile')
  async updateProfile(@GetUser() user, @Body() updateUserDto: UpdateUserDto) {
    // Si el usuario intenta cambiar su contraseña, se requiere la actual
    if (updateUserDto.password && !updateUserDto.currentPassword) {
      throw new BadRequestException(
        'Current password is required to change password',
      );
    }

    // Lógica para que solo ciertos roles (ej. ADMIN) puedan actualizar ciertos campos
    if (updateUserDto.email && user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can change the email');
    }

    return this.usersService.updateProfile(user.id, user.role, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Current password required to delete account',
  })
  @Delete('delete-account')
  async deleteAccount(
    @GetUser() user,
    @Body() body: { currentPassword: string },
  ) {
    if (!body.currentPassword) {
      throw new BadRequestException(
        'Current password is required to delete account',
      );
    }

    return this.usersService.deleteAccount(user.id, body.currentPassword);
  }
}
