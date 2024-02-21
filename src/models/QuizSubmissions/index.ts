import { builder } from "../../builder";

builder.prismaObject("QuizSubmissions", {
  fields: (t) => ({
    id: t.exposeID("id"),
  }),
});

