import { auth } from "./auth.js";


export async function requireAuth(req , res , next) {
    try {
        const session = await auth.api.getSession({headers:req.headers})

        if(!session?.user?.id){
            return res.status(401).json({message:"Unauthorized"})
        }

        req.user = session?.user;
        req.session = session?.session;

        return next()
    } catch (error) {
        return res.status(401).json({message:"Unauthorized"})
    }
}