const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const authguard = async(req,res,next)=>{
    try {
        if(req.session.utilisateur){
            let utilisateur = await prisma.utilisateur.findUnique({
                where:{
                    email: req.session.utilisateur.email
                }
            })
            if(utilisateur){
                return next()
            }
        }
        throw new Error('Error: You have to Log-In first')
    } catch (error) {
        res.redirect("/login")
    }
}  
   

module.exports = authguard