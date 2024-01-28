import { resolve } from "path";
import { builder } from "../../builder";
import { query } from "express";
import { LAAnswerStatus, MCQSubmission, QuestionType } from "@prisma/client";

const sub = builder.objectRef<{
    userId: string
    qtype: string
    question: string
    qid: string
    mcqans: string | null
    isright: boolean | null
    fitbans: string | null
    laAns: string | null
    laIsRight: string | null
}>('sub').implement({
    fields: t => ({
        userId: t.exposeID("userId"),
        qtype: t.expose("qtype", {
            type: "String",
            nullable: false
        }),
        question: t.expose("question", {
            type: "String",
            nullable: false
        }),
        qid: t.exposeID("qid"),
        mcqans: t.expose("mcqans", {
            type: "String",
            nullable: true
        }),
        isright: t.exposeBoolean("isright",{
            nullable:true
        }),
        fitbans: t.expose("fitbans", {
            type: "String",
            nullable: true
        }),
        laAns: t.expose("laAns", {
            type: "String",
            nullable: true
        }),
        laIsRight: t.expose("laIsRight", {
            type: "String",
            nullable: true
        }),

    })
})


builder.queryField("getAllQuizSubmissions", (t) =>
    t.field({
        type: [sub],
        args: {
            id: t.arg({
                type: "String",
                required: true
            })
        },
        resolve: async (root, args, ctx, info) => {
            try {
                let quizSubmissions: {
                    userId: string
                    qtype: string
                    question: string
                    qid: string
                    mcqans: string | null
                    isright: boolean | null
                    fitbans: string | null
                    laAns: string | null
                    laIsRight: string | null

                }[] = [];
                const mcqsubmissions = await ctx.prisma.mCQSubmission.findMany({
                    where: {
                        Options: {
                            Question: {
                                quizId: args.id
                            }
                        }
                    },
                    include: {
                        Options: {
                            select: {
                                value: true,
                                questionId: true,
                                isAnswer: true,
                                Question: {
                                    select: {
                                        points: true,
                                        negativePoints: true,
                                        questionType: true,
                                        question: true
                                    }
                                }
                            }
                        }
                    }

                })

                
                let mcq = mcqsubmissions.map((item) => {
                    return {
                        userId: item?.teamId?.toString(),
                        qtype: item?.Options?.Question?.questionType.toString(),
                        question: item?.Options?.Question?.question,
                        qid: item?.Options?.questionId,
                        mcqans: item?.Options?.value,
                        isright: item?.Options?.isAnswer,
                        fitbans: null,
                        laAns: null,
                        laIsRight: null
                        
                    }
                })
                
                quizSubmissions.push(...mcq);

                const fitbsubmissions = await ctx.prisma.fITBSubmission.findMany({
                    where: {
                        Options: {
                            Question: {
                                quizId: args.id
                            }
                        }
                    },
                    include: {
                        Options: {
                            select: {
                                isAnswer: true,
                                questionId: true,
                                Question: {
                                    select: {
                                        question: true,
                                        questionType: true,
                                        negativePoints: true,
                                        points: true

                                    }
                                }

                            }
                        }
                    }
                })

                let fitb = fitbsubmissions.map((item) => {
                    return {
                        userId: item?.teamId?.toString(),
                        qtype: item?.Options?.Question?.questionType,
                        question: item?.Options?.Question?.question,
                        qid: item?.Options?.questionId,
                        mcqans: null,
                        isright: item?.isAnswer,
                        fitbans: item?.value,
                        laAns: null,
                        laIsRight: null

                    }
                })

                quizSubmissions.push(...fitb);

                const lasubmissions = await ctx.prisma.lASubmission.findMany({
                    where: {
                        Question: {
                            quizId: args.id
                        }
                    },
                    include: {

                        Question: {

                            select: {
                                negativePoints: true,
                                questionType: true,
                                question: true,

                            }
                        }
                    }
                })

                let la = lasubmissions.map((item) => {
                    return {
                        userId: item?.teamId?.toString(),
                        qtype: item?.Question?.questionType,
                        question: item?.Question?.question,
                        qid: item?.questionId,
                        mcqans: null,
                        isright: null,
                        fitbans: null,
                        laAns: item?.value,
                        laIsRight: item?.isRight?.toString()

                    }
                })

                quizSubmissions.push(...la);

                return quizSubmissions
            } catch (error) {
                throw new Error("Something went wrong");
            }
        }
    })
)


builder.queryField("getQuizByEvent", (t) =>
    t.prismaField({
        type: ["Quiz"],
        args: {
            eventId: t.arg({
                type: "Int",
                required: true
            })
        },
        errors: {
            types: [Error],
        },
        resolve: async (query, root, args, ctx, info) => {
            try {
                const user = await ctx.user;
                if (!user) {
                    throw new Error("Not authenticated");
                }
                if (user.role !== "ORGANIZER") {
                    throw new Error("Not authorized");
                }
                const event = await ctx.prisma.event.findUnique({
                    where: {
                        id: Number(args.eventId),
                    },
                    include: {
                        Organizers: true,
                    },
                });
                if (!event) {
                    throw new Error("Event not found");
                }
                if (!event.Organizers.find((o) => o.userId === user.id)) {
                    throw new Error("Not authorized");
                }

                const data = await ctx.prisma.quiz.findMany({
                    where: {
                        eventId: Number(args.eventId)
                    },
                    include: {
                        Round: true
                    },
                    ...query
                });
                console.log(data)
                if (!data) {
                    throw new Error("There is no quiz in this event");
                }
                return data

            } catch (error) {
                throw new Error("Something went wrong");
            }
        }

    })
)