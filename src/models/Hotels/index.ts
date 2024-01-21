import { builder } from "../../builder";
import "./mutation";
import "./query";

builder.prismaObject("Hotel", {
    fields: (t) => ({
        id: t.exposeID("id"),
        name: t.exposeString("name"),
        details: t.exposeString("details",{
            nullable:true
        }),
        price: t.exposeInt("price"),
        createdAt: t.expose("createdAt",{
            type:"DateTime",
            nullable:true
        }),
        updatedAt: t.expose("updatedAt",{
            type:"DateTime",
            nullable:true
        }),
        ac:t.exposeBoolean("AC"),
        })
        })

        
    
   