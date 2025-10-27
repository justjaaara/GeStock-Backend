import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../entities/Role.entity';
import { UserState } from '../entities/User-state.entity';
import { User } from '../entities/User.entity';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserState)
    private userStateRepository: Repository<UserState>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedUserStates();
    await this.seedAdminUser();
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

  private async seedUserStates() {
    try {
      console.log('Iniciando seeding de estados de usuario...');

      // Verificar si ya existen estados de usuario
      const existingStates = await this.userStateRepository.count();

      if (existingStates > 0) {
        console.log('Los estados de usuario ya existen, saltando seeding');
        return;
      }

      // Crear estados de usuario iniciales
      const defaultStates = [
        {
          stateName: 'Activo',
        },
        {
          stateName: 'Inactivo',
        },
      ];

      for (const stateData of defaultStates) {
        const state = this.userStateRepository.create(stateData);
        await this.userStateRepository.save(state);
        console.log(
          `Estado de usuario creado: ${state.stateName} con ID: ${state.stateId}`,
        );
      }

      console.log('Seeding de estados de usuario completado');
    } catch (error) {
      console.error('Error en seeding de estados de usuario:', error);
    }
  }

  private async seedAdminUser() {
    try {
      console.log('Iniciando seeding de usuario admin...');

      // Verificar si ya existe el usuario admin
      const existingAdmin = await this.userRepository.findOne({
        where: { email: 'admin@admin.com' },
      });

      if (existingAdmin) {
        console.log('El usuario admin ya existe, saltando seeding');
        return;
      }

      // Obtener el rol ADMIN
      const adminRole = await this.roleRepository.findOne({
        where: { role_name: 'ADMIN' },
      });

      if (!adminRole) {
        console.log(
          'Rol ADMIN no encontrado, saltando seeding de usuario admin',
        );
        return;
      }

      // Obtener el estado ACTIVO
      const activeState = await this.userStateRepository.findOne({
        where: { stateName: 'Activo' },
      });

      if (!activeState) {
        console.log(
          'Estado ACTIVO no encontrado, saltando seeding de usuario admin',
        );
        return;
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash('admin123!', 10);

      // Crear usuario admin
      const adminUser = this.userRepository.create({
        name: 'Administrador',
        email: 'admin@admin.com',
        password: hashedPassword,
        role_id: adminRole.role_id,
        state_id: activeState.stateId,
      });

      await this.userRepository.save(adminUser);
      console.log(
        `Usuario admin creado: ${adminUser.email} con ID: ${adminUser.user_id}`,
      );

      console.log('Seeding de usuario admin completado');
    } catch (error) {
      console.error('Error en seeding de usuario admin:', error);
    }
  }
}
