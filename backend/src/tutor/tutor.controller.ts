import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TutorService } from './tutor.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tutor')
@UseGuards(JwtAuthGuard)
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post('chat')
  async sendMessage(
    @Body() chatMessageDto: ChatMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.tutorService.sendMessage(user.id, chatMessageDto);
  }

  @Get('history')
  async getHistory(@CurrentUser() user: any) {
    return this.tutorService.getHistory(user.id);
  }

  @Get('conversations/:id')
  async getConversation(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.tutorService.getConversation(id, user.id);
  }

  @Delete('conversations/:id')
  async deleteConversation(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.tutorService.deleteConversation(id, user.id);
  }
}

