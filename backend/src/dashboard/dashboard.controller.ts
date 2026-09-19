import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { StaffRole } from '../auth/roles.enum';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard, RolesGuard)
@Roles(
  StaffRole.OWNER,
  StaffRole.ADMIN,
  StaffRole.RECEPTIONIST,
  StaffRole.CASHIER,
  StaffRole.ACCOUNTANT,
  StaffRole.STAFF,
)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary() {
    return this.dashboardService.getSummary();
  }
}
