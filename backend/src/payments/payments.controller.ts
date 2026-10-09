import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { StaffRole } from '../auth/roles.enum';
import { AuthenticatedUser } from '../auth/auth.service';

@Controller('payments')
@UseGuards(AuthGuard, RolesGuard)
@Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.RECEPTIONIST, StaffRole.CASHIER, StaffRole.ACCOUNTANT, StaffRole.STAFF)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('reservation/:reservationId')
  findByReservation(
    @Param('reservationId', ParseUUIDPipe) reservationId: string,
  ) {
    return this.paymentsService.findByReservation(reservationId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreatePaymentDto,
    @Req() request: { user?: AuthenticatedUser },
  ) {
    return this.paymentsService.create(dto, request.user!.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentDto,
    @Req() request: { user?: AuthenticatedUser },
  ) {
    return this.paymentsService.update(id, dto, request.user!.id);
  }
}
