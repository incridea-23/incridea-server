import { builder } from '../../builder';
import './mutation';

builder.prismaObject('Criteria', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    type: t.exposeString('type'),
  }),
});
