import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('invoices')
  findAllInvoices() {
    return this.billingService.findAllInvoices();
  }

  @Get('invoices/:id')
  findInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.billingService.findInvoice(id);
  }

  @Get('reservations/:reservationId/invoice')
  findInvoiceByReservation(
    @Param('reservationId', ParseUUIDPipe) reservationId: string,
  ) {
    return this.billingService.findInvoiceByReservation(reservationId);
  }

  @Post('invoices')
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.billingService.createInvoice(dto);
  }

  @Post('invoice-items')
  addInvoiceItem(@Body() dto: CreateInvoiceItemDto) {
    return this.billingService.addInvoiceItem(dto);
  }
}
