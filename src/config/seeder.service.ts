import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/Role.entity';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
  }

  private async seedRoles() {
    try {
      console.log('Iniciando seeding de roles...');

      // Verificar si ya existen roles
      const existingRoles = await this.roleRepository.count();

      if (existingRoles > 0) {
        console.log('Los roles ya existen, saltando seeding');
        return;
      }

      // Crear roles iniciales (solo con los campos que existen)
      const defaultRoles = [
        {
          role_name: 'ADMIN',
        },
        {
          role_name: 'JEFE DE ALMACEN',
        },
        {
          role_name: 'OPERARIO',
        },
      ];

      for (const roleData of defaultRoles) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
        console.log(`Rol creado: ${role.role_name} con ID: ${role.role_id}`);
      }

      console.log('Seeding de roles completado');
    } catch (error) {
      console.error('Error en seeding de roles:', error);
    }
  }
}
