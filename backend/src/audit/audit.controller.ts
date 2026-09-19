import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { StaffRole } from '../auth/roles.enum';
import { RolesGuard } from '../auth/roles.guard';
import { AuditService } from './audit.service';

@Controller('audit-logs')
@UseGuards(AuthGuard, RolesGuard)
@Roles(StaffRole.OWNER, StaffRole.ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findRecent() {
    return this.auditService.findRecent();
  }
}
