import type { BaseModel } from './base.model.js';

type Delegate<TEntity, TCreateInput, TUpdateInput> = {
  findUnique(args: { where: { id: string } }): Promise<TEntity | null>;
  findMany(args?: { where?: Partial<TEntity> }): Promise<TEntity[]>;
  create(args: { data: TCreateInput }): Promise<TEntity>;
  update(args: { where: { id: string }; data: TUpdateInput }): Promise<TEntity>;
};

export class GenericRepository<
  TEntity extends BaseModel,
  TCreateInput,
  TUpdateInput
> {
  constructor(private readonly delegate: Delegate<TEntity, TCreateInput, TUpdateInput>) {}

  findById(id: string): Promise<TEntity | null> {
    return this.delegate.findUnique({ where: { id } });
  }

  findAll(activeOnly = true): Promise<TEntity[]> {
    return this.delegate.findMany({
      where: activeOnly ? ({ is_active: true } as Partial<TEntity>) : undefined,
    });
  }

  create(data: TCreateInput): Promise<TEntity> {
    return this.delegate.create({ data });
  }

  update(id: string, data: TUpdateInput): Promise<TEntity> {
    return this.delegate.update({ where: { id }, data });
  }

  softDelete(id: string): Promise<TEntity> {
    return this.delegate.update({
      where: { id },
      data: { is_active: false } as TUpdateInput,
    });
  }
}
