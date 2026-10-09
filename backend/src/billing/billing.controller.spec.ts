import { GUARDS_METADATA } from '@nestjs/common/constants';
import { BillingController } from './billing.controller';
import { ROLES_KEY } from '../auth/roles.decorator';
import { StaffRole } from '../auth/roles.enum';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('BillingController authorization', () => {
  it('requires authentication and role checks on the controller', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, BillingController) as unknown[];
    expect(guards).toEqual([AuthGuard, RolesGuard]);
  });

  it('restricts invoice reads to staff roles and writes to finance-capable roles', () => {
    expect(Reflect.getMetadata(ROLES_KEY, BillingController.prototype.findAllInvoices)).toEqual([
      StaffRole.OWNER,
      StaffRole.ADMIN,
      StaffRole.RECEPTIONIST,
      StaffRole.CASHIER,
      StaffRole.ACCOUNTANT,
    ]);
    expect(Reflect.getMetadata(ROLES_KEY, BillingController.prototype.addInvoiceItem)).toEqual([
      StaffRole.OWNER,
      StaffRole.ADMIN,
      StaffRole.CASHIER,
      StaffRole.ACCOUNTANT,
    ]);
    expect(Reflect.getMetadata(ROLES_KEY, BillingController.prototype.finalizeInvoice)).toEqual([
      StaffRole.OWNER,
      StaffRole.ADMIN,
      StaffRole.ACCOUNTANT,
    ]);
  });
});
