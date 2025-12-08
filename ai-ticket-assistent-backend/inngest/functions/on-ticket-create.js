import {inngest} from "../client";  
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import {nonRetrivaleError} from "inngest";
import {sendMail} from "../../utils/mailer";
import analyseTicket from "../../utils/ai";

export const onTicketCreated= inngest.createFunction(
    {id: "on-ticket-created", retries: 2},
    {event: "ticket/created"},
    async({event, step})=>{
        try {
            const {ticketId} =event.data;

            //fetch ticket details from DB
            const ticket = await step.run("Fetch-Ticket", async()=>{
                const ticketObject= await Ticket.findById(ticketId);
                if(!ticketObject){
                    throw new nonRetrivaleError("Ticket not found");
                }
                return ticketObject;
            });

            await step.run("update-ticket-status", async()=>{
                await Ticket.findByIdAndUpdate(ticket._id, {status: "TODO"});
            });

            const aiResponse = await analyseTicket(ticket);

            const relatedSkills = await step.run("ai-processing",async()=>{
                let skills=[];
                if(aiResponse){
                    await Ticket.findByIdAndUpdate(ticket._id ,{
                        priority: !["low", "medium", "high"].
                        includs(aiResponse.priority) ? "medium" : aiResponse.priority,
                        helpfulNtes: aiResponse.helpfulNotes,
                        status: "IN_PROGRESS",
                        relatedSkills: aiResponse.relatedSkills,

                    })
                    skills=aiResponse.relatedSkills;
                }
                return skills;
            })

            const moderator = await step.run("find-moderator", async()=>{
                let user = await User.findOne({
                    role: "moderator",
                    skills: {
                        $elemMatch:{
                            $regex: relatedSkills.join("|"),
                            $options: "i"
                        },
                    },
                });
                if(!user){
                    user = await User.findOne({role: "admin"});
                }
                await Ticket.findByIdAndUpdate(ticket._id, {assignedTo: user._id});
                return user;
            })

            return {success: true}

            
        } catch (err) {
            console.error("Error running the step", err.message)
            return {success: false}
        }
    }
)