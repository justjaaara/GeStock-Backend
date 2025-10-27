import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../entities/Role.entity';
import { UserState } from '../entities/User-state.entity';
import { User } from '../entities/User.entity';
import { MeasurementType } from '../entities/Measurement-type.entity';
import { ProductCategory } from '../entities/Product-category.entity';
import { ProductState } from '../entities/Product-state.entity';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserState)
    private userStateRepository: Repository<UserState>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(MeasurementType)
    private measurementTypeRepository: Repository<MeasurementType>,
    @InjectRepository(ProductCategory)
    private productCategoryRepository: Repository<ProductCategory>,
    @InjectRepository(ProductState)
    private productStateRepository: Repository<ProductState>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedUserStates();
    await this.seedMeasurementTypes();
    await this.seedProductCategories();
    await this.seedProductStates();
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

  private async seedMeasurementTypes() {
    try {
      console.log('Iniciando seeding de tipos de medida...');

      // Verificar si ya existen tipos de medida
      const existingTypes = await this.measurementTypeRepository.count();

      if (existingTypes > 0) {
        console.log('Los tipos de medida ya existen, saltando seeding');
        return;
      }

      // Crear tipos de medida iniciales
      const defaultMeasurementTypes = [
        { measurementName: 'Unidad' },
        { measurementName: 'Pieza' },
        { measurementName: 'Caja' },
        { measurementName: 'Pack' },
        { measurementName: 'Set' },
      ];

      for (const typeData of defaultMeasurementTypes) {
        const measurementType = this.measurementTypeRepository.create(typeData);
        await this.measurementTypeRepository.save(measurementType);
        console.log(
          `Tipo de medida creado: ${measurementType.measurementName} con ID: ${measurementType.measurementId}`,
        );
      }

      console.log('Seeding de tipos de medida completado');
    } catch (error) {
      console.error('Error en seeding de tipos de medida:', error);
    }
  }

  private async seedProductCategories() {
    try {
      console.log('Iniciando seeding de categorías de producto...');

      // Verificar si ya existen categorías de producto
      const existingCategories = await this.productCategoryRepository.count();

      if (existingCategories > 0) {
        console.log('Las categorías de producto ya existen, saltando seeding');
        return;
      }

      // Crear categorías de producto iniciales
      const defaultCategories = [
        { categoryName: 'Electrónicos' },
        { categoryName: 'Computadoras' },
        { categoryName: 'Accesorios' },
        { categoryName: 'Móviles' },
        { categoryName: 'Audio' },
      ];

      for (const categoryData of defaultCategories) {
        const category = this.productCategoryRepository.create(categoryData);
        await this.productCategoryRepository.save(category);
        console.log(
          `Categoría de producto creada: ${category.categoryName} con ID: ${category.categoryId}`,
        );
      }

      console.log('Seeding de categorías de producto completado');
    } catch (error) {
      console.error('Error en seeding de categorías de producto:', error);
    }
  }

  private async seedProductStates() {
    try {
      console.log('Iniciando seeding de estados de producto...');

      // Verificar si ya existen estados de producto
      const existingStates = await this.productStateRepository.count();

      if (existingStates > 0) {
        console.log('Los estados de producto ya existen, saltando seeding');
        return;
      }

      // Crear estados de producto iniciales
      const defaultProductStates = [
        { stateName: 'Activo' },
        { stateName: 'Inactivo' },
        { stateName: 'Descontinuado' },
      ];

      for (const stateData of defaultProductStates) {
        const productState = this.productStateRepository.create(stateData);
        await this.productStateRepository.save(productState);
        console.log(
          `Estado de producto creado: ${productState.stateName} con ID: ${productState.stateId}`,
        );
      }

      console.log('Seeding de estados de producto completado');
    } catch (error) {
      console.error('Error en seeding de estados de producto:', error);
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
