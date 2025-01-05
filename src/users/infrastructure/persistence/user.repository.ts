import { DeepPartial } from 'src/utils/types/deep-partial.type';

import { NullableType } from 'src/utils/types/nullable.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { User } from 'src/users/domain/user';
import { FilterUserDto, SortUserDto } from 'src/users/dto/query-user.dto';

/**
 * Abstract class defining the contract for a User repository.
 * Provides an interface for performing CRUD operations and querying user data.
 * Concrete implementations (e.g., database-specific repositories) must extend and implement these methods.
 */
export abstract class UserRepository {
  /**
   * Creates a new user.
   *
   * @param data - The data for the new user, excluding auto-generated fields such as `id`, `createdAt`, `deletedAt`, and `updatedAt`.
   * @returns A Promise resolving to the newly created `User` object.
   */
  abstract create(
    data: Omit<User, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<User>;

  /**
   * Retrieves multiple users with pagination support.
   *
   * @param filterOptions - Optional filtering criteria (e.g., search by fields).
   * @param sortOptions - Optional sorting criteria (e.g., sort by specific fields).
   * @param paginationOptions - Required pagination options, such as page number and limit.
   * @returns A Promise resolving to an array of `User` objects.
   */
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]>;

  /**
   * Finds a user by their unique identifier.
   *
   * @param id - The unique identifier of the user.
   * @returns A Promise resolving to the user object if found, otherwise `null`.
   */
  abstract findById(id: User['id']): Promise<NullableType<User>>;

  /**
   * Finds multiple users by their unique identifiers.
   *
   * @param ids - An array of user IDs.
   * @returns A Promise resolving to an array of `User` objects.
   */
  abstract findByIds(ids: User['id'][]): Promise<User[]>;

  /**
   * Finds a user by their email address.
   *
   * @param email - The email address of the user.
   * @returns A Promise resolving to the user object if found, otherwise `null`.
   */
  abstract findByEmail(email: User['email']): Promise<NullableType<User>>;

  // /**
  //  * Finds a user by their social ID and provider.
  //  *
  //  * @param socialId - The user's social ID from the authentication provider.
  //  * @param provider - The name of the social authentication provider.
  //  * @returns A Promise resolving to the user object if found, otherwise `null`.
  //  */
  // abstract findBySocialIdAndProvider({
  //   socialId,
  //   provider,
  // }: {
  //   socialId: User['socialId'];
  //   provider: User['provider'];
  // }): Promise<NullableType<User>>;

  /**
   * Updates a user's data.
   *
   * @param id - The unique identifier of the user to be updated.
   * @param payload - Partial data for updating the user (supports deep partial updates).
   * @returns A Promise resolving to the updated user object or `null` if the user was not found.
   */
  abstract update(
    id: User['id'],
    payload: DeepPartial<User>,
  ): Promise<User | null>;

  /**
   * Removes a user by their unique identifier.
   *
   * @param id - The unique identifier of the user to be removed.
   * @returns A Promise resolving to `void` when the operation completes.
   */
  abstract remove(id: User['id']): Promise<void>;
}
