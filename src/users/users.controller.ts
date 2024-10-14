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
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
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
    schema: {
      example: {
        id: '12345-uuid',
        email: 'user@example.com',
        username: 'user123',
        phone: '+521234567890',
        role: 'CLIENT',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-10T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  @Get('profile')
  getProfile(@GetUser() user) {
    return this.usersService.getProfile(user.id);
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      example: {
        message: 'Profile updated successfully',
        user: {
          id: '12345-uuid',
          email: 'newemail@example.com',
          username: 'newuser123',
          phone: '+521234567890',
          role: 'CLIENT',
          createdAt: '2024-01-01T10:00:00.000Z',
          updatedAt: '2024-02-01T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or incorrect current password',
    schema: {
      example: {
        statusCode: 400,
        message: 'Current password is required to change password',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Only admins can change the email',
    schema: {
      example: {
        statusCode: 403,
        message: 'Only admins can change the email',
        error: 'Forbidden',
      },
    },
  })
  @ApiBody({
    description: 'The fields to update in the user profile',
    type: UpdateUserDto,
    examples: {
      example1: {
        summary: 'Update email and username',
        value: {
          email: 'newemail@example.com',
          username: 'newusername123',
          phone: '+521234567890',
        },
      },
      example2: {
        summary: 'Update password',
        value: {
          currentPassword: 'OldPassword123!',
          password: 'NewPassword1!',
        },
      },
    },
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
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
    schema: {
      example: {
        message: 'Account deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Current password required to delete account',
    schema: {
      example: {
        statusCode: 400,
        message: 'Current password is required to delete account',
        error: 'Bad Request',
      },
    },
  })
  @ApiBody({
    description: 'Current password required to delete the user account',
    schema: {
      example: {
        currentPassword: 'CurrentPassword123!',
      },
    },
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
