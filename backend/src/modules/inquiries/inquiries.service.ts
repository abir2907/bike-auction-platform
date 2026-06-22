import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';

export async function create(
  input: { vehicleId: string; name: string; email: string; phone: string; message: string },
  userId?: string,
) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } });
  if (!vehicle || vehicle.status !== 'ACTIVE') throw ApiError.notFound('Vehicle not found');

  return prisma.inquiry.create({
    data: {
      vehicleId: input.vehicleId,
      userId: userId ?? null,
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      message: input.message,
    },
  });
}
