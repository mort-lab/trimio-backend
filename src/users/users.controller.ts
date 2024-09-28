import { Controller, Get, Put, Delete, Body, UseGuards } from '@nestjs/common';
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

@ApiTags('Users') // Añadir el tag para users
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
  @Put('update-profile')
  updateProfile(@GetUser() user, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @Delete('delete-account')
  deleteAccount(@GetUser() user) {
    return this.usersService.deleteAccount(user.id);
  }
}
