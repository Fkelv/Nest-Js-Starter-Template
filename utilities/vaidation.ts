import { BadRequestException } from '@nestjs/common';

export function passwordsMatch(
  password: string,
  confirmPassword: string,
): boolean {
  if (password !== confirmPassword) {
    throw new BadRequestException({ password: 'Passwords do NOT match!' });
  }

  return true;
}
