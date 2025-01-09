import { Injectable } from '@nestjs/common';

import { UserSchemaClass } from '../entities/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model } from 'mongoose';
import type { UserRepository } from '../../user.repository';
import type { User } from 'src/users/domain/user';
import { userToDomain, userToPersistence } from '../mappers/user.mapper';
import type { FilterUserDto, SortUserDto } from 'src/users/dto/query-user.dto';
import type { IPaginationOptions } from 'src/utils/types/pagination-options';
import type { NullableType } from 'src/utils/types/nullable.type';

@Injectable()
export class UsersDocumentRepository implements UserRepository {
  constructor(
    @InjectModel(UserSchemaClass.name)
    private readonly usersModel: Model<UserSchemaClass>,
  ) {}

  async create(data: User): Promise<User> {
    const persistenceModel = userToPersistence(data);
    const createdUser = new this.usersModel(persistenceModel);
    const userObject = await createdUser.save();
    return userToDomain(userObject);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    const where: FilterQuery<UserSchemaClass> = {};
    if (filterOptions?.roles?.length) {
      where['role._id'] = {
        $in: filterOptions.roles.map((role) => role.id.toString()),
      };
    }

    const userObjects = await this.usersModel
      .find(where)
      .sort(
        sortOptions?.reduce(
          (accumulator, sort) => ({
            // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
            ...accumulator,
            [sort.orderBy === 'id' ? '_id' : sort.orderBy]:
              sort.order.toUpperCase() === 'ASC' ? 1 : -1,
          }),
          {},
        ),
      )
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .limit(paginationOptions.limit);

    return userObjects.map((userObject) => userToDomain(userObject));
  }

  async findById(id: User['id']): Promise<NullableType<User>> {
    const userObject = await this.usersModel.findById(id);
    return userObject ? userToDomain(userObject) : null;
  }

  async findByIds(ids: User['id'][]): Promise<User[]> {
    const userObjects = await this.usersModel.find({ _id: { $in: ids } });
    return userObjects.map((userObject) => userToDomain(userObject));
  }

  async findByEmail(email: User['email']): Promise<NullableType<User>> {
    if (!email) return null;

    const userObject = await this.usersModel.findOne({ email });
    return userObject ? userToDomain(userObject) : null;
  }

  async update(id: User['id'], payload: Partial<User>): Promise<User | null> {
    const clonedPayload = { ...payload };
    // biome-ignore lint/performance/noDelete: <explanation>
    delete clonedPayload.id;

    const filter = { _id: id.toString() };
    const user = await this.usersModel.findOne(filter);

    if (!user) {
      return null;
    }

    const userObject = await this.usersModel.findOneAndUpdate(
      filter,
      userToPersistence({
        ...userToDomain(user),
        ...clonedPayload,
      }),
      { new: true },
    );

    return userObject ? userToDomain(userObject) : null;
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersModel.deleteOne({
      _id: id.toString(),
    });
  }
}
