import { Request, Response } from "express";
import ollama from "ollama";

export const aiChat = async (req: Request, res: Response) => {

    try {
        const { chat } = req.body;

        if (!chat || typeof chat !== 'string') {
            res.status(400).json({ error: "Invalid Chat Input." });
            return;
        };

        // send the chat to Ollama and get response
        const response = await ollama.chat({
            model: "llama3.2:1b",
            messages: [
                {
                    role: "user",
                    content : chat
                }
            ],
            stream : true
        })

        res.status(200).json({
            chat : chat,
            message : response
        })


    } catch (error) {
        console.log("Error while connecting with Ollama :", error);
        res.status(500).json({
            error: "Internal server error while connecting with Ollama"
        });
    }

}