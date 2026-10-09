import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { BillingService } from './billing.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { StaffRole } from '../auth/roles.enum';
import { AuthenticatedUser } from '../auth/auth.service';
import { IsNumber, Min } from 'class-validator';

class UpdateInvoiceDiscountDto {
  @IsNumber()
  @Min(0)
  discountAmount!: number;
}

@Controller('billing')
@UseGuards(AuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('invoices')
  @Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.RECEPTIONIST, StaffRole.CASHIER, StaffRole.ACCOUNTANT)
  findAllInvoices() {
    return this.billingService.findAllInvoices();
  }

  @Get('invoices/:id')
  @Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.RECEPTIONIST, StaffRole.CASHIER, StaffRole.ACCOUNTANT)
  findInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.billingService.findInvoice(id);
  }

  @Get('reservations/:reservationId/invoice')
  @Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.RECEPTIONIST, StaffRole.CASHIER, StaffRole.ACCOUNTANT)
  findInvoiceByReservation(
    @Param('reservationId', ParseUUIDPipe) reservationId: string,
  ) {
    return this.billingService.findInvoiceByReservation(reservationId);
  }

  @Post('invoices')
  @Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.CASHIER, StaffRole.ACCOUNTANT)
  createInvoice(
    @Body() dto: CreateInvoiceDto,
    @Req() request: { user?: AuthenticatedUser },
  ) {
    return this.billingService.createInvoice(dto, request.user!.id);
  }

  @Post('invoice-items')
  @Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.CASHIER, StaffRole.ACCOUNTANT)
  addInvoiceItem(
    @Body() dto: CreateInvoiceItemDto,
    @Req() request: { user?: AuthenticatedUser },
  ) {
    return this.billingService.addInvoiceItem(dto, request.user!.id);
  }

  @Post('invoices/:id/finalize')
  @Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.ACCOUNTANT)
  finalizeInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: { user?: AuthenticatedUser },
  ) {
    return this.billingService.finalizeInvoice(id, request.user!.id);
  }

  @Post('invoices/:id/discount')
  @Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.ACCOUNTANT)
  updateDiscount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDiscountDto,
    @Req() request: { user?: AuthenticatedUser },
  ) {
    return this.billingService.updateDiscount(id, dto.discountAmount, request.user!.id);
  }

  @Post('invoices/:id/apply-payment/:paymentId')
  @Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.CASHIER, StaffRole.ACCOUNTANT)
  applyPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Req() request: { user?: AuthenticatedUser },
  ) {
    return this.billingService.applyPayment(id, paymentId, request.user!.id);
  }
}
