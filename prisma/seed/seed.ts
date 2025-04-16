import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface ISeed {
  createRoles: () => Promise<void>;
  unitSettings: () => Promise<void>;
}

class Seed implements ISeed {
  async createRoles(): Promise<void> {
    const recordsExists = await prisma.roles.findMany();
    if (recordsExists.length > 0) {
      console.log('Ya existen roles en la base de datos.');
      return;
    }
    const roles = [
      { name: 'ADMIN', description: 'usuario administrador' },
      { name: 'AUTHENTICATED', description: 'usuario acceso basico' },
    ];
    for (const role of roles) {
      await prisma.roles.create({ data: role });
    }
  }
  async unitSettings(): Promise<void> {
    const recordsExists = await prisma.unitSetting.findMany();
    if (recordsExists.length > 0) {
      console.log('Ya existen configuraciones de unidad en la base de datos.');
      return;
    }
    await prisma.unitSetting.create({
      data: {
        active: true,
        unitDurationMinutes: 20, //TODO: 20 minutos
      },
    });
  }

  async initializer(): Promise<void> {
    await Promise.all([this.createRoles(), this.unitSettings()]);
  }
}

const seed = new Seed();
seed.initializer().finally(() => prisma.$disconnect());
