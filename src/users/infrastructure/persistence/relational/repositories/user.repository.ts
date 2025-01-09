import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, type FindOptionsWhere, type Repository } from 'typeorm';

import type { UserRepository } from '../../user.repository';
import { UserEntity } from '../entities/user.entity';
import type { User } from 'src/users/domain/user';
import type { FilterUserDto, SortUserDto } from 'src/users/dto/query-user.dto';
import type { IPaginationOptions } from 'src/utils/types/pagination-options';
import type { NullableType } from 'src/utils/types/nullable.type';
import { userToDomain, userToPersistence } from '../mappers/user.mapper';

@Injectable() // Marks the class as a provider/service for dependency injection in NestJS
export class UsersRelationalRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity) // Injecting the repository for the User entity
    private readonly usersRepository: Repository<UserEntity>, // Repository for accessing UserEntity in the database
  ) {}

  // Method to create a new User and save it to the database
  async create(data: User): Promise<User> {
    const persistenceModel = userToPersistence(data); // Convert domain model to persistence model
    const newEntity = await this.usersRepository.save(
      this.usersRepository.create(persistenceModel), // Save the new entity to the database
    );
    return userToDomain(newEntity); // Convert the saved entity back to domain model and return it
  }

  // Method to fetch multiple users with pagination, filtering, and sorting
  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null; // Optional filter for querying users (e.g., by role)
    sortOptions?: SortUserDto[] | null; // Optional sort options
    paginationOptions: IPaginationOptions; // Pagination options (page number and limit)
  }): Promise<User[]> {
    const where: FindOptionsWhere<UserEntity> = {}; // Initial empty filter object

    // Apply filter if roles are provided in the filter options
    if (filterOptions?.roles?.length) {
      where.role = filterOptions.roles.map((role) => ({ id: Number(role.id) })); // Map roles to their IDs for filtering
    }

    // Fetch users from the database with pagination, sorting, and filtering
    const entities = await this.usersRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit, // Skip based on page number
      take: paginationOptions.limit, // Limit number of results based on pagination options
      where: where, // Apply filters to the query
      order: sortOptions?.reduce(
        // Apply sorting based on the provided sort options
        (accumulator, sort) => ({
          // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
          ...accumulator,
          [sort.orderBy]: sort.order, // Dynamically apply sorting criteria
        }),
        {},
      ),
    });

    return entities.map((user) => userToDomain(user)); // Convert the fetched entities to domain models
  }

  // Method to find a user by their ID
  async findById(id: User['id']): Promise<NullableType<User>> {
    const entity = await this.usersRepository.findOne({
      where: { id: Number(id) }, // Find user with matching ID
    });

    return entity ? userToDomain(entity) : null; // Return the domain model if found, or null if not
  }

  // Method to find multiple users by their IDs
  async findByIds(ids: User['id'][]): Promise<User[]> {
    const entities = await this.usersRepository.find({
      where: { id: In(ids) }, // Find users where ID is in the provided list of IDs
    });

    return entities.map((user) => userToDomain(user)); // Convert the fetched entities to domain models
  }

  // Method to find a user by their email
  async findByEmail(email: User['email']): Promise<NullableType<User>> {
    if (!email) return null; // If email is not provided, return null immediately

    const entity = await this.usersRepository.findOne({
      where: { email }, // Find user with the provided email
    });

    return entity ? userToDomain(entity) : null; // Return the domain model if found, or null if not
  }

  // Method to update an existing user's data
  async update(id: User['id'], payload: Partial<User>): Promise<User> {
    const entity = await this.usersRepository.findOne({
      where: { id: Number(id) }, // Find the user by ID
    });

    if (!entity) {
      throw new Error('User not found'); // If the user is not found, throw an error
    }

    const updatedEntity = await this.usersRepository.save(
      this.usersRepository.create(
        userToPersistence({
          ...userToDomain(entity), // Convert the existing entity to domain model
          ...payload, // Merge the existing data with the updated payload
        }),
      ),
    );

    return userToDomain(updatedEntity); // Convert the updated entity back to the domain model and return it
  }

  // Method to soft delete a user by their ID
  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.softDelete(id); // Soft delete the user from the database (does not remove the record but marks it as deleted)
  }
}
